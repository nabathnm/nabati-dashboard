"use client";

import { useState } from "react";
import type { Note, NoteCategory } from "@/types/note";
import { NOTE_CATEGORIES } from "@/lib/services/note-service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  Copy,
  FilePlus,
  FileText,
  Filter,
  MoreVertical,
  Pin,
  PinOff,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteSidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onOpenTemplates: () => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onToggleArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: NoteCategory | "All";
  onCategoryChange: (cat: NoteCategory | "All") => void;
  activeTab: "all" | "pinned" | "archived";
  onTabChange: (tab: "all" | "pinned" | "archived") => void;
  className?: string;
}

export function NoteSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onOpenTemplates,
  onTogglePin,
  onDuplicate,
  onToggleArchive,
  onDelete,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeTab,
  onTabChange,
  className,
}: NoteSidebarProps) {
  const [showCategoryFilter, setShowCategoryFilter] = useState(true);

  // Helper relative time
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return "Baru saja";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m lalu`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}j lalu`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}h lalu`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card/60 backdrop-blur-md border-r border-border/70 overflow-hidden",
        className
      )}
    >
      {/* Top Header & Search */}
      <div className="p-3.5 space-y-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📓</span>
            <span className="font-semibold text-sm tracking-tight">Notion Notes</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
              {notes.length}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs px-2.5"
              onClick={onOpenTemplates}
              title="Gunakan Template"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Templates</span>
            </Button>

            <Button
              size="sm"
              className="h-8 gap-1 text-xs px-2.5 shadow-xs"
              onClick={onCreateNote}
            >
              <FilePlus className="size-3.5" />
              <span>Baru</span>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari catatan, tag, atau isi..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-7 h-8 text-xs bg-background/50 border-border/60 focus-visible:ring-1"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg text-xs font-medium">
          <button
            onClick={() => onTabChange("all")}
            className={cn(
              "flex-1 py-1 rounded-md text-center transition-all",
              activeTab === "all"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Semua
          </button>
          <button
            onClick={() => onTabChange("pinned")}
            className={cn(
              "flex-1 py-1 rounded-md text-center flex items-center justify-center gap-1 transition-all",
              activeTab === "pinned"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Pin className="size-3 text-amber-500 fill-amber-500" />
            <span>Pinned</span>
          </button>
          <button
            onClick={() => onTabChange("archived")}
            className={cn(
              "flex-1 py-1 rounded-md text-center flex items-center justify-center gap-1 transition-all",
              activeTab === "archived"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Archive className="size-3" />
            <span>Arsip</span>
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span className="font-medium flex items-center gap-1">
            <Filter className="size-3" /> Kategori
          </span>
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="text-[10px] text-primary hover:underline cursor-pointer"
          >
            {showCategoryFilter ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        {showCategoryFilter && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => onCategoryChange("All")}
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap transition-colors",
                activeCategory === "All"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              Semua
            </button>
            {NOTE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap transition-colors",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-2">
              <FileText className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">Tidak ada catatan</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px]">
              {searchQuery
                ? "Tidak ada hasil yang cocok dengan pencarian."
                : "Mulai buat catatan baru atau gunakan template."}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 h-7 text-xs"
                onClick={onCreateNote}
              >
                + Buat Catatan
              </Button>
            )}
          </div>
        ) : (
          notes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            const snippet = note.content
              ? note.content
                  .replace(/^[#>-]+\s*/gm, "")
                  .replace(/\[[ x]\]/g, "")
                  .slice(0, 90)
              : "Belum ada konten tulisan...";

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={cn(
                  "group relative flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border",
                  isSelected
                    ? "bg-accent text-accent-foreground border-primary/40 shadow-xs"
                    : "border-transparent hover:bg-muted/50 hover:border-border/40"
                )}
              >
                {/* Note Icon */}
                <span className="text-xl shrink-0 select-none pt-0.5">
                  {note.icon || "📝"}
                </span>

                {/* Content info */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={cn(
                        "text-xs font-semibold truncate",
                        isSelected ? "text-foreground" : "text-foreground/90"
                      )}
                    >
                      {note.title || "Untitled"}
                    </h4>
                    {note.is_pinned && (
                      <Pin className="size-2.5 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">
                    {snippet}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                    <span>{formatTime(note.updated_at)}</span>
                    <span>•</span>
                    <span className="px-1 py-0.2 rounded-xs bg-muted/80 text-[9px]">
                      {note.category}
                    </span>
                    {note.tags && note.tags.length > 0 && (
                      <span className="truncate max-w-[80px]">
                        #{note.tags[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                <div
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-6 text-muted-foreground" />}>
                      <MoreVertical className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 text-xs">
                      <DropdownMenuItem onClick={(e) => onTogglePin(note.id, e)}>
                        {note.is_pinned ? (
                          <>
                            <PinOff className="size-3.5 mr-2" /> Lepas Sematan
                          </>
                        ) : (
                          <>
                            <Pin className="size-3.5 mr-2" /> Sematkan (Pin)
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => onDuplicate(note.id, e)}>
                        <Copy className="size-3.5 mr-2" /> Gandakan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => onToggleArchive(note.id, e)}>
                        <Archive className="size-3.5 mr-2" />
                        {note.is_archived ? "Keluarkan dari Arsip" : "Arsipkan"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => onDelete(note.id, e)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-3.5 mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div className="p-2.5 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between bg-muted/20">
        <span>Auto-saved to Cloud & Local</span>
        <span className="text-[10px] opacity-75">Notion Canvas v1</span>
      </div>
    </aside>
  );
}

