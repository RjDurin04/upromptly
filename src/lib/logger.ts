import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    // In development, use pino-pretty for readable console output.
    // In production, log raw JSON for aggregation tools (e.g. Datadog, Axiom).
    ...(isDev && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                ignore: "pid,hostname",
                translateTime: "SYS:standard",
            },
        },
    }),
});
