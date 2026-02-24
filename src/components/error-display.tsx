"use client";

import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePromptStore } from "@/stores/prompt-store";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useCallback } from "react";

export function ErrorDisplay() {
    const processingError = usePromptStore((state) => state.processingError);
    const isErrorRetryable = usePromptStore((state) => state.isErrorRetryable);
    const submitPrompt = usePromptStore((state) => state.submitPrompt);
    const setProcessingError = usePromptStore((state) => state.setProcessingError);
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleRetry = useCallback(async () => {
        if (!executeRecaptcha) {
            setProcessingError("Security check unavailable. Please refresh the page.", false);
            return;
        }

        let token: string;
        try {
            token = await executeRecaptcha("optimize_prompt_retry");
        } catch {
            setProcessingError("Security verification failed. Please refresh and try again.", false);
            return;
        }
        submitPrompt(token);
    }, [submitPrompt, executeRecaptcha, setProcessingError]);

    if (!processingError) return null;

    const ErrorIcon = isErrorRetryable ? WifiOff : AlertTriangle;

    return (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3.5">
            <div className="flex items-start gap-3">
                <ErrorIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive/80" />
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-destructive/90">
                        {isErrorRetryable ? "Temporary error" : "Something went wrong"}
                    </p>
                    <p className="mt-1 text-[12px] text-destructive/60 leading-relaxed">
                        {processingError}
                    </p>
                </div>
                {isErrorRetryable && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRetry}
                        className="h-8 gap-1.5 rounded-lg text-[12px] font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                    </Button>
                )}
            </div>
        </div>
    );
}
