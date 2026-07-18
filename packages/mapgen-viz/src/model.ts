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
  /** Stable semantic role used to distinguish render modes for one data product. */
  role?: string;
  categories?: VizLayerCategory[];
  palette?: VizPaletteMode;
  showGrid?: boolean;
};

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
