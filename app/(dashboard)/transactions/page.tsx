"use client";

import { Suspense } from "react";
import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
  Trash2, Mail, RefreshCw, SlidersHorizontal, ChevronLeft, ChevronRight,
  Receipt, DollarSign, CreditCard, Tag, CalendarDays, FileText
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema, type CreateTransactionFormValues } from "@/lib/schemas/transaction";
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useTransactionCategories } from "@/hooks/use-transactions";
import { useActiveAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/hooks/use-currency";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TransactionFilters, TransactionType } from "@/types/database";
import { ReceiptScannerModal } from "@/components/transactions/receipt-scanner-modal";

const typeConfig: Record<string, {
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

function TransactionsContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get("action");
  const initialType = searchParams.get("type") as TransactionType | null;

  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, per_page: 10 });
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(initialAction === "add");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const queryClient = useQueryClient();
  const activeFilters = useMemo(
    () => ({ ...filters, search: searchTerm || undefined }),
    [filters, searchTerm]
  );

  const { data: result, isLoading } = useTransactions(activeFilters);
  const { data: categories } = useTransactionCategories();
  const { data: accounts } = useActiveAccounts();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<CreateTransactionFormValues>({
      resolver: zodResolver(createTransactionSchema) as any,
      defaultValues: {
        type: initialType || "expense",
        date: format(new Date(), "yyyy-MM-dd"),
        amount: 0,
      },
    });

  const watchType = watch("type");

  const onSubmit = useCallback(
    async (values: CreateTransactionFormValues) => {
      await createMutation.mutateAsync(values);
      reset();
      setDialogOpen(false);
    },
    [createMutation, reset]
  );

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteMutation]);

  const handleUpdateCategory = async (tx: any, newCategoryId: string | null) => {
    if (tx.category_id === newCategoryId) return;
    try {
      await updateMutation.mutateAsync({
        id: tx.id,
        data: { category_id: newCategoryId === "unassigned" ? null : newCategoryId } as any,
        oldTransaction: tx
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleSyncGmail = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/gmail/sync", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sync failed");
      if (data.syncedCount > 0) {
        toast.success(`Successfully synced ${data.syncedCount} new transaction(s) from Gmail!`);
      } else {
        toast.info("No new transactions found in your Gmail inbox.");
      }
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to sync transactions from Gmail.");
    } finally {
      setIsSyncing(false);
    }
  }, [queryClient]);

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Transactions"
          description="Manage your income and expenses"
        />

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleSyncGmail}
            disabled={isSyncing}
            className="flex items-center gap-1.5"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
            ) : (
              <Mail className="h-4 w-4 text-indigo-400" />
            )}
            {isSyncing ? "Syncing..." : "Sync Gmail"}
          </Button>

          <ReceiptScannerModal />

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={
              <Button className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  Transaction
                </div>
                <DialogTitle className="text-xl font-bold">
                  New Transaction
                </DialogTitle>
              </DialogHeader>

              <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5 overflow-y-auto">
                {/* Type selector */}
                <div className="grid grid-cols-3 gap-2">
                  {(["expense", "income", "transfer"] as const).map((t) => {
                    const cfg = typeConfig[t];
                    const isActive = watchType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setValue("type", t)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-semibold transition-all
                              ${isActive
                            ? `${cfg.bg} ${cfg.color} shadow-sm`
                            : "border-input bg-muted/40 text-muted-foreground hover:bg-muted/60"
                          }`}
                      >
                        <cfg.icon className={`h-4 w-4 ${isActive ? cfg.color : "text-muted-foreground"}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" /> Amount
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="h-11 text-lg font-bold border-input bg-muted/40 rounded-xl focus-visible:ring-1 focus-visible:ring-ring/40 transition-colors shadow-sm"
                    {...register("amount", { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-xs text-rose-500">{errors.amount.message}</p>
                  )}
                </div>

                {/* Account */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Account
                  </Label>
                  <Select onValueChange={(v) => { if (v) setValue("account_id", v as string); }}>
                    <SelectTrigger className="h-11 border-input bg-muted/40 rounded-xl shadow-sm focus:ring-1 focus:ring-ring/40">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {(accounts ?? []).map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.account_id && (
                    <p className="text-xs text-rose-500">{errors.account_id.message}</p>
                  )}
                </div>

                {/* Transfer destination */}
                {watchType === "transfer" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" /> Transfer To
                    </Label>
                    <Select onValueChange={(v) => { if (v) setValue("destination_account_id", v as string); }}>
                      <SelectTrigger className="h-11 border-input bg-muted/40 rounded-xl shadow-sm focus:ring-1 focus:ring-ring/40">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {(accounts ?? []).map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Category */}
                {watchType !== "transfer" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> Category
                    </Label>
                    <Select onValueChange={(v) => { if (v) setValue("category_id", v as string); }}>
                      <SelectTrigger className="h-11 border-input bg-muted/40 rounded-xl shadow-sm focus:ring-1 focus:ring-ring/40">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {(categories ?? [])
                          .filter((c) => c.type === watchType)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Date
                  </Label>
                  <Input
                    type="date"
                    className="h-11 border-input bg-muted/40 rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40 transition-colors"
                    {...register("date")}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Description
                  </Label>
                  <Textarea
                    placeholder="Optional description..."
                    rows={2}
                    className="resize-none min-h-[80px] border-input bg-muted/40 rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40 transition-colors"
                    {...register("description")}
                  />
                </div>
              </form>
              <div className="px-6 pb-6 pt-4 border-t border-border/50 bg-muted/10">
                <Button
                  type="submit"
                  form="transaction-form"
                  disabled={createMutation.isPending}
                  className="w-full h-11"
                >
                  {createMutation.isPending ? "Adding..." : "Add Transaction"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-xs font-medium text-slate-500 hidden sm:block">Filter</span>
            </div>
            <div className="w-px h-5 bg-slate-200 shrink-0" />
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search transactions..."
                className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-300 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  type: v === "all" || !v ? undefined : (v as TransactionType),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-[130px] h-9 text-sm bg-slate-50 border-slate-200 rounded-xl hover:bg-white hover:border-blue-300 transition-colors">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  account_id: v === "all" || !v ? undefined : v as string,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-[150px] h-9 text-sm bg-slate-50 border-slate-200 rounded-xl hover:bg-white hover:border-blue-300 transition-colors">
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All accounts</SelectItem>
                {(accounts ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  category_id: v === "all" || !v ? undefined : v as string,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-[150px] h-9 text-sm bg-slate-50 border-slate-200 rounded-xl hover:bg-white hover:border-blue-300 transition-colors">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All categories</SelectItem>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
              ) : !result?.data.length ? (
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
                result.data.map((tx) => {
                  const cfg = typeConfig[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id} className="flex items-center hover:bg-muted/50 transition-colors group cursor-pointer">
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
                            onValueChange={(v) => handleUpdateCategory(tx, v)}
                            disabled={updateMutation.isPending}
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
                          onClick={() => setDeleteId(tx.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          {result && result.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Page <span className="font-semibold text-slate-700">{result.page}</span> of{" "}
                <span className="font-semibold text-slate-700">{result.total_pages}</span>
                <span className="text-slate-400 ml-1">({result.count} total)</span>
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="secondary"
                  size="icon-sm"
                  disabled={result.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  disabled={result.page >= result.total_pages}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-none p-0 overflow-hidden bg-background">
          <AlertDialogHeader className="px-6 py-5 border-b border-border/50 bg-muted/30">
            <AlertDialogTitle className="text-xl font-bold">Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 bg-muted/10">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-500 hover:bg-rose-600 border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-8 space-y-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}