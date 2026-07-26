import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines local river-corridor and closed-basin bonuses applied during climate refinement. Defaults
 * keep both effects spatially narrow so the baseline remains the dominant rainfall signal.
 */
export default defineStrategy({
  id: "refine",
  config: Type.Object(
    {
      /** River corridor refinement (local wetness near rivers). */
      riverCorridor: Type.Object(
        {
          /** Adjacency radius (in tiles) used to treat tiles as near a river. */
          adjacencyRadius: Type.Integer({
            default: 1,
            minimum: 1,
            maximum: 6,
            description: "Adjacency radius (in tiles) used to treat tiles as near a river.",
          }),
          /** Rainfall bonus for low-elevation tiles near rivers. */
          lowlandAdjacencyBonus: Type.Number({
            default: 14,
            minimum: 0,
            maximum: 80,
            description: "Rainfall bonus for low-elevation tiles near rivers.",
          }),
          /** Rainfall bonus for high-elevation tiles near rivers. */
          highlandAdjacencyBonus: Type.Number({
            default: 10,
            minimum: 0,
            maximum: 80,
            description: "Rainfall bonus for high-elevation tiles near rivers.",
          }),
          /** Maximum elevation to qualify for lowlandAdjacencyBonus. */
          lowlandElevationMax: Type.Integer({
            default: 250,
            minimum: -2000,
            maximum: 9000,
            description: "Maximum elevation to qualify for lowlandAdjacencyBonus.",
          }),
        },
        {
          additionalProperties: false,
          description: "River corridor refinement parameters (local wetness near rivers).",
        }
      ),
      /** Low basin refinement (enclosed basins retain wetness). */
      lowBasin: Type.Object(
        {
          /** Radius used to detect enclosed low basins (tiles). */
          radius: Type.Integer({
            default: 2,
            minimum: 1,
            maximum: 10,
            description: "Radius used to detect enclosed low basins (tiles).",
          }),
          /** Rainfall delta added to enclosed low basins. */
          delta: Type.Number({
            default: 6,
            minimum: 0,
            maximum: 60,
            description: "Rainfall delta added to enclosed low basins.",
          }),
          /** Maximum elevation to qualify as a low basin. */
          elevationMax: Type.Integer({
            default: 200,
            minimum: -2000,
            maximum: 9000,
            description: "Maximum elevation to qualify as a low basin.",
          }),
          /** If any neighbor is below elev+openThresholdM, basin is considered open. */
          openThresholdM: Type.Integer({
            default: 20,
            minimum: 0,
            maximum: 500,
            description: "If any neighbor is below elev+openThresholdM, basin is considered open.",
          }),
        },
        {
          additionalProperties: false,
          description: "Low basin refinement parameters (enclosed basin wetness proxy).",
        }
      ),
    },
    {
      additionalProperties: false,
      description: "Precipitation refinement parameters (refine strategy).",
    }
  ),
});
