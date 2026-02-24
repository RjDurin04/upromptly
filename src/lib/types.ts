import type { z } from "zod";
import type {
  OptimizeRequestSchema,
  PromptHistoryEntrySchema,
} from "./schemas";
export type OptimizeRequest = z.infer<typeof OptimizeRequestSchema>;
export type PromptHistoryEntry = z.infer<typeof PromptHistoryEntrySchema>;

/** Discriminated error envelope returned by the API route */
export type ApiErrorResponse = {
  error: {
    code:
      | "VALIDATION_ERROR"
      | "AUTH_ERROR"
      | "RATE_LIMITED"
      | "UPSTREAM_ERROR"
      | "INTERNAL_ERROR";
    message: string;
    isRetryable: boolean;
  };
};
