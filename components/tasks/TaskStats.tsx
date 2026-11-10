"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { taskStatStyles } from "@/constants/tasks/task-stat-styles";
import { cn } from "@/lib/utils";
import type { TaskStats as TaskStatsData } from "@/types/task";

interface TaskStatsProps {
  stats: TaskStatsData;
  isLoading: boolean;
}

export default function TaskStats({ stats, isLoading }: TaskStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl bg-muted/60" />
        ))}
      </div>
    );
  }

  const { total, inProgress, completed, overdue } = stats;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const statValues = [total, inProgress, completed, overdue, `${completionRate}%`];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {taskStatStyles.map((item, index) => {
        const Icon = item.icon;
        const isRate = index === 4;
        const isOverdue = index === 3 && overdue > 0;

        return (
          <div
            key={item.label}
            className={cn(
              "relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 overflow-hidden",
              "bg-card/85 hover:bg-card border-border/70 shadow-xs",
              item.cardAccent,
              isOverdue && "border-[#BF616A]/40 bg-[#BF616A]/5 dark:bg-[#BF616A]/10"
            )}
          >
            {/* Subtle Nord Decorative Background Ring (Section 5 nord-style) */}
            {!isRate && (
              <div
                className={cn(
                  "pointer-events-none absolute -right-4 -bottom-4 size-20 rounded-full border border-current opacity-10",
                  item.iconColor
                )}
                aria-hidden="true"
              />
            )}

            <div className="flex items-center justify-between gap-2 relative z-10">
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {item.label}
              </span>
              {isRate ? (
                <span className="text-[11px] font-mono font-semibold text-[#B48EAD] bg-[#B48EAD]/10 border border-[#B48EAD]/25 px-1.5 py-0.5 rounded-md tabular-nums">
                  {completed}/{total}
                </span>
              ) : (
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg border shadow-2xs",
                    item.iconBg
                  )}
                >
                  <Icon className={cn("size-3.5", item.iconColor)} />
                </div>
              )}
            </div>

            {isRate ? (
              <div className="mt-2.5 flex items-center justify-between gap-2.5 relative z-10">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                      {completionRate}%
                    </span>
                    <span className="text-[11px] text-muted-foreground">selesai</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">
                    {total === 0
                      ? "Belum ada agenda"
                      : completed === total
                      ? "Semua tugas tercapai"
                      : `${completed} dari ${total} tugas`}
                  </p>
                </div>

                {/* Progress-chart Lingkaran (Circular Ring Gauge) */}
                <div className="relative size-12 shrink-0 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
                    <circle
                      cx="22"
                      cy="22"
                      r="17"
                      className="stroke-muted/60 dark:stroke-muted/30"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="17"
                      className={cn(
                        "transition-all duration-700 ease-out",
                        completed === total && total > 0
                          ? "stroke-[#A3BE8C]"
                          : "stroke-[#B48EAD]"
                      )}
                      strokeWidth="3.5"
                      strokeDasharray={106.81}
                      strokeDashoffset={106.81 - (completionRate / 100) * 106.81}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      className={cn(
                        "size-4 transition-colors",
                        completed === total && total > 0
                          ? "text-[#A3BE8C]"
                          : "text-[#B48EAD]"
                      )}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 relative z-10">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                    {statValues[index]}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground/80 truncate">
                  {isOverdue ? "Perlu perhatian segera" : item.subLabel}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
