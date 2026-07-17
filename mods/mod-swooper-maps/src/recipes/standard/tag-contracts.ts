/** Map-tile-sized runtime fields whose presence gates consumers in the recipe DAG. */
export const FIELD_DEPENDENCY_TAGS = {
  field: {
    terrainType: "field:terrainType",
    elevation: "field:elevation",
    rainfall: "field:rainfall",
    biomeId: "field:biomeId",
    featureType: "field:featureType",
  },
} as const;

/** Civ7 engine mutations whose completion may require adapter-backed verification. */
export const STANDARD_ENGINE_EFFECT_TAGS = {
  engine: {
    riversModeled: "effect:engine.riversModeled",
    biomesApplied: "effect:engine.biomesApplied",
    featuresApplied: "effect:engine.featuresApplied",
    plotEffectsApplied: "effect:engine.plotEffectsApplied",
    placementApplied: "effect:engine.placementApplied",
  },
} as const;

/** Projection and parity milestones published by map-facing materialization steps. */
export const MAP_PROJECTION_EFFECT_TAGS = {
  map: {
    coastsPlotted: "effect:map.coastsPlotted",
    continentsPlotted: "effect:map.continentsPlotted",
    elevationBuilt: "effect:map.elevationBuilt",
    mountainsPlotted: "effect:map.mountainsPlotted",
    volcanoesPlotted: "effect:map.volcanoesPlotted",
    landmassRegionsPlotted: "effect:map.landmassRegionsPlotted",
    lakesPlotted: "effect:map.lakesPlotted",
    riversPlotted: "effect:map.riversPlotted",
    elevationParityCaptured: "effect:map.elevationParityCaptured",
    hydrologyLakesParityCaptured: "effect:map.hydrologyLakesParityCaptured",
    riversParityCaptured: "effect:map.riversParityCaptured",
    ecologyBiomesParityCaptured: "effect:map.ecologyBiomesParityCaptured",
    ecologyFeaturesParityCaptured: "effect:map.ecologyFeaturesParityCaptured",
    placementParityCaptured: "effect:map.placementParityCaptured",
  },
} as const;

/** Ordered placement-product milestones used to prevent consumers observing partial state. */
export const PLACEMENT_PRODUCT_EFFECT_TAGS = {
  placement: {
    naturalWondersPlaced: "effect:placement.naturalWondersPlaced",
    surfacePrepared: "effect:placement.surfacePrepared",
    resourcesPlanned: "effect:placement.resourcesPlanned",
    resourcesAdjusted: "effect:placement.resourcesAdjusted",
    resourcesPlaced: "effect:placement.resourcesPlaced",
    startsAssigned: "effect:placement.startsAssigned",
    discoveriesPlaced: "effect:placement.discoveriesPlaced",
    advancedStartsAssigned: "effect:placement.advancedStartsAssigned",
  },
} as const;
