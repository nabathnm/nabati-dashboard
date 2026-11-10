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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
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
            <div
              className={cn(
                "pointer-events-none absolute -right-4 -bottom-4 size-20 rounded-full border border-current opacity-10",
                item.iconColor
              )}
              aria-hidden="true"
            />

            <div className="flex items-center justify-between gap-2 relative z-10">
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {item.label}
              </span>
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg border shadow-2xs",
                  item.iconBg
                )}
              >
                <Icon className={cn("size-3.5", item.iconColor)} />
              </div>
            </div>

            <div className="mt-3 relative z-10">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {statValues[index]}
                </span>
                {isRate && (
                  <span className="text-[11px] text-muted-foreground">selesai</span>
                )}
              </div>

              {isRate ? (
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-[#B48EAD] transition-all duration-500 ease-out"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-muted-foreground/80 truncate">
                  {isOverdue ? "Perlu perhatian segera" : item.subLabel}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
