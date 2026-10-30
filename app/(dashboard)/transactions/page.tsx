
"use client";

import { useCreateTransaction, useDeleteTransaction, useTransactions, useTransactionSummary, useUpdateTransaction } from "@/hooks/use-transactions";
import type { CreateTransactionInput, Transaction, TransactionType, UpdateTransactionInput } from "@/types/transaction";
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    LoaderCircle,
    Pencil,
    Plus,
    Search,
    Trash2,
    Wallet,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";



type TransactionPageProps = {
  accounts: {
    id: string;
    name: string;
  }[];
  categories: {
    id: string;
    name: string;
    type: "income" | "expense";
  }[];
};

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
      1,
    ).toLocaleDateString("en-CA"),
    end_date: new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).toLocaleDateString("en-CA"),
  };
}

function toFormValues(transaction: Transaction): FormValues {
  return {
    type: transaction.type,
    account_id: transaction.account_id,
    destination_account_id: transaction.destination_account_id ?? "",
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
    <div className="rounded-2xl border border-[#434C5E] bg-[#3B4252] p-5">
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
  accounts: TransactionPageProps["accounts"];
  categories: TransactionPageProps["categories"];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [formError, setFormError] = useState("");

  const availableCategories = categories.filter(
    (category) => category.type === values.type,
  );

  function update<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleTypeChange(type: TransactionType) {
    setValues((current) => ({
      ...current,
      type,
      category_id: "",
      destination_account_id: "",
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const amount = Number(values.amount);

    if (!values.account_id) {
      setFormError("Pilih akun transaksi terlebih dahulu.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Nominal harus lebih besar dari 0.");
      return;
    }

    if (
      values.type === "transfer" &&
      !values.destination_account_id
    ) {
      setFormError("Pilih akun tujuan transfer.");
      return;
    }

    if (
      values.type === "transfer" &&
      values.account_id === values.destination_account_id
    ) {
      setFormError("Akun asal dan tujuan tidak boleh sama.");
      return;
    }

    if (values.type !== "transfer" && !values.category_id) {
      setFormError("Pilih kategori transaksi.");
      return;
    }

    onSubmit(values);
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-[#4C566A] bg-[#2E3440] px-3 py-2.5 text-sm text-[#ECEFF4] outline-none transition placeholder:text-[#7B8495] focus:border-[#88C0D0]";

  const labelClass = "text-sm font-medium text-[#D8DEE9]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-form-title"
        className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#434C5E] bg-[#3B4252] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#434C5E] bg-[#3B4252] px-5 py-4">
          <h2
            id="transaction-form-title"
            className="text-lg font-semibold text-[#ECEFF4]"
          >
            {initialValues === INITIAL_FORM
              ? "Tambah Transaksi"
              : "Edit Transaksi"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form"
            className="rounded-lg p-2 text-[#D8DEE9] hover:bg-[#434C5E]"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div>
            <label className={labelClass}>Jenis Transaksi</label>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {(
                ["expense", "income", "transfer"] as TransactionType[]
              ).map((type) => {
                const config = TYPE_CONFIG[type];
                const Icon = config.icon;
                const active = values.type === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-3 text-xs font-medium transition sm:text-sm ${
                      active
                        ? "border-[#88C0D0] bg-[#354954] text-[#88C0D0]"
                        : "border-[#4C566A] text-[#D8DEE9] hover:bg-[#434C5E]"
                    }`}
                  >
                    <Icon size={16} />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="transaction-amount" className={labelClass}>
              Nominal (Rp)
            </label>
            <input
              id="transaction-amount"
              type="number"
              min="1"
              step="1"
              required
              value={values.amount}
              onChange={(event) => update("amount", event.target.value)}
              placeholder="Contoh: 25000"
              className={inputClass}
            />
          </div>

          <div
            className={`grid gap-4 ${
              values.type === "transfer" ? "sm:grid-cols-2" : ""
            }`}
          >
            <div>
              <label htmlFor="transaction-account" className={labelClass}>
                {values.type === "transfer" ? "Akun Asal" : "Akun"}
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
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            {values.type === "transfer" && (
              <div>
                <label
                  htmlFor="transaction-destination"
                  className={labelClass}
                >
                  Akun Tujuan
                </label>
                <select
                  id="transaction-destination"
                  required
                  value={values.destination_account_id}
                  onChange={(event) =>
                    update("destination_account_id", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Pilih akun tujuan</option>
                  {accounts
                    .filter((account) => account.id !== values.account_id)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {values.type !== "transfer" && (
            <div>
              <label htmlFor="transaction-category" className={labelClass}>
                Kategori
              </label>
              <select
                id="transaction-category"
                required
                value={values.category_id}
                onChange={(event) =>
                  update("category_id", event.target.value)
                }
                className={inputClass}
              >
                <option value="">Pilih kategori</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              placeholder="Contoh: Warung Makan"
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
              Catatan (Opsional)
            </label>
            <textarea
              id="transaction-note"
              rows={3}
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Tambahkan catatan..."
              className={inputClass}
            />
          </div>

          {formError && (
            <p className="flex items-start gap-2 text-sm text-[#BF616A]">
              <CircleAlert size={17} className="mt-0.5 shrink-0" />
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-[#434C5E] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#4C566A] px-4 py-2.5 text-sm text-[#D8DEE9] hover:bg-[#434C5E]"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-[#88C0D0] px-4 py-2.5 text-sm font-semibold text-[#2E3440] transition hover:bg-[#9AD0DF] disabled:cursor-not-allowed disabled:opacity-60"
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

export default function TransactionPage({
  accounts,
  categories,
}: TransactionPageProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>(
    "all",
  );
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [actionError, setActionError] = useState("");

  const dateRange = useMemo(() => getCurrentMonthRange(), []);

  const filters = useMemo(
    () => ({
      ...(typeFilter !== "all" ? { type: typeFilter } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      order: "desc" as const,
    }),
    [typeFilter, search, page],
  );

  const {
    data: transactions = [],
    isPending: transactionsPending,
    isError: transactionsError,
    refetch,
  } = useTransactions(filters);

  const {
    data: summary,
    isPending: summaryPending,
  } = useTransactionSummary(dateRange);

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const mutationPending =
    createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: FormValues) {
    setActionError("");

    const common = {
      account_id: values.account_id,
      category_id:
        values.type === "transfer" ? null : values.category_id,
      destination_account_id:
        values.type === "transfer"
          ? values.destination_account_id
          : null,
      type: values.type,
      amount: Number(values.amount),
      merchant: values.merchant.trim() || null,
      note: values.note.trim() || null,
      transaction_date: values.transaction_date,
    } satisfies CreateTransactionInput;

    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({
          id: editingTransaction.id,
          input: common satisfies UpdateTransactionInput,
        });
      } else {
        await createMutation.mutateAsync(common);
      }

      setModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Transaksi gagal disimpan.",
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setActionError("");

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Transaksi gagal dihapus.",
      );
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
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Transaksi
            </h1>
            <p className="mt-2 text-sm text-[#D8DEE9]">
              Pantau pemasukan dan pengeluaranmu dalam satu tempat.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#88C0D0] px-4 py-3 text-sm font-semibold text-[#2E3440] transition hover:bg-[#9AD0DF]"
          >
            <Plus size={18} />
            Tambah Transaksi
          </button>
        </header>

        {actionError && !modalOpen && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#BF616A]/40 bg-[#503B42] p-3 text-sm text-[#ECEFF4]">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError("")}
              aria-label="Tutup pesan error"
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
            title="Selisih Bulan Ini"
            amount={
              (summary?.totalIncome ?? 0) - (summary?.totalExpense ?? 0)
            }
            icon={Wallet}
            tone="blue"
          />
        </section>

        {summaryPending && (
          <p className="text-xs text-[#7B8495]">
            Memuat ringkasan bulan ini...
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#434C5E] bg-[#3B4252]">
          <div className="space-y-4 border-b border-[#434C5E] p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8495]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Cari merchant..."
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
                  className={`rounded-lg px-3 py-2 text-sm transition ${
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
                className="rounded-lg bg-[#434C5E] px-4 py-2 text-sm hover:bg-[#4C566A]"
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
                Transaksi yang sesuai filter akan muncul di sini.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-1 flex items-center gap-2 rounded-xl bg-[#88C0D0] px-4 py-2.5 text-sm font-semibold text-[#2E3440]"
              >
                <Plus size={16} />
                Tambah transaksi pertama
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#434C5E]">
                {transactions.map((transaction) => {
                  const config = TYPE_CONFIG[transaction.type];
                  const Icon = config.icon;

                  const accountName =
                    transaction.account?.name ??
                    accounts.find(
                      (account) => account.id === transaction.account_id,
                    )?.name ??
                    "Akun";

                  const destinationName =
                    transaction.destination_account?.name ??
                    accounts.find(
                      (account) =>
                        account.id === transaction.destination_account_id,
                    )?.name;

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
                          <p className="truncate font-medium">
                            {transaction.merchant ||
                              transaction.category?.name ||
                              config.label}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#D8DEE9]">
                            <span>{formatDate(transaction.transaction_date)}</span>
                            <span>·</span>
                            <span>
                              {transaction.category?.name ?? config.label}
                            </span>
                            <span>·</span>
                            <span>
                              {accountName}
                              {transaction.type === "transfer" &&
                                destinationName &&
                                ` → ${destinationName}`}
                            </span>
                          </div>

                          {transaction.note && (
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
                            className="rounded-lg p-2 text-[#D8DEE9] hover:bg-[#4C566A] hover:text-[#88C0D0]"
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
                            className="rounded-lg p-2 text-[#D8DEE9] hover:bg-[#503B42] hover:text-[#BF616A]"
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
                    className="rounded-lg border border-[#4C566A] p-2 text-[#D8DEE9] hover:bg-[#434C5E] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    disabled={transactions.length < PAGE_SIZE}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-[#4C566A] p-2 text-[#D8DEE9] hover:bg-[#434C5E] disabled:cursor-not-allowed disabled:opacity-40"
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
                className="rounded-xl border border-[#4C566A] px-4 py-2.5 text-sm text-[#D8DEE9] hover:bg-[#434C5E] disabled:opacity-50"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-[#BF616A] px-4 py-2.5 text-sm font-semibold text-[#ECEFF4] hover:bg-[#C9757D] disabled:opacity-50"
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
