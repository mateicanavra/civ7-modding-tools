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
    expect(STANDARD_RECIPE_CONFIG.foundation.profiles.lithosphereProfile).toBe("maximal-basaltic-lid-v1");
    expect(STANDARD_RECIPE_CONFIG.foundation.profiles.mantleProfile).toBe("maximal-potential-v1");
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
    expect(Object.keys(advancedProps)).toEqual(expect.arrayContaining(["mantleForcing", "lithosphere"]));

    const keys = new Set<string>();
    collectSchemaKeys(foundationSchema, keys);
    const forbidden = ["velocity", "belt", "regime"];
    const hits = [...keys].filter((key) =>
      forbidden.some((needle) => key.toLowerCase().includes(needle))
    );
    expect(hits).toEqual([]);
  });
});
