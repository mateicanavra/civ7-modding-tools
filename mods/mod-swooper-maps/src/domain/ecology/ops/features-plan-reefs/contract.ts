import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../../model/schemas/index.js";
import strategies from "./strategies/contract.js";

/** Chooses reef, cold-reef, atoll, or lake-lotus intent while preserving occupancy and lake habitat laws. Every implementation shares this admitted input and output boundary. */
const PlanReefsContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-reefs",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer({ minimum: 0 }),
    scoreReef01: TypedArraySchemas.f32({ description: "Reef suitability score per tile (0..1)." }),
    scoreColdReef01: TypedArraySchemas.f32({
      description: "Cold reef suitability score per tile (0..1).",
    }),
    scoreAtoll01: TypedArraySchemas.f32({
      description: "Atoll suitability score per tile (0..1).",
    }),
    scoreLotus01: TypedArraySchemas.f32({
      description: "Lotus suitability score per tile (0..1).",
    }),
    lakeMask: TypedArraySchemas.u8({
      description:
        "Hydrology lake mask per tile (1=lake, 0=non-lake); gates lake-only Lotus placement.",
    }),
    featureOccupancyMask: TypedArraySchemas.u8({
      description: "0 = unoccupied, nonzero = already claimed by an ecology feature intent.",
    }),
    reserved: TypedArraySchemas.u8({
      description: "0 = tile can be claimed, 1 = permanently blocked",
    }),
  }),
  output: Type.Object({
    placements: Type.Array(FeaturePlacementSchema),
  }),
  defaultStrategy: "habitat",
  strategies,
});

export default PlanReefsContract;
