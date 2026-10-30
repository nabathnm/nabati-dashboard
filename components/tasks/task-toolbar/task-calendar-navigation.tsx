"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TaskCalendarNavigationProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export default function TaskCalendarNavigation({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
}: TaskCalendarNavigationProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 px-6 rounded-full"
        onClick={onToday}
      >
        Today
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full"
        aria-label="Bulan sebelumnya"
        onClick={onPrevMonth}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="min-w-32 text-center text-sm font-semibold">
        {format(currentMonth, "MMMM yyyy")}
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full"
        aria-label="Bulan berikutnya"
        onClick={onNextMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
