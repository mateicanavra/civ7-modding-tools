import foundation from "@mapgen/domain/foundation";
import { FoundationPlateCountKnobSchema } from "@mapgen/domain/foundation/config.js";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { mantleForcing, mantlePotential, mesh } from "./steps/index.js";

/** Foundation / Mantle — tectonic mesh + mantle-convection forcing field. */
export default createStage({
  id: "foundation-mantle",
  knobsSchema: Type.Object(
    { plateCount: Type.Optional(FoundationPlateCountKnobSchema) },
    {
      additionalProperties: false,
      description: "Mantle lever: plateCount (mesh density; also set on foundation-lithosphere).",
    }
  ),
  public: Type.Object(
    {
      // cellCount is derived during normalization, not authored.
      meshResolution: Type.Optional(
        Type.Omit(foundation.ops.computeMesh.strategies.default, ["cellCount"])
      ),
      mantleSources: Type.Optional(foundation.ops.computeMantlePotential.strategies.default),
      mantleForcing: Type.Optional(foundation.ops.computeMantleForcing.strategies.default),
    },
    { additionalProperties: false, description: "Mantle advanced config (mesh + convection)." }
  ),
  steps: orderStandardStageSteps("foundation-mantle", {
    mesh,
    "mantle-potential": mantlePotential,
    "mantle-forcing": mantleForcing,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    mesh: { computeMesh: { strategy: "default", config: config.meshResolution ?? {} } },
    "mantle-potential": {
      computeMantlePotential: { strategy: "default", config: config.mantleSources ?? {} },
    },
    "mantle-forcing": {
      computeMantleForcing: { strategy: "default", config: config.mantleForcing ?? {} },
    },
  }),
} as const);
