"use client";

import { useState } from "react";
import { format, subMonths } from "date-fns";
import { useMonthlyTrend, useCategorySpending, useMonthlyFinancialSummary } from "@/hooks/use-analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import MonthlySpendingChart from "@/components/dashboard/monthly-spending-chart";
import { formatCurrency } from "@/hooks/use-currency";
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp } from "lucide-react";
import ExpenseDonutChart from "@/components/dashboard/expense-donut-chart";
import { PageHeader } from "@/components/layout/page-header";

export default function AnalyticsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const { data: monthlyTrend, isLoading: isLoadingMonthly } = useMonthlyTrend(year);
  const { data: categoryData, isLoading: isLoadingCategory } = useCategorySpending(year, month);

  const monthsList = Array.from({ length: 12 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return { value: d.toISOString(), label: format(d, "MMMM yyyy") };
  });

  const currentMonthData = monthlyTrend?.find((m: any) => m.month === format(selectedDate, "MMM")) || {
    income: 0,
    expense: 0,
    net: 0,
  };

  const netSavings = currentMonthData.income - currentMonthData.expense;
  const isPositive = netSavings >= 0;

  const summaryCards = [
    {
      label: "Total Income",
      value: currentMonthData.income,
      icon: ArrowDownLeft,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      valueColor: "text-emerald-600",
    },
    {
      label: "Total Expenses",
      value: currentMonthData.expense,
      icon: ArrowUpRight,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
      valueColor: "text-rose-600",
    },
    {
      label: "Net Savings",
      value: netSavings,
      icon: Wallet,
      iconBg: isPositive ? "bg-blue-100" : "bg-amber-100",
      iconColor: isPositive ? "text-blue-500" : "text-amber-500",
      valueColor: isPositive ? "text-blue-600" : "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Analytics"
        description="Deep dive into your financial habits and trends"
      >
        <Select
          value={selectedDate.toISOString()}
          onValueChange={(v) => { if (typeof v === "string") setSelectedDate(new Date(v)); }}
        >
          <SelectTrigger className="w-[180px] h-10 text-sm bg-white border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {monthsList.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl shadow-sm border border-slate-100 border-t-2 p-5 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            {isLoadingMonthly ? (
              <Skeleton className="h-8 w-32 rounded-lg" />
            ) : (
              <p className={`text-2xl font-bold tracking-tight ${card.valueColor}`}>
                {formatCurrency(card.value)}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">{format(selectedDate, "MMMM yyyy")}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-8">
        {/* Cash Flow Trend */}
        <div className="col-span-full lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="px-6 pt-5 pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <h2 className="text-sm font-bold text-slate-700">Cash Flow Trend</h2>
              </div>
              <p className="text-xs text-slate-400 ml-9">Income vs Expenses for {year}</p>
            </div>
            <div className="p-6">
              {isLoadingMonthly ? (
                <Skeleton className="w-full h-[350px] rounded-xl" />
              ) : (
                <MonthlySpendingChart year={year} />
              )}
            </div>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="col-span-full md:col-span-7 lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="px-6 pt-5 pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Wallet className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <h2 className="text-sm font-bold text-slate-700">Spending by Category</h2>
              </div>
              <p className="text-xs text-slate-400 ml-9">
                {format(selectedDate, "MMMM yyyy")} distribution
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-center p-6">
              {isLoadingCategory ? (
                <div className="flex justify-center">
                  <Skeleton className="w-56 h-56 rounded-full" />
                </div>
              ) : (
                <ExpenseDonutChart year={year} month={month} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}