"use client";

import { useEffect, useRef, useState } from "react";
import type { Note, NoteCategory } from "@/types/note";
import { NOTE_CATEGORIES } from "@/lib/services/note-service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowLeft,
  Bold,
  Check,
  CheckSquare,
  Cloud,
  Code2,
  Copy,
  Download,
  Eye,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Sparkles,
  Star,
  Strikethrough,
  Trash2,
  Undo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GoogleDocsEditorProps {
  note: Note;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onBackToDrive: () => void;
}

export function GoogleDocsEditor({
  note,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
  onDuplicateNote,
  onBackToDrive,
}: GoogleDocsEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState<NoteCategory>(note.category);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");

  // History for undo/redo
  const [history, setHistory] = useState<string[]>([note.content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync state when active note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setSaveStatus("saved");
    setHistory([note.content]);
    setHistoryIndex(0);
  }, [note.id]);

  // Debounced auto-save
  useEffect(() => {
    if (title === note.title && content === note.content && category === note.category) {
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      onUpdateNote(note.id, {
        title,
        content,
        category,
      });
      setSaveStatus("saved");
    }, 600);

    return () => clearTimeout(timer);
  }, [title, content, category]);

  // History push on content change
  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    // Push history if distinct
    if (newVal !== history[historyIndex]) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newVal);
      if (nextHistory.length > 50) nextHistory.shift();
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevVal = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setContent(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextVal = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setContent(nextVal);
    }
  };

  // Formatting helpers
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);

    const replacement = `${prefix}${selected || "teks"}${suffix}`;
    const nextContent = content.substring(0, start) + replacement + content.substring(end);

    handleContentChange(nextContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 10);
  };

  const insertLinePrefix = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = content.indexOf("\n", start);
    const endPos = lineEnd === -1 ? content.length : lineEnd;
    const lineText = content.substring(lineStart, endPos);

    const nextContent =
      content.substring(0, lineStart) + `${prefix} ` + lineText + content.substring(endPos);

    handleContentChange(nextContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length + 1, start + prefix.length + 1);
    }, 10);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      insertFormatting("**", "**");
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      insertFormatting("*", "*");
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      if (e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else {
        e.preventDefault();
        handleUndo();
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      insertFormatting("  ");
    }
  };

  // Download export
  const handleDownload = (format: "markdown" | "txt") => {
    const ext = format === "markdown" ? "md" : "txt";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "dokumen"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Dokumen diunduh sebagai .${ext}`);
  };

  // Copy text to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Isi dokumen disalin ke papan klip!");
  };

  // Word count & Char count
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* ==================================================================== */}
      {/* 1. GOOGLE DOCS TOP BAR                                               */}
      {/* ==================================================================== */}
      <header className="border-b border-border/70 bg-card/95 px-4 py-2.5 shadow-2xs backdrop-blur-md">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {/* Left: Google Docs Logo + Title + Menu Bar */}
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            {/* Google Docs Blue Icon */}
            <div
              onClick={onBackToDrive}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs cursor-pointer hover:bg-blue-700 transition-colors"
              title="Kembali ke Drive Saya"
            >
              <FileText className="size-5" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              {/* Document Title Row + Status */}
              <div className="flex items-center gap-2">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Dokumen Tanpa Judul"
                  className="h-7 w-full max-w-sm rounded-md border border-transparent px-2 text-sm sm:text-base font-bold text-foreground hover:border-border/80 focus:border-blue-500 focus:bg-background focus:outline-hidden transition-all"
                />

                {/* Star Button */}
                <button
                  type="button"
                  onClick={() => onTogglePin(note.id)}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors cursor-pointer",
                    note.is_pinned
                      ? "text-amber-500 hover:text-amber-600"
                      : "text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                  )}
                  title={note.is_pinned ? "Hapus bintang" : "Beri bintang"}
                >
                  <Star className={cn("size-4", note.is_pinned && "fill-amber-500")} />
                </button>

                {/* Cloud Save Status */}
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                  <Cloud className="size-3.5 text-muted-foreground" />
                  <span>{saveStatus === "saving" ? "Menyimpan..." : "Disimpan di Drive"}</span>
                </div>
              </div>

              {/* Google Docs Menu Bar */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground font-mono">
                {/* File Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded px-2 py-0.5 hover:bg-muted hover:text-foreground transition-colors cursor-pointer focus-visible:outline-hidden">
                    File
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52 text-xs font-mono">
                    <DropdownMenuItem onClick={() => handleDownload("markdown")}>
                      <Download className="mr-2 size-3.5" />
                      <span>Unduh (.md)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload("txt")}>
                      <Download className="mr-2 size-3.5" />
                      <span>Unduh (.txt)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicateNote(note.id)}>
                      <Copy className="mr-2 size-3.5" />
                      <span>Buat Salinan</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteNote(note.id)}
                      className="text-rose-600 dark:text-rose-400 focus:text-rose-600"
                    >
                      <Trash2 className="mr-2 size-3.5" />
                      <span>Hapus ke Sampah</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Edit Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded px-2 py-0.5 hover:bg-muted hover:text-foreground transition-colors cursor-pointer focus-visible:outline-hidden">
                    Edit
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44 text-xs font-mono">
                    <DropdownMenuItem onClick={handleUndo} disabled={historyIndex <= 0}>
                      <Undo className="mr-2 size-3.5" />
                      <span>Urungkan (Undo)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                    >
                      <Redo className="mr-2 size-3.5" />
                      <span>Ulangi (Redo)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopy}>
                      <Copy className="mr-2 size-3.5" />
                      <span>Salin Semua Teks</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sisipkan Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded px-2 py-0.5 hover:bg-muted hover:text-foreground transition-colors cursor-pointer focus-visible:outline-hidden">
                    Sisipkan
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 text-xs font-mono">
                    <DropdownMenuItem onClick={() => insertLinePrefix("- [ ]")}>
                      <CheckSquare className="mr-2 size-3.5" />
                      <span>Daftar Checklist</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertLinePrefix(">")}>
                      <Quote className="mr-2 size-3.5" />
                      <span>Kutipan / Catatan</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertFormatting("```\n", "\n```")}>
                      <Code2 className="mr-2 size-3.5" />
                      <span>Blok Kode</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertLinePrefix("---")}>
                      <Minus className="mr-2 size-3.5" />
                      <span>Garis Horizontal</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Folder Selector Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded px-2 py-0.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer focus-visible:outline-hidden">
                    📁 Folder: {category}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44 text-xs font-mono">
                    {NOTE_CATEGORIES.map((cat) => (
                      <DropdownMenuItem key={cat} onClick={() => setCategory(cat)}>
                        <span>{cat}</span>
                        {cat === category && <Check className="ml-auto size-3.5" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 gap-1.5 rounded-lg font-mono text-xs"
              title="Salin isi dokumen"
            >
              <Copy className="size-3.5" />
              <span className="hidden sm:inline">Salin</span>
            </Button>

            <Button
              size="sm"
              onClick={onBackToDrive}
              className="h-8 gap-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-mono text-xs shadow-xs"
            >
              <ArrowLeft className="size-3.5" />
              <span>Drive Saya</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. GOOGLE DOCS FORMATTING RIBBON / TOOLBAR                           */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border/70 bg-muted/40 px-4 py-1.5 text-muted-foreground shadow-2xs select-none">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
          title="Urungkan (Ctrl+Z)"
        >
          <Undo className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
          title="Ulangi (Ctrl+Y)"
        >
          <Redo className="size-3.5" />
        </button>

        <div className="h-4 w-px bg-border/80 mx-1 shrink-0" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => insertLinePrefix("#")}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          title="Heading 1"
        >
          <Heading1 className="size-3.5" />
          <span className="text-[10px]">H1</span>
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix("##")}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          title="Heading 2"
        >
          <Heading2 className="size-3.5" />
          <span className="text-[10px]">H2</span>
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix("###")}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          title="Heading 3"
        >
          <Heading3 className="size-3.5" />
          <span className="text-[10px]">H3</span>
        </button>

        <div className="h-4 w-px bg-border/80 mx-1 shrink-0" />

        {/* Basic Formats */}
        <button
          type="button"
          onClick={() => insertFormatting("**", "**")}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground transition-colors cursor-pointer font-bold"
          title="Tebal (Ctrl+B)"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting("*", "*")}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground transition-colors cursor-pointer italic"
          title="Miring (Ctrl+I)"
        >
          <Italic className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting("~~", "~~")}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          title="Coretan (Strikethrough)"
        >
          <Strikethrough className="size-3.5" />
        </button>

        <div className="h-4 w-px bg-border/80 mx-1 shrink-0" />

        {/* Lists & Blocks */}
        <button
          type="button"
          onClick={() => insertLinePrefix("-")}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          title="Daftar Berpoin"
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix("1.")}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          title="Daftar Bernomor"
        >
          <ListOrdered className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix("- [ ]")}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          title="Daftar Tugas / Checklist"
        >
          <CheckSquare className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix(">")}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          title="Kutipan / Catatan"
        >
          <Quote className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting("```\n", "\n```")}
          className="flex size-7 items-center justify-center rounded-md hover:bg-background hover:text-foreground transition-colors cursor-pointer"
          title="Blok Kode"
        >
          <Code2 className="size-3.5" />
        </button>

        {/* View Mode Toggle (Edit / Preview / Split) */}
        <div className="ml-auto flex items-center gap-1 shrink-0 rounded-lg border border-border/70 bg-card p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer",
              viewMode === "edit"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "hover:text-foreground"
            )}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer",
              viewMode === "preview"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "hover:text-foreground"
            )}
          >
            Pratinjau
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer hidden md:inline-block",
              viewMode === "split"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "hover:text-foreground"
            )}
          >
            Berdampingan
          </button>
        </div>

        {/* Word Counter */}
        <div className="hidden lg:flex items-center text-[10px] font-mono text-muted-foreground px-2">
          <span>{words} kata</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. GOOGLE DOCS DOCUMENT CANVAS (CENTERED WHITE PAGE SHEET)           */}
      {/* ==================================================================== */}
      <div className="flex-1 overflow-y-auto bg-muted/40 dark:bg-background/90 p-4 sm:p-8 flex justify-center">
        <div
          className={cn(
            "w-full transition-all duration-200",
            viewMode === "split" ? "max-w-6xl grid grid-cols-2 gap-6" : "max-w-[850px]"
          )}
        >
          {/* Document Sheet Editor */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div className="relative min-h-[960px] w-full rounded-xs border border-border/70 bg-card p-8 sm:p-16 text-foreground shadow-lg flex flex-col">
              {/* Document Header Metadata / Ruler Indent hint */}
              <div className="mb-6 pb-4 border-b border-border/40 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>📁 {category}</span>
                <span>{words} kata • {chars} karakter</span>
              </div>

              {/* Document Textarea Canvas */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mulai menulis dokumen di sini... Gunakan Markdown (# Judul, **tebal**, - daftar, - [ ] checklist)"
                className="w-full flex-1 resize-none bg-transparent font-sans text-sm sm:text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden"
              />
            </div>
          )}

          {/* Document Sheet Preview */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className="min-h-[960px] w-full rounded-xs border border-border/70 bg-card p-8 sm:p-16 text-foreground shadow-lg overflow-y-auto">
              <div className="mb-6 pb-4 border-b border-border/40 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="font-semibold text-foreground text-sm">{title || "Dokumen Tanpa Judul"}</span>
                <span>Pratinjau Dokumen</span>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 font-sans leading-relaxed">
                {content.trim() ? (
                  content.split("\n").map((line, idx) => {
                    // Headings
                    if (line.startsWith("# ")) {
                      return (
                        <h1 key={idx} className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
                          {line.replace("# ", "")}
                        </h1>
                      );
                    }
                    if (line.startsWith("## ")) {
                      return (
                        <h2 key={idx} className="text-xl font-bold text-foreground border-b border-border/40 pb-1 mt-4">
                          {line.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("### ")) {
                      return (
                        <h3 key={idx} className="text-base font-bold text-foreground mt-3">
                          {line.replace("### ", "")}
                        </h3>
                      );
                    }
                    // Checklist
                    if (line.startsWith("- [x] ")) {
                      return (
                        <div key={idx} className="flex items-center gap-2 text-muted-foreground line-through">
                          <CheckSquare className="size-4 text-emerald-500 shrink-0" />
                          <span>{line.replace("- [x] ", "")}</span>
                        </div>
                      );
                    }
                    if (line.startsWith("- [ ] ")) {
                      return (
                        <div key={idx} className="flex items-center gap-2 text-foreground">
                          <div className="size-4 rounded-xs border border-muted-foreground/60 shrink-0" />
                          <span>{line.replace("- [ ] ", "")}</span>
                        </div>
                      );
                    }
                    // Bullet list
                    if (line.startsWith("- ")) {
                      return (
                        <div key={idx} className="flex items-start gap-2 text-foreground ml-2">
                          <span className="size-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                          <span>{line.replace("- ", "")}</span>
                        </div>
                      );
                    }
                    // Blockquote
                    if (line.startsWith("> ")) {
                      return (
                        <blockquote
                          key={idx}
                          className="border-l-4 border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 py-2 px-4 rounded-r-md italic text-muted-foreground my-2"
                        >
                          {line.replace("> ", "")}
                        </blockquote>
                      );
                    }
                    // Horizontal rule
                    if (line.trim() === "---") {
                      return <hr key={idx} className="border-border/70 my-4" />;
                    }
                    // Empty line
                    if (!line.trim()) {
                      return <div key={idx} className="h-3" />;
                    }
                    // Regular paragraph
                    return (
                      <p key={idx} className="text-foreground leading-relaxed">
                        {line}
                      </p>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground italic">Dokumen ini masih kosong.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
