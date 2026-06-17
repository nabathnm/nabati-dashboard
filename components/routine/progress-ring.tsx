"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 12,
  className,
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * Math.min(percentage, 100)) / 100;
  const center = size / 2;

  // Color based on percentage
  const getColor = () => {
    if (percentage >= 80) return "text-emerald-500";
    if (percentage >= 50) return "text-blue-500";
    if (percentage >= 25) return "text-amber-500";
    return "text-slate-400";
  };

  const getTrackColor = () => {
    if (percentage >= 80) return "text-emerald-500/10";
    if (percentage >= 50) return "text-blue-500/10";
    if (percentage >= 25) return "text-amber-500/10";
    return "text-slate-200/50";
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={getTrackColor()}
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(getColor(), "transition-all duration-700 ease-out")}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-800 tabular-nums">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">{label}</p>
          {sublabel && (
            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
