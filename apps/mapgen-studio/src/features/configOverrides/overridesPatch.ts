function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function isArrayEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!isJsonValueEqual(a[i], b[i])) return false;
  }
  return true;
}

function isJsonValueEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) return isArrayEqual(a, b);
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const k of keysA) {
      if (!(k in b)) return false;
      if (!isJsonValueEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return false;
}

/**
 * Build an "override patch" relative to the recipe default config.
 *
 * Rationale: when overrides are enabled but unchanged, sending the entire
 * default config through `postMessage` is very expensive (structured clone).
 * Sending only the changed keys keeps reroll fast.
 *
 * Notes:
 * - Objects are diffed recursively.
 * - Arrays and scalars replace.
 * - Keys not present in `effective` are ignored (no deletions).
 */
export function buildOverridesPatch(base: unknown, effective: unknown): unknown {
  if (isJsonValueEqual(base, effective)) return undefined;

  if (Array.isArray(base) && Array.isArray(effective)) return effective;

  if (isPlainObject(base) && isPlainObject(effective)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(effective)) {
      if (FORBIDDEN_KEYS.has(key)) continue;
      const patch = buildOverridesPatch(base[key], effective[key]);
      if (patch !== undefined) out[key] = patch;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }

  return effective;
}

