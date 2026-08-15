import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Receipt, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/hooks/use-currency";
import { Transaction } from "@/types/database";
import { GenericCalendarGrid } from "@/components/ui/generic-calendar-grid";
import { useState } from "react";

export default function TransactionCalendarView({ currentDate, onAddTransaction }: { currentDate: Date, onAddTransaction?: (date: Date) => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch transactions for the current month view
  // We add some buffer days for the week start/end
  const startDateStr = format(startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const endDateStr = format(endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: result, isLoading } = useTransactions({
    date_from: startDateStr,
    date_to: endDateStr,
    per_page: 1000 // Get enough for the calendar
  });

  const transactions = result?.data || [];

  const getTransactionsForDay = (date: Date) => {
    return transactions.filter(t => format(new Date(t.transaction_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
  };

  const renderDay = (day: Date) => {
    const dayTxs = getTransactionsForDay(day);
    let dayIncome = 0;
    let dayExpense = 0;
    dayTxs.forEach(tx => {
      if (tx.type === "income") dayIncome += tx.amount;
      if (tx.type === "expense") dayExpense += tx.amount;
    });

    return (
      <div
        onClick={() => dayTxs.length > 0 && setSelectedDate(day)}
        className={cn(
          "min-h-[130px] p-2 border-r border-b border-border/50 relative transition-colors h-full",
          !isSameMonth(day, startOfMonth(currentDate))
            ? "bg-muted/10 text-foreground/50"
            : "bg-card/30 hover:bg-card/50",
          isSameDay(day, new Date()) && "bg-accent/10",
          dayTxs.length > 0 ? "cursor-pointer" : "cursor-default"
        )}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={cn(
            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
            isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : ""
          )}>
            {format(day, "d")}
          </span>
          {dayTxs.length > 0 && (
            <span className="text-[10px] text-muted-foreground font-medium">
              {dayTxs.length} tx
            </span>
          )}
        </div>

        <div className="space-y-1 mt-1 overflow-y-auto max-h-25 no-scrollbar">
          {dayIncome > 0 && (
            <div className="px-1.5 py-1 text-[11px] rounded bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {formatCurrency(dayIncome)}
            </div>
          )}
          {dayExpense > 0 && (
            <div className="px-1.5 py-1 text-[11px] rounded bg-rose-50 text-rose-700 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" />
              {formatCurrency(dayExpense)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Selected Day Transactions Modal
  const selectedDayTransactions = selectedDate ? getTransactionsForDay(selectedDate) : [];

  return (
    <div className="space-y-0">
      <GenericCalendarGrid
        currentMonth={currentDate}
        renderDay={renderDay}
        weekStartsOn={1}
        headers={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        classNames={{
          root: "border border-border/50 rounded-xl overflow-hidden bg-card/10",
          headerRow: "border-b border-primary/20 bg-primary",
          headerCell: "py-3 text-center text-xs font-bold text-primary-foreground uppercase tracking-wider border-r border-primary/20 last:border-0",
        }}
      />

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-112.5 overflow-hidden border-none shadow-xl bg-white">
          <DialogHeader className="bg-primary flex flex-row justify-between font-semibold">
            <DialogTitle className="text-[18px] font-medium text-white tracking-wide">
              Transaction on {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
            <button onClick={() => setSelectedDate(null)} className="text-white/90 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>
          <div className="max-h-[60vh] pt-3 pb-5 px-3 py-2 flex flex-col gap-2">
            {selectedDayTransactions.length === 0 ? (
              <p className="text-center text-white py-4">No transactions this day.</p>
            ) : (
              selectedDayTransactions.map(tx => (
                <div key={tx.id} className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md",
                  tx.type === "income" ? "bg-[#ECFDF5]" :
                    tx.type === "expense" ? "bg-[#FFF1F2]" :
                      "bg-blue-50/80"
                )}>
                  {/* ICON */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={cn(
                      "flex items-center justify-center shrink-0",
                      tx.type === "income" ? "text-[#007A55]" :
                        tx.type === "expense" ? "text-[#C70036]" :
                          "text-blue-600"
                    )}>
                      {tx.type === "income" ? <ArrowUpRight className="w-6.5 h-6.5  stroke-[2.5]" /> :
                        tx.type === "expense" ? <ArrowDownRight className="w-6.5  h-6.5  stroke-[2.5]" /> :
                          <Receipt className="w-6.5 h-6.5 stroke-[2.5]" />}
                    </div>

                    {/* TEXT */}
                    <div className="flex flex-col min-w-0 gap-1">
                      <p className="text-[14px] w-60 font-semibold text-slate-900 leading-none truncate">{tx.merchant || tx.note || "Unknown"}</p>
                      <p className="text-[12px] text-slate-600 leading-none truncate">{tx.category?.name || "No Category"}</p>
                    </div>
                  </div>

                  {/* HARGA */}
                  <div className={cn(
                    "text-[14px] font-bold tabular-nums shrink-0",
                    tx.type === "income" ? "text-[#007A55]" :
                      tx.type === "expense" ? "text-[#C70036]" :
                        "text-blue-600"
                  )}>
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

