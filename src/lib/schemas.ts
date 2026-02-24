import { z } from "zod";

// ─── Client → API Route ────────────────────────────────────────
export const OptimizeRequestSchema = z.object({
  userPrompt: z
    .string()
    .min(1, "Prompt cannot be empty")
    .max(10_000, "Prompt exceeds maximum length"),
  recaptchaToken: z.string().min(1, "reCAPTCHA token is required"),
});

// Since we are streaming from OpenRouter, the response is plain text.
// We only need the history entry schema now.

// ─── localStorage: History Entry ────────────────────────────────
export const PromptHistoryEntrySchema = z.object({
  id: z.string().uuid(),
  originalPrompt: z.string(),
  optimizedPrompt: z.string(),
  createdAt: z.string().datetime(),
  reasoningTokens: z.number().optional(),
});
