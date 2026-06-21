import foundation from "@mapgen/domain/foundation";
import { FoundationPlateCountKnobSchema } from "@mapgen/domain/foundation/config.js";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { crust, plateGraph, plateMotion } from "./steps/index.js";

/** Foundation / Plates — initial crust, plate partition, and plate kinematics. */
export default createStage({
  id: "foundation-plates",
  knobsSchema: Type.Object(
    { plateCount: Type.Optional(FoundationPlateCountKnobSchema) },
    {
      additionalProperties: false,
      description: "Plates lever: plateCount (partition count; also set on foundation-mantle).",
    }
  ),
  public: Type.Object(
    {
      lithosphere: Type.Optional(foundation.ops.computeCrust.strategies.default),
      platePartition: Type.Optional(foundation.ops.computePlateGraph.strategies.default),
      plateMotion: Type.Optional(foundation.ops.computePlateMotion.strategies.default),
    },
    {
      additionalProperties: false,
      description: "Plates advanced config (crust + partition + motion).",
    }
  ),
  steps: orderStandardStageSteps("foundation-plates", {
    crust,
    "plate-graph": plateGraph,
    "plate-motion": plateMotion,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    crust: { computeCrust: { strategy: "default", config: config.lithosphere ?? {} } },
    "plate-graph": {
      computePlateGraph: { strategy: "default", config: config.platePartition ?? {} },
    },
    "plate-motion": {
      computePlateMotion: { strategy: "default", config: config.plateMotion ?? {} },
    },
  }),
} as const);
