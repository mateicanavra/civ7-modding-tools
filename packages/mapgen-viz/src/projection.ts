import type {
  VizDataTypeKey,
  VizDims,
  VizLayerKey,
  VizLayerKind,
  VizLayerMeta,
  VizScalarFormat,
  VizSpaceId,
  VizStepId,
  VizValueSpec,
  VizVariantKey,
} from "./model.js";

type VizScalarSourceBase = Readonly<{
  valueSpec?: VizValueSpec;
}>;

/** Scalar source whose declared format is coupled to its concrete typed-array representation. */
export type VizScalarSource =
  | (VizScalarSourceBase & { format: "u8"; values: Uint8Array })
  | (VizScalarSourceBase & { format: "i8"; values: Int8Array })
  | (VizScalarSourceBase & { format: "u16"; values: Uint16Array })
  | (VizScalarSourceBase & { format: "i16"; values: Int16Array })
  | (VizScalarSourceBase & { format: "i32"; values: Int32Array })
  | (VizScalarSourceBase & { format: "f32"; values: Float32Array });

/** Typed-array values admitted by the visualization projection kernel. */
export type VizBinarySource = VizScalarSource["values"] | Float32Array;

type VizProjectionIdentity = Readonly<{
  dataTypeKey: VizDataTypeKey;
  variantKey?: VizVariantKey;
  spaceId: VizSpaceId;
  meta?: VizLayerMeta;
}>;

/** One scalar field projected over a positive rectangular grid. */
export type VizGridProjection = VizProjectionIdentity &
  Readonly<{
    kind: "grid";
    dims: VizDims;
    field: VizScalarSource;
  }>;

/** Point geometry with optional one-value-per-point scalar evidence. */
export type VizPointsProjection = VizProjectionIdentity &
  Readonly<{
    kind: "points";
    positions: Float32Array;
    values?: VizScalarSource;
  }>;

/** Segment geometry with optional one-value-per-segment scalar evidence. */
export type VizSegmentsProjection = VizProjectionIdentity &
  Readonly<{
    kind: "segments";
    segments: Float32Array;
    values?: VizScalarSource;
  }>;

/** Named grid fields whose insertion order remains the viewer's scalar fallback order. */
export type VizGridFieldsProjection = VizProjectionIdentity &
  Readonly<{
    kind: "gridFields";
    dims: VizDims;
    /** Field insertion order is preserved as product-visible scalar fallback authority. */
    fields: Readonly<Record<string, VizScalarSource>>;
    vector?: Readonly<{ u: string; v: string; magnitude?: string }>;
  }>;

/** Closed, environment-neutral description of spatial evidence awaiting binary materialization. */
export type VizProjection =
  | VizGridProjection
  | VizPointsProjection
  | VizSegmentsProjection
  | VizGridFieldsProjection;

/**
 * Admits a legacy format/view pair into the closed scalar-source union.
 *
 * Compatibility adapters call this at their boundary; the projection kernel never carries an
 * arbitrary `ArrayBufferView` whose representation can contradict its declared scalar format.
 */
export function admitVizScalarSource(
  args: Readonly<{
    format: VizScalarFormat;
    values: ArrayBufferView;
    valueSpec?: VizValueSpec;
  }>
): VizScalarSource {
  const { format, values, valueSpec } = args;
  if (format === "u8" && values instanceof Uint8Array) return { format, values, valueSpec };
  if (format === "i8" && values instanceof Int8Array) return { format, values, valueSpec };
  if (format === "u16" && values instanceof Uint16Array) return { format, values, valueSpec };
  if (format === "i16" && values instanceof Int16Array) return { format, values, valueSpec };
  if (format === "i32" && values instanceof Int32Array) return { format, values, valueSpec };
  if (format === "f32" && values instanceof Float32Array) return { format, values, valueSpec };
  throw new TypeError(
    `Visualization scalar format ${format} does not match ${values.constructor.name}.`
  );
}

/**
 * Builds the canonical opaque layer identity from semantic projection inputs.
 * Viewer and adapter code consume this key but must never independently recompute it.
 */
export function createVizLayerKey(
  args: Readonly<{
    stepId: VizStepId;
    dataTypeKey: VizDataTypeKey;
    spaceId: VizSpaceId;
    kind: VizLayerKind;
    role?: string;
    variantKey?: VizVariantKey;
  }>
): VizLayerKey {
  const render = args.role ? `${args.kind}:${args.role}` : args.kind;
  const base = `${args.stepId}::${args.dataTypeKey}::${args.spaceId}::${render}`;
  return args.variantKey ? `${base}::${args.variantKey}` : base;
}
