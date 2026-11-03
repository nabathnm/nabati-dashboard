"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Note, NoteCategory } from "@/types/note";
import {
  Archive,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pin,
  PinOff,
  Sparkles,
  Trash2,
} from "lucide-react";

/**
 * Curated Scenic Wallpapers matching the Floe reference aesthetic
 * (Sunset clouds, galaxies, minimal abstract, neon flora, crystal macro)
 */
export const CATEGORY_WALLPAPERS: Record<NoteCategory, string> = {
  Kuliah:
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80", // Neon flora
  Work:
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80", // Vibrant sunset sky
  Personal:
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80", // Deep cosmic nebula
  Ideas:
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80", // Pastel crystal macro
  Project:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80", // Fluid artistic gradient
  Lainnya:
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80", // Warm ambient minimalism
};

interface NoteWorkflowCardProps {
  note: Note;
  onSelect: (note: Note) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onToggleArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  userInitial?: string;
}

export function NoteWorkflowCard({
  note,
  onSelect,
  onTogglePin,
  onDuplicate,
  onToggleArchive,
  onDelete,
  userInitial = "U",
}: NoteWorkflowCardProps) {
  // Format relative time
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return "Just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      const days = Math.floor(diffSec / 86400);
      if (days === 1) return "1 day ago";
      if (days < 30) return `${days} days ago`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "Recently";
    }
  };

  // Determine wallpaper
  const wallpaperUrl =
    note.cover_image && (note.cover_image.startsWith("http") || note.cover_image.startsWith("data:"))
      ? note.cover_image
      : CATEGORY_WALLPAPERS[note.category] || CATEGORY_WALLPAPERS.Lainnya;

  const isGradientCover =
    note.cover_image && note.cover_image.startsWith("linear-gradient");

  // Content snippet
  const snippet = note.content
    ? note.content
        .replace(/^[#>-]+\s*/gm, "")
        .replace(/\[[ x]\]/g, "")
        .slice(0, 90)
    : "Halaman dokumen kosong...";

  return (
    <div
      onClick={() => onSelect(note)}
      className="group relative flex min-h-[255px] flex-col justify-between overflow-hidden rounded-[26px] border border-border/70 bg-card shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-xl cursor-pointer"
    >
      {/* ==================================================================== */}
      {/* TOP COVER IMAGE BANNER                                               */}
      {/* ==================================================================== */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-900">
        {isGradientCover ? (
          <div
            className="size-full transition-transform duration-500 group-hover:scale-105"
            style={{ background: note.cover_image || undefined }}
          />
        ) : (
          <img
            src={wallpaperUrl}
            alt={note.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Subtle Gradient Shade on Cover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Top-Left: Pin Badge or Note Icon */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {note.is_pinned && (
            <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-300 backdrop-blur-md shadow-xs">
              <Pin className="size-2.5 fill-amber-300 text-amber-300" />
              <span>Pinned</span>
            </div>
          )}
          {note.icon && (
            <span className="flex size-6 items-center justify-center rounded-lg bg-black/40 text-xs backdrop-blur-md">
              {note.icon}
            </span>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BOTTOM OVERLAPPING CARD SURFACE                                      */}
      {/* ==================================================================== */}
      <div className="relative -mt-6 flex flex-1 flex-col justify-between rounded-t-[24px] border-t border-white/20 bg-card p-4 pt-4 shadow-xs dark:border-white/5">
        {/* Floating 3-Dots Action Button at Top-Right */}
        <div
          className="absolute -top-4 right-3.5 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-xs transition-all hover:bg-muted hover:text-foreground focus-visible:outline-hidden"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              <DropdownMenuItem onClick={() => onSelect(note)}>
                <ExternalLink className="mr-2 size-3.5" /> Buka Catatan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onTogglePin(note.id, e)}>
                {note.is_pinned ? (
                  <>
                    <PinOff className="mr-2 size-3.5" /> Lepas Sematan
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 size-3.5" /> Sematkan (Pin)
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onDuplicate(note.id, e)}>
                <Copy className="mr-2 size-3.5" /> Gandakan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onToggleArchive(note.id, e)}>
                <Archive className="mr-2 size-3.5" />
                {note.is_archived ? "Batal Arsip" : "Arsipkan"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => onDelete(note.id, e)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-3.5" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content Section */}
        <div className="space-y-1.5 pr-8">
          {/* Metadata Line: Relative Date • Category/Status */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span>{formatTime(note.updated_at)}</span>
            <span>•</span>
            <span className="font-medium text-foreground/80">{note.category}</span>
          </div>

          {/* Title */}
          <h4 className="font-mono text-[14px] font-semibold tracking-tight text-foreground line-clamp-1 transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
            {note.title || "Tanpa Judul"}
          </h4>

          {/* Short Preview / Snippet */}
          <p className="line-clamp-1 text-[11.5px] text-muted-foreground/80">
            {snippet}
          </p>
        </div>

        {/* Footer: Contributor Avatars on Left, Category Pill / Tags on Right */}
        <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-3">
          {/* Contributor Avatars */}
          <div className="flex -space-x-1.5 overflow-hidden">
            <div className="flex size-5.5 items-center justify-center rounded-full border border-card bg-gradient-to-tr from-cyan-500 to-indigo-500 text-[9px] font-bold text-white shadow-2xs">
              {userInitial}
            </div>
            {note.tags && note.tags.length > 0 && (
              <div className="flex size-5.5 items-center justify-center rounded-full border border-card bg-gradient-to-tr from-purple-500 to-pink-500 text-[8px] font-bold text-white shadow-2xs">
                #{note.tags.length}
              </div>
            )}
          </div>

          {/* Category Tag or App Badge */}
          <div className="flex items-center gap-1">
            <span className="rounded-md bg-muted/80 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground border border-border/40">
              {note.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

