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
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
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
              "relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200",
              "bg-card/90 hover:bg-card border-border/70 hover:border-border/90 shadow-xs",
              isOverdue && "border-rose-500/40 bg-rose-500/5 dark:bg-rose-500/10"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {item.label}
              </span>
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                  item.iconBg
                )}
              >
                <Icon className={cn("size-3.5", item.iconColor)} />
              </div>
            </div>

            <div className="mt-3">
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
                    className="h-full rounded-full bg-amber-500 transition-all duration-500 ease-out"
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
