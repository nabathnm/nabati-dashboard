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
        <Button variant="outline" size="sm" onClick={onToday} className="rounded-xl text-xs font-medium border-border/70 cursor-pointer">
          Hari Ini
        </Button>
        <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Bulan sebelumnya"
            onClick={onPrevMonth}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Bulan berikutnya"
            onClick={onNextMonth}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
