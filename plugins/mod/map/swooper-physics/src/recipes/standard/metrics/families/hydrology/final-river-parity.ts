import type { RiverProjectionResult } from "@civ7/adapter";
import { type Static, Type } from "typebox";

export const STANDARD_FINAL_RIVER_PARITY_METRIC_KEY = "map.rivers.finalParity";

const intendedClass = Type.Union([Type.Literal("MINOR"), Type.Literal("NAVIGABLE")]);
const base = {
  version: Type.Literal(1),
  phase: Type.Literal("final"),
  model: Type.Literal("certified-sill-spill"),
  intendedMinorSourceCount: Type.Integer({ minimum: 0 }),
  intendedNavigableSourceCount: Type.Integer({ minimum: 0 }),
  intendedSourceRows: Type.Array(Type.Tuple([Type.Integer({ minimum: 0 }), intendedClass]), {
    description:
      "Complete row-major [cell, class] intent; cell = y * width + x. No direction readback claim.",
  }),
};

/** Final source/class evidence, separate from NAV terrain and unavailable rather than synthetic zero. */
export const StandardFinalRiverParityMeasurementsSchema = Type.Union([
  Type.Object(
    {
      ...base,
      status: Type.Literal("unavailable"),
      reason: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...base,
      status: Type.Literal("observed"),
      observedMinorSourceCount: Type.Integer({ minimum: 0 }),
      observedNavigableSourceCount: Type.Integer({ minimum: 0 }),
      observedSourceRows: Type.Array(
        Type.Tuple([
          Type.Integer({ minimum: 0 }),
          Type.Union([intendedClass, Type.Literal("CONFLICT"), Type.Literal("UNCLASSIFIED")]),
        ]),
        {
          description:
            "Complete current source rows; CONFLICT means both class flags, UNCLASSIFIED means river presence without either known class.",
        }
      ),
      missingSourceCount: Type.Integer({ minimum: 0 }),
      extraSourceCount: Type.Integer({ minimum: 0 }),
      wrongClassCount: Type.Integer({ minimum: 0 }),
      navigableTerrainMismatchCount: Type.Integer({ minimum: 0 }),
      missingSourceCells: Type.Array(Type.Integer({ minimum: 0 })),
      extraSourceCells: Type.Array(Type.Integer({ minimum: 0 })),
      wrongClassCells: Type.Array(Type.Integer({ minimum: 0 })),
      navigableTerrainMismatchCells: Type.Array(Type.Integer({ minimum: 0 })),
    },
    { additionalProperties: false }
  ),
]);

export type StandardFinalRiverParityMeasurements = Static<
  typeof StandardFinalRiverParityMeasurementsSchema
>;

/** Compares an immutable authored source population with one detached final adapter read. */
export function measureStandardFinalRiverParity(
  input: Readonly<{
    width: number;
    height: number;
    intendedMinor: ArrayLike<number>;
    intendedNavigable: ArrayLike<number>;
    readback:
      | Readonly<{ status: "available"; value: RiverProjectionResult }>
      | Readonly<{ status: "unavailable"; reason: string }>;
  }>
): StandardFinalRiverParityMeasurements {
  const size = input.width * input.height;
  const intendedSourceRows: [number, "MINOR" | "NAVIGABLE"][] = [];
  let intendedMinorSourceCount = 0,
    intendedNavigableSourceCount = 0;
  for (let cell = 0; cell < size; cell++) {
    if (input.intendedMinor[cell] === 1) {
      intendedMinorSourceCount++;
      intendedSourceRows.push([cell, "MINOR"]);
    }
    if (input.intendedNavigable[cell] === 1) {
      intendedNavigableSourceCount++;
      intendedSourceRows.push([cell, "NAVIGABLE"]);
    }
  }
  const identity = {
    version: 1,
    phase: "final",
    model: "certified-sill-spill",
    intendedMinorSourceCount,
    intendedNavigableSourceCount,
    intendedSourceRows,
  } as const;
  if (input.readback.status === "unavailable")
    return { ...identity, status: "unavailable", reason: input.readback.reason };
  const readback = input.readback.value;
  if (!readback.minorRiverStampingSupported)
    return {
      ...identity,
      status: "unavailable",
      reason: readback.minorRiverUnsupportedReason || "River type readback is unavailable.",
    };
  const observedMasks = [
    readback.engineMinorRiverMask,
    readback.engineNavigableRiverMask,
    readback.engineIsRiverMask,
    readback.terrainNavigableRiverMask,
  ];
  if (
    readback.width !== input.width ||
    readback.height !== input.height ||
    observedMasks.some(
      (mask) => mask.length !== size || mask.some((value) => value !== 0 && value !== 1)
    )
  ) {
    return {
      ...identity,
      status: "unavailable",
      reason: "Final river readback has invalid dimensions or nonbinary masks.",
    };
  }
  const observedSourceRows: [number, "MINOR" | "NAVIGABLE" | "CONFLICT" | "UNCLASSIFIED"][] = [];
  const missingSourceCells: number[] = [],
    extraSourceCells: number[] = [],
    wrongClassCells: number[] = [],
    navigableTerrainMismatchCells: number[] = [];
  let observedMinorSourceCount = 0,
    observedNavigableSourceCount = 0;
  for (let cell = 0; cell < size; cell++) {
    const minor = readback.engineMinorRiverMask[cell] === 1;
    const navigable = readback.engineNavigableRiverMask[cell] === 1;
    const observed = minor || navigable || readback.engineIsRiverMask[cell] === 1;
    const intendedMinor = input.intendedMinor[cell] === 1;
    const intendedNavigable = input.intendedNavigable[cell] === 1;
    const intended = intendedMinor || intendedNavigable;
    if (minor) observedMinorSourceCount++;
    if (navigable) observedNavigableSourceCount++;
    if (observed)
      observedSourceRows.push([
        cell,
        minor && navigable
          ? "CONFLICT"
          : minor
            ? "MINOR"
            : navigable
              ? "NAVIGABLE"
              : "UNCLASSIFIED",
      ]);
    if (intended && !observed) missingSourceCells.push(cell);
    if (!intended && observed) extraSourceCells.push(cell);
    // Missing and extra identity are not also mislabeled as a class substitution.
    if (intended && observed && (minor !== intendedMinor || navigable !== intendedNavigable))
      wrongClassCells.push(cell);
    if ((readback.terrainNavigableRiverMask[cell] === 1) !== intendedNavigable)
      navigableTerrainMismatchCells.push(cell);
  }
  return {
    ...identity,
    status: "observed",
    observedMinorSourceCount,
    observedNavigableSourceCount,
    observedSourceRows,
    missingSourceCount: missingSourceCells.length,
    extraSourceCount: extraSourceCells.length,
    wrongClassCount: wrongClassCells.length,
    navigableTerrainMismatchCount: navigableTerrainMismatchCells.length,
    missingSourceCells,
    extraSourceCells,
    wrongClassCells,
    navigableTerrainMismatchCells,
  };
}
