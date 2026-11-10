"use client";

import { useState } from "react";
import { format, isBefore, isValid, parseISO, startOfDay } from "date-fns";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Pencil,
  Pin,
  Trash2,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { Task, TaskCategory } from "@/types/task";
import { cn } from "@/lib/utils";
import { categoryStyles } from "@/constants/tasks/category-style";

interface TaskPopoverProps {
  task: Task;
  onCompleteChange: (taskId: string, isCompleted: boolean) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onTogglePin?: (task: Task) => void;
  // Optional backwards-compatible props (ignored in simplified view)
  onDateChange?: (taskId: string, newDate: string) => void;
  onDescriptionChange?: (taskId: string, newDescription: string) => void;
  onTitleChange?: (taskId: string, newTitle: string) => void;
  onCategoryChange?: (taskId: string, newCategory: TaskCategory) => void;
  onProgressChange?: (taskId: string, newProgress: number) => void;
}

export default function TaskPopover({
  task,
  onCompleteChange,
  onEditTask,
  onDeleteTask,
  onTogglePin,
}: TaskPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isDone = task.is_completed;
  const isPinned = task.is_pinned;
  const category = categoryStyles[task.category];

  const parsedDue = task.due_date ? parseISO(task.due_date) : null;
  const isOverdue =
    Boolean(parsedDue && isValid(parsedDue) && !isDone && isBefore(parsedDue, startOfDay(new Date())));

  const cleanDescription = task.description
    ? task.description.replace(/\n*<!--gcal:[^>]+-->/g, "").trim()
    : "";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            onClick={event => event.stopPropagation()}
            className={cn(
              "flex w-full min-w-0 items-center gap-1.5 rounded-lg",
              "border border-transparent border-l-[3px]",
              "px-2 py-1.5 text-left text-xs font-medium",
              "transition-all duration-150 cursor-pointer",
              "hover:brightness-105 hover:shadow-xs",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              category?.bg,
              category?.color,
              isDone && "opacity-60"
            )}
            title={task.title}
          >
            {isDone ? (
              <CheckCircle2 className="size-3.5 shrink-0 text-[#A3BE8C]" />
            ) : (
              <Circle className="size-3.5 shrink-0 opacity-60" />
            )}

            <span className={cn("truncate flex-1 min-w-0", isDone && "line-through opacity-70")}>
              {task.title}
            </span>

            {isPinned && (
              <Pin className="size-3 shrink-0 text-[#EBCB8B] fill-[#EBCB8B]/30" />
            )}
          </button>
        }
      />

      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className={cn(
          "w-80 overflow-hidden rounded-2xl p-4",
          "border border-border/80 bg-card text-card-foreground",
          "shadow-2xl shadow-black/30 backdrop-blur-md"
        )}
        onClick={event => event.stopPropagation()}
      >
        {/* Top bar: Category badge & Pin/Delete actions */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/50">
          {category ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
                category.bg,
                category.color
              )}
            >
              <span className={cn("size-2 rounded-full", category.dot)} />
              <span>{category.label}</span>
            </span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Tugas</span>
          )}

          <div className="flex items-center gap-1">
            {/* Pin task button */}
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(task)}
                aria-label={isPinned ? "Lepas sematan tugas" : "Sematkan tugas ini"}
                title={isPinned ? "Lepas sematan" : "Sematkan tugas"}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-colors cursor-pointer",
                  isPinned
                    ? "bg-[#EBCB8B]/15 text-[#EBCB8B] hover:bg-[#EBCB8B]/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Pin className={cn("size-3.5", isPinned && "fill-current")} />
              </button>
            )}

            {/* Delete button */}
            {onDeleteTask && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDeleteTask(task);
                }}
                aria-label="Hapus tugas"
                title="Hapus tugas"
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#BF616A]/15 hover:text-[#BF616A] transition-colors cursor-pointer"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Task Title & Description (Read-Only) */}
        <div className="py-3 space-y-1.5">
          <h4
            className={cn(
              "text-sm font-bold text-foreground leading-snug line-clamp-2",
              isDone && "line-through text-muted-foreground opacity-80"
            )}
          >
            {task.title}
          </h4>

          {cleanDescription ? (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {cleanDescription}
            </p>
          ) : null}

          {/* Meta row: Deadline & Progress */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {parsedDue && isValid(parsedDue) && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium text-[11px]",
                  isOverdue
                    ? "bg-[#BF616A]/10 text-[#BF616A] font-semibold"
                    : "bg-muted/60 text-muted-foreground"
                )}
              >
                <CalendarDays className="size-3 shrink-0" />
                <span>
                  {format(parsedDue, "d MMM yyyy")}
                  {isOverdue ? " (Terlewat)" : ""}
                </span>
              </span>
            )}

            <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              {task.progress ?? 0}% selesai
            </span>
          </div>
        </div>

        {/* Primary Interactive Control: Toggle Mark Done */}
        <div className="pt-2 pb-3">
          <button
            type="button"
            onClick={() => onCompleteChange(task.id, !isDone)}
            className={cn(
              "flex items-center gap-2.5 w-full rounded-xl border p-2.5 transition-all cursor-pointer text-left",
              isDone
                ? "border-[#A3BE8C]/40 bg-[#A3BE8C]/15 text-[#A3BE8C] dark:text-[#A3BE8C]"
                : "border-border/70 bg-muted/30 text-foreground hover:bg-muted/60 hover:border-border"
            )}
          >
            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                isDone
                  ? "border-[#A3BE8C] bg-[#A3BE8C] text-[#2E3440]"
                  : "border-muted-foreground/40 bg-background"
              )}
            >
              {isDone && <Check className="size-3.5 stroke-[3]" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-none">
                {isDone ? "Tugas Sudah Selesai" : "Tandai Sebagai Selesai"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isDone ? "Klik untuk membatalkan status selesai" : "Klik untuk menyelesaikan tugas ini"}
              </p>
            </div>
          </button>
        </div>

        {/* Footer: Direct to Edit Modal */}
        <div className="pt-2 border-t border-border/50">
          <Button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEditTask?.(task);
            }}
            className="w-full h-8.5 rounded-xl bg-[#2E3440] text-[#ECEFF4] hover:bg-[#3B4252] dark:bg-[#88C0D0] dark:text-[#2E3440] dark:hover:bg-[#8FBCBB] font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Pencil className="mr-1.5 size-3.5" />
            <span>Ubah Rincian di Modal</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
