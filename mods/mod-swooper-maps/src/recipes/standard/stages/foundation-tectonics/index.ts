import foundation from "@mapgen/domain/foundation";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { tectonics } from "./steps/index.js";

/** Foundation / Tectonics — boundary regimes + multi-era history, provenance, drivers. */
export default createStage({
  id: "foundation-tectonics",
  knobsSchema: Type.Object(
    {},
    { additionalProperties: false, description: "Tectonics has no stage-level knobs." }
  ),
  public: Type.Object(
    {
      // plateMotion is re-exposed here: the tectonics step recomputes per-era plate
      // motion with the same op config as foundation-plates' plate-motion step.
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
      description: "Tectonics advanced config (segments, eras, history).",
    }
  ),
  steps: orderStandardStageSteps("foundation-tectonics", { tectonics }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    tectonics: {
      computePlateMotion: { strategy: "default", config: config.plateMotion ?? {} },
      computeTectonicSegments: { strategy: "default", config: config.tectonicSegmentation ?? {} },
      computeEraPlateMembership: { strategy: "default", config: config.tectonicEras ?? {} },
      computeEraTectonicFields: { strategy: "default", config: config.tectonicFields ?? {} },
      computeTectonicHistoryRollups: { strategy: "default", config: config.tectonicRollups ?? {} },
    },
  }),
} as const);
