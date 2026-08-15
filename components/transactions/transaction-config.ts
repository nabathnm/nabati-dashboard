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
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-100",
    dot: "bg-rose-400",
    amountColor: "text-rose-500",
    label: "Expense",
  },
  income: {
    icon: ArrowDownLeft,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
    dot: "bg-emerald-400",
    amountColor: "text-emerald-600",
    label: "Income",
  },
  transfer: {
    icon: ArrowLeftRight,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    dot: "bg-blue-400",
    amountColor: "text-blue-500",
    label: "Transfer",
  },
};
