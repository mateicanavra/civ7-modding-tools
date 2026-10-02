import { type Static, Type } from "typebox";

/** Surface accounting in model-height units, not sediment transport or physical time. */
export const StandardChannelEvolutionMeasurementsSchema = Type.Object({
  version: Type.Literal(1),
  cycleCount: Type.Integer({ minimum: 0 }),
  incisedCellCount: Type.Integer({ minimum: 0 }),
  publishedLoweredCellCount: Type.Integer({ minimum: 0 }),
  publishedRaisedCellCount: Type.Integer({ minimum: 0 }),
  incisionDepthTotal: Type.Number({ minimum: 0 }),
  incisionDepthMax: Type.Number({ minimum: 0 }),
  publishedLoweringTotal: Type.Number(),
  roundingDeltaTotal: Type.Number(),
  clampDeltaTotal: Type.Number(),
  accountingErrorMax: Type.Number({ minimum: 0 }),
  certifiedSolveCount: Type.Integer({ minimum: 1 }),
  waterConservationExcessMax: Type.Number({ minimum: 0 }),
}, { additionalProperties: false });

export type StandardChannelEvolutionMeasurements = Static<typeof StandardChannelEvolutionMeasurementsSchema>;

type Conservation = Readonly<{ residual: number; roundoffBound: number }>;
type Input = Readonly<{
  initialElevation: ArrayLike<number>;
  finalElevation: ArrayLike<number>;
  incisionDepthByCycle: readonly (readonly number[])[];
  roundingDelta: readonly number[];
  clampDelta: readonly number[];
  conservationByCycle: readonly Conservation[];
  finalConservation: Conservation;
}>;

/** Keeps each process visible instead of attributing net lake or relief changes to erosion. */
export function measureStandardChannelEvolution(input: Input): StandardChannelEvolutionMeasurements {
  const size = input.initialElevation.length;
  if (input.finalElevation.length !== size || input.roundingDelta.length !== size || input.clampDelta.length !== size ||
      input.incisionDepthByCycle.some((cycle) => cycle.length !== size) ||
      input.incisionDepthByCycle.length !== input.conservationByCycle.length)
    throw new Error("Channel-evolution measurements require complete aligned process evidence.");
  let incisedCellCount = 0, publishedLoweredCellCount = 0, publishedRaisedCellCount = 0;
  let incisionDepthTotal = 0, incisionDepthMax = 0, publishedLoweringTotal = 0;
  let roundingDeltaTotal = 0, clampDeltaTotal = 0, accountingErrorMax = 0;
  for (let cell = 0; cell < size; cell += 1) {
    let incision = 0;
    for (const cycle of input.incisionDepthByCycle) incision += cycle[cell]!;
    const rounding = input.roundingDelta[cell]!, clamp = input.clampDelta[cell]!;
    const lowering = input.initialElevation[cell]! - input.finalElevation[cell]!;
    if (!Number.isFinite(incision + rounding + clamp) || incision < 0)
      throw new Error(`Invalid channel-evolution process evidence at ${cell}.`);
    if (incision > 0) incisedCellCount += 1;
    if (lowering > 0) publishedLoweredCellCount += 1;
    if (lowering < 0) publishedRaisedCellCount += 1;
    incisionDepthTotal += incision;
    incisionDepthMax = Math.max(incisionDepthMax, incision);
    publishedLoweringTotal += lowering;
    roundingDeltaTotal += rounding;
    clampDeltaTotal += clamp;
    accountingErrorMax = Math.max(accountingErrorMax, Math.abs(lowering - incision + rounding + clamp));
  }
  let waterConservationExcessMax = 0;
  for (const balance of [...input.conservationByCycle, input.finalConservation]) {
    if (!Number.isFinite(balance.residual) || !Number.isFinite(balance.roundoffBound) || balance.roundoffBound < 0)
      throw new Error("Invalid certified conservation observation.");
    waterConservationExcessMax = Math.max(waterConservationExcessMax, Math.abs(balance.residual) - balance.roundoffBound);
  }
  return {
    version: 1,
    cycleCount: input.incisionDepthByCycle.length,
    incisedCellCount, publishedLoweredCellCount, publishedRaisedCellCount,
    incisionDepthTotal, incisionDepthMax, publishedLoweringTotal,
    roundingDeltaTotal, clampDeltaTotal, accountingErrorMax,
    certifiedSolveCount: input.conservationByCycle.length + 1,
    waterConservationExcessMax,
  };
}
