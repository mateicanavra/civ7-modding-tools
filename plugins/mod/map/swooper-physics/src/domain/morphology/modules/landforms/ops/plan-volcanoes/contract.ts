import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { VolcanoIntentSchema } from "../../model/atoms/volcano-intent.schema.js";
import strategyDefinition from "./strategies/plate-hotspot-ranking/config.js";

/**
 * Plans complete volcanic placement intent from boundary regimes and volcanism evidence.
 */
const PlanVolcanoesContract = defineOp({
  kind: "plan",
  id: "morphology/plan-volcanoes",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      landMask: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Land mask per tile (1=land, 0=water).",
      }),
      boundaryCloseness: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Boundary proximity per tile (0..255).",
      }),
      boundaryType: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Boundary regime per tile using canonical BOUNDARY_TYPE values.",
      }),
      shieldStability: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Shield stability per tile (0..255).",
      }),
      volcanism: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Volcanism evidence per tile (0..255).",
      }),
      rngSeed: Type.Integer({ description: "Map-seed-derived volcano planning seed." }),
    },
    {
      additionalProperties: false,
      description:
        "Admitted map grid, land truth, tectonic setting, and volcanism evidence for volcano planning.",
    }
  ),
  output: Type.Object(
    {
      volcanoMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Map-sized binary membership for planned volcano tiles.",
      }),
      volcanoes: Type.Immutable(
        Type.Array(VolcanoIntentSchema, {
          description: "Strictly tile-ordered complete volcano placement intents.",
        })
      ),
    },
    {
      additionalProperties: false,
      description: "Complete volcano intent with one exact sparse-list and mask representation.",
    }
  ),
  strategies: [strategyDefinition],
});

export default PlanVolcanoesContract;
