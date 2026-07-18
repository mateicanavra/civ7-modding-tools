/**
 * Interleaves parallel x/y coordinate arrays into flat `[x, y]` point geometry, truncating to the
 * shorter input without mutating either source.
 */
export function interleaveXY(x: ArrayLike<number>, y: ArrayLike<number>): Float32Array {
  const count = Math.min(x.length, y.length);
  const positions = new Float32Array(count * 2);
  for (let index = 0; index < count; index += 1) {
    positions[index * 2] = x[index] ?? 0;
    positions[index * 2 + 1] = y[index] ?? 0;
  }
  return positions;
}

/**
 * Builds flat `[x0, y0, x1, y1]` geometry from CSR neighbor topology. Invalid neighbor indices are
 * skipped, reciprocal edges are emitted once, and an incomplete offset table yields no segments.
 */
export function buildNeighborSegments(
  input: Readonly<{
    offsets: ArrayLike<number>;
    neighbors: ArrayLike<number>;
    x: ArrayLike<number>;
    y: ArrayLike<number>;
  }>
): Float32Array {
  const pointCount = Math.max(0, Math.min(input.x.length, input.y.length));
  if (pointCount === 0 || input.offsets.length < pointCount + 1) return new Float32Array();

  const segments: number[] = [];
  for (let point = 0; point < pointCount; point += 1) {
    const start = input.offsets[point] ?? 0;
    const end = input.offsets[point + 1] ?? start;
    for (let neighborIndex = start; neighborIndex < end; neighborIndex += 1) {
      const neighbor = input.neighbors[neighborIndex] ?? -1;
      if (neighbor <= point || neighbor < 0 || neighbor >= pointCount) continue;
      segments.push(
        input.x[point] ?? 0,
        input.y[point] ?? 0,
        input.x[neighbor] ?? 0,
        input.y[neighbor] ?? 0
      );
    }
  }
  return new Float32Array(segments);
}

/** Inputs for normalized segment geometry sampled from parallel point-vector sources. */
export type BuildSampledVectorSegmentsOptions = Readonly<{
  x: ArrayLike<number>;
  y: ArrayLike<number>;
  u: ArrayLike<number>;
  v: ArrayLike<number>;
  magnitudes: ArrayLike<number>;
  /** Maximum rendered segment length in source coordinate units; defaults to `0.8`. */
  maxSegmentLength?: number;
  /** Optional fixed sample stride; otherwise a viewer-friendly stride is derived from cardinality. */
  sampleStep?: number;
}>;

/** Portable segment geometry and scalar evidence projected from point-vector sources. */
export type SampledVectorSegments = Readonly<{
  segments: Float32Array;
  values: Float32Array;
}>;

/**
 * Samples parallel point-vector sources into normalized segment geometry without mutating them.
 * Invalid samples are omitted and every emitted segment retains its corresponding magnitude.
 */
export function buildSampledVectorSegments(
  options: BuildSampledVectorSegmentsOptions
): SampledVectorSegments {
  const cardinality = Math.min(
    options.x.length,
    options.y.length,
    options.u.length,
    options.v.length,
    options.magnitudes.length
  );
  let maxMagnitude = 0;
  for (let index = 0; index < cardinality; index += 1) {
    const magnitude = Number(options.magnitudes[index] ?? 0);
    if (Number.isFinite(magnitude) && magnitude > maxMagnitude) maxMagnitude = magnitude;
  }

  const maxSegmentLength = options.maxSegmentLength ?? 0.8;
  if (!Number.isFinite(maxSegmentLength) || maxSegmentLength <= 0) {
    throw new RangeError("Vector segment maximum length must be a positive finite number.");
  }
  const requestedStep = options.sampleStep;
  if (
    requestedStep !== undefined &&
    (!Number.isFinite(requestedStep) || requestedStep <= 0 || !Number.isInteger(requestedStep))
  ) {
    throw new RangeError("Vector segment sample step must be a positive integer.");
  }
  const sampleStep = requestedStep ?? Math.max(1, Math.round(Math.sqrt(cardinality / 400)));
  const scale = maxMagnitude > 0 ? maxSegmentLength / maxMagnitude : 0;

  const segments: number[] = [];
  const values: number[] = [];
  for (let index = 0; index < cardinality; index += sampleStep) {
    const x = Number(options.x[index] ?? 0);
    const y = Number(options.y[index] ?? 0);
    const u = Number(options.u[index] ?? 0);
    const v = Number(options.v[index] ?? 0);
    const magnitude = Number(options.magnitudes[index] ?? 0);
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(u) ||
      !Number.isFinite(v) ||
      !Number.isFinite(magnitude) ||
      magnitude <= 0
    ) {
      continue;
    }
    segments.push(x, y, x + u * scale, y + v * scale);
    values.push(magnitude);
  }

  return {
    segments: new Float32Array(segments),
    values: new Float32Array(values),
  };
}
