"use client";

import { ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateTask: () => void;
}

export default function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-border/70 bg-card/60 text-center">
      <div className="relative mb-5">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[#88C0D0]/10 border border-[#88C0D0]/30 text-[#5E81AC] dark:text-[#88C0D0] shadow-xs">
          <ListTodo className="size-8" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-lg bg-[#88C0D0] text-[#2E3440] font-bold shadow-xs">
          <Plus className="size-3.5" />
        </div>
      </div>

      <h3 className="text-base font-bold tracking-tight text-foreground mb-1">
        Belum Ada Tugas
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
        Kelola jadwal kuliah, praktikum, organisasi, atau target pribadi Anda. Buat tugas baru untuk mulai memantau kemajuan.
      </p>

      <Button
        type="button"
        onClick={onCreateTask}
        className="h-9 px-4 rounded-xl bg-[#2E3440] text-[#ECEFF4] hover:bg-[#3B4252] dark:bg-[#88C0D0] dark:text-[#2E3440] dark:hover:bg-[#8FBCBB] font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
      >
        <Plus className="mr-1.5 size-3.5" />
        <span>Tambah Tugas Pertama</span>
      </Button>
    </div>
  );
}
