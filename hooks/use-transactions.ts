
"use client";

import { TransactionFilters, transactionService } from "@/lib/services/transaction-service";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/types/transaction";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";





const TRANSACTION_QUERY_KEY = ["transactions"] as const;
const TRANSACTION_SUMMARY_QUERY_KEY = ["transaction-summary"] as const;

export const transactionKeys = {
  all: TRANSACTION_QUERY_KEY,

  lists: () => [...TRANSACTION_QUERY_KEY, "list"] as const,

  list: (filters: TransactionFilters = {}) =>
    [...TRANSACTION_QUERY_KEY, "list", filters] as const,

  details: () => [...TRANSACTION_QUERY_KEY, "detail"] as const,

  detail: (id: string) =>
    [...TRANSACTION_QUERY_KEY, "detail", id] as const,

  summaries: () => TRANSACTION_SUMMARY_QUERY_KEY,

  summary: (filters: {
    start_date?: string;
    end_date?: string;
  } = {}) =>
    [...TRANSACTION_SUMMARY_QUERY_KEY, filters] as const,
};

/**
 * Mengambil daftar transaksi dengan filter opsional.
 */
export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => transactionService.getAll(filters),
  });
}

/**
 * Mengambil detail transaksi berdasarkan ID.
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getById(id),
    enabled: Boolean(id),
  });
}

/**
 * Menambahkan transaksi baru.
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      transactionService.create(input),

    onSuccess: (transaction) => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: transactionKeys.summaries(),
      });

      queryClient.setQueryData(
        transactionKeys.detail(transaction.id),
        transaction,
      );
    },
  });
}

/**
 * Memperbarui transaksi.
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTransactionInput;
    }) => transactionService.update(id, input),

    onSuccess: (transaction) => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: transactionKeys.summaries(),
      });

      queryClient.setQueryData(
        transactionKeys.detail(transaction.id),
        transaction,
      );
    },
  });
}

/**
 * Menghapus transaksi.
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.delete(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: transactionKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: transactionKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: transactionKeys.summaries(),
      });
    },
  });
}

/**
 * Mengambil rekap pemasukan dan pengeluaran.
 */
export function useTransactionSummary(
  filters: {
    start_date?: string;
    end_date?: string;
  } = {},

) {
  return useQuery({
    queryKey: transactionKeys.summary(filters),
    queryFn: () =>
      transactionService.getSummary({
        startDate: filters.start_date,
        endDate: filters.end_date,
      }),
  });
}