import { TaskCategory } from "@/types/task";

export const categoryStyles: Record<
    TaskCategory,
    { color: string; bg: string; label: string }
> = {
    kuliah: { color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30", label: "Kuliah" },
    organisasi: { color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30", label: "Organisasi" },
    praktikum: { color: "text-rose-400", bg: "bg-rose-500/20 border-rose-500/30", label: "Praktikum" },
    lainnya: { color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/30", label: "Lainnya" },
};