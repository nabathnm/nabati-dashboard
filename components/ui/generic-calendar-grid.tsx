import React from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { cn } from "@/lib/utils";

export interface GenericCalendarGridProps {
  currentMonth: Date;
  renderDay: (day: Date) => React.ReactNode;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  headers?: string[];
  classNames?: {
    root?: string;
    headerRow?: string;
    headerCell?: string;
    grid?: string;
  };
}

export function GenericCalendarGrid({
  currentMonth,
  renderDay,
  weekStartsOn = 1,
  headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  classNames,
}: GenericCalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn });

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      days.push(
        <React.Fragment key={cloneDay.toString()}>
          {renderDay(cloneDay)}
        </React.Fragment>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className={cn("grid grid-cols-7", classNames?.grid)} key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className={cn("rounded-xl border border-border/50 overflow-hidden bg-background shadow-sm", classNames?.root)}>
      <div className={cn("grid grid-cols-7 border-b border-border/50 bg-muted/20", classNames?.headerRow)}>
        {headers.map((dayLabel, idx) => (
          <div
            key={idx}
            className={cn("py-3 text-center text-sm text-muted-foreground border-r border-border/50 last:border-r-0", classNames?.headerCell)}
          >
            {dayLabel}
          </div>
        ))}
      </div>
      <div className="flex flex-col">{rows}</div>
    </div>
  );
}
