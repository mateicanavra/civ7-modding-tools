import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

import elevationCohortsDefinition from "./strategies/elevation-cohorts/config.js";

import { BasinFluxSchema as FluxSchema, BasinLevelIntervalSchema as LevelIntervalSchema } from "../../model/atoms/index.js";

const footprint = {
  wetCells: Type.Array(Type.Integer({ minimum: 0 }), {
    description: "Strictly submerged active cell IDs, sorted by ID; not a network lake plan.",
  }),
  flux: FluxSchema,
};

const quantization = {
  ...footprint,
  resolution: Type.Literal("shoreline-quantization"),
  level: Type.Number({ description: "Cohort ground height; this cohort remains dry at the retained level." }),
  overflow: Type.Literal(0),
  unresolvedResidual: Type.Number({
    exclusiveMinimum: 0,
    description: "Retained positive balance, bounded by the shoreline jump; not loss or exported flow.",
  }),
  bracket: Type.Object(
    {
      cohortCells: Type.Array(Type.Integer({ minimum: 0 })),
      before: FluxSchema,
      after: FluxSchema,
      jumpMagnitude: Type.Number({ exclusiveMinimum: 0 }),
    },
    { additionalProperties: false }
  ),
};

/** One active pool's lowest-extent stationary response, independent of spill/merge orchestration. */
const ComputeBasinWaterBudgetContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-basin-water-budget",
  input: Type.Object(
    {
      cells: Type.Array(
        Type.Object(
          {
            cell: Type.Integer({ minimum: 0, description: "Unique active catchment cell identity." }),
            ground: Type.Number({ description: "Original finite ground elevation, not conditioned escape height." }),
            localRunoff: Type.Number({
              minimum: 0,
              description: "Attributed local land supply; no manufactured runoff floor or accumulated flow.",
            }),
            precipitation: Type.Number({ minimum: 0, description: "Baseline direct precipitation if submerged." }),
            potentialDemand: Type.Number({ minimum: 0, description: "Baseline empirical PET if submerged." }),
          },
          { additionalProperties: false }
        ),
        { minItems: 1, description: "Exactly one active catchment's unique cells, including dry uplands." }
      ),
      incomingOverflow: Type.Number({ minimum: 0, description: "External supply not already included in these cells." }),
      attainedLevel: Type.Number({ description: "Already attained floor or merge level; the response never searches below it." }),
      spillElevation: Type.Union([Type.Number(), Type.Null()], {
        description: "Finite outward sill at or above attainedLevel; null means genuinely outlet-free.",
      }),
    },
    {
      additionalProperties: false,
      description: "All fluxes use rainfall-index times unit tile area per representative interval; no storage/time conversion.",
    }
  ),
  output: Type.Union([
    Type.Object(
      { ...footprint, state: Type.Literal("dry"), overflow: Type.Literal(0), unresolvedResidual: Type.Literal(0) },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        ...footprint,
        state: Type.Literal("closed"),
        resolution: Type.Literal("exact-balance"),
        levels: LevelIntervalSchema,
        overflow: Type.Literal(0),
        unresolvedResidual: Type.Literal(0),
      },
      { additionalProperties: false, description: "Balanced footprint and level interval, not a unique water height. The interval may include the sill." }
    ),
    Type.Object({ ...quantization, state: Type.Literal("closed") }, { additionalProperties: false }),
    Type.Object({ ...quantization, state: Type.Literal("subtile") }, { additionalProperties: false }),
    Type.Object(
      {
        ...footprint,
        state: Type.Literal("open"),
        level: Type.Number(),
        overflow: Type.Number({ minimum: 0, description: "Exactly the strict-footprint balance at the sill." }),
        unresolvedResidual: Type.Literal(0),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        ...footprint,
        state: Type.Literal("infeasible-attained-state"),
        attainedLevel: Type.Number(),
        shortfall: Type.Number({ exclusiveMinimum: 0 }),
      },
      { additionalProperties: false, description: "Negative starting balance cannot sustain the supplied attained state; no fake closure or retreat." }
    ),
    Type.Object(
      {
        ...footprint,
        state: Type.Literal("no-stationary-solution"),
        evaluatedLevels: LevelIntervalSchema,
        unresolvedSurplus: Type.Number({ exclusiveMinimum: 0 }),
      },
      { additionalProperties: false, description: "Persistent outlet-free surplus after the last cohort; footprint/interval are diagnostic, not an admitted lake." }
    ),
  ]),
  strategies: [elevationCohortsDefinition],
});

export default ComputeBasinWaterBudgetContract;
