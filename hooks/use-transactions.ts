// hooks/use-transactions.ts

"use client";

import { TransactionFilters, transactionService } from "@/lib/services/transaction-service";
import type {
  CreateAccountInput,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/types/transaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const TRANSACTION_QUERY_KEY = ["transactions"] as const;
const TRANSACTION_SUMMARY_QUERY_KEY = ["transaction-summary"] as const;
const ACCOUNTS_QUERY_KEY = ["accounts"] as const;
const CATEGORIES_QUERY_KEY = ["transaction-categories"] as const;

export const transactionKeys = {
  all: TRANSACTION_QUERY_KEY,

  lists: () => [...TRANSACTION_QUERY_KEY, "list"] as const,

  list: (filters: TransactionFilters = {}) =>
    [...TRANSACTION_QUERY_KEY, "list", filters] as const,

  details: () => [...TRANSACTION_QUERY_KEY, "detail"] as const,

  detail: (id: string) => [...TRANSACTION_QUERY_KEY, "detail", id] as const,

  summaries: () => TRANSACTION_SUMMARY_QUERY_KEY,

  summary: (filters: { start_date?: string; end_date?: string } = {}) =>
    [...TRANSACTION_SUMMARY_QUERY_KEY, filters] as const,

  accounts: () => ACCOUNTS_QUERY_KEY,

  categories: () => CATEGORIES_QUERY_KEY,
};

/**
 * Mengambil daftar akun pengguna.
 */
export function useAccounts() {
  return useQuery({
    queryKey: transactionKeys.accounts(),
    queryFn: () => transactionService.getAccounts(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Menambahkan akun baru.
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAccountInput) => transactionService.createAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.accounts(),
      });
    },
  });
}

/**
 * Mengambil daftar kategori transaksi.
 */
export function useCategories() {
  return useQuery({
    queryKey: transactionKeys.categories(),
    queryFn: () => transactionService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

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
    mutationFn: (input: CreateTransactionInput) => transactionService.create(input),

    onSuccess: (transaction) => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: transactionKeys.summaries(),
      });

      queryClient.setQueryData(
        transactionKeys.detail(transaction.id),
        transaction
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
        transaction
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
  } = {}
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
