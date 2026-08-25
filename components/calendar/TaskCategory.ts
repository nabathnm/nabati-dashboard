import { TaskCategory } from "@/types/task";

export const categoryStyles: Record<
    TaskCategory,
    { color: string; bg: string; label: string }
> = {
    Kuliah: { color: "text-blue-600 dark:text-blue-300", bg: "bg-blue-500/10 border-blue-500", label: "Kuliah" },
    Organisasi: { color: "text-yellow-700 dark:text-yellow-300", bg: "bg-yellow-500/10 border-yellow-500", label: "Organisasi" },
    Praktikum: { color: "text-rose-600 dark:text-rose-300", bg: "bg-rose-500/10 border-rose-500", label: "Praktikum" },
    Lainnya: { color: "text-purple-600 dark:text-purple-300", bg: "bg-purple-500/10 border-purple-500", label: "Lainnya" },
};