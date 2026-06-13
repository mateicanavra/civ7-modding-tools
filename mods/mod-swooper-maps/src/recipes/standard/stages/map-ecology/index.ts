import { createStage } from "@swooper/mapgen-core/authoring";
import { MapEcologyKnobsSchema, MapEcologyPublicSchema } from "../map-projection-public-config.js";
import { steps } from "./steps/index.js";

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
  steps: [steps.plotBiomes, steps.featuresApply, steps.plotEffects],
} as const);
