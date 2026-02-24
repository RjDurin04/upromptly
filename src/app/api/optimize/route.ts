import { type NextRequest } from "next/server";
import { OptimizeRequestSchema } from "@/lib/schemas";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { OPENROUTER_MODEL } from "@/lib/constants";
import { OpenRouter } from "@openrouter/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";
import { summarizeError } from "@/lib/errors";

// ── Rate Limiter (eagerly evaluated at module scope) ──
const RATE_LIMIT_WINDOW_SECONDS = "10 s";
const RATE_LIMIT_MAX_REQUESTS = 5;
const RECAPTCHA_TIMEOUT_MS = 5_000;

const ratelimit: Ratelimit | null = (() => {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!redisUrl || !redisToken) return null;
    return new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS),
        analytics: true,
    });
})();

/**
 * Typed representation of a chunk from the OpenRouter streaming API.
 * Replaces @ts-ignore directives with explicit type safety.
 */
interface OpenRouterStreamChunk {
    choices: Array<{ delta?: { content?: string } }>;
    usage?: { reasoningTokens?: number;[key: string]: unknown };
}

export async function POST(request: NextRequest): Promise<Response> {
    const apiKey = process.env.UPROMPTLY_OPENROUTER_KEY;
    if (!apiKey) {
        logger.error({ action: "init_openrouter" }, "Server configuration error: API key is missing.");
        return Response.json(
            { error: { code: "INVALID_STATE", message: "Internal server error." } },
            { status: 500 }
        );
    }
    // ── 0. Rate Limiting ──
    if (ratelimit) {
        // Extract IP address from headers (standard practice for Next.js API routes)
        // Fallback to a generic 'global' identifier if no IP is found to prevent bypasses
        const ip = request.headers.get("x-forwarded-for") ?? "global-anonymous";

        try {
            const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);

            if (!success) {
                logger.warn({ action: "rate_limit", ip: ip === "global-anonymous" ? undefined : ip, limit, remaining }, "Rate limit exceeded");
                return Response.json(
                    { error: { code: "TRANSIENT", message: "Too many requests. Please wait a moment before trying again." } },
                    {
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                        },
                    }
                );
            }
        } catch (error) {
            logger.warn({ action: "rate_limit", err: summarizeError(error) }, "Rate limiting failed. Executing fail-open path.");
            // Fail open: if Upstash is down, we don't want to completely break the app.
        }
    } else {
        logger.warn({ action: "init_ratelimit" }, "Upstash credentials missing. Rate limiting is disabled.");
    }

    // ── 1. Validate incoming request ──
    let requestBody: unknown;
    try {
        requestBody = await request.json();
    } catch {
        logger.warn({ action: "parse_request" }, "Invalid JSON in request body.");
        return Response.json(
            { error: { code: "INVALID_INPUT", message: "Invalid JSON in request body." } },
            { status: 400 }
        );
    }

    const validationResult = OptimizeRequestSchema.safeParse(requestBody);
    if (!validationResult.success) {
        const firstIssue = validationResult.error.issues[0];
        logger.warn({ action: "validate_request", issues: validationResult.error.issues }, "Request validation failed.");
        return Response.json(
            { error: { code: "INVALID_INPUT", message: firstIssue?.message ?? "Invalid request format." } },
            { status: 400 }
        );
    }

    const { userPrompt, recaptchaToken } = validationResult.data;

    // ── 2. Validate reCAPTCHA Token ──
    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecretKey) {
        logger.error({ action: "init_recaptcha" }, "Server configuration error: reCAPTCHA secret key is missing.");
        return Response.json(
            { error: { code: "INVALID_STATE", message: "Internal server error." } },
            { status: 500 }
        );
    }

    try {
        const verifyParams = new URLSearchParams({
            secret: recaptchaSecretKey,
            response: recaptchaToken,
        });

        const recaptchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: verifyParams.toString(),
            signal: AbortSignal.timeout(RECAPTCHA_TIMEOUT_MS),
        });

        const recaptchaData = await recaptchaRes.json();

        if (!recaptchaData.success) {
            logger.warn({ action: "verify_recaptcha", errorCodes: recaptchaData["error-codes"] }, "reCAPTCHA validation failed.");
            return Response.json(
                { error: { code: "SECURITY_BREACH", message: "Security check failed. Please refresh the page and try again." } },
                { status: 403 }
            );
        }

        // reCAPTCHA v3 returns a score (0.0 to 1.0).
        // 1.0 is very likely a good interaction, 0.0 is very likely a bot.
        if (recaptchaData.score !== undefined && recaptchaData.score < 0.5) {
            logger.warn({ action: "verify_recaptcha", score: recaptchaData.score }, "reCAPTCHA score too low.");
            return Response.json(
                { error: { code: "SECURITY_BREACH", message: "Security check failed: Suspicious activity detected." } },
                { status: 403 }
            );
        }
    } catch (error) {
        logger.error({ action: "verify_recaptcha", err: summarizeError(error) }, "reCAPTCHA verification threw an error.");
        return Response.json(
            { error: { code: "DEPENDENCY_DOWN", message: "An error occurred during security verification." } },
            { status: 500 }
        );
    }

    // ── 3. Initialize OpenRouter Client ──
    const openrouter = new OpenRouter({ apiKey });

    // ── 4. Call OpenRouter API with Streaming ──
    try {
        const stream = await openrouter.chat.send({
            chatGenerationParams: {
                model: OPENROUTER_MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userPrompt },
                ],
                stream: true,
            }
        });

        // ── 5. Create ReadableStream to forward to the client ──
        const readable = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of stream as AsyncIterable<OpenRouterStreamChunk>) {
                        const content = chunk.choices[0]?.delta?.content;

                        if (content) {
                            const dataStr = JSON.stringify({ type: "content", value: content });
                            controller.enqueue(encoder.encode(`data: ${dataStr}\n\n`));
                        }

                        // Usage information comes in the final chunk (reasoning tokens)
                        if (chunk.usage?.reasoningTokens) {
                            const metaStr = JSON.stringify({ type: "meta", reasoningTokens: chunk.usage.reasoningTokens });
                            controller.enqueue(encoder.encode(`data: ${metaStr}\n\n`));
                        }
                    }
                    controller.close();
                } catch (streamingError) {
                    logger.error({ action: "stream_response", err: summarizeError(streamingError) }, "Streaming error occurred.");
                    controller.error(streamingError);
                }
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (fetchError) {
        logger.error({ action: "fetch_openrouter", err: summarizeError(fetchError) }, "Failed to reach AI service.");
        return Response.json(
            { error: { code: "DEPENDENCY_DOWN", message: "Failed to reach AI service." } },
            { status: 502 }
        );
    }
}
