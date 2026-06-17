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
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend ?? []} margin={{ top: 25, right: 10, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickMargin={20}
              />
              <YAxis
                tickFormatter={(v) => formatCompactCurrency(v)}
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={65}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl border border-slate-700 min-w-[140px]">
                        <p className="text-slate-400 mb-2 uppercase tracking-wider text-[10px]">{label}</p>
                        <div className="space-y-1.5">
                          {payload.map((p) => (
                            <div key={p.name} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full shadow-sm"
                                  style={{ backgroundColor: p.color }}
                                />
                                <span className="capitalize text-slate-200">{p.name}</span>
                              </div>
                              <span className="font-extrabold text-white">
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
                stroke="#34d399"
                strokeWidth={3}
                fill="url(#incomeGradient)"
              />
              <Area
                type="natural"
                dataKey="expense"
                stroke="#fb7185"
                strokeWidth={3}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm" />
            <span className="text-slate-500">Income</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-sm" />
            <span className="text-slate-500">Expense</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
