"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileText,
  Pencil,
  Percent,
  Tag,
  Trash2,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Task, TaskCategory } from "@/types/task";
import { cn } from "@/lib/utils";
import { categoryOptions, categoryStyles } from "@/constants/tasks/category-style";

interface TaskPopoverProps {
  task: Task;
  /** newDate berformat "yyyy-MM-dd" */
  onDateChange: (taskId: string, newDate: string) => void;
  onCompleteChange: (taskId: string, isCompleted: boolean) => void;
  onDescriptionChange?: (taskId: string, newDescription: string) => void;
  onTitleChange?: (taskId: string, newTitle: string) => void;
  onCategoryChange?: (taskId: string, newCategory: TaskCategory) => void;
  onProgressChange?: (taskId: string, newProgress: number) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

export default function TaskPopover({
  task,
  onDateChange,
  onCompleteChange,
  onDescriptionChange,
  onTitleChange,
  onCategoryChange,
  onProgressChange,
  onEditTask,
  onDeleteTask,
}: TaskPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prevTask, setPrevTask] = useState(task);
  const [title, setTitle] = useState(task.title);
  const [progress, setProgress] = useState(task.progress ?? 0);

  // Sync state with task prop changes during render (per React guidelines)
  if (task !== prevTask) {
    setPrevTask(task);
    setTitle(task.title);
    setProgress(task.progress ?? 0);
  }

  const isDone = task.is_completed;
  const parsedDue = task.due_date ? parseISO(task.due_date) : null;
  const dueValue = parsedDue && isValid(parsedDue) ? format(parsedDue, "yyyy-MM-dd") : "";
  const category = categoryStyles[task.category];

  const handleTitleCommit = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) {
      onTitleChange?.(task.id, trimmed);
    } else if (!trimmed) {
      setTitle(task.title);
    }
  };

  const handleProgressCommit = (val: number) => {
    const bounded = Math.max(0, Math.min(100, Math.round(val)));
    setProgress(bounded);
    if (bounded !== (task.progress ?? 0)) {
      onProgressChange?.(task.id, bounded);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            onClick={event => event.stopPropagation()}
            className={cn(
              "flex w-full min-w-0 items-center gap-2 rounded-md",
              "border border-transparent border-l-[3px]",
              "px-2 py-1.5 text-left text-xs font-medium",
              "transition-all duration-150",
              "hover:brightness-110 hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[#88C0D0]/60",
              category?.bg,
              category?.color,
              isDone && "opacity-60"
            )}
            title={task.title}
          >
            {isDone ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}

            <span className={cn("truncate", isDone && "line-through")}>{task.title}</span>
          </button>
        }
      />

      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className={cn(
          "w-88 overflow-hidden rounded-xl p-0",
          "border border-border/70 bg-popover text-popover-foreground",
          "shadow-xl shadow-black/20"
        )}
        onClick={event => event.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 text-[#88C0D0]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Task Details
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onEditTask && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsOpen(false);
                  onEditTask(task);
                }}
                className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Edit di modal lengkap"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}

            {onDeleteTask && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsOpen(false);
                  onDeleteTask(task);
                }}
                className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                title="Hapus event/task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Title & Badges */}
        <div className="border-b border-border/60 bg-muted/20 p-4">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Title
          </label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              value={title}
              onChange={event => setTitle(event.target.value)}
              onBlur={handleTitleCommit}
              onKeyDown={event => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
              }}
              placeholder="Task title..."
              className={cn(
                "h-8.5 rounded-lg px-2.5 text-sm font-semibold leading-snug",
                "border-border/60 bg-background/80 text-foreground",
                "hover:border-[#88C0D0]/50 focus-visible:border-[#88C0D0]",
                "focus-visible:ring-2 focus-visible:ring-[#88C0D0]/20 focus-visible:ring-offset-0",
                isDone && "line-through text-muted-foreground"
              )}
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5",
                "text-[10px] font-medium",
                isDone
                  ? "border-[#A3BE8C]/30 bg-[#A3BE8C]/10 text-[#A3BE8C]"
                  : "border-[#88C0D0]/30 bg-[#88C0D0]/10 text-[#88C0D0]"
              )}
            >
              {isDone ? "Completed" : `${progress}% In progress`}
            </span>

            {category && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5",
                  "text-[10px] font-medium",
                  category.bg,
                  category.color
                )}
              >
                {category.label}
              </span>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3.5 p-4">
          {/* Deadline */}
          <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" />
              Deadline
            </span>

            <Input
              type="date"
              value={dueValue}
              onChange={event => {
                if (event.target.value) {
                  onDateChange(task.id, event.target.value);
                }
              }}
              className={cn(
                "h-8 min-w-0 rounded-lg px-2 text-xs",
                "border-border/60 bg-background/60",
                "hover:border-[#88C0D0]/50",
                "focus-visible:border-[#88C0D0]",
                "focus-visible:ring-2 focus-visible:ring-[#88C0D0]/20",
                "focus-visible:ring-offset-0"
              )}
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Status
            </span>

            <label
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg",
                "border border-border/50 bg-muted/20 px-2.5 py-1.5",
                "transition-colors hover:bg-muted/50"
              )}
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={event => onCompleteChange(task.id, event.target.checked)}
                className={cn(
                  "h-4 w-4 cursor-pointer rounded",
                  "accent-[#A3BE8C]",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[#A3BE8C]/50"
                )}
              />

              <span
                className={cn(
                  "text-xs font-medium",
                  isDone ? "text-[#A3BE8C]" : "text-foreground"
                )}
              >
                {isDone ? "Completed" : "Mark as completed"}
              </span>
            </label>
          </div>

          {/* Category */}
          <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Category
            </span>

            <div className="relative flex items-center min-w-0">
              {category && (
                <span
                  className={cn(
                    "pointer-events-none absolute left-2.5 h-2 w-2 rounded-full",
                    category.dot
                  )}
                />
              )}
              <select
                value={task.category}
                onChange={event => {
                  const val = event.target.value as TaskCategory;
                  if (val && onCategoryChange && val !== task.category) {
                    onCategoryChange(task.id, val);
                  }
                }}
                className={cn(
                  "h-8 w-full appearance-none rounded-lg pl-7 pr-8 text-xs font-medium cursor-pointer",
                  "border border-border/60 bg-background/60 text-foreground",
                  "hover:border-[#88C0D0]/50 transition-colors",
                  "focus-visible:border-[#88C0D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#88C0D0]/20"
                )}
              >
                {categoryOptions.map(cat => (
                  <option
                    key={cat.value}
                    value={cat.value}
                    className="bg-popover text-popover-foreground py-1 text-xs"
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Progress */}
          <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Percent className="h-3.5 w-3.5" />
              Progress
            </span>

            <div className="flex items-center gap-2.5 min-w-0">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={e => setProgress(Number(e.target.value))}
                onMouseUp={() => handleProgressCommit(progress)}
                onTouchEnd={() => handleProgressCommit(progress)}
                onKeyUp={e => {
                  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                    handleProgressCommit(progress);
                  }
                }}
                className="h-1.5 w-full cursor-pointer accent-[#88C0D0] bg-muted rounded-lg"
              />
              <div className="flex items-center shrink-0">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={e => setProgress(Number(e.target.value))}
                  onBlur={() => handleProgressCommit(progress)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="h-7 w-12 px-1 text-center text-xs font-semibold tabular-nums border-border/60 bg-background/60"
                />
                <span className="ml-1 text-[11px] text-muted-foreground font-medium">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-border/60 pt-3">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-[#88C0D0]" />
              Description
            </label>

            <textarea
              key={`${task.id}-${task.updated_at}`}
              className={cn(
                "min-h-[72px] w-full resize-y rounded-lg p-2.5",
                "border border-border/60 bg-background/50",
                "text-xs leading-relaxed text-foreground",
                "placeholder:text-muted-foreground/60",
                "transition-colors",
                "hover:border-[#88C0D0]/50",
                "focus:border-[#88C0D0] focus:outline-none",
                "focus:ring-2 focus:ring-[#88C0D0]/20"
              )}
              placeholder="Add task details..."
              defaultValue={task.description ?? ""}
              onBlur={event => {
                const newDescription = event.target.value;

                if (newDescription !== (task.description ?? "") && onDescriptionChange) {
                  onDescriptionChange(task.id, newDescription);
                }
              }}
            />

            <p className="mt-1 text-[10px] text-muted-foreground/70">
              Perubahan disimpan otomatis setelah meninggalkan bidang.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/20 p-3">
          {onEditTask && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                onEditTask(task);
              }}
              className="h-8 flex-1 gap-1.5 text-xs font-medium"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Lengkap
            </Button>
          )}

          {onDeleteTask && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                onDeleteTask(task);
              }}
              className="h-8 flex-1 gap-1.5 text-xs font-medium bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-200 dark:border-rose-900/50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus Event
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
