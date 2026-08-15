import React from "react";
import { ArrowLeftRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { TransactionRow } from "./TransactionRow";
import type { Transaction, TransactionCategory } from "@/types/database";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  categories: TransactionCategory[] | undefined;
  onUpdateCategory: (tx: Transaction, newCategoryId: string | null) => void;
  isUpdatingCategory: boolean;
  onDelete: (id: string) => void;
}

export function TransactionList({
  transactions,
  isLoading,
  categories,
  onUpdateCategory,
  isUpdatingCategory,
  onDelete,
}: TransactionListProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto min-w-[800px]">
        <HeaderRow labels={["Date", "Type", "Description", "Account", "Category", "Amount", "Action"]} />

        <div className="divide-y divide-slate-50 bg-card/10 flex flex-col">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex border-b border-border/50 last:border-0">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="flex-1 px-4 py-4">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ))
          ) : !transactions.length ? (
            <div className="flex px-5 py-16 justify-center w-full">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <ArrowLeftRight className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No transactions found</p>
                <p className="text-xs text-slate-400">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                categories={categories}
                onUpdateCategory={onUpdateCategory}
                isUpdatingCategory={isUpdatingCategory}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
