import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { computeShelf } from "./steps/index.js";

export type MorphologyShelfWidthKnob = "narrow" | "normal" | "wide";

const MorphologyShelfWidthKnobSchema = Type.Union(
  [Type.Literal("narrow"), Type.Literal("normal"), Type.Literal("wide")],
  {
    default: "normal",
    description:
      "Controls coastal shelf width posture (narrow/normal/wide) by applying deterministic multipliers over shelf classifier distance caps.",
  }
);

const ShelfMaskConfigSchema = Type.Object(
  {
    breakGradient: Type.Number({
      default: 8,
      minimum: 0.5,
      maximum: 200,
      description:
        "Seabed gradient (bathymetry units per tile-hop) at or above which the seafloor is treated as the steep continental slope (post-break), excluding it from the shelf. A difference of bathymetry, so the datum cancels — NOT a depth quantile and NOT a depth band. Read against the sculpted margin profile.",
    }),
    breakGradientScale: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 8,
      description:
        "Global break-gradient scale set from the shelfWidth knob (narrow<1 => stricter gradient => narrower shelf; wide>1 => more permissive => wider). Authors use the knob; normalize() injects this value.",
    }),
    activeClosenessThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description:
        "Boundary-closeness (0..1) above which a convergent/transform margin counts as active. Diagnostic only: the margin posture is already sculpted into the terrain the gradient reads.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Physical-break shelf classifier: the gentle pre-break apron (seabed gradient below the break-gradient threshold) flood-connected to shore. No depth quantile, no datum reference, no tile-distance caps.",
  }
);

/**
 * Morphology-shelf computes the continental shelf AFTER islands/mountains, so the
 * shelf and the post-island coastline reflect final land. The shelfWidth knob lives
 * here (it drives the cap-free break-depth scale); coast ruggedness stays in
 * morphology-coasts with the carving step.
 */
const knobsSchema = Type.Object(
  {
    shelfWidth: MorphologyShelfWidthKnobSchema,
  },
  {
    additionalProperties: false,
    description:
      "Morphology-shelf control for shelf width, applied as a deterministic break-depth transform.",
  }
);

const publicSchema = Type.Object(
  {
    shelf: ShelfMaskConfigSchema,
  },
  {
    additionalProperties: false,
    description: "Continental-shelf shaping controls (margin-aware, depth-gated, cap-free).",
  }
);

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config };
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
