"use client";

import { motion, AnimatePresence } from "motion/react";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { PromptInput } from "@/components/prompt-input";
import { ProcessingState } from "@/components/processing-state";
import { PromptOutput } from "@/components/prompt-output";
import { PromptHistory } from "@/components/prompt-history";
import { ErrorDisplay } from "@/components/error-display";
import { usePromptStore } from "@/stores/prompt-store";
import { useEffect, useState } from "react";

export default function Home() {
  const isProcessing = usePromptStore((state) => state.isProcessing);
  const currentOutput = usePromptStore((state) => state.currentOutput);
  const currentInput = usePromptStore((state) => state.currentInput);

  // Hydration fix for Zustand + localStorage
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const hasOutput = !!currentOutput && !isProcessing;
  const isPristine = !isProcessing && !currentOutput && currentInput.length === 0;

  return (
    <div className="relative min-h-screen selection:bg-amber-accent/30 selection:text-foreground">

      <Header />

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10 lg:flex-row lg:items-start lg:gap-16 lg:py-16">

        {/* ─── Left Column: Core Interaction ──────────── */}
        <div className="flex-1 w-full min-w-0 space-y-8">

          <AnimatePresence mode="wait">
            {isPristine && (
              <motion.div
                key="hero-section"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <HeroSection />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: isPristine ? 0.2 : 0 }}
          >
            <PromptInput />
          </motion.div>

          {/* Dynamic state area: Error | Processing | Output */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key="error-display"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "anticipate" }}
                className="mb-4 overflow-hidden"
              >
                <ErrorDisplay />
              </motion.div>

              {isProcessing && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProcessingState />
                </motion.div>
              )}

              {hasOutput && (
                <motion.div
                  key="output"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                >
                  <PromptOutput />
                </motion.div>
              )}
            </AnimatePresence>


          </div>
        </div>

        {/* ─── Right Column: History Sidebar ──────────── */}
        <aside className="w-full shrink-0 border-white/[0.06] pt-10 lg:w-[320px] lg:border-l lg:pl-10 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <PromptHistory />
          </motion.div>
        </aside>

      </main>
    </div>
  );
}
