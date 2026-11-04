// types/transaction.ts

// ==================================================
// ACCOUNT
// ==================================================

export type AccountType = "bank" | "e_wallet" | "cash" | "other";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  institution?: string | null;
  color?: string | null;
  icon?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateAccountInput = {
  name: string;
  type: AccountType;
  institution?: string | null;
  color?: string | null;
  icon?: string | null;
  is_active?: boolean;
};

export type UpdateAccountInput = Partial<CreateAccountInput>;

// ==================================================
// TRANSACTION CATEGORY
// ==================================================

export type CategoryType = "income" | "expense";

export interface TransactionCategory {
  id: string;
  user_id?: string | null;
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  is_default: boolean;
  created_at: string;
}

export type CreateCategoryInput = {
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  is_default?: boolean;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

// ==================================================
// TRANSACTION
// ==================================================

export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  merchant: string | null;
  note: string | null;
  transaction_date: string;
  source: "manual" | "email";
  external_id?: string | null;
  dedupe_key?: string | null;
  email_message_id?: string | null;
  review_status: "pending" | "confirmed" | "ignored";
  created_at: string;
  updated_at: string;

  // Relations
  account?: Account | null;
  category?: TransactionCategory | null;
}

export type CreateTransactionInput = {
  account_id?: string | null;
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  currency?: string;
  merchant?: string | null;
  note?: string | null;
  transaction_date?: string;
  source?: "manual" | "email";
  external_id?: string | null;
  dedupe_key?: string | null;
  email_message_id?: string | null;
  review_status?: "pending" | "confirmed" | "ignored";
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;
