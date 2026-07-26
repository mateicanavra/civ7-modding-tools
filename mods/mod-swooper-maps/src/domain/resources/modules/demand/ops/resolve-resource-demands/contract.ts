import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  HABITAT_INTENSITY_FIELD_NAMES,
  HABITAT_MASK_FIELD_NAMES,
  type HabitatIntensityFieldName,
  type HabitatMaskFieldName,
} from "../../../habitat/model/atoms/habitat-fields.schema.js";
import {
  AdmittedResourceDemandCandidateSchema,
  ExcludedResourceDemandCandidatesSchema,
} from "../../model/atoms/resource-demand.schema.js";
import { INITIAL_MAP_RESOURCE_AUTHORING_AGE } from "../../model/policy/initial-map-authoring.js";
import policyConstrainedDefinition from "./strategies/policy-constrained/config.js";

const habitatMaskProperties = Object.fromEntries(
  HABITAT_MASK_FIELD_NAMES.map((field) => [
    field,
    TypedArraySchemas.u8({
      cardinality: ["width", "height"],
      description: `Admitted resource habitat mask ${field}.`,
    }),
  ])
) as unknown as {
  [Field in HabitatMaskFieldName]: ReturnType<typeof TypedArraySchemas.u8>;
};
const habitatIntensityProperties = Object.fromEntries(
  HABITAT_INTENSITY_FIELD_NAMES.map((field) => [
    field,
    TypedArraySchemas.f32({
      cardinality: ["width", "height"],
      description: `Admitted resource habitat intensity ${field}.`,
    }),
  ])
) as unknown as {
  [Field in HabitatIntensityFieldName]: ReturnType<typeof TypedArraySchemas.f32>;
};

/**
 * Admits canonical resource expectations, habitat evidence, current Civ7 legality, and river
 * exclusions into the exact per-resource terminal ledger consumed by site selection.
 */
const ResolveResourceDemandsContract = defineOp({
  kind: "plan",
  id: "resources/resolve-resource-demands",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      ...habitatMaskProperties,
      ...habitatIntensityProperties,
      legalitySurface: Type.Object(
        {
          biomeType: TypedArraySchemas.i32({ cardinality: ["width", "height"] }),
          terrainType: TypedArraySchemas.i32({ cardinality: ["width", "height"] }),
          featureType: TypedArraySchemas.i32({ cardinality: ["width", "height"] }),
          engineWaterMask: TypedArraySchemas.u8({ cardinality: ["width", "height"] }),
        },
        { additionalProperties: false }
      ),
      requiredForAge: Type.Record(
        Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
        Type.Union([Type.Boolean(), Type.Null()]),
        {
          description:
            "Current initial-age requirement observation keyed once by official resource type.",
        }
      ),
      riverMasks: Type.Array(
        TypedArraySchemas.u8({
          cardinality: ["width", "height"],
          description: "One admitted planned or current river exclusion surface.",
        })
      ),
      minimumAmountModifier: Type.Integer(),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      age: Type.Literal(INITIAL_MAP_RESOURCE_AUTHORING_AGE),
      minimumAmountModifier: Type.Integer(),
      candidates: Type.Object(
        {
          admitted: Type.Array(AdmittedResourceDemandCandidateSchema),
          excluded: ExcludedResourceDemandCandidatesSchema,
        },
        {
          additionalProperties: false,
          description:
            "Exact canonical resource corpus partitioned by terminal demand disposition.",
        }
      ),
    },
    { additionalProperties: false }
  ),
  strategies: [policyConstrainedDefinition],
});

export default ResolveResourceDemandsContract;
