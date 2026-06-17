import { TaskCategory } from "@/types/task";

export const categoryStyles: Record<
    TaskCategory,
    { color: string; bg: string; label: string }
> = {
    Kuliah: { color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500", label: "Kuliah" },
    Organisasi: { color: "text-yellow-600", bg: "bg-yellow-500/10 border-yellow-500", label: "Organisasi" },
    Praktikum: { color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500", label: "Praktikum" },
    Lainnya: { color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500", label: "Lainnya" },
};