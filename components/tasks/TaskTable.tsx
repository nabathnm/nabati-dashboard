"use client";

import { CalendarDays, Check, CheckCircle2, Pencil, Pin, Trash2 } from "lucide-react";
import { format, parseISO, isBefore, startOfDay } from "date-fns";

import type { Task } from "@/types/task";
import EmptyState from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG } from "@/constants/tasks/category-config";

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  onToggleComplete: (task: Task) => void | Promise<void>;
  onEditTask: (task: Task) => void;
  onCreateTask: () => void;

  // Opsional: hubungkan setelah fungsi tersedia
  onDeleteTask?: (task: Task) => void | Promise<void>;
  onTogglePin?: (task: Task) => void | Promise<void>;
  isTaskPinned?: (task: Task) => boolean;
}

/* 5 kolom dengan lebar sama. minmax(0,1fr) mencegah isi panjang
   melebarkan kolom. Dipakai bersama oleh header dan setiap baris. */
const GRID = "grid grid-cols-[repeat(5,minmax(0,1fr))] items-center gap-x-4 px-5";

const COLUMNS = [
  { label: "Task Name", align: "justify-start text-left" },
  { label: "Category", align: "justify-center text-center" },
  { label: "Progress", align: "justify-center text-center" },
  { label: "Deadline", align: "justify-center text-center" },
  { label: "Action", align: "justify-center text-center" },
];

export default function TaskTable({
  tasks,
  isLoading,
  onToggleComplete,
  onEditTask,
  onCreateTask,
  onDeleteTask,
  onTogglePin,
  isTaskPinned,
}: TaskTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="divide-y divide-border/50">
          <div className="bg-muted/40 px-5 py-3">
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

  if (tasks.length === 0) {
    return <EmptyState onCreateTask={onCreateTask} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Header */}
          <div className={cn(GRID, "py-4 bg-primary text-primary-foreground text-xs ")}>
            {COLUMNS.map(col => (
              <div
                key={col.label}
                className={cn(
                  "flex text-xs font-semibold uppercase tracking-wide",
                  col.align
                )}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/50">
            {tasks.map(task => {
              const cat = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.Lainnya;

              const isDone = task.is_completed;
              const dueDate = task.due_date ? parseISO(task.due_date) : null;

              const isOverdue =
                !!dueDate && !isDone && isBefore(dueDate, startOfDay(new Date()));

              const isPinned = isTaskPinned?.(task) ?? false;
              const progress = Math.min(100, Math.max(0, task.progress));

              return (
                <div
                  key={task.id}
                  className={cn(
                    GRID,
                    "group cursor-pointer py-3.5 transition-colors",
                    "hover:bg-muted/10",
                    isDone && "bg-muted/10"
                  )}
                  onClick={() => onEditTask(task)}
                >
                  {/* Task Name */}
                  <div className="flex min-w-0 justify-start">
                    <span
                      className={cn(
                        "truncate text-sm font-medium",
                        isDone ? "text-muted-foreground line-through" : "text-foreground"
                      )}
                      title={task.title}
                    >
                      {task.title}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="flex min-w-0 justify-center">
                    <span
                      className={cn(
                        "inline-flex max-w-full items-center gap-1.5",
                        "rounded-lg border px-2.5 py-1 text-xs font-medium",
                        cat.bg,
                        cat.color
                      )}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cat.dot)}
                      />
                      <span className="truncate">{cat.label}</span>
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="flex min-w-0 items-center justify-center">
                    <div className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[#88C0D0] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {progress}%
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="flex min-w-0 justify-center">
                    {dueDate ? (
                      <div
                        className={cn(
                          "flex max-w-full items-center gap-1.5 rounded-md",
                          "border px-2 py-1 text-xs",
                          isOverdue
                            ? "border-[#BF616A]/30 bg-[#BF616A]/10 text-[#BF616A]"
                            : isDone
                              ? "border-[#A3BE8C]/30 bg-[#A3BE8C]/10 text-[#A3BE8C]"
                              : "border-border/60 bg-muted/40 text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{format(dueDate, "MMM d, yyyy")}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground/60">—</span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div
                    className="flex items-center justify-center gap-1"
                    onClick={event => event.stopPropagation()}
                  >
                    {/* Complete */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
                      title={isDone ? "Mark as incomplete" : "Mark as complete"}
                      onClick={() => onToggleComplete(task)}
                      className={cn(
                        "h-8 w-8 shrink-0 rounded-lg",
                        "text-muted-foreground transition-colors",
                        "hover:bg-[#A3BE8C]/15 hover:text-[#A3BE8C]",
                        isDone && "bg-[#A3BE8C]/10 text-[#A3BE8C]"
                      )}
                    >
                      {isDone ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Pin */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!onTogglePin}
                      aria-label={isPinned ? "Unpin task" : "Pin task"}
                      title={
                        !onTogglePin
                          ? "Pin feature not connected"
                          : isPinned
                            ? "Unpin task"
                            : "Pin task"
                      }
                      onClick={() => onTogglePin?.(task)}
                      className={cn(
                        "h-8 w-8 shrink-0 rounded-lg",
                        "text-muted-foreground transition-colors",
                        "hover:bg-[#EBCB8B]/15 hover:text-[#EBCB8B]",
                        isPinned && "bg-[#EBCB8B]/10 text-[#EBCB8B]",
                        !onTogglePin && "opacity-40"
                      )}
                    >
                      <Pin className={cn("h-4 w-4", isPinned && "fill-current")} />
                    </Button>

                    {/* Edit */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Edit task"
                      title="Edit task"
                      onClick={() => onEditTask(task)}
                      className={cn(
                        "h-8 w-8 shrink-0 rounded-lg",
                        "text-muted-foreground transition-colors",
                        "hover:bg-[#88C0D0]/15 hover:text-[#88C0D0]"
                      )}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!onDeleteTask}
                      aria-label="Delete task"
                      title={
                        onDeleteTask ? "Delete task" : "Delete feature not connected"
                      }
                      onClick={() => onDeleteTask?.(task)}
                      className={cn(
                        "h-8 w-8 shrink-0 rounded-lg",
                        "text-muted-foreground transition-colors",
                        "hover:bg-[#BF616A]/15 hover:text-[#BF616A]",
                        !onDeleteTask && "opacity-40"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
