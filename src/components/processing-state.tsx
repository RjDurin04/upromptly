"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePromptStore } from "@/stores/prompt-store";

// Characters used for the scramble/decode effect
const CIPHER_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]";

// Realistic-looking placeholder lines that get "decoded"
const DECODE_LINES = [
  "Analyzing prompt structure and intent...",
  "Identifying key objectives and constraints",
  "Restructuring for clarity and precision",
  "Adding context boundaries and scope",
  "Optimizing token efficiency and flow",
  "Refining output format instructions",
  "Finalizing enhanced prompt →",
] as const;

const SCRAMBLE_INTERVAL_MS = 60;
const CHARS_PER_TICK = 1;
const LINE_STAGGER_MS = 1000;

function useDecodeLine(text: string, startDelayMs: number) {
  const [displayText, setDisplayText] = useState("");
  const resolvedCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getRandomChar = useCallback(
    () => CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)],
    [],
  );

  useEffect(() => {
    resolvedCount.current = 0;
    setDisplayText("");

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        resolvedCount.current = Math.min(
          resolvedCount.current + CHARS_PER_TICK,
          text.length,
        );

        const resolved = text.slice(0, resolvedCount.current);
        const remaining = text.length - resolvedCount.current;

        // Generate scrambled characters for the unresolved portion
        const scrambled = Array.from({ length: remaining }, () =>
          getRandomChar(),
        ).join("");

        setDisplayText(resolved + scrambled);

        if (resolvedCount.current >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, SCRAMBLE_INTERVAL_MS);
    }, startDelayMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, startDelayMs, getRandomChar]);

  return displayText;
}

function DecodeLine({ text, delay }: { text: string; delay: number }) {
  const displayText = useDecodeLine(text, delay);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className="flex items-center gap-2"
    >
      <span className="text-amber-accent/30 text-[10px] select-none">›</span>
      <span className="font-mono text-[12.5px] leading-relaxed tracking-wide">
        {(() => {
          // Find how many characters from the start are fully resolved
          let resolvedLength = 0;
          for (let i = 0; i < displayText.length; i++) {
            if (i < text.length && displayText[i] === text[i]) {
              resolvedLength = i + 1;
            } else {
              break;
            }
          }
          const resolvedPart = displayText.slice(0, resolvedLength);
          const scrambledPart = displayText.slice(resolvedLength);
          return (
            <>
              <span className="text-foreground/50">{resolvedPart}</span>
              <span className="text-amber-accent/60">{scrambledPart}</span>
            </>
          );
        })()}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="ml-0.5 inline-block w-[6px] h-[14px] bg-amber-accent/40 align-middle"
        />
      </span>
    </motion.div>
  );
}

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
            role="img"
          >
            <title>Rotating dashed ring</title>
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
            role="img"
          >
            <title>Pulsing AI star</title>
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

      {/* Decoding animation area */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5 space-y-2.5 overflow-hidden">
        {DECODE_LINES.map((line, lineIndex) => (
          <DecodeLine
            key={line}
            text={line}
            delay={lineIndex * LINE_STAGGER_MS}
          />
        ))}
      </div>
    </div>
  );
}
