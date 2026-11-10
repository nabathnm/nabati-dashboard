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

interface DriveDocumentTableProps {
  notes: Note[];
  onSelect: (note: Note) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onToggleArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function DriveDocumentTable({
  notes,
  onSelect,
  onTogglePin,
  onDuplicate,
  onToggleArchive,
  onDelete,
}: DriveDocumentTableProps) {
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
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "-";
    }
  };

  const getWordCount = (content: string) => {
    if (!content) return "0 kata";
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return `${words} kata`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-muted-foreground font-mono text-[11px]">
              <th className="py-3 px-4 font-semibold">Nama Dokumen</th>
              <th className="py-3 px-4 font-semibold">Folder / Kategori</th>
              <th className="py-3 px-4 font-semibold">Terakhir Diubah</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Ukuran</th>
              <th className="py-3 px-4 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {notes.map((note) => (
              <tr
                key={note.id}
                onClick={() => onSelect(note)}
                className="group hover:bg-muted/40 transition-colors cursor-pointer"
              >
                {/* 1. Nama Dokumen with Google Docs Icon & Star */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3 min-w-0 max-w-md">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                      <FileText className="size-4 text-blue-600 dark:text-blue-400" />
                    </div>

                    <span
                      className="font-medium text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      title={note.title}
                    >
                      {note.title || "Dokumen Tanpa Judul"}
                    </span>

                    {note.is_pinned && (
                      <Star className="size-3.5 fill-amber-500 text-amber-500 shrink-0" />
                    )}
                  </div>
                </td>

                {/* 2. Folder / Kategori */}
                <td className="py-3 px-4">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-mono font-medium bg-muted border border-border/60 text-muted-foreground">
                    📁 {note.category}
                  </span>
                </td>

                {/* 3. Terakhir Diubah */}
                <td className="py-3 px-4 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                  {formatTime(note.updated_at)}
                </td>

                {/* 4. Ukuran */}
                <td className="py-3 px-4 text-muted-foreground font-mono text-[11px] hidden sm:table-cell whitespace-nowrap">
                  {getWordCount(note.content)}
                </td>

                {/* 5. Aksi */}
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(e) => onTogglePin(note.id, e)}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg transition-colors cursor-pointer",
                        note.is_pinned
                          ? "text-amber-500 hover:text-amber-600"
                          : "text-muted-foreground/60 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100"
                      )}
                      title={note.is_pinned ? "Hapus bintang" : "Beri bintang"}
                    >
                      <Star className={cn("size-3.5", note.is_pinned && "fill-amber-500")} />
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-hidden"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
