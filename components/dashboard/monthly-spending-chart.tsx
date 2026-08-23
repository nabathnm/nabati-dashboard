"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthlyTrend } from "@/hooks/use-analytics";
import { formatCompactCurrency } from "@/hooks/use-currency";

interface MonthlySpendingChartProps {
  year: number;
}

export default function MonthlySpendingChart({ year }: MonthlySpendingChartProps) {
  const { data: trend, isLoading } = useMonthlyTrend(year);

  if (isLoading) {
    return (
      <Card className="border-border/30 bg-card/50">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend ?? []} margin={{ top: 25, right: 10, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3be8c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a3be8c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bf616a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#bf616a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-[#434c5e]/50" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#81a1c1", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickMargin={20}
              />
              <YAxis
                tickFormatter={(v) => formatCompactCurrency(v)}
                tick={{ fontSize: 11, fill: "#81a1c1", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={65}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 dark:bg-[#2e3440] text-white dark:text-[#eceff4] text-xs font-bold px-4 py-3 rounded-xl shadow-xl border border-slate-700 dark:border-[#434c5e] min-w-[140px]">
                        <p className="text-slate-400 dark:text-[#81a1c1] mb-2 uppercase tracking-wider text-[10px]">{label}</p>
                        <div className="space-y-1.5">
                          {payload.map((p) => (
                            <div key={p.name} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full shadow-sm"
                                  style={{ backgroundColor: p.color }}
                                />
                                <span className="capitalize text-slate-200 dark:text-[#d8dee9]">{p.name}</span>
                              </div>
                              <span className="font-extrabold text-white dark:text-[#eceff4]">
                                {formatCompactCurrency(p.value as number)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="natural"
                dataKey="income"
                stroke="#a3be8c"
                strokeWidth={3}
                fill="url(#incomeGradient)"
              />
              <Area
                type="natural"
                dataKey="expense"
                stroke="#bf616a"
                strokeWidth={3}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="h-2.5 w-2.5 rounded-full bg-[#a3be8c] shadow-sm" />
            <span className="text-slate-500 dark:text-[#d8dee9]">Income</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="h-2.5 w-2.5 rounded-full bg-[#bf616a] shadow-sm" />
            <span className="text-slate-500 dark:text-[#d8dee9]">Expense</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
