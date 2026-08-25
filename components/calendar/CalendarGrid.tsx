"use client";

import { format, startOfMonth } from "date-fns";
import { useMemo } from "react";
import { Task } from "@/types/task";
import CalendarDayCell from "./CalendarDayCell";
import { GenericCalendarGrid } from "@/components/ui/generic-calendar-grid";

interface CalendarGridProps {
    currentMonth: Date;
    tasks: Task[];
    onDateClick: (date: Date) => void;
    onTaskDateChange: (taskId: string, newDate: string) => void;
    onTaskStatusChange: (taskId: string, status: "todo" | "done") => void;
    onTaskDescriptionChange?: (taskId: string, newDescription: string) => void;
}

export default function CalendarGrid({
    currentMonth,
    tasks,
    onDateClick,
    onTaskDateChange,
    onTaskStatusChange,
    onTaskDescriptionChange,
}: CalendarGridProps) {
    const monthStart = startOfMonth(currentMonth);

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach((task) => {
            if (!task.activity_date) return;
            const dateStr = format(new Date(task.activity_date), "yyyy-MM-dd");
            if (!map.has(dateStr)) map.set(dateStr, []);
            map.get(dateStr)!.push(task);
        });
        return map;
    }, [tasks]);

    const renderDay = (day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayTasks = tasksByDate.get(dateStr) || [];

        return (
            <CalendarDayCell
                day={day}
                monthStart={monthStart}
                dayTasks={dayTasks}
                onDateClick={onDateClick}
                onTaskDateChange={onTaskDateChange}
                onTaskStatusChange={onTaskStatusChange}
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
                headerRow: "border-b border-primary/20 bg-primary",
                headerCell: "py-3 text-center text-xs font-bold text-primary-foreground uppercase tracking-wider border-r border-primary/20 last:border-0",
            }}
        />
    );
}