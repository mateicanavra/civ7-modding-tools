import { MorphologyShelfWidthKnobSchema } from "@mapgen/domain/morphology/config.js";
import { ShelfMaskConfigSchema } from "@mapgen/domain/morphology/ops";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { computeShelf } from "./steps/index.js";

/**
 * Morphology-shelf computes the continental shelf AFTER islands/mountains, so the
 * shelf and the post-island coastline reflect final land. The shelfWidth knob lives
 * here (it drives the cap-free break-depth scale); coast ruggedness stays in
 * morphology-coasts with the carving step.
 */
const knobsSchema = Type.Object(
  {
    shelfWidth: Type.Optional(MorphologyShelfWidthKnobSchema),
  },
  {
    additionalProperties: false,
    description:
      "Morphology-shelf control for shelf width, applied as a deterministic break-depth transform.",
  }
);

const publicSchema = Type.Object(
  {
    shelf: Type.Optional(ShelfMaskConfigSchema),
  },
  {
    additionalProperties: false,
    description: "Continental-shelf shaping controls (margin-aware, depth-gated, cap-free).",
  }
);

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config: config ?? {} };
}

export default createStage({
  id: "morphology-shelf",
  knobsSchema,
  public: publicSchema,
  steps: orderStandardStageSteps("morphology-shelf", {
    "compute-shelf": computeShelf,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    "compute-shelf": {
      shelfMask: defaultEnvelope(config.shelf),
    },
  }),
} as const);
