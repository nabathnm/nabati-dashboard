"use client";

import { GenericCalendarGrid } from "@/components/common/generic-calendar-grid";
import type { Task, TaskCategory } from "@/types/task";
import { format, isValid, parseISO, startOfMonth } from "date-fns";
import { useMemo } from "react";
import CalendarDayCell from "./CalendarDayCell";

interface CalendarGridProps {
  currentMonth: Date;
  tasks: Task[];
  onDateClick: (date: Date) => void;
  /** newDate berformat "yyyy-MM-dd" */
  onTaskDateChange: (taskId: string, newDate: string) => void;
  onTaskCompleteChange: (taskId: string, isCompleted: boolean) => void;
  onTaskDescriptionChange?: (taskId: string, newDescription: string) => void;
  onTaskTitleChange?: (taskId: string, newTitle: string) => void;
  onTaskCategoryChange?: (taskId: string, newCategory: TaskCategory) => void;
  onTaskProgressChange?: (taskId: string, newProgress: number) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

export default function CalendarGrid({
  currentMonth,
  tasks,
  onDateClick,
  onTaskDateChange,
  onTaskCompleteChange,
  onTaskDescriptionChange,
  onTaskTitleChange,
  onTaskCategoryChange,
  onTaskProgressChange,
  onEditTask,
  onDeleteTask,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);

  // Kelompokkan task berdasarkan tanggal tenggat (due_date).
  // Task tanpa tenggat tidak ditampilkan di kalender.
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();

    for (const task of tasks) {
      if (!task?.due_date) continue;

      const due = parseISO(task.due_date);
      if (!isValid(due)) continue;

      const dateStr = format(due, "yyyy-MM-dd");
      const list = map.get(dateStr);
      if (list) {
        list.push(task);
      } else {
        map.set(dateStr, [task]);
      }
    }

    return map;
  }, [tasks]);

  const renderDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayTasks = tasksByDate.get(dateStr) ?? [];

    return (
      <CalendarDayCell
        day={day}
        monthStart={monthStart}
        dayTasks={dayTasks}
        onDateClick={onDateClick}
        onTaskDateChange={onTaskDateChange}
        onTaskCompleteChange={onTaskCompleteChange}
        onTaskDescriptionChange={onTaskDescriptionChange}
        onTaskTitleChange={onTaskTitleChange}
        onTaskCategoryChange={onTaskCategoryChange}
        onTaskProgressChange={onTaskProgressChange}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
    );
  };

  return (
    <GenericCalendarGrid
      currentMonth={currentMonth}
      renderDay={renderDay}
      weekStartsOn={0}
      classNames={{
        root: "border border-border/70 rounded-2xl overflow-hidden bg-card/40 shadow-xs",
        headerRow: "border-b border-border/60 bg-muted/40",
        headerCell:
          "py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/40 last:border-0",
      }}
    />
  );
}
