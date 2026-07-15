import { isDefinedError } from "@orpc/client";

/** Preserve declared oRPC evidence while excluding stacks, causes, and provider payloads. */
export function serializeVerifierError(error: unknown): Record<string, unknown> {
  if (isDefinedError(error)) {
    return {
      name: error.name,
      code: error.code,
      status: error.status,
      message: error.message,
      data: cloneForJson(error.data),
    };
  }
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { message: String(error) };
}

function cloneForJson(value: unknown): unknown {
  if (value === undefined) return undefined;
  return JSON.parse(safeJson(value));
}

function safeJson(value: unknown): string {
  const seen = new WeakSet<object>();
  return (
    JSON.stringify(value, (_key, item) => {
      if (typeof item === "bigint") return item.toString();
      if (typeof item !== "object" || item === null) return item;
      if (seen.has(item)) return "[circular]";
      seen.add(item);
      return item;
    }) ?? "null"
  );
}
