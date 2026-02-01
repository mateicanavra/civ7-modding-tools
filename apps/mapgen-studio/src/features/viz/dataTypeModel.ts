import type { VizLayerEntryV1, VizLayerVisibility, VizSpaceId } from "@swooper/mapgen-viz";

export type DataTypeId = string;
export type ProjectionId = VizSpaceId;
export type RenderModeId = string;
export type LayerVariantId = string;

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

export type ProjectionModel = Readonly<{
  projectionId: ProjectionId;
  label: string;
  renderModes: readonly RenderModeModel[];
}>;

export type DataTypeModel = Readonly<{
  dataTypeId: DataTypeId;
  label: string;
  visibility: VizLayerVisibility;
  projections: readonly ProjectionModel[];
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

function formatProjectionLabel(spaceId: VizSpaceId): string {
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

export function buildStepDataTypeModel(
  manifest: { layers: readonly VizLayerEntryV1[] },
  stepId: string
): StepDataTypeModel {
  const layers = manifest.layers.filter((l) => l.stepId === stepId);

  const dataTypeOrder: string[] = [];
  const dataTypes = new Map<
    DataTypeId,
    {
      label: string;
      visibility: VizLayerVisibility;
      projectionOrder: ProjectionId[];
      projections: Map<
        ProjectionId,
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
        visibility: resolveLayerVisibility(layer),
        projectionOrder: [],
        projections: new Map(),
      });
    }

    const entry = dataTypes.get(dataTypeId)!;
    entry.visibility = reduceVisibility(entry.visibility, resolveLayerVisibility(layer));

    const projectionId: ProjectionId = layer.spaceId;
    if (!entry.projections.has(projectionId)) {
      entry.projectionOrder.push(projectionId);
      entry.projections.set(projectionId, { renderModeOrder: [], renderModes: new Map() });
    }

    const projection = entry.projections.get(projectionId)!;
    const renderModeId = computeRenderModeId(layer);
    if (!projection.renderModes.has(renderModeId)) {
      projection.renderModeOrder.push(renderModeId);
      projection.renderModes.set(renderModeId, { variants: [] });
    }

    const variants = projection.renderModes.get(renderModeId)!.variants;
    const variantId = inferLayerVariantId(layer) ?? layer.layerKey;
    const variantLabel = inferLayerVariantId(layer) ?? "default";
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
        visibility: dt.visibility,
        projections: dt.projectionOrder.map((projectionId) => {
          const p = dt.projections.get(projectionId)!;
          return {
            projectionId,
            label: formatProjectionLabel(projectionId),
            renderModes: p.renderModeOrder.map((renderModeId) => ({
              renderModeId,
              label: formatRenderModeLabel(renderModeId),
              variants: p.renderModes.get(renderModeId)!.variants,
            })),
          };
        }),
      };
    }),
  };
}
