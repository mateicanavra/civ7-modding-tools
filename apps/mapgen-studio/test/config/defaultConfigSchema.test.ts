import { describe, expect, it } from "vitest";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

import {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
  studioRecipeUiMeta as STANDARD_RECIPE_UI_META,
} from "mod-swooper-maps/recipes/standard-artifacts";
import { defaultConfig as SOURCE_UI_DEFAULT_CONFIG } from "../../src/ui/data/defaultConfig";

function getSchemaAtPath(schema: unknown, path: readonly string[]): unknown {
  let current: any = schema as any;
  for (const segment of path) {
    if (!current || typeof current !== "object") {
      throw new Error(`Schema missing path: ${path.join(".")}`);
    }

    const directProps = (current as any).properties;
    if (directProps && typeof directProps === "object" && segment in directProps) {
      current = (directProps as any)[segment];
      continue;
    }

    const variants = (Array.isArray((current as any).anyOf) ? (current as any).anyOf :
      Array.isArray((current as any).oneOf) ? (current as any).oneOf :
        null) as any[] | null;
    if (variants) {
      const match = variants.find((variant) => {
        const vProps = variant?.properties;
        return vProps && typeof vProps === "object" && segment in vProps;
      });
      if (match) {
        current = (match as any).properties[segment];
        continue;
      }
    }

    throw new Error(`Schema missing path: ${path.join(".")}`);
  }
  return current;
}

function expectSchemaHasDescription(schema: unknown, label: string) {
  const node = schema as any;
  expect(typeof node.description, `${label} must define description`).toBe("string");
  expect((node.description as string).trim().length, `${label} description must be non-empty`).toBeGreaterThan(0);
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

function hasRawOpEnvelope(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasRawOpEnvelope);
  const obj = value as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(obj, "strategy") && Object.prototype.hasOwnProperty.call(obj, "config")) {
    return true;
  }
  return Object.values(obj).some(hasRawOpEnvelope);
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

describe("Studio default config", () => {
  it("validates against the standard recipe schema (prevents UI drift)", () => {
    const { errors } = normalizeStrict<Record<string, unknown>>(STANDARD_RECIPE_CONFIG_SCHEMA, STANDARD_RECIPE_CONFIG, "/defaultConfig");
    expect(errors).toEqual([]);
  });

  it("keeps the default config on the public authoring surface", () => {
    expect(STANDARD_RECIPE_CONFIG.foundation).not.toHaveProperty("version");
    expect(STANDARD_RECIPE_CONFIG.foundation).not.toHaveProperty("profiles");
    expect(STANDARD_RECIPE_CONFIG.foundation).not.toHaveProperty("advanced");
    expect(STANDARD_RECIPE_CONFIG.foundation).not.toHaveProperty("projection");
  });

  it("exposes semantic Morphology authoring keys instead of internal op envelopes", () => {
    const expected: Record<string, readonly string[]> = {
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

    for (const [stageId, expectedKeys] of Object.entries(expected)) {
      const schemaProps =
        (getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, [stageId]) as {
          properties?: Record<string, unknown>;
        }).properties ?? {};
      expect(Object.keys(schemaProps).sort()).toEqual([...expectedKeys].sort());
      expect(JSON.stringify(schemaProps)).not.toContain("\"strategy\"");
      expect(JSON.stringify(schemaProps)).not.toContain("\"config\"");

      const config = (STANDARD_RECIPE_CONFIG as Record<string, Record<string, unknown>>)[stageId] ?? {};
      for (const key of Object.keys(config)) {
        expect(expectedKeys).toContain(key);
      }
    }
  });

  it("exposes documented and range-bounded Morphology public controls to Studio", () => {
    const expected: Record<string, readonly string[]> = {
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

    for (const [stageId, publicKeys] of Object.entries(expected)) {
      expectPublicStageDescription(STANDARD_RECIPE_CONFIG_SCHEMA, stageId);
      for (const key of publicKeys) {
        const schema = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, [stageId, key]);
        expect(collectMissingDescriptions(schema, [stageId, key])).toEqual([]);
        expect(collectNumericLeavesMissingRange(schema, [stageId, key])).toEqual([]);
        expect(collectDescriptionsMatching(schema, /\b(step\/op|envelope|internal|strategy)\b/i, [
          stageId,
          key,
        ])).toEqual([]);
      }
    }
  });

  it("exposes semantic Hydrology authoring keys instead of internal op envelopes", () => {
    const expected: Record<string, readonly string[]> = {
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
      "hydrology-hydrography": ["knobs", "runoff", "riverNetwork", "lakes"],
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

    for (const [stageId, expectedKeys] of Object.entries(expected)) {
      const schemaProps =
        (getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, [stageId]) as {
          properties?: Record<string, unknown>;
        }).properties ?? {};
      expect(Object.keys(schemaProps).sort()).toEqual([...expectedKeys].sort());
      expect(JSON.stringify(schemaProps)).not.toContain("\"strategy\"");
      expect(JSON.stringify(schemaProps)).not.toContain("\"config\"");

      const config = (STANDARD_RECIPE_CONFIG as Record<string, Record<string, unknown>>)[stageId] ?? {};
      for (const key of Object.keys(config)) {
        expect(expectedKeys).toContain(key);
      }
    }
  });

  it("exposes documented and range-bounded Hydrology public controls to Studio", () => {
    const expected: Record<string, readonly string[]> = {
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
      "hydrology-hydrography": ["knobs", "runoff", "riverNetwork", "lakes"],
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

    for (const [stageId, publicKeys] of Object.entries(expected)) {
      expectPublicStageDescription(STANDARD_RECIPE_CONFIG_SCHEMA, stageId);
      for (const key of publicKeys) {
        const schema = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, [stageId, key]);
        expect(collectMissingDescriptions(schema, [stageId, key])).toEqual([]);
        expect(collectNumericLeavesMissingRange(schema, [stageId, key])).toEqual([]);
        expect(collectDescriptionsMatching(schema, /\b(step|op|envelope|internal|strategy)\b/i, [
          stageId,
          key,
        ])).toEqual([]);
      }
    }
  });

  it("exposes semantic Ecology authoring keys instead of internal op envelopes", () => {
    const expected: Record<string, readonly string[]> = {
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
        "vegetationPlanning",
        "plotEffectScoring",
        "plotEffectCoverage",
      ],
    };

    for (const [stageId, expectedKeys] of Object.entries(expected)) {
      const schemaProps =
        (getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, [stageId]) as {
          properties?: Record<string, unknown>;
        }).properties ?? {};
      expect(Object.keys(schemaProps).sort()).toEqual([...expectedKeys].sort());
      expect(JSON.stringify(schemaProps)).not.toContain("\"strategy\"");
      expect(JSON.stringify(schemaProps)).not.toContain("\"config\"");

      const config = (STANDARD_RECIPE_CONFIG as Record<string, Record<string, unknown>>)[stageId] ?? {};
      for (const key of Object.keys(config)) {
        expect(expectedKeys).toContain(key);
      }
    }
  });

  it("exposes documented and range-bounded Ecology public controls to Studio", () => {
    const expected: Record<string, readonly string[]> = {
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
        "vegetationPlanning",
        "plotEffectScoring",
        "plotEffectCoverage",
      ],
    };

    for (const [stageId, publicKeys] of Object.entries(expected)) {
      expectPublicStageDescription(STANDARD_RECIPE_CONFIG_SCHEMA, stageId);
      for (const key of publicKeys) {
        const schema = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, [stageId, key]);
        expect(collectMissingDescriptions(schema, [stageId, key])).toEqual([]);
        expect(collectNumericLeavesMissingRange(schema, [stageId, key])).toEqual([]);
        expect(collectDescriptionsMatching(schema, /\b(step|op|envelope|internal|strategy)\b/i, [
          stageId,
          key,
        ])).toEqual([]);
      }
    }
  });

  it("exposes semantic Projection authoring keys instead of runtime step/op envelopes", () => {
    const expected: Record<string, readonly string[]> = {
      "map-morphology": ["knobs"],
      "map-hydrology": ["knobs"],
      "map-elevation": ["knobs"],
      "map-rivers": ["knobs", "riverProjection"],
      "map-ecology": ["knobs", "biomeBindings"],
    };

    for (const [stageId, expectedKeys] of Object.entries(expected)) {
      const schemaProps =
        (getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, [stageId]) as {
          properties?: Record<string, unknown>;
        }).properties ?? {};
      expect(Object.keys(schemaProps).sort()).toEqual([...expectedKeys].sort());
      expect(JSON.stringify(schemaProps)).not.toContain("\"strategy\"");
      expect(JSON.stringify(schemaProps)).not.toContain("\"config\"");

      const config = (STANDARD_RECIPE_CONFIG as Record<string, Record<string, unknown>>)[stageId] ?? {};
      for (const key of Object.keys(config)) {
        expect(expectedKeys).toContain(key);
      }
      expect(hasRawOpEnvelope(config)).toBe(false);
    }
  });

  it("exposes semantic Placement authoring keys instead of runtime step/op envelopes", () => {
    const expected = ["knobs", "naturalWonders", "discoveries", "floodplains", "resources"];
    const schemaProps =
      (getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["placement"]) as {
        properties?: Record<string, unknown>;
      }).properties ?? {};
    expect(Object.keys(schemaProps).sort()).toEqual([...expected].sort());
    expect(JSON.stringify(schemaProps)).not.toContain("\"strategy\"");
    expect(JSON.stringify(schemaProps)).not.toContain("\"config\"");
    expect(JSON.stringify(schemaProps)).not.toContain("derive-placement-inputs");
    expect(JSON.stringify(schemaProps)).not.toContain("candidateResourceTypes");
    expect(JSON.stringify(schemaProps)).not.toContain("startSectors");

    const config =
      (STANDARD_RECIPE_CONFIG as Record<string, Record<string, unknown>>).placement ?? {};
    for (const key of Object.keys(config)) {
      expect(expected).toContain(key);
    }
    expect(hasRawOpEnvelope(config)).toBe(false);
  });

  it("exposes documented and bounded Projection public controls to Studio", () => {
    const expected: Record<string, readonly string[]> = {
      "map-morphology": ["knobs"],
      "map-hydrology": ["knobs"],
      "map-elevation": ["knobs"],
      "map-rivers": ["knobs", "riverProjection"],
      "map-ecology": ["knobs", "biomeBindings"],
    };

    for (const [stageId, publicKeys] of Object.entries(expected)) {
      expectPublicStageDescription(STANDARD_RECIPE_CONFIG_SCHEMA, stageId);
      for (const key of publicKeys) {
        const schema = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, [stageId, key]);
        expect(collectMissingDescriptions(schema, [stageId, key])).toEqual([]);
        expect(collectNumericLeavesMissingRange(schema, [stageId, key])).toEqual([]);
        expect(collectStringLeavesMissingEnum(schema, [stageId, key])).toEqual([]);
        expect(collectDescriptionsMatching(schema, /\b(step|op|envelope|internal|strategy)\b/i, [
          stageId,
          key,
        ])).toEqual([]);
      }
    }
  });

  it("exposes documented and bounded Placement public controls to Studio", () => {
    const publicKeys = ["knobs", "naturalWonders", "discoveries", "floodplains", "resources"];

    expectPublicStageDescription(STANDARD_RECIPE_CONFIG_SCHEMA, "placement");
    for (const key of publicKeys) {
      const schema = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["placement", key]);
      expect(collectMissingDescriptions(schema, ["placement", key])).toEqual([]);
      expect(collectNumericLeavesMissingRange(schema, ["placement", key])).toEqual([]);
      expect(collectDescriptionsMatching(schema, /\b(step|op|envelope|internal|strategy)\b/i, [
        "placement",
        key,
      ])).toEqual([]);
    }
  });

  it("keeps Projection marine biome binding fixed to the Civ7 marine biome", () => {
    const marineSchema = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, [
      "map-ecology",
      "biomeBindings",
      "marine",
    ]) as { const?: unknown; default?: unknown };
    expect(marineSchema.const).toBe("BIOME_MARINE");
    expect(marineSchema.default).toBe("BIOME_MARINE");

    const { errors } = normalizeStrict<Record<string, unknown>>(
      STANDARD_RECIPE_CONFIG_SCHEMA,
      {
        "map-ecology": {
          biomeBindings: {
            marine: "BIOME_DESERT",
          },
        },
      },
      "/studio/projection-biomes"
    );
    expect(errors.map((error) => error.path)).toEqual(
      expect.arrayContaining(["/studio/projection-biomes/map-ecology/biomeBindings/marine"])
    );
  });

  it("keeps legacy Studio source defaults on the semantic Hydrology surface", () => {
    const expected: Record<string, readonly string[]> = {
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
      "hydrology-hydrography": ["knobs", "runoff", "riverNetwork", "lakes"],
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

    for (const [stageId, expectedKeys] of Object.entries(expected)) {
      const stageConfig = SOURCE_UI_DEFAULT_CONFIG[stageId] ?? {};
      expect(Object.keys(stageConfig).sort()).toEqual([...expectedKeys].sort());
      expect(stageConfig).not.toHaveProperty("climate-baseline");
      expect(stageConfig).not.toHaveProperty("rivers");
      expect(stageConfig).not.toHaveProperty("climate-refine");
      expect(hasRawOpEnvelope(stageConfig)).toBe(false);
    }
  });

  it("keeps legacy Studio source defaults on the semantic Ecology surface", () => {
    const expected: Record<string, readonly string[]> = {
      "ecology-pedology": ["knobs"],
      "ecology-biomes": ["knobs", "biomeClassification"],
      "ecology-features": ["knobs"],
    };

    expect(SOURCE_UI_DEFAULT_CONFIG).not.toHaveProperty("ecology");
    for (const [stageId, expectedKeys] of Object.entries(expected)) {
      const stageConfig = SOURCE_UI_DEFAULT_CONFIG[stageId] ?? {};
      expect(Object.keys(stageConfig).sort()).toEqual([...expectedKeys].sort());
      expect(stageConfig).not.toHaveProperty("pedology");
      expect(stageConfig).not.toHaveProperty("resource-basins");
      expect(stageConfig).not.toHaveProperty("biomes");
      expect(stageConfig).not.toHaveProperty("score-layers");
      expect(stageConfig).not.toHaveProperty("plan-plot-effects");
      expect(hasRawOpEnvelope(stageConfig)).toBe(false);
    }
  });

  it("keeps Morphology runtime steps visible even when public config keys are semantic", () => {
    const expectedSteps: Record<string, readonly string[]> = {
      "morphology-coasts": ["landmass-plates", "rugged-coasts"],
      "morphology-routing": ["routing"],
      "morphology-erosion": ["geomorphology"],
      "morphology-features": ["islands", "mountains", "volcanoes", "landmasses"],
    };

    const publicKeysByStage: Record<string, readonly string[]> = {
      "morphology-coasts": [
        "substrate",
        "relief",
        "waterCoverage",
        "continents",
        "coastlineShape",
        "shelf",
      ],
      "morphology-routing": [],
      "morphology-erosion": ["geomorphicCycle"],
      "morphology-features": ["islandChains", "mountainRanges", "volcanoes"],
    };

    for (const [stageId, stepIds] of Object.entries(expectedSteps)) {
      const stage = STANDARD_RECIPE_UI_META.stages.find((entry) => entry.stageId === stageId);
      expect(stage?.steps.map((step) => step.stepId)).toEqual(stepIds);

      const publicKeys = publicKeysByStage[stageId] ?? [];
      for (const step of stage?.steps ?? []) {
        const [focusKey, ...rest] = step.configFocusPathWithinStage;
        expect(rest).toEqual([]);
        if (focusKey) {
          expect(publicKeys).toContain(focusKey);
        }
      }
    }
  });

  it("keeps Hydrology runtime steps visible even when public config keys are semantic", () => {
    const expectedSteps: Record<string, readonly string[]> = {
      "hydrology-climate-baseline": ["climate-baseline"],
      "hydrology-hydrography": ["rivers", "lakes"],
      "hydrology-climate-refine": ["climate-refine"],
    };

    const publicKeysByStage: Record<string, readonly string[]> = {
      "hydrology-climate-baseline": [
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
      "hydrology-hydrography": ["runoff", "riverNetwork", "lakes"],
      "hydrology-climate-refine": [
        "precipitationRefinement",
        "solarForcing",
        "thermalState",
        "albedoFeedback",
        "cryosphereState",
        "landWaterBudget",
        "diagnostics",
      ],
    };

    for (const [stageId, stepIds] of Object.entries(expectedSteps)) {
      const stage = STANDARD_RECIPE_UI_META.stages.find((entry) => entry.stageId === stageId);
      expect(stage?.steps.map((step) => step.stepId)).toEqual(stepIds);

      const publicKeys = publicKeysByStage[stageId] ?? [];
      for (const step of stage?.steps ?? []) {
        const [focusKey, ...rest] = step.configFocusPathWithinStage;
        expect(rest).toEqual([]);
        if (focusKey) {
          expect(publicKeys).toContain(focusKey);
        }
      }
    }
  });

  it("keeps Ecology runtime steps visible even when public config keys are semantic", () => {
    const expectedSteps: Record<string, readonly string[]> = {
      "ecology-pedology": ["pedology", "resource-basins"],
      "ecology-biomes": ["biomes"],
      "ecology-features": [
        "score-layers",
        "plan-ice",
        "plan-reefs",
        "plan-wetlands",
        "plan-vegetation",
        "plan-plot-effects",
      ],
    };

    for (const [stageId, stepIds] of Object.entries(expectedSteps)) {
      const stage = STANDARD_RECIPE_UI_META.stages.find((entry) => entry.stageId === stageId);
      expect(stage?.steps.map((step) => step.stepId)).toEqual(stepIds);

      for (const step of stage?.steps ?? []) {
        expect(step.configFocusPathWithinStage).toEqual([]);
      }
    }
  });

  it("keeps Projection runtime steps visible even when public config keys are semantic", () => {
    const expectedSteps: Record<string, readonly string[]> = {
      "map-morphology": ["plot-coasts", "plot-continents", "plot-mountains", "plot-volcanoes"],
      "map-hydrology": ["lakes"],
      "map-elevation": ["build-elevation"],
      "map-rivers": ["plot-rivers"],
      "map-ecology": ["plot-biomes", "features-apply", "plot-effects"],
    };

    for (const [stageId, stepIds] of Object.entries(expectedSteps)) {
      const stage = STANDARD_RECIPE_UI_META.stages.find((entry) => entry.stageId === stageId);
      expect(stage?.steps.map((step) => step.stepId)).toEqual(stepIds);

      for (const step of stage?.steps ?? []) {
        expect(step.configFocusPathWithinStage).toEqual([]);
      }
    }
  });

  it("keeps Placement runtime steps visible even when public config keys are semantic", () => {
    const expectedSteps = [
      "derive-placement-inputs",
      "plot-landmass-regions",
      "place-natural-wonders",
      "prepare-placement-surface",
      "place-resources",
      "assign-starts",
      "place-discoveries",
      "assign-advanced-starts",
      "placement",
    ];

    const stage = STANDARD_RECIPE_UI_META.stages.find((entry) => entry.stageId === "placement");
    expect(stage?.steps.map((step) => step.stepId)).toEqual(expectedSteps);

    for (const step of stage?.steps ?? []) {
      expect(step.configFocusPathWithinStage).toEqual([]);
    }
  });

  it("exposes semantic Foundation authoring keys instead of internal op envelopes", () => {
    const foundationSchema = (STANDARD_RECIPE_CONFIG_SCHEMA as { properties?: Record<string, unknown> }).properties
      ?.foundation;
    expect(foundationSchema).toBeTruthy();
    const foundationProps = (foundationSchema as { properties?: Record<string, unknown> }).properties ?? {};
    expect(Object.keys(foundationProps).sort()).toEqual([
      "knobs",
      "lithosphere",
      "mantleForcing",
      "mantleSources",
      "meshResolution",
      "plateMotion",
      "platePartition",
      "tectonicEras",
      "tectonicFields",
      "tectonicRollups",
      "tectonicSegmentation",
    ].sort());
    expect(foundationProps).not.toHaveProperty("version");
    expect(foundationProps).not.toHaveProperty("profiles");
    expect(foundationProps).not.toHaveProperty("advanced");
    expect(foundationProps).not.toHaveProperty("projection");
    expect(foundationProps).not.toHaveProperty("mesh");
    expect(foundationProps).not.toHaveProperty("mantle-potential");
    expect(foundationProps).not.toHaveProperty("mantle-forcing");
    expect(foundationProps).not.toHaveProperty("crust");
    expect(foundationProps).not.toHaveProperty("plate-graph");
    expect(foundationProps).not.toHaveProperty("plate-motion");
    expect(foundationProps).not.toHaveProperty("tectonics");
    const meshResolutionProps =
      (foundationProps.meshResolution as { properties?: Record<string, unknown> }).properties ?? {};
    expect(meshResolutionProps).not.toHaveProperty("cellCount");
    expect(JSON.stringify(foundationProps)).not.toContain("\"strategy\"");
    expect(JSON.stringify(foundationProps)).not.toContain("\"config\"");
  });

  it("documents split Foundation controls with schema descriptions", () => {
    const foundation = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation"]);
    expectSchemaHasDescription(getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "knobs"]), "foundation.knobs");
    expectSchemaHasDescription(
      getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "knobs", "plateCount"]),
      "foundation.knobs.plateCount"
    );
    expectSchemaHasDescription(
      getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "knobs", "plateActivity"]),
      "foundation.knobs.plateActivity"
    );
    expectSchemaHasDescription(
      getSchemaAtPath(
        STANDARD_RECIPE_CONFIG_SCHEMA,
        ["foundation", "mantleForcing", "velocityScale"]
      ),
      "foundation.mantleForcing.velocityScale"
    );
    expectSchemaHasDescription(
      getSchemaAtPath(
        STANDARD_RECIPE_CONFIG_SCHEMA,
        ["foundation", "tectonicSegmentation", "regimeMinIntensity"]
      ),
      "foundation.tectonicSegmentation.regimeMinIntensity"
    );

    const foundationNode = foundation as { properties?: Record<string, unknown>; gs?: unknown };
    expect(foundationNode.gs).toBeUndefined();
    expect(foundationNode.properties ?? {}).not.toHaveProperty("advanced");
  });
});
