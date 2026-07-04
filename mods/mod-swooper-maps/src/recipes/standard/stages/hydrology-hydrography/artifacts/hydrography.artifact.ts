import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

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
    /** Discrete river class derived from discharge thresholds (0=none, 1=minor, >=2=major/projectable). */
    riverClass: TypedArraySchemas.u8({
      description: "River class per tile (0=none, 1=minor, >=2=major/projectable).",
    }),
    /** Hydrology-conditioned receiver index per tile, used by downstream Hydrology lake planning. */
    flowDir: TypedArraySchemas.i32({
      description:
        "Hydrology-conditioned receiver index per tile (or -1 for typed terminal basins).",
    }),
    /** Raw drainage minima: lake/depression candidates, not automatic discharge terminals. */
    sinkMask: TypedArraySchemas.u8({
      description: "Mask (1/0): raw local drainage minima used as lake/depression candidates.",
    }),
    /** Routing outlets: land tiles that drain to ocean/edges (land→water/out-of-bounds). */
    outletMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): land tiles that drain directly to ocean/edges (land→water/out-of-bounds).",
    }),
    /** Optional basin identifier per tile (or -1 when unassigned). */
    basinId: Type.Optional(
      TypedArraySchemas.i32({
        description:
          "Optional Hydrology drainage basin identifier per tile (or -1 when unassigned).",
      })
    ),
    routingElevation: Type.Optional(
      TypedArraySchemas.f32({
        description:
          "Hydrologically conditioned routing surface; does not mutate Morphology elevation.",
      })
    ),
    depressionDepth: Type.Optional(
      TypedArraySchemas.f32({
        description:
          "Positive where drainage conditioning fills a raw topographic depression to a spill surface.",
      })
    ),
    terminalType: Type.Optional(
      TypedArraySchemas.u8({
        description:
          "Terminal classification per land tile: 0=none, 1=ocean/water outlet, 2=closed basin.",
      })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology hydrography snapshot derived from Morphology topography + Hydrology discharge projection. Engine rivers/lakes may differ (projection-only).",
  }
);

export const Schema = HydrologyHydrographyArtifactSchema;

export const artifact = defineArtifact({
  name: "hydrography",
  id: "artifact:hydrology.hydrography",
  schema: Schema,
});
