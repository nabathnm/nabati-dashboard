import { AppError, type AppErrorCode } from "./app-error";

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
};

export function handleSupabaseError(
  error: SupabaseErrorLike,
  fallback = "Terjadi kesalahan pada database."
): never {
  const code = error.code;

  if (code === "23514") {
    throw new AppError("Data yang dimasukkan tidak valid.", "VALIDATION", error);
  }

  if (code === "23503") {
    throw new AppError(
      "Data terkait tidak ditemukan atau tidak dapat digunakan.",
      "VALIDATION",
      error
    );
  }

  if (code === "23505") {
    throw new AppError("Data tersebut sudah tersedia.", "CONFLICT", error);
  }

  if (code === "42501") {
    throw new AppError(
      "Kamu tidak memiliki izin untuk melakukan tindakan ini.",
      "FORBIDDEN",
      error
    );
  }

  throw new AppError(fallback, "DATABASE" satisfies AppErrorCode, error);
}
