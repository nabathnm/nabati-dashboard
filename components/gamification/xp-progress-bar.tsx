"use client";

import { cn } from "@/lib/utils";

interface XPProgressBarProps {
  xp: number;
  className?: string;
}

const XP_PER_LEVEL = 500;

export function XPProgressBar({ xp, className }: XPProgressBarProps) {
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const nextLevel = level + 1;
  const xpRemaining = XP_PER_LEVEL - xpInCurrentLevel;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-600">
          Level {level}
        </span>
        <span className="font-semibold text-slate-400">
          {xpRemaining} XP lagi ke Level {nextLevel}
        </span>
      </div>

      {/* Bar Container */}
      <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
        {/* Animated fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(2, progress)}%` }}
        >
          {/* Shimmer effect on the bar */}
          <div className="absolute inset-0 animate-shimmer rounded-full" />
        </div>
      </div>

      {/* XP numbers */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
        <span>{xpInCurrentLevel} XP</span>
        <span>{XP_PER_LEVEL} XP</span>
      </div>
    </div>
  );
}
