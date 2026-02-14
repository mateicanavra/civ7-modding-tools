import { TypedArraySchemas, Type, defineArtifact } from "@swooper/mapgen-core/authoring";

/**
 * Snapshot of Hydrology hydrography derived from Morphology topography + Hydrology discharge projection.
 *
 * This is the canonical read path for “river-ness” and discharge-like signals inside the pipeline.
 * Engine rivers/lakes may differ (engine projection), and must not be treated as Hydrology internal truth.
 */
export const HydrologyHydrographyArtifactSchema = Type.Object(
  {
    /** Local runoff source proxy per tile (derived from precipitation/humidity inputs). */
    runoff: TypedArraySchemas.f32({
      description: "Local runoff source proxy per tile (derived from precipitation/humidity).",
    }),
    /** Accumulated discharge proxy per tile (routing + runoff accumulation). */
    discharge: TypedArraySchemas.f32({
      description: "Accumulated discharge proxy per tile (routing + runoff accumulation).",
    }),
    /** Discrete river class derived from discharge thresholds (0=none, 1=minor, 2=major). */
    riverClass: TypedArraySchemas.u8({
      description: "River class per tile (0=none, 1=minor, 2=major).",
    }),
    /** Routing sinks: candidate endorheic basins / internal drainage endpoints. */
    sinkMask: TypedArraySchemas.u8({
      description: "Mask (1/0): land tiles that are routing sinks (candidate endorheic basins).",
    }),
    /** Routing outlets: land tiles that drain to ocean/edges (land→water/out-of-bounds). */
    outletMask: TypedArraySchemas.u8({
      description: "Mask (1/0): land tiles that drain directly to ocean/edges (land→water/out-of-bounds).",
    }),
    /** Optional basin identifier per tile (or -1 when unassigned). */
    basinId: Type.Optional(
      TypedArraySchemas.i32({ description: "Optional basin identifier per tile (or -1 when unassigned)." })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology hydrography snapshot derived from Morphology topography + Hydrology discharge projection. Engine rivers/lakes may differ (projection-only).",
  }
);

export const HydrologyEngineProjectionArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    lakeMask: TypedArraySchemas.u8({
      description: "Engine water mask attributable to map-hydrology projection (1=water, 0=land).",
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
      "Observed engine projection state for lakes/rivers, used to diagnose pipeline truth vs engine drift.",
  }
);

export const hydrologyHydrographyArtifacts = {
  hydrography: defineArtifact({
    name: "hydrography",
    id: "artifact:hydrology.hydrography",
    schema: HydrologyHydrographyArtifactSchema,
  }),
  engineProjectionLakes: defineArtifact({
    name: "engineProjectionLakes",
    id: "artifact:hydrology.engineProjectionLakes",
    schema: HydrologyEngineProjectionArtifactSchema,
  }),
  engineProjectionRivers: defineArtifact({
    name: "engineProjectionRivers",
    id: "artifact:hydrology.engineProjectionRivers",
    schema: HydrologyEngineProjectionArtifactSchema,
  }),
} as const;
