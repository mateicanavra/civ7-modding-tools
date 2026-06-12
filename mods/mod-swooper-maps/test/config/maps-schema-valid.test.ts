import { describe, expect, it } from "vitest";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import standardRecipe, { STANDARD_STAGES } from "../../src/recipes/standard/recipe";
import {
  validateCanonicalMapConfig,
  type CanonicalMapConfigEnvelope,
} from "../../src/maps/configs/canonical";

import mountainPatchConfig from "../../src/maps/configs/mountain-patch.config.json";
import mountainRiversPatchConfig from "../../src/maps/configs/mountain-rivers-patch.config.json";
import shatteredRingConfig from "../../src/maps/configs/shattered-ring.config.json";
import sunderedArchipelagoConfig from "../../src/maps/configs/sundered-archipelago.config.json";
import swooperDesertMountainsConfig from "../../src/maps/configs/swooper-desert-mountains.config.json";
import swooperEarthlikeConfig from "../../src/maps/configs/swooper-earthlike.config.json";
import legacyFoundationCompiled from "../fixtures/legacy-foundation-compiled.json";
import legacyHydrologyCompiled from "../fixtures/legacy-hydrology-compiled.json";
import legacyMorphologyCompiled from "../fixtures/legacy-morphology-compiled.json";
import legacyEcologyCompiled from "../fixtures/legacy-ecology-compiled.json";
import legacyProjectionCompiled from "../fixtures/legacy-projection-compiled.json";
import legacyPlacementCompiled from "../fixtures/legacy-placement-compiled.json";

const shippedMapConfigs = [
  ["shattered-ring.config.json", shatteredRingConfig],
  ["sundered-archipelago.config.json", sunderedArchipelagoConfig],
  ["swooper-desert-mountains.config.json", swooperDesertMountainsConfig],
  ["swooper-earthlike.config.json", swooperEarthlikeConfig],
] as const satisfies readonly (readonly [string, CanonicalMapConfigEnvelope])[];

const mapCatalogConfigs = [
  ...shippedMapConfigs,
  ["mountain-patch.config.json", mountainPatchConfig],
  ["mountain-rivers-patch.config.json", mountainRiversPatchConfig],
] as const satisfies readonly (readonly [string, CanonicalMapConfigEnvelope])[];

const FOUNDATION_PUBLIC_KEYS = [
  "knobs",
  "meshResolution",
  "mantleSources",
  "mantleForcing",
  "lithosphere",
  "platePartition",
  "plateMotion",
  "tectonicSegmentation",
  "tectonicEras",
  "tectonicFields",
  "tectonicRollups",
] as const;

const FOUNDATION_INTERNAL_STAGE_KEYS = [
  "mesh",
  "mantle-potential",
  "mantle-forcing",
  "crust",
  "plate-graph",
  "plate-motion",
  "tectonics",
  "crust-evolution",
  "projection",
  "plate-topology",
] as const;

const MORPHOLOGY_PUBLIC_KEYS: Record<string, readonly string[]> = {
  "morphology-coasts": [
    "knobs",
    "substrate",
    "relief",
    "waterCoverage",
    "continents",
    "coastlineShape",
    "shelf",
  ],
  "morphology-routing": ["knobs"],
  "morphology-erosion": ["knobs", "geomorphicCycle"],
  "morphology-features": ["knobs", "islandChains", "mountainRanges", "volcanoes"],
};

const MORPHOLOGY_STAGE_IDS = [
  "morphology-coasts",
  "morphology-routing",
  "morphology-erosion",
  "morphology-features",
] as const;

const MORPHOLOGY_INTERNAL_STAGE_KEYS = [
  "landmass-plates",
  "rugged-coasts",
  "routing",
  "geomorphology",
  "islands",
  "mountains",
  "landmasses",
];

const HYDROLOGY_PUBLIC_KEYS: Record<string, readonly string[]> = {
  "hydrology-climate-baseline": [
    "knobs",
    "seasonalCycle",
    "solarForcing",
    "thermalState",
    "atmosphericCirculation",
    "oceanCurrents",
    "oceanGeometry",
    "oceanThermalState",
    "evaporation",
    "moistureTransport",
    "precipitation",
  ],
  "hydrology-hydrography": ["knobs", "drainageRouting", "runoff", "riverNetwork", "lakes"],
  "hydrology-climate-refine": [
    "knobs",
    "precipitationRefinement",
    "solarForcing",
    "thermalState",
    "albedoFeedback",
    "cryosphereState",
    "landWaterBudget",
    "diagnostics",
  ],
};

const HYDROLOGY_STAGE_IDS = [
  "hydrology-climate-baseline",
  "hydrology-hydrography",
  "hydrology-climate-refine",
] as const;

const HYDROLOGY_INTERNAL_STAGE_KEYS: Record<string, readonly string[]> = {
  "hydrology-climate-baseline": ["climate-baseline"],
  "hydrology-hydrography": ["rivers"],
  "hydrology-climate-refine": ["climate-refine"],
};

const ECOLOGY_PUBLIC_KEYS: Record<string, readonly string[]> = {
  "ecology-pedology": [
    "knobs",
    "soilClassification",
    "resourceBasinPlanning",
    "resourceBasinScoring",
  ],
  "ecology-biomes": ["knobs", "biomeClassification"],
  "ecology-features": [
    "knobs",
    "substrateScoring",
    "wetlandScoring",
    "reefScoring",
    "iceScoring",
    "icePlanning",
    "reefPlanning",
    "wetlandPlanning",
    "floodplainPlanning",
    "vegetationPlanning",
    "plotEffectScoring",
    "plotEffectCoverage",
  ],
};

const ECOLOGY_STAGE_IDS = [
  "ecology-pedology",
  "ecology-biomes",
  "ecology-features",
] as const;

const ECOLOGY_INTERNAL_STAGE_KEYS: Record<string, readonly string[]> = {
  "ecology-pedology": ["pedology", "resource-basins"],
  "ecology-biomes": ["biomes"],
  "ecology-features": [
    "score-layers",
    "plan-floodplains",
    "plan-ice",
    "plan-reefs",
    "plan-wetlands",
    "plan-vegetation",
    "plan-plot-effects",
  ],
};

const PROJECTION_PUBLIC_KEYS: Record<string, readonly string[]> = {
  "map-morphology": ["knobs"],
  "map-hydrology": ["knobs"],
  "map-elevation": ["knobs"],
  "map-rivers": ["knobs"],
  "map-ecology": ["knobs", "biomeBindings"],
};

const PROJECTION_STAGE_IDS = [
  "map-morphology",
  "map-hydrology",
  "map-elevation",
  "map-rivers",
  "map-ecology",
] as const;

const PROJECTION_INTERNAL_STAGE_KEYS: Record<string, readonly string[]> = {
  "map-morphology": ["plot-coasts", "plot-continents", "plot-mountains", "plot-volcanoes"],
  "map-hydrology": ["lakes"],
  "map-elevation": ["build-elevation"],
  "map-rivers": ["plot-rivers"],
  "map-ecology": ["plot-biomes", "features-apply", "plot-effects"],
};

const PLACEMENT_PUBLIC_KEYS = [
  "knobs",
  "naturalWonders",
  "discoveries",
  "resources",
  "starts",
  "support",
] as const;

const DEFAULT_STARTS_CONFIG = {
  climateExtremePenaltyWeight: 1.5,
  climateWeight: 1.6,
  coastalPreferenceWeight: 0,
  desiredSpacingTiles: 12,
  expansionRadiusTiles: 4,
  fairnessTolerance: 0.3,
  fertilityWeight: 2.2,
  freshwaterWeight: 1.1,
  islandClusterRadiusTiles: 5,
  largeLandmassWeight: 1,
  marginalExpansionRatio: 0.65,
  marginalLandRatio: 0.5,
  maxIslandStartCoastDistance: 1,
  minContiguousLandTiles: 24,
  minExpansionLandTiles: 14,
  minIslandClusterLandTiles: 18,
  rankingBlend: 0.86,
  resourceSupportRadiusTiles: 4,
  resourceSupportWeight: 0.5,
  riverPreferenceWeight: 0,
  roughnessDivisor: 900,
  roughnessPenaltyWeight: 0.6,
  spacingFloorTiles: 6,
  startBiasWeight: 1,
  tierBias: { primary: 0.08, islandCluster: 0.02, marginal: -0.08 },
};

function expectedStartsConfig(raw: CanonicalMapConfigEnvelope) {
  return {
    ...DEFAULT_STARTS_CONFIG,
    ...((raw.config as any).placement?.starts ?? {}),
  };
}

const PLACEMENT_INTERNAL_STAGE_KEYS = [
  "derive-placement-inputs",
  "plot-landmass-regions",
  "place-natural-wonders",
  "prepare-placement-surface",
  "plan-resources",
  "assign-starts",
  "adjust-resources",
  "place-resources",
  "place-discoveries",
  "assign-advanced-starts",
  "placement",
] as const;

function stageProps(schema: unknown, stageId: string): Record<string, unknown> {
  const stage = (schema as { properties?: Record<string, { properties?: Record<string, unknown> }> })
    .properties?.[stageId];
  return stage?.properties ?? {};
}

function hasRawOpEnvelope(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasRawOpEnvelope);
  const obj = value as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(obj, "strategy") && Object.prototype.hasOwnProperty.call(obj, "config")) {
    return true;
  }
  return Object.values(obj).some(hasRawOpEnvelope);
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, stable(child)])
    );
  }
  return value;
}

function collectMissingDescriptions(schema: unknown, path: string[] = []): string[] {
  if (!schema || typeof schema !== "object") return [];
  if (Array.isArray(schema)) {
    return schema.flatMap((item, index) =>
      collectMissingDescriptions(item, [...path, String(index)])
    );
  }
  const node = schema as {
    const?: unknown;
    description?: unknown;
    properties?: Record<string, unknown>;
    items?: unknown;
    anyOf?: unknown[];
    oneOf?: unknown[];
  };
  const missing: string[] = [];
  const literalVariant = Object.prototype.hasOwnProperty.call(node, "const") && !node.properties && !node.items;
  if (path.length > 0 && !literalVariant && typeof node.description !== "string") {
    missing.push(path.join("."));
  }

  for (const [key, child] of Object.entries(node.properties ?? {})) {
    missing.push(...collectMissingDescriptions(child, [...path, key]));
  }
  if (node.items) missing.push(...collectMissingDescriptions(node.items, [...path, "items"]));
  for (const variant of [...(node.anyOf ?? []), ...(node.oneOf ?? [])]) {
    missing.push(...collectMissingDescriptions(variant, path));
  }
  return missing;
}

function collectNumericLeavesMissingRange(schema: unknown, path: string[] = []): string[] {
  if (!schema || typeof schema !== "object") return [];
  if (Array.isArray(schema)) {
    return schema.flatMap((item, index) =>
      collectNumericLeavesMissingRange(item, [...path, String(index)])
    );
  }
  const node = schema as {
    const?: unknown;
    type?: unknown;
    minimum?: unknown;
    maximum?: unknown;
    properties?: Record<string, unknown>;
    items?: unknown;
    anyOf?: unknown[];
    oneOf?: unknown[];
  };
  const missing: string[] = [];
  const literalVariant = Object.prototype.hasOwnProperty.call(node, "const") && !node.properties && !node.items;
  if (
    !literalVariant &&
    (node.type === "number" || node.type === "integer") &&
    (typeof node.minimum !== "number" || typeof node.maximum !== "number")
  ) {
    missing.push(path.join("."));
  }

  for (const [key, child] of Object.entries(node.properties ?? {})) {
    missing.push(...collectNumericLeavesMissingRange(child, [...path, key]));
  }
  if (node.items) missing.push(...collectNumericLeavesMissingRange(node.items, [...path, "items"]));
  for (const variant of [...(node.anyOf ?? []), ...(node.oneOf ?? [])]) {
    missing.push(...collectNumericLeavesMissingRange(variant, path));
  }
  return missing;
}

function collectStringLeavesMissingEnum(schema: unknown, path: string[] = []): string[] {
  if (!schema || typeof schema !== "object") return [];
  if (Array.isArray(schema)) {
    return schema.flatMap((item, index) => collectStringLeavesMissingEnum(item, [...path, String(index)]));
  }
  const node = schema as {
    const?: unknown;
    enum?: unknown;
    type?: unknown;
    properties?: Record<string, unknown>;
    items?: unknown;
    anyOf?: unknown[];
    oneOf?: unknown[];
  };
  const missing: string[] = [];
  const literalVariant = Object.prototype.hasOwnProperty.call(node, "const") && !node.properties && !node.items;
  const enumValues = Array.isArray(node.enum) ? node.enum : null;
  if (
    !literalVariant &&
    node.type === "string" &&
    !(enumValues && enumValues.length > 0 && enumValues.every((value) => typeof value === "string"))
  ) {
    missing.push(path.join("."));
  }

  for (const [key, child] of Object.entries(node.properties ?? {})) {
    missing.push(...collectStringLeavesMissingEnum(child, [...path, key]));
  }
  if (node.items) missing.push(...collectStringLeavesMissingEnum(node.items, [...path, "items"]));
  for (const variant of [...(node.anyOf ?? []), ...(node.oneOf ?? [])]) {
    missing.push(...collectStringLeavesMissingEnum(variant, path));
  }
  return missing;
}

function collectDescriptionsMatching(
  schema: unknown,
  pattern: RegExp,
  path: string[] = []
): string[] {
  if (!schema || typeof schema !== "object") return [];
  if (Array.isArray(schema)) {
    return schema.flatMap((item, index) =>
      collectDescriptionsMatching(item, pattern, [...path, String(index)])
    );
  }
  const node = schema as {
    description?: unknown;
    properties?: Record<string, unknown>;
    items?: unknown;
    anyOf?: unknown[];
    oneOf?: unknown[];
  };
  const matches: string[] = [];
  if (typeof node.description === "string" && pattern.test(node.description)) {
    matches.push(path.join("."));
  }

  for (const [key, child] of Object.entries(node.properties ?? {})) {
    matches.push(...collectDescriptionsMatching(child, pattern, [...path, key]));
  }
  if (node.items) matches.push(...collectDescriptionsMatching(node.items, pattern, [...path, "items"]));
  for (const variant of [...(node.anyOf ?? []), ...(node.oneOf ?? [])]) {
    matches.push(...collectDescriptionsMatching(variant, pattern, path));
  }
  return matches;
}

function expectPublicStageDescription(schema: unknown, stageId: string): void {
  const stage = (schema as { properties?: Record<string, { description?: unknown }> }).properties?.[
    stageId
  ];
  expect(typeof stage?.description, `${stageId} must define description`).toBe("string");
  expect(stage?.description, `${stageId} description must stay author-facing`).not.toMatch(
    /(step\/op|envelope|internal)/i
  );
}

describe("Shipped map configs", () => {
  it("stay canonical, complete, and schema-valid (prevents Civ pipeline compile failures)", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [fileName, raw] of shippedMapConfigs) {
      const validated = validateCanonicalMapConfig({
        fileName,
        raw,
        recipeSchema: schema,
        stages: STANDARD_STAGES,
      });
      expect(validated.id).toBe(fileName.replace(/\.config\.json$/, ""));
    }
  });

  it("keeps mountain-rivers-patch as a visible-river projection comparison config", () => {
    const normalizeComparison = (raw: CanonicalMapConfigEnvelope) => {
      const copy = JSON.parse(JSON.stringify(raw)) as Record<string, any>;
      delete copy.id;
      delete copy.name;
      delete copy.description;
      delete copy.sortIndex;
      delete copy.config?.["map-rivers"]?.knobs?.riverDensity;
      delete copy.config?.["map-rivers"]?.knobs?.navigableRiverDensity;
      return stable(copy);
    };

    expect(mountainPatchConfig.id).toBe("mountain-patch");
    expect(mountainRiversPatchConfig.id).toBe("mountain-rivers-patch");
    expect((mountainPatchConfig.config as any)["map-rivers"].knobs.riverDensity).toBeUndefined();
    expect((mountainPatchConfig.config as any)["map-rivers"].knobs.navigableRiverDensity).toBe("normal");
    expect((mountainRiversPatchConfig.config as any)["map-rivers"].knobs.riverDensity).toBeUndefined();
    expect((mountainRiversPatchConfig.config as any)["map-rivers"].knobs.navigableRiverDensity).toBe("normal");
    expect(normalizeComparison(mountainRiversPatchConfig)).toEqual(
      normalizeComparison(mountainPatchConfig)
    );
  });

  it("keeps shipped map-rivers configs on the current navigableRiverDensity knob surface", () => {
    for (const [fileName, raw] of mapCatalogConfigs) {
      const mapRiversKnobs = (raw.config as any)["map-rivers"]?.knobs ?? {};
      const usesLegacyAlias = Object.prototype.hasOwnProperty.call(mapRiversKnobs, "riverDensity");
      const usesCurrentKnob = Object.prototype.hasOwnProperty.call(
        mapRiversKnobs,
        "navigableRiverDensity"
      );
      expect(usesLegacyAlias, `${fileName} must not use the legacy density alias`).toBe(false);
      expect(
        usesCurrentKnob || Object.keys(mapRiversKnobs).length === 0,
        `${fileName} must use navigableRiverDensity or no density knob`
      ).toBe(true);
    }
  });

  it("exposes Morphology public schema keys instead of internal step/op envelope paths", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [stageId, expectedKeys] of Object.entries(MORPHOLOGY_PUBLIC_KEYS)) {
      const props = stageProps(schema, stageId);
      expect(Object.keys(props).sort()).toEqual([...expectedKeys].sort());
      for (const internalKey of MORPHOLOGY_INTERNAL_STAGE_KEYS) {
        expect(props).not.toHaveProperty(internalKey);
      }
      expect(JSON.stringify(props)).not.toContain("\"strategy\"");
      expect(JSON.stringify(props)).not.toContain("\"config\"");
    }
  });

  it("exposes Hydrology public schema keys instead of internal step/op envelope paths", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [stageId, expectedKeys] of Object.entries(HYDROLOGY_PUBLIC_KEYS)) {
      const props = stageProps(schema, stageId);
      expect(Object.keys(props).sort()).toEqual([...expectedKeys].sort());
      for (const internalKey of HYDROLOGY_INTERNAL_STAGE_KEYS[stageId] ?? []) {
        expect(props).not.toHaveProperty(internalKey);
      }
      expect(JSON.stringify(props)).not.toContain("\"strategy\"");
      expect(JSON.stringify(props)).not.toContain("\"config\"");
    }
  });

  it("exposes Ecology public schema keys instead of internal step/op envelope paths", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [stageId, expectedKeys] of Object.entries(ECOLOGY_PUBLIC_KEYS)) {
      const props = stageProps(schema, stageId);
      expect(Object.keys(props).sort()).toEqual([...expectedKeys].sort());
      for (const internalKey of ECOLOGY_INTERNAL_STAGE_KEYS[stageId] ?? []) {
        expect(props).not.toHaveProperty(internalKey);
      }
      expect(JSON.stringify(props)).not.toContain("\"strategy\"");
      expect(JSON.stringify(props)).not.toContain("\"config\"");
    }
  });

  it("exposes Projection public schema keys instead of runtime step/op envelope paths", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [stageId, expectedKeys] of Object.entries(PROJECTION_PUBLIC_KEYS)) {
      const props = stageProps(schema, stageId);
      expect(Object.keys(props).sort()).toEqual([...expectedKeys].sort());
      for (const internalKey of PROJECTION_INTERNAL_STAGE_KEYS[stageId] ?? []) {
        expect(props).not.toHaveProperty(internalKey);
      }
      expect(JSON.stringify(props)).not.toContain("\"strategy\"");
      expect(JSON.stringify(props)).not.toContain("\"config\"");
    }
  });

  it("exposes Placement public schema keys instead of runtime step/op envelope paths", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const props = stageProps(schema, "placement");

    expect(Object.keys(props).sort()).toEqual([...PLACEMENT_PUBLIC_KEYS].sort());
    for (const internalKey of PLACEMENT_INTERNAL_STAGE_KEYS) {
      expect(props).not.toHaveProperty(internalKey);
    }
    expect(JSON.stringify(props)).not.toContain("\"strategy\"");
    expect(JSON.stringify(props)).not.toContain("\"config\"");
    expect(JSON.stringify(props)).not.toContain("candidateResourceTypes");
    expect(JSON.stringify(props)).not.toContain("startSectors");
  });

  it("documents and range-bounds every Morphology public numeric field", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [stageId, expectedKeys] of Object.entries(MORPHOLOGY_PUBLIC_KEYS)) {
      expectPublicStageDescription(schema, stageId);
      const props = stageProps(schema, stageId);
      for (const key of expectedKeys) {
        const child = props[key];
        expect(collectMissingDescriptions(child, [stageId, key])).toEqual([]);
        expect(collectNumericLeavesMissingRange(child, [stageId, key])).toEqual([]);
        expect(collectDescriptionsMatching(child, /\b(step\/op|envelope|internal|strategy)\b/i, [
          stageId,
          key,
        ])).toEqual([]);
      }
    }
  });

  it("documents and range-bounds every Hydrology public numeric field", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [stageId, expectedKeys] of Object.entries(HYDROLOGY_PUBLIC_KEYS)) {
      expectPublicStageDescription(schema, stageId);
      const props = stageProps(schema, stageId);
      for (const key of expectedKeys) {
        const child = props[key];
        expect(collectMissingDescriptions(child, [stageId, key])).toEqual([]);
        expect(collectNumericLeavesMissingRange(child, [stageId, key])).toEqual([]);
        expect(collectDescriptionsMatching(child, /\b(step|op|envelope|internal|strategy)\b/i, [
          stageId,
          key,
        ])).toEqual([]);
      }
    }
  });

  it("documents and range-bounds every Ecology public numeric field", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [stageId, expectedKeys] of Object.entries(ECOLOGY_PUBLIC_KEYS)) {
      expectPublicStageDescription(schema, stageId);
      const props = stageProps(schema, stageId);
      for (const key of expectedKeys) {
        const child = props[key];
        expect(collectMissingDescriptions(child, [stageId, key])).toEqual([]);
        expect(collectNumericLeavesMissingRange(child, [stageId, key])).toEqual([]);
        expect(collectDescriptionsMatching(child, /\b(step|op|envelope|internal|strategy)\b/i, [
          stageId,
          key,
        ])).toEqual([]);
      }
    }
  });

  it("documents and bounds every Projection public field", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [stageId, expectedKeys] of Object.entries(PROJECTION_PUBLIC_KEYS)) {
      expectPublicStageDescription(schema, stageId);
      const props = stageProps(schema, stageId);
      for (const key of expectedKeys) {
        const child = props[key];
        expect(collectMissingDescriptions(child, [stageId, key])).toEqual([]);
        expect(collectNumericLeavesMissingRange(child, [stageId, key])).toEqual([]);
        expect(collectStringLeavesMissingEnum(child, [stageId, key])).toEqual([]);
        expect(collectDescriptionsMatching(child, /\b(step|op|envelope|internal|strategy)\b/i, [
          stageId,
          key,
        ])).toEqual([]);
      }
    }
  });

  it("documents and bounds every Placement public field", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    expectPublicStageDescription(schema, "placement");
    const props = stageProps(schema, "placement");
    for (const key of PLACEMENT_PUBLIC_KEYS) {
      const child = props[key];
      expect(collectMissingDescriptions(child, ["placement", key])).toEqual([]);
      expect(collectNumericLeavesMissingRange(child, ["placement", key])).toEqual([]);
      expect(collectDescriptionsMatching(child, /\b(step|op|envelope|internal|strategy)\b/i, [
        "placement",
        key,
      ])).toEqual([]);
    }
  });

  it("exposes Foundation public schema keys instead of internal step/op envelope paths", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const props = stageProps(schema, "foundation");

    expect(Object.keys(props).sort()).toEqual([...FOUNDATION_PUBLIC_KEYS].sort());
    for (const internalKey of FOUNDATION_INTERNAL_STAGE_KEYS) {
      expect(props).not.toHaveProperty(internalKey);
    }
    const meshResolutionProps =
      (props.meshResolution as { properties?: Record<string, unknown> }).properties ?? {};
    expect(meshResolutionProps).not.toHaveProperty("cellCount");
    expect(meshResolutionProps).not.toHaveProperty("referenceArea");
    expect(meshResolutionProps).not.toHaveProperty("plateScalePower");
    const platePartitionProps =
      (props.platePartition as { properties?: Record<string, unknown> }).properties ?? {};
    expect(platePartitionProps).not.toHaveProperty("referenceArea");
    expect(platePartitionProps).not.toHaveProperty("plateScalePower");
    expect(JSON.stringify(props)).not.toContain("\"strategy\"");
    expect(JSON.stringify(props)).not.toContain("\"config\"");
  });

  it("documents every Foundation public schema field", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const props = stageProps(schema, "foundation");
    const missing = Object.entries(props).flatMap(([key, child]) =>
      collectMissingDescriptions(child, ["foundation", key])
    );

    expect(missing).toEqual([]);
  });

  it("keeps shipped Foundation configs on the semantic public surface", () => {
    for (const [, raw] of shippedMapConfigs) {
      const stageConfig = (raw.config as Record<string, Record<string, unknown>>).foundation ?? {};
      for (const key of Object.keys(stageConfig)) {
        expect(FOUNDATION_PUBLIC_KEYS).toContain(key as (typeof FOUNDATION_PUBLIC_KEYS)[number]);
      }
      for (const internalKey of FOUNDATION_INTERNAL_STAGE_KEYS) {
        expect(stageConfig).not.toHaveProperty(internalKey);
      }
      expect(hasRawOpEnvelope(stageConfig)).toBe(false);
    }
  });

  it("keeps shipped Morphology configs on the semantic public surface", () => {
    for (const [, raw] of shippedMapConfigs) {
      for (const [stageId, expectedKeys] of Object.entries(MORPHOLOGY_PUBLIC_KEYS)) {
        const stageConfig = (raw.config as Record<string, Record<string, unknown>>)[stageId] ?? {};
        for (const key of Object.keys(stageConfig)) {
          expect(expectedKeys).toContain(key);
        }
        expect(hasRawOpEnvelope(stageConfig)).toBe(false);
      }
    }
  });

  it("keeps shipped Hydrology configs on the semantic public surface", () => {
    for (const [, raw] of shippedMapConfigs) {
      for (const [stageId, expectedKeys] of Object.entries(HYDROLOGY_PUBLIC_KEYS)) {
        const stageConfig = (raw.config as Record<string, Record<string, unknown>>)[stageId] ?? {};
        for (const key of Object.keys(stageConfig)) {
          expect(expectedKeys).toContain(key);
        }
        expect(hasRawOpEnvelope(stageConfig)).toBe(false);
      }
    }
  });

  it("keeps shipped Ecology configs on the semantic public surface", () => {
    for (const [, raw] of shippedMapConfigs) {
      for (const [stageId, expectedKeys] of Object.entries(ECOLOGY_PUBLIC_KEYS)) {
        const stageConfig = (raw.config as Record<string, Record<string, unknown>>)[stageId] ?? {};
        for (const key of Object.keys(stageConfig)) {
          expect(expectedKeys).toContain(key);
        }
        for (const internalKey of ECOLOGY_INTERNAL_STAGE_KEYS[stageId] ?? []) {
          expect(stageConfig).not.toHaveProperty(internalKey);
        }
        expect(hasRawOpEnvelope(stageConfig)).toBe(false);
      }
    }
  });

  it("keeps shipped Projection configs on the semantic public surface", () => {
    for (const [, raw] of shippedMapConfigs) {
      for (const [stageId, expectedKeys] of Object.entries(PROJECTION_PUBLIC_KEYS)) {
        const stageConfig = (raw.config as Record<string, Record<string, unknown>>)[stageId] ?? {};
        for (const key of Object.keys(stageConfig)) {
          expect(expectedKeys).toContain(key);
        }
        for (const internalKey of PROJECTION_INTERNAL_STAGE_KEYS[stageId] ?? []) {
          expect(stageConfig).not.toHaveProperty(internalKey);
        }
        expect(hasRawOpEnvelope(stageConfig)).toBe(false);
      }
    }
  });

  it("keeps shipped Placement configs on the semantic public surface", () => {
    for (const [, raw] of shippedMapConfigs) {
      const stageConfig = (raw.config as Record<string, Record<string, unknown>>).placement ?? {};
      for (const key of Object.keys(stageConfig)) {
        expect(PLACEMENT_PUBLIC_KEYS).toContain(key as (typeof PLACEMENT_PUBLIC_KEYS)[number]);
      }
      for (const internalKey of PLACEMENT_INTERNAL_STAGE_KEYS) {
        expect(stageConfig).not.toHaveProperty(internalKey);
      }
      expect(hasRawOpEnvelope(stageConfig)).toBe(false);
      expect(JSON.stringify(stageConfig)).not.toContain("candidateResourceTypes");
      expect(JSON.stringify(stageConfig)).not.toContain("startSectors");
    }
  });

  it("compiles public Morphology config to internal executable step/op envelopes", () => {
    const compiled = standardRecipe.compileConfig(
      {
        seed: 123,
        dimensions: { width: 80, height: 60 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      },
      swooperEarthlikeConfig.config
    ) as any;

    expect(compiled["morphology-coasts"]["landmass-plates"].seaLevel.strategy).toBe("default");
    expect(compiled["morphology-coasts"]["rugged-coasts"].coastlines.strategy).toBe("default");
    expect(compiled["morphology-routing"].routing.routing.strategy).toBe("default");
    expect(compiled["morphology-erosion"].geomorphology.geomorphology.strategy).toBe("default");
    expect(compiled["morphology-features"].islands.islands.strategy).toBe("default");
    expect(compiled["morphology-features"].mountains.ridges.strategy).toBe("default");
    expect(compiled["morphology-features"].mountains.foothills.strategy).toBe("default");
    expect(compiled["morphology-features"].volcanoes.volcanoes.strategy).toBe("default");
  });

  it("compiles public Hydrology config to internal executable step/op envelopes", () => {
    const compiled = standardRecipe.compileConfig(
      {
        seed: 123,
        dimensions: { width: 80, height: 60 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      },
      swooperEarthlikeConfig.config
    ) as any;

    expect(compiled["hydrology-climate-baseline"]["climate-baseline"].computeRadiativeForcing.strategy).toBe(
      "default"
    );
    expect(compiled["hydrology-climate-baseline"]["climate-baseline"].computeAtmosphericCirculation.strategy).toBe(
      "default"
    );
    expect(compiled["hydrology-climate-baseline"]["climate-baseline"].computePrecipitation.strategy).toBe(
      "default"
    );
    expect(compiled["hydrology-hydrography"].rivers.accumulateDischarge.strategy).toBe("default");
    expect(compiled["hydrology-hydrography"].rivers.projectRiverNetwork.strategy).toBe("default");
    expect(compiled["hydrology-hydrography"].lakes.planLakes.strategy).toBe("default");
    expect(compiled["hydrology-climate-refine"]["climate-refine"].computePrecipitation.strategy).toBe(
      "refine"
    );
    expect(compiled["hydrology-climate-refine"]["climate-refine"].computeCryosphereState.strategy).toBe(
      "default"
    );
  });

  it("compiles public Ecology config to internal executable step/op envelopes", () => {
    const compiled = standardRecipe.compileConfig(
      {
        seed: 123,
        dimensions: { width: 80, height: 60 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      },
      swooperEarthlikeConfig.config
    ) as any;

    expect(compiled["ecology-pedology"].pedology.classify.strategy).toBe("orogeny-boosted");
    expect(compiled["ecology-pedology"]["resource-basins"].plan.strategy).toBe("mixed");
    expect(compiled["ecology-pedology"]["resource-basins"].score.strategy).toBe("default");
    expect(compiled["ecology-biomes"].biomes.classify.strategy).toBe("default");
    expect(compiled["ecology-features"]["score-layers"].vegetationSubstrate.strategy).toBe(
      "default"
    );
    expect(compiled["ecology-features"]["score-layers"].scoreForest.strategy).toBe("default");
    expect(compiled["ecology-features"]["plan-ice"].planIce.strategy).toBe("continentality");
    expect(compiled["ecology-features"]["plan-reefs"].planReefs.strategy).toBe("default");
    expect(compiled["ecology-features"]["plan-wetlands"].planWetlands.strategy).toBe("default");
    expect(compiled["ecology-features"]["plan-vegetation"].planVegetation.strategy).toBe(
      "default"
    );
    expect(compiled["ecology-features"]["plan-plot-effects"].plotEffects.strategy).toBe("default");
    expect(
      compiled["ecology-features"]["plan-plot-effects"].plotEffects.config.snow.selectors.light
        .typeName
    ).toBe("PLOTEFFECT_SNOW_LIGHT_PERMANENT");

    const profileOnlyCompiled = standardRecipe.compileConfig(
      {
        seed: 123,
        dimensions: { width: 80, height: 60 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      },
      {
        "ecology-features": {
          reefPlanning: {
            profile: "shippingLanes",
          },
        },
      } as any
    ) as any;
    expect(profileOnlyCompiled["ecology-features"]["plan-reefs"].planReefs.strategy).toBe(
      "shipping-lanes"
    );
    expect(profileOnlyCompiled["ecology-features"]["plan-reefs"].planReefs.config.stride).toBe(5);
  });

  it("compiles public Projection config to internal executable step/op configs", () => {
    const compiled = standardRecipe.compileConfig(
      {
        seed: 123,
        dimensions: { width: 80, height: 60 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      },
      swooperEarthlikeConfig.config
    ) as any;

    expect(compiled["map-morphology"]["plot-coasts"]).toEqual({});
    expect(compiled["map-morphology"]["plot-continents"]).toEqual({});
    expect(compiled["map-morphology"]["plot-mountains"]).toEqual({});
    expect(compiled["map-morphology"]["plot-volcanoes"]).toEqual({});
    expect(compiled["map-hydrology"].lakes.projectionReadback).toBe(true);
    expect(compiled["map-elevation"]["build-elevation"]).toEqual({});
    expect(compiled["map-rivers"]["plot-rivers"]).toEqual({
      selectNavigableRiverTerrain: {
        strategy: "default",
        config: { endpointDischargePercentileMin: 0.94, targetMajorTileFraction: 0.28 },
      },
    });
    expect(compiled["map-ecology"]["plot-biomes"].bindings.tropicalSeasonal).toBe("BIOME_PLAINS");
    expect(compiled["map-ecology"]["plot-biomes"].bindings.marine).toBe("BIOME_MARINE");
    expect(compiled["map-ecology"]["features-apply"].apply).toEqual({
      strategy: "default",
      config: { maxPerTile: 1 },
    });
    expect(compiled["map-ecology"]["plot-effects"]).toEqual({});

    const defaultBindingsCompiled = standardRecipe.compileConfig(
      {
        seed: 123,
        dimensions: { width: 80, height: 60 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      },
      {
        "map-ecology": {
          biomeBindings: {},
        },
      } as any
    ) as any;
    expect(defaultBindingsCompiled["map-ecology"]["plot-biomes"].bindings.tropicalSeasonal).toBe(
      "BIOME_PLAINS"
    );
    expect(defaultBindingsCompiled["map-ecology"]["plot-biomes"].bindings.marine).toBe(
      "BIOME_MARINE"
    );
  });

  it("compiles public Placement config to internal executable step/op configs", () => {
    const compiled = standardRecipe.compileConfig(
      {
        seed: 123,
        dimensions: { width: 80, height: 60 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      },
      swooperEarthlikeConfig.config
    ) as any;

    expect(compiled.placement["derive-placement-inputs"].wonders).toEqual({
      strategy: "default",
      config: {},
    });
    expect(compiled.placement["derive-placement-inputs"].naturalWonders).toEqual({
      strategy: "default",
      config: { minSpacingTiles: 6 },
    });
    expect(compiled.placement["derive-placement-inputs"].discoveries).toEqual({
      strategy: "default",
      config: { densityPer100Tiles: 3, minSpacingTiles: 3 },
    });
    expect(compiled.placement["derive-placement-inputs"].resources).toBeUndefined();
    expect(compiled.placement["plan-resources"].selectSites.strategy).toBe("default");
    expect(compiled.placement["plan-resources"].selectSites.config).toMatchObject({
      density: 1,
      sparsity: 0,
      rarityFidelity: 1,
      siteSpacingTiles: 3,
    });
    expect(compiled.placement["derive-placement-inputs"].starts).toBeUndefined();
    expect(compiled.placement["assign-starts"].starts).toEqual({
      strategy: "default",
      config: expectedStartsConfig(swooperEarthlikeConfig),
    });
    expect(compiled.placement["plot-landmass-regions"]).toEqual({});
    expect(compiled.placement["place-natural-wonders"]).toEqual({});
    expect(compiled.placement["prepare-placement-surface"]).toEqual({});
    expect(compiled.placement["place-resources"]).toEqual({});
    expect(compiled.placement["plan-resources"].habitat).toEqual({
      strategy: "default",
      config: {},
    });
    expect(compiled.placement["place-discoveries"]).toEqual({});
    expect(compiled.placement["assign-advanced-starts"]).toEqual({});
    expect(compiled.placement.placement).toEqual({});
  });

  it("compiles public Foundation config to internal executable step/op envelopes", () => {
    const compiled = standardRecipe.compileConfig(
      {
        seed: 123,
        dimensions: { width: 80, height: 60 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      },
      swooperEarthlikeConfig.config
    ) as any;

    expect(compiled.foundation.mesh.computeMesh.strategy).toBe("default");
    expect(compiled.foundation["mantle-potential"].computeMantlePotential.strategy).toBe(
      "default"
    );
    expect(compiled.foundation["mantle-forcing"].computeMantleForcing.strategy).toBe("default");
    expect(compiled.foundation.crust.computeCrust.strategy).toBe("default");
    expect(compiled.foundation["plate-graph"].computePlateGraph.strategy).toBe("default");
    expect(compiled.foundation["plate-motion"].computePlateMotion.strategy).toBe("default");
    expect(compiled.foundation.tectonics.computeTectonicSegments.strategy).toBe("default");
    expect(compiled.foundation.tectonics.computeEraPlateMembership.strategy).toBe("default");
    expect(compiled.foundation.tectonics.computeEraTectonicFields.strategy).toBe("default");
    expect(compiled.foundation.tectonics.computeTectonicHistoryRollups.strategy).toBe("default");
    expect(compiled.foundation.projection.computePlates.strategy).toBe("default");
    expect(compiled.foundation["plate-topology"]).toEqual({});
  });

  it("keeps migrated Foundation configs compiled-equivalent to the legacy shipped configs", () => {
    const env = {
      seed: 123,
      dimensions: { width: 80, height: 60 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };
    const expected = legacyFoundationCompiled as Record<string, unknown>;

    for (const [fileName, raw] of shippedMapConfigs) {
      const id = fileName.replace(/\.config\.json$/, "");
      const compiled = standardRecipe.compileConfig(env, raw.config) as any;
      expect(stable(compiled.foundation)).toEqual(expected[id]);
    }
  });

  it("keeps Morphology configs compiled-equivalent while schema docs and ranges tighten", () => {
    const env = {
      seed: 123,
      dimensions: { width: 80, height: 60 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };
    const expected = legacyMorphologyCompiled as Record<string, unknown>;

    for (const [fileName, raw] of shippedMapConfigs) {
      const id = fileName.replace(/\.config\.json$/, "");
      const compiled = standardRecipe.compileConfig(env, raw.config) as any;
      const morphologyCompiled = Object.fromEntries(
        MORPHOLOGY_STAGE_IDS.map((stageId) => [stageId, compiled[stageId]])
      );
      expect(stable(morphologyCompiled)).toEqual(expected[id]);
    }
  });

  it("keeps Hydrology configs compiled-equivalent to the legacy shipped configs", () => {
    const env = {
      seed: 123,
      dimensions: { width: 80, height: 60 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };
    const expected = legacyHydrologyCompiled as Record<string, unknown>;

    for (const [fileName, raw] of shippedMapConfigs) {
      const id = fileName.replace(/\.config\.json$/, "");
      const compiled = standardRecipe.compileConfig(env, raw.config) as any;
      const hydrologyCompiled = Object.fromEntries(
        HYDROLOGY_STAGE_IDS.map((stageId) => [stageId, compiled[stageId]])
      );
      expect(stable(hydrologyCompiled)).toEqual(expected[id]);
    }
  });

  it("keeps Ecology configs compiled-equivalent after accepted peer-repair threshold updates", () => {
    const env = {
      seed: 123,
      dimensions: { width: 80, height: 60 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };
    const expected = legacyEcologyCompiled as Record<string, unknown>;

    for (const [fileName, raw] of shippedMapConfigs) {
      const id = fileName.replace(/\.config\.json$/, "");
      const compiled = standardRecipe.compileConfig(env, raw.config) as any;
      const ecologyCompiled = Object.fromEntries(
        ECOLOGY_STAGE_IDS.map((stageId) => [stageId, compiled[stageId]])
      );
      expect(stable(ecologyCompiled)).toEqual(expected[id]);
    }
  });

  it("keeps Projection configs compiled-equivalent to the legacy shipped configs", () => {
    const env = {
      seed: 123,
      dimensions: { width: 80, height: 60 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };
    const expected = legacyProjectionCompiled as Record<string, unknown>;

    for (const [fileName, raw] of shippedMapConfigs) {
      const id = fileName.replace(/\.config\.json$/, "");
      const compiled = standardRecipe.compileConfig(env, raw.config) as any;
      const projectionCompiled = Object.fromEntries(
        PROJECTION_STAGE_IDS.map((stageId) => [stageId, compiled[stageId]])
      );
      expect(stable(projectionCompiled)).toEqual(expected[id]);
    }
  });

  it("keeps non-start Placement configs legacy-equivalent while assigning start planning to assign-starts", () => {
    const env = {
      seed: 123,
      dimensions: { width: 80, height: 60 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };
    const expected = legacyPlacementCompiled as Record<string, unknown>;

    for (const [fileName, raw] of shippedMapConfigs) {
      const id = fileName.replace(/\.config\.json$/, "");
      const compiled = standardRecipe.compileConfig(env, raw.config) as any;
      const observedPlacement = stable(compiled.placement) as any;
      const expectedPlacement = stable(expected[id]) as any;
      delete observedPlacement["assign-starts"].starts;
      delete expectedPlacement.placement["derive-placement-inputs"].starts;
      expect({ placement: observedPlacement }).toEqual(expectedPlacement);
      expect(compiled.placement["derive-placement-inputs"].starts).toBeUndefined();
      expect(compiled.placement["assign-starts"].starts).toEqual({
        strategy: "default",
        config: expectedStartsConfig(raw),
      });
    }
  });

  it("rejects legacy map-morphology alias keys", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-morphology": {
          "plot-coasts": {},
          "plot-continents": {},
          "plot-mountains": {},
          "plot-volcanoes": {},
          plotCoasts: {},
          plotContinents: {},
          mountains: {},
          volcanoes: {},
          plotVolcanoes: {},
          buildElevation: {},
        },
      },
      "/maps/legacy-map-morphology"
    );

    const errorPaths = errors.map((error) => error.path);
    expect(errorPaths).toEqual(
      expect.arrayContaining([
        "/maps/legacy-map-morphology/map-morphology/plotCoasts",
        "/maps/legacy-map-morphology/map-morphology/plotContinents",
        "/maps/legacy-map-morphology/map-morphology/plot-coasts",
        "/maps/legacy-map-morphology/map-morphology/plot-continents",
        "/maps/legacy-map-morphology/map-morphology/plot-mountains",
        "/maps/legacy-map-morphology/map-morphology/plot-volcanoes",
        "/maps/legacy-map-morphology/map-morphology/mountains",
        "/maps/legacy-map-morphology/map-morphology/volcanoes",
        "/maps/legacy-map-morphology/map-morphology/plotVolcanoes",
        "/maps/legacy-map-morphology/map-morphology/buildElevation",
      ])
    );
  });

  it("rejects raw Projection step and op envelope config", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-hydrology": {
          lakes: { projectionReadback: true },
        },
        "map-rivers": {
          "plot-rivers": {
            selectNavigableRiverTerrain: {
              strategy: "default",
              config: { endpointDischargePercentileMin: 0.94, targetMajorTileFraction: 0.28 },
            },
          },
        },
        "map-elevation": {
          "build-elevation": {},
        },
        "map-ecology": {
          "plot-biomes": { bindings: { tropicalSeasonal: "BIOME_PLAINS" } },
          "features-apply": { apply: { strategy: "default", config: { maxPerTile: 1 } } },
          "plot-effects": {},
        },
      },
      "/maps/raw-projection-config"
    );

    const errorPaths = errors.map((error) => error.path);
    expect(errorPaths).toEqual(
      expect.arrayContaining([
        "/maps/raw-projection-config/map-hydrology/lakes",
        "/maps/raw-projection-config/map-rivers/plot-rivers",
        "/maps/raw-projection-config/map-elevation/build-elevation",
        "/maps/raw-projection-config/map-ecology/plot-biomes",
        "/maps/raw-projection-config/map-ecology/features-apply",
        "/maps/raw-projection-config/map-ecology/plot-effects",
      ])
    );
  });

  it("rejects raw Placement step and op envelope config", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        placement: {
          "derive-placement-inputs": {
            resources: {
              strategy: "default",
              config: {
                candidateResourceTypes: [1, 2, 3],
                densityPer100Tiles: 10,
              },
            },
            starts: {
              strategy: "default",
              config: { overrides: { startSectors: [] } },
            },
          },
          "plot-landmass-regions": {},
          "place-natural-wonders": {},
          "prepare-placement-surface": {},
          "place-resources": {},
          "assign-starts": {},
          "place-discoveries": {},
          "assign-advanced-starts": {},
        },
      },
      "/maps/raw-placement-config"
    );

    const errorPaths = errors.map((error) => error.path);
    expect(errorPaths).toEqual(
      expect.arrayContaining([
        "/maps/raw-placement-config/placement/derive-placement-inputs",
        "/maps/raw-placement-config/placement/plot-landmass-regions",
        "/maps/raw-placement-config/placement/place-natural-wonders",
        "/maps/raw-placement-config/placement/prepare-placement-surface",
        "/maps/raw-placement-config/placement/place-resources",
        "/maps/raw-placement-config/placement/assign-starts",
        "/maps/raw-placement-config/placement/place-discoveries",
        "/maps/raw-placement-config/placement/assign-advanced-starts",
      ])
    );
  });

  it("rejects Placement runtime/catalog owner leakage", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        placement: {
          resources: {
            candidateResourceTypes: [1, 2, 3],
          },
          starts: {
            overrides: { startSectors: [] },
          },
        },
      },
      "/maps/placement-owner-leakage"
    );

    const errorPaths = errors.map((error) => error.path);
    expect(errorPaths).toEqual(
      expect.arrayContaining([
        "/maps/placement-owner-leakage/placement/resources/candidateResourceTypes",
        "/maps/placement-owner-leakage/placement/starts/overrides",
      ])
    );
  });

  it("rejects invalid Projection biome bindings", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-ecology": {
          biomeBindings: {
            marine: "BIOME_DESERT",
          },
        },
      },
      "/maps/invalid-projection-biomes"
    );

    expect(errors.map((error) => error.path)).toEqual(
      expect.arrayContaining(["/maps/invalid-projection-biomes/map-ecology/biomeBindings/marine"])
    );
  });

  it("rejects retired map-hydrology river config", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-hydrology": {
          knobs: { riverDensity: "dense" },
          "plot-rivers": {
            selectNavigableRiverTerrain: {
              strategy: "default",
              config: { endpointDischargePercentileMin: 0.94, targetMajorTileFraction: 0.28 },
            },
          },
        },
      },
      "/maps/legacy-map-hydrology-rivers"
    );

    const errorPaths = errors.map((error) => error.path);
    expect(errorPaths).toEqual(
      expect.arrayContaining([
        "/maps/legacy-map-hydrology-rivers/map-hydrology/knobs/riverDensity",
        "/maps/legacy-map-hydrology-rivers/map-hydrology/plot-rivers",
      ])
    );
  });

  it("rejects retired map-rivers riverDensity alias", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-rivers": {
          knobs: { riverDensity: "dense" },
        },
      },
      "/maps/legacy-map-rivers-alias"
    );

    expect(errors.map((error) => error.path)).toEqual(
      expect.arrayContaining(["/maps/legacy-map-rivers-alias/map-rivers/knobs/riverDensity"])
    );
  });

  it("rejects morphology truth config under map projection stages", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-morphology": {
          knobs: { orogeny: "high" },
          "plot-mountains": {
            ridges: { strategy: "default" },
          },
        },
      },
      "/maps/map-projection-truth-config"
    );

    const errorPaths = errors.map((error) => error.path);
    expect(errorPaths).toEqual(
      expect.arrayContaining([
        "/maps/map-projection-truth-config/map-morphology/knobs/orogeny",
        "/maps/map-projection-truth-config/map-morphology/plot-mountains",
      ])
    );
  });
});
