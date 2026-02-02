/**
 * Shared visualization helpers for emitting vector fields as multiple render variants.
 *
 * This exists to ensure producers can express a single semantic data product (`dataTypeKey`)
 * in multiple complementary forms (tiles, arrows, magnitude) without exploding `dataTypeKey`.
 *
 * @module dev/viz-vector
 */

import type { TraceScope } from "@mapgen/trace/index.js";
import type {
  VizDumper,
  VizDataTypeKey,
  VizDims,
  VizScalarFormat,
  VizSpaceId,
  VizVariantKey,
} from "@mapgen/core/types.js";
import { computeSampleStep } from "@mapgen/dev/ascii.js";
import { defineVizMeta } from "@mapgen/dev/viz-meta.js";

function safeLen(view: ArrayBufferView | null | undefined): number {
  return (view as any)?.length ?? 0;
}

function readNumber(view: ArrayBufferView, i: number): number {
  return Number((view as any)[i] ?? 0);
}

export type VectorFieldVariantsOptions = Readonly<{
  dataTypeKey: VizDataTypeKey;
  variantKey?: VizVariantKey;
  spaceId: VizSpaceId;
  dims: VizDims;
  u: { format: VizScalarFormat; values: ArrayBufferView };
  v: { format: VizScalarFormat; values: ArrayBufferView };
  label: string;
  group: string;
  visibility?: "default" | "debug" | "hidden";
  palette?: "continuous" | "categorical" | "auto";
  magnitude?: { fieldKey?: string; format?: VizScalarFormat; values?: ArrayBufferView };
  arrows?: {
    /** Sample step in tile space; defaults to `computeSampleStep(width,height)`. */
    sampleStep?: number;
    /** Maximum arrow length in tile units; defaults to 1.25. */
    maxArrowLenTiles?: number;
    /** Whether to hide arrows behind debug; defaults to false. */
    debugOnly?: boolean;
  };
  points?: {
    /** Sample step in tile space; defaults to `computeSampleStep(width,height)`. */
    sampleStep?: number;
    /** Whether to hide points behind debug; defaults to false. */
    debugOnly?: boolean;
  };
}>;

/**
 * Emit a vector field as:
 * - `gridFields` (u/v/magnitude, with `vector` descriptor)
 * - `grid` magnitude scalar (role: `magnitude`)
 * - `segments` arrow overlay (role: `arrows`)
 *
 * All variants share the same `dataTypeKey` so Studio can treat them as one conceptual layer
 * with selectable render modes (`kind[:role]`).
 */
export function dumpVectorFieldVariants(
  trace: TraceScope,
  viz: VizDumper | null | undefined,
  options: VectorFieldVariantsOptions
): void {
  if (!viz) return;

  const { dataTypeKey, variantKey, spaceId, dims, u, v } = options;
  const width = dims.width | 0;
  const height = dims.height | 0;
  const size = Math.max(0, width * height);
  const uLen = safeLen(u.values);
  const vLen = safeLen(v.values);
  const n = Math.max(0, Math.min(size, uLen, vLen));

  const magnitudeKey = options.magnitude?.fieldKey ?? "magnitude";
  const magFormat = options.magnitude?.format ?? "f32";
  const magValues: ArrayBufferView = options.magnitude?.values ?? new Float32Array(size);

  const magnitudeProvided = options.magnitude?.values != null;
  let maxMag = 0;
  let maxUvMag = 0;
  for (let i = 0; i < n; i++) {
    const ux = readNumber(u.values, i);
    const vy = readNumber(v.values, i);
    const uvMag = Math.hypot(ux, vy);
    if (Number.isFinite(uvMag) && uvMag > maxUvMag) maxUvMag = uvMag;

    const m = magnitudeProvided ? Number((magValues as any)[i] ?? 0) : uvMag;
    if (!magnitudeProvided) (magValues as any)[i] = m;
    if (Number.isFinite(m) && m > maxMag) maxMag = m;
  }

  const visibility = options.visibility ?? "default";
  const palette = options.palette ?? "continuous";

  viz.dumpGridFields(trace, {
    dataTypeKey,
    variantKey,
    spaceId,
    dims,
    fields: {
      u: { format: u.format, values: u.values },
      v: { format: v.format, values: v.values },
      [magnitudeKey]: { format: magFormat, values: magValues },
    },
    vector: { u: "u", v: "v", magnitude: magnitudeKey },
    meta: defineVizMeta(dataTypeKey, {
      label: options.label,
      group: options.group,
      role: "vector",
      palette,
      visibility,
    }),
  });

  viz.dumpGrid(trace, {
    dataTypeKey,
    variantKey,
    spaceId,
    dims,
    format: magFormat,
    values: magValues,
    meta: defineVizMeta(dataTypeKey, {
      label: options.label,
      group: options.group,
      role: "magnitude",
      palette,
      visibility,
      description: magnitudeProvided
        ? "Scalar magnitude provided by the producer for alternate rendering."
        : "Scalar magnitude derived from the vector components for alternate rendering.",
    }),
  });

  const arrows = options.arrows;
  const arrowVis = arrows?.debugOnly ? "debug" : visibility;
  if (arrowVis === "hidden") return;

  const step = computeSampleStep(width, height, arrows?.sampleStep);
  const maxArrowLenTiles = arrows?.maxArrowLenTiles ?? 1.25;
  const scale = maxUvMag > 0 ? maxArrowLenTiles / maxUvMag : 0;

  let count = 0;
  for (let y = 0; y < height; y += step) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x += step) {
      const i = rowOffset + x;
      if (i < 0 || i >= n) continue;
      const ux = readNumber(u.values, i);
      const vy = readNumber(v.values, i);
      if (ux === 0 && vy === 0) continue;
      count += 1;
    }
  }

  const segments = new Float32Array(count * 4);
  const values = new Float32Array(count);
  let j = 0;
  for (let y = 0; y < height; y += step) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x += step) {
      const i = rowOffset + x;
      if (i < 0 || i >= n) continue;
      const ux = readNumber(u.values, i);
      const vy = readNumber(v.values, i);
      if (ux === 0 && vy === 0) continue;

      const base = j * 4;
      segments[base] = x;
      segments[base + 1] = y;
      segments[base + 2] = x + ux * scale;
      segments[base + 3] = y + vy * scale;
      values[j] = Number((magValues as any)[i] ?? 0);
      j += 1;
    }
  }

  viz.dumpSegments(trace, {
    dataTypeKey,
    variantKey,
    spaceId,
    segments,
    values,
    valueFormat: "f32",
    meta: defineVizMeta(dataTypeKey, {
      label: options.label,
      group: options.group,
      role: "arrows",
      palette,
      visibility: arrowVis,
      description: `Arrow segments sampled every ${step} tiles; max vector magnitude normalized to ~${maxArrowLenTiles.toFixed(2)} tiles.`,
    }),
  });

  const points = options.points;
  const pointsVis = points?.debugOnly ? "debug" : visibility;
  if (pointsVis === "hidden") return;

  // Only emit sampled points for tile spaces; for other spaces, there is no
  // guarantee that (x,y) indices map to a stable coordinate system.
  if (typeof spaceId === "string" && spaceId.startsWith("tile.")) {
    const stepP = computeSampleStep(width, height, points?.sampleStep);

    let countP = 0;
    for (let y = 0; y < height; y += stepP) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x += stepP) {
        const i = rowOffset + x;
        if (i < 0 || i >= n) continue;
        countP += 1;
      }
    }

    const positions = new Float32Array(countP * 2);
    const valuesP = new Float32Array(countP);
    let k = 0;
    for (let y = 0; y < height; y += stepP) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x += stepP) {
        const i = rowOffset + x;
        if (i < 0 || i >= n) continue;
        const base = k * 2;
        positions[base] = x;
        positions[base + 1] = y;
        valuesP[k] = Number((magValues as any)[i] ?? 0);
        k += 1;
      }
    }

    viz.dumpPoints(trace, {
      dataTypeKey,
      variantKey,
      spaceId,
      positions,
      values: valuesP,
      valueFormat: "f32",
      meta: defineVizMeta(dataTypeKey, {
        label: options.label,
        group: options.group,
        role: "centroids",
        palette,
        visibility: pointsVis,
        description: `Sampled every ${stepP} tiles from the vector magnitude for an alternate point-based view.`,
      }),
    });
  }
}
