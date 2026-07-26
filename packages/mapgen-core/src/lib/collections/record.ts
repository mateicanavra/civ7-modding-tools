/**
 * Extracts the string elements of an array into a fresh mutable array for tolerant metadata decoding.
 * Non-arrays return `null`, while non-string array entries are silently discarded.
 */
export function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const out: string[] = [];
  for (const v of value) {
    if (typeof v === "string") out.push(v);
  }
  return out;
}

/**
 * Narrows a non-null, non-array object to a string-keyed inspection view.
 * The result aliases the original object and performs no cloning or prototype validation.
 */
export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}
