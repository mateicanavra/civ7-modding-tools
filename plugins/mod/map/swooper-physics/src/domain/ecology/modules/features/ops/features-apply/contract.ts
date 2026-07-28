import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  FeaturePlacementSchema,
  FloodplainFeaturePlacementSchema,
  IceFeaturePlacementSchema,
  ReefFeaturePlacementSchema,
  VegetationFeaturePlacementSchema,
  WetlandFeaturePlacementSchema,
} from "../../model/atoms/index.js";
import strictSingleOccupancyDefinition from "./strategies/strict-single-occupancy/config.js";

/** Merges feature-family plans into one deterministic placement sequence and rejects multiple features on the same tile. Every implementation shares this admitted input and output boundary. */
const FeaturesApplyContract = defineOp({
  kind: "plan",
  id: "ecology/features/apply",
  input: Type.Object(
    {
      vegetation: Type.Array(VegetationFeaturePlacementSchema, {
        description: "Planned vegetation feature placements.",
      }),
      wetlands: Type.Array(WetlandFeaturePlacementSchema, {
        description: "Planned wetland feature placements.",
      }),
      floodplains: Type.Array(FloodplainFeaturePlacementSchema, {
        description: "Planned floodplain feature placements.",
      }),
      reefs: Type.Array(ReefFeaturePlacementSchema, {
        description: "Planned reef feature placements.",
      }),
      ice: Type.Array(IceFeaturePlacementSchema, {
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
  strategies: [strictSingleOccupancyDefinition],
});

export default FeaturesApplyContract;
