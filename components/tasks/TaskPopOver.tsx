"use client";

import { format, isValid, parseISO } from "date-fns";
import { CheckCircle2, Circle, Calendar as CalendarIcon, FileText } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { categoryStyles } from "@/constants/tasks/category-style";

interface TaskPopoverProps {
  task: Task;
  /** newDate berformat "yyyy-MM-dd" */
  onDateChange: (taskId: string, newDate: string) => void;
  onCompleteChange: (taskId: string, isCompleted: boolean) => void;
  onDescriptionChange?: (taskId: string, newDescription: string) => void;
}

export default function TaskPopover({
  task,
  onDateChange,
  onCompleteChange,
  onDescriptionChange,
}: TaskPopoverProps) {
  const isDone = task.is_completed;

  const parsedDue = task.due_date ? parseISO(task.due_date) : null;

  const dueValue = parsedDue && isValid(parsedDue) ? format(parsedDue, "yyyy-MM-dd") : "";

  const category = categoryStyles[task.category];

  return (
    <Popover>
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
          "w-80 overflow-hidden rounded-xl p-0",
          "border border-border/70 bg-popover text-popover-foreground",
          "shadow-xl shadow-black/20"
        )}
        onClick={event => event.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border/60 bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-[#88C0D0]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Task Details
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            {isDone ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#A3BE8C]" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#88C0D0]" />
            )}

            <h4
              className={cn(
                "text-base font-semibold leading-snug text-foreground",
                isDone && "text-muted-foreground line-through"
              )}
            >
              {task.title}
            </h4>
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
              {isDone ? "Completed" : "In progress"}
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
        <div className="space-y-4 p-4">
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
                // Kalender memerlukan tanggal; jangan kirim nilai kosong.
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
                "border border-border/50 bg-muted/20 px-2.5 py-2",
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
              <Circle className="h-3.5 w-3.5" />
              Category
            </span>

            <div className="min-w-0">
              {category ? (
                <span
                  className={cn(
                    "inline-flex max-w-full items-center gap-1.5",
                    "rounded-lg border px-2.5 py-1",
                    "text-xs font-medium",
                    category.bg,
                    category.color
                  )}
                >
                  <span
                    className={cn("h-1.5 w-1.5 shrink-0 rounded-full", category.dot)}
                  />
                  <span className="truncate">{category.label}</span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">{task.category}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-border/60 pt-3">
            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-[#88C0D0]" />
              Description
            </label>

            <textarea
              key={`${task.id}-${task.updated_at}`}
              className={cn(
                "min-h-[88px] w-full resize-y rounded-lg p-2.5",
                "border border-border/60 bg-background/50",
                "text-sm leading-relaxed text-foreground",
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

            <p className="mt-1.5 text-[10px] text-muted-foreground/70">
              Changes are saved when you leave this field.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
