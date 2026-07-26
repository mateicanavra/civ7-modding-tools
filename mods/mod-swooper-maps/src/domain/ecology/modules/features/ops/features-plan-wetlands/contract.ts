import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { WetlandFeaturePlacementSchema } from "../../model/atoms/index.js";
import habitatConfidenceDefinition from "./strategies/habitat-confidence/config.js";

/** Chooses the strongest wetland-family habitat per unoccupied land tile after substrate-specific scoring. Every implementation shares this admitted input and output boundary. */
const PlanWetlandsContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-wetlands",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer({ minimum: 0 }),

    scoreMarsh01: TypedArraySchemas.f32({
      description: "Marsh suitability score per tile (0..1).",
    }),
    scoreTundraBog01: TypedArraySchemas.f32({
      description: "Tundra bog suitability score per tile (0..1).",
    }),
    scoreMangrove01: TypedArraySchemas.f32({
      description: "Mangrove suitability score per tile (0..1).",
    }),
    scoreOasis01: TypedArraySchemas.f32({
      description: "Oasis suitability score per tile (0..1).",
    }),
    scoreWateringHole01: TypedArraySchemas.f32({
      description: "Watering hole suitability score per tile (0..1).",
    }),

    flatLandMask: TypedArraySchemas.u8({
      description:
        "1 = land tile that will remain flat after terrain projection; 0 = water, hill, mountain, volcano, or lake.",
    }),

    featureOccupancyMask: TypedArraySchemas.u8({
      description: "0 = unoccupied, nonzero = already claimed by an ecology feature intent.",
    }),
  }),
  output: Type.Object({
    placements: Type.Array(WetlandFeaturePlacementSchema),
  }),
  strategies: [habitatConfidenceDefinition],
});

export default PlanWetlandsContract;
