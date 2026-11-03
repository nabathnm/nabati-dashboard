"use client";

import { Button } from "@/components/ui/button";
import { NOTE_CATEGORIES } from "@/lib/services/note-service";
import type { Note, NoteCategory } from "@/types/note";
import { FilePlus, FileText, Sparkles } from "lucide-react";
import { AddFolderCard, NoteFolderCard } from "./NoteFolderCard";
import { NoteWorkflowCard } from "./NoteWorkflowCard";

interface NoteCardGridProps {
  notes: Note[];
  allNotes?: Note[];
  activeCategory: NoteCategory | "All";
  onSelectCategory: (cat: NoteCategory | "All") => void;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onCreateInFolder?: (cat: NoteCategory) => void;
  onOpenTemplates?: () => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onToggleArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  userInitial?: string;
}

export function NoteCardGrid({
  notes,
  allNotes = [],
  activeCategory,
  onSelectCategory,
  onSelectNote,
  onCreateNote,
  onCreateInFolder,
  onOpenTemplates,
  onTogglePin,
  onDuplicate,
  onToggleArchive,
  onDelete,
  userInitial = "U",
}: NoteCardGridProps) {
  // Use allNotes or notes to count items per category
  const sourceNotes = allNotes.length > 0 ? allNotes : notes;

  const getCategoryCount = (category: NoteCategory) => {
    return sourceNotes.filter((n) => n.category === category && !n.is_archived).length;
  };

  const handleFolderClick = (category: NoteCategory) => {
    if (activeCategory === category) {
      onSelectCategory("All");
    } else {
      onSelectCategory(category);
    }
  };

  return (
    <div className="space-y-10">
      {/* ==================================================================== */}
      {/* SECTION 1: FOLDERS                                                   */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground font-mono">
              Folders
            </h2>
            <span className="flex size-6 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-muted-foreground border border-border/50">
              {NOTE_CATEGORIES.length}
            </span>
          </div>

          {activeCategory !== "All" && (
            <button
              onClick={() => onSelectCategory("All")}
              className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              Reset filter ({activeCategory})
            </button>
          )}
        </div>

        {/* Folders Responsive Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {NOTE_CATEGORIES.map((cat) => (
            <NoteFolderCard
              key={cat}
              category={cat}
              count={getCategoryCount(cat)}
              isActive={activeCategory === cat}
              onSelect={handleFolderClick}
              onCreateInFolder={(cat) => {
                if (onCreateInFolder) onCreateInFolder(cat);
                else onCreateNote();
              }}
              userInitial={userInitial}
            />
          ))}

          {/* Add Folder Slot */}
          <AddFolderCard
            onAdd={() => {
              if (onOpenTemplates) onOpenTemplates();
              else onCreateNote();
            }}
          />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 2: WORKFLOWS / NOTES                                         */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground font-mono">
              Workflows
            </h2>
            <span className="flex size-6 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-muted-foreground border border-border/50">
              {notes.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTemplates && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTemplates}
                className="h-8 gap-1.5 rounded-xl font-mono text-xs"
              >
                <Sparkles className="size-3.5 text-cyan-500" />
                <span className="hidden sm:inline">Templates</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={onCreateNote}
              className="h-8 gap-1.5 rounded-xl bg-cyan-600 text-white font-mono text-xs hover:bg-cyan-500 shadow-xs"
            >
              <FilePlus className="size-3.5" />
              <span>+ New Note</span>
            </Button>
          </div>
        </div>

        {/* Notes Grid or Empty State */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 py-16 text-center px-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3 shadow-inner">
              <FileText className="size-6 text-cyan-500" />
            </div>
            <h3 className="font-mono text-base font-semibold text-foreground">
              Tidak ada catatan yang sesuai
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {activeCategory !== "All"
                ? `Belum ada catatan pada folder "${activeCategory}". Anda dapat membuat catatan baru sekarang.`
                : "Tidak ditemukan catatan dengan kata kunci atau filter ini."}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {activeCategory !== "All" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl font-mono text-xs"
                  onClick={() => onSelectCategory("All")}
                >
                  Tampilkan Semua Folder
                </Button>
              )}
              <Button
                size="sm"
                className="gap-1.5 rounded-xl bg-cyan-600 text-white font-mono text-xs hover:bg-cyan-500 shadow-xs"
                onClick={onCreateNote}
              >
                <FilePlus className="size-3.5" />
                <span>Buat Catatan Baru</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {notes.map((note) => (
              <NoteWorkflowCard
                key={note.id}
                note={note}
                onSelect={onSelectNote}
                onTogglePin={onTogglePin}
                onDuplicate={onDuplicate}
                onToggleArchive={onToggleArchive}
                onDelete={onDelete}
                userInitial={userInitial}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
