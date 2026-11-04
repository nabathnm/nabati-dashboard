"use client";

import { useEffect, useRef, useState } from "react";
import type { Note, NoteCategory } from "@/types/note";
import { NOTE_CATEGORIES, NOTE_COVERS } from "@/lib/services/note-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  ArrowLeft,
  CheckSquare,
  Code2,
  Copy,
  Download,
  Eye,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Palette,
  Pin,
  PinOff,
  Plus,
  Quote,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onBackToGallery?: () => void;
}

const EMOJI_LIST = [
  "📝",
  "🚀",
  "💡",
  "🎯",
  "📚",
  "☕",
  "🎨",
  "🧠",
  "⚡",
  "🔥",
  "💻",
  "📌",
  "📋",
  "🌟",
  "🌿",
  "🛠️",
  "📅",
  "💬",
  "🏆",
  "🎓",
  "⭐",
  "🍕",
  "✈️",
  "🔍",
  "🔑",
  "📁",
  "📈",
  "⚙️",
  "✅",
  "🏷️",
];

export function NoteEditor({
  note,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
  onDuplicateNote,
  isSidebarOpen,
  onToggleSidebar,
  onBackToGallery,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [icon, setIcon] = useState(note.icon || "📝");
  const [coverImage, setCoverImage] = useState<string | null>(note.cover_image);
  const [category, setCategory] = useState<NoteCategory>(note.category);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when active note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setIcon(note.icon || "📝");
    setCoverImage(note.cover_image);
    setCategory(note.category);
    setTags(note.tags || []);
    setSaveStatus("saved");
  }, [note.id]);

  // Debounced auto-save for title & content
  useEffect(() => {
    if (
      title === note.title &&
      content === note.content &&
      icon === note.icon &&
      coverImage === note.cover_image &&
      category === note.category &&
      JSON.stringify(tags) === JSON.stringify(note.tags)
    ) {
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      onUpdateNote(note.id, {
        title,
        content,
        icon,
        cover_image: coverImage,
        category,
        tags,
      });
      setSaveStatus("saved");
    }, 600);

    return () => clearTimeout(timer);
  }, [title, content, icon, coverImage, category, tags]);

  // Insert block helpers into markdown textarea
  const insertBlock = (prefix: string, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const replacement = `${prefix}${selectedText || "Teks baru"}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 8)
      );
    }, 50);
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      const updatedTags = [...tags, trimmed];
      setTags(updatedTags);
      onUpdateNote(note.id, { tags: updatedTags });
    }
    setNewTagInput("");
    setIsAddingTag(false);
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    setTags(updatedTags);
    onUpdateNote(note.id, { tags: updatedTags });
  };

  // Export as Markdown
  const handleExportMarkdown = () => {
    const markdownContent = `# ${title}\n\n${content}`;
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-") || "untitled"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Interactive Checklist toggle inside preview
  const handleToggleChecklist = (lineIndex: number) => {
    const lines = content.split("\n");
    if (lines[lineIndex]) {
      if (lines[lineIndex].includes("- [ ]")) {
        lines[lineIndex] = lines[lineIndex].replace("- [ ]", "- [x]");
      } else if (lines[lineIndex].includes("- [x]")) {
        lines[lineIndex] = lines[lineIndex].replace("- [x]", "- [ ]");
      }
      const updated = lines.join("\n");
      setContent(updated);
      onUpdateNote(note.id, { content: updated });
    }
  };

  // Word count & reading time
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-card/40 backdrop-blur-xs">
        {/* Left: Back to Gallery, Sidebar toggle & Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          {onBackToGallery && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToGallery}
              className="h-7 px-2.5 gap-1.5 text-xs rounded-lg hover:bg-muted font-mono font-medium shrink-0 cursor-pointer"
              title="Kembali ke Galeri Floe"
            >
              <ArrowLeft className="size-3.5 text-cyan-500" />
              <span className="hidden sm:inline">Galeri</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="size-7 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title={isSidebarOpen ? "Sembunyikan Sidebar" : "Buka Sidebar"}
          >
            {isSidebarOpen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </Button>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <span className="hover:text-foreground cursor-pointer">Catatan</span>
            <span>/</span>
            <Badge variant="outline" className="text-[10px] h-4.5 font-normal">
              {category}
            </Badge>
            <span>/</span>
            <span className="font-medium text-foreground truncate max-w-[140px] sm:max-w-[220px]">
              {title || "Untitled"}
            </span>
          </div>
        </div>

        {/* Right: Actions, Save Indicator, View mode */}
        <div className="flex items-center gap-1.5">
          {/* Save Status Indicator */}
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mr-2">
            {saveStatus === "saving" ? (
              <>
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Menyimpan...</span>
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="hidden sm:inline">Tersimpan</span>
              </>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-muted/60 rounded-md text-xs mr-1">
            <button
              onClick={() => setViewMode("edit")}
              className={cn(
                "px-2 py-1 rounded-sm flex items-center gap-1 transition-all cursor-pointer",
                viewMode === "edit"
                  ? "bg-card text-foreground shadow-xs font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Mode Tulis"
            >
              <FileText className="size-3" />
              <span className="hidden md:inline">Edit</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={cn(
                "px-2 py-1 rounded-sm flex items-center gap-1 transition-all cursor-pointer",
                viewMode === "preview"
                  ? "bg-card text-foreground shadow-xs font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Mode Baca / Pratinjau"
            >
              <Eye className="size-3" />
              <span className="hidden md:inline">Pratinjau</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={cn(
                "hidden lg:flex px-2 py-1 rounded-sm items-center gap-1 transition-all cursor-pointer",
                viewMode === "split"
                  ? "bg-card text-foreground shadow-xs font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Split View (Edit & Preview)"
            >
              <span className="text-[11px] font-bold">||</span>
              <span>Split</span>
            </button>
          </div>

          {/* Pin Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTogglePin(note.id)}
            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
            title={note.is_pinned ? "Lepas Pin" : "Pin Catatan"}
          >
            {note.is_pinned ? (
              <PinOff className="size-3.5 text-amber-500 fill-amber-500" />
            ) : (
              <Pin className="size-3.5" />
            )}
          </Button>

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
              <span className="text-base font-bold leading-none mb-1">•••</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem onClick={() => onDuplicateNote(note.id)}>
                <Copy className="size-3.5 mr-2" /> Gandakan Halaman
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportMarkdown}>
                <Download className="size-3.5 mr-2" /> Unduh sebagai Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteNote(note.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5 mr-2" /> Hapus Halaman
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Cover Image Banner (Notion style) */}
        {coverImage ? (
          <div
            className="group/cover relative h-44 w-full transition-all"
            style={{ background: coverImage }}
          >
            <div className="absolute right-4 bottom-3 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center gap-1.5 bg-background/80 backdrop-blur-md px-2 py-1 rounded-lg border border-border/60 text-xs shadow-md">
              <Popover>
                <PopoverTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer">
                  <Palette className="size-3" />
                  <span>Ubah Cover</span>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end">
                  <p className="text-xs font-semibold mb-2">Pilih Warna Gradien</p>
                  <div className="grid grid-cols-3 gap-2">
                    {NOTE_COVERS.map((cov, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCoverImage(cov);
                          onUpdateNote(note.id, { cover_image: cov });
                        }}
                        className="h-10 rounded-md cursor-pointer border border-border/50 hover:scale-105 transition-transform"
                        style={{ background: cov }}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <button
                onClick={() => {
                  setCoverImage(null);
                  onUpdateNote(note.id, { cover_image: null });
                }}
                className="flex items-center gap-1 text-destructive hover:underline cursor-pointer pl-1.5 border-l border-border/60"
              >
                <X className="size-3" /> Hapus
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-6 px-8 max-w-4xl mx-auto flex items-center gap-3 text-xs text-muted-foreground/70">
            <button
              onClick={() => {
                const randomCover =
                  NOTE_COVERS[Math.floor(Math.random() * NOTE_COVERS.length)];
                setCoverImage(randomCover);
                onUpdateNote(note.id, { cover_image: randomCover });
              }}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <ImageIcon className="size-3.5" /> Tambah Cover
            </button>
          </div>
        )}

        {/* Note Canvas Container */}
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-6 space-y-6">
          {/* Page Icon (Emoji) & Add Cover if none */}
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger className="size-16 rounded-2xl flex items-center justify-center text-4xl hover:bg-muted/60 transition-colors cursor-pointer border border-transparent hover:border-border/60 -mt-8 bg-card shadow-xs select-none">
                {icon}
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="start">
                <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
                  <span className="text-xs font-semibold">Pilih Ikon Halaman</span>
                  <span className="text-[10px] text-muted-foreground">Notion Emojis</span>
                </div>
                <div className="grid grid-cols-6 gap-2 text-2xl">
                  {EMOJI_LIST.map(em => (
                    <button
                      key={em}
                      onClick={() => {
                        setIcon(em);
                        onUpdateNote(note.id, { icon: em });
                      }}
                      className="size-9 rounded-lg hover:bg-muted flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Title Input (Notion large title) */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Tanpa Judul"
            className="w-full text-3xl md:text-4xl font-extrabold tracking-tight placeholder:text-muted-foreground/40 bg-transparent border-0 outline-none focus:ring-0 p-0 text-foreground"
          />

          {/* Properties Bar (Category, Tags, Word Count) */}
          <div className="space-y-2.5 pb-4 border-b border-border/50 text-xs text-muted-foreground">
            {/* Category Property */}
            <div className="flex items-center gap-4">
              <span className="w-20 font-medium text-muted-foreground/80 flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Kategori
              </span>
              <div className="flex items-center gap-1.5">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-6 text-xs px-2 gap-1 font-normal inline-flex items-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <span>{category}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="text-xs">
                    {NOTE_CATEGORIES.map(cat => (
                      <DropdownMenuItem
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          onUpdateNote(note.id, { category: cat });
                        }}
                      >
                        {cat}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tags Property */}
            <div className="flex items-center gap-4">
              <span className="w-20 font-medium text-muted-foreground/80 flex items-center gap-1.5">
                <span className="text-xs font-mono">#</span> Tags
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="h-5 text-[11px] gap-1 px-1.5 font-normal"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive cursor-pointer"
                    >
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                ))}

                {isAddingTag ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nama tag..."
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleAddTag();
                        if (e.key === "Escape") setIsAddingTag(false);
                      }}
                      className="h-5 w-24 text-[11px] px-1.5 rounded-sm bg-muted/60 border border-border/80 outline-none"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 px-1.5 text-[10px] cursor-pointer"
                      onClick={handleAddTag}
                    >
                      OK
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer px-1 py-0.5"
                  >
                    <Plus className="size-3" /> Tambah Tag
                  </button>
                )}
              </div>
            </div>

            {/* Stats info */}
            <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-foreground/70">
              <span className="w-20">Info</span>
              <div className="flex items-center gap-3">
                <span>{words} kata</span>
                <span>•</span>
                <span>{readTime} menit baca</span>
                <span>•</span>
                <span>
                  Diedit{" "}
                  {new Date(note.updated_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Notion Quick Block Toolbar */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50 text-xs">
              <span className="text-[10px] font-semibold text-muted-foreground px-2">
                Blok Notion:
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("# ")}
                title="Heading 1"
              >
                <Heading1 className="size-3.5" />
                <span className="hidden sm:inline">H1</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("## ")}
                title="Heading 2"
              >
                <Heading2 className="size-3.5" />
                <span className="hidden sm:inline">H2</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("### ")}
                title="Heading 3"
              >
                <Heading3 className="size-3.5" />
                <span className="hidden sm:inline">H3</span>
              </Button>

              <div className="h-4 w-px bg-border/60 mx-0.5" />

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("- [ ] ")}
                title="To-do Checklist"
              >
                <CheckSquare className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Checklist</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("- ")}
                title="Bullet List"
              >
                <List className="size-3.5" />
                <span className="hidden sm:inline">Bullet</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("1. ")}
                title="Numbered List"
              >
                <ListOrdered className="size-3.5" />
                <span className="hidden sm:inline">Numbered</span>
              </Button>

              <div className="h-4 w-px bg-border/60 mx-0.5" />

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("> 💡 **Callout:** ")}
                title="Callout Box"
              >
                <Info className="size-3.5 text-amber-500" />
                <span className="hidden sm:inline">Callout</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("> ")}
                title="Quote"
              >
                <Quote className="size-3.5" />
                <span className="hidden sm:inline">Quote</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("```typescript\n", "\n```")}
                title="Code Block"
              >
                <Code2 className="size-3.5" />
                <span className="hidden sm:inline">Code</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
                onClick={() => insertBlock("\n---\n")}
                title="Divider"
              >
                <Minus className="size-3.5" />
                <span className="hidden sm:inline">Divider</span>
              </Button>
            </div>
          )}

          {/* Main Editing / Preview Canvas Area */}
          <div
            className={cn(
              "grid gap-6 transition-all min-h-[450px]",
              viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            )}
          >
            {/* Editor Textarea */}
            {(viewMode === "edit" || viewMode === "split") && (
              <div className="relative flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Mulai menulis cerita, catatan tugas, atau ketik / untuk opsi blok..."
                  className="w-full flex-1 min-h-[450px] p-4 rounded-xl bg-card/40 border border-border/60 focus:border-primary/50 text-sm leading-relaxed outline-none resize-y font-sans transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
            )}

            {/* Notion Formatted Preview */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div className="p-5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs min-h-[450px] space-y-4 text-sm leading-relaxed">
                {renderNotionMarkdown(content, handleToggleChecklist)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Notion Markdown Renderer Helper with Interactive Checklist                */
/* -------------------------------------------------------------------------- */

function renderNotionMarkdown(
  text: string,
  onToggleChecklist: (lineIdx: number) => void
) {
  if (!text.trim()) {
    return (
      <div className="py-12 text-center text-muted-foreground text-xs italic">
        Belum ada konten untuk ditampilkan. Beralih ke mode Edit untuk mulai menulis.
      </div>
    );
  }

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    // Code block check
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBuffer.join("\n");
        elements.push(
          <div
            key={`code-${index}`}
            className="group relative my-3 rounded-xl bg-muted/80 p-3.5 font-mono text-xs overflow-x-auto border border-border/60"
          >
            <button
              onClick={() => navigator.clipboard.writeText(codeText)}
              className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              <Copy className="size-3" /> Salin
            </button>
            <pre className="text-foreground/90">{codeText}</pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Heading 1
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={index}
          className="text-2xl font-bold tracking-tight text-foreground pt-4 pb-1 border-b border-border/40"
        >
          {line.replace(/^#\s+/, "")}
        </h1>
      );
      return;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={index}
          className="text-xl font-semibold tracking-tight text-foreground pt-3 pb-0.5"
        >
          {line.replace(/^##\s+/, "")}
        </h2>
      );
      return;
    }

    // Heading 3
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={index}
          className="text-base font-semibold tracking-tight text-foreground pt-2"
        >
          {line.replace(/^###\s+/, "")}
        </h3>
      );
      return;
    }

    // Divider
    if (line.trim() === "---" || line.trim() === "***") {
      elements.push(<hr key={index} className="my-4 border-border/60" />);
      return;
    }

    // Callout Box (Notion style)
    if (line.startsWith("> 💡") || line.startsWith("> ⚡") || line.startsWith("> 📌")) {
      elements.push(
        <div
          key={index}
          className="my-3 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground/90 shadow-2xs"
        >
          <span className="text-base shrink-0 pt-0.5">{line.slice(2, 4)}</span>
          <div className="flex-1">{formatInlineMarkdown(line.slice(4).trim())}</div>
        </div>
      );
      return;
    }

    // Regular Quote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={index}
          className="my-2 border-l-3 border-primary/60 pl-3.5 italic text-muted-foreground text-xs"
        >
          {formatInlineMarkdown(line.replace(/^>\s+/, ""))}
        </blockquote>
      );
      return;
    }

    // Interactive Checklist (Notion style)
    if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      const isChecked = line.startsWith("- [x] ");
      const itemText = line.replace(/^- \[[ x]\]\s+/, "");
      elements.push(
        <div
          key={index}
          onClick={() => onToggleChecklist(index)}
          className="group flex items-start gap-2.5 py-1 px-1 rounded-md hover:bg-muted/40 cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="size-4 mt-0.5 rounded accent-primary cursor-pointer shrink-0"
          />
          <span
            className={cn(
              "text-xs transition-colors",
              isChecked ? "line-through text-muted-foreground" : "text-foreground"
            )}
          >
            {formatInlineMarkdown(itemText)}
          </span>
        </div>
      );
      return;
    }

    // Bullet List
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={index} className="ml-5 list-disc text-xs text-foreground/90 py-0.5">
          {formatInlineMarkdown(line.replace(/^[-*]\s+/, ""))}
        </li>
      );
      return;
    }

    // Numbered List
    if (/^\d+\.\s+/.test(line)) {
      elements.push(
        <li key={index} className="ml-5 list-decimal text-xs text-foreground/90 py-0.5">
          {formatInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}
        </li>
      );
      return;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={index} className="text-xs text-foreground/90 leading-relaxed">
        {formatInlineMarkdown(line)}
      </p>
    );
  });

  return elements;
}

// Inline markdown formatting (bold, italic, code)
function formatInlineMarkdown(str: string): React.ReactNode {
  // Regex for **bold**, *italic*, `code`
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
