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
} from "@mapgen/domain/foundation/config.js";

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
  public: Type.Object(
    {
      mesh: Type.Optional(mesh.contract.schema),
      "mantle-potential": Type.Optional(mantlePotential.contract.schema),
      "mantle-forcing": Type.Optional(mantleForcing.contract.schema),
      crust: Type.Optional(crust.contract.schema),
      "plate-graph": Type.Optional(plateGraph.contract.schema),
      "plate-motion": Type.Optional(plateMotion.contract.schema),
      tectonics: Type.Optional(tectonics.contract.schema),
      "crust-evolution": Type.Optional(crustEvolution.contract.schema),
      "plate-topology": Type.Optional(plateTopology.contract.schema),
    },
    {
      description:
        "Foundation authoring controls for the visible tectonic setup. Mesh, mantle, crust, plate graph, and tectonic history are tunable; projection is compiled internally so map authors do not tune engine coordinate plumbing.",
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
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    ...(config as Record<string, unknown>),
    projection: {},
  }),
} as const);
