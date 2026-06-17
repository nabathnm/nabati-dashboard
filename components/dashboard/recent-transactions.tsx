"use client";

import Link from "next/link";
import { Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/hooks/use-currency";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";

export default function RecentTransactions() {
  const { data: transactions, isLoading } = useRecentTransactions(6);

  const hasTransactions = transactions && transactions.length > 0;

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[420px] transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            Transactions
          </h3>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wider">
            Latest transfers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-white/40 transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
          <Link href="/transactions">
            <button className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-bold px-3 py-1.5 rounded-full transition-all">
              View All
            </button>
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-center">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-full bg-slate-200/40 animate-pulse rounded-xl" />
          ))
        ) : !hasTransactions ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-8 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">No transactions yet</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
                Start tracking your money to see your latest transfers here
              </p>
            </div>
            <Link href="/transactions">
              <button className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-bold px-4 py-2 rounded-full transition-all mt-1">
                Add Transaction
              </button>
            </Link>
          </div>
        ) : (
          transactions.map((tx) => {
            const isExpense = tx.type === "expense";
            const isIncome = tx.type === "income";
            const sign = isExpense ? "-" : isIncome ? "+" : "";

            const formattedDate = format(new Date(tx.transaction_date), "MMM d");
            
            // Derive status
            const isPending = isToday(new Date(tx.transaction_date));

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between py-1.5 border-b border-slate-100/50 last:border-none group"
              >
                {/* Left side: name and date */}
                <div className="flex items-center gap-3.5 max-w-[150px]">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                      {tx.merchant || (tx as any).category?.name || tx.type}
                      {(tx as any).items?.length > 0 && (
                        <span title="Itemized receipt">
                          <Receipt className="w-3 h-3 text-indigo-400 inline" />
                        </span>
                      )}
                    </p>
                    <p className="text-[9px] font-semibold text-muted-foreground/75 mt-0.5">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <span
                    className={cn(
                      "text-[8px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wide",
                      isPending
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : "bg-slate-100/80 text-slate-500 border border-slate-200/20"
                    )}
                  >
                    {isPending ? "Pending" : "Done"}
                  </span>
                </div>

                {/* Right side: Amount */}
                <div className="text-right">
                  <span
                    className={cn(
                      "text-xs font-extrabold tabular-nums",
                      isExpense ? "text-slate-900" : isIncome ? "text-emerald-600 font-black" : "text-slate-800"
                    )}
                  >
                    {sign}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
