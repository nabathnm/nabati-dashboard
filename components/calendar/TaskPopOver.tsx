"use client";

import { format } from "date-fns";
import { CheckCircle2, Circle, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { categoryStyles } from "./TaskCategory";

interface TaskPopoverProps {
    task: Task;
    onDateChange: (taskId: string, newDate: string) => void;
    onStatusChange: (taskId: string, status: "todo" | "done") => void;
}

export default function TaskPopover({ task, onDateChange, onStatusChange }: TaskPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "text-xs px-2 py-1 rounded-sm border truncate flex items-center gap-1.5 cursor-pointer w-full text-left",
                            categoryStyles[task.category]?.bg,
                            task.status === "done" ? "opacity-50" : ""
                        )}
                        title={task.title}
                    />
                }
            >
                <span className="truncate">{task.title}</span>
            </PopoverTrigger>
            <PopoverContent
                side="right"
                align="start"
                className="w-80 p-0 overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 bg-muted/30 border-b">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page</span>
                    </div>
                    <h4 className="text-lg font-bold flex items-center gap-2">
                        {task.status === "done" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                        )}
                        {task.title}
                    </h4>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" /> Deadline
                        </span>
                        <Input
                            type="date"
                            value={task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : ""}
                            onChange={(e) => onDateChange(task.id, e.target.value)}
                            className="h-8 text-xs font-medium border-transparent hover:border-input focus:border-input bg-transparent hover:bg-muted"
                        />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Status
                        </span>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={task.status === "done"}
                                onChange={(e) => onStatusChange(task.id, e.target.checked ? "done" : "todo")}
                                className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                            <span className="text-sm font-medium">{task.status === "done" ? "Done" : "To do"}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Circle className="w-4 h-4" /> Category
                        </span>
                        <div>
                            <span
                                className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border",
                                    categoryStyles[task.category]?.bg,
                                    categoryStyles[task.category]?.color
                                )}
                            >
                                {categoryStyles[task.category]?.label}
                            </span>
                        </div>
                    </div>
                    {task.description && (
                        <div className="pt-2 border-t mt-4">
                            <span className="text-sm text-muted-foreground block mb-1">Detail</span>
                            <p className="text-sm text-slate-600">{task.description}</p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}