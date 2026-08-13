"use client";

import { cn } from "@/lib/utils";
import type { RoutineDisplayItem, RoutineCategory } from "@/types/routine";
import {
  Droplets,
  Dumbbell,
  Moon,
  StretchHorizontal,
  Footprints,
  UtensilsCrossed,
  Coffee,
  Brain,
  BookOpen,
  PenTool,
  Heart,
  Sparkles,
  Star,
  Trash2,
  GraduationCap,
  MapPin,
} from "lucide-react";

// ─── Category Config ─────────────────────────────────────────

const categoryConfig: Record<
  RoutineCategory,
  { label: string; color: string; bg: string; border: string }
> = {
  health: {
    label: "Health",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200/50",
  },
  nutrition: {
    label: "Nutrition",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200/50",
  },
  productivity: {
    label: "Productivity",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200/50",
  },
  personal_growth: {
    label: "Growth",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200/50",
  },
  custom: {
    label: "Custom",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200/50",
  },
};

// Pick an icon based on title keywords
function getRoutineIcon(title: string, category: RoutineCategory) {
  const lower = title.toLowerCase();
  if (lower.includes("water") || lower.includes("minum")) return Droplets;
  if (lower.includes("exercise") || lower.includes("workout") || lower.includes("olahraga")) return Dumbbell;
  if (lower.includes("sleep") || lower.includes("tidur")) return Moon;
  if (lower.includes("stretch") || lower.includes("peregangan")) return StretchHorizontal;
  if (lower.includes("walk") || lower.includes("jalan")) return Footprints;
  if (lower.includes("breakfast") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("makan") || lower.includes("sarapan")) return UtensilsCrossed;
  if (lower.includes("coffee") || lower.includes("kopi")) return Coffee;
  if (lower.includes("learn") || lower.includes("study") || lower.includes("belajar") || lower.includes("read") || lower.includes("baca")) return BookOpen;
  if (lower.includes("code") || lower.includes("coding") || lower.includes("project")) return Brain;
  if (lower.includes("journal") || lower.includes("refleks") || lower.includes("write")) return PenTool;
  if (lower.includes("meditat")) return Heart;

  // Fallback by category
  switch (category) {
    case "health": return Dumbbell;
    case "nutrition": return UtensilsCrossed;
    case "productivity": return Brain;
    case "personal_growth": return Sparkles;
    default: return Star;
  }
}

// ─── Component ───────────────────────────────────────────────

interface RoutineItemProps {
  routine: RoutineDisplayItem;
  onToggle: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  isPending?: boolean;
}

export default function RoutineItem({
  routine,
  onToggle,
  onDelete,
  isPending,
}: RoutineItemProps) {
  const config = categoryConfig[routine.category] || categoryConfig.custom;
  const Icon = getRoutineIcon(routine.title, routine.category);

  // Format time from "HH:MM:SS" or "HH:MM" to display
  const timeDisplay = routine.scheduled_time.slice(0, 5);

  return (
    <div
      className={cn(
        "group flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all duration-200",
        routine.is_class 
          ? "bg-indigo-50/30 border-indigo-100" 
          : routine.is_completed
            ? "bg-slate-50/50 border-slate-100 opacity-70"
            : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* Checkbox or Class Icon */}
      {routine.is_class ? (
        <div className="w-6 h-6 rounded-lg border-2 border-indigo-200 bg-indigo-50 flex items-center justify-center shrink-0">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
        </div>
      ) : (
        <button
          onClick={() => onToggle(routine.id, !routine.is_completed)}
          className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200",
            routine.is_completed
              ? "bg-emerald-500 border-emerald-500 text-white scale-95"
              : "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50"
          )}
        >
          {routine.is_completed && (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path
                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      )}

      {/* Icon */}
      {!routine.is_class && (
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            config.bg
          )}
        >
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold truncate transition-all",
            routine.is_completed
              ? "text-slate-400"
              : routine.is_class
              ? "text-indigo-900"
              : "text-slate-800"
          )}
        >
          {routine.title}
        </p>
        
        {routine.is_class && routine.room ? (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <p className="text-[10px] text-indigo-600 truncate">
              {routine.room}
            </p>
          </div>
        ) : routine.description ? (
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {routine.description}
          </p>
        ) : null}
      </div>

      {/* Time & Duration */}
      <div className="text-right shrink-0">
        <p className={cn(
          "text-xs font-bold tabular-nums",
          routine.is_completed ? "text-slate-400" : routine.is_class ? "text-indigo-700" : "text-slate-700"
        )}>
          {timeDisplay}
        </p>
        {routine.is_class ? (
          <p className="text-[9px] text-indigo-500/80 font-semibold">
            till {routine.end_time?.slice(0, 5)}
          </p>
        ) : (
          <p className="text-[9px] text-muted-foreground font-semibold">
            {routine.estimated_duration} min
          </p>
        )}
      </div>

      {routine.is_class ? (
        <span
          className="text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 hidden sm:inline-block bg-indigo-50 text-indigo-600"
        >
          Class
        </span>
      ) : (
        <span
          className={cn(
            "text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 hidden sm:inline-block",
            config.bg,
            config.color
          )}
        >
          {config.label}
        </span>
      )}

      {/* Delete button (visible on hover) */}
      {onDelete && !routine.is_class && (
        <button
          onClick={() => onDelete(routine.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
