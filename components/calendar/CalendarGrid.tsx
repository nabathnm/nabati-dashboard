"use client";

import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameDay,
    addDays,
    format,
} from "date-fns";
import { useMemo } from "react";
import { Task } from "@/types/task";
import { HeaderRow } from "@/components/layout/HeaderRow";
import CalendarDayCell from "./CalendarDayCell";

interface CalendarGridProps {
    currentMonth: Date;
    tasks: Task[];
    onDateClick: (date: Date) => void;
    onTaskDateChange: (taskId: string, newDate: string) => void;
    onTaskStatusChange: (taskId: string, status: "todo" | "done") => void;
    onTaskDescriptionChange?: (taskId: string, newDescription: string) => void;
}

const LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({
    currentMonth,
    tasks,
    onDateClick,
    onTaskDateChange,
    onTaskStatusChange,
    onTaskDescriptionChange,
}: CalendarGridProps) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach((task) => {
            if (!task.due_date) return;
            const dateStr = format(new Date(task.due_date), "yyyy-MM-dd");
            if (!map.has(dateStr)) map.set(dateStr, []);
            map.get(dateStr)!.push(task);
        });
        return map;
    }, [tasks]);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            const cloneDay = day;
            const dateStr = format(cloneDay, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(dateStr) || [];

            days.push(
                <CalendarDayCell
                    key={day.toString()}
                    day={cloneDay}
                    monthStart={monthStart}
                    dayTasks={dayTasks}
                    onDateClick={onDateClick}
                    onTaskDateChange={onTaskDateChange}
                    onTaskStatusChange={onTaskStatusChange}
                    onTaskDescriptionChange={onTaskDescriptionChange}
                />
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7" key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    return (
        <div className="border border-border/50 rounded-xl overflow-hidden bg-card/10">
            <HeaderRow labels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]} />
            <div className="flex flex-col">{rows}</div>
        </div>
    );
}