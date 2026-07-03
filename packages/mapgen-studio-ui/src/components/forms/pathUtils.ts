function isNumericPathSegment(segment: string): boolean {
  return /^[0-9]+$/.test(segment);
}

export function getAtPath(root: unknown, path: readonly string[]): unknown {
  let current: unknown = root;
  for (const segment of path) {
    if (!current || typeof current !== "object") return undefined;
    const record = current as Record<string, unknown>;
    current = record[segment];
  }
  return current;
}

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
