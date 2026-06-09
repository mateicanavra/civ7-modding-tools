// Pure helpers that shape Civ7 setup select options for the header controls:
// locate a setup parameter, guarantee the current value is present as an option,
// and merge/normalize option groups (live snapshot, saved configs, catalog).
// Extracted verbatim from `App.tsx` during the app-decomposition slice.
import { labelForCiv7SetupValue, type Civ7SetupParameterSnapshotLike } from "./setupConfig";
import type { Civ7SetupCatalogOption } from "./api";

export function findSetupParameterLike(
  parameters: ReadonlyArray<Civ7SetupParameterSnapshotLike> | undefined,
  id: string,
): Civ7SetupParameterSnapshotLike | undefined {
  return parameters?.find((parameter) => parameter.id === id && parameter.exists !== false);
}

export function ensureSelectOption(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: unknown,
): ReadonlyArray<{ value: string; label: string }> {
  if (typeof value !== "string" || value.length === 0 || options.some((option) => option.value === value)) return options;
  return [{ value, label: labelForCiv7SetupValue(value) }, ...options];
}

export function mergeSelectOptions(
  ...groups: ReadonlyArray<ReadonlyArray<{ value: string; label: string }>>
): ReadonlyArray<{ value: string; label: string }> {
  const seen = new Set<string>();
  const out: Array<{ value: string; label: string }> = [];
  for (const group of groups) {
    for (const option of group) {
      if (!option.value && seen.has(option.value)) continue;
      if (option.value && seen.has(option.value)) continue;
      seen.add(option.value);
      out.push(option);
    }
  }
  return out;
}

export function setupCatalogOptions(
  options: ReadonlyArray<Civ7SetupCatalogOption> | undefined,
): ReadonlyArray<{ value: string; label: string }> {
  return (options ?? []).map((option) => ({ value: option.value, label: option.label }));
}
