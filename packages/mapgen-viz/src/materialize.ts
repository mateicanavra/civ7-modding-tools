import type {
  VizBinaryRef,
  VizLayerEmissionV2,
  VizLayerIdentityV2,
  VizScalarField,
  VizStageId,
  VizStepId,
  VizValueSpec,
} from "./model.js";
import type { VizBinarySource, VizProjection, VizScalarSource } from "./projection.js";
import { createVizLayerKey } from "./projection.js";
import { assertVizVectorReferences, snapshotVizLayerMeta } from "./semantic.js";
import { computeVizScalarStats } from "./stats.js";

type VizBinarySlotIdentity =
  | Readonly<{ kind: "grid-values"; layerKey: string }>
  | Readonly<{ kind: "points-positions"; layerKey: string }>
  | Readonly<{ kind: "points-values"; layerKey: string }>
  | Readonly<{ kind: "segments-geometry"; layerKey: string }>
  | Readonly<{ kind: "segments-values"; layerKey: string }>
  | Readonly<{
      kind: "grid-field-values";
      layerKey: string;
      fieldKey: string;
    }>;

/** One binary slot whose bytes are owned by the synchronous host materializer. */
export type VizBinarySlot = VizBinarySlotIdentity &
  Readonly<{
    bytes: Uint8Array<ArrayBuffer>;
  }>;

/**
 * Environment boundary that receives one owned snapshot for host transport or persistence.
 * Callback failures propagate, and the kernel never retries or reuses a transferred slot.
 */
export type VizBinaryMaterializer<Ref extends VizBinaryRef> = (slot: VizBinarySlot) => Ref;

/** Execution-owned identity attached while projections cross a transport boundary. */
export type VizMaterializationContext = Readonly<{ stepId: VizStepId; stageId: VizStageId }>;

function assertPositiveDimensions(width: number, height: number): number {
  if (!Number.isSafeInteger(width) || width <= 0)
    throw new RangeError(`Visualization width must be a positive safe integer; received ${width}.`);
  if (!Number.isSafeInteger(height) || height <= 0)
    throw new RangeError(
      `Visualization height must be a positive safe integer; received ${height}.`
    );
  const size = width * height;
  if (!Number.isSafeInteger(size))
    throw new RangeError(`Visualization grid cardinality exceeds the safe integer range.`);
  return size;
}

function assertScalarCardinality(source: VizScalarSource, expected: number, label: string): void {
  if (source.values.length !== expected) {
    throw new RangeError(
      `${label} requires ${expected} scalar values; received ${source.values.length}.`
    );
  }
}

function admitScalarBinarySource(source: VizScalarSource): VizBinarySource {
  const values = source.values;
  if (source.format === "u8" && values instanceof Uint8Array) return values;
  if (source.format === "i8" && values instanceof Int8Array) return values;
  if (source.format === "u16" && values instanceof Uint16Array) return values;
  if (source.format === "i16" && values instanceof Int16Array) return values;
  if (source.format === "i32" && values instanceof Int32Array) return values;
  if (source.format === "f32" && values instanceof Float32Array) return values;
  throw new TypeError(
    `Visualization scalar format ${source.format} has no matching binary source.`
  );
}

function admitFloat32Geometry(source: ArrayLike<number>, label: string): Float32Array {
  if (source instanceof Float32Array) return source;
  throw new TypeError(`${label} must be backed by Float32Array.`);
}

function snapshotBinarySource(source: VizBinarySource): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(source.byteLength);
  bytes.set(new Uint8Array(source.buffer, source.byteOffset, source.byteLength));
  return bytes;
}

function snapshotDimensions(dims: Readonly<{ width: number; height: number }>): {
  width: number;
  height: number;
} {
  return { width: dims.width, height: dims.height };
}

function snapshotVectorRelation(
  vector: Readonly<{ u: string; v: string; magnitude?: string }> | undefined
): { u: string; v: string; magnitude?: string } | undefined {
  return vector ? { ...vector } : undefined;
}

function deriveGeometryBounds(
  values: ArrayLike<number>,
  label: string
): [minX: number, minY: number, maxX: number, maxY: number] {
  if (values.length === 0) return [0, 0, 1, 1];

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < values.length; index += 2) {
    const x = values[index] as number;
    const y = values[index + 1] as number;
    if (!Number.isFinite(x) || !Number.isFinite(y))
      throw new RangeError(`${label} geometry must contain only finite coordinates.`);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return [minX, minY, maxX, maxY];
}

type VizScalarFieldEvidence = Omit<VizScalarField, "data">;

type VizScalarFieldSnapshot = Readonly<{
  bytes: Uint8Array<ArrayBuffer>;
  evidence: VizScalarFieldEvidence;
}>;

function scalarSourceFromSnapshot(
  source: VizScalarSource,
  bytes: Uint8Array<ArrayBuffer>,
  valueSpec: VizValueSpec | undefined
): VizScalarSource {
  if (source.format === "u8")
    return { format: "u8", values: new Uint8Array(bytes.buffer), valueSpec };
  if (source.format === "i8")
    return { format: "i8", values: new Int8Array(bytes.buffer), valueSpec };
  if (source.format === "u16")
    return { format: "u16", values: new Uint16Array(bytes.buffer), valueSpec };
  if (source.format === "i16")
    return { format: "i16", values: new Int16Array(bytes.buffer), valueSpec };
  if (source.format === "i32")
    return { format: "i32", values: new Int32Array(bytes.buffer), valueSpec };
  return { format: "f32", values: new Float32Array(bytes.buffer), valueSpec };
}

function snapshotScalarField(source: VizScalarSource): VizScalarFieldSnapshot {
  const bytes = snapshotBinarySource(admitScalarBinarySource(source));
  const valueSpec = snapshotValueSpec(source.valueSpec);
  const ownedSource = scalarSourceFromSnapshot(source, bytes, valueSpec);
  return {
    bytes,
    evidence: {
      format: source.format,
      stats: computeVizScalarStats(ownedSource) ?? undefined,
      valueSpec,
    },
  };
}

function snapshotFloat32Geometry(
  source: ArrayLike<number>,
  label: string
): Readonly<{ bytes: Uint8Array<ArrayBuffer>; values: Float32Array }> {
  const bytes = snapshotBinarySource(admitFloat32Geometry(source, label));
  return { bytes, values: new Float32Array(bytes.buffer) };
}

function materializeScalarField<Ref extends VizBinaryRef>(
  evidence: VizScalarFieldEvidence,
  ref: Ref
): VizScalarField<Ref> {
  return { ...evidence, data: ref };
}

function snapshotValueSpec(valueSpec: VizValueSpec | undefined): VizValueSpec | undefined {
  if (!valueSpec) return undefined;
  const transform = valueSpec.transform;
  return {
    ...valueSpec,
    domain: { ...valueSpec.domain },
    noData: valueSpec.noData ? { ...valueSpec.noData } : undefined,
    transform:
      transform?.kind === "piecewise"
        ? { ...transform, points: transform.points.map((point) => ({ ...point })) }
        : transform?.kind === "normalize"
          ? { ...transform, domain: { ...transform.domain } }
          : transform
            ? { ...transform }
            : undefined,
  };
}

function materializedIdentity(
  projection: VizProjection,
  context: VizMaterializationContext
): Omit<VizLayerIdentityV2, "bounds"> {
  const layerKey = createVizLayerKey({
    stepId: context.stepId,
    dataTypeKey: projection.dataTypeKey,
    spaceId: projection.spaceId,
    kind: projection.kind,
    role: projection.meta?.role,
    variantKey: projection.variantKey,
  });
  return {
    kind: projection.kind,
    layerKey,
    dataTypeKey: projection.dataTypeKey,
    variantKey: projection.variantKey,
    stepId: context.stepId,
    stageId: context.stageId,
    spaceId: projection.spaceId,
    meta: snapshotVizLayerMeta(projection.meta),
  };
}

/**
 * Validates and materializes one environment-neutral visualization projection.
 *
 * The function owns identity, bounds, counts, scalar statistics, vector references, and binary
 * slot order. It validates the complete projection before invoking the adapter, invokes that
 * adapter exactly once per slot, transferring the projection's sole owned binary snapshot.
 */
export function materializeVizProjection<Ref extends VizBinaryRef>(
  projection: VizProjection,
  context: VizMaterializationContext,
  materializeBinary: VizBinaryMaterializer<Ref>
): VizLayerEmissionV2<Ref> {
  const identity = materializedIdentity(projection, context);

  if (projection.kind === "grid") {
    const dims = snapshotDimensions(projection.dims);
    const size = assertPositiveDimensions(dims.width, dims.height);
    assertScalarCardinality(projection.field, size, "Grid projection");
    const field = snapshotScalarField(projection.field);
    const ref = materializeBinary({
      kind: "grid-values",
      layerKey: identity.layerKey,
      bytes: field.bytes,
    });
    return {
      ...identity,
      kind: "grid",
      bounds: [0, 0, dims.width, dims.height],
      dims,
      field: materializeScalarField(field.evidence, ref),
    };
  }

  if (projection.kind === "points") {
    if (projection.positions.length % 2 !== 0)
      throw new RangeError(`Point geometry must contain complete [x, y] pairs.`);
    const count = projection.positions.length / 2;
    if (!Number.isSafeInteger(count))
      throw new RangeError(`Point count exceeds safe integer range.`);
    if (projection.values) assertScalarCardinality(projection.values, count, "Point projection");
    const positionsSnapshot = snapshotFloat32Geometry(projection.positions, "Point geometry");
    const valueSnapshot = projection.values ? snapshotScalarField(projection.values) : undefined;
    const bounds = deriveGeometryBounds(positionsSnapshot.values, "Point projection");

    const positions = materializeBinary({
      kind: "points-positions",
      layerKey: identity.layerKey,
      bytes: positionsSnapshot.bytes,
    });
    const values = valueSnapshot
      ? materializeScalarField(
          valueSnapshot.evidence,
          materializeBinary({
            kind: "points-values",
            layerKey: identity.layerKey,
            bytes: valueSnapshot.bytes,
          })
        )
      : undefined;
    return { ...identity, kind: "points", bounds, count, positions, values };
  }

  if (projection.kind === "segments") {
    if (projection.segments.length % 4 !== 0)
      throw new RangeError(`Segment geometry must contain complete [x0, y0, x1, y1] values.`);
    const count = projection.segments.length / 4;
    if (!Number.isSafeInteger(count))
      throw new RangeError(`Segment count exceeds safe integer range.`);
    if (projection.values) assertScalarCardinality(projection.values, count, "Segment projection");
    const segmentsSnapshot = snapshotFloat32Geometry(projection.segments, "Segment geometry");
    const valueSnapshot = projection.values ? snapshotScalarField(projection.values) : undefined;
    const bounds = deriveGeometryBounds(segmentsSnapshot.values, "Segment projection");

    const segments = materializeBinary({
      kind: "segments-geometry",
      layerKey: identity.layerKey,
      bytes: segmentsSnapshot.bytes,
    });
    const values = valueSnapshot
      ? materializeScalarField(
          valueSnapshot.evidence,
          materializeBinary({
            kind: "segments-values",
            layerKey: identity.layerKey,
            bytes: valueSnapshot.bytes,
          })
        )
      : undefined;
    return { ...identity, kind: "segments", bounds, count, segments, values };
  }

  const dims = snapshotDimensions(projection.dims);
  const vector = snapshotVectorRelation(projection.vector);
  const size = assertPositiveDimensions(dims.width, dims.height);
  const entries = Object.entries(projection.fields);
  if (entries.length === 0)
    throw new RangeError(`Grid-fields projection requires at least one field.`);
  for (const [fieldKey, field] of entries) {
    if (fieldKey.length === 0) throw new RangeError(`Grid-fields keys must not be empty.`);
    assertScalarCardinality(field, size, `Grid field ${fieldKey}`);
  }
  assertVizVectorReferences(projection.fields, vector);

  const fieldSnapshots = entries.map(
    ([fieldKey, field]) => [fieldKey, snapshotScalarField(field)] as const
  );
  const materializedFields: Array<readonly [string, VizScalarField<Ref>]> = [];
  for (const [fieldKey, snapshot] of fieldSnapshots) {
    const ref = materializeBinary({
      kind: "grid-field-values",
      layerKey: identity.layerKey,
      fieldKey,
      bytes: snapshot.bytes,
    });
    materializedFields.push([fieldKey, materializeScalarField(snapshot.evidence, ref)]);
  }
  return {
    ...identity,
    kind: "gridFields",
    bounds: [0, 0, dims.width, dims.height],
    dims,
    fields: Object.fromEntries(materializedFields),
    vector,
  };
}
