"use client";

import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { format, isSameDay, isSameMonth } from "date-fns";
import TaskPopover from "../TaskPopOver";

interface CalendarDayCellProps {
  day: Date;
  monthStart: Date;
  dayTasks: Task[];
  onDateClick: (date: Date) => void;
  onTaskDateChange: (taskId: string, newDate: string) => void;
  onTaskCompleteChange: (taskId: string, isCompleted: boolean) => void;
  onTaskDescriptionChange?: (taskId: string, newDescription: string) => void;
}

export default function CalendarDayCell({
  day,
  monthStart,
  dayTasks,
  onDateClick,
  onTaskDateChange,
  onTaskCompleteChange,
  onTaskDescriptionChange,
}: CalendarDayCellProps) {
  const today = new Date();

  return (
    <div
      className={cn(
        "min-h-32.5 p-2 border-r border-b border-border/50 relative group transition-colors cursor-pointer",
        !isSameMonth(day, monthStart)
          ? "bg-card/30 text-foreground/50"
          : "bg-card hover:bg-card/30"
      )}
      onClick={() => onDateClick(day)}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={cn(
            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
            isSameDay(day, today) ? "bg-primary text-primary-foreground" : ""
          )}
        >
          {format(day, "d")}
        </span>
      </div>

      <div className="space-y-1 mt-1 overflow-y-auto max-h-25 no-scrollbar">
        {dayTasks.map(task => (
          <TaskPopover
            key={task.id}
            task={task}
            onDateChange={onTaskDateChange}
            onCompleteChange={onTaskCompleteChange}
            onDescriptionChange={onTaskDescriptionChange}
          />
        ))}
      </div>
    </div>
  );
}
