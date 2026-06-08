import { Type } from "@swooper/mapgen-core/authoring";

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config: config ?? {} };
}

export const PlacementKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Placement knobs. Late placement currently exposes product controls rather than stage-wide knobs.",
  }
);

export const PlacementNaturalWondersSchema = Type.Object(
  {
    minSpacingTiles: Type.Optional(
      Type.Integer({
        default: 6,
        minimum: 0,
        maximum: 16,
        description:
          "Sets the minimum hex spacing between planned natural wonders; higher values spread wonders farther apart and can reduce placement count on constrained maps.",
      })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Natural wonder placement controls for spacing planned wonder stamps before Civ7 feature materialization.",
  }
);

export const PlacementDiscoveriesSchema = Type.Object(
  {
    densityPer100Tiles: Type.Optional(
      Type.Number({
        default: 3,
        minimum: 0,
        maximum: 50,
        description:
          "Sets target discovery density per 100 land tiles; higher values plan more discovery opportunities before typed placement reconciliation.",
      })
    ),
    minSpacingTiles: Type.Optional(
      Type.Integer({
        default: 3,
        minimum: 0,
        maximum: 12,
        description:
          "Sets the minimum hex spacing between planned discoveries; higher values spread discoveries farther apart and can reduce final discovery count.",
      })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Discovery placement controls for target density and spacing before Civ7 discovery materialization.",
  }
);

export const PlacementFloodplainsSchema = Type.Object(
  {
    minLength: Type.Optional(
      Type.Integer({
        default: 4,
        minimum: 1,
        maximum: 80,
        description:
          "Sets the shortest river segment length eligible for floodplain conversion during placement surface preparation.",
      })
    ),
    maxLength: Type.Optional(
      Type.Integer({
        default: 10,
        minimum: 1,
        maximum: 120,
        description:
          "Sets the longest contiguous river length converted to floodplains during placement surface preparation.",
      })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Floodplain placement controls for river segment lengths used before resources, starts, and discoveries read the prepared map.",
  }
);

export const PlacementResourcesSchema = Type.Object(
  {
    densityPer100Tiles: Type.Optional(
      Type.Number({
        default: 9,
        minimum: 0,
        maximum: 50,
        description:
          "Sets target resource density per 100 land tiles; higher values plan more typed resource intents before engine legality reconciliation.",
      })
    ),
    minSpacingTiles: Type.Optional(
      Type.Integer({
        default: 2,
        minimum: 0,
        maximum: 8,
        description:
          "Sets the minimum odd-q hex spacing between planned resources; higher values spread resources farther apart and can lower final placements.",
      })
    ),
    maxPlacementsPerResourceShare: Type.Optional(
      Type.Number({
        default: 0.3,
        minimum: 0.05,
        maximum: 1,
        description:
          "Caps the share of planned resource placements that any single resource type may claim, preserving variety when the adapter catalog is broad enough.",
      })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Resource placement controls for density, spacing, and type variety. Resource type candidates come from the Civ7 adapter catalog filtered by the resource-domain initial-map authoring policy, not authored config.",
  }
);

export const PlacementStartsSchema = Type.Object(
  {
    minContiguousLandTiles: Type.Optional(
      Type.Integer({
        default: 24,
        minimum: 1,
        maximum: 400,
        description:
          "Minimum connected land tiles for a normal continent or subcontinent start.",
      })
    ),
    expansionRadiusTiles: Type.Optional(
      Type.Integer({
        default: 4,
        minimum: 1,
        maximum: 8,
        description:
          "Radius used to measure first-age same-landmass expansion space around a start.",
      })
    ),
    minExpansionLandTiles: Type.Optional(
      Type.Integer({
        default: 14,
        minimum: 1,
        maximum: 120,
        description:
          "Minimum same-landmass tiles inside the expansion radius for a normal start.",
      })
    ),
    islandClusterRadiusTiles: Type.Optional(
      Type.Integer({
        default: 5,
        minimum: 1,
        maximum: 10,
        description:
          "Radius used to count nearby land when admitting intentional archipelago starts.",
      })
    ),
    minIslandClusterLandTiles: Type.Optional(
      Type.Integer({
        default: 18,
        minimum: 1,
        maximum: 160,
        description:
          "Minimum nearby land across small islands before a start can use the island-cluster tier.",
      })
    ),
    maxIslandStartCoastDistance: Type.Optional(
      Type.Integer({
        default: 1,
        minimum: 0,
        maximum: 8,
        description:
          "Maximum coast distance for island-cluster starts, keeping those starts tied to water access.",
      })
    ),
    minStartSpacingTiles: Type.Optional(
      Type.Integer({
        default: 9,
        minimum: 0,
        maximum: 24,
        description:
          "Minimum spacing between starts after viability tiers are applied; relaxes only when needed.",
      })
    ),
    resourceSupportRadiusTiles: Type.Optional(
      Type.Integer({
        default: 4,
        minimum: 0,
        maximum: 8,
        description:
          "Radius used to evaluate placed-resource support around candidate starts.",
      })
    ),
    resourceSupportWeight: Type.Optional(
      Type.Number({
        default: 1,
        minimum: 0,
        maximum: 4,
        description: "Weight for nearby placed-resource support in start scoring.",
      })
    ),
    fertilityWeight: Type.Optional(
      Type.Number({
        default: 1.2,
        minimum: 0,
        maximum: 4,
        description: "Weight for local fertility in start scoring.",
      })
    ),
    freshwaterWeight: Type.Optional(
      Type.Number({
        default: 0.9,
        minimum: 0,
        maximum: 4,
        description: "Weight for river and lake adjacency in start scoring.",
      })
    ),
    largeLandmassWeight: Type.Optional(
      Type.Number({
        default: 1,
        minimum: 0,
        maximum: 4,
        description: "Weight for contiguous landmass and nearby expansion area support.",
      })
    ),
    roughnessPenaltyWeight: Type.Optional(
      Type.Number({
        default: 0.6,
        minimum: 0,
        maximum: 4,
        description: "Penalty applied to locally rugged start candidates.",
      })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Start placement controls for first-age expansion viability, intentional island starts, spacing, and early support.",
  }
);

export const PlacementPublicSchema = Type.Object(
  {
    naturalWonders: Type.Optional(PlacementNaturalWondersSchema),
    discoveries: Type.Optional(PlacementDiscoveriesSchema),
    floodplains: Type.Optional(PlacementFloodplainsSchema),
    resources: Type.Optional(PlacementResourcesSchema),
    starts: Type.Optional(PlacementStartsSchema),
  },
  {
    additionalProperties: false,
    description:
      "Placement authoring controls for late gameplay products: natural wonders, discoveries, floodplains, resources, and first-age viable starts. Runtime map-size start counts and adapter catalogs are supplied by the run environment rather than authored here.",
  }
);

export function compilePlacementPublicConfig(config: Record<string, unknown>) {
  return {
    "derive-placement-inputs": {
      wonders: defaultEnvelope({}),
      naturalWonders: defaultEnvelope(config.naturalWonders),
      discoveries: defaultEnvelope(config.discoveries),
      floodplains: defaultEnvelope(config.floodplains),
      resources: defaultEnvelope(config.resources),
    },
    "plot-landmass-regions": {},
    "place-natural-wonders": {},
    "prepare-placement-surface": {},
    "place-resources": {},
    "assign-starts": {
      starts: defaultEnvelope({
        ...(config.starts as object | undefined),
        overrides: { startSectors: [] },
      }),
    },
    "place-discoveries": {},
    "assign-advanced-starts": {},
    placement: {},
  };
}
