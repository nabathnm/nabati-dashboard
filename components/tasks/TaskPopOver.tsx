"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileText,
  MoreVertical,
  Pencil,
  Percent,
  Tag,
  Trash2,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  // Sync state dengan perubahan prop task
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
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="size-3.5 shrink-0 opacity-60" />
            )}

            <span className={cn("truncate", isDone && "line-through opacity-70")}>
              {task.title}
            </span>
          </button>
        }
      />

      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className={cn(
          "w-84 sm:w-88 overflow-hidden rounded-2xl p-0",
          "border border-border/80 bg-card text-card-foreground",
          "shadow-2xl shadow-black/30 backdrop-blur-md"
        )}
        onClick={event => event.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Detail Tugas
            </span>
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                aria-label="Menu opsi tugas"
                title="Menu opsi tugas"
              >
                <MoreVertical className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="w-44 rounded-xl border-border/80 bg-popover/95 backdrop-blur-md p-1 shadow-xl z-[60]"
              >
                {onEditTask && (
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      onEditTask(task);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer hover:bg-muted text-foreground"
                  >
                    <Pencil className="size-3.5 text-muted-foreground" />
                    <span>Ubah Lengkap</span>
                  </DropdownMenuItem>
                )}
                {onDeleteTask && (
                  <>
                    <DropdownMenuSeparator className="my-1 bg-border/50" />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        setIsOpen(false);
                        onDeleteTask(task);
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-500"
                    >
                      <Trash2 className="size-3.5 text-rose-500" />
                      <span>Hapus Tugas</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title & Badges */}
        <div className="border-b border-border/60 bg-muted/20 p-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Judul Tugas
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
              placeholder="Tulis judul tugas..."
              className={cn(
                "h-9 rounded-xl px-3 text-xs font-semibold leading-snug",
                "border-border/70 bg-background/80 text-foreground",
                "hover:border-border focus-visible:border-foreground",
                "focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0",
                isDone && "line-through text-muted-foreground"
              )}
            />
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5",
                "text-[10px] font-medium",
                isDone
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-semibold"
                  : "border-border/70 bg-muted/40 text-muted-foreground"
              )}
            >
              {isDone ? "Selesai" : `${progress}% Dikerjakan`}
            </span>

            {category && (
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5",
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
          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CalendarIcon className="size-3.5" />
              Tenggat
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
                "h-8.5 min-w-0 rounded-lg px-2 text-xs",
                "border-border/70 bg-background/60 text-foreground",
                "hover:border-border focus-visible:border-foreground",
                "focus-visible:ring-1 focus-visible:ring-ring"
              )}
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="size-3.5" />
              Status
            </span>

            <label
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg",
                "border border-border/60 bg-muted/20 px-2.5 py-1.5",
                "transition-colors hover:bg-muted/50"
              )}
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={event => onCompleteChange(task.id, event.target.checked)}
                className="size-4 cursor-pointer rounded accent-foreground"
              />

              <span
                className={cn(
                  "text-xs font-medium",
                  isDone ? "text-emerald-500 font-semibold" : "text-foreground"
                )}
              >
                {isDone ? "Selesai" : "Tandai sudah selesai"}
              </span>
            </label>
          </div>

          {/* Category Dropdown using Shadcn DropdownMenu */}
          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Tag className="size-3.5" />
              Kategori
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex h-8.5 w-full items-center justify-between rounded-lg px-2.5 text-xs font-medium transition-all cursor-pointer",
                  "border border-border/70 bg-background/60 text-foreground",
                  "hover:border-border hover:bg-muted/40",
                  "focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-ring"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {category && (
                    <span className={cn("size-2 shrink-0 rounded-full", category.dot)} />
                  )}
                  <span className="truncate">{category?.label ?? "Pilih Kategori"}</span>
                </div>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={4}
                className="w-48 rounded-xl border-border/80 bg-popover/95 backdrop-blur-md p-1.5 shadow-xl z-[60]"
              >
                {categoryOptions.map(cat => {
                  const isSelected = task.category === cat.value;
                  return (
                    <DropdownMenuItem
                      key={cat.value}
                      onClick={() => {
                        if (onCategoryChange && cat.value !== task.category) {
                          onCategoryChange(task.id, cat.value as TaskCategory);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-colors",
                        isSelected
                          ? "bg-muted font-semibold text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 shrink-0 rounded-full", cat.dotColor)} />
                        <span>{cat.label}</span>
                      </div>
                      {isSelected && <Check className="size-3.5 text-foreground" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Progress */}
          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Percent className="size-3.5" />
              Kemajuan
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
                className="h-1.5 w-full cursor-pointer accent-foreground bg-muted rounded-lg"
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
                  className="h-7 w-12 px-1 text-center text-xs font-semibold tabular-nums border-border/70 bg-background/60"
                />
                <span className="ml-1 text-[11px] text-muted-foreground font-medium">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-border/60 pt-3">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FileText className="size-3.5" />
              Catatan & Rincian
            </label>

            <textarea
              key={`${task.id}-${task.updated_at}`}
              className={cn(
                "min-h-[72px] w-full resize-y rounded-xl p-2.5",
                "border border-border/70 bg-background/50",
                "text-xs leading-relaxed text-foreground",
                "placeholder:text-muted-foreground/60",
                "transition-colors",
                "hover:border-border",
                "focus:border-foreground focus:outline-none",
                "focus:ring-1 focus:ring-ring"
              )}
              placeholder="Tambahkan catatan atau rincian tugas..."
              defaultValue={task.description ?? ""}
              onBlur={event => {
                const newDescription = event.target.value;

                if (newDescription !== (task.description ?? "") && onDescriptionChange) {
                  onDescriptionChange(task.id, newDescription);
                }
              }}
            />

            <p className="mt-1 text-[10px] text-muted-foreground/70">
              Perubahan disimpan otomatis saat meninggalkan kolom input.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/30 p-3">
          {onEditTask && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                onEditTask(task);
              }}
              className="h-8 flex-1 gap-1.5 text-xs font-medium rounded-xl border-border/70 hover:bg-muted cursor-pointer"
            >
              <Pencil className="size-3.5" />
              Ubah Lengkap
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
              className="h-8 flex-1 gap-1.5 text-xs font-medium rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              Hapus Tugas
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
