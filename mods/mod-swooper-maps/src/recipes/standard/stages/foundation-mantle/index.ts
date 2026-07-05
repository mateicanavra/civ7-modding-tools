import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { mantleForcing, mantlePotential, mesh } from "./steps/index.js";

const FoundationPlateCountKnobSchema = Type.Integer({
  minimum: 2,
  maximum: 256,
  description:
    "Plate count target (integer >= 2). Used as the authored baseline for plate discretization.",
});

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
  steps: orderStandardStageSteps("foundation-mantle", {
    mesh,
    "mantle-potential": mantlePotential,
    "mantle-forcing": mantleForcing,
  }),
} as const);
