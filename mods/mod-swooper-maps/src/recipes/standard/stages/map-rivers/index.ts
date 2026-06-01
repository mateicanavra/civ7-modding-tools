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
      "Map-rivers knobs. These tune engine river projection after elevation is finalized.",
  }
);

/**
 * Engine river materialization stage.
 *
 * River modeling is separated from static lake projection because Civ7 models
 * navigable rivers after elevation is built. Keeping that lifecycle boundary
 * explicit prevents future projection fixes from running river effects against
 * stale elevation or half-projected water.
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
