import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { MapEcologyPublicSchema } from "../map-projection-public-config.js";
import { steps } from "./steps/index.js";

const MapEcologyKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map ecology knobs. Ecology projection currently has no author-facing stage knobs.",
  }
);

/**
 * Engine-facing Ecology projection.
 *
 * Biomes, feature intents, and plot-effect plans are decided by Ecology truth
 * stages. This stage only binds those artifacts into Civ7 runtime state, which
 * keeps engine adapter concerns out of planning policy.
 */
export default createStage({
  id: "map-ecology",
  knobsSchema: MapEcologyKnobsSchema,
  public: MapEcologyPublicSchema,
  compile: ({ config }: { config: { biomeBindings?: unknown } }) => ({
    "plot-biomes": { bindings: config.biomeBindings },
    "features-apply": {},
    "plot-effects": {},
  }),
  steps: orderStandardStageSteps("map-ecology", {
    "plot-biomes": steps.plotBiomes,
    "features-apply": steps.featuresApply,
    "plot-effects": steps.plotEffects,
  }),
} as const);
