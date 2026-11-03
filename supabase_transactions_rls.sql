-- ==============================================================================
-- SQL MIGRATION: ENABLE RLS & POLICIES FOR TRANSACTIONS, ACCOUNTS, & CATEGORIES
-- ==============================================================================
-- Jalankan skrip ini di:
-- Supabase Dashboard -> Project Anda -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. TABEL TRANSACTIONS (Transaksi)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Hapus check constraint transactions_check yang memblokir insert transaksi
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_check;

-- Hapus policy lama jika ada untuk mencegah duplikasi/konflik
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Enable all access for authenticated users to own transactions" ON public.transactions;

-- Izinkan SELECT transaksi milik user sendiri
CREATE POLICY "Users can view own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Izinkan INSERT transaksi untuk user sendiri
CREATE POLICY "Users can insert own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Izinkan UPDATE transaksi milik user sendiri
CREATE POLICY "Users can update own transactions"
ON public.transactions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Izinkan DELETE transaksi milik user sendiri
CREATE POLICY "Users can delete own transactions"
ON public.transactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ==============================================================================
-- 2. TABEL ACCOUNTS (Akun Keuangan: Bank, E-Wallet, Cash)
-- ==============================================================================
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Enable all access for authenticated users to own accounts" ON public.accounts;

CREATE POLICY "Users can view own accounts"
ON public.accounts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
ON public.accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
ON public.accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
ON public.accounts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ==============================================================================
-- 3. TABEL TRANSACTION_CATEGORIES (Kategori Transaksi)
-- ==============================================================================
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own and default categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Enable all access for authenticated users to own categories" ON public.transaction_categories;

-- User dapat melihat kategori miliknya sendiri ATAU kategori bawaan sistem
CREATE POLICY "Users can view own and default categories"
ON public.transaction_categories
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_default = true OR user_id IS NULL);

-- User dapat membuat kategori miliknya sendiri
CREATE POLICY "Users can insert own categories"
ON public.transaction_categories
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- User dapat mengubah kategori miliknya sendiri
CREATE POLICY "Users can update own categories"
ON public.transaction_categories
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User dapat menghapus kategori miliknya sendiri
CREATE POLICY "Users can delete own categories"
ON public.transaction_categories
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ==============================================================================
-- 4. TABEL EMAIL_CONNECTIONS & EMAIL_MESSAGES (Jika ada)
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_connections') THEN
    ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own email connections" ON public.email_connections;
    CREATE POLICY "Users can manage own email connections"
    ON public.email_connections
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_messages') THEN
    ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own email messages" ON public.email_messages;
    CREATE POLICY "Users can manage own email messages"
    ON public.email_messages
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ==============================================================================
-- 5. SEED KATEGORI BAWAAN SISTEM (Idempoten & Aman Dijalankan Berulang Kali)
-- Kategori global dengan user_id NULL dan is_default = true agar langsung siap pakai
-- ==============================================================================
INSERT INTO public.transaction_categories (name, type, is_default, user_id)
SELECT v.name, v.type, v.is_default, v.user_id
FROM (VALUES
  ('Makanan & Minuman', 'expense', true, NULL::uuid),
  ('Kopi & Nongkrong', 'expense', true, NULL::uuid),
  ('Transportasi', 'expense', true, NULL::uuid),
  ('Belanja', 'expense', true, NULL::uuid),
  ('Tagihan & Utilitas', 'expense', true, NULL::uuid),
  ('Hiburan', 'expense', true, NULL::uuid),
  ('Kesehatan', 'expense', true, NULL::uuid),
  ('Pendidikan', 'expense', true, NULL::uuid),
  ('Gaji & Pemasukan', 'income', true, NULL::uuid),
  ('Pemasukan Lainnya', 'income', true, NULL::uuid),
  ('Lainnya', 'expense', true, NULL::uuid)
) AS v(name, type, is_default, user_id)
WHERE NOT EXISTS (
  SELECT 1 FROM public.transaction_categories tc
  WHERE tc.name = v.name AND (tc.user_id IS NULL OR tc.is_default = true)
);
