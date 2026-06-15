import { MorphologyErosionKnobSchema } from "@mapgen/domain/morphology/config.js";
import { GeomorphicCycleConfigSchema } from "@mapgen/domain/morphology/ops";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { geomorphology } from "./steps/index.js";

/**
 * Morphology-erosion knobs (erosion). Knobs apply after defaulted step config as deterministic transforms.
 */
const knobsSchema = Type.Object(
  {
    erosion: Type.Optional(MorphologyErosionKnobSchema),
  },
  {
    additionalProperties: false,
    description:
      "Morphology-erosion controls for terrain erosion posture applied as deterministic transforms.",
  }
);

export default createStage({
  id: "morphology-erosion",
  knobsSchema,
  public: Type.Object(
    {
      geomorphicCycle: Type.Optional(GeomorphicCycleConfigSchema),
    },
    {
      additionalProperties: false,
      description:
        "Morphology geomorphic-cycle controls for fluvial incision, diffusion, deposition, and world-age erosion posture.",
    }
  ),
  steps: orderStandardStageSteps("morphology-erosion", { geomorphology }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    geomorphology: {
      geomorphology: { strategy: "default", config: config.geomorphicCycle ?? {} },
    },
  }),
} as const);
