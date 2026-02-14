import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "./steps/index.js";

export default createStage({
  id: "map-ecology",
  knobsSchema: Type.Object({}),
  public: Type.Object({
    biomes: Type.Optional(steps.plotBiomes.contract.schema),
    featuresApply: Type.Optional(steps.featuresApply.contract.schema),
    plotEffects: Type.Optional(steps.plotEffects.contract.schema),
  }),
  compile: ({ config }: { config: { biomes?: unknown; featuresApply?: unknown; plotEffects?: unknown } }) => ({
    "plot-biomes": config.biomes,
    "features-apply": config.featuresApply,
    "plot-effects": config.plotEffects,
  }),
  steps: [steps.plotBiomes, steps.featuresApply, steps.plotEffects],
} as const);
