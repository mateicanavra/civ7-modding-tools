import foundation from "@mapgen/domain/foundation";
import { FoundationPlateActivityKnobSchema } from "@mapgen/domain/foundation/config.js";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { plateMotion, tectonics } from "./steps/index.js";

/** Foundation / Tectonics — plate kinematics + boundary regimes, multi-era history, provenance. */
export default createStage({
  id: "foundation-tectonics",
  knobsSchema: Type.Object(
    { plateActivity: Type.Optional(FoundationPlateActivityKnobSchema) },
    {
      additionalProperties: false,
      description:
        "Tectonics lever: plateActivity (scales orogeny intensity — convergent uplift + subduction volcanism — after regime classification, so the lever is smooth and never relocates land).",
    }
  ),
  public: Type.Object(
    {
      // plateMotion is the sole home for the computePlateMotion op config: it feeds
      // both the plate-motion step and the tectonics step's per-era motion recompute.
      plateMotion: Type.Optional(foundation.ops.computePlateMotion.strategies.default),
      tectonicSegmentation: Type.Optional(
        foundation.ops.computeTectonicSegments.strategies.default
      ),
      tectonicEras: Type.Optional(foundation.ops.computeEraPlateMembership.strategies.default),
      tectonicFields: Type.Optional(foundation.ops.computeEraTectonicFields.strategies.default),
      tectonicRollups: Type.Optional(
        foundation.ops.computeTectonicHistoryRollups.strategies.default
      ),
    },
    {
      additionalProperties: false,
      description: "Tectonics advanced config (plate motion + segments, eras, history).",
    }
  ),
  steps: orderStandardStageSteps("foundation-tectonics", {
    "plate-motion": plateMotion,
    tectonics,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    "plate-motion": {
      computePlateMotion: { strategy: "default", config: config.plateMotion ?? {} },
    },
    tectonics: {
      computePlateMotion: { strategy: "default", config: config.plateMotion ?? {} },
      computeTectonicSegments: { strategy: "default", config: config.tectonicSegmentation ?? {} },
      computeEraPlateMembership: { strategy: "default", config: config.tectonicEras ?? {} },
      computeEraTectonicFields: { strategy: "default", config: config.tectonicFields ?? {} },
      computeTectonicHistoryRollups: { strategy: "default", config: config.tectonicRollups ?? {} },
    },
  }),
} as const);
