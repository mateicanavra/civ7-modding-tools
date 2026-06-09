import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { HYDROLOGY_NAVIGABLE_RIVER_PROJECTION_POLICY } from "@mapgen/domain/hydrology/config.js";
import { MapRiversPublicSchema } from "../map-projection-public-config.js";
import { plotRivers } from "./steps/index.js";
import {
  NavigableRiverDensityKnobSchema,
  type NavigableRiverDensityKnobs,
  resolveNavigableRiverDensityKnob,
} from "./riverProjectionKnobs.js";

const knobsSchema = Type.Object(
  {
    navigableRiverDensity: Type.Optional(NavigableRiverDensityKnobSchema),
  },
  {
    additionalProperties: false,
    description:
      "Map-rivers knobs. Use navigableRiverDensity for MapGen-owned Civ-visible river projection after elevation is finalized.",
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
  compile: ({ knobs }: { config: object; knobs: unknown }) => {
    const density = resolveNavigableRiverDensityKnob(knobs as NavigableRiverDensityKnobs);
    return {
      "plot-rivers": {
        selectNavigableRiverTerrain: {
          strategy: "default",
          config: { ...HYDROLOGY_NAVIGABLE_RIVER_PROJECTION_POLICY[density] },
        },
      },
    };
  },
  steps: [plotRivers],
} as const);
