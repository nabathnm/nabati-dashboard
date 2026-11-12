"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Note, NoteCategory, NoteTemplate } from "@/types/note";
import {
  cleanupDuplicateNotes,
  createNote,
  deleteNote,
  duplicateNote,
  getNotes,
  NOTE_CATEGORIES,
  subscribeToNoteChanges,
  toggleArchiveNote,
  togglePinNote,
  updateNote,
} from "@/lib/services/note-service";
import { GoogleDocsEditor } from "@/components/notes/GoogleDocsEditor";
import { DriveFolderCard } from "@/components/notes/DriveFolderCard";
import { DriveDocumentCard } from "@/components/notes/DriveDocumentCard";
import { DriveDocumentTable } from "@/components/notes/DriveDocumentTable";
import { NoteTemplatesModal } from "@/components/notes/NoteTemplatesModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Clock,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  Grid2X2,
  List as ListIcon,
  Plus,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function NotesPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Layout mode: "drive" (Google Drive file explorer) or "docs" (Google Docs document editor)
  const [layoutMode, setLayoutMode] = useState<"drive" | "docs">("drive");

  // Drive view style: "grid" (thumbnails) or "list" (table)
  const [driveViewStyle, setDriveViewStyle] = useState<"grid" | "list">("grid");

  // Drive Navigation Tabs: "all" (Drive Saya), "starred" (Berbintang), "recent" (Terbaru), "archived" (Arsip)
  const [activeTab, setActiveTab] = useState<"all" | "starred" | "recent" | "archived">("all");

  // Active folder / category filter
  const [activeCategory, setActiveCategory] = useState<NoteCategory | "All">("All");

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Sort by: "updated" or "title"
  const [sortBy, setSortBy] = useState<"updated" | "title">("updated");

  // Templates modal
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [userInitial, setUserInitial] = useState<string>("U");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+F or Ctrl+F focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch current user initial
  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setUserInitial(data.user.email.charAt(0).toUpperCase());
        }
      } catch {
        // Ignore offline / unauthenticated
      }
    }
    loadUser();
  }, []);

  // Load all notes from Supabase / localStorage
  const loadNotes = async () => {
    try {
      const data = await getNotes({
        is_archived: activeTab === "archived" ? true : undefined,
      });
      setAllNotes(data);

      // Maintain selected note
      setSelectedNote((prev) => {
        if (!prev && data.length > 0) return data[0];
        if (prev) {
          const found = data.find((n) => n.id === prev.id);
          return found || (data.length > 0 ? data[0] : null);
        }
        return null;
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat catatan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    const unsubscribe = subscribeToNoteChanges(() => {
      loadNotes();
    });
    return () => unsubscribe();
  }, [activeTab]);

  // Filtered and sorted notes
  const filteredNotes = useMemo(() => {
    let list = allNotes.filter((note) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = note.content.toLowerCase().includes(q);
        const catMatch = note.category.toLowerCase().includes(q);
        if (!titleMatch && !contentMatch && !catMatch) return false;
      }

      // 2. Active Tab Filter
      if (activeTab === "starred" && !note.is_pinned) return false;
      if (activeTab === "archived" && !note.is_archived) return false;
      if (activeTab !== "archived" && note.is_archived) return false;
      if (activeTab === "recent") {
        const updatedTime = new Date(note.updated_at).getTime();
        const diffDays = (Date.now() - updatedTime) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return false;
      }

      // 3. Category / Folder Filter
      if (activeCategory !== "All" && note.category !== activeCategory) return false;

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return list;
  }, [allNotes, searchQuery, activeTab, activeCategory, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    NOTE_CATEGORIES.forEach((cat) => {
      counts[cat] = allNotes.filter((n) => n.category === cat && !n.is_archived).length;
    });
    return counts;
  }, [allNotes]);

  // Create Blank Google Doc
  const handleCreateNote = async (categoryChoice?: NoteCategory) => {
    try {
      const targetCat =
        categoryChoice || (activeCategory !== "All" ? activeCategory : "Kuliah");
      const newNote = await createNote({
        title: "Dokumen Tanpa Judul",
        content: "",
        category: targetCat,
        icon: "📄",
      });
      setSelectedNote(newNote);
      setLayoutMode("docs");
      toast.success("Dokumen baru dibuat!");
    } catch {
      toast.error("Gagal membuat dokumen");
    }
  };

  // Create Note from Template
  const handleSelectTemplate = async (template: NoteTemplate | null) => {
    try {
      if (!template) {
        handleCreateNote();
        return;
      }
      const newNote = await createNote({
        title: template.title,
        content: template.content,
        icon: "📄",
        category: template.category,
        cover_image: template.cover_image,
        tags: template.tags,
      });
      setSelectedNote(newNote);
      setLayoutMode("docs");
      toast.success(`Dokumen dari template "${template.title}" dibuat!`);
    } catch {
      toast.error("Gagal menerapkan template");
    }
  };

  // Update Note
  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const updated = await updateNote(id, updates);
      if (selectedNote?.id === id) {
        setSelectedNote(updated);
      }
    } catch {
      toast.error("Gagal memperbarui dokumen");
    }
  };

  // Delete Note
  const handleDeleteNote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini ke sampah?")) return;

    try {
      await deleteNote(id);
      if (selectedNote?.id === id) {
        const remaining = allNotes.filter((n) => n.id !== id);
        setSelectedNote(remaining[0] || null);
        if (layoutMode === "docs") {
          setLayoutMode("drive");
        }
      }
      toast.success("Dokumen berhasil dihapus ke sampah");
    } catch {
      toast.error("Gagal menghapus dokumen");
    }
  };

  // Toggle Pin / Star
  const handleTogglePin = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await togglePinNote(id);
      if (selectedNote?.id === id) setSelectedNote(updated);
      toast.success(
        updated.is_pinned ? "Dokumen ditambahkan ke Berbintang ⭐" : "Bintang dihapus dari dokumen"
      );
    } catch {
      toast.error("Gagal mengubah status bintang");
    }
  };

  // Duplicate Note
  const handleDuplicate = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const dup = await duplicateNote(id);
      setSelectedNote(dup);
      setLayoutMode("docs");
      toast.success("Salinan dokumen berhasil dibuat!");
    } catch {
      toast.error("Gagal menyalin dokumen");
    }
  };

  // Toggle Archive
  const handleToggleArchive = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await toggleArchiveNote(id);
      if (selectedNote?.id === id) setSelectedNote(null);
      toast.success(
        updated.is_archived ? "Dokumen dipindahkan ke arsip" : "Dokumen dikembalikan dari arsip"
      );
    } catch {
      toast.error("Gagal mengubah arsip");
    }
  };

  // Cleanup Duplicate Notes
  const [isCleaning, setIsCleaning] = useState(false);
  const handleCleanupDuplicates = async () => {
    setIsCleaning(true);
    try {
      const count = await cleanupDuplicateNotes();
      if (count > 0) {
        toast.success(`Berhasil membersihkan ${count} dokumen duplikat!`);
        await loadNotes();
      } else {
        toast.info("Tidak ada dokumen duplikat yang ditemukan.");
      }
    } catch {
      toast.error("Gagal membersihkan duplikat");
    } finally {
      setIsCleaning(false);
    }
  };

  // If currently in Google Docs Document Editor Mode:
  if (layoutMode === "docs" && selectedNote) {
    return (
      <div className="h-[calc(100vh-6rem)] -mt-2 -mx-4 sm:-mx-6 rounded-2xl overflow-hidden border border-border/70 shadow-xs">
        <GoogleDocsEditor
          note={selectedNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePin}
          onDuplicateNote={handleDuplicate}
          onBackToDrive={() => setLayoutMode("drive")}
        />
      </div>
    );
  }

  // Google Drive File Explorer Mode:
  return (
    <div className="space-y-6 pb-12">
      {/* ==================================================================== */}
      {/* 1. GOOGLE DRIVE SEARCH BAR & TOP USER STATUS                         */}
      {/* ==================================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Drive Search Box */}
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Telusuri di Drive (nama dokumen atau isi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-full border border-border/70 bg-card/85 pl-10 pr-20 text-xs text-foreground placeholder:text-muted-foreground shadow-xs focus:border-blue-500 focus:bg-card focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
            <kbd className="rounded-md border border-border/70 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
              ⌘ F
            </kbd>
          </div>
        </div>

        {/* Top Status & Summary */}
        <div className="flex items-center gap-3">
          {allNotes.length > 10 && (
            <Button
              size="sm"
              variant="outline"
              disabled={isCleaning}
              onClick={handleCleanupDuplicates}
              className="h-8 gap-1.5 rounded-xl border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-mono"
              title="Bersihkan dokumen duplikat yang sama"
            >
              <Sparkles className="size-3.5" />
              <span>{isCleaning ? "Membersihkan..." : "Bersihkan Duplikat"}</span>
            </Button>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-2xs">
            <span className="size-2 rounded-full bg-blue-500" />
            <span className="font-semibold text-foreground">{allNotes.length}</span>
            <span>dokumen tersimpan</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. GOOGLE DRIVE ACTION BAR: "+ BARU" BUTTON, BREADCRUMBS, TABS       */}
      {/* ==================================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pt-1 border-t border-border/40">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Prominent Google Drive "+ Baru" Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-10 items-center gap-2 rounded-full border border-border/80 bg-card hover:bg-muted/60 text-foreground px-4 text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer focus-visible:outline-hidden">
              <Plus className="size-4 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
              <span>Baru</span>
              <ChevronDown className="size-3.5 text-muted-foreground ml-0.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 text-xs font-mono">
              <DropdownMenuItem onClick={() => handleCreateNote()}>
                <FileText className="mr-2.5 size-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-foreground">Dokumen Google Docs</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsTemplatesModalOpen(true)}>
                <Sparkles className="mr-2.5 size-4 text-amber-500" />
                <span>Dari Galeri Template</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-[10px] font-mono text-muted-foreground">
                Buat di Folder Tertentu:
              </div>
              {NOTE_CATEGORIES.map((cat) => (
                <DropdownMenuItem key={cat} onClick={() => handleCreateNote(cat)}>
                  <Folder className="mr-2 size-3.5 text-muted-foreground" />
                  <span>Folder {cat}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Drive Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground ml-1">
            <button
              onClick={() => {
                setActiveCategory("All");
                setActiveTab("all");
              }}
              className={cn(
                "hover:text-foreground transition-colors cursor-pointer",
                activeCategory === "All" && activeTab === "all"
                  ? "text-foreground font-bold"
                  : "text-muted-foreground"
              )}
            >
              Drive Saya
            </button>
            {activeCategory !== "All" && (
              <>
                <ChevronRight className="size-3.5 text-muted-foreground/60" />
                <span className="text-foreground font-bold">{activeCategory}</span>
                <button
                  type="button"
                  onClick={() => setActiveCategory("All")}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Tampilkan semua folder"
                >
                  <X className="size-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Controls: Tabs + Sort + View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation Tabs (Drive Saya, Berbintang, Terbaru, Arsip) */}
          <div className="flex items-center rounded-xl border border-border/70 bg-card p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setActiveCategory("All");
              }}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-mono transition-all cursor-pointer",
                activeTab === "all"
                  ? "bg-blue-600 text-white font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Folder className="size-3" />
              <span>Semua</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("starred")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-mono transition-all cursor-pointer",
                activeTab === "starred"
                  ? "bg-amber-500 text-white font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Star className="size-3" />
              <span>Berbintang</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("recent")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-mono transition-all cursor-pointer",
                activeTab === "recent"
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="size-3" />
              <span>Terbaru</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("archived")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-mono transition-all cursor-pointer",
                activeTab === "archived"
                  ? "bg-muted-foreground text-background font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Archive className="size-3" />
              <span>Arsip</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 text-xs font-mono text-muted-foreground shadow-2xs hover:text-foreground hover:bg-muted/60 transition-all focus-visible:outline-hidden">
              <span>Urutan: {sortBy === "updated" ? "Terakhir Diubah" : "Nama (A-Z)"}</span>
              <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs font-mono">
              <DropdownMenuItem onClick={() => setSortBy("updated")}>
                Terakhir Diubah
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title")}>
                Nama Dokumen (A-Z)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle: Grid vs List (Table) */}
          <div className="flex items-center rounded-xl border border-border/70 bg-card p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setDriveViewStyle("grid")}
              className={cn(
                "flex size-7 items-center justify-center rounded-lg transition-all cursor-pointer",
                driveViewStyle === "grid"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Tampilan Grid (Kotak)"
            >
              <Grid2X2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDriveViewStyle("list")}
              className={cn(
                "flex size-7 items-center justify-center rounded-lg transition-all cursor-pointer",
                driveViewStyle === "list"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Tampilan Daftar (Tabel)"
            >
              <ListIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. GOOGLE DRIVE FOLDERS SECTION                                      */}
      {/* ==================================================================== */}
      {activeTab === "all" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold font-mono tracking-wider text-muted-foreground uppercase">
              Folder
            </h2>
            {activeCategory !== "All" && (
              <button
                type="button"
                onClick={() => setActiveCategory("All")}
                className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Tampilkan Semua Folder
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {NOTE_CATEGORIES.map((cat) => (
              <DriveFolderCard
                key={cat}
                category={cat}
                count={categoryCounts[cat] || 0}
                isActive={activeCategory === cat}
                onSelect={(selected) => {
                  if (activeCategory === selected) {
                    setActiveCategory("All");
                  } else {
                    setActiveCategory(selected);
                  }
                }}
                onCreateInFolder={(selected) => handleCreateNote(selected)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 4. GOOGLE DRIVE FILES / DOCUMENTS SECTION                            */}
      {/* ==================================================================== */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold font-mono tracking-wider text-muted-foreground uppercase">
              Dokumen ({filteredNotes.length})
            </h2>
          </div>
        </div>

        {/* Empty State */}
        {filteredNotes.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-600 mb-3 shadow-xs">
              <FileText className="size-7" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Belum ada dokumen di sini</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Mulai membuat dokumen Google Docs baru atau gunakan template yang tersedia.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleCreateNote()}
                className="h-8 gap-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-mono shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Buat Dokumen Baru</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsTemplatesModalOpen(true)}
                className="h-8 gap-1.5 rounded-lg text-xs font-mono"
              >
                <Sparkles className="size-3.5 text-amber-500" />
                <span>Pilih Template</span>
              </Button>
            </div>
          </div>
        ) : driveViewStyle === "grid" ? (
          /* Grid View (Google Drive Document Cards with Preview) */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredNotes.map((note) => (
              <DriveDocumentCard
                key={note.id}
                note={note}
                onSelect={(selected) => {
                  setSelectedNote(selected);
                  setLayoutMode("docs");
                }}
                onTogglePin={handleTogglePin}
                onDuplicate={handleDuplicate}
                onToggleArchive={handleToggleArchive}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        ) : (
          /* List View (Google Drive Table) */
          <DriveDocumentTable
            notes={filteredNotes}
            onSelect={(selected) => {
              setSelectedNote(selected);
              setLayoutMode("docs");
            }}
            onTogglePin={handleTogglePin}
            onDuplicate={handleDuplicate}
            onToggleArchive={handleToggleArchive}
            onDelete={handleDeleteNote}
          />
        )}
      </section>

      {/* Templates Modal */}
      <NoteTemplatesModal
        open={isTemplatesModalOpen}
        onOpenChange={setIsTemplatesModalOpen}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
