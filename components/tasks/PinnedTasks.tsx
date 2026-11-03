"use client";

import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { CalendarDays, PinOff } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_CONFIG } from "@/constants/tasks/category-config";
import { getErrorMessage, usePinnedTasks } from "@/hooks/use-task";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface PinnedTasksProps {
  className?: string;
}

export default function PinnedTasks({ className }: PinnedTasksProps) {
  const { tasks, isLoading, error, unpin, toggleComplete } = usePinnedTasks();
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const errorMessage = error ?? actionError;

  return (
    <aside
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold">Pinned Tasks</h3>
        </div>
        {!isLoading && (
          <span className="flex h-6 w-6 text-primary items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-semibold tabular-nums">
            {tasks.length}
          </span>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className="px-4 pt-3 text-xs text-rose-500">
          {errorMessage}
        </p>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <PinOff className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No pinned tasks</p>
            <p className="text-xs text-muted-foreground">
              Pin a task from the list to keep it here.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {tasks.map(task => (
              <PinnedItem
                key={task.id}
                task={task}
                onToggleComplete={() =>
                  run(() => toggleComplete(task.id, !task.is_completed))
                }
                onUnpin={() => run(() => unpin(task.id))}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

/* =========================================================
   ITEM
========================================================= */

interface PinnedItemProps {
  task: Task;
  onToggleComplete: () => void;
  onUnpin: () => void;
}

function PinnedItem({
  task,
  onToggleComplete,
  onUnpin,
}: PinnedItemProps) {
  const cat = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.Lainnya;
  const isDone = task.is_completed;
  const dueDate = task.due_date ? parseISO(task.due_date) : null;
  const isOverdue =
    !!dueDate && !isDone && isBefore(dueDate, startOfDay(new Date()));
  const progress = Math.min(100, Math.max(0, task.progress));

  return (
    <li className="group rounded-lg p-2 transition-colors hover:bg-muted/40">
      {/* Title & Actions */}
      <div className="flex min-w-0 items-center justify-between gap-2 pb-2">
        <p
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-medium",
            isDone && "text-muted-foreground line-through",
          )}
          title={task.title}
        >
          {task.title}
        </p>

        <button
          type="button"
          onClick={onUnpin}
          aria-label="Unpin task"
          title="Unpin task"
          className={cn(
            "shrink-0 rounded-md p-1",
            "text-muted-foreground transition-colors",
            "hover:bg-[#EBCB8B]/15 hover:text-[#EBCB8B]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <PinOff className="size-3.5" />
        </button>
      </div>

      {/* Category & Deadline */}
      <div className="min-w-0 space-y-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 flex-1 items-center gap-1">
            <span
              className={cn("size-1.5 shrink-0 rounded-full", cat.dot)}
            />
            <span className="truncate">{cat.label}</span>
          </span>

          {dueDate && (
            <span
              className={cn(
                "flex shrink-0 items-center gap-1",
                isOverdue && "text-[#BF616A]",
              )}
            >
              <CalendarDays className="size-3" />
              <span>{format(dueDate, "d MMM")}</span>
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#88C0D0] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>
      </div>
    </li>
  );
}