/**
 * Shared visualization helpers for emitting scalar grids as multiple render variants.
 *
 * This exists to ensure producers can express a single semantic data product (`dataTypeKey`)
 * in multiple complementary forms (grid vs sampled points) without exploding `dataTypeKey`.
 *
 * Variants emitted by this helper share the same `dataTypeKey` and differ only by `kind[:role]`,
 * enabling Studio to offer a Render selector for a single conceptual layer.
 *
 * @module dev/viz-scalar
 */

import type { TraceScope } from "@mapgen/trace/index.js";
import type {
  VizDumper,
  VizDataTypeKey,
  VizDims,
  VizScalarFormat,
  VizSpaceId,
  VizValueSpec,
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

export type ScalarFieldVariantsOptions = Readonly<{
  dataTypeKey: VizDataTypeKey;
  variantKey?: VizVariantKey;
  spaceId: VizSpaceId;
  dims: VizDims;
  field: { format: VizScalarFormat; values: ArrayBufferView; valueSpec?: VizValueSpec };
  label: string;
  group: string;
  visibility?: "default" | "debug" | "hidden";
  palette?: "continuous" | "categorical" | "auto";
  gridRole?: string;
  points?: {
    /** Sample step in tile space; defaults to `computeSampleStep(width,height)`. */
    sampleStep?: number;
    /** Whether to hide points behind debug; defaults to false. */
    debugOnly?: boolean;
  };
}>;

/**
 * Emit a scalar field as:
 * - `grid` (optionally role-tagged)
 * - `points` sampled overlay (role: `centroids`)
 *
 * Both share the same `dataTypeKey` so Studio can treat them as one conceptual layer
 * with selectable render modes.
 */
export function dumpScalarFieldVariants(
  trace: TraceScope,
  viz: VizDumper | null | undefined,
  options: ScalarFieldVariantsOptions
): void {
  if (!viz) return;

  const { dataTypeKey, variantKey, spaceId, dims, field } = options;
  const visibility = options.visibility ?? "default";
  const palette = options.palette ?? "continuous";

  viz.dumpGrid(trace, {
    dataTypeKey,
    variantKey,
    spaceId,
    dims,
    format: field.format,
    values: field.values,
    valueSpec: field.valueSpec,
    meta: defineVizMeta(dataTypeKey, {
      label: options.label,
      group: options.group,
      role: options.gridRole,
      palette,
      visibility,
    }),
  });

  const points = options.points;
  if (!points) return;
  const pointsVis = points?.debugOnly ? "debug" : visibility;
  if (pointsVis === "hidden") return;

  const width = dims.width | 0;
  const height = dims.height | 0;
  const size = Math.max(0, width * height);
  const n = Math.max(0, Math.min(size, safeLen(field.values)));
  const step = computeSampleStep(width, height, points?.sampleStep);

  let count = 0;
  for (let y = 0; y < height; y += step) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x += step) {
      const i = rowOffset + x;
      if (i < 0 || i >= n) continue;
      count += 1;
    }
  }

  const positions = new Float32Array(count * 2);
  const values = new Float32Array(count);
  let j = 0;
  for (let y = 0; y < height; y += step) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x += step) {
      const i = rowOffset + x;
      if (i < 0 || i >= n) continue;
      const base = j * 2;
      positions[base] = x;
      positions[base + 1] = y;
      values[j] = readNumber(field.values, i);
      j += 1;
    }
  }

  viz.dumpPoints(trace, {
    dataTypeKey,
    variantKey,
    spaceId,
    positions,
    values,
    valueFormat: "f32",
    valueSpec: field.valueSpec,
    meta: defineVizMeta(dataTypeKey, {
      label: options.label,
      group: options.group,
      role: "centroids",
      palette,
      visibility: pointsVis,
      description: `Sampled every ${step} tiles from the underlying grid for an alternate point-based view.`,
    }),
  });
}
