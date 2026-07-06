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
  strategies: {
    default: Type.Object(
      {
        maxPerTile: Type.Integer({
          minimum: 1,
          maximum: 1,
          default: 1,
          description:
            "Feature collision guard; Civ7 tiles receive one planned feature after merge validation.",
        }),
      },
      {
        description: "Limits used when consolidating planned feature placements.",
      }
    ),
  },
});

export default FeaturesApplyContract;
