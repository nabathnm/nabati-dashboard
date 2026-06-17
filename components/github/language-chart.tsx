"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Code2 } from "lucide-react";

interface LanguageChartProps {
  languages: { name: string; value: number; percentage: number }[];
}

const COLORS = [
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
  "#0ea5e9", // sky-500
  "#f43f5e", // rose-500
  "#84cc16", // lime-500
  "#64748b", // slate-500
];

export function LanguageChart({ languages }: LanguageChartProps) {
  // Take top 8 and bundle the rest into 'Other'
  const topLanguages = languages.slice(0, 8);
  const otherValue = languages.slice(8).reduce((acc, curr) => acc + curr.value, 0);
  
  if (otherValue > 0) {
    topLanguages.push({
      name: "Other",
      value: otherValue,
      percentage: (otherValue / languages.reduce((a, b) => a + b.value, 0)) * 100
    });
  }

  if (!languages || languages.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-[350px] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
          <Code2 className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">No language data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-[350px] flex flex-col">
      <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Code2 className="w-4 h-4 text-indigo-500" /> Top Languages
      </h3>
      <div className="flex-1 relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topLanguages}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {topLanguages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl border border-slate-700">
                      {data.name}: {data.percentage.toFixed(1)}%
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
