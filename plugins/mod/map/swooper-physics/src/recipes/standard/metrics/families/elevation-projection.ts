import type { CurrentMapElevationSnapshot } from "@civ7/adapter";
import { type Static, Type } from "typebox";

/** Metric identity for post-write elevation intent and adapter readback measurements. */
export const STANDARD_ELEVATION_POST_WRITE_METRIC_KEY = "map.elevation.postWrite";
/** Metric identity for elevation intent and adapter readback at final map observation. */
export const STANDARD_ELEVATION_FINAL_METRIC_KEY = "map.elevation.final";

const common = {
  version: Type.Literal(1),
  phase: Type.Union([Type.Literal("post-write"), Type.Literal("final")]),
  plotCount: Type.Integer({ minimum: 1 }),
  intendedMinimum: Type.Number(),
  intendedMaximum: Type.Number(),
};
const observed = {
  observedMinimum: Type.Number(),
  observedMaximum: Type.Number(),
  mismatchCount: Type.Integer({ minimum: 0 }),
  lakeAdjustmentCount: Type.Integer({ minimum: 0 }),
  acceptedInlandWaterAdjustmentCount: Type.Integer({ minimum: 0 }),
  unplannedNativeLakeMismatchCount: Type.Integer({ minimum: 0 }),
  nonLakeMismatchCount: Type.Integer({ minimum: 0 }),
  maximumAbsoluteError: Type.Number({ minimum: 0 }),
  meanAbsoluteError: Type.Number({ minimum: 0 }),
  examples: Type.Array(
    Type.Object(
      { plotIndex: Type.Integer({ minimum: 0 }), intended: Type.Number(), observed: Type.Number() },
      { additionalProperties: false }
    ),
    { maxItems: 8 }
  ),
};

/** Mock agreement is a storage-contract observation, never native elevation proof. */
export const StandardElevationProjectionMeasurementsSchema = Type.Union([
  Type.Object(
    { ...common, source: Type.Literal("native"), status: Type.Literal("observed"), ...observed },
    { additionalProperties: false }
  ),
  Type.Object(
    { ...common, source: Type.Literal("mock"), status: Type.Literal("mock-only"), ...observed },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...common,
      source: Type.Union([Type.Literal("native"), Type.Literal("mock")]),
      status: Type.Literal("unavailable"),
      reason: Type.Union([
        Type.Literal("getter-unavailable"),
        Type.Literal("read-failed"),
        Type.Literal("non-finite-value"),
      ]),
      plotIndex: Type.Optional(Type.Integer({ minimum: 0 })),
    },
    { additionalProperties: false }
  ),
]);

export type StandardElevationProjectionMeasurements = Static<
  typeof StandardElevationProjectionMeasurementsSchema
>;

/**
 * Compares exact numeric evidence without quantization, clipping, or an invented tolerance.
 * Separates accepted native-lake and non-lake coast-water adjustments without changing the
 * numeric evidence. These categories neither authorize a mismatch nor prove local continuity;
 * the writing step authenticates stable water, terrain and native classification separately.
 */
export function measureStandardElevationProjection(input: {
  phase: StandardElevationProjectionMeasurements["phase"];
  intended: readonly number[];
  snapshot: CurrentMapElevationSnapshot;
  acceptedLakeMask?: ArrayLike<number>;
  observedLakeMask?: ArrayLike<number>;
  observedSurface?: Readonly<{
    waterMask: ArrayLike<number>;
    terrain: ArrayLike<number>;
    coastTerrain: number;
  }>;
}): StandardElevationProjectionMeasurements {
  const { intended, snapshot, acceptedLakeMask, observedLakeMask, observedSurface } = input;
  const plotCount = snapshot.width * snapshot.height;
  if (
    !Number.isSafeInteger(snapshot.width) ||
    snapshot.width < 1 ||
    !Number.isSafeInteger(snapshot.height) ||
    snapshot.height < 1 ||
    !Number.isSafeInteger(plotCount)
  ) {
    throw new Error("Elevation measurement requires positive safe integer map dimensions.");
  }
  if (intended.length !== plotCount) {
    throw new Error("Elevation measurement requires finite intent for every map plot.");
  }
  if (acceptedLakeMask !== undefined && acceptedLakeMask.length !== plotCount) {
    throw new Error("Accepted lake mask cardinality differs from the map dimensions.");
  }
  if (observedLakeMask !== undefined && observedLakeMask.length !== plotCount) {
    throw new Error("Observed lake mask cardinality differs from the map dimensions.");
  }
  if (observedSurface !== undefined && (
    observedSurface.waterMask.length !== plotCount || observedSurface.terrain.length !== plotCount
  )) {
    throw new Error("Observed water/terrain cardinality differs from the map dimensions.");
  }
  if (observedSurface !== undefined && !Number.isSafeInteger(observedSurface.coastTerrain)) {
    throw new Error("Observed coast terrain requires a safe integer terrain identity.");
  }
  let intendedMinimum = Infinity;
  let intendedMaximum = -Infinity;
  for (let index = 0; index < plotCount; index += 1) {
    const value = intended[index];
    if (value === undefined || !Number.isFinite(value)) {
      throw new Error("Elevation measurement requires finite intent for every map plot.");
    }
    if (
      acceptedLakeMask !== undefined &&
      acceptedLakeMask[index] !== 0 &&
      acceptedLakeMask[index] !== 1
    ) {
      throw new Error("Accepted lake mask requires zero or one for every map plot.");
    }
    if (
      observedLakeMask !== undefined &&
      observedLakeMask[index] !== 0 &&
      observedLakeMask[index] !== 1
    ) {
      throw new Error("Observed lake mask requires zero or one for every map plot.");
    }
    if (observedSurface !== undefined && (
      (observedSurface.waterMask[index] !== 0 && observedSurface.waterMask[index] !== 1) ||
      !Number.isSafeInteger(observedSurface.terrain[index])
    )) {
      throw new Error("Observed surface requires binary water and integer terrain for every map plot.");
    }
    intendedMinimum = Math.min(intendedMinimum, value);
    intendedMaximum = Math.max(intendedMaximum, value);
  }
  const base = {
    version: 1 as const,
    phase: input.phase,
    plotCount,
    intendedMinimum,
    intendedMaximum,
  };
  if (snapshot.status === "unavailable") {
    return {
      ...base,
      source: snapshot.source,
      status: "unavailable",
      reason: snapshot.reason,
      ...(snapshot.plotIndex === undefined ? {} : { plotIndex: snapshot.plotIndex }),
    };
  }
  if (snapshot.values.length !== plotCount) {
    throw new Error("Elevation observation cardinality differs from the map dimensions.");
  }
  let mismatchCount = 0;
  let lakeAdjustmentCount = 0;
  let acceptedInlandWaterAdjustmentCount = 0;
  let unplannedNativeLakeMismatchCount = 0;
  let nonLakeMismatchCount = 0;
  let maximumAbsoluteError = 0;
  let totalAbsoluteError = 0;
  let observedMinimum = Infinity;
  let observedMaximum = -Infinity;
  const examples: { plotIndex: number; intended: number; observed: number }[] = [];
  for (let index = 0; index < plotCount; index += 1) {
    const expected = intended[index]!;
    const actual = snapshot.values[index]!;
    if (!Number.isFinite(actual)) {
      return {
        ...base,
        source: snapshot.source,
        status: "unavailable",
        reason: "non-finite-value",
        plotIndex: index,
      };
    }
    observedMinimum = Math.min(observedMinimum, actual);
    observedMaximum = Math.max(observedMaximum, actual);
    const error = Math.abs(actual - expected);
    if (!Number.isFinite(error) || !Number.isFinite(totalAbsoluteError + error)) {
      throw new RangeError("Elevation comparison exceeds the finite numeric error range.");
    }
    maximumAbsoluteError = Math.max(maximumAbsoluteError, error);
    totalAbsoluteError += error;
    if (error !== 0) {
      mismatchCount += 1;
      if (acceptedLakeMask?.[index] === 1 && observedLakeMask?.[index] === 1) lakeAdjustmentCount += 1;
      else if (
        acceptedLakeMask?.[index] === 1 && observedLakeMask?.[index] === 0 &&
        observedSurface?.waterMask[index] === 1 &&
        observedSurface.terrain[index] === observedSurface.coastTerrain
      ) acceptedInlandWaterAdjustmentCount += 1;
      else if (observedLakeMask?.[index] === 1) unplannedNativeLakeMismatchCount += 1;
      else nonLakeMismatchCount += 1;
      if (examples.length < 8)
        examples.push({ plotIndex: index, intended: expected, observed: actual });
    }
  }
  const measurements = {
    ...base,
    observedMinimum,
    observedMaximum,
    mismatchCount,
    lakeAdjustmentCount,
    acceptedInlandWaterAdjustmentCount,
    unplannedNativeLakeMismatchCount,
    nonLakeMismatchCount,
    maximumAbsoluteError,
    meanAbsoluteError: totalAbsoluteError / plotCount,
    examples,
  };
  return snapshot.source === "native"
    ? { ...measurements, source: "native", status: "observed" }
    : { ...measurements, source: "mock", status: "mock-only" };
}
