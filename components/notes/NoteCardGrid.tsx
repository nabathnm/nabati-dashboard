"use client";

import type { Note } from "@/types/note";
import { Badge } from "@/components/ui/badge";
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
  Copy,
  FilePlus,
  FileText,
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";

interface NoteCardGridProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onToggleArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function NoteCardGrid({
  notes,
  onSelectNote,
  onCreateNote,
  onTogglePin,
  onDuplicate,
  onToggleArchive,
  onDelete,
}: NoteCardGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-card/40 rounded-2xl border border-dashed border-border/80">
        <div className="size-12 rounded-2xl bg-muted/70 flex items-center justify-center text-muted-foreground mb-3 text-xl">
          <FileText className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Tidak ada catatan ditemukan
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Buat catatan pertama Anda atau ubah filter pencarian untuk melihat dokumen lainnya.
        </p>
        <Button size="sm" className="mt-4 gap-1.5" onClick={onCreateNote}>
          <FilePlus className="size-4" />
          <span>Buat Catatan Baru</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Create New Card */}
      <div
        onClick={onCreateNote}
        className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-border/80 hover:border-primary/60 hover:bg-accent/40 cursor-pointer transition-all min-h-[220px]"
      >
        <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
          <FilePlus className="size-5" />
        </div>
        <span className="text-xs font-semibold mt-3 text-foreground group-hover:text-primary transition-colors">
          Catatan Baru
        </span>
        <span className="text-[11px] text-muted-foreground mt-0.5">
          Klik untuk membuat halaman kosong
        </span>
      </div>

      {/* Note Cards */}
      {notes.map((note) => {
        const snippet = note.content
          ? note.content
              .replace(/^[#>-]+\s*/gm, "")
              .replace(/\[[ x]\]/g, "")
              .slice(0, 110)
          : "Halaman kosong...";

        return (
          <div
            key={note.id}
            onClick={() => onSelectNote(note)}
            className="group relative flex flex-col justify-between rounded-2xl border border-border/70 hover:border-primary/50 bg-card/60 hover:bg-card hover:shadow-md transition-all cursor-pointer overflow-hidden min-h-[220px]"
          >
            {/* Top Cover Banner */}
            <div
              className="h-16 w-full relative"
              style={{
                background:
                  note.cover_image ||
                  "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)",
              }}
            >
              {/* Pin Indicator */}
              {note.is_pinned && (
                <div className="absolute left-2.5 top-2.5 bg-background/80 backdrop-blur-xs size-6 rounded-full flex items-center justify-center shadow-xs">
                  <Pin className="size-3 text-amber-500 fill-amber-500" />
                </div>
              )}

              {/* Actions Dropdown */}
              <div
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="secondary" size="icon" className="size-6 bg-background/80 backdrop-blur-xs" />}>
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
                      {note.is_archived ? "Batal Arsip" : "Arsipkan"}
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

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between -mt-6">
              <div>
                {/* Emoji Icon */}
                <div className="size-10 rounded-xl bg-card border border-border/60 flex items-center justify-center text-xl shadow-xs mb-2 select-none">
                  {note.icon || "📝"}
                </div>

                <h4 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {note.title || "Untitled"}
                </h4>

                <p className="text-xs text-muted-foreground line-clamp-3 mt-1.5 leading-relaxed">
                  {snippet}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <Badge variant="outline" className="text-[10px] h-4.5 font-normal">
                  {note.category}
                </Badge>
                <span>
                  {new Date(note.updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

