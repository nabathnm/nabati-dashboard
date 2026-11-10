// components/tasks/TaskCategory.ts
import type { TaskCategory } from "@/types/task";

export interface CategoryStyle {
  /** Teks yang ditampilkan di badge */
  label: string;
  /** Latar + warna border untuk badge/chip */
  bg: string;
  /** Warna teks */
  color: string;
  /** Warna titik kecil penanda kategori */
  dot: string;
}

// Nord Theme Official Palette Mapping
// Kuliah: Frost Blue (nord9 #81A1C1 / nord10 #5E81AC)
// Organisasi: Aurora Yellow (nord13 #EBCB8B)
// Praktikum: Aurora Red (nord11 #BF616A)
// Personal/Lainnya: Aurora Purple (nord15 #B48EAD)
export const categoryStyles: Record<TaskCategory, CategoryStyle> = {
  Kuliah: {
    label: "Kuliah",
    bg: "bg-[#81A1C1]/15 border-[#81A1C1]/30 dark:bg-[#81A1C1]/20 dark:border-[#81A1C1]/40",
    color: "text-[#5E81AC] dark:text-[#88C0D0]",
    dot: "bg-[#81A1C1]",
  },
  Organisasi: {
    label: "Organisasi",
    bg: "bg-[#EBCB8B]/15 border-[#EBCB8B]/30 dark:bg-[#EBCB8B]/20 dark:border-[#EBCB8B]/40",
    color: "text-[#D08770] dark:text-[#EBCB8B]",
    dot: "bg-[#EBCB8B]",
  },
  Praktikum: {
    label: "Praktikum",
    bg: "bg-[#BF616A]/15 border-[#BF616A]/30 dark:bg-[#BF616A]/20 dark:border-[#BF616A]/40",
    color: "text-[#BF616A] dark:text-[#BF616A]",
    dot: "bg-[#BF616A]",
  },
  Personal: {
    label: "Personal",
    bg: "bg-[#B48EAD]/15 border-[#B48EAD]/30 dark:bg-[#B48EAD]/20 dark:border-[#B48EAD]/40",
    color: "text-[#B48EAD] dark:text-[#B48EAD]",
    dot: "bg-[#B48EAD]",
  },
  Lainnya: {
    label: "Lainnya",
    bg: "bg-[#B48EAD]/15 border-[#B48EAD]/30 dark:bg-[#B48EAD]/20 dark:border-[#B48EAD]/40",
    color: "text-[#B48EAD] dark:text-[#B48EAD]",
    dot: "bg-[#B48EAD]",
  },
};

/** Opsi untuk dropdown kategori (mis. di TaskModal). */
export const categoryOptions = (
  Object.entries(categoryStyles) as [TaskCategory, CategoryStyle][]
).map(([value, style]) => ({
  value,
  label: style.label,
  dotColor: style.dot,
}));
