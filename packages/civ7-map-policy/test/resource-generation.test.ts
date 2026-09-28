import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  RESOURCE_GAMEPLAY_SCHEMA,
  readResourceDefaults,
  resolveResourceFacts,
  resolveResourcePlacementWeight,
} from "../scripts/resource-data.js";

const schema = readFileSync(
  join(import.meta.dir, "../../../.civ7/outputs/resources", RESOURCE_GAMEPLAY_SCHEMA),
  "utf8"
);

describe("official resource schema normalization", () => {
  it("resolves omitted facts from the actual SQL defaults", () => {
    const defaults = readResourceDefaults(schema);
    expect(defaults).toEqual({
      weight: 1,
      minimumPerLandmass: 1,
      landmassUnique: false,
      placementWeight: 1,
    });
    expect(resolveResourceFacts({}, defaults)).toEqual({
      weight: 1,
      minimumPerLandmass: 1,
      landmassUnique: false,
    });
    expect(resolveResourcePlacementWeight({}, defaults)).toBe(1);
  });

  it("uses schema values, not hardcoded fallback assumptions", () => {
    const defaults = readResourceDefaults(`
      CREATE TABLE Resources (Weight REAL DEFAULT 0.8, MinimumPerLandmass INTEGER DEFAULT 2, LandmassUnique BOOLEAN DEFAULT 1);
      CREATE TABLE Resource_ValidBiomes (Weight REAL DEFAULT 0.6);
    `);
    expect(resolveResourceFacts({}, defaults)).toEqual({
      weight: 0.8,
      minimumPerLandmass: 2,
      landmassUnique: true,
    });
    expect(resolveResourcePlacementWeight({}, defaults)).toBe(0.6);
  });

  it("preserves positive fractions, explicit minima including zero, and false flags", () => {
    const defaults = readResourceDefaults(schema);
    for (const weight of [0.5, 0.25, 0.4]) {
      expect(
        resolveResourceFacts(
          { Weight: String(weight), MinimumPerLandmass: "3", LandmassUnique: "true" },
          defaults
        )
      ).toEqual({ weight, minimumPerLandmass: 3, landmassUnique: true });
      expect(resolveResourcePlacementWeight({ Weight: String(weight) }, defaults)).toBe(weight);
    }
    expect(
      resolveResourceFacts({ MinimumPerLandmass: "0", LandmassUnique: "false" }, defaults)
    ).toEqual({ weight: 1, minimumPerLandmass: 0, landmassUnique: false });
  });

  it("rejects invalid resource and placement facts before emission", () => {
    const defaults = readResourceDefaults(schema);
    for (const value of ["", " ", "0", "-1", "NaN", "Infinity", "invalid"]) {
      expect(() => resolveResourceFacts({ Weight: value }, defaults)).toThrow(
        "positive finite weight"
      );
      expect(() => resolveResourcePlacementWeight({ Weight: value }, defaults)).toThrow(
        "positive finite weight"
      );
    }
    for (const value of ["", "-1", "0.5", "Infinity", "9007199254740992"]) {
      expect(() => resolveResourceFacts({ MinimumPerLandmass: value }, defaults)).toThrow(
        "nonnegative integer"
      );
    }
    for (const value of ["TRUE", "1", "", "yes"]) {
      expect(() => resolveResourceFacts({ LandmassUnique: value }, defaults)).toThrow(
        "true or false"
      );
    }
  });

  it("refuses missing or malformed schema defaults", () => {
    expect(() => readResourceDefaults("CREATE TABLE Resources (Weight REAL);")).toThrow(
      "no default"
    );
    expect(() =>
      readResourceDefaults(`
      CREATE TABLE Resources (Weight REAL DEFAULT 1, MinimumPerLandmass INTEGER DEFAULT 1, LandmassUnique BOOLEAN DEFAULT 2);
      CREATE TABLE Resource_ValidBiomes (Weight REAL DEFAULT 1);
    `)
    ).toThrow("Invalid schema LandmassUnique default");
  });
});
