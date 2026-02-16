import { describe, expect, it } from "vitest";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

import { STANDARD_RECIPE_CONFIG, STANDARD_RECIPE_CONFIG_SCHEMA } from "mod-swooper-maps/recipes/standard-artifacts";

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

  it("matches the authored swooper-earthlike posture (prevents accidental skeleton defaults)", () => {
    expect(STANDARD_RECIPE_CONFIG.foundation.knobs.plateCount).toBe(28);
    expect(STANDARD_RECIPE_CONFIG.foundation.knobs.plateActivity).toBe(0.7);
    expect(STANDARD_RECIPE_CONFIG.foundation.mesh.computeMesh.config.plateCount).toBe(28);
    expect(STANDARD_RECIPE_CONFIG.foundation).not.toHaveProperty("version");
    expect(STANDARD_RECIPE_CONFIG.foundation).not.toHaveProperty("profiles");
    expect(STANDARD_RECIPE_CONFIG.foundation).not.toHaveProperty("advanced");
  });

  it("exposes the split foundation authoring surface (no legacy advanced/profile fields)", () => {
    const foundationSchema = (STANDARD_RECIPE_CONFIG_SCHEMA as { properties?: Record<string, unknown> }).properties
      ?.foundation;
    expect(foundationSchema).toBeTruthy();
    const foundationProps = (foundationSchema as { properties?: Record<string, unknown> }).properties ?? {};
    expect(Object.keys(foundationProps)).toEqual(
      expect.arrayContaining([
        "knobs",
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
      ])
    );
    expect(foundationProps).not.toHaveProperty("version");
    expect(foundationProps).not.toHaveProperty("profiles");
    expect(foundationProps).not.toHaveProperty("advanced");

    const tectonicsProps =
      (foundationProps["tectonics"] as { properties?: Record<string, unknown> })?.properties ?? {};
    expect(Object.keys(tectonicsProps)).toEqual(
      expect.arrayContaining([
        "computePlateMotion",
        "computeTectonicSegments",
        "computeEraPlateMembership",
        "computeEraTectonicFields",
        "computeTectonicHistoryRollups",
        "computeTectonicsCurrent",
        "computeTracerAdvection",
        "computeTectonicProvenance",
        "computeHotspotEvents",
        "computeSegmentEvents",
      ])
    );
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
        ["foundation", "mantle-forcing", "computeMantleForcing", "config", "velocityScale"]
      ),
      "foundation.mantle-forcing.computeMantleForcing.config.velocityScale"
    );
    expectSchemaHasDescription(
      getSchemaAtPath(
        STANDARD_RECIPE_CONFIG_SCHEMA,
        ["foundation", "tectonics", "computeTectonicSegments", "config", "regimeMinIntensity"]
      ),
      "foundation.tectonics.computeTectonicSegments.config.regimeMinIntensity"
    );

    const foundationNode = foundation as { properties?: Record<string, unknown>; gs?: unknown };
    expect(foundationNode.gs).toBeUndefined();
    expect(foundationNode.properties ?? {}).not.toHaveProperty("advanced");
  });
});
