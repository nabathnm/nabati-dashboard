"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { CollegeClass } from "@/types/routine";
import { Plus } from "lucide-react";
import { HeaderRow } from "@/components/layout/HeaderRow";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const LABELS = ["Time", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const START_HOUR = 7;
const END_HOUR = 17;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

interface ScheduleGridProps {
  schedule: Record<string, CollegeClass[]> | null;
  onClassClick: (day: string, cls: CollegeClass) => void;
  onEmptySlotClick: (day: string, hour: number) => void;
}

// Utility to convert "HH:MM" to decimal hours (e.g., "08:30" -> 8.5)
function timeToDecimal(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

export default function ScheduleGrid({
  schedule,
  onClassClick,
  onEmptySlotClick,
}: ScheduleGridProps) {

  // Render a block inside the day column
  const renderClassBlock = (day: string, cls: CollegeClass) => {
    const startDec = timeToDecimal(cls.start_time);
    const endDec = timeToDecimal(cls.end_time);

    // If it's outside our visible hours, don't render or clamp it
    if (endDec <= START_HOUR || startDec >= END_HOUR + 1) return null;

    const top = (Math.max(startDec, START_HOUR) - START_HOUR) * 60 + 20; // 60px per hour, +20px top padding
    const height = (Math.min(endDec, END_HOUR + 1) - Math.max(startDec, START_HOUR)) * 60;

    const isPractical = cls.category === "practical";

    return (
      <div
        key={cls.id}
        onClick={(e) => {
          e.stopPropagation();
          onClassClick(day, cls);
        }}
        className={cn(
          "absolute left-1 right-1 rounded-sm overflow-hidden cursor-pointer transition-opacity hover:opacity-80 border-0 border-l-4",
          isPractical
            ? "bg-yellow-500/10 border-yellow-500"
            : "bg-emerald-500/10 border-emerald-500"
        )}
        style={{ top: `${top}px`, height: `${height}px` }}
      >
        <div className="px-2 py-1.5 h-full flex flex-col justify-start overflow-hidden">
          <p className={cn(
            "text-[11px] font-semibold truncate leading-tight",
            isPractical ? "text-yellow-700" : "text-emerald-700"
          )}>
            {cls.subject}
          </p>
          {height >= 40 && (
            <p className="text-[9px] text-slate-400 font-medium mt-0.5 truncate">
              {cls.start_time}–{cls.end_time}
            </p>
          )}
          {height >= 56 && cls.room && (
            <p className="text-[9px] text-slate-400 truncate mt-0.5">
              {cls.room}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-card/10">
      {/* Header (Days) */}
      <HeaderRow
        labels={LABELS}
      />

      {/* Grid Body */}
      <div className="flex relative overflow-y-auto">
        {/* Time Labels */}
        <div className="w-16 shrink-0 border-r border-border/50 bg-white/50 backdrop-blur-md z-10 sticky left-0">
          <div className="h-[20px] w-full" /> {/* Top padding so first label isn't clipped */}
          {HOURS.map((hour) => (
            <div key={hour} className="h-[60px] relative">
              <span className="absolute -top-2.5 left-0 right-3 text-right text-[10px] font-bold text-slate-400">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        <div className="flex-1 flex">
          {DAYS.map((day) => {
            const classesForDay = schedule?.[day] || [];

            return (
              <div key={day} className="flex-1 relative border-r border-border/50 last:border-0 bg-transparent">
                <div className="h-[20px] w-full" /> {/* Match top padding */}

                {/* Horizontal Grid Lines & Clickable empty slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => onEmptySlotClick(day, hour)}
                    className="h-[60px] border-b border-border/50 w-full group relative cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary/60" />
                    </div>
                  </div>
                ))}

                {/* Class Blocks */}
                {classesForDay.map((cls) => renderClassBlock(day, cls))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
