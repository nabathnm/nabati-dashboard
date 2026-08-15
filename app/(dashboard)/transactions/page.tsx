"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TransactionFilters, TransactionType, Transaction } from "@/types/database";

import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useTransactionCategories } from "@/hooks/use-transactions";
import { useActiveAccounts } from "@/hooks/use-accounts";
import type { CreateTransactionFormValues } from "@/lib/schemas/transaction";

import TransactionCalendarView from "@/components/transactions/TransactionCalendarView";
import { TransactionHeader } from "@/components/transactions/TransactionHeader";
import { TransactionFilters as FilterBar } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { TransactionFormDialog } from "@/components/transactions/TransactionFormDialog";
import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get("action");
  const initialType = searchParams.get("type") as TransactionType | null;

  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, per_page: 10 });
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(initialAction === "add");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAllTime, setIsAllTime] = useState(false);
  const [initialDateForForm, setInitialDateForForm] = useState<Date | undefined>(undefined);

  const queryClient = useQueryClient();

  const activeFilters = useMemo(
    () => ({
      ...filters,
      search: searchTerm || undefined,
      date_from: isAllTime && viewMode === "list" ? undefined : format(startOfMonth(currentDate), "yyyy-MM-dd"),
      date_to: isAllTime && viewMode === "list" ? undefined : format(endOfMonth(currentDate), "yyyy-MM-dd"),
    }),
    [filters, searchTerm, currentDate, isAllTime, viewMode]
  );

  const { data: result, isLoading } = useTransactions(activeFilters);
  const { data: categories } = useTransactionCategories();
  const { data: accounts } = useActiveAccounts();

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const handleOpenAddModal = (date?: Date) => {
    setInitialDateForForm(date);
    setDialogOpen(true);
  };

  const onSubmit = useCallback(
    async (values: CreateTransactionFormValues) => {
      await createMutation.mutateAsync(values);
      setDialogOpen(false);
    },
    [createMutation]
  );

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteMutation]);

  const handleUpdateCategory = async (tx: Transaction, newCategoryId: string | null) => {
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

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  return (
    <div>
      <div className="space-y-6">
        <TransactionHeader
          onSync={handleSyncGmail}
          isSyncing={isSyncing}
          onAdd={() => handleOpenAddModal()}
        />

        <TransactionFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={onSubmit}
          isPending={createMutation.isPending}
          accounts={accounts}
          categories={categories}
          initialType={initialType}
          initialDate={initialDateForForm}
        />

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          isAllTime={isAllTime}
          setIsAllTime={setIsAllTime}
          onFilterChange={handleFilterChange}
          categories={categories}
          accounts={accounts}
        />

        {viewMode === "list" ? (
          <div className="space-y-0">
            <TransactionList
              transactions={result?.data || []}
              isLoading={isLoading}
              categories={categories}
              onUpdateCategory={handleUpdateCategory}
              isUpdatingCategory={updateMutation.isPending}
              onDelete={setDeleteId}
            />
            {result && result.total_pages > 1 && (
              <div className="rounded-b-xl border border-t-0 border-border/50 bg-card shadow-sm overflow-hidden">
                <TransactionPagination
                  page={result.page}
                  totalPages={result.total_pages}
                  totalCount={result.count}
                  onPageChange={(p) => handleFilterChange("page", p.toString())}
                />
              </div>
            )}
          </div>
        ) : (
          <TransactionCalendarView currentDate={currentDate} onAddTransaction={handleOpenAddModal} />
        )}
      </div>

      <DeleteTransactionDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 p-8 space-y-6">
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