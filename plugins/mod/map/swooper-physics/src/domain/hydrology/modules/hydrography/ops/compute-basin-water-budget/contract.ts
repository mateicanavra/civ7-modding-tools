import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

import elevationCohortsDefinition from "./strategies/elevation-cohorts/config.js";

import {
  BasinFluxSchema,
  BasinLevelIntervalSchema,
  BasinShorelineBracketSchema,
  BasinNonstationaryResponseSchema,
} from "../../model/atoms/index.js";

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
    Type.Object({
      wetCells: Type.Array(Type.Integer({ minimum: 0 })),
      flux: BasinFluxSchema,
      state: Type.Literal("dry"),
      overflow: Type.Literal(0),
      unresolvedResidual: Type.Literal(0),
    }, { additionalProperties: false }),
    Type.Object({
      wetCells: Type.Array(Type.Integer({ minimum: 0 })),
      flux: BasinFluxSchema,
      state: Type.Literal("closed"),
      resolution: Type.Literal("exact-balance"),
      levels: BasinLevelIntervalSchema,
      overflow: Type.Literal(0),
      unresolvedResidual: Type.Literal(0),
    }, { additionalProperties: false }),
    Type.Object({
      wetCells: Type.Array(Type.Integer({ minimum: 0 })),
      flux: BasinFluxSchema,
      resolution: Type.Literal("shoreline-quantization"),
      level: Type.Number(),
      overflow: Type.Literal(0),
      unresolvedResidual: Type.Number({ exclusiveMinimum: 0, description: "Positive retained balance, not exported flow, demand, or storage." }),
      bracket: BasinShorelineBracketSchema,
      state: Type.Literal("closed"),
    }, { additionalProperties: false }),
    Type.Object({
      wetCells: Type.Array(Type.Integer({ minimum: 0 })),
      flux: BasinFluxSchema,
      resolution: Type.Literal("shoreline-quantization"),
      level: Type.Number(),
      overflow: Type.Literal(0),
      unresolvedResidual: Type.Number({ exclusiveMinimum: 0, description: "Positive retained balance, not exported flow, demand, or storage." }),
      bracket: BasinShorelineBracketSchema,
      state: Type.Literal("subtile"),
    }, { additionalProperties: false }),
    Type.Object({
      wetCells: Type.Array(Type.Integer({ minimum: 0 })),
      flux: BasinFluxSchema,
      state: Type.Literal("open"),
      level: Type.Number(),
      overflow: Type.Number({ minimum: 0 }),
      unresolvedResidual: Type.Literal(0),
    }, { additionalProperties: false }),
    Type.Object({
      wetCells: Type.Array(Type.Integer({ minimum: 0 })),
      flux: BasinFluxSchema,
      state: Type.Literal("infeasible-attained-state"),
      attainedLevel: Type.Number(),
      shortfall: Type.Number({ exclusiveMinimum: 0 }),
    }, { additionalProperties: false }),
    BasinNonstationaryResponseSchema,
  ]),
  strategies: [elevationCohortsDefinition],
});

export default ComputeBasinWaterBudgetContract;
