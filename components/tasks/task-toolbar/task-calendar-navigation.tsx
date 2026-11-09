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
        className="h-9 px-3.5 rounded-xl text-xs font-medium border-border/70 hover:bg-muted/60 cursor-pointer"
        onClick={onToday}
      >
        Hari Ini
      </Button>

      <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 p-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
          aria-label="Bulan sebelumnya"
          onClick={onPrevMonth}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <span className="min-w-32 text-center text-xs font-bold text-foreground px-2">
          {format(currentMonth, "MMMM yyyy")}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
          aria-label="Bulan berikutnya"
          onClick={onNextMonth}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
