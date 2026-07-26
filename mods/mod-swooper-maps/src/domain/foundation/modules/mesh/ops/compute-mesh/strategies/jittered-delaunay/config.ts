import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity and authored controls for jittered Delaunay mesh construction.
 * Mesh input and output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "jittered-delaunay",
  config: Type.Object(
    {
      plateCount: Type.Integer({
        default: 8,
        minimum: 2,
        maximum: 256,
        description:
          "Controls the target tectonic plate count used to derive mesh cell density for this map.",
      }),
      cellsPerPlate: Type.Integer({
        default: 2,
        minimum: 1,
        maximum: 32,
        description:
          "Controls mesh resolution by setting how many mesh cells are generated per normalized plate.",
      }),
      relaxationSteps: Type.Integer({
        default: 2,
        minimum: 0,
        maximum: 50,
        description:
          "Controls how many relaxation passes smooth generated mesh sites before downstream plate logic runs.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Jittered Delaunay mesh density and relaxation controls used to build Foundation's wrapped spatial substrate.",
    }
  ),
});
