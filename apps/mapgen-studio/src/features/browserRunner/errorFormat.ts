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

  const maybeErrorEvent = e as {
    message?: unknown;
    filename?: unknown;
    lineno?: unknown;
    colno?: unknown;
    error?: unknown;
  };

  const isErrorEvent = typeof ErrorEvent !== "undefined" && e instanceof ErrorEvent;
  if (isErrorEvent || (maybeErrorEvent && typeof maybeErrorEvent.message === "string")) {
    const parts: string[] = [];
    const message =
      typeof maybeErrorEvent.message === "string" && maybeErrorEvent.message.trim().length > 0
        ? maybeErrorEvent.message
        : "Worker error";
    parts.push(message);
    const filename = typeof maybeErrorEvent.filename === "string" ? maybeErrorEvent.filename : null;
    const lineno = typeof maybeErrorEvent.lineno === "number" ? maybeErrorEvent.lineno : null;
    const colno = typeof maybeErrorEvent.colno === "number" ? maybeErrorEvent.colno : null;
    if (filename) {
      parts.push(`${filename}:${lineno ?? "?"}:${colno ?? "?"}`);
    }
    if (maybeErrorEvent.error) parts.push(formatErrorForUi(maybeErrorEvent.error));
    return parts.join("\n\n");
  }

  if (typeof e === "string") return e;
  if (typeof e === "number" || typeof e === "boolean" || typeof e === "bigint") return String(e);

  const json = safeStringify(e);
  return json ?? String(e);
}

