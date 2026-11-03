"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { taskStatStyles } from "@/constants/tasks/task-stat-styles";
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
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const { total, inProgress, completed, overdue } = stats;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const statValues = [total, inProgress, completed, overdue, `${completionRate}%`];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {taskStatStyles.map((item, index) => (
        <div
          key={item.label}
          className="rounded-xl shadow-sm border border-card-border bg-card text-foreground duration-200 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3 pt-3 pb-2 bg-primary text-primary-foreground">
            <p className="text-sm px-4 font-bold">{item.label}</p>
          </div>
          <p className="text-2xl font-bold tracking-tight px-4 pb-4">
            {statValues[index]}
          </p>
        </div>
      ))}
    </div>
  );
}
