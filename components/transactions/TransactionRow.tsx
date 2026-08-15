import React from "react";
import { format } from "date-fns";
import { Receipt, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { typeConfig } from "./transaction-config";
import { formatCurrency } from "@/hooks/use-currency";
import type { Transaction, TransactionCategory } from "@/types/database";

interface TransactionRowProps {
  transaction: Transaction;
  categories: TransactionCategory[] | undefined;
  onUpdateCategory: (tx: Transaction, newCategoryId: string | null) => void;
  isUpdatingCategory: boolean;
  onDelete: (id: string) => void;
}

export function TransactionRow({
  transaction: tx,
  categories,
  onUpdateCategory,
  isUpdatingCategory,
  onDelete,
}: TransactionRowProps) {
  const cfg = typeConfig[tx.type];

  return (
    <div className="flex items-center hover:bg-muted/50 transition-colors group cursor-pointer">
      <div className="flex-1 px-4 py-3.5 flex items-center justify-center text-xs font-medium text-slate-500 whitespace-nowrap overflow-hidden">
        {format(new Date(tx.transaction_date), "dd MMM yyyy")}
      </div>
      <div className="flex-1 px-4 py-3.5 flex items-center justify-center overflow-hidden">
        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>
      <div className="flex-1 px-4 py-3.5 flex items-center justify-center overflow-hidden">
        <p className="text-sm font-medium text-slate-700 truncate flex items-center gap-1.5 text-center">
          {tx.merchant || tx.note || (
            <span className="text-slate-300">—</span>
          )}
          {(tx as any).items?.length > 0 && (
            <span title="Itemized receipt">
              <Receipt className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            </span>
          )}
        </p>
      </div>
      <div className="flex-1 px-4 py-3.5 flex items-center justify-center text-xs text-slate-500 whitespace-nowrap overflow-hidden">
        {tx.account?.name}
      </div>
      <div className="flex-1 px-4 py-3.5 flex items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {tx.type === "transfer" ? (
          <span className="text-slate-300 text-xs">—</span>
        ) : (
          <Select
            value={tx.category_id || "unassigned"}
            onValueChange={(v) => onUpdateCategory(tx, v)}
            disabled={isUpdatingCategory}
          >
            <SelectTrigger className="h-7 w-full max-w-[120px] text-xs border-transparent hover:border-slate-200 bg-transparent hover:bg-slate-50 shadow-none px-2 focus:ring-0">
              <SelectValue placeholder="No Category">
                {tx.category?.name || categories?.find((c) => c.id === tx.category_id)?.name || "No Category"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="unassigned" className="text-slate-400 italic">No Category</SelectItem>
              {(categories ?? [])
                .filter((c) => c.type === tx.type)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className={`flex-1 px-4 py-3.5 flex items-center justify-center text-sm font-bold tabular-nums whitespace-nowrap overflow-hidden ${cfg.amountColor}`}>
        {tx.type === "expense" ? "−" : tx.type === "income" ? "+" : ""}
        {formatCurrency(tx.amount)}
      </div>
      <div className="flex-1 px-4 py-3.5 flex items-center justify-center overflow-hidden">
        <button
          onClick={() => onDelete(tx.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
