"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { WeeklySynergyData } from "@/types/database";
import { cn } from "@/lib/utils";

interface SynergyRadarChartProps {
  data: WeeklySynergyData[];
  className?: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700/50">
      <p className="text-xs font-bold text-slate-300">{item.pillar}</p>
      <p className="text-lg font-black">{item.value}%</p>
    </div>
  );
}

export function SynergyRadarChart({
  data,
  className,
}: SynergyRadarChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid
            stroke="rgba(148, 163, 184, 0.15)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{
              fill: "#64748b",
              fontSize: 11,
              fontWeight: 700,
            }}
          />
          <Radar
            name="Synergy"
            dataKey="value"
            stroke="url(#radarGradient)"
            strokeWidth={2.5}
            fill="url(#radarFill)"
            fillOpacity={0.25}
            dot={{
              r: 5,
              fill: "#818cf8",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: "#6366f1",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
