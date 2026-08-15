import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/hooks/use-currency";
import { Transaction } from "@/types/database";

export default function TransactionCalendarView() {
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

  // Calendar setup
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  const getTransactionsForDay = (date: Date) => {
    return transactions.filter(t => format(new Date(t.transaction_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d");
      const cloneDay = day;
      const dayTxs = getTransactionsForDay(cloneDay);

      let dayIncome = 0;
      let dayExpense = 0;
      dayTxs.forEach(tx => {
        if (tx.type === "income") dayIncome += tx.amount;
        if (tx.type === "expense") dayExpense += tx.amount;
      });

      days.push(
        <div
          key={day.toString()}
          onClick={() => dayTxs.length > 0 && setSelectedDate(cloneDay)}
          className={cn(
            "min-h-[120px] p-2 border-r border-b border-slate-200/60 relative transition-colors",
            !isSameMonth(day, monthStart) ? "bg-slate-50/50 text-slate-400" : "bg-white hover:bg-slate-50",
            isSameDay(day, new Date()) && "bg-blue-50/30",
            dayTxs.length > 0 ? "cursor-pointer" : "cursor-default"
          )}
        >
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-sm font-medium",
              isSameDay(day, new Date()) ? "h-7 w-7 bg-blue-600 text-white rounded-full flex items-center justify-center" : "h-7 w-7 flex items-center justify-center"
            )}>
              {formattedDate}
            </span>
            {dayTxs.length > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">
                {dayTxs.length} tx
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1">
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
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  // Selected Day Transactions Modal
  const selectedDayTransactions = selectedDate ? getTransactionsForDay(selectedDate) : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 border-r border-slate-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="flex flex-col">{rows}</div>
        </div>
      </div>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 rounded-2xl border-none shadow-xl bg-slate-50">
          <DialogHeader className="px-6 py-5 border-b border-slate-200 bg-white">
            <DialogTitle className="text-lg font-bold text-slate-800">
              Transactions on {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
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

