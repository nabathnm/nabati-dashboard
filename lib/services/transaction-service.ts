// lib/services/transaction-service.ts

import { supabase } from "@/lib/supabase";
import type {
  Account,
  CreateAccountInput,
  CreateCategoryInput,
  CreateTransactionInput,
  Transaction,
  TransactionCategory,
  TransactionType,
  UpdateTransactionInput,
} from "@/types/transaction";

const TRANSACTIONS_TABLE = "transactions";
const ACCOUNTS_TABLE = "accounts";
const CATEGORIES_TABLE = "transaction_categories";

export interface TransactionFilters {
  type?: TransactionType | "all";
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  transactionCount: number;
  balance: number;
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Kamu harus login untuk mengakses data transaksi.");
  }

  return user.id;
}

function validateTransactionInput(input: CreateTransactionInput): void {
  const numAmount = Number(input.amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    throw new Error("Nominal transaksi harus berupa angka lebih besar dari nol.");
  }

  if (!input.type || !["income", "expense", "transfer"].includes(input.type)) {
    throw new Error("Tipe transaksi tidak valid.");
  }
}

export const transactionService = {
  /**
   * Mengambil daftar akun milik pengguna.
   * Jika pengguna belum memiliki akun sama sekali, akun default akan dibuatkan secara otomatis.
   */
  async getAccounts(): Promise<Account[]> {
    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
      .from(ACCOUNTS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[AccountService] Error fetching accounts:", error);
      throw error;
    }

    let accounts = (data ?? []) as Account[];

    // Inisialisasi akun bawaan jika belum ada akun yang dibuat
    if (accounts.length === 0) {
      const defaultAccounts: CreateAccountInput[] = [
        { name: "Main Balance (Bank BRI)", type: "bank", institution: "BRI" },
        { name: "Cash / Tunai", type: "cash" },
        { name: "E-Wallet (GoPay/ShopeePay)", type: "e_wallet" },
      ];

      const toInsert = defaultAccounts.map((a) => ({
        user_id: userId,
        name: a.name,
        type: a.type,
        institution: a.institution || null,
        is_active: true,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from(ACCOUNTS_TABLE)
        .insert(toInsert)
        .select("*");

      if (!insertError && inserted && inserted.length > 0) {
        accounts = inserted as Account[];
      }
    }

    return accounts;
  },

  /**
   * Membuat akun baru.
   */
  async createAccount(input: CreateAccountInput): Promise<Account> {
    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
      .from(ACCOUNTS_TABLE)
      .insert({
        user_id: userId,
        name: input.name.trim(),
        type: input.type,
        institution: input.institution?.trim() || null,
        color: input.color || null,
        icon: input.icon || null,
        is_active: input.is_active ?? true,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as Account;
  },

  /**
   * Mengambil daftar kategori transaksi.
   * Mengambil kategori milik user atau kategori bawaan sistem.
   */
  async getCategories(): Promise<TransactionCategory[]> {
    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .select("*")
      .or(`user_id.eq.${userId},user_id.is.null,is_default.eq.true`)
      .order("name", { ascending: true });

    if (error) {
      console.error("[CategoryService] Error fetching categories:", error);
      throw error;
    }

    let categories = (data ?? []) as TransactionCategory[];

    // Inisialisasi kategori bawaan jika tabel masih kosong
    if (categories.length === 0) {
      const defaultCategories: CreateCategoryInput[] = [
        { name: "Makanan & Minuman", type: "expense", is_default: true },
        { name: "Transportasi", type: "expense", is_default: true },
        { name: "Belanja", type: "expense", is_default: true },
        { name: "Tagihan & Utilitas", type: "expense", is_default: true },
        { name: "Hiburan", type: "expense", is_default: true },
        { name: "Kesehatan", type: "expense", is_default: true },
        { name: "Pendidikan", type: "expense", is_default: true },
        { name: "Gaji / Upah", type: "income", is_default: true },
        { name: "Pemasukan Lainnya", type: "income", is_default: true },
        { name: "Lainnya", type: "expense", is_default: true },
      ];

      const toInsert = defaultCategories.map((c) => ({
        user_id: userId,
        name: c.name,
        type: c.type,
        is_default: true,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from(CATEGORIES_TABLE)
        .insert(toInsert)
        .select("*");

      if (!insertError && inserted && inserted.length > 0) {
        categories = inserted as TransactionCategory[];
      }
    }

    return categories;
  },

  /**
   * Mengambil seluruh transaksi milik pengguna sesuai filter.
   */
  async getAll(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const userId = await getAuthenticatedUserId();

    let query = supabase
      .from(TRANSACTIONS_TABLE)
      .select(`
        *,
        account:${ACCOUNTS_TABLE}(id, name, type, color, icon),
        category:${CATEGORIES_TABLE}(id, name, type, icon, color)
      `)
      .eq("user_id", userId)
      .order("transaction_date", { ascending: filters.order === "asc" })
      .order("created_at", { ascending: false });

    if (filters.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }

    if (filters.accountId) {
      query = query.eq("account_id", filters.accountId);
    }

    if (filters.startDate) {
      query = query.gte("transaction_date", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("transaction_date", `${filters.endDate}T23:59:59.999Z`);
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim().replace(/[%_,]/g, "");
      query = query.or(`merchant.ilike.%${search}%,note.ilike.%${search}%`);
    }

    if (typeof filters.limit === "number") {
      query = query.limit(filters.limit);
    }

    if (typeof filters.offset === "number") {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      // Fallback jika query join mengalami issue schema cache
      const simpleQuery = supabase
        .from(TRANSACTIONS_TABLE)
        .select("*")
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false });

      const { data: simpleData, error: simpleError } = await simpleQuery;
      if (simpleError) throw simpleError;
      return (simpleData ?? []) as Transaction[];
    }

    return (data ?? []) as Transaction[];
  },

  /**
   * Mengambil satu transaksi berdasarkan ID.
   */
  async getById(id: string): Promise<Transaction> {
    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .select(`
        *,
        account:${ACCOUNTS_TABLE}(id, name, type),
        category:${CATEGORIES_TABLE}(id, name, type)
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  /**
   * Membuat transaksi baru di database Supabase sesuai schema.
   */
  async create(input: CreateTransactionInput): Promise<Transaction> {
    validateTransactionInput(input);
    const userId = await getAuthenticatedUserId();

    const rawDate = input.transaction_date || new Date().toISOString();
    const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? `${rawDate}T12:00:00+07:00`
      : rawDate;

    const payload = {
      user_id: userId,
      account_id: input.account_id || null,
      category_id: input.type === "transfer" ? null : input.category_id || null,
      type: input.type,
      amount: Math.round(Number(input.amount)),
      currency: (input.currency || "IDR").toUpperCase(),
      merchant: input.merchant?.trim() || null,
      note: input.note?.trim() || null,
      transaction_date: new Date(isoDate).toISOString(),
      source: input.source || "manual",
      external_id: input.external_id || null,
      dedupe_key: input.dedupe_key || null,
      email_message_id: input.email_message_id || null,
      review_status: input.review_status || "confirmed",
    };

    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .insert(payload)
      .select(`
        *,
        account:${ACCOUNTS_TABLE}(id, name, type),
        category:${CATEGORIES_TABLE}(id, name, type)
      `)
      .single();

    if (error) {
      console.error("[TransactionService] Insert error:", error);
      throw error;
    }

    return data as Transaction;
  },

  /**
   * Memperbarui transaksi berdasarkan ID.
   */
  async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    const userId = await getAuthenticatedUserId();

    const payload: Record<string, unknown> = {};

    if (input.account_id !== undefined) {
      payload.account_id = input.account_id || null;
    }
    if (input.category_id !== undefined) {
      payload.category_id = input.type === "transfer" ? null : input.category_id || null;
    }
    if (input.type !== undefined) {
      payload.type = input.type;
      if (input.type === "transfer") {
        payload.category_id = null;
      }
    }
    if (input.amount !== undefined) {
      payload.amount = Math.round(Number(input.amount));
    }
    if (input.merchant !== undefined) {
      payload.merchant = input.merchant?.trim() || null;
    }
    if (input.note !== undefined) {
      payload.note = input.note?.trim() || null;
    }
    if (input.transaction_date !== undefined) {
      const rawDate = input.transaction_date;
      const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
        ? `${rawDate}T12:00:00+07:00`
        : rawDate;
      payload.transaction_date = new Date(isoDate).toISOString();
    }
    if (input.currency !== undefined) {
      payload.currency = input.currency.toUpperCase();
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId)
      .select(`
        *,
        account:${ACCOUNTS_TABLE}(id, name, type),
        category:${CATEGORIES_TABLE}(id, name, type)
      `)
      .single();

    if (error) {
      console.error("[TransactionService] Update error:", error);
      throw error;
    }

    return data as Transaction;
  },

  /**
   * Menghapus transaksi berdasarkan ID.
   */
  async delete(id: string): Promise<void> {
    const userId = await getAuthenticatedUserId();

    const { error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("[TransactionService] Delete error:", error);
      throw error;
    }
  },

  /**
   * Menghitung ringkasan pemasukan, pengeluaran, transfer, dan sisa saldo.
   */
  async getSummary(
    filters: Pick<TransactionFilters, "startDate" | "endDate" | "accountId"> = {}
  ): Promise<TransactionSummary> {
    const transactions = await this.getAll(filters);

    const summary = transactions.reduce(
      (result, transaction) => {
        result.transactionCount += 1;
        const amt = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
          result.totalIncome += amt;
        } else if (transaction.type === "expense") {
          result.totalExpense += amt;
        } else if (transaction.type === "transfer") {
          result.totalTransfer += amt;
        }

        return result;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        totalTransfer: 0,
        transactionCount: 0,
        balance: 0,
      }
    );

    summary.balance = summary.totalIncome - summary.totalExpense;
    return summary;
  },

  /**
   * Mengimpor transaksi yang diparse dari Gmail langsung ke database Supabase.
   * Digunakan sebagai eksekutor utama atau fallback client-side berotorisasi.
   */
  async importFromGmailParsed(
    items: Array<{
      amount: number;
      type: "expense" | "income";
      description: string;
      date: string;
      emailId?: string;
    }>
  ): Promise<{ importedCount: number; errors: string[] }> {
    const userId = await getAuthenticatedUserId();
    const accounts = await this.getAccounts();
    const categories = await this.getCategories();

    if (accounts.length === 0) {
      throw new Error("Tidak ada akun transaksi yang tersedia di database Supabase.");
    }

    const targetAccount =
      accounts.find(
        (a) =>
          a.name?.toLowerCase().includes("main") ||
          a.name?.toLowerCase().includes("bri") ||
          a.name?.toLowerCase().includes("bank")
      ) || accounts[0];

    // Ambil transaksi yang sudah ada untuk memeriksa duplikasi
    const { data: existingList } = await supabase
      .from(TRANSACTIONS_TABLE)
      .select("id, external_id, dedupe_key, amount, type, merchant")
      .eq("user_id", userId);

    const existing = existingList || [];
    let importedCount = 0;
    const errors: string[] = [];

    // Helper penentu kategori
    const getCategoryId = (desc: string, type: "expense" | "income"): string | null => {
      const typed = categories.filter((c) => c.type === type);
      if (type === "income") {
        return typed.find((c) => c.name.toLowerCase().includes("pemasukan") || c.name.toLowerCase().includes("gaji"))?.id || typed[0]?.id || null;
      }
      const descLower = desc.toLowerCase();
      const match = typed.find((c) => {
        const cLower = c.name.toLowerCase();
        return (
          (cLower.includes("kopi") && /kopi|coffee|cafe|latte/i.test(descLower)) ||
          (cLower.includes("makan") && /makan|resto|warung|kantin|food/i.test(descLower)) ||
          (cLower.includes("transport") && /gojek|grab|kereta|bensin|spbu|pertamina/i.test(descLower)) ||
          (cLower.includes("belanja") && /shopee|tokopedia|indomaret|alfamart|toko/i.test(descLower)) ||
          (cLower.includes("tagihan") && /pln|listrik|pulsa|wifi|telkom|seabank/i.test(descLower))
        );
      });
      return match?.id || typed.find((c) => c.name.toLowerCase().includes("lainnya"))?.id || typed[0]?.id || null;
    };

    for (const item of items) {
      try {
        const emailId = item.emailId;
        const dedupeKey = emailId ? `gmail_${emailId}` : null;

        // Cek duplikasi
        const isDuplicate = existing.some((ex) => {
          if (emailId && (ex.external_id === emailId || ex.dedupe_key === dedupeKey)) {
            return true;
          }
          if (
            Number(ex.amount) === Math.round(item.amount) &&
            ex.type === item.type &&
            ex.merchant?.toLowerCase() === item.description?.toLowerCase()
          ) {
            return true;
          }
          return false;
        });

        if (isDuplicate) {
          continue;
        }

        const categoryId = getCategoryId(item.description, item.type);
        const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(item.date)
          ? `${item.date}T12:00:00+07:00`
          : item.date;

        const payload = {
          user_id: userId,
          account_id: targetAccount.id,
          category_id: categoryId,
          type: item.type,
          amount: Math.round(Number(item.amount)),
          currency: "IDR",
          merchant: item.description,
          note: "Synced from Gmail (Bank Notification)",
          transaction_date: new Date(isoDate).toISOString(),
          source: "email" as const,
          external_id: emailId || null,
          dedupe_key: dedupeKey,
          review_status: "confirmed" as const,
        };

        const { data: inserted, error: insertError } = await supabase
          .from(TRANSACTIONS_TABLE)
          .insert(payload)
          .select("id")
          .single();

        if (insertError) {
          errors.push(`Gagal menyimpan "${item.description}": ${insertError.message}`);
        } else if (inserted) {
          importedCount++;
          existing.push({
            id: inserted.id,
            external_id: emailId || null,
            dedupe_key: dedupeKey,
            amount: payload.amount,
            type: payload.type,
            merchant: payload.merchant,
          });
        }
      } catch (err: unknown) {
        errors.push(err instanceof Error ? err.message : "Gagal memproses item transaksi.");
      }
    }

    return { importedCount, errors };
  },
};

export default transactionService;
