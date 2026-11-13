"use client";

import {
  useAccounts,
  useCategories,
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useTransactionSummary,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import { supabase } from "@/lib/supabase";
import { transactionService } from "@/lib/services/transaction-service";
import { useQueryClient } from "@tanstack/react-query";
import type {
  Account,
  CreateTransactionInput,
  Transaction,
  TransactionCategory,
  TransactionType,
  UpdateTransactionInput,
} from "@/types/transaction";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FormValues = {
  type: TransactionType;
  account_id: string;
  destination_account_id: string;
  category_id: string;
  amount: string;
  merchant: string;
  note: string;
  transaction_date: string;
};

const PAGE_SIZE = 10;

const INITIAL_FORM: FormValues = {
  type: "expense",
  account_id: "",
  destination_account_id: "",
  category_id: "",
  amount: "",
  merchant: "",
  note: "",
  transaction_date: new Date().toISOString().slice(0, 10),
};

const TYPE_CONFIG: Record<
  TransactionType,
  { label: string; icon: typeof ArrowDownLeft; color: string }
> = {
  income: {
    label: "Pemasukan",
    icon: ArrowDownLeft,
    color: "text-emerald-600 dark:text-[#A3BE8C]",
  },
  expense: {
    label: "Pengeluaran",
    icon: ArrowUpRight,
    color: "text-rose-600 dark:text-[#BF616A]",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowLeftRight,
    color: "text-blue-600 dark:text-[#88C0D0]",
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getCurrentMonthRange() {
  const now = new Date();

  return {
    start_date: new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toLocaleDateString("en-CA"),
    end_date: new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).toLocaleDateString("en-CA"),
  };
}

function toFormValues(transaction: Transaction): FormValues {
  return {
    type: transaction.type,
    account_id: transaction.account_id ?? "",
    destination_account_id: "",
    category_id: transaction.category_id ?? "",
    amount: String(transaction.amount),
    merchant: transaction.merchant ?? "",
    note: transaction.note ?? "",
    transaction_date: transaction.transaction_date.slice(0, 10),
  };
}

function SummaryCard({
  title,
  amount,
  icon: Icon,
  tone,
}: {
  title: string;
  amount: number;
  icon: typeof Wallet;
  tone: "green" | "red" | "blue";
}) {
  const toneStyles = {
    green: {
      icon: "bg-emerald-500/10 text-emerald-700 dark:bg-[#3B4B43] dark:text-[#A3BE8C]",
      amount: "text-emerald-700 dark:text-[#A3BE8C]",
    },
    red: {
      icon: "bg-rose-500/10 text-rose-700 dark:bg-[#503B42] dark:text-[#BF616A]",
      amount: "text-rose-700 dark:text-[#BF616A]",
    },
    blue: {
      icon: "bg-blue-500/10 text-blue-700 dark:bg-[#354954] dark:text-[#88C0D0]",
      amount: "text-foreground",
    },
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`rounded-xl p-2 ${toneStyles[tone].icon}`}>
          <Icon size={19} />
        </div>
      </div>

      <p
        className={`mt-4 break-words text-xl font-bold font-mono sm:text-2xl ${toneStyles[tone].amount}`}
      >
        {formatCurrency(amount)}
      </p>
    </div>
  );
}

function TransactionForm({
  initialValues,
  accounts,
  categories,
  isPending,
  onClose,
  onSubmit,
}: {
  initialValues: FormValues;
  accounts: Account[];
  categories: TransactionCategory[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}) {
  const [values, setValues] = useState<FormValues>(() => {
    // Default account ke akun pertama jika belum terpilih
    const defAccountId =
      initialValues.account_id || (accounts.length > 0 ? accounts[0].id : "");
    return {
      ...initialValues,
      account_id: defAccountId,
    };
  });
  const [formError, setFormError] = useState("");

  const availableCategories = categories.filter(
    (category) => category.type === values.type
  );

  function update<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((current) => ({
      ...current,
      [key]: val,
      ...(key === "type" && val === "transfer" ? { category_id: "" } : {}),
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    if (!values.account_id) {
      setFormError("Akun harus dipilih.");
      return;
    }

    if (values.type === "transfer" && !values.destination_account_id) {
      setFormError("Akun tujuan transfer harus dipilih.");
      return;
    }

    if (
      values.type === "transfer" &&
      values.account_id === values.destination_account_id
    ) {
      setFormError("Akun asal dan akun tujuan tidak boleh sama.");
      return;
    }

    const numericAmount = Math.round(Number(values.amount));
    if (!values.amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFormError("Nominal transaksi harus berupa angka lebih dari 0.");
      return;
    }

    onSubmit({
      ...values,
      amount: String(numericAmount),
    });
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring";
  const labelClass = "mb-2 block text-xs font-semibold text-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-xl rounded-2xl border border-border/80 bg-card p-6 text-card-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <h2 id="modal-title" className="text-lg font-bold text-foreground">
            {initialValues.account_id ? "Edit Transaksi" : "Tambah Transaksi"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
            aria-label="Tutup form"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-800 dark:text-rose-200">
              <CircleAlert size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>Jenis Transaksi</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["expense", "Pengeluaran", ArrowUpRight, "text-rose-600 dark:text-[#BF616A]"],
                  ["income", "Pemasukan", ArrowDownLeft, "text-emerald-600 dark:text-[#A3BE8C]"],
                  ["transfer", "Transfer", ArrowLeftRight, "text-blue-600 dark:text-[#88C0D0]"],
                ] as const
              ).map(([type, label, Icon, colorClass]) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => update("type", type)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition cursor-pointer",
                    values.type === type
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={16} className={colorClass} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="transaction-amount" className={labelClass}>
              Nominal Transaksi (Rp)
            </label>
            <input
              id="transaction-amount"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Contoh: 50000"
              value={values.amount}
              onChange={(event) => update("amount", event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="transaction-account" className={labelClass}>
                {values.type === "transfer" ? "Dari Akun" : "Akun Pembayaran"}
              </label>
              <select
                id="transaction-account"
                required
                value={values.account_id}
                onChange={(event) => update("account_id", event.target.value)}
                className={inputClass}
              >
                <option value="">Pilih akun</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
            </div>

            {values.type === "transfer" ? (
              <div>
                <label htmlFor="transaction-dest-account" className={labelClass}>
                  Akun Tujuan Transfer
                </label>
                <select
                  id="transaction-dest-account"
                  required
                  value={values.destination_account_id}
                  onChange={(event) =>
                    update("destination_account_id", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Pilih akun tujuan</option>
                  {accounts
                    .filter((a) => a.id !== values.account_id)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.type})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="transaction-category" className={labelClass}>
                  Kategori Transaksi
                </label>
                <select
                  id="transaction-category"
                  value={values.category_id}
                  onChange={(event) =>
                    update("category_id", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Pilih kategori (opsional)</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="transaction-merchant" className={labelClass}>
              {values.type === "income"
                ? "Sumber Pemasukan"
                : values.type === "transfer"
                  ? "Keterangan Transfer"
                  : "Merchant / Tempat"}
            </label>
            <input
              id="transaction-merchant"
              value={values.merchant}
              onChange={(event) => update("merchant", event.target.value)}
              placeholder={
                values.type === "income"
                  ? "Contoh: Gaji Kantor, Honor Freelance"
                  : values.type === "transfer"
                    ? "Contoh: Pindah Saldo Tabungan"
                    : "Contoh: Indomaret, Warung Makan, Kopi Kenangan"
              }
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="transaction-date" className={labelClass}>
              Tanggal Transaksi
            </label>
            <input
              id="transaction-date"
              type="date"
              required
              value={values.transaction_date}
              onChange={(event) =>
                update("transaction_date", event.target.value)
              }
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="transaction-note" className={labelClass}>
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              id="transaction-note"
              rows={2}
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Catatan kecil mengenai transaksi ini..."
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.98] transition-all"
            >
              {isPending && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TransactionPage() {
  // Ambil akun dan kategori ASLI dari database Supabase
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [actionError, setActionError] = useState("");

  // Gmail Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  const dateRange = useMemo(() => getCurrentMonthRange(), []);

  const filters = useMemo(
    () => ({
      ...(typeFilter !== "all" ? { type: typeFilter } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      order: "desc" as const,
    }),
    [typeFilter, search, page]
  );

  const {
    data: transactions = [],
    isPending: transactionsPending,
    isError: transactionsError,
    refetch,
  } = useTransactions(filters);

  const { data: summary } = useTransactionSummary(dateRange);

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const mutationPending =
    createMutation.isPending || updateMutation.isPending;

  const queryClient = useQueryClient();

  // Handler for Syncing with Gmail
  async function handleSyncGmail() {
    setIsSyncing(true);
    setActionError("");
    setSyncStatusMessage(null);

    try {
      // 1. Ambil sesi login Supabase aktif
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      const session = sessionData?.session;
      const token = session?.access_token;
      const user = session?.user;

      if (sessionErr || !token || !user) {
        throw new Error("Anda harus login terlebih dahulu untuk menyinkronkan transaksi.");
      }

      const primaryAccountId = accounts.length > 0 ? accounts[0].id : undefined;

      // 2. Request ke endpoint server dengan Bearer token dan kategori saat ini
      const response = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          accountId: primaryAccountId,
          categories: categories.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
          })),
        }),
      });

      const data = await response.json().catch(() => ({}));

      let totalInserted = data.syncedCount || 0;

      // 3. Fallback client-side import jika server belum berhasil menyimpan namun email berhasil diparse
      if (
        totalInserted === 0 &&
        Array.isArray(data.parsedTransactions) &&
        data.parsedTransactions.length > 0
      ) {
        try {
          const clientResult = await transactionService.importFromGmailParsed(data.parsedTransactions);
          if (clientResult.importedCount > 0) {
            totalInserted = clientResult.importedCount;
          } else if (clientResult.errors && clientResult.errors.length > 0) {
            console.error("[TransactionsPage] Client import errors:", clientResult.errors);
          }
        } catch (clientErr) {
          console.error("[TransactionsPage] Client import fallback error:", clientErr);
        }
      }

      // 4. Jika ada error dari server dan tidak ada yang berhasil disimpan
      if (!response.ok || !data.success) {
        if (totalInserted === 0) {
          const errMsg = data.error || (data.errors && data.errors[0]) || "Gagal menyinkronkan transaksi dari Gmail.";
          throw new Error(errMsg);
        }
      }

      if (data.errors && data.errors.length > 0 && totalInserted === 0) {
        throw new Error(data.errors[0] || "Gagal menyimpan transaksi ke database.");
      }

      // 4. Update notifikasi yang akurat ke pengguna
      if (totalInserted > 0) {
        toast.success(`Berhasil menyinkronkan ${totalInserted} transaksi baru ke database Supabase!`);
        setSyncStatusMessage(
          `Berhasil menambahkan ${totalInserted} transaksi baru ke database Supabase (dari ${data.totalScanned || 0} email dipindai).`
        );
      } else if (data.totalScanned > 0) {
        toast.info(
          `Semua ${data.totalScanned} email transaksi yang dipindai sudah pernah diimpor ke database sebelumnya.`
        );
        setSyncStatusMessage(
          `Semua ${data.totalScanned} email transaksi yang dipindai sudah tersimpan di database Supabase (tidak ada transaksi baru).`
        );
      } else {
        toast.info("Tidak ditemukan email notifikasi transaksi baru di Gmail.");
        setSyncStatusMessage("Tidak ditemukan email transaksi di kotak masuk Gmail.");
      }

      // 5. Muat ulang data transaksi di tampilan
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["transaction-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Gagal menyinkronkan transaksi dari Gmail.";
      toast.error(msg);
      setActionError(msg);
      setSyncStatusMessage(`Terjadi kesalahan: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleSubmit(values: FormValues) {
    setActionError("");

    let noteText = values.note.trim() || null;
    let merchantText = values.merchant.trim() || null;

    if (values.type === "transfer" && values.destination_account_id) {
      const destAcc = accounts.find((a) => a.id === values.destination_account_id);
      const destLabel = destAcc ? destAcc.name : "Akun Tujuan";
      merchantText = merchantText || `Transfer ke ${destLabel}`;
      noteText = noteText ? `${noteText} (Tujuan: ${destLabel})` : `Transfer ke ${destLabel}`;
    }

    const common: CreateTransactionInput = {
      account_id: values.account_id || null,
      category_id: values.type === "transfer" ? null : values.category_id || null,
      type: values.type,
      amount: Math.round(Number(values.amount)),
      merchant: merchantText,
      note: noteText,
      transaction_date: values.transaction_date,
    };

    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({
          id: editingTransaction.id,
          input: common as UpdateTransactionInput,
        });
        toast.success("Transaksi berhasil diperbarui!");
      } else {
        await createMutation.mutateAsync(common);
        toast.success("Transaksi berhasil ditambahkan!");
      }

      setModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Transaksi gagal disimpan.";
      setActionError(msg);
      toast.error(msg);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setActionError("");

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Transaksi berhasil dihapus!");
      setDeleteTarget(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Transaksi gagal dihapus.";
      setActionError(msg);
      toast.error(msg);
    }
  }

  function openCreateModal() {
    setEditingTransaction(null);
    setModalOpen(true);
    setActionError("");
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction);
    setModalOpen(true);
    setActionError("");
  }

  function changeTypeFilter(value: "all" | TransactionType) {
    setTypeFilter(value);
    setPage(0);
  }

  return (
    <div className="space-y-7 pb-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Keuangan pribadi</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Transaksi</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Pantau pemasukan, pengeluaran, dan sinkronkan otomatis dari notifikasi email perbankan Gmail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncGmail}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted px-4 py-2.5 text-sm font-semibold text-foreground transition disabled:opacity-50 cursor-pointer shadow-xs"
              title="Pindai email perbankan (BRI, QRIS, e-wallet) dari Gmail"
            >
              <RefreshCw className={cn("size-4 text-primary", isSyncing && "animate-spin")} />
              <span>{isSyncing ? "Menyinkronkan Gmail..." : "Sync Gmail"}</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Plus size={18} />
              Tambah Transaksi
            </button>
          </div>
        </header>

        {syncStatusMessage && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-sm text-emerald-800 dark:text-emerald-300 transition-all">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-[#A3BE8C]" />
              <span>{syncStatusMessage}</span>
            </div>
            <button
              onClick={() => setSyncStatusMessage(null)}
              aria-label="Tutup pesan"
              className="cursor-pointer text-emerald-800/70 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {actionError && !modalOpen && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-sm text-rose-800 dark:text-rose-300">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError("")}
              aria-label="Tutup pesan error"
              className="cursor-pointer text-rose-800/70 hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Total Pemasukan Bulan Ini"
            amount={summary?.totalIncome ?? 0}
            icon={ArrowDownLeft}
            tone="green"
          />
          <SummaryCard
            title="Total Pengeluaran Bulan Ini"
            amount={summary?.totalExpense ?? 0}
            icon={ArrowUpRight}
            tone="red"
          />
          <SummaryCard
            title="Selisih / Sisa Saldo"
            amount={summary?.balance ?? 0}
            icon={Wallet}
            tone="blue"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Cari merchant atau catatan..."
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring transition"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "Semua"],
                  ["income", "Pemasukan"],
                  ["expense", "Pengeluaran"],
                  ["transfer", "Transfer"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => changeTypeFilter(value)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition cursor-pointer font-medium",
                    typeFilter === value
                      ? "bg-primary font-bold text-primary-foreground shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {transactionsPending ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
              <LoaderCircle size={18} className="animate-spin" />
              Memuat transaksi...
            </div>
          ) : transactionsError ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <CircleAlert size={30} className="text-rose-500" />
              <p className="text-sm text-muted-foreground">
                Gagal memuat transaksi.
              </p>
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80 cursor-pointer"
              >
                Coba lagi
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                <CalendarDays size={26} />
              </div>
              <h3 className="font-semibold text-foreground">Belum ada transaksi</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Transaksi yang sesuai filter akan muncul di sini. Anda juga dapat menggunakan{" "}
                <strong className="text-foreground">Sync Gmail</strong> untuk menarik transaksi otomatis dari email perbankan.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                <button
                  onClick={handleSyncGmail}
                  disabled={isSyncing}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                >
                  <RefreshCw className={cn("size-4 text-primary", isSyncing && "animate-spin")} />
                  <span>Sync dari Gmail</span>
                </button>

                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground cursor-pointer hover:bg-primary/90 transition shadow-xs"
                >
                  <Plus size={16} />
                  Tambah Transaksi
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border/60">
                {transactions.map((transaction) => {
                  const config = TYPE_CONFIG[transaction.type];
                  const Icon = config.icon;

                  const accountName =
                    transaction.account?.name ??
                    accounts.find((a) => a.id === transaction.account_id)?.name ??
                    "Akun";

                  const isGmailSynced =
                    transaction.source === "email" ||
                    transaction.note?.toLowerCase().includes("gmail") ||
                    transaction.note?.toLowerCase().includes("synced");

                  return (
                    <article
                      key={transaction.id}
                      className="flex flex-col gap-3 px-4 py-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 rounded-xl bg-muted/80 p-2.5 sm:p-3 ${config.color}`}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold text-foreground">
                              {transaction.merchant ||
                                transaction.category?.name ||
                                config.label}
                            </p>
                            {isGmailSynced && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-[#88C0D0] dark:bg-[#88C0D0]/15 shrink-0 border border-blue-500/20 dark:border-[#88C0D0]/30">
                                Gmail Sync
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span>{formatDate(transaction.transaction_date)}</span>
                            <span>·</span>
                            <span>
                              {transaction.category?.name ?? config.label}
                            </span>
                            <span>·</span>
                            <span>{accountName}</span>
                          </div>

                          {transaction.note && !isGmailSynced && (
                            <p className="mt-1 break-words text-xs text-muted-foreground/80">
                              {transaction.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className={`whitespace-nowrap font-mono font-bold text-base sm:text-lg ${config.color}`}>
                          {transaction.type === "income"
                            ? "+"
                            : transaction.type === "expense"
                              ? "−"
                              : ""}
                          {formatCurrency(transaction.amount)}
                        </p>

                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(transaction)}
                            aria-label="Edit transaksi"
                            title="Edit transaksi"
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            onClick={() => {
                              setActionError("");
                              setDeleteTarget(transaction);
                            }}
                            aria-label="Hapus transaksi"
                            title="Hapus transaksi"
                            className="rounded-lg p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-[#BF616A] transition cursor-pointer"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-4 sm:px-5">
                <p className="text-xs text-muted-foreground">
                  Halaman {page + 1}
                  {transactions.length < PAGE_SIZE && " · Data terakhir"}
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 transition cursor-pointer"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    disabled={transactions.length < PAGE_SIZE}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 transition cursor-pointer"
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {modalOpen && (
        <TransactionForm
          key={editingTransaction?.id ?? "new"}
          initialValues={
            editingTransaction
              ? toFormValues(editingTransaction)
              : { ...INITIAL_FORM }
          }
          accounts={accounts}
          categories={categories}
          isPending={mutationPending}
          onClose={() => {
            if (mutationPending) return;
            setModalOpen(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {modalOpen && actionError && (
        <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-[#503B42] p-4 text-sm text-rose-900 dark:text-[#ECEFF4] shadow-xl backdrop-blur-md">
          {actionError}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl text-card-foreground animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-600 dark:text-[#BF616A]">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 id="delete-title" className="font-bold text-foreground text-base">
                  Hapus transaksi?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Transaksi{" "}
                  <strong className="text-foreground">
                    {deleteTarget.merchant ||
                      TYPE_CONFIG[deleteTarget.type].label}
                  </strong>{" "}
                  akan dihapus secara permanen.
                </p>
              </div>
            </div>

            {deleteMutation.isError && (
              <p className="mt-3 text-sm text-rose-600 dark:text-[#BF616A] font-medium">
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : "Transaksi gagal dihapus."}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50 transition cursor-pointer shadow-xs"
              >
                {deleteMutation.isPending && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
