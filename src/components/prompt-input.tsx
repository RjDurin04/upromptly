"use client";

import { useRef, useCallback, useEffect } from "react";
import { SendHorizonal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePromptStore } from "@/stores/prompt-store";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { MAX_INPUT_CHARACTER_COUNT } from "@/lib/constants";

export function PromptInput() {
    const currentInput = usePromptStore((state) => state.currentInput);
    const setCurrentInput = usePromptStore((state) => state.setCurrentInput);
    const isProcessing = usePromptStore((state) => state.isProcessing);
    const submitPrompt = usePromptStore((state) => state.submitPrompt);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { executeRecaptcha } = useGoogleReCaptcha();

    const characterCount = currentInput.length;
    const isInputEmpty = characterCount === 0;
    const isOverLimit = characterCount > MAX_INPUT_CHARACTER_COUNT;
    const isSubmitDisabled = isInputEmpty || isOverLimit || isProcessing;

    const setProcessingError = usePromptStore((state) => state.setProcessingError);

    const handleSubmit = useCallback(async () => {
        if (isSubmitDisabled) return;

        if (!executeRecaptcha) {
            setProcessingError("Security check unavailable. Please refresh the page.", false);
            return;
        }

        let token: string;
        try {
            token = await executeRecaptcha("optimize_prompt");
        } catch {
            setProcessingError("Security verification failed. Please refresh the page and try again.", false);
            return;
        }

        submitPrompt(token);
    }, [isSubmitDisabled, submitPrompt, executeRecaptcha, setProcessingError]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                handleSubmit();
            }
        },
        [handleSubmit]
    );

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        const MIN_HEIGHT_PX = 120;
        const MAX_HEIGHT_PX = 320;
        const scrollHeight = Math.max(textarea.scrollHeight, MIN_HEIGHT_PX);
        textarea.style.height = `${Math.min(scrollHeight, MAX_HEIGHT_PX)}px`;
    }, [currentInput]);

    return (
        <div className="space-y-3">
            <label
                htmlFor="prompt-input"
                className="block text-[13px] font-medium text-foreground/60 tracking-wide"
            >
                Your prompt
            </label>

            <div className="relative rounded-xl border border-white/[0.08] bg-[#111113] transition-colors focus-within:border-amber-accent/30 focus-within:shadow-[0_0_0_1px_rgba(232,168,56,0.15)]">
                <textarea
                    ref={textareaRef}
                    id="prompt-input"
                    value={currentInput}
                    onChange={(event) => setCurrentInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want the AI to do — e.g., 'Write a persuasive product launch email for our new SaaS analytics tool targeting enterprise CTOs...'"
                    disabled={isProcessing}
                    className="w-full resize-none bg-transparent px-4 pt-4 pb-12 text-[14px] font-normal leading-relaxed text-foreground/90 placeholder:text-foreground/25 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: "120px" }}
                />

                {/* ─── Bottom Bar ──────────────────────────────── */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <span
                            className={`text-[11px] font-mono tabular-nums ${isOverLimit
                                ? "text-destructive"
                                : characterCount > MAX_INPUT_CHARACTER_COUNT * 0.9
                                    ? "text-amber-accent/80"
                                    : "text-foreground/30"
                                }`}
                        >
                            {characterCount.toLocaleString()} / {MAX_INPUT_CHARACTER_COUNT.toLocaleString()}
                        </span>
                        <span className="hidden text-[10px] text-foreground/20 sm:inline">
                            Ctrl+Enter to submit
                        </span>
                    </div>

                    <Button
                        id="submit-prompt"
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        size="sm"
                        className="h-8 gap-2 rounded-lg bg-amber-accent px-4 text-[13px] font-medium text-[#0A0A0B] hover:bg-amber-accent/90 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <SendHorizonal className="h-3.5 w-3.5" />
                        )}
                        {isProcessing ? "Optimizing..." : "Optimize"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
