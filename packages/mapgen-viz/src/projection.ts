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

/** Exact typed arrays accepted after the visualization kernel admits a binary source. */
export type VizBinarySource =
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Int32Array
  | Float32Array;

/**
 * Observation surface accepted while a visualization projection is being described.
 * The copy-producing `slice` method preserves the concrete typed-array identity without
 * exposing mutation or backing storage to projection authors.
 */
type VizTypedArraySource<T extends VizBinarySource> = ArrayLike<number> & Pick<T, "slice">;

/** Scalar source whose declared format is coupled to its concrete typed-array representation. */
export type VizScalarSource =
  | (VizScalarSourceBase & { format: "u8"; values: VizTypedArraySource<Uint8Array> })
  | (VizScalarSourceBase & { format: "i8"; values: VizTypedArraySource<Int8Array> })
  | (VizScalarSourceBase & { format: "u16"; values: VizTypedArraySource<Uint16Array> })
  | (VizScalarSourceBase & { format: "i16"; values: VizTypedArraySource<Int16Array> })
  | (VizScalarSourceBase & { format: "i32"; values: VizTypedArraySource<Int32Array> })
  | (VizScalarSourceBase & { format: "f32"; values: VizTypedArraySource<Float32Array> });

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
    positions: VizTypedArraySource<Float32Array>;
    values?: VizScalarSource;
  }>;

/** Segment geometry with optional one-value-per-segment scalar evidence. */
export type VizSegmentsProjection = VizProjectionIdentity &
  Readonly<{
    kind: "segments";
    segments: VizTypedArraySource<Float32Array>;
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
 * Admits a declared scalar format and its exact typed-array representation.
 *
 * Callers use this boundary when representation arrives separately from the scalar-format tag;
 * the projection kernel never carries an arbitrary view that can contradict its declared format.
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
