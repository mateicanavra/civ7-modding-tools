import { createStage, type Static, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { IslandsStep } from "./steps/islands/step.js";
import { LandmassesStep } from "./steps/landmasses/step.js";
import { MountainsStep } from "./steps/mountains/step.js";
import { VolcanoesStep } from "./steps/volcanoes/step.js";

/** Authored orogeny posture applied after any coupled mountain-range control. */
export type MorphologyOrogenyKnob = "low" | "normal" | "high";

/** Authored volcanism posture applied to the volcano operation envelope. */
export type MorphologyVolcanismKnob = "low" | "normal" | "high";

const DEFAULT_MOUNTAIN_RANGES = {
  tectonicActivity: 1,
  rangeSystemSpacingTiles: 20,
  rangeSystemLengthTiles: 22,
  provinceRadiusTiles: 4,
  ridgeWidthTiles: 1,
  foothillExtentTiles: 3,
  interiorHighlandExpression: 0.55,
  terrainTextureFractalMix: 0.45,
  erosionMaturity: 0.45,
  tectonicSignalSensitivity: 1,
} as const;

const knobsSchema = Type.Object(
  {
    orogeny: Type.Union([Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")], {
      default: "normal",
      description:
        "Controls mountain terrain posture by transforming mountain planning thresholds and intensity.",
    }),
    volcanism: Type.Union([Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")], {
      default: "normal",
      description:
        "Controls map volcano posture by transforming volcano density and selection weights.",
    }),
    mountainRanges: Type.Union(
      [
        Type.Null({
          description:
            "Preserves the independently authored ridge, foothill, and rough-land operation envelopes.",
        }),
        Type.Object(
          {
            tectonicActivity: Type.Number({
              default: 1,
              minimum: 0,
              maximum: 3,
              description:
                "Controls how strongly collision, subduction, rift, and shear fields express as raised terrain.",
            }),
            rangeSystemSpacingTiles: Type.Number({
              default: 20,
              minimum: 4,
              maximum: 80,
              description:
                "Controls mean tile spacing between major mountain-range systems; map area scales how many systems appear.",
            }),
            rangeSystemLengthTiles: Type.Number({
              default: 22,
              minimum: 4,
              maximum: 80,
              description:
                "Controls target longitudinal span for major mountain-range systems before province-width expansion.",
            }),
            provinceRadiusTiles: Type.Integer({
              default: 4,
              minimum: 0,
              maximum: 12,
              description:
                "Controls the radius of each orographic province, including peaks, passes, valleys, foothills, and basin margins.",
            }),
            ridgeWidthTiles: Type.Integer({
              default: 1,
              minimum: 0,
              maximum: 4,
              description:
                "Controls how wide peak and ridge-spine terrain can grow inside each orographic province.",
            }),
            foothillExtentTiles: Type.Integer({
              default: 3,
              minimum: 0,
              maximum: 12,
              description:
                "Controls how far foothill and high-pass terrain can spread from ridge spines.",
            }),
            interiorHighlandExpression: Type.Number({
              default: 0.55,
              minimum: 0,
              maximum: 2,
              description:
                "Controls old uplands, plateaus, and rolling highlands away from active mountain spines.",
            }),
            terrainTextureFractalMix: Type.Number({
              default: 0.45,
              minimum: 0,
              maximum: 1,
              description:
                "Controls fractal texture in hills, ridges, and rough lands; higher values make terrain more locally varied.",
            }),
            erosionMaturity: Type.Number({
              default: 0.45,
              minimum: 0,
              maximum: 1,
              description:
                "Controls how much older belts soften from sharp peaks into hills, passes, and settled valleys.",
            }),
            tectonicSignalSensitivity: Type.Number({
              default: 1,
              minimum: 0,
              maximum: 2,
              description:
                "Controls how readily moderate tectonic driver fields can seed terrain expression.",
            }),
          },
          {
            additionalProperties: false,
            description:
              "Coupled physical controls projected into coherent ridge, foothill, and rough-land operation configuration.",
          }
        ),
      ],
      {
        default: DEFAULT_MOUNTAIN_RANGES,
        description:
          "Optional coupled mountain authoring. The default preserves the Standard range posture; null disables coupling and preserves advanced operation configuration.",
      }
    ),
  },
  {
    additionalProperties: false,
    description:
      "Morphology landform controls applied as deterministic transforms over ordinary step operation configuration.",
  }
);

/** Admitted coupled mountain-range control derived from the stage's single knob schema authority. */
export type MorphologyMountainRangesKnob = Exclude<
  Static<typeof knobsSchema>["mountainRanges"],
  null
>;

/**
 * Orders complete island formation, mountain intent, and volcano intent before decomposing
 * the final landmask, keeping landform production ahead of shelf and projection.
 */
export default createStage({
  id: "morphology-features",
  knobsSchema,
  steps: orderStandardStageSteps("morphology-features", {
    islands: IslandsStep,
    mountains: MountainsStep,
    volcanoes: VolcanoesStep,
    landmasses: LandmassesStep,
  }),
} as const);
