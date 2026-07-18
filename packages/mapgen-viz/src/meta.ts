import type { VizDataTypeKey, VizLayerMeta } from "./model.js";

function titleCase(input: string): string {
  return input
    .replace(/[-_]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^|\s)(\w)/g, (match) => match.toUpperCase());
}

function defaultLabel(dataTypeKey: VizDataTypeKey): string {
  const parts = dataTypeKey.split(".");
  return titleCase(parts[parts.length - 1] ?? dataTypeKey);
}

function defaultGroup(dataTypeKey: VizDataTypeKey): string | undefined {
  const [domain, group] = dataTypeKey.split(".");
  if (!domain || !group) return undefined;
  return `${titleCase(domain)} / ${titleCase(group)}`;
}

/**
 * Builds semantic layer metadata, deriving a human-readable label and two-segment group when the
 * caller does not provide them. Explicit metadata always wins over the derived defaults.
 */
export function defineVizMeta(
  dataTypeKey: VizDataTypeKey,
  meta: Partial<VizLayerMeta> = {}
): VizLayerMeta {
  return {
    label: meta.label ?? defaultLabel(dataTypeKey),
    group: meta.group ?? defaultGroup(dataTypeKey),
    visibility: meta.visibility ?? "default",
    description: meta.description,
    role: meta.role,
    categories: meta.categories,
    palette: meta.palette,
    showGrid: meta.showGrid,
  };
}
