"use client";

import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/types/task";
import { isPast, parseISO } from "date-fns";

interface TaskStatsProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
}

export default function TaskStats({ tasks, isLoading }: TaskStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const allTasks = tasks ?? [];
  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === "done").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const overdue = allTasks.filter(
    (t) => t.due_date && t.status !== "done" && isPast(parseISO(t.due_date))
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      label: "Total Tasks",
      value: total.toString(),
      icon: ListTodo,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      accent: "border-t-blue-400",
    },
    {
      label: "Completed",
      value: completed.toString(),
      icon: CheckCircle2,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      accent: "border-t-emerald-400",
    },
    {
      label: "In Progress",
      value: inProgress.toString(),
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      accent: "border-t-amber-400",
    },
    {
      label: "Overdue",
      value: overdue.toString(),
      icon: AlertTriangle,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
      accent: "border-t-rose-400",
    },
    {
      label: "Completion",
      value: `${completionRate}%`,
      icon: TrendingUp,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-500",
      accent: "border-t-indigo-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-white rounded-md shadow-sm border border-slate-100 border-t-2 p-4 hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <div className={`w-8 h-8 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}