import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/hooks/use-currency";
import { Transaction } from "@/types/database";
import { GenericCalendarGrid } from "@/components/ui/generic-calendar-grid";

export default function TransactionCalendarView({ onAddTransaction }: { onAddTransaction?: (date: Date) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

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

        <div className="space-y-1 mt-1 overflow-y-auto max-h-[100px] no-scrollbar">
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
      <div className="px-5 py-3.5 border border-border/50 rounded-t-xl flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/30">
            <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="h-8 w-8 rounded-lg hover:bg-background">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-bold w-32 text-center select-none">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg hover:bg-background">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 rounded-lg text-xs font-semibold">
            Today
          </Button>
        </div>
      </div>

      <GenericCalendarGrid
        currentMonth={currentDate}
        renderDay={renderDay}
        weekStartsOn={1}
        headers={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        classNames={{
          root: "border border-border/50 rounded-b-xl overflow-hidden bg-card/10",
          headerRow: "border-b border-primary/20 bg-primary",
          headerCell: "py-3 text-center text-xs font-bold text-primary-foreground uppercase tracking-wider border-r border-primary/20 last:border-0",
        }}
      />

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 rounded-2xl border-none shadow-xl bg-slate-50">
          <DialogHeader className="px-6 py-5 border-b border-slate-200 bg-white flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold text-slate-800">
              Transactions on {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
            {onAddTransaction && selectedDate && (
              <Button size="sm" onClick={() => {
                onAddTransaction(selectedDate);
                setSelectedDate(null);
              }} className="h-8 flex items-center gap-1 text-xs">
                <Plus className="w-3.5 h-3.5" />
                Add Expense
              </Button>
            )}
          </DialogHeader>
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-3">
            {selectedDayTransactions.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No transactions this day.</p>
            ) : (
              selectedDayTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      tx.type === "income" ? "bg-emerald-100 text-emerald-600" :
                        tx.type === "expense" ? "bg-rose-100 text-rose-600" :
                          "bg-blue-100 text-blue-600"
                    )}>
                      {tx.type === "income" ? <ArrowUpRight className="w-5 h-5" /> :
                        tx.type === "expense" ? <ArrowDownRight className="w-5 h-5" /> :
                          <Receipt className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{tx.merchant || tx.note || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{tx.category?.name || "No Category"} • {tx.account?.name}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "text-sm font-bold tabular-nums",
                    tx.type === "income" ? "text-emerald-600" :
                      tx.type === "expense" ? "text-rose-600" :
                        "text-blue-600"
                  )}>
                    {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
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

