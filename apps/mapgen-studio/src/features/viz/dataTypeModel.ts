import { getLayerKey, type VizLayerEntryV0, type VizLayerVisibility } from "./model";

export type DataTypeId = string;
export type RenderModeId = string;
export type LayerVariantId = string;

export type LayerVariant = Readonly<{
  variantId: LayerVariantId;
  label: string;
  layerKey: string;
  layer: VizLayerEntryV0;
}>;

export type RenderModeModel = Readonly<{
  renderModeId: RenderModeId;
  label: string;
  variants: readonly LayerVariant[];
}>;

export type DataTypeModel = Readonly<{
  dataTypeId: DataTypeId;
  label: string;
  visibility: VizLayerVisibility;
  renderModes: readonly RenderModeModel[];
}>;

export type StepDataTypeModel = Readonly<{
  stepId: string;
  dataTypes: readonly DataTypeModel[];
}>;

function resolveLayerVisibility(layer: VizLayerEntryV0): VizLayerVisibility {
  const visibility = layer.meta?.visibility;
  if (visibility === "debug") return "debug";
  if (visibility === "hidden") return "hidden";
  return "default";
}

function inferLayerVariantId(layer: VizLayerEntryV0): string | null {
  if (layer.fileKey) return layer.fileKey;
  const path =
    layer.kind === "grid"
      ? layer.path
      : layer.kind === "points"
        ? layer.valuesPath ?? layer.positionsPath
        : layer.valuesPath ?? layer.segmentsPath;
  if (!path) return null;
  const parts = path.split("/");
  return parts[parts.length - 1] ?? null;
}

function computeRenderModeId(layer: VizLayerEntryV0): RenderModeId {
  const role = layer.meta?.role;
  return role ? `${layer.kind}:${role}` : layer.kind;
}

function formatRenderModeLabel(renderModeId: RenderModeId): string {
  const [kind, role] = renderModeId.split(":");
  const base =
    kind === "grid" ? "Grid" : kind === "points" ? "Points" : kind === "segments" ? "Segments" : kind;
  return role ? `${base} · ${role}` : base;
}

function reduceVisibility(current: VizLayerVisibility, next: VizLayerVisibility): VizLayerVisibility {
  // Most visible wins: default > debug > hidden.
  if (current === "default" || next === "default") return "default";
  if (current === "debug" || next === "debug") return "debug";
  return "hidden";
}

export function buildStepDataTypeModel(manifest: { layers: readonly VizLayerEntryV0[] }, stepId: string): StepDataTypeModel {
  const layers = manifest.layers.filter((l) => l.stepId === stepId);

  const dataTypeOrder: string[] = [];
  const dataTypes = new Map<
    DataTypeId,
    {
      label: string;
      visibility: VizLayerVisibility;
      renderModeOrder: string[];
      renderModes: Map<RenderModeId, { variants: LayerVariant[] }>;
    }
  >();

  for (const layer of layers) {
    const dataTypeId: DataTypeId = layer.layerId;
    if (!dataTypes.has(dataTypeId)) {
      dataTypeOrder.push(dataTypeId);
      dataTypes.set(dataTypeId, {
        label: layer.meta?.label ?? layer.layerId,
        visibility: resolveLayerVisibility(layer),
        renderModeOrder: [],
        renderModes: new Map(),
      });
    }

    const entry = dataTypes.get(dataTypeId)!;
    entry.visibility = reduceVisibility(entry.visibility, resolveLayerVisibility(layer));

    const renderModeId = computeRenderModeId(layer);
    if (!entry.renderModes.has(renderModeId)) {
      entry.renderModeOrder.push(renderModeId);
      entry.renderModes.set(renderModeId, { variants: [] });
    }

    const variants = entry.renderModes.get(renderModeId)!.variants;
    const variantId = inferLayerVariantId(layer) ?? getLayerKey(layer);
    const variantLabel = inferLayerVariantId(layer) ?? "default";
    variants.push({
      variantId,
      label: variantLabel,
      layerKey: getLayerKey(layer),
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
        renderModes: dt.renderModeOrder.map((renderModeId) => ({
          renderModeId,
          label: formatRenderModeLabel(renderModeId),
          variants: dt.renderModes.get(renderModeId)!.variants,
        })),
      };
    }),
  };
}

