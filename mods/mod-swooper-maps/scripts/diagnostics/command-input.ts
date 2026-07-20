/** Parsed operands and flags supplied to one diagnostic command. */
export type DiagnosticCommandInput = Readonly<{
  positionals: string[];
  flags: Record<string, string | true>;
}>;

/**
 * Identifies JSON data objects accepted by diagnostic configuration overrides.
 * Arrays and class instances stay atomic so a recursive merge cannot reinterpret their shape.
 */
export function isJsonDataObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Applies a diagnostic configuration override recursively across JSON data objects.
 * Non-object values, including arrays, replace the corresponding base value as one atomic unit.
 */
export function mergeDiagnosticConfig(base: unknown, override: unknown): unknown {
  if (override === undefined) return base;
  if (!isJsonDataObject(base) || !isJsonDataObject(override)) return override;

  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = mergeDiagnosticConfig(merged[key], value);
  }
  return merged;
}

/**
 * Splits a diagnostic command line into positional operands and `--key [value]` flags.
 * A flag without a following value becomes `true`, preserving switches separately from omission.
 */
export function parseDiagnosticArgs(argv: readonly string[]): DiagnosticCommandInput {
  const positionals: string[] = [];
  const flags: Record<string, string | true> = {};

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index] ?? "";
    if (!argument.startsWith("--")) {
      positionals.push(argument);
      continue;
    }

    const key = argument.slice(2);
    const next = argv[index + 1];
    if (next != null && !next.startsWith("--")) {
      flags[key] = next;
      index++;
    } else {
      flags[key] = true;
    }
  }

  return { positionals, flags };
}
