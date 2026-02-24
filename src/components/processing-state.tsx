"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePromptStore } from "@/stores/prompt-store";
import { motion } from "motion/react";

const SKELETON_LINES = [
    { widthClass: "w-full" },
    { widthClass: "w-[92%]" },
    { widthClass: "w-[85%]" },
    { widthClass: "w-full" },
    { widthClass: "w-[78%]" },
    { widthClass: "w-[95%]" },
    { widthClass: "w-[60%]" },
] as const;

export function ProcessingState() {
    const isProcessing = usePromptStore((state) => state.isProcessing);

    if (!isProcessing) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                {/* Animated Vector Graphic */}
                <div className="relative flex h-6 w-6 items-center justify-center text-amber-accent">
                    {/* Outer rotating dashed ring */}
                    <motion.svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-40"
                    >
                        <motion.circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeDasharray="12 12"
                            strokeLinecap="round"
                            animate={{ strokeDashoffset: [0, -48] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.svg>

                    {/* Inner pulsing AI star */}
                    <motion.svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 drop-shadow-[0_0_6px_rgba(232,168,56,0.6)]"
                    >
                        <path
                            d="M12 2L14.6 9.4L22 12L14.6 14.6L12 22L9.4 14.6L2 12L9.4 9.4L12 2Z"
                            fill="currentColor"
                        />
                    </motion.svg>
                </div>
                <div>
                    <p className="text-[13px] font-medium text-foreground/80">
                        Optimizing your prompt...
                    </p>
                </div>
            </div>

            {/* Skeleton lines */}
            <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5 space-y-3">
                {SKELETON_LINES.map((line, lineIndex) => (
                    <Skeleton
                        key={`skeleton-line-${lineIndex}`}
                        className={`h-3.5 ${line.widthClass} bg-white/[0.04]`}
                        style={{
                            animationDelay: `${lineIndex * 150}ms`,
                            animationDuration: "1.8s",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
