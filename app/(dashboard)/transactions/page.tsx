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
    color: "text-[#A3BE8C]",
  },
  expense: {
    label: "Pengeluaran",
    icon: ArrowUpRight,
    color: "text-[#BF616A]",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowLeftRight,
    color: "text-[#88C0D0]",
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
      icon: "bg-[#3B4B43] text-[#A3BE8C]",
      amount: "text-[#A3BE8C]",
    },
    red: {
      icon: "bg-[#503B42] text-[#BF616A]",
      amount: "text-[#BF616A]",
    },
    blue: {
      icon: "bg-[#354954] text-[#88C0D0]",
      amount: "text-[#ECEFF4]",
    },
  };

  return (
    <div className="rounded-2xl border border-[#434C5E] bg-[#3B4252] p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#D8DEE9]">{title}</p>
        <div className={`rounded-xl p-2 ${toneStyles[tone].icon}`}>
          <Icon size={19} />
        </div>
      </div>

      <p
        className={`mt-4 break-words text-xl font-semibold sm:text-2xl ${toneStyles[tone].amount}`}
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
    "w-full rounded-xl border border-[#4C566A] bg-[#2E3440] px-4 py-3 text-sm text-[#ECEFF4] outline-none transition focus:border-[#88C0D0]";
  const labelClass = "mb-2 block text-xs font-medium text-[#D8DEE9]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-xl rounded-2xl border border-[#434C5E] bg-[#3B4252] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#434C5E] pb-4">
          <h2 id="modal-title" className="text-lg font-semibold">
            {initialValues.account_id ? "Edit Transaksi" : "Tambah Transaksi"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#D8DEE9] hover:bg-[#434C5E] cursor-pointer"
            aria-label="Tutup form"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl border border-[#BF616A]/40 bg-[#503B42] p-3 text-sm text-[#ECEFF4]">
              <CircleAlert size={18} className="shrink-0 text-[#BF616A]" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>Jenis Transaksi</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["expense", "Pengeluaran", ArrowUpRight, "text-[#BF616A]"],
                  ["income", "Pemasukan", ArrowDownLeft, "text-[#A3BE8C]"],
                  ["transfer", "Transfer", ArrowLeftRight, "text-[#88C0D0]"],
                ] as const
              ).map(([type, label, Icon, colorClass]) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => update("type", type)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition cursor-pointer",
                    values.type === type
                      ? "border-[#88C0D0] bg-[#2E3440] text-[#ECEFF4]"
                      : "border-[#4C566A] bg-[#3B4252] text-[#D8DEE9] hover:bg-[#434C5E]"
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
              className="rounded-xl border border-[#4C566A] px-5 py-2.5 text-sm font-semibold text-[#D8DEE9] hover:bg-[#434C5E] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-[#88C0D0] px-5 py-2.5 text-sm font-semibold text-[#2E3440] hover:bg-[#9AD0DF] disabled:opacity-50 cursor-pointer"
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

      // 2. Request ke endpoint server dengan Bearer token
      const response = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          accountId: primaryAccountId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menyinkronkan transaksi dari Gmail.");
      }

      let totalInserted = data.syncedCount || 0;

      // 3. Fallback client-side import jika server tidak menginsert namun terdapat parsed transactions
      if (
        totalInserted === 0 &&
        Array.isArray(data.parsedTransactions) &&
        data.parsedTransactions.length > 0 &&
        (!data.insertedTransactions || data.insertedTransactions.length === 0)
      ) {
        try {
          const clientResult = await transactionService.importFromGmailParsed(data.parsedTransactions);
          if (clientResult.importedCount > 0) {
            totalInserted = clientResult.importedCount;
          }
        } catch (clientErr) {
          console.error("[TransactionsPage] Client import fallback error:", clientErr);
        }
      }

      // 4. Update notifikasi yang akurat ke pengguna
      if (totalInserted > 0) {
        toast.success(`Berhasil menyinkronkan ${totalInserted} transaksi baru ke database Supabase!`);
        setSyncStatusMessage(
          `Berhasil menambahkan ${totalInserted} transaksi baru ke database Supabase (dari ${data.totalScanned || 0} email dipindai).`
        );
      } else if (data.totalScanned > 0) {
        toast.info(`Semua ${data.totalScanned} email transaksi yang dipindai sudah tersimpan di database.`);
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
    <main className="min-h-screen bg-[#2E3440] px-4 py-6 text-[#ECEFF4] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#88C0D0]">Keuangan pribadi</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Transaksi</h1>
            <p className="mt-2 text-sm text-[#D8DEE9]">
              Pantau pemasukan, pengeluaran, dan sinkronkan otomatis dari notifikasi email perbankan Gmail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncGmail}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#434C5E] bg-[#3B4252] hover:bg-[#434C5E] px-4 py-3 text-sm font-semibold text-[#ECEFF4] transition disabled:opacity-50 cursor-pointer shadow-xs"
              title="Pindai email perbankan (BRI, QRIS, e-wallet) dari Gmail"
            >
              <RefreshCw className={cn("size-4 text-[#88C0D0]", isSyncing && "animate-spin")} />
              <span>{isSyncing ? "Menyinkronkan Gmail..." : "Sync Gmail"}</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#88C0D0] px-4 py-3 text-sm font-semibold text-[#2E3440] transition hover:bg-[#9AD0DF] cursor-pointer shadow-xs"
            >
              <Plus size={18} />
              Tambah Transaksi
            </button>
          </div>
        </header>

        {syncStatusMessage && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#A3BE8C]/40 bg-[#3B4B43] p-3 text-sm text-[#ECEFF4] transition-all">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#A3BE8C]" />
              <span>{syncStatusMessage}</span>
            </div>
            <button
              onClick={() => setSyncStatusMessage(null)}
              aria-label="Tutup pesan"
              className="cursor-pointer text-[#D8DEE9] hover:text-[#ECEFF4]"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {actionError && !modalOpen && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#BF616A]/40 bg-[#503B42] p-3 text-sm text-[#ECEFF4]">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError("")}
              aria-label="Tutup pesan error"
              className="cursor-pointer text-[#D8DEE9] hover:text-[#ECEFF4]"
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

        <section className="overflow-hidden rounded-2xl border border-[#434C5E] bg-[#3B4252] shadow-xs">
          <div className="flex flex-col gap-4 border-b border-[#434C5E] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B8495]"
                />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Cari merchant atau catatan..."
                  className="w-full rounded-xl border border-[#4C566A] bg-[#2E3440] py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-[#7B8495] focus:border-[#88C0D0]"
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
                  className={`rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
                    typeFilter === value
                      ? "bg-[#88C0D0] font-medium text-[#2E3440]"
                      : "bg-[#434C5E] text-[#D8DEE9] hover:bg-[#4C566A]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {transactionsPending ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-[#D8DEE9]">
              <LoaderCircle size={18} className="animate-spin" />
              Memuat transaksi...
            </div>
          ) : transactionsError ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <CircleAlert size={30} className="text-[#BF616A]" />
              <p className="text-sm text-[#D8DEE9]">
                Gagal memuat transaksi.
              </p>
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-[#434C5E] px-4 py-2 text-sm hover:bg-[#4C566A] cursor-pointer"
              >
                Coba lagi
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <div className="rounded-2xl bg-[#434C5E] p-4">
                <CalendarDays size={26} className="text-[#88C0D0]" />
              </div>
              <h3 className="font-semibold">Belum ada transaksi</h3>
              <p className="max-w-sm text-sm text-[#D8DEE9]">
                Transaksi yang sesuai filter akan muncul di sini. Anda juga dapat menggunakan{" "}
                <strong>Sync Gmail</strong> untuk menarik transaksi otomatis dari email perbankan.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleSyncGmail}
                  disabled={isSyncing}
                  className="flex items-center gap-2 rounded-xl border border-[#4C566A] bg-[#2E3440] px-4 py-2.5 text-sm font-semibold text-[#ECEFF4] hover:bg-[#434C5E] cursor-pointer"
                >
                  <RefreshCw className={cn("size-4 text-[#88C0D0]", isSyncing && "animate-spin")} />
                  <span>Sync dari Gmail</span>
                </button>

                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 rounded-xl bg-[#88C0D0] px-4 py-2.5 text-sm font-semibold text-[#2E3440] cursor-pointer hover:bg-[#9AD0DF]"
                >
                  <Plus size={16} />
                  Tambah Transaksi
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#434C5E]">
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
                      className="flex flex-col gap-3 px-4 py-4 transition hover:bg-[#434C5E]/40 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 rounded-xl bg-[#2E3440] p-3 ${config.color}`}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">
                              {transaction.merchant ||
                                transaction.category?.name ||
                                config.label}
                            </p>
                            {isGmailSynced && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#88C0D0]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#88C0D0] shrink-0 border border-[#88C0D0]/30">
                                Gmail Sync
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#D8DEE9]">
                            <span>{formatDate(transaction.transaction_date)}</span>
                            <span>·</span>
                            <span>
                              {transaction.category?.name ?? config.label}
                            </span>
                            <span>·</span>
                            <span>{accountName}</span>
                          </div>

                          {transaction.note && !isGmailSynced && (
                            <p className="mt-1 break-words text-xs text-[#7B8495]">
                              {transaction.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className={`whitespace-nowrap font-semibold ${config.color}`}>
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
                            className="rounded-lg p-2 text-[#D8DEE9] hover:bg-[#4C566A] hover:text-[#88C0D0] cursor-pointer"
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
                            className="rounded-lg p-2 text-[#D8DEE9] hover:bg-[#503B42] hover:text-[#BF616A] cursor-pointer"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[#434C5E] px-4 py-4 sm:px-5">
                <p className="text-xs text-[#D8DEE9]">
                  Halaman {page + 1}
                  {transactions.length < PAGE_SIZE && " · Data terakhir"}
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                    className="rounded-lg border border-[#4C566A] p-2 text-[#D8DEE9] hover:bg-[#434C5E] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    disabled={transactions.length < PAGE_SIZE}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-[#4C566A] p-2 text-[#D8DEE9] hover:bg-[#434C5E] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
        <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl rounded-xl border border-[#BF616A]/50 bg-[#503B42] p-4 text-sm text-[#ECEFF4] shadow-xl">
          {actionError}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl border border-[#434C5E] bg-[#3B4252] p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[#503B42] p-2 text-[#BF616A]">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 id="delete-title" className="font-semibold">
                  Hapus transaksi?
                </h2>
                <p className="mt-2 text-sm text-[#D8DEE9]">
                  Transaksi{" "}
                  <strong>
                    {deleteTarget.merchant ||
                      TYPE_CONFIG[deleteTarget.type].label}
                  </strong>{" "}
                  akan dihapus secara permanen.
                </p>
              </div>
            </div>

            {deleteMutation.isError && (
              <p className="mt-3 text-sm text-[#BF616A]">
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : "Transaksi gagal dihapus."}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="rounded-xl border border-[#4C566A] px-4 py-2.5 text-sm text-[#D8DEE9] hover:bg-[#434C5E] disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-[#BF616A] px-4 py-2.5 text-sm font-semibold text-[#ECEFF4] hover:bg-[#C9757D] disabled:opacity-50 cursor-pointer"
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
    </main>
  );
}
