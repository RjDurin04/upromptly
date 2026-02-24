"use client";

import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0A0A0B]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* ─── Brand ──────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-accent/15">
            <Zap
              className="h-[18px] w-[18px] text-amber-accent"
              strokeWidth={2.5}
            />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-foreground/90">
              Upromptly
            </h1>
            <p className="text-[11px] font-normal tracking-wide text-foreground/40">
              AI Prompt Optimizer
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
