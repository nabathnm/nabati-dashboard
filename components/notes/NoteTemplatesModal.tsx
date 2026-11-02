"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NOTE_TEMPLATES } from "@/lib/services/note-service";
import type { NoteTemplate } from "@/types/note";
import { FilePlus2, Sparkles } from "lucide-react";

interface NoteTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: NoteTemplate | null) => void;
}

export function NoteTemplatesModal({
  open,
  onOpenChange,
  onSelectTemplate,
}: NoteTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl">Notion Page Templates</DialogTitle>
              <DialogDescription>
                Pilih template siap pakai untuk memulai catatan atau proyek baru Anda.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
          {/* Blank Page Option */}
          <div
            onClick={() => {
              onSelectTemplate(null);
              onOpenChange(false);
            }}
            className="group relative flex flex-col justify-between p-4 rounded-xl border border-dashed border-border/80 hover:border-primary/60 hover:bg-accent/40 cursor-pointer transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">✨</span>
                <Badge variant="outline" className="text-xs font-normal">
                  Kosong
                </Badge>
              </div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Halaman Kosong
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                Mulai menulis bebas dari awal dengan kanvas bersih.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>Notion Canvas</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                Pilih
              </Button>
            </div>
          </div>

          {/* Preset Templates */}
          {NOTE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                onSelectTemplate(tpl);
                onOpenChange(false);
              }}
              className="group relative flex flex-col justify-between p-4 rounded-xl border border-border/70 hover:border-primary/60 hover:bg-accent/40 cursor-pointer transition-all shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{tpl.icon}</span>
                  <Badge variant="secondary" className="text-xs">
                    {tpl.category}
                  </Badge>
                </div>
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {tpl.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {tpl.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <Button size="sm" variant="secondary" className="h-7 text-xs">
                  Gunakan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

