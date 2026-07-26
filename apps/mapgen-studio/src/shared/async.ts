// Async error classification shared across Studio features.

export function isAbortLikeError(err: unknown): boolean {
  return Boolean(
    err && typeof err === "object" && (err as { name?: unknown }).name === "AbortError"
  );
}
