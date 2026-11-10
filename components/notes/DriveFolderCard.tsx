"use client";

import { cn } from "@/lib/utils";
import type { NoteCategory } from "@/types/note";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilePlus, Folder, FolderOpen, MoreVertical, Sparkles } from "lucide-react";

interface DriveFolderCardProps {
  category: NoteCategory;
  count: number;
  isActive: boolean;
  onSelect: (category: NoteCategory) => void;
  onCreateInFolder?: (category: NoteCategory) => void;
}

const CATEGORY_COLORS: Record<
  NoteCategory,
  {
    iconColor: string;
    bgColor: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  Kuliah: {
    iconColor: "text-blue-500 fill-blue-500/20",
    bgColor: "bg-blue-50/60 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-900/60",
    badgeBg: "bg-blue-100/70 dark:bg-blue-900/40",
    badgeText: "text-blue-700 dark:text-blue-300",
  },
  Work: {
    iconColor: "text-amber-500 fill-amber-500/20",
    bgColor: "bg-amber-50/60 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900/60",
    badgeBg: "bg-amber-100/70 dark:bg-amber-900/40",
    badgeText: "text-amber-700 dark:text-amber-300",
  },
  Personal: {
    iconColor: "text-emerald-500 fill-emerald-500/20",
    bgColor: "bg-emerald-50/60 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-900/60",
    badgeBg: "bg-emerald-100/70 dark:bg-emerald-900/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
  Ideas: {
    iconColor: "text-purple-500 fill-purple-500/20",
    bgColor: "bg-purple-50/60 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-900/60",
    badgeBg: "bg-purple-100/70 dark:bg-purple-900/40",
    badgeText: "text-purple-700 dark:text-purple-300",
  },
  Project: {
    iconColor: "text-cyan-500 fill-cyan-500/20",
    bgColor: "bg-cyan-50/60 dark:bg-cyan-950/20",
    borderColor: "border-cyan-200 dark:border-cyan-900/60",
    badgeBg: "bg-cyan-100/70 dark:bg-cyan-900/40",
    badgeText: "text-cyan-700 dark:text-cyan-300",
  },
  Lainnya: {
    iconColor: "text-slate-500 fill-slate-500/20",
    bgColor: "bg-slate-50/60 dark:bg-slate-900/20",
    borderColor: "border-slate-200 dark:border-slate-800",
    badgeBg: "bg-slate-100/70 dark:bg-slate-800/40",
    badgeText: "text-slate-700 dark:text-slate-300",
  },
};

export function DriveFolderCard({
  category,
  count,
  isActive,
  onSelect,
  onCreateInFolder,
}: DriveFolderCardProps) {
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Lainnya;

  return (
    <div
      onClick={() => onSelect(category)}
      className={cn(
        "group relative flex items-center justify-between rounded-xl border px-3.5 py-3 transition-all duration-200 cursor-pointer shadow-2xs select-none",
        isActive
          ? "border-blue-500/80 bg-blue-50/80 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-xs"
          : "border-border/70 bg-card hover:bg-muted/40 hover:border-border hover:shadow-xs"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Google Drive styled folder icon */}
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-105",
            colors.bgColor,
            colors.borderColor
          )}
        >
          {isActive ? (
            <FolderOpen className={cn("size-5", colors.iconColor)} />
          ) : (
            <Folder className={cn("size-5", colors.iconColor)} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-semibold truncate transition-colors",
              isActive ? "text-blue-700 dark:text-blue-300 font-bold" : "text-foreground"
            )}
            title={category}
          >
            {category}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {count} {count === 1 ? "dokumen" : "dokumen"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-60 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all cursor-pointer focus-visible:outline-hidden"
            title="Opsi folder"
          >
            <MoreVertical className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs font-mono">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onSelect(category);
              }}
            >
              <FolderOpen className="mr-2 size-3.5 text-muted-foreground" />
              <span>Buka Folder</span>
            </DropdownMenuItem>
            {onCreateInFolder && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateInFolder(category);
                }}
              >
                <FilePlus className="mr-2 size-3.5 text-blue-500" />
                <span>Buat Dokumen Baru</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
