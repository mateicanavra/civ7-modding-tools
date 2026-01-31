import type { VizLayerMeta } from "@mapgen/core/types.js";

function titleCase(input: string): string {
  return input
    .replace(/[-_]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^|\s)(\w)/g, (m) => m.toUpperCase());
}

function defaultLabel(layerId: string): string {
  const parts = layerId.split(".");
  const last = parts[parts.length - 1] ?? layerId;
  return titleCase(last);
}

function defaultGroup(layerId: string): string | undefined {
  const parts = layerId.split(".");
  if (parts.length < 2) return undefined;
  const [domain, group] = parts;
  if (!domain || !group) return undefined;
  return `${titleCase(domain)} / ${titleCase(group)}`;
}

export function defineVizMeta(layerId: string, meta: Partial<VizLayerMeta> = {}): VizLayerMeta {
  return {
    label: meta.label ?? defaultLabel(layerId),
    group: meta.group ?? defaultGroup(layerId),
    visibility: meta.visibility ?? "default",
    description: meta.description,
    role: meta.role,
    categories: meta.categories,
    palette: meta.palette,
    space: meta.space,
    showGrid: meta.showGrid,
  };
}
