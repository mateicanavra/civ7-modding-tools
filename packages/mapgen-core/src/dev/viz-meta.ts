import type { VizLayerMeta } from "@mapgen/core/types.js";

function titleCase(input: string): string {
  return input
    .replace(/[-_]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^|\s)(\w)/g, (m) => m.toUpperCase());
}

function defaultLabel(dataTypeKey: string): string {
  const parts = dataTypeKey.split(".");
  const last = parts[parts.length - 1] ?? dataTypeKey;
  return titleCase(last);
}

function defaultGroup(dataTypeKey: string): string | undefined {
  const parts = dataTypeKey.split(".");
  if (parts.length < 2) return undefined;
  const [domain, group] = parts;
  if (!domain || !group) return undefined;
  return `${titleCase(domain)} / ${titleCase(group)}`;
}

export function defineVizMeta(dataTypeKey: string, meta: Partial<VizLayerMeta> = {}): VizLayerMeta {
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
