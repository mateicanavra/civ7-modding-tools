import { Type, TypedArraySchemas, defineArtifact } from "@swooper/mapgen-core/authoring";

export const MapHydrologyEngineProjectionArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    lakeMask: TypedArraySchemas.u8({
      description:
        "Engine-accepted lake mask attributable to map-hydrology projection (1=accepted lake, 0=not accepted).",
    }),
    sinkMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of hydrography sink tiles that remained non-water in the engine snapshot after lake projection.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Observed map-hydrology engine projection state for lakes, used to diagnose pipeline truth vs engine drift.",
  }
);

export const mapHydrologyArtifacts = {
  /**
   * Projection readback is owned by map-hydrology because it records what the
   * Civ7 engine accepted after materialization, not Hydrology's source intent.
   * Downstream elevation uses this accepted mask, so rejected planned lake tiles
   * do not become false water expectations.
   */
  engineProjectionLakes: defineArtifact({
    name: "engineProjectionLakes",
    id: "artifact:map.hydrology.engineProjectionLakes",
    schema: MapHydrologyEngineProjectionArtifactSchema,
  }),
  /**
   * The terrain snapshot stays local to lake projection because it is diagnostic
   * evidence for the static water materialization boundary, not a reusable root
   * map product.
   */
  hydrologyLakesEngineTerrainSnapshot: defineArtifact({
    name: "hydrologyLakesEngineTerrainSnapshot",
    id: "artifact:map.hydrologyLakesEngineTerrainSnapshot",
    schema: Type.Object(
      {
        stage: Type.String({
          description: "Step identifier that produced this snapshot.",
        }),
        width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
        height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
        landMask: TypedArraySchemas.u8({
          description: "Engine-derived land mask after lake projection (1=land, 0=water).",
        }),
        terrain: TypedArraySchemas.u8({
          description: "Engine-derived terrain type snapshot after lake projection.",
        }),
        elevation: TypedArraySchemas.i16({
          description: "Engine-derived elevation snapshot after lake projection.",
        }),
      },
      {
        additionalProperties: false,
        description:
          "Engine terrain snapshot captured at the map-hydrology lake projection boundary.",
      }
    ),
  }),
} as const;
