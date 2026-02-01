import type { VizLayerEntryV1, VizLayerVisibility, VizSpaceId } from "@swooper/mapgen-viz";

export type DataTypeId = string;
export type RenderModeId = string;
export type LayerVariantId = string;
export type SpaceId = VizSpaceId;

export type LayerVariant = Readonly<{
  variantId: LayerVariantId;
  label: string;
  layerKey: string;
  layer: VizLayerEntryV1;
}>;

export type RenderModeModel = Readonly<{
  renderModeId: RenderModeId;
  label: string;
  variants: readonly LayerVariant[];
}>;

export type SpaceModel = Readonly<{
  spaceId: SpaceId;
  label: string;
  renderModes: readonly RenderModeModel[];
}>;

export type DataTypeModel = Readonly<{
  dataTypeId: DataTypeId;
  label: string;
  group?: string;
  visibility: VizLayerVisibility;
  spaces: readonly SpaceModel[];
}>;

export type StepDataTypeModel = Readonly<{
  stepId: string;
  dataTypes: readonly DataTypeModel[];
}>;

function resolveLayerVisibility(layer: VizLayerEntryV1): VizLayerVisibility {
  const visibility = layer.meta?.visibility;
  if (visibility === "debug") return "debug";
  if (visibility === "hidden") return "hidden";
  return "default";
}

function inferLayerVariantId(layer: VizLayerEntryV1): string | null {
  return layer.variantKey ?? null;
}

function computeRenderModeId(layer: VizLayerEntryV1): RenderModeId {
  const role = layer.meta?.role;
  return role ? `${layer.kind}:${role}` : layer.kind;
}

function formatRenderModeLabel(renderModeId: RenderModeId): string {
  const [kind, role] = renderModeId.split(":");
  const base =
    kind === "grid"
      ? "Grid"
      : kind === "points"
        ? "Points"
        : kind === "segments"
          ? "Segments"
          : kind === "gridFields"
            ? "Grid Fields"
            : kind;
  return role ? `${base} · ${role}` : base;
}

function reduceVisibility(current: VizLayerVisibility, next: VizLayerVisibility): VizLayerVisibility {
  // Most visible wins: default > debug > hidden.
  if (current === "default" || next === "default") return "default";
  if (current === "debug" || next === "debug") return "debug";
  return "hidden";
}

function formatSpaceLabel(spaceId: VizSpaceId): string {
  switch (spaceId) {
    case "tile.hexOddR":
      return "Tiles · Hex (Odd-R)";
    case "tile.hexOddQ":
      return "Tiles · Hex (Odd-Q)";
    case "world.xy":
      return "World · XY";
    case "mesh.world":
      return "Mesh · World";
    default:
      return spaceId;
  }
}

function formatVariantLabel(variantKey: string | null): string {
  if (!variantKey) return "default";
  const idx = variantKey.indexOf(":");
  if (idx < 0) return variantKey;
  const dim = variantKey.slice(0, idx).trim();
  const value = variantKey.slice(idx + 1).trim();
  if (!dim || !value) return variantKey;
  return `${dim} · ${value}`;
}

export function buildStepDataTypeModel(
  manifest: { layers: readonly VizLayerEntryV1[] },
  stepId: string,
  opts?: { includeDebug?: boolean }
): StepDataTypeModel {
  const includeDebug = opts?.includeDebug ?? false;
  const layers = manifest.layers
    .filter((l) => l.stepId === stepId)
    .filter((l) => {
      const vis = resolveLayerVisibility(l);
      if (vis === "hidden") return false;
      if (vis === "debug") return includeDebug;
      return true;
    });

  const dataTypeOrder: string[] = [];
  const dataTypes = new Map<
    DataTypeId,
    {
      label: string;
      group?: string;
      visibility: VizLayerVisibility;
      spaceOrder: SpaceId[];
      spaces: Map<
        SpaceId,
        {
          renderModeOrder: RenderModeId[];
          renderModes: Map<RenderModeId, { variants: LayerVariant[] }>;
        }
      >;
    }
  >();

  for (const layer of layers) {
    const dataTypeId: DataTypeId = layer.dataTypeKey;
    if (!dataTypes.has(dataTypeId)) {
      dataTypeOrder.push(dataTypeId);
      dataTypes.set(dataTypeId, {
        label: layer.meta?.label ?? layer.dataTypeKey,
        group: layer.meta?.group,
        visibility: resolveLayerVisibility(layer),
        spaceOrder: [],
        spaces: new Map(),
      });
    }

    const entry = dataTypes.get(dataTypeId)!;
    entry.visibility = reduceVisibility(entry.visibility, resolveLayerVisibility(layer));
    if (!entry.group && layer.meta?.group) entry.group = layer.meta.group;

    const spaceId: SpaceId = layer.spaceId;
    if (!entry.spaces.has(spaceId)) {
      entry.spaceOrder.push(spaceId);
      entry.spaces.set(spaceId, { renderModeOrder: [], renderModes: new Map() });
    }

    const space = entry.spaces.get(spaceId)!;
    const renderModeId = computeRenderModeId(layer);
    if (!space.renderModes.has(renderModeId)) {
      space.renderModeOrder.push(renderModeId);
      space.renderModes.set(renderModeId, { variants: [] });
    }

    const variants = space.renderModes.get(renderModeId)!.variants;
    const variantId = inferLayerVariantId(layer) ?? layer.layerKey;
    const variantLabel = formatVariantLabel(inferLayerVariantId(layer));
    variants.push({
      variantId,
      label: variantLabel,
      layerKey: layer.layerKey,
      layer,
    });
  }

  return {
    stepId,
    dataTypes: dataTypeOrder.map((dataTypeId) => {
      const dt = dataTypes.get(dataTypeId)!;
      return {
        dataTypeId,
        label: dt.label,
        group: dt.group,
        visibility: dt.visibility,
        spaces: dt.spaceOrder.map((spaceId) => {
          const s = dt.spaces.get(spaceId)!;
          return {
            spaceId,
            label: formatSpaceLabel(spaceId),
            renderModes: s.renderModeOrder.map((renderModeId) => ({
              renderModeId,
              label: formatRenderModeLabel(renderModeId),
              variants: s.renderModes.get(renderModeId)!.variants,
            })),
          };
        }),
      };
    }),
  };
}
