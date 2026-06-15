import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MapMorphologyCoastClassificationArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    baseWaterClass: TypedArraySchemas.u8({
      description:
        "Pre-policy water class derived from Morphology truth (0=land, 1=coast, 2=ocean).",
    }),
    waterClass: TypedArraySchemas.u8({
      description:
        "Post-policy water class stamped into engine terrain (0=land, 1=coast, 2=ocean).",
    }),
    policyCoastMask: TypedArraySchemas.u8({
      description: "Mask of ocean tiles promoted to coast by the Civ7 compliance policy.",
    }),
    coastBufferTiles: Type.Integer({
      minimum: 0,
      description: "Policy coast buffer distance used for deterministic coast widening.",
    }),
    promotedOceanToCoast: Type.Integer({
      minimum: 0,
      description: "Count of ocean tiles promoted to coast by the policy.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Map-morphology coast classification snapshot captured before terrain stamping for parity diagnostics.",
  }
);

const MapMorphologyEngineTerrainSnapshotArtifactSchema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot.",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask at this map-morphology boundary.",
    }),
    terrain: TypedArraySchemas.u8({
      description: "Engine-derived terrain type snapshot at this map-morphology boundary.",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot at this map-morphology boundary.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Engine terrain snapshot captured at a map-morphology boundary for parity diagnostics.",
  }
);

export const mapMorphologyArtifacts = {
  coastClassification: defineArtifact({
    name: "coastClassification",
    id: "artifact:map.morphology.coastClassification",
    schema: MapMorphologyCoastClassificationArtifactSchema,
  }),
  coastEngineTerrainSnapshot: defineArtifact({
    name: "coastEngineTerrainSnapshot",
    id: "artifact:map.morphology.coastEngineTerrainSnapshot",
    schema: MapMorphologyEngineTerrainSnapshotArtifactSchema,
  }),
  continentValidationTerrainSnapshot: defineArtifact({
    name: "continentValidationTerrainSnapshot",
    id: "artifact:map.morphology.continentValidationTerrainSnapshot",
    schema: MapMorphologyEngineTerrainSnapshotArtifactSchema,
  }),
} as const;
