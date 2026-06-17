"use client";

import { format, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";
import TaskPopover from "./TaskPopOver";

interface CalendarDayCellProps {
    day: Date;
    monthStart: Date;
    dayTasks: Task[];
    onDateClick: (date: Date) => void;
    onTaskDateChange: (taskId: string, newDate: string) => void;
    onTaskStatusChange: (taskId: string, status: "todo" | "done") => void;
    onTaskDescriptionChange?: (taskId: string, newDescription: string) => void;
}

export default function CalendarDayCell({
    day,
    monthStart,
    dayTasks,
    onDateClick,
    onTaskDateChange,
    onTaskStatusChange,
    onTaskDescriptionChange,
}: CalendarDayCellProps) {
    const today = new Date();

    return (
        <div
            className={cn(
                "min-h-[130px] p-2 border-r border-b border-border/50 relative group transition-colors cursor-pointer",
                !isSameMonth(day, monthStart)
                    ? "bg-muted/10 text-foreground/50"
                    : "bg-card/30 hover:bg-card/50",
                isSameDay(day, today) && "bg-accent/10"
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

            <div className="space-y-1 mt-1 overflow-y-auto max-h-[100px] no-scrollbar">
                {dayTasks.map((task) => (
                    <TaskPopover
                        key={task.id}
                        task={task}
                        onDateChange={onTaskDateChange}
                        onStatusChange={onTaskStatusChange}
                        onDescriptionChange={onTaskDescriptionChange}
                    />
                ))}
            </div>
        </div>
    );
}