import { Type, TypedArraySchemas, defineArtifact } from "@swooper/mapgen-core/authoring";

export const MapHydrologyEngineProjectionArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    lakeMask: TypedArraySchemas.u8({
      description:
        "Engine-accepted lake mask attributable to map-hydrology projection (1=accepted lake, 0=not accepted).",
    }),
    riverMask: TypedArraySchemas.u8({
      description:
        "Engine navigable-river terrain mask after map-hydrology projection (1=navigable river terrain).",
    }),
    sinkMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of hydrography sink tiles that remained non-water in the engine snapshot after lake projection.",
    }),
    riverMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of hydrography riverClass>0 tiles that did not project to navigable-river terrain in engine snapshot.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Observed map-hydrology engine projection state for lakes/rivers, used to diagnose pipeline truth vs engine drift.",
  }
);

export const mapHydrologyArtifacts = {
  // Projection readback is owned by map-hydrology because it records what the
  // Civ7 engine accepted after materialization, not Hydrology's source intent.
  engineProjectionLakes: defineArtifact({
    name: "engineProjectionLakes",
    id: "artifact:map.hydrology.engineProjectionLakes",
    schema: MapHydrologyEngineProjectionArtifactSchema,
  }),
  engineProjectionRivers: defineArtifact({
    name: "engineProjectionRivers",
    id: "artifact:map.hydrology.engineProjectionRivers",
    schema: MapHydrologyEngineProjectionArtifactSchema,
  }),
} as const;
