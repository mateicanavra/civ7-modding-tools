// Small async primitives shared across Studio features. Extracted verbatim from
// `App.tsx` during the app-decomposition slice.

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function isAbortLikeError(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { name?: unknown }).name === "AbortError");
}
