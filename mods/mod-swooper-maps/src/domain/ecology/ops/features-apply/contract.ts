import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../../model/schemas/index.js";

const FeaturesApplyContract = defineOp({
  kind: "plan",
  id: "ecology/features/apply",
  input: Type.Object(
    {
      vegetation: Type.Array(FeaturePlacementSchema, {
        description: "Planned vegetation feature placements.",
      }),
      wetlands: Type.Array(FeaturePlacementSchema, {
        description: "Planned wetland feature placements.",
      }),
      floodplains: Type.Array(FeaturePlacementSchema, {
        description: "Planned floodplain feature placements.",
      }),
      reefs: Type.Array(FeaturePlacementSchema, {
        description: "Planned reef feature placements.",
      }),
      ice: Type.Array(FeaturePlacementSchema, {
        description: "Planned ice feature placements.",
      }),
    },
    {
      description: "Planned feature placements grouped by concern before apply.",
    }
  ),
  output: Type.Object(
    {
      placements: Type.Array(FeaturePlacementSchema, {
        description: "Flattened feature placements ready for application.",
      }),
    },
    {
      description: "Aggregated feature placements after merging all concerns.",
    }
  ),
  defaultStrategy: "default",
  strategies: {
    default: Type.Object(
      {},
      {
        description:
          "Feature consolidation has no authored parameters; each Civ7 tile admits exactly one planned feature.",
      }
    ),
  },
});

export default FeaturesApplyContract;
