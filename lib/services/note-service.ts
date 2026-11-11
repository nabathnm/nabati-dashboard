// lib/services/note-service.ts
import { supabase } from "@/lib/supabase";
import type {
  CreateNoteInput,
  Note,
  NoteCategory,
  NoteFilters,
  NoteTemplate,
  UpdateNoteInput,
} from "@/types/note";

const TABLE = "notes";
const LOCAL_STORAGE_KEY = "dashboard_notion_notes_v1";

export const NOTE_CATEGORIES: readonly NoteCategory[] = [
  "Kuliah",
  "Work",
  "Personal",
  "Ideas",
  "Project",
  "Lainnya",
];

export const NOTE_COVERS = [
  "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
  "linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)",
  "linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)",
  "linear-gradient(135deg, #10b981 0%, #84cc16 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
  "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
];

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "welcome-guide",
    title: "Welcome to Notes (Notion Style)",
    description: "Panduan cepat fitur catatan bergaya Notion & cara menggunakannya.",
    icon: "🚀",
    category: "Personal",
    cover_image: NOTE_COVERS[0],
    tags: ["Guide", "Notion", "Productivity"],
    content: `# Welcome to Your Notion-style Workspace ✨

Selamat datang di modul catatan baru Anda! Di sini Anda dapat menulis, menyusun ide, dan mengatur proyek dengan gaya minimalis ala Notion.

> 💡 **Tip Cepat:** Gunakan toolbar di atas untuk memasukkan heading, checklist, callout, atau kode dengan satu klik!

---

### ✨ Fitur Utama:
- [x] **Page Icon & Cover:** Kustomisasi ikon emoji dan header gradien untuk setiap catatan.
- [x] **Interactive Checklist:** Klik kotak untuk menandai selesai langsung dari tampilan catatan.
- [x] **Callout & Quotes:** Blok khusus untuk menonjolkan informasi penting.
- [x] **Tags & Kategori:** Kelompokkan tugas Kuliah, Work, Personal, atau Ide.
- [ ] **Eksplorasi Template:** Coba buat catatan baru dengan template rapat atau proyek.

---

### 📌 Contoh Callout Penting
> ⚡ **Ingat:** Semua perubahan otomatis disimpan. Anda juga dapat menyematkan (pin) catatan penting agar selalu muncul di bagian atas!

\`\`\`typescript
// Contoh blok kode
interface MyNote {
  title: string;
  status: "draft" | "published";
}
\`\`\`
`,
  },
  {
    id: "meeting-notes",
    title: "Meeting Notes Template",
    description: "Template catatan rapat, poin diskusi, dan tindak lanjut (action items).",
    icon: "📋",
    category: "Work",
    cover_image: NOTE_COVERS[1],
    tags: ["Meeting", "ActionItems", "Team"],
    content: `# Meeting Notes: [Nama Proyek/Topik] 📋

**Tanggal:** [Tanggal Rapat]
**Peserta:** [Daftar Peserta]
**Tujuan:** [Tujuan pertemuan hari ini]

---

### 🎯 Agenda Utama
1. Evaluasi progres sprint sebelumnya
2. Pembahasan kendala teknis & arsitektur
3. Alokasi tugas minggu depan

---

### 💬 Poin Diskusi & Keputusan
- Poin 1: Hasil diskusi terkait integrasi database
- Poin 2: Keputusan desain arsitektur
- Poin 3: Timeline rilis fase 1

> 💡 **Keputusan Final:** Rilis dijadwalkan pada hari Jumat minggu depan setelah QA testing.

---

### ✅ Action Items (Tindak Lanjut)
- [ ] Siapkan dokumen spesifikasi API
- [ ] Review pull request modul transaksi
- [ ] Jadwalkan demo produk kepada stakeholder
`,
  },
  {
    id: "project-spec",
    title: "Project Roadmap & Architecture",
    description: "Rencana pengembangan fitur, arsitektur data, dan milestone.",
    icon: "🛠️",
    category: "Project",
    cover_image: NOTE_COVERS[2],
    tags: ["Project", "Roadmap", "Tech"],
    content: `# Project Roadmap & Tech Spec 🛠️

Dokumen rencana kerja dan arsitektur untuk sistem dashboard modern.

---

### 🎯 Target & Objektif
Membangun antarmuka dashboard cerdas dengan integrasi Supabase, manajemen tugas real-time, dan pencatatan berbasis markdown.

---

### 🏗️ Arsitektur Data
\`\`\`sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  icon TEXT DEFAULT '📝',
  cover_image TEXT,
  category TEXT DEFAULT 'Personal',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

---

### 📅 Milestones
- [x] Phase 1: Authentication & Supabase Integration
- [x] Phase 2: Tasks & Calendar View
- [ ] Phase 3: Notion-like Notes System
- [ ] Phase 4: Analytics & Exporting Data
`,
  },
  {
    id: "reading-list",
    title: "Reading & Learning Journal",
    description: "Daftar buku, artikel belajar, dan ringkasan ilmu.",
    icon: "📚",
    category: "Kuliah",
    cover_image: NOTE_COVERS[3],
    tags: ["Study", "Books", "Learning"],
    content: `# Reading & Learning Journal 📚

Pusat rangkuman materi kuliah, buku yang sedang dibaca, dan wawasan baru.

---

### 📖 Sedang Dibaca:
- [x] **Designing Data-Intensive Applications** - Martin Kleppmann
- [ ] **Clean Code & Architecture** - Robert C. Martin
- [ ] **Next.js & React 19 Patterns** - Vercel Engineering

---

### 💡 Rangkuman Utama
> 🧠 *"Simplicity is prerequisite for reliability."* — Edsger W. Dijkstra

Poin pembelajaran minggu ini:
1. Optimistic UI updates untuk pengalaman pengguna yang cepat.
2. Normalisasi status sinkronisasi antara offline storage dan database cloud.
`,
  },
];

/* -------------------------------------------------------------------------- */
/*  Notifikasi Perubahan (Observer Pattern)                                   */
/* -------------------------------------------------------------------------- */

type NoteChangeListener = () => void;
const changeListeners = new Set<NoteChangeListener>();

export function subscribeToNoteChanges(listener: NoteChangeListener): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

function notifyNotesChanged(): void {
  changeListeners.forEach((listener) => listener());
}

/* -------------------------------------------------------------------------- */
/*  Local Storage Helpers (Fallback)                                          */
/* -------------------------------------------------------------------------- */

function getLocalNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // Seed default notes from templates
      const initialNotes: Note[] = NOTE_TEMPLATES.map((tpl, idx) => ({
        id: `note-${idx + 1}-${Date.now()}`,
        title: tpl.title,
        content: tpl.content,
        icon: tpl.icon,
        cover_image: tpl.cover_image,
        category: tpl.category,
        tags: tpl.tags,
        is_pinned: idx === 0,
        is_archived: false,
        created_at: new Date(Date.now() - idx * 86400000).toISOString(),
        updated_at: new Date(Date.now() - idx * 3600000).toISOString(),
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialNotes));
      return initialNotes;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse local notes", e);
    return [];
  }
}

function saveLocalNotes(notes: Note[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save local notes", e);
  }
}

/* -------------------------------------------------------------------------- */
/*  Service Methods                                                           */
/* -------------------------------------------------------------------------- */

export async function getNotes(filters?: NoteFilters): Promise<Note[]> {
  try {
    // Attempt Supabase fetch
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (userId) {
      let query = supabase
        .from(TABLE)
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (filters?.is_archived !== undefined) {
        query = query.eq("is_archived", filters.is_archived);
      } else {
        query = query.eq("is_archived", false);
      }

      if (filters?.category && filters.category !== "All") {
        query = query.eq("category", filters.category);
      }

      if (filters?.is_pinned !== undefined) {
        query = query.eq("is_pinned", filters.is_pinned);
      }

      const { data, error } = await query;

      if (!error && data) {
        let results = data as Note[];
        if (filters?.search?.trim()) {
          const s = filters.search.toLowerCase();
          results = results.filter(
            (n) =>
              n.title.toLowerCase().includes(s) ||
              n.content.toLowerCase().includes(s) ||
              n.tags?.some((t) => t.toLowerCase().includes(s))
          );
        }
        return results;
      }
    }
  } catch {
    // Fallback quietly to localStorage
  }

  // Local Storage Fallback
  let notes = getLocalNotes();

  if (filters?.is_archived !== undefined) {
    notes = notes.filter((n) => n.is_archived === filters.is_archived);
  } else {
    notes = notes.filter((n) => !n.is_archived);
  }

  if (filters?.category && filters.category !== "All") {
    notes = notes.filter((n) => n.category === filters.category);
  }

  if (filters?.is_pinned !== undefined) {
    notes = notes.filter((n) => n.is_pinned === filters.is_pinned);
  }

  if (filters?.tag) {
    notes = notes.filter((n) => n.tags?.includes(filters.tag!));
  }

  if (filters?.search?.trim()) {
    const s = filters.search.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(s) ||
        n.content.toLowerCase().includes(s) ||
        n.tags?.some((t) => t.toLowerCase().includes(s))
    );
  }

  // Sort pinned first, then newest updated
  return notes.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export async function getNoteById(id: string): Promise<Note | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      return data as Note;
    }
  } catch {
    // Fallback
  }

  const localNotes = getLocalNotes();
  return localNotes.find((n) => n.id === id) || null;
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const now = new Date().toISOString();
  const newNote: Note = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title?.trim() || "Untitled Note",
    content: input.content || "",
    icon: input.icon || "📝",
    cover_image: input.cover_image ?? null,
    category: input.category || "Personal",
    tags: input.tags || [],
    is_pinned: input.is_pinned ?? false,
    is_archived: input.is_archived ?? false,
    created_at: now,
    updated_at: now,
  };

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (userId) {
      // Biarkan Supabase men-generate UUID jika id client belum berupa UUID standar
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newNote.id);
      const { id: _tempId, ...dbPayload } = newNote;
      const insertData = isUuid ? { ...newNote, user_id: userId } : { ...dbPayload, user_id: userId };

      const { data, error } = await supabase
        .from(TABLE)
        .insert([insertData])
        .select()
        .single();

      if (!error && data) {
        notifyNotesChanged();
        return data as Note;
      }
    }
  } catch {
    // Fallback
  }

  // Fallback to local storage
  const notes = getLocalNotes();
  notes.unshift(newNote);
  saveLocalNotes(notes);
  notifyNotesChanged();
  return newNote;
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput
): Promise<Note> {
  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...input, updated_at: now })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      notifyNotesChanged();
      return data as Note;
    }
  } catch {
    // Fallback
  }

  // Local storage update
  const notes = getLocalNotes();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) {
    throw new Error("Catatan tidak ditemukan");
  }

  const updated: Note = {
    ...notes[index],
    ...input,
    updated_at: now,
  };

  notes[index] = updated;
  saveLocalNotes(notes);
  notifyNotesChanged();
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  try {
    await supabase.from(TABLE).delete().eq("id", id);
  } catch {
    // Fallback
  }

  const notes = getLocalNotes().filter((n) => n.id !== id);
  saveLocalNotes(notes);
  notifyNotesChanged();
}

export async function togglePinNote(id: string): Promise<Note> {
  const current = await getNoteById(id);
  if (!current) throw new Error("Catatan tidak ditemukan");
  return updateNote(id, { is_pinned: !current.is_pinned });
}

export async function toggleArchiveNote(id: string): Promise<Note> {
  const current = await getNoteById(id);
  if (!current) throw new Error("Catatan tidak ditemukan");
  return updateNote(id, { is_archived: !current.is_archived });
}

export async function duplicateNote(id: string): Promise<Note> {
  const current = await getNoteById(id);
  if (!current) throw new Error("Catatan tidak ditemukan");

  return createNote({
    title: `${current.title} (Copy)`,
    content: current.content,
    icon: current.icon,
    cover_image: current.cover_image,
    category: current.category,
    tags: [...current.tags],
    is_pinned: false,
    is_archived: false,
  });
}

