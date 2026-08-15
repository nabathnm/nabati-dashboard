import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsService } from "@/services/transactions.service";
import type {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
  Transaction,
} from "@/types/database";
import { accountKeys } from "./use-accounts";
import { toast } from "sonner";

/**
 * 1. QUERY KEYS
 * Query Keys adalah penanda unik (berupa array) yang digunakan oleh React Query untuk menyimpan cache.
 * Setiap kali kita memanggil data yang sama, React Query akan melihat key ini.
 * Jika key-nya sama dan belum "stale" (kedaluwarsa), ia akan mengembalikan dari cache tanpa hit API ulang.
 */
export const transactionKeys = {
  all: ["transactions"] as const,
  list: (filters: TransactionFilters) => ["transactions", "list", filters] as const,
  recent: (limit?: number) => ["transactions", "recent", limit] as const,
  categories: ["transactions", "categories"] as const,
  monthlyTotals: (year: number, month: number) =>
    ["transactions", "monthlyTotals", year, month] as const,
};

/**
 * 2. GET (READ) HOOKS (Menggunakan useQuery)
 * Hook ini digunakan untuk mengambil data dari Supabase via service.
 * - queryKey: Kunci cache (dari atas).
 * - queryFn: Fungsi yang dijalankan untuk mengambil data (dari service).
 * - staleTime: Waktu (dalam ms) sebelum data dianggap usang dan perlu diambil ulang di background.
 */

// Mengambil semua transaksi berdasarkan filter (seperti tanggal atau tipe)
export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => transactionsService.getAll(filters),
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
  });
}

// Mengambil X transaksi terakhir untuk ditampilkan di Dashboard (default 5)
export function useRecentTransactions(limit: number = 20) {
  return useQuery({
    queryKey: transactionKeys.recent(limit),
    queryFn: () => transactionsService.getRecent(limit),
    staleTime: 1000 * 60 * 5,
  });
}

// Mengambil daftar kategori transaksi
export function useTransactionCategories() {
  return useQuery({
    queryKey: transactionKeys.categories,
    queryFn: () => transactionsService.getCategories(),
    staleTime: 1000 * 60 * 30, // Kategori jarang berubah, cache 30 menit
  });
}

// Mengambil total pemasukan/pengeluaran bulanan
export function useMonthlyTotals(year: number, month: number) {
  return useQuery({
    queryKey: transactionKeys.monthlyTotals(year, month),
    queryFn: () => transactionsService.getMonthlyTotals(year, month),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 3. POST/PUT/DELETE HOOKS (Menggunakan useMutation)
 * useMutation digunakan untuk mengubah data (Create, Update, Delete).
 * Saat sukses mengubah data, kita memanggil queryClient.invalidateQueries.
 * Tujuannya agar React Query menghapus cache lama dan otomatis me-refresh UI.
 */

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDTO) => transactionsService.create(data),
    onSuccess: () => {
      // Refresh daftar transaksi agar data baru langsung muncul
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // Refresh juga data akun karena saldo pasti berubah setelah transaksi dibuat
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: accountKeys.totalBalance });
      toast.success("Transaction created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      oldTransaction,
    }: {
      id: string;
      data: UpdateTransactionDTO;
      oldTransaction: Transaction;
    }) => transactionsService.update(id, data, oldTransaction),
    onSuccess: () => {
      // Mirip dengan create, refresh UI terkait transaksi dan saldo akun
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: accountKeys.totalBalance });
      toast.success("Transaction updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      // Hapus data cache lama, aplikasi akan memanggil database ulang (saldo akan disesuaikan)
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: accountKeys.totalBalance });
      toast.success("Transaction deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete transaction");
    },
  });
}
