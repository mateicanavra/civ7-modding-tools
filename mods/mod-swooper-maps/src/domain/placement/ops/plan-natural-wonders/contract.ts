import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const PlanNaturalWondersContract = defineOp({
  kind: "plan",
  id: "placement/plan-natural-wonders",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    wondersCount: Type.Integer({ minimum: 0 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (meters)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    riverClass: TypedArraySchemas.u8({
      description: "Hydrology river class per tile (0=none,1=minor,>=2=major/projectable).",
    }),
    lakeMask: TypedArraySchemas.u8({
      description: "Hydrology lake mask per tile (1=lake, 0=non-lake).",
    }),
    // Forwarded physical suitability signals (already-computed truth artifacts;
    // not recomputed). Optional so the op tolerates inputs that omit them.
    vegetationDensity: Type.Optional(
      TypedArraySchemas.f32({ description: "Ecology vegetation density per tile (0..1)." })
    ),
    effectiveMoisture: Type.Optional(
      TypedArraySchemas.f32({ description: "Ecology effective moisture per tile." })
    ),
    surfaceTemperature: Type.Optional(
      TypedArraySchemas.f32({ description: "Ecology surface temperature per tile (C)." })
    ),
    fertility: Type.Optional(
      TypedArraySchemas.f32({ description: "Pedology fertility per tile (0..1)." })
    ),
    discharge: Type.Optional(
      TypedArraySchemas.f32({ description: "Hydrology accumulated discharge proxy per tile." })
    ),
    slopeClass: Type.Optional(
      TypedArraySchemas.u8({ description: "Hydrology slope class per tile." })
    ),
    coastTerrainType: Type.Integer({ minimum: 0 }),
    mountainTerrainType: Type.Integer({ minimum: 0 }),
    iceFeatureType: Type.Integer({ minimum: 0 }),
    terrainType: TypedArraySchemas.u8({ description: "Current engine terrain type per tile." }),
    biomeType: TypedArraySchemas.u8({ description: "Current engine biome type per tile." }),
    featureType: TypedArraySchemas.i16({ description: "Current engine feature type per tile." }),
    noFeatureType: Type.Integer({ description: "Engine sentinel for an unoccupied feature slot." }),
    naturalWonderBlockedMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): tile terrain/placement is protected by static map policy and must not host natural-wonder placement.",
    }),
    featureCatalog: Type.Array(
      Type.Object({
        featureType: Type.Integer({ minimum: 0 }),
        direction: Type.Integer(),
        validTerrainTypes: Type.Optional(Type.Array(Type.Integer({ minimum: 0 }))),
        validBiomeTypes: Type.Optional(Type.Array(Type.Integer({ minimum: 0 }))),
        minimumElevation: Type.Optional(Type.Number()),
        noLake: Type.Optional(Type.Boolean()),
        placeFirst: Type.Optional(Type.Boolean()),
        placementClass: Type.Optional(Type.String()),
        naturalWonderTiles: Type.Optional(Type.Integer({ minimum: 1 })),
        featureTags: Type.Optional(Type.Array(Type.String())),
        // Parity-keyed footprint offsets (odd-R): the even-row and odd-row offset
        // lists for this wonder's class/direction. The op applies `(anchorY & 1)`
        // at the concrete anchor. Computed in derive-placement-inputs via the
        // map-policy byParity helper; the op stays mapgen-core-only.
        footprintOffsetsByParity: Type.Optional(
          Type.Object({
            even: Type.Array(Type.Object({ dx: Type.Integer(), dy: Type.Integer() })),
            odd: Type.Array(Type.Object({ dx: Type.Integer(), dy: Type.Integer() })),
          })
        ),
      })
    ),
  }),
  output: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    wondersCount: Type.Integer({ minimum: 0 }),
    targetCount: Type.Integer({ minimum: 0 }),
    plannedCount: Type.Integer({ minimum: 0 }),
    placements: Type.Array(
      Type.Object({
        plotIndex: Type.Integer({ minimum: 0 }),
        featureType: Type.Integer({ minimum: 0 }),
        direction: Type.Integer(),
        elevation: Type.Number(),
        priority: Type.Number({ minimum: 0, maximum: 1 }),
        // Next-best anchor candidates for this wonder (suitability-descending),
        // for the materialize step to retry when the engine refuses the primary
        // anchor (canHaveFeatureParam-true does NOT guarantee setFeatureType-
        // success). Excludes the primary + other placements' footprints; the
        // engine remains the final legality authority.
        fallbackPlotIndices: Type.Optional(Type.Array(Type.Integer({ minimum: 0 }))),
      })
    ),
  }),
  strategies: {
    default: Type.Object({
      minSpacingTiles: Type.Integer({
        minimum: 0,
        maximum: 16,
        default: 6,
        description: "Minimum hex spacing between planned natural wonder placements.",
      }),
    }),
  },
});

export default PlanNaturalWondersContract;
