
 // ==================================================
// ACCOUNT
// ==================================================

export type AccountType =
  | "cash"
  | "bank"
  | "e_wallet"
  | "investment"
  | "other";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateAccountInput = {
  name: string;
  type: AccountType;
  currency?: string;
  color?: string | null;
  icon?: string | null;
};

export type UpdateAccountInput = Partial<CreateAccountInput>;

// ==================================================
// TRANSACTION
// ==================================================

export type TransactionType =
  | "income"
  | "expense"
  | "transfer";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  destination_account_id: string | null;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  merchant: string | null;
  note: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;

  // Relations
  account?: Account;
  destination_account?: Account;
  category?: TransactionCategory;
  items?: TransactionItem[];
}

export type CreateTransactionInput = {
  account_id: string;
  destination_account_id?: string | null;
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  merchant?: string | null;
  note?: string | null;
  transaction_date?: string;
  items?: CreateTransactionItemInput[];
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

// ==================================================
// TRANSACTION CATEGORY
// ==================================================

export type CategoryType = "income" | "expense";

export interface TransactionCategory {
  id: string;
  user_id: string | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export type CreateCategoryInput = {
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

// ==================================================
// TRANSACTION ITEM
// ==================================================

export interface TransactionItem {
  id: string;
  transaction_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  amount: number;
  category_id: string | null;
  created_at: string;

  // Relations
  category?: TransactionCategory;
}

export type CreateTransactionItemInput = {
  name: string;
  quantity: number;
  unit_price: number;
  amount: number;
  category_id?: string | null;
};

export type UpdateTransactionItemInput =
  Partial<CreateTransactionItemInput>;
