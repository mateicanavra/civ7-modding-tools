export type GeologicalResourceType =
  | "RESOURCE_GOLD"
  | "RESOURCE_GOLD_DISTANT_LANDS"
  | "RESOURCE_SILVER"
  | "RESOURCE_SILVER_DISTANT_LANDS"
  | "RESOURCE_GYPSUM"
  | "RESOURCE_JADE"
  | "RESOURCE_KAOLIN"
  | "RESOURCE_MARBLE"
  | "RESOURCE_IRON"
  | "RESOURCE_SALT"
  | "RESOURCE_LAPIS_LAZULI"
  | "RESOURCE_NITER"
  | "RESOURCE_COAL"
  | "RESOURCE_NICKEL"
  | "RESOURCE_OIL"
  | "RESOURCE_CLAY"
  | "RESOURCE_LIMESTONE"
  | "RESOURCE_TIN"
  | "RESOURCE_PITCH"
  | "RESOURCE_RUBIES";

export type GeologicalLaneId =
  | "orogenic-hydrothermal"
  | "blocked-derivative"
  | "evaporite-sedimentary"
  | "ultramafic-metamorphic"
  | "weathering-clay"
  | "carbonate-metamorphic"
  | "craton-orogen"
  | "closed-basin-salt"
  | "blocked-no-valid-biome"
  | "arid-nitrate"
  | "sedimentary-fuel"
  | "wet-alluvial-clay"
  | "carbonate-industrial"
  | "granite-orogen-placer"
  | "hydrocarbon-seep"
  | "ruby-metamorphic";

export type GeologicalMaskField =
  | "orogenyMask"
  | "alluvialPlacerMask"
  | "tundraDesertHillMask"
  | "evaporiteBasinMask"
  | "sedimentaryBasinMask"
  | "ultramaficMask"
  | "weatheringClayFlatMask"
  | "carbonateBeltMask"
  | "cratonMask"
  | "closedBasinMask"
  | "aridSoilMask"
  | "forestWetlandBasinMask"
  | "hydrocarbonBasinMask"
  | "wetAlluvialMask"
  | "graniteBeltMask"
  | "oilAdjacencyMask"
  | "metamorphicBeltMask"
  | "collisionBeltMask";

export type GeologicalSuppressionField =
  | "flatNonGeologicMask"
  | "wetSuppressionMask"
  | "humidSuppressionMask"
  | "offshoreMask"
  | "igneousTerrainMask";

export type GeologicalResourceSignals = {
  readonly laneId: GeologicalLaneId;
  readonly primary: readonly GeologicalMaskField[];
  readonly suppress: readonly GeologicalSuppressionField[];
};

export const GEOLOGICAL_RESOURCE_TYPES: readonly GeologicalResourceType[] = [
  "RESOURCE_GOLD",
  "RESOURCE_GOLD_DISTANT_LANDS",
  "RESOURCE_SILVER",
  "RESOURCE_SILVER_DISTANT_LANDS",
  "RESOURCE_GYPSUM",
  "RESOURCE_JADE",
  "RESOURCE_KAOLIN",
  "RESOURCE_MARBLE",
  "RESOURCE_IRON",
  "RESOURCE_SALT",
  "RESOURCE_LAPIS_LAZULI",
  "RESOURCE_NITER",
  "RESOURCE_COAL",
  "RESOURCE_NICKEL",
  "RESOURCE_OIL",
  "RESOURCE_CLAY",
  "RESOURCE_LIMESTONE",
  "RESOURCE_TIN",
  "RESOURCE_PITCH",
  "RESOURCE_RUBIES",
];

export const GEOLOGICAL_SIGNALS: Record<GeologicalResourceType, GeologicalResourceSignals> = {
  RESOURCE_GOLD: {
    laneId: "orogenic-hydrothermal",
    primary: ["orogenyMask", "alluvialPlacerMask"],
    suppress: ["flatNonGeologicMask"],
  },
  RESOURCE_GOLD_DISTANT_LANDS: {
    laneId: "blocked-derivative",
    primary: [],
    suppress: [],
  },
  RESOURCE_SILVER: {
    laneId: "orogenic-hydrothermal",
    primary: ["orogenyMask", "tundraDesertHillMask"],
    suppress: ["flatNonGeologicMask"],
  },
  RESOURCE_SILVER_DISTANT_LANDS: {
    laneId: "blocked-derivative",
    primary: [],
    suppress: [],
  },
  RESOURCE_GYPSUM: {
    laneId: "evaporite-sedimentary",
    primary: ["evaporiteBasinMask", "sedimentaryBasinMask"],
    suppress: ["wetSuppressionMask"],
  },
  RESOURCE_JADE: {
    laneId: "ultramafic-metamorphic",
    primary: ["ultramaficMask", "orogenyMask"],
    suppress: ["flatNonGeologicMask"],
  },
  RESOURCE_KAOLIN: {
    laneId: "weathering-clay",
    primary: ["weatheringClayFlatMask", "wetAlluvialMask"],
    suppress: ["flatNonGeologicMask"],
  },
  RESOURCE_MARBLE: {
    laneId: "carbonate-metamorphic",
    primary: ["carbonateBeltMask"],
    suppress: ["flatNonGeologicMask"],
  },
  RESOURCE_IRON: {
    laneId: "craton-orogen",
    primary: ["cratonMask", "orogenyMask"],
    suppress: ["flatNonGeologicMask"],
  },
  RESOURCE_SALT: {
    laneId: "closed-basin-salt",
    primary: ["closedBasinMask", "evaporiteBasinMask"],
    suppress: ["humidSuppressionMask"],
  },
  RESOURCE_LAPIS_LAZULI: {
    laneId: "blocked-no-valid-biome",
    primary: [],
    suppress: [],
  },
  RESOURCE_NITER: {
    laneId: "arid-nitrate",
    primary: ["closedBasinMask", "aridSoilMask"],
    suppress: ["humidSuppressionMask"],
  },
  RESOURCE_COAL: {
    laneId: "sedimentary-fuel",
    primary: ["sedimentaryBasinMask", "forestWetlandBasinMask"],
    suppress: [],
  },
  RESOURCE_NICKEL: {
    laneId: "blocked-no-valid-biome",
    primary: [],
    suppress: [],
  },
  RESOURCE_OIL: {
    laneId: "sedimentary-fuel",
    primary: ["hydrocarbonBasinMask", "sedimentaryBasinMask"],
    suppress: ["offshoreMask"],
  },
  RESOURCE_CLAY: {
    laneId: "wet-alluvial-clay",
    primary: ["wetAlluvialMask", "weatheringClayFlatMask"],
    suppress: [],
  },
  RESOURCE_LIMESTONE: {
    laneId: "carbonate-industrial",
    primary: ["carbonateBeltMask"],
    suppress: ["igneousTerrainMask"],
  },
  RESOURCE_TIN: {
    laneId: "granite-orogen-placer",
    primary: ["graniteBeltMask", "orogenyMask", "alluvialPlacerMask"],
    suppress: ["flatNonGeologicMask"],
  },
  RESOURCE_PITCH: {
    laneId: "hydrocarbon-seep",
    primary: ["hydrocarbonBasinMask", "oilAdjacencyMask"],
    suppress: [],
  },
  RESOURCE_RUBIES: {
    laneId: "ruby-metamorphic",
    primary: ["metamorphicBeltMask", "collisionBeltMask"],
    suppress: ["flatNonGeologicMask"],
  },
};
