import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { HydrologyRiverDensityKnobSchema } from "@mapgen/domain/hydrology/config.js";
import { MapRiversPublicSchema } from "../map-projection-public-config.js";
import { plotRivers } from "./steps/index.js";

const knobsSchema = Type.Object(
  {
    riverDensity: Type.Optional(HydrologyRiverDensityKnobSchema),
  },
  {
    description:
      "Map-rivers knobs. These tune MapGen-owned navigable river projection after elevation is finalized.",
  }
);

/**
 * Navigable river materialization stage.
 *
 * River materialization is separated from static lake projection because
 * navigable rivers need the finalized elevation and water surface. MapGen owns
 * the river terrain selection; Civ7 is used only for terrain validation, cache
 * refresh, and naming at this boundary.
 */
export default createStage({
  id: "map-rivers",
  knobsSchema,
  public: MapRiversPublicSchema,
  compile: ({ config }: { config: { riverProjection?: unknown } }) => ({
    "plot-rivers": config.riverProjection,
  }),
  steps: [plotRivers],
} as const);
