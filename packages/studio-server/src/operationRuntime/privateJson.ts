export type JsonValue =
  | null
  | string
  | number
  | boolean
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export function privateJson(value: unknown): JsonValue {
  const ancestors: object[] = [];
  const encoded = JSON.stringify(value, function (this: unknown, _key, current) {
    if (typeof current === "bigint") return current.toString();
    if (current instanceof Map) return Object.fromEntries(current);
    if (current instanceof Set) return [...current];
    if (current && typeof current === "object") {
      while (ancestors.length > 0 && ancestors.at(-1) !== this) ancestors.pop();
      if (ancestors.includes(current)) return "[Circular]";
      ancestors.push(current);
    }
    return current;
  });
  if (encoded === undefined) return null;
  const parsed: unknown = JSON.parse(encoded);
  return isJsonValue(parsed) ? parsed : null;
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true;
  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
      return true;
    case "object":
      return Array.isArray(value)
        ? value.every(isJsonValue)
        : Object.values(value).every(isJsonValue);
    default:
      return false;
  }
}
