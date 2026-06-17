"use client";

import { FileText, ChevronDown } from "lucide-react";
import type { Task, TaskFilters, TaskStatus, TaskCategory } from "@/types/task";
import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import EmptyState from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

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
    <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 whitespace-nowrap min-w-[220px]">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Task Name</span>
                </div>
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 whitespace-nowrap min-w-[130px]">
                <div className="flex items-center gap-1">
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>Category</span>
                </div>
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 text-center w-[60px]">
                Done
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 whitespace-nowrap min-w-[150px]">
                Progress
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 whitespace-nowrap min-w-[200px]">
                Detail
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 whitespace-nowrap min-w-[120px]">
                Deadline
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.map((task) => {
              const cat = categoryConfig[task.category];
              const isDone = task.status === "done";

              return (
                <tr
                  key={task.id}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  onClick={() => onEditTask(task)}
                >
                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                        <FileText className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <span className={`font-medium ${isDone ? "text-slate-400" : "text-slate-700"}`}>
                        {task.title}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${cat.bg} ${cat.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                      {cat.label}
                    </span>
                  </td>

                  {/* Checkbox */}
                  <td className="px-5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleStatus(task)}
                        className="w-4 h-4 rounded-md border-slate-300 text-blue-500 focus:ring-blue-400 focus:ring-offset-0 cursor-pointer accent-blue-500"
                      />
                    </div>
                  </td>

                  {/* Progress */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5 max-w-[130px]">
                      <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${task.progress >= 100
                            ? "bg-emerald-400"
                            : task.progress >= 60
                              ? "bg-blue-400"
                              : task.progress >= 30
                                ? "bg-amber-400"
                                : "bg-slate-300"
                            }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500 tabular-nums min-w-[30px]">
                        {task.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Detail */}
                  <td className="px-5 py-3.5 max-w-[200px]">
                    <p className="text-sm text-slate-500 truncate">
                      {task.description || <span className="text-slate-300">—</span>}
                    </p>
                  </td>

                  {/* Deadline */}
                  <td className="px-5 py-3.5">
                    {task.due_date ? (
                      <span className="text-sm text-slate-600 whitespace-nowrap font-medium">
                        {format(parseISO(task.due_date), "MMM d, yyyy")}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}