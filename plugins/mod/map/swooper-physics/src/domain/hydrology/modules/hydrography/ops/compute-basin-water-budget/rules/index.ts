type Input = Readonly<{
  cells: readonly Readonly<{
    cell: number;
    ground: number;
    localRunoff: number;
    precipitation: number;
    potentialDemand: number;
  }>[];
  incomingOverflow: number;
  attainedLevel: number;
  spillElevation: number | null;
}>;
type Flux = {
  incomingOverflow: number;
  dryRunoff: number;
  wetPrecipitation: number;
  wetDemand: number;
  balance: number;
};
type LevelInterval = {
  lower: number;
  lowerInclusive: boolean;
  upper: number | null;
  upperInclusive: boolean;
};
type Result = { wetCells: number[]; flux: Flux } & (
  | { state: "dry"; overflow: 0; unresolvedResidual: 0 }
  | {
    state: "closed";
    resolution: "exact-balance";
    levels: LevelInterval;
    overflow: 0;
    unresolvedResidual: 0;
  }
  | {
    state: "closed" | "subtile";
    resolution: "shoreline-quantization";
    level: number;
    overflow: 0;
    unresolvedResidual: number;
    bracket: { cohortCells: number[]; before: Flux; after: Flux; jumpMagnitude: number };
  }
  | { state: "open"; level: number; overflow: number; unresolvedResidual: 0 }
  | { state: "infeasible-attained-state"; attainedLevel: number; shortfall: number }
  | { state: "no-stationary-solution"; evaluatedLevels: LevelInterval; unresolvedSurplus: number }
);

function finite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`Expected finite ${name}.`);
}

function nonnegative(value: number, name: string): void {
  finite(value, name);
  if (value < 0) throw new RangeError(`Expected nonnegative ${name}.`);
}

/** Stable nonnegative accumulation; suffix totals avoid subtracting large wet runoff from a total. */
function accumulator(): (value: number) => number {
  let sum = 0;
  let correction = 0;
  return (value) => {
    const adjusted = value - correction;
    const next = sum + adjusted;
    correction = (next - sum) - adjusted;
    sum = next;
    finite(sum, "aggregate basin flux");
    return sum;
  };
}

/**
 * Scans whole elevation cohorts because replacing land runoff with P - PET is not monotone.
 * The first nonpositive response selects the least wet footprint, not a unique equilibrium.
 */
export function computeBasinWaterBudget(input: Input): Result {
  const { incomingOverflow, attainedLevel, spillElevation } = input;
  if (input.cells.length === 0) throw new RangeError("Expected a nonempty active catchment.");
  nonnegative(incomingOverflow, "incomingOverflow");
  finite(attainedLevel, "attainedLevel");
  if (spillElevation !== null) {
    finite(spillElevation, "spillElevation");
    if (spillElevation < attainedLevel) throw new RangeError("spillElevation must not precede attainedLevel.");
  }
  const seen = new Set<number>();
  for (const row of input.cells) {
    if (!Number.isSafeInteger(row.cell) || row.cell < 0) throw new RangeError("Expected a nonnegative safe cell identity.");
    if (seen.has(row.cell)) throw new RangeError(`Duplicate active catchment cell ${row.cell}.`);
    seen.add(row.cell);
    finite(row.ground, `ground at cell ${row.cell}`);
    nonnegative(row.localRunoff, `localRunoff at cell ${row.cell}`);
    nonnegative(row.precipitation, `precipitation at cell ${row.cell}`);
    nonnegative(row.potentialDemand, `potentialDemand at cell ${row.cell}`);
  }
  const cells = [...input.cells].sort((a, b) => a.ground - b.ground || a.cell - b.cell);
  if (attainedLevel < cells[0]!.ground) throw new RangeError("attainedLevel must not be below the catchment floor.");
  const count = cells.length;
  const dryRunoff = new Float64Array(count + 1);
  const wetPrecipitation = new Float64Array(count + 1);
  const wetDemand = new Float64Array(count + 1);
  const addRunoff = accumulator();
  const addPrecipitation = accumulator();
  const addDemand = accumulator();
  for (let index = 0; index < count; index++) {
    wetPrecipitation[index + 1] = addPrecipitation(cells[index]!.precipitation);
    wetDemand[index + 1] = addDemand(cells[index]!.potentialDemand);
    dryRunoff[count - index - 1] = addRunoff(cells[count - index - 1]!.localRunoff);
  }

  const fluxAt = (wetCount: number): Flux => {
    const supply = incomingOverflow + dryRunoff[wetCount]! + wetPrecipitation[wetCount]!;
    finite(supply, "aggregate basin supply");
    return {
      incomingOverflow,
      dryRunoff: dryRunoff[wetCount]!,
      wetPrecipitation: wetPrecipitation[wetCount]!,
      wetDemand: wetDemand[wetCount]!,
      balance: supply - wetDemand[wetCount]!,
    };
  };
  const footprintAt = (wetCount: number): number[] =>
    cells.slice(0, wetCount).map((row) => row.cell).sort((a, b) => a - b);
  const levelsAfter = (lower: number, lowerInclusive: boolean, wetCount: number) => {
    const nextGround = cells[wetCount]?.ground ?? null;
    const upper = spillElevation === null
      ? nextGround
      : nextGround === null ? spillElevation : Math.min(nextGround, spillElevation);
    return { lower, lowerInclusive, upper, upperInclusive: upper !== null };
  };

  let wetCount = 0;
  while (wetCount < count && cells[wetCount]!.ground < attainedLevel) wetCount++;
  let flux = fluxAt(wetCount);
  if (flux.balance < 0) {
    return {
      state: "infeasible-attained-state", wetCells: footprintAt(wetCount), flux,
      attainedLevel, shortfall: -flux.balance,
    };
  }
  // A known attained sill is already an outward connection, even at zero overflow.
  if (attainedLevel === spillElevation) {
    return {
      state: "open", wetCells: footprintAt(wetCount), flux,
      level: attainedLevel, overflow: flux.balance, unresolvedResidual: 0,
    };
  }
  if (flux.balance === 0) {
    if (wetCount === 0) return { state: "dry", wetCells: [], flux, overflow: 0, unresolvedResidual: 0 };
    return {
      state: "closed", resolution: "exact-balance", wetCells: footprintAt(wetCount), flux,
      levels: levelsAfter(attainedLevel, true, wetCount), overflow: 0, unresolvedResidual: 0,
    };
  }

  while (wetCount < count) {
    const level = cells[wetCount]!.ground;
    // Strict W(h) excludes the sill-height cohort, including its demand and direct precipitation.
    if (spillElevation !== null && level >= spillElevation) break;
    let afterCount = wetCount + 1;
    while (afterCount < count && cells[afterCount]!.ground === level) afterCount++;
    const after = fluxAt(afterCount);
    if (after.balance < 0) {
      const jumpMagnitude = flux.balance - after.balance;
      finite(jumpMagnitude, "shoreline jump magnitude");
      return {
        state: wetCount === 0 ? "subtile" : "closed",
        resolution: "shoreline-quantization", wetCells: footprintAt(wetCount), flux,
        level, overflow: 0, unresolvedResidual: flux.balance,
        bracket: {
          cohortCells: cells.slice(wetCount, afterCount).map((row) => row.cell),
          before: flux, after, jumpMagnitude,
        },
      };
    }
    wetCount = afterCount;
    flux = after;
    if (flux.balance === 0) {
      return {
        state: "closed", resolution: "exact-balance", wetCells: footprintAt(wetCount), flux,
        levels: levelsAfter(level, false, wetCount), overflow: 0, unresolvedResidual: 0,
      };
    }
  }
  if (spillElevation !== null) {
    return {
      state: "open", wetCells: footprintAt(wetCount), flux,
      level: spillElevation, overflow: flux.balance, unresolvedResidual: 0,
    };
  }
  const lastGround = cells[count - 1]!.ground;
  return {
    state: "no-stationary-solution", wetCells: footprintAt(wetCount), flux,
    evaluatedLevels: {
      lower: Math.max(attainedLevel, lastGround), lowerInclusive: attainedLevel > lastGround,
      upper: null, upperInclusive: false,
    },
    unresolvedSurplus: flux.balance,
  };
}
