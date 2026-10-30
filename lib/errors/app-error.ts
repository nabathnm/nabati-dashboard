export type AppErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "CONFLICT"
  | "DATABASE"
  | "UNKNOWN";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: AppErrorCode = "UNKNOWN",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}
