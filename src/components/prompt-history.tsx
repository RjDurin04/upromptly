"use client";

import { Clock, Trash2, RotateCcw, X, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePromptStore } from "@/stores/prompt-store";
import { HISTORY_TRUNCATION_LENGTH } from "@/lib/constants";
import { useState } from "react";

function formatRelativeTime(isoDate: string): string {
    const differenceMs = Date.now() - new Date(isoDate).getTime();
    const differenceSeconds = Math.floor(differenceMs / 1_000);
    const differenceMinutes = Math.floor(differenceSeconds / 60);
    const differenceHours = Math.floor(differenceMinutes / 60);
    const differenceDays = Math.floor(differenceHours / 24);

    if (differenceSeconds < 60) return "Just now";
    if (differenceMinutes < 60) return `${differenceMinutes}m ago`;
    if (differenceHours < 24) return `${differenceHours}h ago`;
    if (differenceDays < 7) return `${differenceDays}d ago`;
    return new Date(isoDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function truncatePrompt(promptText: string): string {
    if (promptText.length <= HISTORY_TRUNCATION_LENGTH) return promptText;
    return `${promptText.slice(0, HISTORY_TRUNCATION_LENGTH)}...`;
}

export function PromptHistory() {
    const promptHistory = usePromptStore((state) => state.promptHistory);
    const restoreHistoryEntry = usePromptStore((state) => state.restoreHistoryEntry);
    const deleteHistoryEntry = usePromptStore((state) => state.deleteHistoryEntry);
    const clearAllHistory = usePromptStore((state) => state.clearAllHistory);
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

    if (promptHistory.length === 0) {
        return (
            <div className="space-y-3">
                <h3 className="text-[13px] font-medium text-foreground/60 tracking-wide">
                    History
                </h3>
                <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#111113] px-6 py-10 text-center">
                    <Clock className="mb-3 h-8 w-8 text-foreground/15" />
                    <p className="text-[13px] font-normal text-foreground/40">
                        No optimizations yet
                    </p>
                    <p className="mt-1 text-[11px] text-foreground/25">
                        Your prompt history will appear here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-medium text-foreground/60 tracking-wide">
                    History
                    <span className="ml-2 text-[11px] font-normal tabular-nums text-foreground/30">
                        {promptHistory.length}
                    </span>
                </h3>

                {isConfirmingClear ? (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-destructive/80">Clear all?</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                clearAllHistory();
                                setIsConfirmingClear(false);
                            }}
                            className="h-6 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            Yes
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsConfirmingClear(false)}
                            className="h-6 px-2 text-[11px] font-medium text-foreground/40 hover:text-foreground/60"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsConfirmingClear(true)}
                        className="h-7 gap-1.5 text-[11px] font-medium text-foreground/30 hover:text-destructive/80 hover:bg-destructive/5"
                    >
                        <Trash2 className="h-3 w-3" />
                        Clear
                    </Button>
                )}
            </div>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {promptHistory.map((entry) => (
                    <div
                        key={entry.id}
                        className="group flex items-start gap-3 rounded-lg border border-white/[0.04] bg-[#111113] px-3.5 py-3 transition-colors hover:border-white/[0.08] hover:bg-[#151517]"
                    >
                        <button
                            type="button"
                            onClick={() => restoreHistoryEntry(entry.id)}
                            className="flex-1 text-left min-w-0"
                        >
                            <p className="text-[12px] leading-[1.5] text-foreground/70 truncate">
                                {truncatePrompt(entry.originalPrompt)}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                                <div className="flex w-full items-center justify-between text-[11px] text-foreground/40">
                                    <div className="flex items-center gap-3">
                                        <span>{formatRelativeTime(entry.createdAt)}</span>
                                    </div>

                                    {entry.reasoningTokens !== undefined && (
                                        <span className="rounded-full bg-amber-accent/10 px-2 py-0.5 text-amber-accent flex items-center gap-1">
                                            <Sparkles className="h-2.5 w-2.5" />
                                            {entry.reasoningTokens} tokens
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>

                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => restoreHistoryEntry(entry.id)}
                                className="h-7 w-7 p-0 text-foreground/30 hover:text-foreground/60 hover:bg-white/[0.06]"
                            >
                                <RotateCcw className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteHistoryEntry(entry.id)}
                                className="h-7 w-7 p-0 text-foreground/30 hover:text-destructive/80 hover:bg-destructive/5"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
