import type { TaskCategory } from "@/types/task";

export type TaskCategoryOption = {
  value: TaskCategory;
  label: string;
  activeClass: string;
  dotColor: string;
};

// Nord Theme Category Options for Select & Dropdown
export const TASK_CATEGORY_OPTIONS: TaskCategoryOption[] = [
  {
    value: "Kuliah",
    label: "Kuliah",
    activeClass:
      "bg-[#81A1C1]/15 border-[#81A1C1]/40 text-[#5E81AC] dark:text-[#88C0D0]",
    dotColor: "bg-[#81A1C1]",
  },
  {
    value: "Organisasi",
    label: "Organisasi",
    activeClass:
      "bg-[#EBCB8B]/15 border-[#EBCB8B]/40 text-[#D08770] dark:text-[#EBCB8B]",
    dotColor: "bg-[#EBCB8B]",
  },
  {
    value: "Praktikum",
    label: "Praktikum",
    activeClass:
      "bg-[#BF616A]/15 border-[#BF616A]/40 text-[#BF616A] dark:text-[#BF616A]",
    dotColor: "bg-[#BF616A]",
  },
  {
    value: "Lainnya",
    label: "Lainnya",
    activeClass:
      "bg-[#B48EAD]/15 border-[#B48EAD]/40 text-[#B48EAD] dark:text-[#B48EAD]",
    dotColor: "bg-[#B48EAD]",
  },
];
