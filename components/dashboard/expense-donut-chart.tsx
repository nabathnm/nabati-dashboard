"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useCategorySpending } from "@/hooks/use-analytics";
import { formatCurrency } from "@/hooks/use-currency";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpenseDonutChartProps {
  year: number;
  month: number;
}

export default function ExpenseDonutChart({ year, month }: ExpenseDonutChartProps) {
  const { data: categoryData, isLoading } = useCategorySpending(year, month);

  const chartData = useMemo(() => {
    if (!categoryData) return [];
    return categoryData.map(c => ({
      name: c.category,
      value: c.amount,
      color: c.color,
      percentage: c.percentage
    }));
  }, [categoryData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full min-h-[300px]">
        <Skeleton className="w-56 h-56 rounded-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full min-h-[300px] text-center text-muted-foreground p-6">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-sm font-semibold text-slate-700">No expenses this month</p>
        <p className="text-xs mt-1 max-w-[200px]">Start tracking your transactions to see your spending breakdown.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl border border-slate-700">
          {data.name}: {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[320px] flex flex-col">
      <div className="flex-1 relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
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
