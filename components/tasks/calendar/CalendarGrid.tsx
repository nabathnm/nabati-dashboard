"use client";

import { GenericCalendarGrid } from "@/components/common/generic-calendar-grid";
import type { Task } from "@/types/task";
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
}

export default function CalendarGrid({
  currentMonth,
  tasks,
  onDateClick,
  onTaskDateChange,
  onTaskCompleteChange,
  onTaskDescriptionChange,
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
      />
    );
  };

  return (
    <GenericCalendarGrid
      currentMonth={currentMonth}
      renderDay={renderDay}
      weekStartsOn={0}
      classNames={{
        root: "border border-border/50 rounded-xl overflow-hidden bg-card/10",
        headerRow: "border-b ",
        headerCell:
          "py-3 text-center text-xs font-bold text-primary-foreground uppercase tracking-wider border-r border-primary/20 last:border-0",
      }}
    />
  );
}
