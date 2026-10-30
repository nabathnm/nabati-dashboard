import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import React from "react";

export const typeConfig: Record<string, {
  icon: React.ElementType;
  color: string;
  bg: string;
  dot: string;
  amountColor: string;
  label: string;
}> = {
  expense: {
    icon: ArrowUpRight,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20",
    dot: "bg-rose-400 dark:bg-rose-500",
    amountColor: "text-rose-500 dark:text-rose-400",
    label: "Expense",
  },
  income: {
    icon: ArrowDownLeft,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    dot: "bg-emerald-400 dark:bg-emerald-500",
    amountColor: "text-emerald-600 dark:text-emerald-400",
    label: "Income",
  },
  transfer: {
    icon: ArrowLeftRight,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20",
    dot: "bg-blue-400 dark:bg-blue-500",
    amountColor: "text-blue-500 dark:text-blue-400",
    label: "Transfer",
  },
};
