import { describe, expect, it } from "vitest";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

import { STANDARD_RECIPE_CONFIG, STANDARD_RECIPE_CONFIG_SCHEMA } from "mod-swooper-maps/recipes/standard-artifacts";

function collectSchemaKeys(schema: unknown, keys: Set<string>) {
  if (!schema || typeof schema !== "object") return;
  if (Array.isArray(schema)) {
    schema.forEach((item) => collectSchemaKeys(item, keys));
    return;
  }
  const node = schema as Record<string, unknown>;
  const properties = node.properties;
  if (properties && typeof properties === "object") {
    for (const [key, value] of Object.entries(properties)) {
      keys.add(key);
      collectSchemaKeys(value, keys);
    }
  }
  const anyOf = node.anyOf;
  if (Array.isArray(anyOf)) anyOf.forEach((item) => collectSchemaKeys(item, keys));
  const oneOf = node.oneOf;
  if (Array.isArray(oneOf)) oneOf.forEach((item) => collectSchemaKeys(item, keys));
  const allOf = node.allOf;
  if (Array.isArray(allOf)) allOf.forEach((item) => collectSchemaKeys(item, keys));
  if ("items" in node) collectSchemaKeys(node.items as unknown, keys);
}

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

function expectSchemaHasGsComments(schema: unknown, label: string) {
  const node = schema as any;
  const comments = node?.gs?.comments;
  const ok =
    (typeof comments === "string" && comments.trim().length > 0) ||
    (Array.isArray(comments) && comments.every((v: unknown) => typeof v === "string") && comments.length > 0);
  expect(ok, `${label} must define gs.comments`).toBe(true);
}

describe("Studio default config", () => {
  it("validates against the standard recipe schema (prevents UI drift)", () => {
    const { errors } = normalizeStrict<Record<string, unknown>>(STANDARD_RECIPE_CONFIG_SCHEMA, STANDARD_RECIPE_CONFIG, "/defaultConfig");
    expect(errors).toEqual([]);
  });

  it("matches the authored swooper-earthlike posture (prevents accidental skeleton defaults)", () => {
    expect(STANDARD_RECIPE_CONFIG.foundation.version).toBe(1);
    expect(STANDARD_RECIPE_CONFIG.foundation.profiles.resolutionProfile).toBe("balanced");
    expect(STANDARD_RECIPE_CONFIG.foundation.knobs.plateCount).toBe(28);
    expect(STANDARD_RECIPE_CONFIG.foundation.knobs.plateActivity).toBe(0.5);
    expect(STANDARD_RECIPE_CONFIG.foundation.profiles).not.toHaveProperty("lithosphereProfile");
    expect(STANDARD_RECIPE_CONFIG.foundation.profiles).not.toHaveProperty("mantleProfile");
  });

  it("exposes the D08r foundation authoring surface only (no derived-field keys)", () => {
    const foundationSchema = (STANDARD_RECIPE_CONFIG_SCHEMA as { properties?: Record<string, unknown> }).properties
      ?.foundation;
    expect(foundationSchema).toBeTruthy();
    const foundationProps = (foundationSchema as { properties?: Record<string, unknown> }).properties ?? {};
    expect(Object.keys(foundationProps)).toEqual(
      expect.arrayContaining(["version", "profiles", "knobs", "advanced"])
    );
    const advancedProps =
      (foundationProps.advanced as { properties?: Record<string, unknown> })?.properties ?? {};
    expect(Object.keys(advancedProps)).toEqual(
      expect.arrayContaining(["mantleForcing", "lithosphere", "budgets"])
    );

    const keys = new Set<string>();
    collectSchemaKeys(foundationSchema, keys);
    const forbidden = ["velocity", "belt", "regime"];
    const hits = [...keys].filter((key) =>
      forbidden.some((needle) => key.toLowerCase().includes(needle))
    );
    expect(hits).toEqual([]);
  });

  it("documents the Foundation advanced schema (descriptions + gs.comments)", () => {
    const foundation = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation"]);
    expectSchemaHasGsComments(foundation, "foundation");

    const profiles = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "profiles"]);
    expectSchemaHasGsComments(profiles, "foundation.profiles");
    expectSchemaHasDescription(getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "profiles", "resolutionProfile"]), "foundation.profiles.resolutionProfile");
    expect((profiles as { properties?: Record<string, unknown> }).properties ?? {}).not.toHaveProperty("lithosphereProfile");
    expect((profiles as { properties?: Record<string, unknown> }).properties ?? {}).not.toHaveProperty("mantleProfile");

    const advanced = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "advanced"]);
    expectSchemaHasGsComments(advanced, "foundation.advanced");

    const mantleForcing = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "advanced", "mantleForcing"]);
    const lithosphere = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "advanced", "lithosphere"]);
    const budgets = getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "advanced", "budgets"]);
    expectSchemaHasGsComments(mantleForcing, "foundation.advanced.mantleForcing");
    expectSchemaHasGsComments(lithosphere, "foundation.advanced.lithosphere");
    expectSchemaHasGsComments(budgets, "foundation.advanced.budgets");

    const mantleScalarProps = ["potentialAmplitude01", "plumeCount", "downwellingCount", "lengthScale01"] as const;
    for (const key of mantleScalarProps) {
      expectSchemaHasDescription(
        getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "advanced", "mantleForcing", key]),
        `foundation.advanced.mantleForcing.${key}`
      );
    }
    expect((mantleForcing as { properties?: Record<string, unknown> }).properties ?? {}).not.toHaveProperty("potentialMode");

    const lithosphereScalarProps = ["yieldStrength01", "mantleCoupling01", "riftWeakening01"] as const;
    for (const key of lithosphereScalarProps) {
      expectSchemaHasDescription(
        getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "advanced", "lithosphere", key]),
        `foundation.advanced.lithosphere.${key}`
      );
    }

    expectSchemaHasDescription(
      getSchemaAtPath(STANDARD_RECIPE_CONFIG_SCHEMA, ["foundation", "advanced", "budgets", "eraCount"]),
      "foundation.advanced.budgets.eraCount"
    );
  });
});
