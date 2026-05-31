import { describe, expect, it } from "vitest";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

import {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
  studioRecipeUiMeta as STANDARD_RECIPE_UI_META,
} from "mod-swooper-maps/recipes/standard-artifacts";

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
