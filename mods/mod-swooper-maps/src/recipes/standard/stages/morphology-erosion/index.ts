import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { geomorphology } from "./steps/index.js";

export type MorphologyErosionKnob = "low" | "normal" | "high";

const MorphologyErosionKnobSchema = Type.Union(
  [Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")],
  {
    default: "normal",
    description:
      "Controls terrain erosion posture (low/normal/high) by applying a deterministic multiplier over geomorphology rates.",
  }
);

/**
 * Geomorphic cycle controls (fluvial incision + diffusion + deposition).
 */
const GeomorphologyConfigSchema = Type.Object(
  {
    fluvial: Type.Object(
      {
        rate: Type.Number({
          description: "Controls fluvial terrain incision rate (0..1).",
          default: 0.15,
          minimum: 0,
          maximum: 1,
        }),
        m: Type.Number({
          description: "Controls stream power exponent for the discharge proxy in terrain erosion.",
          default: 0.5,
          minimum: 0,
          maximum: 4,
        }),
        n: Type.Number({
          description: "Controls stream power exponent for the slope proxy in terrain erosion.",
          default: 1.0,
          minimum: 0,
          maximum: 4,
        }),
      },
      {
        additionalProperties: false,
        description: "Controls fluvial incision used by terrain erosion.",
      }
    ),
    diffusion: Type.Object(
      {
        rate: Type.Number({
          description: "Controls hillslope terrain diffusion rate (0..1).",
          default: 0.2,
          minimum: 0,
          maximum: 1,
        }),
        talus: Type.Number({
          description: "Controls the talus threshold for terrain diffusion in normalized units.",
          default: 0.5,
          minimum: 0,
          maximum: 10,
        }),
      },
      {
        additionalProperties: false,
        description: "Controls hillslope diffusion used by terrain erosion.",
      }
    ),
    deposition: Type.Object(
      {
        rate: Type.Number({
          description: "Controls sediment settling/transport rate for terrain deposition (0..1).",
          default: 0.1,
          minimum: 0,
          maximum: 1,
        }),
      },
      {
        additionalProperties: false,
        description: "Controls terrain deposition during the geomorphic cycle.",
      }
    ),
    eras: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)], {
      description: "Controls number of geomorphic terrain eras to apply.",
      default: 2,
    }),
  },
  {
    additionalProperties: false,
    description: "Controls terrain incision, diffusion, deposition, and geomorphic era count.",
  }
);

const WorldAgeSchema = Type.Union(
  [Type.Literal("young"), Type.Literal("mature"), Type.Literal("old")],
  {
    description: "Controls world age posture used to scale geomorphic terrain intensity.",
    default: "mature",
  }
);

const GeomorphicCycleConfigSchema = Type.Object(
  {
    geomorphology: GeomorphologyConfigSchema,
    worldAge: WorldAgeSchema,
  },
  {
    additionalProperties: false,
    description: "Geomorphic cycle controls for terrain relaxation by world age.",
  }
);

/**
 * Morphology-erosion knobs (erosion). Knobs apply after defaulted step config as deterministic transforms.
 */
const knobsSchema = Type.Object(
  {
    erosion: MorphologyErosionKnobSchema,
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
      geomorphicCycle: GeomorphicCycleConfigSchema,
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
      geomorphology: { strategy: "default", config: config.geomorphicCycle },
    },
  }),
} as const);
