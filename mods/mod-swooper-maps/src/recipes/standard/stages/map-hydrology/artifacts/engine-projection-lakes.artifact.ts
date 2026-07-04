import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

export const MapHydrologyEngineProjectionArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    lakeMask: TypedArraySchemas.u8({
      description:
        "Engine-accepted lake mask attributable to map-hydrology projection (1=accepted lake, 0=not accepted).",
    }),
    plannedLakeMask: TypedArraySchemas.u8({
      description: "Hydrology lake intent mask projected through the Civ7 adapter.",
    }),
    engineWaterMask: TypedArraySchemas.u8({
      description: "Civ7 isWater readback after lake terrain stamping and water cache refresh.",
    }),
    engineLakeMask: TypedArraySchemas.u8({
      description: "Civ7 isLake readback after lake terrain stamping and water cache refresh.",
    }),
    engineTerrain: TypedArraySchemas.i32({
      description: "Civ7 terrain type readback after lake terrain stamping.",
    }),
    engineAreaId: TypedArraySchemas.i32({
      description: "Civ7 area id readback after lake terrain stamping and area recalculation.",
    }),
    engineElevation: TypedArraySchemas.i16({
      description: "Civ7 elevation readback at the lake projection boundary.",
    }),
    nonWaterMask: TypedArraySchemas.u8({
      description: "Planned lake tiles that did not read back as water.",
    }),
    nonLakeMask: TypedArraySchemas.u8({
      description: "Planned lake tiles that did not read back as Civ7 lake-classified water.",
    }),
    terrainMismatchMask: TypedArraySchemas.u8({
      description: "Planned lake tiles whose terrain was not TERRAIN_COAST after stamping.",
    }),
    sinkMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of hydrography sink tiles that remained non-water in the engine snapshot after lake projection.",
    }),
    nonLakeTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned lake tiles that did not read back as Civ7 lake-classified tiles.",
    }),
    terrainMismatchTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned lake tiles whose terrain readback did not match TERRAIN_COAST.",
    }),
    morphologyProtectedLakeTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of Hydrology-planned lake tiles withheld from stamping because they overlap protected morphology terrain such as mountain spines.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Observed map-hydrology engine projection state for lakes, used to diagnose pipeline truth vs engine drift.",
  }
);

export const Schema = MapHydrologyEngineProjectionArtifactSchema;

/**
 * Projection readback is owned by map-hydrology because it records what the
 * Civ7 engine accepted after materialization, not Hydrology's source intent.
 * Downstream elevation uses this accepted mask, so rejected planned lake tiles
 * do not become false water expectations.
 */
export const artifact = defineArtifact({
  name: "engineProjectionLakes",
  id: "artifact:map.hydrology.engineProjectionLakes",
  schema: Schema,
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
