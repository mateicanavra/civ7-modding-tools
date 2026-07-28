import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines river-corridor and closed-basin wetness added to an existing precipitation vintage.
 * Defaults keep both effects spatially narrow so the baseline climate remains dominant.
 */
export default defineStrategy({
  id: "riparian-basin-wetness",
  config: Type.Object(
    {
      riverCorridor: Type.Object(
        {
          adjacencyRadius: Type.Integer({
            default: 1,
            minimum: 1,
            maximum: 6,
            description: "Hex radius around river tiles that receives corridor wetness.",
          }),
          lowlandAdjacencyBonus: Type.Number({
            default: 14,
            minimum: 0,
            maximum: 80,
            description: "Rainfall added to low-elevation land inside a river corridor.",
          }),
          highlandAdjacencyBonus: Type.Number({
            default: 10,
            minimum: 0,
            maximum: 80,
            description: "Rainfall added to high-elevation land inside a river corridor.",
          }),
          lowlandElevationMax: Type.Integer({
            default: 250,
            minimum: -2000,
            maximum: 9000,
            description: "Highest elevation that receives the lowland river-corridor bonus.",
          }),
        },
        {
          additionalProperties: false,
          description: "Local wetness retained around classified river corridors.",
        }
      ),
      lowBasin: Type.Object(
        {
          radius: Type.Integer({
            default: 2,
            minimum: 1,
            maximum: 10,
            description: "Square-neighborhood radius used by the local basin-closure proxy.",
          }),
          delta: Type.Number({
            default: 6,
            minimum: 0,
            maximum: 60,
            description: "Rainfall added to enclosed low basins.",
          }),
          elevationMax: Type.Integer({
            default: 200,
            minimum: -2000,
            maximum: 9000,
            description: "Highest elevation eligible for enclosed-basin wetness.",
          }),
          openThresholdM: Type.Integer({
            default: 20,
            minimum: 0,
            maximum: 500,
            description:
              "Relief margin above the candidate elevation below which a neighbor opens the basin.",
          }),
        },
        {
          additionalProperties: false,
          description: "Local wetness retained by enclosed low-elevation basins.",
        }
      ),
    },
    {
      additionalProperties: false,
      description: "River-corridor and enclosed-basin precipitation refinement controls.",
    }
  ),
});
