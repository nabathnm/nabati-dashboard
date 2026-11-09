"use client";

import { cn } from "@/lib/utils";
import type { Task, TaskCategory } from "@/types/task";
import { format, isSameDay, isSameMonth } from "date-fns";
import { Plus } from "lucide-react";
import TaskPopover from "../TaskPopOver";

interface CalendarDayCellProps {
  day: Date;
  monthStart: Date;
  dayTasks: Task[];
  onDateClick: (date: Date) => void;
  onTaskDateChange: (taskId: string, newDate: string) => void;
  onTaskCompleteChange: (taskId: string, isCompleted: boolean) => void;
  onTaskDescriptionChange?: (taskId: string, newDescription: string) => void;
  onTaskTitleChange?: (taskId: string, newTitle: string) => void;
  onTaskCategoryChange?: (taskId: string, newCategory: TaskCategory) => void;
  onTaskProgressChange?: (taskId: string, newProgress: number) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

export default function CalendarDayCell({
  day,
  monthStart,
  dayTasks,
  onDateClick,
  onTaskDateChange,
  onTaskCompleteChange,
  onTaskDescriptionChange,
  onTaskTitleChange,
  onTaskCategoryChange,
  onTaskProgressChange,
  onEditTask,
  onDeleteTask,
}: CalendarDayCellProps) {
  const today = new Date();
  const isCurrentMonth = isSameMonth(day, monthStart);
  const isTodayDate = isSameDay(day, today);

  return (
    <div
      role="gridcell"
      tabIndex={0}
      aria-label={`Tanggal ${format(day, "d MMMM yyyy")}`}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDateClick(day);
        }
      }}
      className={cn(
        "min-h-32 p-2.5 border-r border-b border-border/40 relative group transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10",
        !isCurrentMonth
          ? "bg-card/20 text-muted-foreground/40"
          : "bg-card/70 hover:bg-card/90"
      )}
      onClick={() => onDateClick(day)}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span
          className={cn(
            "text-xs font-mono font-medium size-6 flex items-center justify-center rounded-lg transition-colors",
            isTodayDate
              ? "bg-foreground text-background font-bold shadow-xs"
              : isCurrentMonth
                ? "text-muted-foreground group-hover:text-foreground"
                : "text-muted-foreground/40"
          )}
        >
          {format(day, "d")}
        </span>

        <button
          type="button"
          aria-label={`Tambah tugas pada ${format(day, "d MMMM yyyy")}`}
          title="Tambah tugas di tanggal ini"
          onClick={e => {
            e.stopPropagation();
            onDateClick(day);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity size-5 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1 mt-1 overflow-y-auto max-h-24 no-scrollbar">
        {dayTasks.map(task => (
          <TaskPopover
            key={task.id}
            task={task}
            onDateChange={onTaskDateChange}
            onCompleteChange={onTaskCompleteChange}
            onDescriptionChange={onTaskDescriptionChange}
            onTitleChange={onTaskTitleChange}
            onCategoryChange={onTaskCategoryChange}
            onProgressChange={onTaskProgressChange}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
