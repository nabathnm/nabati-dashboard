"use client";

import Link from "next/link";
import { Sunrise } from "lucide-react";
import { useTodayRoutineStats } from "@/hooks/use-routines";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoutineProgressWidget() {
  const { data: stats, isLoading } = useTodayRoutineStats();

  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-5 min-h-[100px]">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const completed = stats?.completed ?? 0;
  const rate = stats?.completionRate ?? 0;

  return (
    <div className="glass-card rounded-3xl p-5 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Sunrise className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Today&apos;s Routine
          </h4>
        </div>
        <Link href="/routine">
          <span className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">
            View
          </span>
        </Link>
      </div>

      {total === 0 ? (
        <p className="text-[10px] text-muted-foreground font-semibold">
          No routine generated yet.{" "}
          <Link href="/routine" className="text-indigo-600 hover:underline">
            Get started →
          </Link>
        </p>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-emerald-500"
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="text-[10px] font-semibold text-muted-foreground">
            <span className="text-slate-800 font-bold">{completed}/{total}</span>{" "}
            completed ({rate}%)
          </p>
        </>
      )}
    </div>
  );
}
