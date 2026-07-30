function isNumericPathSegment(segment: string): boolean {
  return /^[0-9]+$/.test(segment);
}

/**
 * Reads a nested config value without assuming every intermediate node exists.
 *
 * @param root - Config value at which traversal begins.
 * @param path - Property or array-index segments; an empty path addresses `root` itself.
 * @returns The addressed value, or `undefined` when traversal reaches a non-object or missing key.
 */
export function getAtPath(root: unknown, path: readonly string[]): unknown {
  let current: unknown = root;
  for (const segment of path) {
    if (!current || typeof current !== "object") return undefined;
    const record = current as Record<string, unknown>;
    current = record[segment];
  }
  return current;
}

/**
 * Immutably replaces a nested config value while preserving untouched sibling references.
 * Missing containers are synthesized as arrays when the next segment is numeric and objects
 * otherwise; an empty path replaces the root value.
 *
 * @param root - Existing config value to update.
 * @param path - Property or numeric array-index segments locating the replacement.
 * @param value - Value to install at the addressed location.
 * @returns A new root with each traversed container shallow-cloned.
 */
export function setAtPath(root: unknown, path: readonly string[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const container: unknown =
    root && typeof root === "object"
      ? Array.isArray(root)
        ? [...root]
        : { ...(root as Record<string, unknown>) }
      : isNumericPathSegment(head)
        ? []
        : {};

  if (Array.isArray(container) && isNumericPathSegment(head)) {
    const idx = Number(head);
    (container as unknown[])[idx] = setAtPath((container as unknown[])[idx], rest, value);
    return container;
  }

  (container as Record<string, unknown>)[head] = setAtPath(
    (container as Record<string, unknown>)[head],
    rest,
    value
  );
  return container;
}
