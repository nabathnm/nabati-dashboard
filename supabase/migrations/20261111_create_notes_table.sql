-- ==============================================================================
-- Migration: Create Notes Table for Notes Management (Google Drive & Docs System)
-- Platform: Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Pastikan ekstensi UUID tersedia
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Buat tabel 'notes'
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Dokumen Tanpa Judul',
  content TEXT DEFAULT '',
  icon TEXT DEFAULT '📄',
  cover_image TEXT DEFAULT NULL,
  category TEXT NOT NULL DEFAULT 'Kuliah',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraint kategori yang valid
  CONSTRAINT check_note_category CHECK (
    category IN ('Kuliah', 'Work', 'Personal', 'Ideas', 'Project', 'Lainnya')
  )
);

-- Berikan komentar dokumentasi pada tabel
COMMENT ON TABLE public.notes IS 'Menyimpan dokumen dan catatan pengguna untuk fitur Notes Management ala Google Drive & Docs.';
COMMENT ON COLUMN public.notes.id IS 'ID unik dokumen (UUID).';
COMMENT ON COLUMN public.notes.user_id IS 'ID pemilik dokumen yang terhubung ke auth.users.';
COMMENT ON COLUMN public.notes.title IS 'Judul dokumen Google Docs.';
COMMENT ON COLUMN public.notes.content IS 'Isi dokumen berformat Markdown/Plaintext.';
COMMENT ON COLUMN public.notes.icon IS 'Ikon dokumen atau emoji.';
COMMENT ON COLUMN public.notes.category IS 'Folder tempat dokumen disimpan (Kuliah, Work, Personal, Ideas, Project, Lainnya).';
COMMENT ON COLUMN public.notes.is_pinned IS 'Status bintang / pin (Starred).';
COMMENT ON COLUMN public.notes.is_archived IS 'Status arsip / sampah (Archived/Trash).';

-- ==============================================================================
-- 3. INDEXES UNTUK PERFORMA QUERY CEPAT
-- ==============================================================================

-- Index pencarian berdasarkan user_id
CREATE INDEX IF NOT EXISTS idx_notes_user_id 
  ON public.notes(user_id);

-- Index gabungan untuk filter utama & pengurutan (Drive list / grid)
CREATE INDEX IF NOT EXISTS idx_notes_user_status_sort 
  ON public.notes(user_id, is_archived, is_pinned, updated_at DESC);

-- Index filter per folder kategori
CREATE INDEX IF NOT EXISTS idx_notes_category 
  ON public.notes(user_id, category);

-- Index Full-Text Search untuk fitur pencarian di bilah Google Drive
CREATE INDEX IF NOT EXISTS idx_notes_search 
  ON public.notes USING gin(
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, ''))
  );

-- ==============================================================================
-- 4. OTOMATISASI PERUBAHAN updated_at (TRIGGER)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notes_updated_at ON public.notes;
CREATE TRIGGER trigger_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notes_updated_at();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) - ISOLASI DATA MULTI-PENGGUNA
-- ==============================================================================

-- Aktifkan RLS pada tabel notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Pengguna hanya dapat membaca (SELECT) dokumen miliknya sendiri
CREATE POLICY "Users can view their own notes"
  ON public.notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Pengguna hanya dapat menambahkan (INSERT) dokumen miliknya sendiri
CREATE POLICY "Users can create their own notes"
  ON public.notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Pengguna hanya dapat memperbarui (UPDATE) dokumen miliknya sendiri
CREATE POLICY "Users can update their own notes"
  ON public.notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Pengguna hanya dapat menghapus (DELETE) dokumen miliknya sendiri
CREATE POLICY "Users can delete their own notes"
  ON public.notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. REALTIME REPLICATION (SUPABASE REALTIME)
-- ==============================================================================

-- Menambahkan tabel notes ke publication realtime agar perubahan data langsung
-- tersinkronisasi di UI tanpa perlu refresh manual.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
  END IF;
END $$;
