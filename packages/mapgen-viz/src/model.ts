export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

export type VizRunId = string;
export type VizPlanFingerprint = string;
export type VizStepId = string;

/** Opaque, stable identity for one visualization layer within a run. */
export type VizLayerKey = string;

/** Stable semantic identity for the evidence projected by a visualization layer. */
export type VizDataTypeKey = string;

export type VizVariantKey = string;

export type VizScalarFormat = "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

export type VizLayerVisibility = "default" | "debug" | "hidden";

/** Legacy v1 palette selector retained so existing manifests and producers remain readable. */
export type VizLegacyPaletteMode = "auto" | "categorical" | "continuous";

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

/** @deprecated Use `VizLegacyPaletteMode` when reading legacy palette selectors. */
export type VizPaletteMode = VizLegacyPaletteMode;

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

/**
 * Explicit presentation for one integer scalar identity.
 * Integer strings remain readable for existing v1 manifests, but materialization and rendering
 * normalize them to the same safe-integer identity as their number-valued equivalent.
 */
export type VizLayerCategory = Readonly<{
  value: number | string;
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
 * Legacy v1 selectors retain their existing optional category table, while resolved palettes
 * either own a color pool or require one nonempty explicit category table, never both.
 */
export type VizLayerMeta = VizLayerMetaBase &
  (
    | Readonly<{
        palette?: VizLegacyPaletteMode;
        categories?: readonly VizLayerCategory[];
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

/** Serialized binary references admitted by the v1 visualization contract. */
export type VizBinaryRef = VizInlineRef | VizPathRef;

export type VizDims = { width: number; height: number };

/** One materialized scalar field whose format describes the referenced binary values. */
export type VizScalarField<Ref extends VizBinaryRef = VizBinaryRef> = {
  format: VizScalarFormat;
  data: Ref;
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

export type VizGridLayerEmissionV1<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEmissionBaseV1 & {
    kind: "grid";
    dims: VizDims;
    field: VizScalarField<Ref>;
  };

export type VizPointsLayerEmissionV1<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEmissionBaseV1 & {
    kind: "points";
    count: number;
    /** Float32 `[x, y]` pairs materialized by the owning adapter. */
    positions: Ref;
    values?: VizScalarField<Ref>;
  };

export type VizSegmentsLayerEmissionV1<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEmissionBaseV1 & {
    kind: "segments";
    count: number;
    /** Float32 `[x0, y0, x1, y1]` segments materialized by the owning adapter. */
    segments: Ref;
    values?: VizScalarField<Ref>;
  };

export type VizGridFieldsLayerEmissionV1<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEmissionBaseV1 & {
    kind: "gridFields";
    dims: VizDims;
    fields: Record<string, VizScalarField<Ref>>;
    /** References existing fields; projection materialization never synthesizes magnitude. */
    vector?: { u: string; v: string; magnitude?: string };
  };

/** Materialized v1 layer evidence, parameterized by its adapter-owned binary reference. */
export type VizLayerEmissionV1<Ref extends VizBinaryRef = VizBinaryRef> =
  | VizGridLayerEmissionV1<Ref>
  | VizPointsLayerEmissionV1<Ref>
  | VizSegmentsLayerEmissionV1<Ref>
  | VizGridFieldsLayerEmissionV1<Ref>;

export type VizGridLayerEntryV1<Ref extends VizBinaryRef = VizBinaryRef> = VizLayerEntryBaseV1 & {
  kind: "grid";
  dims: VizDims;
  field: VizScalarField<Ref>;
};

export type VizPointsLayerEntryV1<Ref extends VizBinaryRef = VizBinaryRef> = VizLayerEntryBaseV1 & {
  kind: "points";
  count: number;
  positions: Ref;
  values?: VizScalarField<Ref>;
};

export type VizSegmentsLayerEntryV1<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEntryBaseV1 & {
    kind: "segments";
    count: number;
    segments: Ref;
    values?: VizScalarField<Ref>;
  };

export type VizGridFieldsLayerEntryV1<Ref extends VizBinaryRef = VizBinaryRef> =
  VizLayerEntryBaseV1 & {
    kind: "gridFields";
    dims: VizDims;
    fields: Record<string, VizScalarField<Ref>>;
    vector?: { u: string; v: string; magnitude?: string };
  };

/** Manifest layer entry, parameterized so inline and path evidence cannot be mixed accidentally. */
export type VizLayerEntryV1<Ref extends VizBinaryRef = VizBinaryRef> =
  | VizGridLayerEntryV1<Ref>
  | VizPointsLayerEntryV1<Ref>
  | VizSegmentsLayerEntryV1<Ref>
  | VizGridFieldsLayerEntryV1<Ref>;

/** Replay or streaming manifest whose binary-reference mode is fixed for every layer. */
export type VizManifestV1<Ref extends VizBinaryRef = VizBinaryRef> = {
  version: 1;
  runId: VizRunId;
  planFingerprint: VizPlanFingerprint;
  steps: Array<{ stepId: VizStepId; phase?: string; stepIndex: number }>;
  layers: Array<VizLayerEntryV1<Ref>>;
};
