"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useMonthlyTrend } from "@/hooks/use-analytics";
import { formatCompactCurrency } from "@/hooks/use-currency";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

export default function ExpenseStatisticChart() {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0-based

  const { data: monthlyTrend, isLoading } = useMonthlyTrend(year);

  // Build bar data from real monthly trend — show last 5 months
  const barData = useMemo(() => {
    if (!monthlyTrend || monthlyTrend.length === 0) return [];

    // Get up to 5 months ending at the current month
    const startIdx = Math.max(0, currentMonthIndex - 4);
    const slice = monthlyTrend.slice(startIdx, currentMonthIndex + 1);

    return slice.map((m) => ({
      month: m.month.toUpperCase(),
      amount: m.expense,
      label: formatCompactCurrency(m.expense),
    }));
  }, [monthlyTrend, currentMonthIndex]);

  const maxAmount = useMemo(
    () => Math.max(...barData.map((d) => d.amount), 1),
    [barData]
  );

  // Default select current month
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const activeMonth =
    selectedMonth ?? (barData.length > 0 ? barData[barData.length - 1].month : null);

  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-6 flex flex-col justify-between h-[230px]">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex items-end justify-between h-[120px] px-2 mt-4 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-full"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (barData.length === 0 || barData.every((d) => d.amount === 0)) {
    return (
      <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center h-[230px] text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700">No expenses yet</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Start tracking your expenses to see statistics here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between h-[230px] transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Expense statistic
          </h3>
        </div>
        <button className="bg-white/50 border border-white/60 text-[10px] font-bold text-slate-700 px-3 py-1 rounded-full shadow-sm hover:bg-white/80 transition-all">
          Monthly
        </button>
      </div>

      {/* Bars container */}
      <div className="flex items-end justify-between h-[120px] px-2 relative mt-4">
        {barData.map((item) => {
          const isSelected = activeMonth === item.month;
          const heightPercent = Math.max((item.amount / maxAmount) * 85, 5); // min 5%

          return (
            <div
              key={item.month}
              className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative"
              onClick={() => setSelectedMonth(item.month)}
            >
              {/* Tooltip */}
              <div
                className={cn(
                  "absolute -top-7 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-md pointer-events-none transition-all duration-200 whitespace-nowrap",
                  isSelected
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                )}
              >
                {item.label}
              </div>

              {/* Bar */}
              <div
                className={cn(
                  "w-9 rounded-full transition-all duration-500 ease-out",
                  isSelected
                    ? "bg-gradient-to-t from-blue-400 to-blue-600 shadow-md shadow-blue-500/20"
                    : "bg-slate-200/50 hover:bg-slate-300/60"
                )}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Month label */}
              <span
                className={cn(
                  "text-[9px] font-extrabold tracking-wider mt-2.5 transition-colors",
                  isSelected ? "text-slate-900" : "text-muted-foreground/60"
                )}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
