"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
    currentMonth: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

export default function CalendarHeader({
    currentMonth,
    onPrevMonth,
    onNextMonth,
    onToday,
}: CalendarHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
                {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onToday}>
                    Today
                </Button>
                <div className="flex items-center rounded-md border border-input bg-transparent">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none border-r border-input"
                        onClick={onPrevMonth}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={onNextMonth}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}