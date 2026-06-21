import foundation from "@mapgen/domain/foundation";
import { FoundationPlateCountKnobSchema } from "@mapgen/domain/foundation/config.js";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { crust, plateGraph } from "./steps/index.js";

/** Foundation / Lithosphere — initial crust + plate partition (the static plate structure). */
export default createStage({
  id: "foundation-lithosphere",
  knobsSchema: Type.Object(
    { plateCount: Type.Optional(FoundationPlateCountKnobSchema) },
    {
      additionalProperties: false,
      description:
        "Lithosphere lever: plateCount (partition count; also set on foundation-mantle).",
    }
  ),
  public: Type.Object(
    {
      lithosphere: Type.Optional(foundation.ops.computeCrust.strategies.default),
      platePartition: Type.Optional(foundation.ops.computePlateGraph.strategies.default),
    },
    {
      additionalProperties: false,
      description: "Lithosphere advanced config (crust + plate partition).",
    }
  ),
  steps: orderStandardStageSteps("foundation-lithosphere", {
    crust,
    "plate-graph": plateGraph,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    crust: { computeCrust: { strategy: "default", config: config.lithosphere ?? {} } },
    "plate-graph": {
      computePlateGraph: { strategy: "default", config: config.platePartition ?? {} },
    },
  }),
} as const);
