import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanGeologicalResourcesContract from "../contract.js";

type GeologicalResourceType =
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

type GeologicalLaneId =
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

type MaskField =
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

type SuppressionField =
  | "flatNonGeologicMask"
  | "wetSuppressionMask"
  | "humidSuppressionMask"
  | "offshoreMask"
  | "igneousTerrainMask";

type ResourceSignals = {
  readonly laneId: GeologicalLaneId;
  readonly primary: readonly MaskField[];
  readonly suppress: readonly SuppressionField[];
};

const DEFAULT_RANGE = {
  baseline: "standard-earthlike-map" as const,
  min: 0,
  target: 0,
  max: 0,
  evidence: "blocked" as const,
};

const GEOLOGICAL_RESOURCE_TYPES: readonly GeologicalResourceType[] = [
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

const GEOLOGICAL_SIGNALS: Record<GeologicalResourceType, ResourceSignals> = {
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

export const defaultStrategy = createStrategy(PlanGeologicalResourcesContract, "default", {
  run: (input) => {
    const size = validateGrid(input.width, input.height);
    const expectations = new Map(input.expectations.map((row) => [row.resourceType, row]));
    const plans = [];
    const missingResourceTypes: GeologicalResourceType[] = [];

    for (const resourceType of GEOLOGICAL_RESOURCE_TYPES) {
      const signals = GEOLOGICAL_SIGNALS[resourceType];
      const expectation = expectations.get(resourceType);
      if (!expectation) {
        missingResourceTypes.push(resourceType);
        plans.push({
          resourceType,
          laneId: signals.laneId,
          status: "missing-expectation" as const,
          eligibilityStatus: "missing-expectation" as const,
          expectedCountRange: DEFAULT_RANGE,
          targetIntentCount: 0,
          eligibleTileCount: 0,
          rangeStatus: "not-gated" as const,
          proofStatus: "warning-only" as const,
          runtimeIdStatus: "unverified" as const,
          earthlikePredicate: "",
          conditionMultipliers: [],
          proxyRequirements: [],
          signalFields: [],
          blockers: ["Missing geological earthlike expectation row."],
          caveats: [],
        });
        continue;
      }

      if (expectation.status === "blocked") {
        plans.push({
          resourceType,
          laneId: signals.laneId,
          status: "blocked" as const,
          eligibilityStatus: "blocked" as const,
          expectedCountRange: expectation.expectedCountRange,
          targetIntentCount: 0,
          eligibleTileCount: 0,
          rangeStatus: "not-gated" as const,
          proofStatus: "warning-only" as const,
          runtimeIdStatus: "unverified" as const,
          earthlikePredicate: expectation.earthlikePredicate,
          conditionMultipliers: [...expectation.conditionMultipliers],
          proxyRequirements: [...expectation.proxyRequirements],
          signalFields: [],
          blockers: ["Expectation row is blocked by official corpus disposition."],
          caveats: [...expectation.caveats],
        });
        continue;
      }

      const signalFields = presentFields(input, signals.primary);
      const eligibleTileCount = countEligibleTiles(input, size, signals);
      const proxyIncomplete = signalFields.length === 0;
      const targetIntentCount = proxyIncomplete
        ? 0
        : Math.min(expectation.expectedCountRange.max, eligibleTileCount, expectation.expectedCountRange.target);
      const blockers = [];
      if (proxyIncomplete) {
        blockers.push(`Missing geological signal masks: ${signals.primary.join(", ")}.`);
      }
      if (!proxyIncomplete && eligibleTileCount === 0) {
        blockers.push("No eligible geological tiles observed for this resource under supplied masks.");
      }

      plans.push({
        resourceType,
        laneId: signals.laneId,
        status: proxyIncomplete ? ("proxy-gap" as const) : ("planned" as const),
        eligibilityStatus: proxyIncomplete ? ("proxy-incomplete" as const) : ("observed" as const),
        expectedCountRange: expectation.expectedCountRange,
        targetIntentCount,
        eligibleTileCount,
        rangeStatus: proxyIncomplete
          ? ("not-gated" as const)
          : compareRange(targetIntentCount, expectation.expectedCountRange),
        proofStatus: "warning-only" as const,
        runtimeIdStatus: "unverified" as const,
        earthlikePredicate: expectation.earthlikePredicate,
        conditionMultipliers: [...expectation.conditionMultipliers],
        proxyRequirements: [...expectation.proxyRequirements],
        signalFields,
        blockers,
        caveats: [...expectation.caveats],
      });
    }

    return {
      groupId: "geological-mineral-gemstone-industrial" as const,
      runtimeIdStatus: "unverified" as const,
      proofStatus: "warning-only" as const,
      plans,
      missingResourceTypes,
    };
  },
});

function validateGrid(width: number, height: number): number {
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new Error(`Invalid grid dimensions for geological resource planning: ${width}x${height}.`);
  }
  return size;
}

function presentFields(input: Record<string, unknown>, fields: readonly MaskField[]): string[] {
  return fields.filter((field) => input[field] !== undefined);
}

function countEligibleTiles(
  input: Record<string, unknown>,
  size: number,
  signals: ResourceSignals
): number {
  const primaryMasks = signals.primary
    .map((field) => ({ field, mask: readMask(input, field, size) }))
    .filter((entry): entry is { field: MaskField; mask: Uint8Array } => entry.mask !== undefined);
  if (primaryMasks.length === 0) return 0;

  const suppressMasks = signals.suppress
    .map((field) => readMask(input, field, size))
    .filter((mask): mask is Uint8Array => mask !== undefined);

  let count = 0;
  for (let i = 0; i < size; i++) {
    if (!primaryMasks.some(({ mask }) => mask[i] !== 0)) continue;
    if (suppressMasks.some((mask) => mask[i] !== 0)) continue;
    count += 1;
  }
  return count;
}

function readMask(input: Record<string, unknown>, field: string, size: number): Uint8Array | undefined {
  const value = input[field];
  if (value === undefined) return undefined;
  if (!(value instanceof Uint8Array)) {
    throw new Error(`Geological resource mask ${field} must be a Uint8Array.`);
  }
  if (value.length !== size) {
    throw new Error(`Geological resource mask ${field} length ${value.length} does not match grid size ${size}.`);
  }
  return value;
}

function compareRange(
  count: number,
  range: { readonly min: number; readonly max: number }
): "within-range" | "below-range" | "above-range" {
  if (count < range.min) return "below-range";
  if (count > range.max) return "above-range";
  return "within-range";
}
