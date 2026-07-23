import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../../model/schemas/index.js";
import strategies from "./strategies/contract.js";

/** Merges feature-family plans into one deterministic placement sequence and rejects multiple features on the same tile. Every implementation shares this admitted input and output boundary. */
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
  strategies,
});

export default FeaturesApplyContract;
