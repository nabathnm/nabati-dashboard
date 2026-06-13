import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(5000, "Description is too long")
    .optional(),
  category: z.enum(["kuliah", "organisasi", "praktikum", "lainnya"]),
  progress: z
    .number()
    .min(0)
    .max(100)
    .default(0),
  due_date: z.string().optional().nullable(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
