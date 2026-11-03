"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Note, NoteCategory, NoteTemplate } from "@/types/note";
import {
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
import { NoteSidebar } from "@/components/notes/NoteSidebar";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteCardGrid } from "@/components/notes/NoteCardGrid";
import { NoteTemplatesModal } from "@/components/notes/NoteTemplatesModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Columns2,
  FilePlus,
  Grid2X2,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function NotesPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"workspace" | "gallery">("gallery");

  // Filters state (Aligned with Floe reference)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pinned" | "archived">("all");
  const [activeCategory, setActiveCategory] = useState<NoteCategory | "All">("All");
  const [dateFilter, setDateFilter] = useState<"any" | "today" | "week" | "month">("any");
  const [selectedTag, setSelectedTag] = useState<string>("All");

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

  // Load all notes from Supabase
  const loadNotes = async () => {
    try {
      const data = await getNotes({
        is_archived: statusFilter === "archived" ? true : undefined,
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
  }, [statusFilter]);

  // Extract all unique tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    allNotes.forEach((n) => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set);
  }, [allNotes]);

  // Filtered notes based on all active controls
  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = note.content.toLowerCase().includes(q);
        const tagMatch = note.tags?.some((t) => t.toLowerCase().includes(q));
        const catMatch = note.category.toLowerCase().includes(q);
        if (!titleMatch && !contentMatch && !tagMatch && !catMatch) return false;
      }

      // 2. Status Filter
      if (statusFilter === "archived" && !note.is_archived) return false;
      if (statusFilter !== "archived" && note.is_archived) return false;
      if (statusFilter === "pinned" && !note.is_pinned) return false;
      if (statusFilter === "active" && note.is_pinned) return false;

      // 3. Category Filter
      if (activeCategory !== "All" && note.category !== activeCategory) return false;

      // 4. Tag Filter
      if (selectedTag !== "All" && (!note.tags || !note.tags.includes(selectedTag))) {
        return false;
      }

      // 5. Date Filter
      if (dateFilter !== "any") {
        const updatedTime = new Date(note.updated_at).getTime();
        const now = Date.now();
        const diffHours = (now - updatedTime) / (1000 * 60 * 60);

        if (dateFilter === "today" && diffHours > 24) return false;
        if (dateFilter === "week" && diffHours > 24 * 7) return false;
        if (dateFilter === "month" && diffHours > 24 * 30) return false;
      }

      return true;
    });
  }, [allNotes, searchQuery, statusFilter, activeCategory, selectedTag, dateFilter]);

  // Create Blank Note
  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: "Tanpa Judul",
        content: "",
        category: activeCategory !== "All" ? activeCategory : "Personal",
        icon: "📝",
      });
      setSelectedNote(newNote);
      setLayoutMode("workspace");
      toast.success("Catatan baru dibuat!");
    } catch {
      toast.error("Gagal membuat catatan");
    }
  };

  // Create Note in a specific category
  const handleCreateNoteInFolder = async (cat: NoteCategory) => {
    try {
      const newNote = await createNote({
        title: "Catatan Baru",
        content: "",
        category: cat,
        icon: "📝",
      });
      setSelectedNote(newNote);
      setLayoutMode("workspace");
      toast.success(`Catatan baru di folder "${cat}" dibuat!`);
    } catch {
      toast.error("Gagal membuat catatan");
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
        icon: template.icon,
        category: template.category,
        cover_image: template.cover_image,
        tags: template.tags,
      });
      setSelectedNote(newNote);
      setLayoutMode("workspace");
      toast.success(`Catatan dari template "${template.title}" dibuat!`);
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
      toast.error("Gagal memperbarui catatan");
    }
  };

  // Delete Note
  const handleDeleteNote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus catatan ini?")) return;

    try {
      await deleteNote(id);
      if (selectedNote?.id === id) {
        const remaining = allNotes.filter((n) => n.id !== id);
        setSelectedNote(remaining[0] || null);
      }
      toast.success("Catatan berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus catatan");
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await togglePinNote(id);
      if (selectedNote?.id === id) setSelectedNote(updated);
      toast.success(
        updated.is_pinned ? "Catatan disematkan (Pinned)" : "Sematan catatan dilepas"
      );
    } catch {
      toast.error("Gagal mengubah status pin");
    }
  };

  // Duplicate Note
  const handleDuplicate = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const dup = await duplicateNote(id);
      setSelectedNote(dup);
      setLayoutMode("workspace");
      toast.success("Catatan berhasil digandakan");
    } catch {
      toast.error("Gagal menggandakan catatan");
    }
  };

  // Toggle Archive
  const handleToggleArchive = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await toggleArchiveNote(id);
      if (selectedNote?.id === id) setSelectedNote(null);
      toast.success(
        updated.is_archived ? "Catatan diarsipkan" : "Catatan dikembalikan dari arsip"
      );
    } catch {
      toast.error("Gagal mengubah arsip");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ==================================================================== */}
      {/* 1. TOP SEARCH BAR WITH KEYBOARD SHORTCUT (⌘ F)                       */}
      {/* ==================================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input Box */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-2xl border border-border/70 bg-card/70 pl-9 pr-14 text-xs font-mono text-foreground placeholder:text-muted-foreground shadow-2xs backdrop-blur-md focus:border-cyan-500/60 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <kbd className="rounded-md border border-border/70 bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
              ⌘ F
            </kbd>
          </div>
        </div>

        {/* Top-Right Stats / Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>Live Workspace</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 px-2.5 py-1 font-mono text-xs text-muted-foreground shadow-2xs">
            <span>Total:</span>
            <span className="font-semibold text-foreground">{allNotes.length} notes</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. PAGE HEADER ROW: TITLE & FLOE FILTER CONTROLS                     */}
      {/* ==================================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
            My Workflows
          </h1>
        </div>

        {/* Filter Pills (Status, Category, Date, Tags, View Toggle) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 text-xs font-mono font-medium text-muted-foreground shadow-2xs hover:text-foreground hover:bg-muted/60 transition-all focus-visible:outline-hidden">
              <span>
                Status:{" "}
                <span className="font-semibold text-foreground capitalize">
                  {statusFilter === "all" ? "All" : statusFilter}
                </span>
              </span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 font-mono text-xs">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pinned")}>
                Pinned ⭐
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("archived")}>
                Archived 📦
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 text-xs font-mono font-medium text-muted-foreground shadow-2xs hover:text-foreground hover:bg-muted/60 transition-all focus-visible:outline-hidden">
              <span>
                Folder:{" "}
                <span className="font-semibold text-foreground">
                  {activeCategory === "All" ? "Any" : activeCategory}
                </span>
              </span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 font-mono text-xs">
              <DropdownMenuItem onClick={() => setActiveCategory("All")}>
                Any (Semua)
              </DropdownMenuItem>
              {NOTE_CATEGORIES.map((cat) => (
                <DropdownMenuItem key={cat} onClick={() => setActiveCategory(cat)}>
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 text-xs font-mono font-medium text-muted-foreground shadow-2xs hover:text-foreground hover:bg-muted/60 transition-all focus-visible:outline-hidden">
              <span>
                Date:{" "}
                <span className="font-semibold text-foreground">
                  {dateFilter === "any"
                    ? "Any"
                    : dateFilter === "today"
                    ? "Hari ini"
                    : dateFilter === "week"
                    ? "7 hari"
                    : "30 hari"}
                </span>
              </span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 font-mono text-xs">
              <DropdownMenuItem onClick={() => setDateFilter("any")}>
                Any
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("today")}>
                Hari Ini
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("week")}>
                7 Hari Terakhir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("month")}>
                30 Hari Terakhir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tags Dropdown */}
          {availableTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 text-xs font-mono font-medium text-muted-foreground shadow-2xs hover:text-foreground hover:bg-muted/60 transition-all focus-visible:outline-hidden">
                <span>
                  Tags:{" "}
                  <span className="font-semibold text-foreground">
                    {selectedTag}
                  </span>
                </span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 font-mono text-xs max-h-56 overflow-y-auto">
                <DropdownMenuItem onClick={() => setSelectedTag("All")}>
                  All Tags
                </DropdownMenuItem>
                {availableTags.map((tag) => (
                  <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)}>
                    #{tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* View Mode Switcher Button */}
          <div className="flex items-center rounded-xl border border-border/70 bg-card p-0.5 shadow-2xs">
            <button
              onClick={() => setLayoutMode("gallery")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-lg px-2.5 font-mono text-xs transition-all cursor-pointer",
                layoutMode === "gallery"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Galeri Floe"
            >
              <Grid2X2 className="size-3.5" />
              <span className="hidden sm:inline">Galeri</span>
            </button>
            <button
              onClick={() => setLayoutMode("workspace")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-lg px-2.5 font-mono text-xs transition-all cursor-pointer",
                layoutMode === "workspace"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Notion Workspace Editor"
            >
              <Columns2 className="size-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MAIN CONTENT: GALLERY MODE (FLOE AESTHETIC) OR WORKSPACE          */}
      {/* ==================================================================== */}
      {layoutMode === "gallery" ? (
        <NoteCardGrid
          notes={filteredNotes}
          allNotes={allNotes}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onSelectNote={(note) => {
            setSelectedNote(note);
            setLayoutMode("workspace");
          }}
          onCreateNote={handleCreateNote}
          onCreateInFolder={handleCreateNoteInFolder}
          onOpenTemplates={() => setIsTemplatesModalOpen(true)}
          onTogglePin={handleTogglePin}
          onDuplicate={handleDuplicate}
          onToggleArchive={handleToggleArchive}
          onDelete={handleDeleteNote}
          userInitial={userInitial}
        />
      ) : (
        /* Workspace Split Notion Editor View */
        <div className="flex h-[calc(100vh-13rem)] min-h-[580px] rounded-3xl border border-border/70 overflow-hidden bg-card/40 backdrop-blur-md shadow-xs">
          {/* Left Sidebar */}
          {isSidebarOpen && (
            <div className="w-80 md:w-88 shrink-0 h-full">
              <NoteSidebar
                notes={allNotes}
                selectedNoteId={selectedNote?.id || null}
                onSelectNote={(note) => setSelectedNote(note)}
                onCreateNote={handleCreateNote}
                onOpenTemplates={() => setIsTemplatesModalOpen(true)}
                onTogglePin={handleTogglePin}
                onDuplicate={handleDuplicate}
                onToggleArchive={handleToggleArchive}
                onDelete={handleDeleteNote}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                activeTab={statusFilter === "archived" ? "archived" : statusFilter === "pinned" ? "pinned" : "all"}
                onTabChange={(tab) => setStatusFilter(tab)}
              />
            </div>
          )}

          {/* Right Editor Area */}
          <div className="flex-1 min-w-0 h-full">
            {selectedNote ? (
              <NoteEditor
                note={selectedNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onDuplicateNote={handleDuplicate}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onBackToGallery={() => setLayoutMode("gallery")}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <span className="text-4xl mb-3">📝</span>
                <h3 className="font-mono text-base font-semibold text-foreground">
                  Pilih atau buat catatan
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs font-mono">
                  Pilih dokumen di sidebar kiri atau buat halaman baru untuk mulai menulis.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono text-xs rounded-xl"
                    onClick={() => setLayoutMode("gallery")}
                  >
                    ← Kembali ke Galeri
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 font-mono text-xs rounded-xl bg-cyan-600 text-white hover:bg-cyan-500"
                    onClick={handleCreateNote}
                  >
                    <FilePlus className="size-4" />
                    <span>Buat Catatan</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Modal */}
      <NoteTemplatesModal
        open={isTemplatesModalOpen}
        onOpenChange={setIsTemplatesModalOpen}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
