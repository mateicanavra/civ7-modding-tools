import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import balancedHemisphereDefinition from "./strategies/balanced-hemisphere/config.js";

/**
 * Defines pure gameplay-region classification from connected Morphology
 * landmasses. Engine region identifiers and mutation remain recipe concerns.
 */
const ProjectLandmassRegionsContract = defineOp({
  kind: "compute",
  id: "placement/project-landmass-regions",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      landMask: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Final Morphology land membership by tile.",
      }),
      landmassIdByTile: TypedArraySchemas.i32({
        cardinality: ["width", "height"],
        description: "Connected landmass identifier by tile, or -1 for water.",
      }),
      landmasses: Type.Array(
        Type.Object(
          {
            id: Type.Integer({ minimum: 0 }),
            west: Type.Integer({ minimum: 0 }),
            east: Type.Integer({ minimum: 0 }),
          },
          { additionalProperties: false }
        )
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      slotByTile: TypedArraySchemas.u8({
        cardinality: "constructor-only",
        description: "Gameplay region slot by tile (0=none, 1=west, 2=east).",
      }),
    },
    { additionalProperties: false }
  ),
  strategies: [balancedHemisphereDefinition],
});

export default ProjectLandmassRegionsContract;
