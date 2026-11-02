// types/note.ts

export type NoteCategory =
  | "Kuliah"
  | "Work"
  | "Personal"
  | "Ideas"
  | "Project"
  | "Lainnya";

export interface Note {
  id: string;
  user_id?: string | null;
  title: string;
  content: string;
  icon: string;
  cover_image: string | null;
  category: NoteCategory;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  icon?: string;
  cover_image?: string | null;
  category?: NoteCategory;
  tags?: string[];
  is_pinned?: boolean;
  is_archived?: boolean;
}

export type UpdateNoteInput = Partial<CreateNoteInput>;

export interface NoteFilters {
  search?: string;
  category?: NoteCategory | "All";
  tag?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
}

export interface NoteTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: NoteCategory;
  cover_image: string | null;
  content: string;
  tags: string[];
}

