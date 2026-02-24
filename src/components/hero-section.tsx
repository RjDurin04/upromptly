"use client";

import { Code2, Lightbulb, PenLine, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { usePromptStore } from "@/stores/prompt-store";

const SUGGESTIONS = [
  {
    title: "Code Refactoring",
    description: "Optimize a messy function into clean architecture.",
    icon: Code2,
    prompt:
      "Write a strict, senior-level code review for a bloated React component. Focus on memoization, extracting pure functions, and early returns.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Creative Writing",
    description: "Draft a compelling product launch narrative.",
    icon: PenLine,
    prompt:
      "Write a high-converting, emotionally resonant launch email for a new B2B productivity tool. Tone: authoritative yet accessible. Do not use corporate jargon.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    title: "Strategic Ideation",
    description: "Brainstorm go-to-market strategies.",
    icon: Lightbulb,
    prompt:
      "Act as a fractional CMO. Brainstorm 5 unconventional go-to-market strategies for a developer-focused cybersecurity startup targeting mid-market CTOs.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
];

export function HeroSection() {
  const setCurrentInput = usePromptStore((state) => state.setCurrentInput);
  const textareaRef = document.getElementById(
    "prompt-input",
  ) as HTMLTextAreaElement | null;

  const handleSuggestionClick = useCallback(
    (promptText: string) => {
      setCurrentInput(promptText);
      // Automatically focus the text area so the user can edit or immediately submit
      if (textareaRef) {
        textareaRef.focus();
      }
    },
    [setCurrentInput, textareaRef],
  );

  return (
    <div className="w-full pb-8">
      <div className="mb-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-accent/20 bg-amber-accent/10 px-3 py-1 text-[11px] font-medium tracking-wide text-amber-accent"
        >
          <Sparkles className="h-3 w-3" />
          <span>Adaptive Prompt Architecture</span>
        </motion.div>

        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
          Transform raw ideas into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-accent to-amber-accent/70">
            precision-engineered
          </span>{" "}
          instructions.
        </h1>

        <p className="text-[15px] leading-relaxed text-foreground/50 text-balance">
          Stop fighting with language models. Describe what you want in plain
          words, and Upromptly will compile it into an attention-optimized,
          highly constrained system prompt ready for execution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SUGGESTIONS.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.div
              key={suggestion.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Button
                variant="outline"
                className="group h-auto w-full flex-col items-start justify-start gap-3 whitespace-normal rounded-xl border-white/[0.08] bg-[#111113]/50 p-4 text-left transition-all hover:bg-white/[0.04] hover:border-white/[0.12]"
                onClick={() => handleSuggestionClick(suggestion.prompt)}
              >
                <div className={`rounded-lg p-2 ${suggestion.bg}`}>
                  <Icon className={`h-4 w-4 ${suggestion.color}`} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[14px] font-medium text-foreground/90 group-hover:text-foreground">
                    {suggestion.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-foreground/50">
                    {suggestion.description}
                  </p>
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
