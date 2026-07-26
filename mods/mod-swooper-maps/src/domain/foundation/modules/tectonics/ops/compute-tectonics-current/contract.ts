import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import newestEraCompositeDefinition from "./strategies/newest-era-composite/config.js";

/** Contract for projecting the newest era and cumulative uplift into canonical current tectonic state. */
const ComputeTectonicsCurrentContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonics-current",
  input: Type.Object(
    {
      cellCount: Type.Integer({ minimum: 1 }),
      newestEra: Type.Object(
        {
          boundaryType: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          boundaryPolarity: TypedArraySchemas.i8({ cardinality: ["cellCount"] }),
          boundaryIntensity: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          upliftPotential: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          collisionPotential: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          subductionPotential: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          riftPotential: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          shearStress: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          volcanism: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          fracture: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          riftOriginPlate: TypedArraySchemas.i16({ cardinality: ["cellCount"] }),
          volcanismOriginPlate: TypedArraySchemas.i16({ cardinality: ["cellCount"] }),
          volcanismEventType: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
          boundaryDriftU: TypedArraySchemas.i8({ cardinality: ["cellCount"] }),
          boundaryDriftV: TypedArraySchemas.i8({ cardinality: ["cellCount"] }),
        },
        {
          additionalProperties: false,
          description: "Newest reconstructed era projected into present tectonic state.",
        }
      ),
      upliftTotal: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonics: Type.Object(
        {
          boundaryType: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          upliftPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          riftPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          shearStress: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          volcanism: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          fracture: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          cumulativeUplift: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description:
        "Mesh-wide present-state tectonic surface combining the newest era's active boundary and deformation signals with cumulative uplift from the full history.",
    }
  ),
  strategies: [newestEraCompositeDefinition],
});

export default ComputeTectonicsCurrentContract;
