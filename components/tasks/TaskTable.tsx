"use client";

import { FileText, ChevronDown } from "lucide-react";
import type { Task, TaskFilters, TaskStatus, TaskCategory } from "@/types/task";
import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import EmptyState from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { cn } from "@/lib/utils";

interface TaskTableProps {
  filters: TaskFilters;
  onEditTask: (task: Task) => void;
  onCreateTask: () => void;
}

const categoryConfig: Record<TaskCategory, { color: string; bg: string; dot: string; label: string }> = {
  Kuliah: {
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    dot: "bg-blue-400",
    label: "Kuliah",
  },
  Organisasi: {
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    dot: "bg-amber-400",
    label: "Organisasi",
  },
  Praktikum: {
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-100",
    dot: "bg-rose-400",
    label: "Praktikum",
  },
  Lainnya: {
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-100",
    dot: "bg-purple-400",
    label: "Lainnya",
  },
};

export default function TaskTable({ filters, onEditTask, onCreateTask }: TaskTableProps) {
  const { data: tasks, isLoading } = useTasks(filters);
  const updateStatusMutation = useUpdateTaskStatus();

  const handleToggleStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === "done" ? "todo" : "done";
    updateStatusMutation.mutate({ id: task.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
        <div className="space-y-0 divide-y divide-slate-50">
          <div className="px-5 py-3 bg-slate-50/80">
            <Skeleton className="h-4 w-full" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4">
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState onCreateTask={onCreateTask} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
      <div className="overflow-x-auto min-w-[800px]">
        <HeaderRow labels={["Task Name", "Category", "Done", "Progress", "Detail", "Deadline"]} />

        <div className="divide-y divide-slate-50 bg-card/10">
          {tasks.map((task) => {
            const cat = categoryConfig[task.category];
            const isDone = task.status === "done";

            return (
              <div
                key={task.id}
                className="flex items-center hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => onEditTask(task)}
              >
                {/* Name */}
                <div className="flex-1 px-4 py-3.5 flex items-center gap-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <FileText className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <span className={cn(
                    "font-medium truncate",
                    isDone ? "text-slate-400 line-through" : "text-slate-700"
                  )}>
                    {task.title}
                  </span>
                </div>

                {/* Category */}
                <div className="flex-1 px-4 py-3.5 flex justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${cat.bg} ${cat.color} truncate`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.dot}`} />
                    <span className="truncate">{cat.label}</span>
                  </span>
                </div>

                {/* Checkbox */}
                <div className="flex-1 px-4 py-3.5 flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => handleToggleStatus(task)}
                    className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                  />
                </div>

                {/* Progress */}
                <div className="flex-1 px-4 py-3.5 flex items-center justify-center gap-2.5">
                  <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${task.progress >= 100
                        ? "bg-emerald-400"
                        : task.progress >= 60
                          ? "bg-primary"
                          : task.progress >= 30
                            ? "bg-amber-400"
                            : "bg-slate-300"
                        }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500 tabular-nums">
                    {task.progress}%
                  </span>
                </div>

                {/* Detail */}
                <div className="flex-1 px-4 py-3.5 flex justify-center overflow-hidden">
                  <p className="text-sm text-slate-500 truncate text-center max-w-[120px]">
                    {task.description || <span className="text-slate-300">—</span>}
                  </p>
                </div>

                {/* Deadline */}
                <div className="flex-1 px-4 py-3.5 flex justify-center">
                  {task.due_date ? (
                    <span className="text-sm text-slate-600 font-medium truncate">
                      {format(parseISO(task.due_date), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}