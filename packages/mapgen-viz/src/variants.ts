import { defineVizMeta } from "./meta.js";
import type {
  VizDataTypeKey,
  VizDims,
  VizLayerMeta,
  VizLayerVisibility,
  VizSpaceId,
  VizVariantKey,
} from "./model.js";
import type { VizProjection, VizScalarSource } from "./projection.js";

type VariantIdentity = Readonly<{
  dataTypeKey: VizDataTypeKey;
  variantKey?: VizVariantKey;
  spaceId: VizSpaceId;
  dims: VizDims;
  meta?: VizLayerMeta;
}>;

/** Inputs for projecting one scalar grid into its canonical grid and sampled-point views. */
export type BuildScalarFieldProjectionsOptions = VariantIdentity &
  Readonly<{
    field: VizScalarSource;
    gridRole?: string;
    points?: Readonly<{
      sampleStep?: number;
      debugOnly?: boolean;
    }>;
  }>;

/** Inputs for projecting one vector grid into field, magnitude, arrow, and point views. */
export type BuildVectorFieldProjectionsOptions = VariantIdentity &
  Readonly<{
    u: VizScalarSource;
    v: VizScalarSource;
    vector?: Readonly<{ debugOnly?: boolean }>;
    magnitude?: Readonly<{
      fieldKey?: string;
      source?: VizScalarSource;
      debugOnly?: boolean;
    }>;
    arrows?: Readonly<{
      sampleStep?: number;
      maxArrowLengthTiles?: number;
      debugOnly?: boolean;
    }>;
    points?: Readonly<{
      sampleStep?: number;
      debugOnly?: boolean;
    }>;
  }>;

function sourceLength(source: VizScalarSource): number {
  return source.values.length;
}

function sourceValue(source: VizScalarSource, index: number): number {
  return Number(source.values[index] ?? 0);
}

function sampleStep(width: number, height: number, requested?: number): number {
  if (requested !== undefined) {
    if (!Number.isFinite(requested) || requested <= 0 || !Number.isInteger(requested)) {
      throw new RangeError("Visualization sample step must be a positive integer.");
    }
    return requested;
  }
  const stepX = width > 72 ? Math.floor(width / 72) : 1;
  const stepY = height > 48 ? Math.floor(height / 48) : 1;
  return Math.max(1, Math.min(stepX, stepY));
}

function variantVisibility(
  visibility: VizLayerVisibility,
  debugOnly: boolean | undefined
): VizLayerVisibility {
  if (visibility === "hidden") return "hidden";
  return debugOnly ? "debug" : visibility;
}

function variantMeta(
  dataTypeKey: VizDataTypeKey,
  meta: VizLayerMeta | undefined,
  role: string | undefined,
  visibility: VizLayerVisibility,
  description?: string
): VizLayerMeta {
  return defineVizMeta(dataTypeKey, {
    ...meta,
    role,
    visibility,
    description: description ?? meta?.description,
  });
}

function sampledScalarPoints(
  dims: VizDims,
  field: VizScalarSource,
  requestedStep?: number
): Readonly<{ positions: Float32Array; values: Float32Array; step: number }> {
  const width = Math.max(0, dims.width | 0);
  const height = Math.max(0, dims.height | 0);
  const count = Math.min(width * height, sourceLength(field));
  const step = sampleStep(width, height, requestedStep);
  const coordinates: number[] = [];
  const values: number[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = y * width + x;
      if (index >= count) continue;
      coordinates.push(x, y);
      values.push(sourceValue(field, index));
    }
  }
  return {
    positions: new Float32Array(coordinates),
    values: new Float32Array(values),
    step,
  };
}

/**
 * Projects one scalar grid into portable render variants without observing a sink or run context.
 * Returned projections borrow the source grid; only the optional sampled point view allocates.
 */
export function buildScalarFieldProjections(
  options: BuildScalarFieldProjectionsOptions
): readonly VizProjection[] {
  const visibility = options.meta?.visibility ?? "default";
  const projections: VizProjection[] = [
    {
      kind: "grid",
      dataTypeKey: options.dataTypeKey,
      variantKey: options.variantKey,
      spaceId: options.spaceId,
      dims: options.dims,
      field: options.field,
      meta: variantMeta(
        options.dataTypeKey,
        options.meta,
        options.gridRole ?? options.meta?.role,
        visibility
      ),
    },
  ];
  if (!options.points) return projections;

  const pointVisibility = variantVisibility(visibility, options.points.debugOnly);
  if (pointVisibility === "hidden") return projections;
  const sampled = sampledScalarPoints(options.dims, options.field, options.points.sampleStep);
  projections.push({
    kind: "points",
    dataTypeKey: options.dataTypeKey,
    variantKey: options.variantKey,
    spaceId: options.spaceId,
    positions: sampled.positions,
    values: {
      format: "f32",
      values: sampled.values,
      valueSpec: options.field.valueSpec,
    },
    meta: variantMeta(
      options.dataTypeKey,
      options.meta,
      "centroids",
      pointVisibility,
      `Sampled every ${sampled.step} tiles from the underlying grid for an alternate point view.`
    ),
  });
  return projections;
}

function magnitudeSource(
  options: BuildVectorFieldProjectionsOptions,
  count: number
): Readonly<{ source: VizScalarSource; maxVectorMagnitude: number }> {
  let maxVectorMagnitude = 0;
  const provided = options.magnitude?.source;
  if (provided) {
    for (let index = 0; index < count; index += 1) {
      const magnitude = Math.hypot(sourceValue(options.u, index), sourceValue(options.v, index));
      if (Number.isFinite(magnitude) && magnitude > maxVectorMagnitude) {
        maxVectorMagnitude = magnitude;
      }
    }
    return { source: provided, maxVectorMagnitude };
  }

  const computed = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const magnitude = Math.hypot(sourceValue(options.u, index), sourceValue(options.v, index));
    if (Number.isFinite(magnitude) && magnitude > maxVectorMagnitude) {
      maxVectorMagnitude = magnitude;
    }
    computed[index] = magnitude;
  }
  return {
    source: { format: "f32", values: computed },
    maxVectorMagnitude,
  };
}

/**
 * Projects one vector grid into portable field, magnitude, arrow, and point variants.
 * Component and provided-magnitude views are borrowed; derived magnitude and sampled geometry are
 * allocated once so every sink observes the same completed evidence.
 */
export function buildVectorFieldProjections(
  options: BuildVectorFieldProjectionsOptions
): readonly VizProjection[] {
  const width = Math.max(0, options.dims.width | 0);
  const height = Math.max(0, options.dims.height | 0);
  const count = Math.min(width * height, sourceLength(options.u), sourceLength(options.v));
  const magnitude = magnitudeSource(options, count);
  const magnitudeKey = options.magnitude?.fieldKey ?? "magnitude";
  const visibility = options.meta?.visibility ?? "default";
  const vectorVisibility = variantVisibility(visibility, options.vector?.debugOnly);
  const magnitudeVisibility = variantVisibility(visibility, options.magnitude?.debugOnly);
  const projections: VizProjection[] = [];

  if (vectorVisibility !== "hidden") {
    projections.push({
      kind: "gridFields",
      dataTypeKey: options.dataTypeKey,
      variantKey: options.variantKey,
      spaceId: options.spaceId,
      dims: options.dims,
      fields: { u: options.u, v: options.v, [magnitudeKey]: magnitude.source },
      vector: { u: "u", v: "v", magnitude: magnitudeKey },
      meta: variantMeta(options.dataTypeKey, options.meta, "vector", vectorVisibility),
    });
  }
  if (magnitudeVisibility !== "hidden") {
    projections.push({
      kind: "grid",
      dataTypeKey: options.dataTypeKey,
      variantKey: options.variantKey,
      spaceId: options.spaceId,
      dims: options.dims,
      field: magnitude.source,
      meta: variantMeta(
        options.dataTypeKey,
        options.meta,
        "magnitude",
        magnitudeVisibility,
        options.magnitude?.source
          ? "Scalar magnitude provided by the producer for alternate rendering."
          : "Scalar magnitude derived from the vector components for alternate rendering."
      ),
    });
  }

  if (options.arrows) {
    const arrowVisibility = variantVisibility(visibility, options.arrows.debugOnly);
    if (arrowVisibility !== "hidden") {
      const step = sampleStep(width, height, options.arrows.sampleStep);
      const maxLength = options.arrows.maxArrowLengthTiles ?? 1.25;
      if (!Number.isFinite(maxLength) || maxLength <= 0) {
        throw new RangeError("Visualization arrow maximum length must be positive and finite.");
      }
      const scale = magnitude.maxVectorMagnitude > 0 ? maxLength / magnitude.maxVectorMagnitude : 0;
      const segments: number[] = [];
      const values: number[] = [];
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = y * width + x;
          if (index >= count) continue;
          const u = sourceValue(options.u, index);
          const v = sourceValue(options.v, index);
          if (u === 0 && v === 0) continue;
          segments.push(x, y, x + u * scale, y + v * scale);
          values.push(sourceValue(magnitude.source, index));
        }
      }
      projections.push({
        kind: "segments",
        dataTypeKey: options.dataTypeKey,
        variantKey: options.variantKey,
        spaceId: options.spaceId,
        segments: new Float32Array(segments),
        values: { format: "f32", values: new Float32Array(values) },
        meta: variantMeta(
          options.dataTypeKey,
          options.meta,
          "arrows",
          arrowVisibility,
          `Arrow segments sampled every ${step} tiles; maximum vector magnitude is normalized to approximately ${maxLength.toFixed(2)} tiles.`
        ),
      });
    }
  }

  if (options.points && options.spaceId.startsWith("tile.")) {
    const pointVisibility = variantVisibility(visibility, options.points.debugOnly);
    if (pointVisibility !== "hidden") {
      const sampled = sampledScalarPoints(
        options.dims,
        magnitude.source,
        options.points.sampleStep
      );
      projections.push({
        kind: "points",
        dataTypeKey: options.dataTypeKey,
        variantKey: options.variantKey,
        spaceId: options.spaceId,
        positions: sampled.positions,
        values: { format: "f32", values: sampled.values },
        meta: variantMeta(
          options.dataTypeKey,
          options.meta,
          "centroids",
          pointVisibility,
          `Sampled every ${sampled.step} tiles from vector magnitude for an alternate point view.`
        ),
      });
    }
  }
  return projections;
}
