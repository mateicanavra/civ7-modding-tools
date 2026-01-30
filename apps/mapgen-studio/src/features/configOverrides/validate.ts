import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

export type ConfigOverridesValidationResult<TConfig> =
  | { ok: true; value: TConfig }
  | { ok: false; error: string };

function formatConfigErrors(errors: ReadonlyArray<{ path: string; message: string }>): string {
  return errors.map((e) => `${e.path}: ${e.message}`).join("\n");
}

export function validateConfigOverridesJson<TConfig>(
  schema: unknown,
  jsonText: string,
  basePathForErrors: string
): ConfigOverridesValidationResult<TConfig> {
  try {
    const parsed: unknown = JSON.parse(jsonText);
    const { value, errors } = normalizeStrict<TConfig>(schema as any, parsed, basePathForErrors);
    if (errors.length > 0) {
      return { ok: false, error: formatConfigErrors(errors) };
    }
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}
