// Async error classification shared across Studio features.

/** Recognizes cancellation-shaped errors without requiring a browser-specific DOMException. */
export function isAbortLikeError(err: unknown): boolean {
  return Boolean(
    err && typeof err === "object" && (err as { name?: unknown }).name === "AbortError"
  );
}
