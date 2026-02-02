export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

export type VizRunId = string;
export type VizPlanFingerprint = string;
export type VizStepId = string;

/**
 * Canonical, stable identity for an emitted visualization layer within a run.
 *
 * Invariants:
 * - Viewer code must treat this as opaque and never recompute it.
 * - Producers should keep it stable for a given (stepId, dataTypeKey, kind, variantKey).
 */
export type VizLayerKey = string;

/**
 * Stable identifier for the underlying data product (e.g. "morphology.topography.elevation").
 * Multiple layers in the same run may share a dataTypeKey (e.g. variants).
 */
export type VizDataTypeKey = string;

export type VizVariantKey = string;

export type VizScalarFormat = "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

export type VizLayerVisibility = "default" | "debug" | "hidden";

export type VizPaletteMode = "auto" | "categorical" | "continuous";

export type VizLayerKind = "grid" | "points" | "segments" | "gridFields";

export type VizSpaceId = "tile.hexOddR" | "tile.hexOddQ" | "mesh.world" | "world.xy";

export type VizScaleType = "categorical" | "linear" | "log" | "symlog" | "quantile";

export type VizNoDataSpec =
  | { kind: "none" }
  | { kind: "sentinel"; value: number }
  | { kind: "nan" };

export type VizValueDomain =
  | { kind: "unit"; min: 0; max: 1 }
  | { kind: "explicit"; min: number; max: number }
  | { kind: "fromStats" };

export type VizValueTransform =
  | { kind: "identity" }
  | { kind: "clamp"; min: number; max: number }
  | { kind: "normalize"; domain: VizValueDomain }
  | { kind: "affine"; scale: number; offset: number }
  | { kind: "piecewise"; points: Array<{ x: number; y: number }> };

export type VizValueSpec = {
  scale: VizScaleType;
  domain: VizValueDomain;
  noData?: VizNoDataSpec;
  transform?: VizValueTransform;
  units?: string;
};

export type VizScalarStats = {
  min: number;
  max: number;
  mean?: number;
  stddev?: number;
};

export type VizLayerCategory = {
  value: number | string;
  label: string;
  color: [number, number, number, number];
};

export type VizLayerMeta = {
  label?: string;
  group?: string;
  description?: string;
  visibility?: VizLayerVisibility;
  /**
   * Optional semantic hint for Studio overlays/tooling. Intended to be a small,
   * stable vocabulary (e.g. "edgeOverlay") rather than a recipe-step name.
   */
  role?: string;
  categories?: VizLayerCategory[];
  palette?: VizPaletteMode;
  showGrid?: boolean;
};

export type VizBinaryRef =
  | { kind: "path"; path: string }
  | { kind: "inline"; buffer: ArrayBuffer };

export type VizDims = { width: number; height: number };

export type VizScalarField = {
  format: VizScalarFormat;
  data: VizBinaryRef;
  stats?: VizScalarStats;
  valueSpec?: VizValueSpec;
};

export type VizLayerIdentityV1 = {
  kind: VizLayerKind;
  layerKey: VizLayerKey;
  dataTypeKey: VizDataTypeKey;
  variantKey?: VizVariantKey;
  stepId: VizStepId;
  phase?: string;
  spaceId: VizSpaceId;
  bounds: Bounds;
  meta?: VizLayerMeta;
};

export type VizLayerEmissionBaseV1 = VizLayerIdentityV1;

export type VizLayerEntryBaseV1 = VizLayerIdentityV1 & {
  stepIndex: number;
};

export type VizGridLayerEmissionV1 = VizLayerEmissionBaseV1 & {
  kind: "grid";
  dims: VizDims;
  field: VizScalarField;
};

export type VizPointsLayerEmissionV1 = VizLayerEmissionBaseV1 & {
  kind: "points";
  count: number;
  positions: VizBinaryRef; // Float32Array buffer: [x0,y0,x1,y1,...]
  values?: VizScalarField;
};

export type VizSegmentsLayerEmissionV1 = VizLayerEmissionBaseV1 & {
  kind: "segments";
  count: number;
  segments: VizBinaryRef; // Float32Array buffer: [x0,y0,x1,y1,...] pairs per segment
  values?: VizScalarField;
};

export type VizGridFieldsLayerEmissionV1 = VizLayerEmissionBaseV1 & {
  kind: "gridFields";
  dims: VizDims;
  fields: Record<string, VizScalarField>;
  /**
   * Optional semantic for vector visualization (arrows/streamlines).
   * When provided, `u` and `v` must be keys in `fields`.
   * If `magnitude` is provided, it must also exist in `fields`.
   */
  vector?: { u: string; v: string; magnitude?: string };
};

export type VizLayerEmissionV1 =
  | VizGridLayerEmissionV1
  | VizPointsLayerEmissionV1
  | VizSegmentsLayerEmissionV1
  | VizGridFieldsLayerEmissionV1;

export type VizGridLayerEntryV1 = VizLayerEntryBaseV1 & {
  kind: "grid";
  dims: VizDims;
  field: VizScalarField;
};

export type VizPointsLayerEntryV1 = VizLayerEntryBaseV1 & {
  kind: "points";
  count: number;
  positions: VizBinaryRef; // Float32Array buffer: [x0,y0,x1,y1,...]
  values?: VizScalarField;
};

export type VizSegmentsLayerEntryV1 = VizLayerEntryBaseV1 & {
  kind: "segments";
  count: number;
  segments: VizBinaryRef; // Float32Array buffer: [x0,y0,x1,y1,...] pairs per segment
  values?: VizScalarField;
};

export type VizGridFieldsLayerEntryV1 = VizLayerEntryBaseV1 & {
  kind: "gridFields";
  dims: VizDims;
  fields: Record<string, VizScalarField>;
  /**
   * Optional semantic for vector visualization (arrows/streamlines).
   * When provided, `u` and `v` must be keys in `fields`.
   * If `magnitude` is provided, it must also exist in `fields`.
   */
  vector?: { u: string; v: string; magnitude?: string };
};

export type VizLayerEntryV1 =
  | VizGridLayerEntryV1
  | VizPointsLayerEntryV1
  | VizSegmentsLayerEntryV1
  | VizGridFieldsLayerEntryV1;

export type VizManifestV1 = {
  version: 1;
  runId: VizRunId;
  planFingerprint: VizPlanFingerprint;
  steps: Array<{ stepId: VizStepId; phase?: string; stepIndex: number }>;
  layers: VizLayerEntryV1[];
};

export function createVizLayerKey(args: {
  stepId: VizStepId;
  dataTypeKey: VizDataTypeKey;
  kind: VizLayerKind;
  variantKey?: VizVariantKey;
}): VizLayerKey {
  const base = `${args.stepId}::${args.dataTypeKey}::${args.kind}`;
  return args.variantKey ? `${base}::${args.variantKey}` : base;
}

function isNoData(value: number, noData: VizNoDataSpec | undefined): boolean {
  if (!noData || noData.kind === "none") return false;
  if (noData.kind === "nan") return Number.isNaN(value);
  return value === noData.value;
}

function asNumberArray(view: ArrayBufferView, format: VizScalarFormat): ArrayLike<number> {
  const { buffer, byteOffset, byteLength } = view;
  if (format === "u8") return new Uint8Array(buffer, byteOffset, byteLength);
  if (format === "i8") return new Int8Array(buffer, byteOffset, byteLength);
  if (format === "u16") return new Uint16Array(buffer, byteOffset, byteLength / 2);
  if (format === "i16") return new Int16Array(buffer, byteOffset, byteLength / 2);
  if (format === "i32") return new Int32Array(buffer, byteOffset, byteLength / 4);
  return new Float32Array(buffer, byteOffset, byteLength / 4);
}

export function computeVizScalarStats(args: {
  format: VizScalarFormat;
  values: ArrayBufferView;
  noData?: VizNoDataSpec;
  includeMoments?: boolean;
}): VizScalarStats | null {
  const arr = asNumberArray(args.values, args.format);
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  const includeMoments = args.includeMoments ?? false;
  let count = 0;
  let mean = 0;
  let m2 = 0;

  for (let i = 0; i < arr.length; i++) {
    const raw = arr[i] as number;
    if (isNoData(raw, args.noData)) continue;
    if (!Number.isFinite(raw)) continue;

    if (raw < min) min = raw;
    if (raw > max) max = raw;

    if (includeMoments) {
      count += 1;
      const delta = raw - mean;
      mean += delta / count;
      const delta2 = raw - mean;
      m2 += delta * delta2;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;

  if (!includeMoments || count <= 1) return { min, max };
  const variance = m2 / (count - 1);
  return { min, max, mean, stddev: Math.sqrt(Math.max(0, variance)) };
}
