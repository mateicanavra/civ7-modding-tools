export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

export type VizRunId = string;
export type VizPlanFingerprint = string;
/** Exact authored stage identity assigned by recipe composition. */
export type VizStageId = string;
export type VizStepId = string;

/** Opaque, stable identity for one visualization layer within a run. */
export type VizLayerKey = string;

/** Stable semantic identity for the evidence projected by a visualization layer. */
export type VizDataTypeKey = string;

export type VizVariantKey = string;

export type VizScalarFormat = "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

export type VizLayerVisibility = "default" | "debug" | "hidden";

/** Portable red, green, blue, and alpha channels encoded as integer bytes. */
export type VizRgbaColor = readonly [red: number, green: number, blue: number, alpha: number];

/** A renderer-ready continuous palette whose ordered colors span the admitted value domain. */
export type VizResolvedContinuousPalette = Readonly<{
  kind: "continuous";
  stops: readonly [VizRgbaColor, VizRgbaColor, ...VizRgbaColor[]];
}>;

/** A renderer-ready categorical palette assigned deterministically to observed scalar ids. */
export type VizResolvedCategoricalPalette = Readonly<{
  kind: "categorical";
  colors: readonly [VizRgbaColor, ...VizRgbaColor[]];
}>;

/** Fully resolved palette evidence that renderers can consume without recipe knowledge. */
export type VizResolvedPalette = VizResolvedContinuousPalette | VizResolvedCategoricalPalette;

/** Selects explicit `VizLayerMeta.categories` as the sole categorical color authority. */
export type VizExplicitCategoryPalette = Readonly<{ kind: "categorical"; colors?: never }>;

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

/** Explicit presentation for one safe-integer scalar identity. */
export type VizLayerCategory = Readonly<{
  value: number;
  label: string;
  color: VizRgbaColor;
}>;

/**
 * Portable, renderer-independent presentation metadata for one visualization layer.
 * Resolved categorical palettes have exactly one color authority: a reusable pool or explicit
 * value categories. Recipe-local style identifiers never cross this boundary.
 */
type VizLayerMetaBase = Readonly<{
  label?: string;
  group?: string;
  description?: string;
  visibility?: VizLayerVisibility;
  /** Stable semantic role used to distinguish render modes for one data product. */
  role?: string;
  showGrid?: boolean;
}>;

/**
 * Closed palette/category authority for portable layer metadata.
 * A layer either relies on the renderer's neutral scalar fallback, carries a resolved palette,
 * or carries a nonempty explicit category table. Those authorities never overlap.
 */
export type VizLayerMeta = VizLayerMetaBase &
  (
    | Readonly<{
        palette?: never;
        categories?: never;
      }>
    | Readonly<{
        palette: VizResolvedPalette;
        categories?: never;
      }>
    | Readonly<{
        palette: VizExplicitCategoryPalette;
        categories: readonly [VizLayerCategory, ...VizLayerCategory[]];
      }>
  );

/** Browser-owned binary evidence copied into a transferable buffer. */
export type VizInlineRef = { kind: "inline"; buffer: ArrayBuffer };

/** Filesystem-owned binary evidence addressed relative to a visualization manifest. */
export type VizPathRef = { kind: "path"; path: string };

/** Serialized binary references admitted by the v2 visualization contract. */
export type VizBinaryRef = VizInlineRef | VizPathRef;

export type VizDims = { width: number; height: number };

/** One materialized scalar field whose format describes the referenced binary values. */
export type VizScalarField<Ref extends VizBinaryRef = VizBinaryRef> = {
  format: VizScalarFormat;
  data: Ref;
  stats?: VizScalarStats;
  valueSpec?: VizValueSpec;
};

export type VizLayerIdentityV2 = {
  kind: VizLayerKind;
  layerKey: VizLayerKey;
  dataTypeKey: VizDataTypeKey;
  variantKey?: VizVariantKey;
  stepId: VizStepId;
  stageId: VizStageId;
  spaceId: VizSpaceId;
  bounds: Bounds;
  meta?: VizLayerMeta;
};

export type VizLayerEmissionBaseV2 = VizLayerIdentityV2;

export type VizLayerEntryBaseV2 = VizLayerIdentityV2 & {
  stepIndex: number;
};

export type VizGridLayerEmissionV2<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEmissionBaseV2 & {
    kind: "grid";
    dims: VizDims;
    field: VizScalarField<Ref>;
  };

export type VizPointsLayerEmissionV2<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEmissionBaseV2 & {
    kind: "points";
    count: number;
    /** Float32 `[x, y]` pairs materialized by the owning adapter. */
    positions: Ref;
    values?: VizScalarField<Ref>;
  };

export type VizSegmentsLayerEmissionV2<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEmissionBaseV2 & {
    kind: "segments";
    count: number;
    /** Float32 `[x0, y0, x1, y1]` segments materialized by the owning adapter. */
    segments: Ref;
    values?: VizScalarField<Ref>;
  };

export type VizGridFieldsLayerEmissionV2<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEmissionBaseV2 & {
    kind: "gridFields";
    dims: VizDims;
    fields: Record<string, VizScalarField<Ref>>;
    /** References existing fields; projection materialization never synthesizes magnitude. */
    vector?: { u: string; v: string; magnitude?: string };
  };

/** Materialized v2 layer evidence, parameterized by its adapter-owned binary reference. */
export type VizLayerEmissionV2<Ref extends VizBinaryRef = VizBinaryRef> =
  | VizGridLayerEmissionV2<Ref>
  | VizPointsLayerEmissionV2<Ref>
  | VizSegmentsLayerEmissionV2<Ref>
  | VizGridFieldsLayerEmissionV2<Ref>;

export type VizGridLayerEntryV2<Ref extends VizBinaryRef = VizBinaryRef> = VizLayerEntryBaseV2 & {
  kind: "grid";
  dims: VizDims;
  field: VizScalarField<Ref>;
};

export type VizPointsLayerEntryV2<Ref extends VizBinaryRef = VizBinaryRef> = VizLayerEntryBaseV2 & {
  kind: "points";
  count: number;
  positions: Ref;
  values?: VizScalarField<Ref>;
};

export type VizSegmentsLayerEntryV2<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEntryBaseV2 & {
    kind: "segments";
    count: number;
    segments: Ref;
    values?: VizScalarField<Ref>;
  };

export type VizGridFieldsLayerEntryV2<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEntryBaseV2 & {
    kind: "gridFields";
    dims: VizDims;
    fields: Record<string, VizScalarField<Ref>>;
    vector?: { u: string; v: string; magnitude?: string };
  };

/** Manifest layer entry, parameterized so inline and path evidence cannot be mixed accidentally. */
export type VizLayerEntryV2<Ref extends VizBinaryRef = VizBinaryRef> =
  | VizGridLayerEntryV2<Ref>
  | VizPointsLayerEntryV2<Ref>
  | VizSegmentsLayerEntryV2<Ref>
  | VizGridFieldsLayerEntryV2<Ref>;

/** Replay or streaming manifest whose binary-reference mode is fixed for every layer. */
export type VizManifestV2<Ref extends VizBinaryRef = VizBinaryRef> = {
  version: 2;
  runId: VizRunId;
  planFingerprint: VizPlanFingerprint;
  steps: Array<{ stepId: VizStepId; stageId: VizStageId; stepIndex: number }>;
  layers: Array<VizLayerEntryV2<Ref>>;
};
