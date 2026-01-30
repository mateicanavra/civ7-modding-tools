function safeStringify(value: unknown): string | null {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === "bigint") return `${v}n`;
        if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
        if (v && typeof v === "object") {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        return v;
      },
      2
    );
  } catch {
    return null;
  }
}

export function formatErrorForUi(e: unknown): string {
  if (e instanceof Error) {
    const parts: string[] = [];
    const header = e.name ? `${e.name}: ${e.message}` : e.message;
    parts.push(header || "Error");
    const details = safeStringify(e);
    if (details && details !== "{}") parts.push(details);
    if (e.stack) parts.push(e.stack);
    return parts.join("\n\n");
  }

  if (e instanceof ErrorEvent) {
    const parts: string[] = [];
    parts.push(e.message || "ErrorEvent");
    if (e.filename) parts.push(`${e.filename}:${e.lineno}:${e.colno}`);
    if (e.error) parts.push(formatErrorForUi(e.error));
    return parts.join("\n\n");
  }

  if (typeof e === "string") return e;
  if (typeof e === "number" || typeof e === "boolean" || typeof e === "bigint") return String(e);

  const json = safeStringify(e);
  return json ?? String(e);
}
