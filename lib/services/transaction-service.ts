// src/services/transaction-service.ts

import { supabase } from "@/lib/supabase";
import type {
    CreateTransactionInput,
    CreateTransactionItemInput,
    Transaction,
    TransactionType,
    UpdateTransactionInput,
} from "@/types/transaction";

const TRANSACTIONS_TABLE = "transactions";
const TRANSACTION_ITEMS_TABLE = "transaction_items";

export interface TransactionFilters {
  type?: TransactionType | "all";
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  transactionCount: number;
  balance: number;
}

type TransactionPayload = {
  user_id: string;
  account_id: string;
  destination_account_id: string | null;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  merchant: string | null;
  note: string | null;
  transaction_date: string;
};

function buildTransactionPayload(
  input: CreateTransactionInput | UpdateTransactionInput,
  userId: string,
): Partial<TransactionPayload> {
  const payload: Partial<TransactionPayload> = {
    user_id: userId,
  };

  if (input.account_id !== undefined) {
    payload.account_id = input.account_id;
  }

  if (input.type !== undefined) {
    payload.type = input.type;

    if (input.type === "transfer") {
      payload.category_id = null;
      payload.destination_account_id =
        input.destination_account_id ?? null;
    } else {
      payload.category_id = input.category_id ?? null;
      payload.destination_account_id = null;
    }
  } else {
    if (input.category_id !== undefined) {
      payload.category_id = input.category_id ?? null;
    }

    if (input.destination_account_id !== undefined) {
      payload.destination_account_id =
        input.destination_account_id ?? null;
    }
  }

  if (input.amount !== undefined) {
    payload.amount = input.amount;
  }

  if (input.merchant !== undefined) {
    payload.merchant = input.merchant ?? null;
  }

  if (input.note !== undefined) {
    payload.note = input.note ?? null;
  }

  if (input.transaction_date !== undefined) {
    payload.transaction_date = input.transaction_date;
  }

  return payload;
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Kamu harus login untuk mengakses transaksi.");
  }

  return user.id;
}

function validateTransactionInput(
  input: CreateTransactionInput,
): void {
  if (!input.account_id) {
    throw new Error("Akun transaksi wajib dipilih.");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Nominal transaksi harus lebih besar dari nol.");
  }

  if (input.type === "transfer") {
    if (!input.destination_account_id) {
      throw new Error("Akun tujuan transfer wajib dipilih.");
    }

    if (input.account_id === input.destination_account_id) {
      throw new Error("Akun asal dan tujuan tidak boleh sama.");
    }
  } else if (!input.category_id) {
    throw new Error("Kategori transaksi wajib dipilih.");
  }
}

export const transactionService = {
  /**
   * Mengambil seluruh transaksi milik pengguna.
   */
  async getAll(
    filters: TransactionFilters = {},
  ): Promise<Transaction[]> {
    const userId = await getAuthenticatedUserId();

    let query = supabase
      .from(TRANSACTIONS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }

    if (filters.accountId) {
      query = query.or(
        `account_id.eq.${filters.accountId},destination_account_id.eq.${filters.accountId}`,
      );
    }

    if (filters.startDate) {
      query = query.gte("transaction_date", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("transaction_date", filters.endDate);
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim().replace(/[%_,]/g, "");
      query = query.ilike("merchant", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
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
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw error;
    }

    return data as Transaction;
  },

  /**
   * Membuat transaksi baru.
   *
   * Item transaksi disimpan setelah transaksi utama berhasil dibuat.
   */
  async create(input: CreateTransactionInput): Promise<Transaction> {
    validateTransactionInput(input);

    const userId = await getAuthenticatedUserId();

    const payload: TransactionPayload = {
      user_id: userId,
      account_id: input.account_id,
      destination_account_id:
        input.type === "transfer"
          ? input.destination_account_id ?? null
          : null,
      category_id:
        input.type === "transfer"
          ? null
          : input.category_id ?? null,
      type: input.type,
      amount: input.amount,
      merchant: input.merchant?.trim() || null,
      note: input.note?.trim() || null,
      transaction_date:
        input.transaction_date ??
        new Date().toISOString().slice(0, 10),
    };

    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const transaction = data as Transaction;

    if (input.items?.length) {
      const itemsPayload = input.items.map((item) => ({
        transaction_id: transaction.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
        category_id: item.category_id ?? null,
      }));

      const { error: itemsError } = await supabase
        .from(TRANSACTION_ITEMS_TABLE)
        .insert(itemsPayload);

      if (itemsError) {
        // Bersihkan transaksi utama jika penyimpanan item gagal.
        await supabase
          .from(TRANSACTIONS_TABLE)
          .delete()
          .eq("id", transaction.id)
          .eq("user_id", userId);

        throw itemsError;
      }
    }

    return transaction;
  },

  /**
   * Memperbarui transaksi berdasarkan ID.
   */
  async update(
    id: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> {
    const userId = await getAuthenticatedUserId();

    const existing = await this.getById(id);

    const merged: CreateTransactionInput = {
      account_id: input.account_id ?? existing.account_id,
      destination_account_id:
        input.destination_account_id ??
        existing.destination_account_id,
      category_id: input.category_id ?? existing.category_id,
      type: input.type ?? existing.type,
      amount: input.amount ?? existing.amount,
      merchant:
        input.merchant !== undefined
          ? input.merchant
          : existing.merchant,
      note:
        input.note !== undefined
          ? input.note
          : existing.note,
      transaction_date:
        input.transaction_date ?? existing.transaction_date,
    };

    validateTransactionInput(merged);

    const payload = buildTransactionPayload(merged, userId);

    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // Jika items tidak disertakan, item lama tidak diubah.
    if (input.items !== undefined) {
      const { error: deleteItemsError } = await supabase
        .from(TRANSACTION_ITEMS_TABLE)
        .delete()
        .eq("transaction_id", id);

      if (deleteItemsError) {
        throw deleteItemsError;
      }

      if (input.items.length > 0) {
        const itemsPayload = input.items.map((item) => ({
          transaction_id: id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
          category_id: item.category_id ?? null,
        }));

        const { error: insertItemsError } = await supabase
          .from(TRANSACTION_ITEMS_TABLE)
          .insert(itemsPayload);

        if (insertItemsError) {
          throw insertItemsError;
        }
      }
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
      throw error;
    }
  },

  /**
   * Mengambil item-item dari satu transaksi.
   */
  async getItems(
    transactionId: string,
  ): Promise<CreateTransactionItemInput[]> {
    const userId = await getAuthenticatedUserId();

    const { data: transaction, error: transactionError } =
      await supabase
        .from(TRANSACTIONS_TABLE)
        .select("id")
        .eq("id", transactionId)
        .eq("user_id", userId)
        .single();

    if (transactionError) {
      throw transactionError;
    }

    const { data, error } = await supabase
      .from(TRANSACTION_ITEMS_TABLE)
      .select("name, quantity, unit_price, amount, category_id")
      .eq("transaction_id", transaction.id);

    if (error) {
      throw error;
    }

    return (data ?? []) as CreateTransactionItemInput[];
  },

  /**
   * Menghitung ringkasan transaksi dalam rentang tanggal.
   * Transfer tidak dihitung sebagai pemasukan atau pengeluaran.
   */
  async getSummary(
    filters: Pick<TransactionFilters, "startDate" | "endDate" | "accountId"> = {},
  ): Promise<TransactionSummary> {
    const transactions = await this.getAll(filters);

    const summary = transactions.reduce(
      (result, transaction) => {
        result.transactionCount += 1;

        if (transaction.type === "income") {
          result.totalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          result.totalExpense += transaction.amount;
        } else if (transaction.type === "transfer") {
          result.totalTransfer += transaction.amount;
        }

        return result;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        totalTransfer: 0,
        transactionCount: 0,
        balance: 0,
      },
    );

    summary.balance = summary.totalIncome - summary.totalExpense;

    return summary;
  },
};