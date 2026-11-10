"use client";

import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";
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
  ExternalLink,
  FileText,
  MoreVertical,
  Star,
  Trash2,
} from "lucide-react";

interface DriveDocumentCardProps {
  note: Note;
  onSelect: (note: Note) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onToggleArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function DriveDocumentCard({
  note,
  onSelect,
  onTogglePin,
  onDuplicate,
  onToggleArchive,
  onDelete,
}: DriveDocumentCardProps) {
  // Format relative timestamp
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return "Baru saja";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
      const days = Math.floor(diffSec / 86400);
      if (days === 1) return "Kemarin";
      if (days < 30) return `${days} hari lalu`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "Terakhir diubah";
    }
  };

  // Preview lines from markdown content
  const previewLines = note.content
    ? note.content
        .split("\n")
        .map((l) => l.replace(/^[#>*-\s]+/g, "").trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

  return (
    <div
      onClick={() => onSelect(note)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-md cursor-pointer select-none"
    >
      {/* 1. Google Docs Sheet Preview Area */}
      <div className="relative h-36 w-full overflow-hidden bg-muted/30 border-b border-border/60 p-3.5 flex items-center justify-center">
        {/* Realistic mini Google Docs Paper Canvas */}
        <div className="relative h-full w-[88%] rounded-sm bg-background border border-border/70 shadow-2xs p-3 flex flex-col justify-between overflow-hidden transition-transform duration-200 group-hover:scale-[1.02]">
          {/* Subtle Google Docs header line */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs">{note.icon || "📄"}</span>
              <div className="h-2 w-2/3 rounded-full bg-foreground/20" />
            </div>

            {previewLines.length > 0 ? (
              previewLines.map((line, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full bg-muted-foreground/25",
                    idx === 0 && "w-11/12",
                    idx === 1 && "w-4/5",
                    idx === 2 && "w-5/6",
                    idx === 3 && "w-3/5"
                  )}
                />
              ))
            ) : (
              <div className="space-y-1.5 pt-1">
                <div className="h-1.5 w-11/12 rounded-full bg-muted-foreground/20" />
                <div className="h-1.5 w-4/5 rounded-full bg-muted-foreground/20" />
                <div className="h-1.5 w-3/4 rounded-full bg-muted-foreground/15" />
              </div>
            )}
          </div>

          {/* Category Chip in Document Footer */}
          <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground pt-1 border-t border-border/40">
            <span className="truncate max-w-[100px]">{note.category}</span>
            <span>GDocs</span>
          </div>
        </div>

        {/* Pin / Starred Indicator in Top Right of Thumbnail */}
        {note.is_pinned && (
          <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 shadow-2xs">
            <Star className="size-3 fill-amber-500" />
          </div>
        )}
      </div>

      {/* 2. File Metadata Footer (Google Docs style) */}
      <div className="p-3 bg-card flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Signature Google Docs Blue Document Icon */}
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
            <FileText className="size-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              title={note.title || "Dokumen Tanpa Judul"}
            >
              {note.title || "Dokumen Tanpa Judul"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {formatTime(note.updated_at)}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => onTogglePin(note.id, e)}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg transition-colors cursor-pointer",
              note.is_pinned
                ? "text-amber-500 hover:text-amber-600"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted"
            )}
            title={note.is_pinned ? "Hapus bintang" : "Beri bintang"}
          >
            <Star className={cn("size-3.5", note.is_pinned && "fill-amber-500")} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-hidden"
              title="Opsi dokumen"
            >
              <MoreVertical className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs font-mono">
              <DropdownMenuItem onClick={() => onSelect(note)}>
                <ExternalLink className="mr-2 size-3.5 text-muted-foreground" />
                <span>Buka Dokumen</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onTogglePin(note.id, e)}>
                <Star className="mr-2 size-3.5 text-amber-500" />
                <span>{note.is_pinned ? "Hapus Bintang" : "Beri Bintang"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onDuplicate(note.id, e)}>
                <Copy className="mr-2 size-3.5 text-muted-foreground" />
                <span>Buat Salinan</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onToggleArchive(note.id, e)}>
                <Archive className="mr-2 size-3.5 text-muted-foreground" />
                <span>{note.is_archived ? "Keluarkan dari Arsip" : "Arsipkan Dokumen"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => onDelete(note.id, e)}
                className="text-rose-600 dark:text-rose-400 focus:text-rose-600"
              >
                <Trash2 className="mr-2 size-3.5" />
                <span>Hapus ke Sampah</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
