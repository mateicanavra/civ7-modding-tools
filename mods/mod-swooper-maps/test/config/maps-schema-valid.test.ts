import { describe, expect, it } from "vitest";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import standardRecipe, { STANDARD_STAGES } from "../../src/recipes/standard/recipe";
import {
  validateCanonicalMapConfig,
  type CanonicalMapConfigEnvelope,
} from "../../src/maps/configs/canonical";

import shatteredRingConfig from "../../src/maps/configs/shattered-ring.config.json";
import sunderedArchipelagoConfig from "../../src/maps/configs/sundered-archipelago.config.json";
import swooperDesertMountainsConfig from "../../src/maps/configs/swooper-desert-mountains.config.json";
import swooperEarthlikeConfig from "../../src/maps/configs/swooper-earthlike.config.json";

const shippedMapConfigs = [
  ["shattered-ring.config.json", shatteredRingConfig],
  ["sundered-archipelago.config.json", sunderedArchipelagoConfig],
  ["swooper-desert-mountains.config.json", swooperDesertMountainsConfig],
  ["swooper-earthlike.config.json", swooperEarthlikeConfig],
] as const satisfies readonly (readonly [string, CanonicalMapConfigEnvelope])[];

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

const MORPHOLOGY_INTERNAL_STAGE_KEYS = [
  "landmass-plates",
  "rugged-coasts",
  "routing",
  "geomorphology",
  "islands",
  "mountains",
  "landmasses",
];

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

  it("rejects legacy map-morphology alias keys", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-morphology": {
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
        "/maps/legacy-map-morphology/map-morphology/mountains",
        "/maps/legacy-map-morphology/map-morphology/volcanoes",
        "/maps/legacy-map-morphology/map-morphology/plotVolcanoes",
        "/maps/legacy-map-morphology/map-morphology/buildElevation",
      ])
    );
  });

  it("rejects retired map-hydrology river config", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-hydrology": {
          knobs: { riverDensity: "dense" },
          "plot-rivers": { minLength: 5 },
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
        "/maps/map-projection-truth-config/map-morphology/plot-mountains/ridges",
      ])
    );
  });
});
