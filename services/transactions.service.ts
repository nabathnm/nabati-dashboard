import { createClient } from "@/lib/supabase/client";
import type {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
  PaginatedResponse,
  TransactionCategory,
} from "@/types/database";

const supabase = createClient();

export const transactionsService = {
  async getAll(
    filters: TransactionFilters = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const {
      search,
      type,
      category_id,
      account_id,
      date_from,
      date_to,
      page = 1,
      per_page = 10,
    } = filters;

    let query = supabase
      .from("transactions")
      .select(
        "*, account:accounts!account_id(*), category:transaction_categories!category_id(*), destination_account:accounts!destination_account_id(*), items:transaction_items(id)",
        { count: "exact" }
      );

    if (type) query = query.eq("type", type);
    if (category_id) query = query.eq("category_id", category_id);
    if (account_id) query = query.eq("account_id", account_id);
    if (date_from) query = query.gte("transaction_date", date_from);
    if (date_to) query = query.lte("transaction_date", date_to);
    if (search) query = query.ilike("merchant", `%${search}%`);

    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    const { data, error, count } = await query
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data ?? [],
      count: count ?? 0,
      page,
      per_page,
      total_pages: Math.ceil((count ?? 0) / per_page),
    };
  },

  async getRecent(limit: number = 5): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "*, account:accounts!account_id(*), category:transaction_categories!category_id(*), items:transaction_items(id)"
      )
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  },

  async create(dto: CreateTransactionDTO): Promise<Transaction> {
    const { data: userData } = await supabase.auth.getUser();

    // Separate items from the main DTO
    const { items, ...transactionData } = dto;

    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...transactionData, user_id: userData.user?.id })
      .select()
      .single();

    if (error) throw error;

    // If there are items, insert them
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        ...item,
        transaction_id: data.id,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Failed to insert transaction items:", itemsError);
        // We might want to handle rollback or notify user here depending on strictness
      }
    }

    // Update account balance
    await this.updateAccountBalance(dto);

    return data;
  },

  async update(
    id: string,
    dto: UpdateTransactionDTO,
    oldTransaction: Transaction
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .update(dto)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
  },

  async getCategories(): Promise<TransactionCategory[]> {
    const { data, error } = await supabase
      .from("transaction_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async getMonthlyTotals(
    year: number,
    month: number
  ): Promise<{ income: number; expense: number }> {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const { data, error } = await supabase
      .from("transactions")
      .select("type, amount")
      .gte("transaction_date", startDate)
      .lt("transaction_date", endDate);

    if (error) throw error;

    const totals = (data ?? []).reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else if (t.type === "expense") acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return totals;
  },

  // Private helper
  async updateAccountBalance(dto: CreateTransactionDTO): Promise<void> {
    const { data: account } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", dto.account_id)
      .single();

    if (!account) return;

    let newBalance = Number(account.balance || 0);
    const amount = Number(dto.amount || 0);

    if (dto.type === "income") {
      newBalance += amount;
    } else if (dto.type === "expense") {
      newBalance -= amount;
    } else if (dto.type === "transfer") {
      newBalance -= amount;
    }

    await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", dto.account_id);

    // Handle transfer destination
    if (dto.type === "transfer" && dto.destination_account_id) {
      const { data: destAccount } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", dto.destination_account_id)
        .single();

      if (destAccount) {
        const destBalance = Number(destAccount.balance || 0);
        await supabase
          .from("accounts")
          .update({ balance: destBalance + amount })
          .eq("id", dto.destination_account_id);
      }
    }
  },

  async findByAmountAndDate(amount: number, date: string, type: "expense" | "income" | "transfer"): Promise<Transaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("amount", amount)
      .eq("type", type)
      .eq("transaction_date", date + "T00:00:00Z");

    if (error) throw error;
    return data || [];
  },

  async attachItemsToTransaction(transactionId: string, merchant: string, items: any[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update merchant name
    await supabase
      .from("transactions")
      .update({ merchant })
      .eq("id", transactionId);

    // Insert items
    if (items && items.length > 0) {
      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(
          items.map(item => ({
            transaction_id: transactionId,
            name: item.name,
            amount: item.amount,
            category_id: item.category_id,
            user_id: user.id
          }))
        );

      if (itemsError) throw itemsError;
    }
  },
};
