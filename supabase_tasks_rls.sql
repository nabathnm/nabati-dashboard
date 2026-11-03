-- ==============================================================================
-- SQL MIGRATION: ENABLE RLS & POLICIES FOR TASKS & PROFILES
-- ==============================================================================
-- Jalankan skrip ini di Supabase Dashboard:
-- Supabase Dashboard -> Project Anda -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. PASTIKAN ENUM task_category MENDUKUNG 'Personal' JIKA DIBUTUHKAN
DO $$
BEGIN
  ALTER TYPE task_category ADD VALUE IF NOT EXISTS 'Personal';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. PASTIKAN KOLOM google_event_id TERSEDIA DI TABEL TASKS
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS google_event_id text;


-- ==============================================================================
-- 3. TABEL PROFILES (Dibutuhkan karena tasks memiliki foreign key ke profiles.id)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for authenticated users to own profile" ON public.profiles;

-- Kebijakan RLS Profiles
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Sinkronkan user auth yang belum memiliki baris di public.profiles
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);


-- ==============================================================================
-- 4. TABEL TASKS (Row Level Security & Policies)
-- ==============================================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada untuk mencegah konflik
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Enable all access for authenticated users to own tasks" ON public.tasks;

-- Izinkan SELECT tugas milik user sendiri
CREATE POLICY "Users can view own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Izinkan INSERT tugas untuk user sendiri
CREATE POLICY "Users can insert own tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Izinkan UPDATE tugas milik user sendiri
CREATE POLICY "Users can update own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Izinkan DELETE tugas milik user sendiri
CREATE POLICY "Users can delete own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. TRIGGER OTOMATIS: BUAT PROFIL SETIAP ADA USER BARU TERDAFTAR
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

