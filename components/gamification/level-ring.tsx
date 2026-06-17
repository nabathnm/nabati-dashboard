"use client";

import { cn } from "@/lib/utils";

interface LevelRingProps {
  level: number;
  xp: number;
  className?: string;
}

const XP_PER_LEVEL = 500;

export function LevelRing({ level, xp, className }: LevelRingProps) {
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

  // SVG circle properties
  const size = 180;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Glow effect behind the ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-cyan-500/20 blur-2xl animate-pulse-glow" />

      <svg
        width={size}
        height={size}
        className="transform -rotate-90 relative z-10"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#levelGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Level
        </span>
        <span className="text-5xl font-black bg-gradient-to-br from-indigo-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent leading-none">
          {level}
        </span>
        <span className="text-[11px] font-semibold text-slate-500 mt-1">
          {xpInCurrentLevel} / {XP_PER_LEVEL} XP
        </span>
      </div>
    </div>
  );
}
