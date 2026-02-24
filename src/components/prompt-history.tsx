"use client";

import { Clock, RotateCcw, Sparkles, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HISTORY_TRUNCATION_LENGTH } from "@/lib/constants";
import { usePromptStore } from "@/stores/prompt-store";

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
  return `${promptText.slice(0, HISTORY_TRUNCATION_LENGTH)}…`;
}

export function PromptHistory() {
  const promptHistory = usePromptStore((state) => state.promptHistory);
  const restoreHistoryEntry = usePromptStore(
    (state) => state.restoreHistoryEntry,
  );
  const deleteHistoryEntry = usePromptStore(
    (state) => state.deleteHistoryEntry,
  );
  const clearAllHistory = usePromptStore((state) => state.clearAllHistory);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  if (promptHistory.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-[13px] font-medium text-foreground/60 tracking-wide">
          History
        </h3>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-[#0e0e10] px-6 py-12 text-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.03]">
            <Clock className="h-5 w-5 text-foreground/20" />
          </div>
          <p className="text-[13px] font-normal text-foreground/40">
            No optimizations yet
          </p>
          <p className="mt-1.5 text-[11px] text-foreground/20">
            Your prompt history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ─── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-medium text-foreground/60 tracking-wide">
            History
          </h3>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-medium tabular-nums text-foreground/40">
            {promptHistory.length}
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isConfirmingClear ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <span className="text-[11px] text-destructive/80">
                Clear all?
              </span>
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
                className="h-6 w-6 p-0 text-foreground/40 hover:text-foreground/60"
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="clear-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmingClear(true)}
                className="h-7 gap-1.5 text-[11px] font-medium text-foreground/30 hover:text-destructive/80 hover:bg-destructive/5"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Scrollable List ─────────────────────────── */}
      <div className="relative">
        {/* Top fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-3 bg-gradient-to-b from-background to-transparent" />

        <div className="custom-scrollbar max-h-[420px] space-y-1 overflow-y-auto py-1 pr-1">
          <AnimatePresence initial={false}>
            {promptHistory.map((entry, entryIndex) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  x: -20,
                  scale: 0.95,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  duration: 0.25,
                  ease: [0.16, 1, 0.3, 1],
                  delay: entryIndex * 0.03,
                }}
                className="group relative rounded-lg border border-white/[0.04] bg-[#111113] transition-all duration-200 hover:border-white/[0.08] hover:bg-[#151517] hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
              >
                <button
                  type="button"
                  onClick={() => restoreHistoryEntry(entry.id)}
                  className="w-full text-left px-3.5 py-3 min-w-0"
                >
                  {/* Prompt text */}
                  <p className="text-[12.5px] leading-[1.6] text-foreground/65 group-hover:text-foreground/80 transition-colors line-clamp-2">
                    {truncatePrompt(entry.originalPrompt)}
                  </p>

                  {/* Meta row */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-foreground/30 group-hover:text-foreground/40 transition-colors">
                      {formatRelativeTime(entry.createdAt)}
                    </span>

                    {entry.reasoningTokens !== undefined && (
                      <>
                        <span className="text-foreground/10">·</span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-accent/60">
                          <Sparkles className="h-2.5 w-2.5" />
                          {entry.reasoningTokens} tokens
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* ─── Hover Actions ─────────────────── */}
                <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-md bg-[#111113]/90 p-0.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 border border-white/[0.06]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => restoreHistoryEntry(entry.id)}
                    title="Restore"
                    className="h-6 w-6 p-0 text-foreground/30 hover:text-amber-accent hover:bg-amber-accent/10"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHistoryEntry(entry.id)}
                    title="Delete"
                    className="h-6 w-6 p-0 text-foreground/30 hover:text-destructive/80 hover:bg-destructive/5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-background to-transparent" />
      </div>
    </div>
  );
}
