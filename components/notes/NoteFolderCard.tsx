"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { NoteCategory } from "@/types/note";
import { FilePlus, Filter, MoreHorizontal } from "lucide-react";

export interface FolderTheme {
  id: string;
  name: string;
  category: NoteCategory;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
  badgeLight: string;
  badgeDark: string;
  svgFillLight: string;
  svgFillDark: string;
  svgStrokeLight: string;
  svgStrokeDark: string;
}

export const FOLDER_CONFIGS: Record<NoteCategory, FolderTheme> = {
  Kuliah: {
    id: "kuliah",
    name: "Kuliah & Study",
    category: "Kuliah",
    bgLight: "bg-[#EEF0FE]",
    bgDark: "dark:bg-[#1f2238]",
    borderLight: "border-[#D6DAFC]",
    borderDark: "dark:border-[#33385c]",
    textLight: "text-[#242A63]",
    textDark: "dark:text-[#C5CBF8]",
    badgeLight: "bg-[#DDE2FB]",
    badgeDark: "dark:bg-[#2b3052]",
    svgFillLight: "#EEF0FE",
    svgFillDark: "#1f2238",
    svgStrokeLight: "#D6DAFC",
    svgStrokeDark: "#33385c",
  },
  Work: {
    id: "work",
    name: "Work & Projects",
    category: "Work",
    bgLight: "bg-[#E5F6FD]",
    bgDark: "dark:bg-[#182836]",
    borderLight: "border-[#C0E7F9]",
    borderDark: "dark:border-[#27435b]",
    textLight: "text-[#184860]",
    textDark: "dark:text-[#AEE0F8]",
    badgeLight: "bg-[#D2EFFB]",
    badgeDark: "dark:bg-[#203a4e]",
    svgFillLight: "#E5F6FD",
    svgFillDark: "#182836",
    svgStrokeLight: "#C0E7F9",
    svgStrokeDark: "#27435b",
  },
  Personal: {
    id: "personal",
    name: "Personal & Life",
    category: "Personal",
    bgLight: "bg-[#FDF0E7]",
    bgDark: "dark:bg-[#33251c]",
    borderLight: "border-[#F8D8C3]",
    borderDark: "dark:border-[#523c2e]",
    textLight: "text-[#5C3419]",
    textDark: "dark:text-[#F6CCA8]",
    badgeLight: "bg-[#F9E3D3]",
    badgeDark: "dark:bg-[#473427]",
    svgFillLight: "#FDF0E7",
    svgFillDark: "#33251c",
    svgStrokeLight: "#F8D8C3",
    svgStrokeDark: "#523c2e",
  },
  Ideas: {
    id: "ideas",
    name: "Ideas & Brainstorm",
    category: "Ideas",
    bgLight: "bg-[#E8F8F0]",
    bgDark: "dark:bg-[#162b21]",
    borderLight: "border-[#C4EED8]",
    borderDark: "dark:border-[#264c39]",
    textLight: "text-[#1B5238]",
    textDark: "dark:text-[#A7E6C5]",
    badgeLight: "bg-[#D4F4E4]",
    badgeDark: "dark:bg-[#1f4030]",
    svgFillLight: "#E8F8F0",
    svgFillDark: "#162b21",
    svgStrokeLight: "#C4EED8",
    svgStrokeDark: "#264c39",
  },
  Project: {
    id: "project",
    name: "Design & Sprints",
    category: "Project",
    bgLight: "bg-[#FDE8F1]",
    bgDark: "dark:bg-[#331c26]",
    borderLight: "border-[#F9C5DE]",
    borderDark: "dark:border-[#542d3e]",
    textLight: "text-[#611C3D]",
    textDark: "dark:text-[#F6AECF]",
    badgeLight: "bg-[#F9D4E5]",
    badgeDark: "dark:bg-[#472635]",
    svgFillLight: "#FDE8F1",
    svgFillDark: "#331c26",
    svgStrokeLight: "#F9C5DE",
    svgStrokeDark: "#542d3e",
  },
  Lainnya: {
    id: "lainnya",
    name: "General Vault",
    category: "Lainnya",
    bgLight: "bg-[#F3E8FD]",
    bgDark: "dark:bg-[#2a1c36]",
    borderLight: "border-[#E3C5F9]",
    borderDark: "dark:border-[#472d5c]",
    textLight: "text-[#4A1E66]",
    textDark: "dark:text-[#DEB2F7]",
    badgeLight: "bg-[#ECD4FA]",
    badgeDark: "dark:bg-[#3c254e]",
    svgFillLight: "#F3E8FD",
    svgFillDark: "#2a1c36",
    svgStrokeLight: "#E3C5F9",
    svgStrokeDark: "#472d5c",
  },
};

interface NoteFolderCardProps {
  category: NoteCategory;
  count: number;
  isActive: boolean;
  onSelect: (category: NoteCategory) => void;
  onCreateInFolder: (category: NoteCategory) => void;
  userInitial?: string;
}

export function NoteFolderCard({
  category,
  count,
  isActive,
  onSelect,
  onCreateInFolder,
  userInitial = "U",
}: NoteFolderCardProps) {
  const config = FOLDER_CONFIGS[category] || FOLDER_CONFIGS.Lainnya;

  return (
    <div
      onClick={() => onSelect(category)}
      className={cn(
        "group relative h-[155px] w-full cursor-pointer select-none transition-all duration-300",
        isActive ? "scale-[1.02] -translate-y-1" : "hover:-translate-y-1 hover:scale-[1.01]"
      )}
    >
      {/* ==================================================================== */}
      {/* SVG FOLDER SHAPE WITH AUTHENTIC TOP-LEFT TAB & S-CURVE               */}
      {/* ==================================================================== */}
      <svg
        viewBox="0 0 320 170"
        preserveAspectRatio="none"
        className={cn(
          "absolute inset-0 size-full transition-all duration-300 drop-shadow-xs",
          isActive
            ? "drop-shadow-[0_8px_20px_rgba(34,211,238,0.25)] filter"
            : "group-hover:drop-shadow-md"
        )}
      >
        <path
          d="M 22 0 
             L 115 0 
             C 126 0, 131 22, 144 22 
             L 296 22 
             Q 316 22 316 42 
             L 316 148 
             Q 316 168 296 168 
             L 22 168 
             Q 0 168 0 148 
             L 0 22 
             Q 0 0 22 0 
             Z"
          className={cn(
            "transition-colors duration-200",
            // Light mode fill & stroke
            "fill-[var(--folder-fill-light)] stroke-[var(--folder-stroke-light)]",
            // Dark mode fill & stroke
            "dark:fill-[var(--folder-fill-dark)] dark:stroke-[var(--folder-stroke-dark)]"
          )}
          style={
            {
              "--folder-fill-light": config.svgFillLight,
              "--folder-fill-dark": config.svgFillDark,
              "--folder-stroke-light": isActive ? "#22d3ee" : config.svgStrokeLight,
              "--folder-stroke-dark": isActive ? "#22d3ee" : config.svgStrokeDark,
            } as React.CSSProperties
          }
          strokeWidth={isActive ? 2.5 : 1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Active Indicator Pulse Ring */}
      {isActive && (
        <div className="pointer-events-none absolute -inset-0.5 rounded-2xl ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-background" />
      )}

      {/* ==================================================================== */}
      {/* FOLDER CONTENT OVERLAY                                               */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4.5 pt-7">
        {/* Top Bar: Action Button */}
        <div className="flex items-center justify-end">
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex size-6.5 items-center justify-center rounded-full bg-white/70 text-slate-600 shadow-2xs backdrop-blur-xs transition-all hover:bg-white hover:text-slate-900 focus-visible:outline-hidden dark:bg-black/30 dark:text-slate-300 dark:hover:bg-black/50 dark:hover:text-white"
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem onClick={() => onSelect(category)}>
                  <Filter className="mr-2 size-3.5 text-muted-foreground" />
                  {isActive ? "Tampilkan Semua" : "Filter Kategori Ini"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateInFolder(category)}>
                  <FilePlus className="mr-2 size-3.5 text-muted-foreground" />
                  Buat Catatan Baru
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Center: Folder Title in Monospace Geometric Styling */}
        <div className="px-1">
          <h3
            className={cn(
              "font-mono text-[14px] font-semibold tracking-wide transition-colors",
              config.textLight,
              config.textDark
            )}
          >
            {config.name}
          </h3>
        </div>

        {/* Bottom Bar: Stacked Avatars & Item Count */}
        <div className="flex items-center justify-between pt-1">
          {/* Contributor / User Avatars */}
          <div className="flex -space-x-1.5 overflow-hidden">
            <div className="flex size-5.5 items-center justify-center rounded-full border border-white/60 bg-gradient-to-tr from-cyan-500 to-indigo-500 text-[9px] font-bold text-white shadow-xs dark:border-slate-800">
              {userInitial}
            </div>
            <div className="flex size-5.5 items-center justify-center rounded-full border border-white/60 bg-gradient-to-tr from-amber-400 to-rose-400 text-[9px] font-bold text-white shadow-xs dark:border-slate-800">
              ⚡
            </div>
          </div>

          {/* Item Count */}
          <span
            className={cn(
              "font-mono text-xs font-medium tracking-tight opacity-80",
              config.textLight,
              config.textDark
            )}
          >
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty / Add Folder Card with Dashed Border
 */
export function AddFolderCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      onClick={onAdd}
      className="group relative flex h-[155px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-card/30 p-4 transition-all duration-200 hover:border-cyan-500/60 hover:bg-cyan-500/5 hover:shadow-xs"
    >
      <div className="flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-transform duration-200 group-hover:scale-110 group-hover:bg-cyan-500/10 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
        <FilePlus className="size-4.5" />
      </div>
      <span className="mt-2.5 font-mono text-xs font-semibold tracking-wide text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
        + Add Folder
      </span>
      <span className="mt-0.5 text-[10px] text-muted-foreground">
        Kategori / template baru
      </span>
    </div>
  );
}

