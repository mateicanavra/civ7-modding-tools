import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  compileEcologyPedologyPublicConfig,
  EcologyPedologyPublicSchema,
} from "../ecology-public-config.js";
import pedology from "./steps/pedology/index.js";
import resourceBasins from "./steps/resource-basins/index.js";

/**
 * Pedology owns soil and resource-basin truth before biome classification.
 * Keeping these steps local to the stage prevents the old generic Ecology hub
 * from obscuring which truth stage owns the config and artifact lifecycle.
 */
export default createStage({
  id: "ecology-pedology",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Ecology-pedology currently has no stage-level knobs; authoring control lives in soil and resource-basin groups.",
    }
  ),
  public: EcologyPedologyPublicSchema,
  steps: orderStandardStageSteps("ecology-pedology", {
    pedology,
    "resource-basins": resourceBasins,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileEcologyPedologyPublicConfig(config),
} as const);
