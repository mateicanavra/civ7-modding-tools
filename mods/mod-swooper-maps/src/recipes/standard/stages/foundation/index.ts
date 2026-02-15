import { Type, createStage } from "@swooper/mapgen-core/authoring";
import {
  crust,
  crustEvolution,
  mantleForcing,
  mantlePotential,
  mesh,
  plateGraph,
  plateMotion,
  plateTopology,
  projection,
  tectonics,
} from "./steps/index.js";
import {
  FoundationPlateActivityKnobSchema,
  FoundationPlateCountKnobSchema,
} from "@mapgen/domain/foundation/shared/knobs.js";

export default createStage({
  id: "foundation",
  knobsSchema: Type.Object(
    {
      plateCount: Type.Optional(FoundationPlateCountKnobSchema),
      plateActivity: Type.Optional(FoundationPlateActivityKnobSchema),
    },
    {
      description:
        "Foundation knobs (plateCount/plateActivity). Knobs apply after defaulted step config as deterministic transforms.",
    }
  ),
  steps: [
    mesh,
    mantlePotential,
    mantleForcing,
    crust,
    plateGraph,
    plateMotion,
    tectonics,
    crustEvolution,
    projection,
    plateTopology,
  ],
} as const);
