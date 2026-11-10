import type { TaskCategory } from "@/types/task";

export type TaskCategoryConfig = {
  color: string;
  bg: string;
  dot: string;
  label: string;
};

// Nord Theme Palette Configuration
// Kuliah: Frost Blue (nord9 #81A1C1)
// Organisasi: Aurora Yellow (nord13 #EBCB8B)
// Praktikum: Aurora Red (nord11 #BF616A)
// Personal / Lainnya: Aurora Purple (nord15 #B48EAD)
export const CATEGORY_CONFIG: Record<TaskCategory, TaskCategoryConfig> = {
  Kuliah: {
    color: "text-[#5E81AC] dark:text-[#88C0D0]",
    bg: "bg-[#81A1C1]/15 border-[#81A1C1]/30 dark:bg-[#81A1C1]/20 dark:border-[#81A1C1]/40",
    dot: "bg-[#81A1C1]",
    label: "Kuliah",
  },
  Organisasi: {
    color: "text-[#D08770] dark:text-[#EBCB8B]",
    bg: "bg-[#EBCB8B]/15 border-[#EBCB8B]/30 dark:bg-[#EBCB8B]/20 dark:border-[#EBCB8B]/40",
    dot: "bg-[#EBCB8B]",
    label: "Organisasi",
  },
  Praktikum: {
    color: "text-[#BF616A] dark:text-[#BF616A]",
    bg: "bg-[#BF616A]/15 border-[#BF616A]/30 dark:bg-[#BF616A]/20 dark:border-[#BF616A]/40",
    dot: "bg-[#BF616A]",
    label: "Praktikum",
  },
  Personal: {
    color: "text-[#B48EAD] dark:text-[#B48EAD]",
    bg: "bg-[#B48EAD]/15 border-[#B48EAD]/30 dark:bg-[#B48EAD]/20 dark:border-[#B48EAD]/40",
    dot: "bg-[#B48EAD]",
    label: "Personal",
  },
  Lainnya: {
    color: "text-[#B48EAD] dark:text-[#B48EAD]",
    bg: "bg-[#B48EAD]/15 border-[#B48EAD]/30 dark:bg-[#B48EAD]/20 dark:border-[#B48EAD]/40",
    dot: "bg-[#B48EAD]",
    label: "Lainnya",
  },
};
