"use client";

import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { CalendarDays, Check, CheckCircle2, Pin, PinOff } from "lucide-react";
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
        "flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-xs",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <Pin className="size-4 text-amber-500 fill-amber-500/20" />
          <h3 className="text-sm font-bold text-foreground">Tugas Disematkan</h3>
        </div>
        {!isLoading && (
          <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-muted border border-border/70 text-xs font-mono font-semibold text-muted-foreground tabular-nums">
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
      <div className="flex-1 overflow-y-auto p-2.5">
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2.5 px-4 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60 border border-border/60 text-muted-foreground">
              <PinOff className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Belum ada tugas disematkan</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                Klik ikon pin pada tugas penting agar muncul di sini untuk akses cepat.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
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
    <li className="group rounded-xl border border-border/60 bg-muted/20 p-3 transition-all hover:bg-muted/40 hover:border-border">
      {/* Title & Actions */}
      <div className="flex min-w-0 items-start justify-between gap-2 pb-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleComplete}
            className="mt-0.5 text-muted-foreground hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
            title={isDone ? "Tandai belum selesai" : "Tandai selesai"}
          >
            {isDone ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
          </button>
          <p
            className={cn(
              "min-w-0 flex-1 text-xs font-semibold leading-snug line-clamp-2",
              isDone ? "text-muted-foreground line-through opacity-70" : "text-foreground"
            )}
            title={task.title}
          >
            {task.title}
          </p>
        </div>

        <button
          type="button"
          onClick={onUnpin}
          aria-label="Lepas sematan"
          title="Lepas sematan"
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <PinOff className="size-3.5" />
        </button>
      </div>

      {/* Category & Deadline */}
      <div className="min-w-0 space-y-2 mt-1">
        <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
          <span className="flex min-w-0 items-center gap-1.5">
            <span
              className={cn("size-1.5 shrink-0 rounded-full", cat.dot)}
            />
            <span className="truncate text-[11px] font-medium text-muted-foreground">{cat.label}</span>
          </span>

          {dueDate && (
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 text-[11px] font-medium",
                isOverdue
                  ? "text-rose-500 dark:text-rose-400"
                  : isDone
                    ? "text-emerald-500"
                    : "text-muted-foreground"
              )}
            >
              <CalendarDays className="size-3" />
              <span>{format(dueDate, "d MMM")}</span>
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/60">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                isDone ? "bg-emerald-500" : "bg-foreground"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="w-7 shrink-0 text-right text-[10px] font-mono tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>
      </div>
    </li>
  );
}
