"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
    PromptHistoryEntry,
} from "@/lib/types";
import { OptimizeRequestSchema } from "@/lib/schemas";
import {
    LOCAL_STORAGE_KEY,
} from "@/lib/constants";

// ─── Store Shape ────────────────────────────────────────────────
interface PromptStoreState {
    // Session state (NOT persisted)
    currentInput: string;
    currentOutput: string | null;
    isProcessing: boolean;
    processingError: string | null;
    isErrorRetryable: boolean;

    // Persisted state
    promptHistory: PromptHistoryEntry[];
}

interface PromptStoreActions {
    setCurrentInput: (inputText: string) => void;
    setProcessingError: (errorMessage: string, isRetryable: boolean) => void;
    submitPrompt: (recaptchaToken: string) => Promise<void>;
    clearCurrentSession: () => void;
    restoreHistoryEntry: (entryId: string) => void;
    deleteHistoryEntry: (entryId: string) => void;
    clearAllHistory: () => void;
}

type PromptStore = PromptStoreState & PromptStoreActions;

// ─── Store Implementation ───────────────────────────────────────
export const usePromptStore = create<PromptStore>()(
    persist(
        (set, get) => ({
            // ── Initial state ──
            currentInput: "",
            currentOutput: null,
            isProcessing: false,
            processingError: null,
            isErrorRetryable: false,
            promptHistory: [],

            // ── Actions ──
            setCurrentInput: (inputText: string) => {
                set({ currentInput: inputText, processingError: null });
            },

            setProcessingError: (errorMessage: string, isRetryable: boolean) => {
                set({ processingError: errorMessage, isErrorRetryable: isRetryable });
            },

            submitPrompt: async (recaptchaToken: string) => {
                const { currentInput } = get();

                const validationResult = OptimizeRequestSchema.safeParse({
                    userPrompt: currentInput,
                    recaptchaToken,
                });

                if (!validationResult.success) {
                    set({
                        processingError: validationResult.error.issues[0]?.message ?? "Invalid input",
                        isErrorRetryable: false,
                    });
                    return;
                }

                set({
                    isProcessing: true,
                    processingError: null,
                    currentOutput: "",
                    isErrorRetryable: false,
                });

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

                try {
                    const response = await fetch("/api/optimize", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(validationResult.data),
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        let errorMessage = `Request failed (${response.status})`;
                        try {
                            const errorResponse = await response.json();
                            if (errorResponse?.error?.message) {
                                errorMessage = errorResponse.error.message;
                            }
                        } catch {
                            // If JSON parsing fails, fallback to raw text or generic message
                            const errorText = await response.text();
                            if (errorText) errorMessage = errorText;
                        }

                        set({
                            isProcessing: false,
                            processingError: errorMessage,
                            isErrorRetryable: response.status >= 500 || response.status === 429,
                        });
                        return;
                    }

                    if (!response.body) {
                        throw new Error("No response body returned from server");
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let done = false;
                    let accumulatedOutput = "";
                    let finalReasoningTokens = 0;
                    let sseBuffer = "";

                    while (!done) {
                        const { value, done: readerDone } = await reader.read();
                        done = readerDone;

                        if (value) {
                            sseBuffer += decoder.decode(value, { stream: true });
                            const events = sseBuffer.split("\n\n");
                            sseBuffer = events.pop() ?? ""; // carry remainder to next chunk

                            for (const event of events) {
                                if (event.startsWith("data: ")) {
                                    try {
                                        const dataStr = event.slice(6);
                                        if (!dataStr.trim()) continue;

                                        const parsedEvent = JSON.parse(dataStr);
                                        if (parsedEvent.type === "content") {
                                            accumulatedOutput += parsedEvent.value;
                                            set({ currentOutput: accumulatedOutput });
                                        } else if (parsedEvent.type === "meta" && parsedEvent.reasoningTokens) {
                                            finalReasoningTokens = parsedEvent.reasoningTokens;
                                        }
                                    } catch {
                                        // Single event parse error — skip this event, continue stream
                                    }
                                }
                            }
                        }
                    }

                    // Once complete, save the exact history
                    const historyEntry: PromptHistoryEntry = {
                        id: crypto.randomUUID(),
                        originalPrompt: currentInput,
                        optimizedPrompt: accumulatedOutput,
                        createdAt: new Date().toISOString(),
                        reasoningTokens: finalReasoningTokens > 0 ? finalReasoningTokens : undefined,
                    };

                    set((state) => ({
                        isProcessing: false,
                        currentOutput: accumulatedOutput,
                        promptHistory: [historyEntry, ...state.promptHistory],
                    }));
                } catch (networkError) {
                    clearTimeout(timeoutId);
                    set({
                        isProcessing: false,
                        processingError:
                            networkError instanceof Error
                                ? networkError.name === "AbortError"
                                    ? "Request timed out"
                                    : `Network error: ${networkError.message}`
                                : "An unexpected network error occurred",
                        isErrorRetryable: true,
                    });
                }
            },

            clearCurrentSession: () => {
                set({
                    currentInput: "",
                    currentOutput: null,
                    processingError: null,
                    isErrorRetryable: false,
                });
            },

            restoreHistoryEntry: (entryId: string) => {
                const entry = get().promptHistory.find((historyItem) => historyItem.id === entryId);
                if (!entry) return;
                set({
                    currentInput: entry.originalPrompt,
                    currentOutput: entry.optimizedPrompt,
                    isProcessing: false,
                    processingError: null,
                    isErrorRetryable: false,
                });
            },

            deleteHistoryEntry: (entryId: string) => {
                set((state) => ({
                    promptHistory: state.promptHistory.filter(
                        (historyItem) => historyItem.id !== entryId
                    ),
                }));
            },

            clearAllHistory: () => {
                set({ promptHistory: [] });
            },
        }),
        {
            name: LOCAL_STORAGE_KEY,
            // Only persist history + settings, not ephemeral session state
            partialize: (state) => ({
                promptHistory: state.promptHistory,
            }),
        }
    )
);
