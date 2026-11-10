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

  onDeleteTask?: (task: Task) => void | Promise<void>;
  onTogglePin?: (task: Task) => void | Promise<void>;
  isTaskPinned?: (task: Task) => boolean;
}

const GRID = "grid grid-cols-[repeat(5,minmax(0,1fr))] items-center gap-x-4 px-5";

const COLUMNS = [
  { label: "Nama Tugas", align: "justify-start text-left" },
  { label: "Kategori", align: "justify-center text-center" },
  { label: "Progress", align: "justify-center text-center" },
  { label: "Tenggat Waktu", align: "justify-center text-center" },
  { label: "Aksi", align: "justify-center text-center" },
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
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
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
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-xs">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Header */}
          <div className={cn(GRID, "py-3 bg-muted/40 text-muted-foreground border-b border-border/60")}>
            {COLUMNS.map(col => (
              <div
                key={col.label}
                className={cn(
                  "flex text-xs font-semibold uppercase tracking-wider",
                  col.align
                )}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/40">
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
                    "hover:bg-muted/30",
                    isDone && "bg-muted/15"
                  )}
                  onClick={() => onEditTask(task)}
                >
                  {/* Task Name */}
                  <div className="flex min-w-0 items-center gap-2 justify-start">
                    <span
                      className={cn(
                        "truncate text-sm font-medium",
                        isDone ? "text-muted-foreground line-through opacity-70" : "text-foreground"
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
                        className={cn("size-1.5 shrink-0 rounded-full", cat.dot)}
                      />
                      <span className="truncate">{cat.label}</span>
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="flex min-w-0 items-center justify-center gap-2">
                    <div className="h-1.5 w-full max-w-24 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isDone ? "bg-[#A3BE8C]" : "bg-[#88C0D0]"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs font-mono tabular-nums text-muted-foreground">
                      {progress}%
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="flex min-w-0 justify-center">
                    {dueDate ? (
                      <div
                        className={cn(
                          "flex max-w-full items-center gap-1.5 rounded-lg",
                          "border px-2.5 py-1 text-xs font-medium",
                          isOverdue
                            ? "border-[#BF616A]/30 bg-[#BF616A]/10 text-[#BF616A]"
                            : isDone
                              ? "border-[#A3BE8C]/30 bg-[#A3BE8C]/10 text-[#A3BE8C]"
                              : "border-border/60 bg-muted/30 text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{format(dueDate, "d MMM yyyy")}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">Tidak ada</span>
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
                      aria-label={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                      title={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                      onClick={() => onToggleComplete(task)}
                      className={cn(
                        "size-8 shrink-0 rounded-lg cursor-pointer",
                        "text-muted-foreground transition-colors",
                        "hover:bg-[#A3BE8C]/15 hover:text-[#A3BE8C]",
                        isDone && "bg-[#A3BE8C]/15 text-[#A3BE8C]"
                      )}
                    >
                      {isDone ? (
                        <Check className="size-4" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                    </Button>

                    {/* Pin */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!onTogglePin}
                      aria-label={isPinned ? "Lepas sematan" : "Sematkan tugas"}
                      title={
                        !onTogglePin
                          ? "Fitur pin belum terhubung"
                          : isPinned
                            ? "Lepas sematan"
                            : "Sematkan tugas"
                      }
                      onClick={() => onTogglePin?.(task)}
                      className={cn(
                        "size-8 shrink-0 rounded-lg cursor-pointer",
                        "text-muted-foreground transition-colors",
                        "hover:bg-[#EBCB8B]/15 hover:text-[#EBCB8B]",
                        isPinned && "bg-[#EBCB8B]/15 text-[#EBCB8B]",
                        !onTogglePin && "opacity-40"
                      )}
                    >
                      <Pin className={cn("size-3.5", isPinned && "fill-current")} />
                    </Button>

                    {/* Edit */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Ubah tugas"
                      title="Ubah tugas"
                      onClick={() => onEditTask(task)}
                      className="size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-muted/70 hover:text-foreground cursor-pointer"
                    >
                      <Pencil className="size-3.5" />
                    </Button>

                    {/* Delete */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!onDeleteTask}
                      aria-label="Hapus tugas"
                      title="Hapus tugas"
                      onClick={() => onDeleteTask?.(task)}
                      className={cn(
                        "size-8 shrink-0 rounded-lg cursor-pointer",
                        "text-muted-foreground transition-colors",
                        "hover:bg-[#BF616A]/15 hover:text-[#BF616A]",
                        !onDeleteTask && "opacity-40"
                      )}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-5 py-2.5 text-xs text-muted-foreground">
            <span>Menampilkan {tasks.length} tugas</span>
            <span className="text-[11px]">Klik baris tugas untuk melihat atau mengubah detail</span>
          </div>
        </div>
      </div>
    </div>
  );
}
