"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  streak: number;
  className?: string;
}

export function StreakCounter({ streak, className }: StreakCounterProps) {
  const isActive = streak > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
        isActive
          ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60"
          : "bg-slate-50 border border-slate-100",
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
          isActive
            ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-300/30"
            : "bg-slate-200"
        )}
      >
        <Flame
          className={cn(
            "w-5 h-5",
            isActive ? "text-white" : "text-slate-400"
          )}
        />
      </div>

      <div>
        <p className="text-2xl font-black text-slate-800 leading-none">
          {streak}
        </p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
          {streak === 1 ? "Day Streak" : "Days Streak"}
        </p>
      </div>
    </div>
  );
}
