"use client";

import { Check, Copy, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { COPY_FEEDBACK_DURATION_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePromptStore } from "@/stores/prompt-store";

export function PromptOutput() {
  const currentOutput = usePromptStore((state) => state.currentOutput);
  const clearCurrentSession = usePromptStore(
    (state) => state.clearCurrentSession,
  );

  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyToClipboard = useCallback(async () => {
    if (!currentOutput) return;
    try {
      await navigator.clipboard.writeText(currentOutput);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), COPY_FEEDBACK_DURATION_MS);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = currentOutput || "";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), COPY_FEEDBACK_DURATION_MS);
      } catch {
        toast.error(
          "Could not copy to clipboard. Please select and copy manually.",
        );
      }
      document.body.removeChild(textArea);
    }
  }, [currentOutput]);

  if (!currentOutput) return null;

  return (
    <div className="space-y-4">
      {/* ─── Section Header ───────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-accent/70" />
          <h2 className="text-[13px] font-medium text-foreground/60 tracking-wide">
            Optimized prompt
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyToClipboard}
            className={cn(
              "relative h-8 w-8 transition-colors",
              hasCopied
                ? "bg-amber-accent/20 text-amber-accent hover:bg-amber-accent/30 hover:text-amber-accent"
                : "bg-white/[0.04] text-foreground/60 hover:bg-white/[0.08] hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                hasCopied ? "scale-100 opacity-100" : "scale-50 opacity-0",
              )}
            >
              <Check className="h-4 w-4" />
            </span>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                hasCopied ? "scale-50 opacity-0" : "scale-100 opacity-100",
              )}
            >
              <Copy className="h-4 w-4" />
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCurrentSession}
            className="h-8 gap-2 rounded-lg text-[12px] font-medium text-foreground/50 hover:text-foreground/80 hover:bg-white/[0.06]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New
          </Button>
        </div>
      </div>

      {/* ─── Output Card ──────────────────────────────── */}
      <div className="rounded-xl border border-amber-accent/15 bg-[#111113] shadow-[0_0_20px_rgba(232,168,56,0.04)]">
        <div className="p-5">
          <pre className="whitespace-pre-wrap font-mono text-[13px] leading-[1.7] text-foreground/85 break-words">
            {currentOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}
