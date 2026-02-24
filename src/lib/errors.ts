export type ErrorCategory =
  | "TRANSIENT" // Temporary issues (e.g., rate limits, brief network hiccups)
  | "INVALID_INPUT" // Client provided bad data (e.g., failed validation, bad JSON)
  | "INVALID_STATE" // Logical bug or unexpected state in the application
  | "DEPENDENCY_DOWN" // External service (Upstash, OpenRouter, reCAPTCHA) is unreachable/failing
  | "SECURITY_BREACH"; // Unauthorized access attempt, failed reCAPTCHA score

export interface DomainError {
  code: ErrorCategory;
  message: string;
  details?: unknown;
}

/**
 * Normalizes an unknown error into a structured object for logging without
 * spilling a noisy stack trace unless explicitly requested.
 */
export function summarizeError(error: unknown): {
  message: string;
  name: string;
} {
  if (error instanceof Error) {
    return { message: error.message, name: error.name };
  }
  return { message: String(error), name: "UnknownError" };
}
