import { TypedArraySchemas, Type, defineArtifact } from "@swooper/mapgen-core/authoring";

const MorphologyTopographyArtifactSchema = Type.Object(
  {
    elevation: TypedArraySchemas.i16({
      description:
        "Signed elevation per tile (integer meters). Publish-once buffer handle; steps may mutate in-place via ctx.buffers.heightfield.",
    }),
    seaLevel: Type.Number({
      description:
        "Global sea level threshold in the same datum/units as elevation (meters; may be fractional).",
    }),
    landMask: TypedArraySchemas.u8({
      description:
        "Land/water mask per tile (1=land, 0=water). Must be consistent with elevation > seaLevel.",
    }),
    bathymetry: TypedArraySchemas.i16({
      description:
        "Derived bathymetry per tile (integer meters): 0 on land; <=0 in water; consistent with elevation/seaLevel.",
    }),
  },
  {
    additionalProperties: false,
    description: "Canonical Morphology topography truth (Phase 2 schema; publish-once handle).",
  }
);

const MorphologyRoutingArtifactSchema = Type.Object(
  {
    flowDir: TypedArraySchemas.i32({
      description: "Steepest-descent receiver index per tile (or -1 for sinks/edges).",
    }),
    flowAccum: TypedArraySchemas.f32({ description: "Drainage area proxy per tile." }),
    basinId: Type.Optional(
      TypedArraySchemas.i32({ description: "Optional basin identifier per tile (or -1 when unassigned)." })
    ),
  },
  { description: "Morphology routing buffer handle (publish once)." }
);

const MorphologySubstrateArtifactSchema = Type.Object(
  {
    erodibilityK: TypedArraySchemas.f32({
      description: "Erodibility / resistance proxy per tile (higher = easier incision).",
    }),
    sedimentDepth: TypedArraySchemas.f32({
      description: "Loose sediment thickness proxy per tile (higher = deeper deposits).",
    }),
  },
  { description: "Morphology substrate buffer handle (publish once)." }
);

const MorphologyCoastlineMetricsArtifactSchema = Type.Object(
  {
    coastalLand: TypedArraySchemas.u8({ description: "Mask (1/0): land tiles adjacent to water." }),
    coastalWater: TypedArraySchemas.u8({ description: "Mask (1/0): water tiles adjacent to land." }),
    shelfMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): shallow shelf water eligible for TERRAIN_COAST projection (deterministic, derived from Morphology truth).",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description:
        "Minimum tile-graph distance to any coastline tile (0=coast), using wrapX=true and wrapY=false.",
    }),
  },
  {
    additionalProperties: false,
    description: "Derived coastline metrics snapshot (Phase 2 schema; immutable at F2).",
  }
);

const MorphologyLandmassArtifactSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0, description: "Stable index within this snapshot (0..n-1)." }),
    tileCount: Type.Integer({ minimum: 0, description: "Number of land tiles in this landmass." }),
    coastlineLength: Type.Integer({
      minimum: 0,
      description:
        "Count of land↔water adjacency edges along the coastline (canonical hex neighbor graph; wrapX=true).",
    }),
    bbox: Type.Object(
      {
        west: Type.Integer({ minimum: 0, description: "West bound (inclusive) in tile x-coordinates." }),
        east: Type.Integer({ minimum: 0, description: "East bound (inclusive) in tile x-coordinates." }),
        south: Type.Integer({ minimum: 0, description: "South bound (inclusive) in tile y-coordinates." }),
        north: Type.Integer({ minimum: 0, description: "North bound (inclusive) in tile y-coordinates." }),
      },
      {
        additionalProperties: false,
        description:
          "Axis-aligned bounds in tile coordinates. Note: west/east may wrap if a landmass crosses the map seam.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "One connected land component derived from the landMask (Phase 2 schema).",
  }
);

const MorphologyLandmassesArtifactSchema = Type.Object(
  {
    landmasses: Type.Immutable(Type.Array(MorphologyLandmassArtifactSchema)),
    landmassIdByTile: TypedArraySchemas.i32({
      description:
        "Per-tile landmass component id (-1 for water). Values map to the landmasses[] entries.",
    }),
  },
  {
    additionalProperties: false,
    description: "Landmass decomposition snapshot (Phase 2 schema; immutable at F2).",
  }
);

const VolcanoKindSchema = Type.Union([
  Type.Literal("subductionArc"),
  Type.Literal("rift"),
  Type.Literal("hotspot"),
]);

const MorphologyVolcanoesArtifactSchema = Type.Object(
  {
    volcanoMask: TypedArraySchemas.u8({ description: "Mask (1/0): tiles containing a volcano vent." }),
    volcanoes: Type.Immutable(
      Type.Array(
      Type.Object(
        {
          tileIndex: Type.Integer({ minimum: 0, description: "Tile index in row-major order." }),
          kind: VolcanoKindSchema,
          strength01: Type.Number({
            minimum: 0,
            maximum: 1,
            description: "Normalized intensity (0..1) derived from volcanism driver strength.",
          }),
        },
        { additionalProperties: false }
      )
    ),
    ),
  },
  {
    additionalProperties: false,
    description: "Volcano intent snapshot (Phase 2 schema; immutable at F2).",
  }
);

const MorphologyBeltComponentSummarySchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0, description: "Stable id within this belt-driver snapshot (1..n)." }),
    boundaryType: Type.Integer({
      minimum: 0,
      description: "Boundary type (BOUNDARY_TYPE values).",
    }),
    size: Type.Integer({ minimum: 0, description: "Number of tiles in this connected belt seed component." }),
    meanUpliftBlend: Type.Number({
      description: "Mean uplift blend intensity (0..255) across belt seeds in this component (pre-decay).",
    }),
    meanWidthScale: Type.Number({
      description: "Mean width scale multiplier (unitless) across belt seeds in this component.",
    }),
    meanSigma: Type.Number({
      description: "Mean sigma used to decay belt influence (unitless; larger = wider belts).",
    }),
    meanOriginEra: Type.Number({
      description: "Mean origin era index across belt seeds in this component (0..eraCount-1).",
    }),
    meanOriginPlateId: Type.Number({
      description: "Mean origin plate id across belt seeds in this component (plate id; -1 for unknown).",
    }),
  },
  {
    additionalProperties: false,
    description: "One connected belt seed component summary (debugging/diagnostics payload).",
  }
);

const MorphologyBeltDriversArtifactSchema = Type.Object(
  {
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity field per tile (0..255), weighted by tectonic intensity and belt decay.",
    }),
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary regime per tile (BOUNDARY_TYPE values), resolved from active eras/provenance.",
    }),
    upliftPotential: TypedArraySchemas.u8({
      description: "Orogeny / uplift potential per tile (0..255), decayed away from belt seed centers.",
    }),
    collisionPotential: TypedArraySchemas.u8({
      description: "Collision-driven uplift potential per tile (0..255), decayed away from belt seed centers.",
    }),
    subductionPotential: TypedArraySchemas.u8({
      description: "Subduction-driven uplift potential per tile (0..255), decayed away from belt seed centers.",
    }),
    riftPotential: TypedArraySchemas.u8({
      description: "Rift potential per tile (0..255), decayed away from belt seed centers.",
    }),
    tectonicStress: TypedArraySchemas.u8({
      description: "Combined tectonic stress per tile (0..255), derived from uplift/rift/shear contributions.",
    }),
    beltAge: TypedArraySchemas.u8({
      description:
        "Normalized belt age proxy per tile (0..255). 0=youngest/most recently active, 255=oldest/least recently active.",
    }),
    dominantEra: TypedArraySchemas.u8({
      description: "Dominant tectonic era index per tile (0..eraCount-1), based on weighted boundary intensity.",
    }),
    beltMask: TypedArraySchemas.u8({
      description: "Seed mask (1/0): tiles considered belt seed centers prior to decay.",
    }),
    beltDistance: TypedArraySchemas.u8({
      description: "Discrete distance-to-nearest-belt-seed per tile (0..255; 255=unreached).",
    }),
    beltNearestSeed: TypedArraySchemas.i32({
      description: "Nearest belt seed tile index per tile (-1 when no seed is within reach).",
    }),
    beltComponents: Type.Immutable(Type.Array(MorphologyBeltComponentSummarySchema)),
  },
  {
    additionalProperties: false,
    description:
      "Canonical belt-driver fields derived from tectonic history/provenance, consumed by landmask/belts/mountains.",
  }
);

export const morphologyArtifacts = {
  topography: defineArtifact({
    name: "topography",
    id: "artifact:morphology.topography",
    schema: MorphologyTopographyArtifactSchema,
  }),
  routing: defineArtifact({
    name: "routing",
    id: "artifact:morphology.routing",
    schema: MorphologyRoutingArtifactSchema,
  }),
  substrate: defineArtifact({
    name: "substrate",
    id: "artifact:morphology.substrate",
    schema: MorphologySubstrateArtifactSchema,
  }),
  coastlineMetrics: defineArtifact({
    name: "coastlineMetrics",
    id: "artifact:morphology.coastlineMetrics",
    schema: MorphologyCoastlineMetricsArtifactSchema,
  }),
  landmasses: defineArtifact({
    name: "landmasses",
    id: "artifact:morphology.landmasses",
    schema: MorphologyLandmassesArtifactSchema,
  }),
  volcanoes: defineArtifact({
    name: "volcanoes",
    id: "artifact:morphology.volcanoes",
    schema: MorphologyVolcanoesArtifactSchema,
  }),
  beltDrivers: defineArtifact({
    name: "beltDrivers",
    id: "artifact:morphology.beltDrivers",
    schema: MorphologyBeltDriversArtifactSchema,
  }),
} as const;
