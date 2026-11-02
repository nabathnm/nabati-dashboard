"use client";

import { useEffect, useState } from "react";
import type { Note, NoteCategory, NoteTemplate } from "@/types/note";
import {
  createNote,
  deleteNote,
  duplicateNote,
  getNotes,
  subscribeToNoteChanges,
  toggleArchiveNote,
  togglePinNote,
  updateNote,
} from "@/lib/services/note-service";
import { PageHeader } from "@/components/common/page-header";
import { NoteSidebar } from "@/components/notes/NoteSidebar";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteCardGrid } from "@/components/notes/NoteCardGrid";
import { NoteTemplatesModal } from "@/components/notes/NoteTemplatesModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Columns2,
  FilePlus,
  Grid2X2,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"workspace" | "gallery">("workspace");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<NoteCategory | "All">("All");
  const [activeTab, setActiveTab] = useState<"all" | "pinned" | "archived">("all");

  // Templates modal
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Fetch Notes
  const loadNotes = async () => {
    try {
      const data = await getNotes({
        search: searchQuery,
        category: activeCategory,
        is_pinned: activeTab === "pinned" ? true : undefined,
        is_archived: activeTab === "archived" ? true : false,
      });
      setNotes(data);

      // Maintain or set selected note
      setSelectedNote((prev) => {
        if (!prev && data.length > 0) {
          return data[0];
        }
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
  }, [searchQuery, activeCategory, activeTab]);

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
    } catch (err) {
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
        const remaining = notes.filter((n) => n.id !== id);
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
    <div className="space-y-4 px-2 sm:px-4 py-2">
      {/* Top Header */}
      <PageHeader
        title="Notes Management"
        description="Workspace catatan bergaya Notion dengan markdown, block checklist, dan template."
      >
        <div className="flex items-center gap-2">
          {/* Layout Mode Switcher */}
          <div className="flex items-center p-0.5 bg-muted/70 rounded-lg text-xs">
            <button
              onClick={() => setLayoutMode("workspace")}
              className={cn(
                "px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all",
                layoutMode === "workspace"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Tampilan Editor Workspace"
            >
              <Columns2 className="size-3.5" />
              <span className="hidden sm:inline">Workspace</span>
            </button>
            <button
              onClick={() => setLayoutMode("gallery")}
              className={cn(
                "px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all",
                layoutMode === "gallery"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Tampilan Galeri Kartu"
            >
              <Grid2X2 className="size-3.5" />
              <span className="hidden sm:inline">Galeri</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setIsTemplatesModalOpen(true)}
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="hidden md:inline">Templates</span>
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs shadow-xs"
            onClick={handleCreateNote}
          >
            <FilePlus className="size-3.5" />
            <span>Catatan Baru</span>
          </Button>
        </div>
      </PageHeader>

      {/* Main Content Area */}
      {layoutMode === "workspace" ? (
        /* Workspace Split View */
        <div className="flex h-[calc(100vh-12rem)] min-h-[580px] rounded-2xl border border-border/70 overflow-hidden bg-card/40 backdrop-blur-md shadow-xs">
          {/* Left Sidebar */}
          {isSidebarOpen && (
            <div className="w-80 md:w-88 shrink-0 h-full">
              <NoteSidebar
                notes={notes}
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
                activeTab={activeTab}
                onTabChange={setActiveTab}
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
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <span className="text-4xl mb-3">📝</span>
                <h3 className="text-base font-semibold text-foreground">
                  Pilih atau buat catatan
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Pilih dokumen di sidebar kiri atau buat halaman baru untuk mulai menulis.
                </p>
                <Button size="sm" className="mt-4 gap-1.5" onClick={handleCreateNote}>
                  <FilePlus className="size-4" />
                  <span>Buat Catatan</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Gallery / Card Grid View */
        <div className="space-y-4">
          {/* Quick Search & Filters for Gallery */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card/60 backdrop-blur-md rounded-2xl border border-border/60">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari catatan dalam galeri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background/50 border-border/60"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs transition-colors",
                  activeTab === "all"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                Semua ({notes.length})
              </button>
              <button
                onClick={() => setActiveTab("pinned")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs transition-colors",
                  activeTab === "pinned"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                ⭐ Pinned
              </button>
              <button
                onClick={() => setActiveTab("archived")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs transition-colors",
                  activeTab === "archived"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                📦 Arsip
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <NoteCardGrid
            notes={notes}
            onSelectNote={(note) => {
              setSelectedNote(note);
              setLayoutMode("workspace");
            }}
            onCreateNote={handleCreateNote}
            onTogglePin={handleTogglePin}
            onDuplicate={handleDuplicate}
            onToggleArchive={handleToggleArchive}
            onDelete={handleDeleteNote}
          />
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

