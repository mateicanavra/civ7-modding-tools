import { describe, expect, it } from "bun:test";

import { CIV7_BROWSER_TABLES_V0, CIV7_POLICY_TABLES_V1 } from "../src/index.js";

const resourceIndexByType = CIV7_BROWSER_TABLES_V0.resourceTypes as Record<string, number>;

describe("CIV7_POLICY_TABLES_V1", () => {
  it("covers every V0 resource index with a catalog row, in V0 order", () => {
    const v0Indices = Object.values(resourceIndexByType).sort((a, b) => a - b);
    const v1Indices = Object.keys(CIV7_POLICY_TABLES_V1.resourceRows)
      .map(Number)
      .sort((a, b) => a - b);
    expect(v1Indices).toEqual(v0Indices);
    for (const [type, index] of Object.entries(resourceIndexByType)) {
      expect(CIV7_POLICY_TABLES_V1.resourceRows[String(index)]?.type).toBe(type);
    }
  });

  it("carries known official weights and hemisphere minimums", () => {
    const gold = CIV7_POLICY_TABLES_V1.resourceRows[String(resourceIndexByType.RESOURCE_GOLD)];
    expect(gold?.weight).toBe(20);
    expect(gold?.minimumPerHemisphere).toBe(8);
    const hides = CIV7_POLICY_TABLES_V1.resourceRows[String(resourceIndexByType.RESOURCE_HIDES)];
    expect(hides?.weight).toBe(40);
    expect(hides?.minimumPerHemisphere).toBe(0);
  });

  it("keeps raw leader requirement rows separate from live roster-dependent decisions", () => {
    const fishIndex = String(resourceIndexByType.RESOURCE_FISH);
    expect(CIV7_POLICY_TABLES_V1.resourceRequiredLeaders[fishIndex]).toContain(
      "LEADER_HARRIET_TUBMAN"
    );
    expect(CIV7_POLICY_TABLES_V1.resourceValidAges[fishIndex]).toContain("AGE_ANTIQUITY");
  });

  it("includes the DEFAULT MapResourceMinimumAmountModifier rows for every official size step", () => {
    const defaults = CIV7_POLICY_TABLES_V1.mapResourceMinimumAmountModifier.filter(
      (row) => row.mapType === "DEFAULT"
    );
    expect(defaults.length).toBeGreaterThanOrEqual(4);
    const tiny = defaults.find((row) => row.mapSizeType === "MAPSIZE_TINY");
    expect(tiny?.amount).toBe(-4);
  });

  it("attributes every StartBias row to exactly one civilization or leader", () => {
    const allRows = [
      ...CIV7_POLICY_TABLES_V1.startBias.biomes,
      ...CIV7_POLICY_TABLES_V1.startBias.terrains,
      ...CIV7_POLICY_TABLES_V1.startBias.featureClasses,
      ...CIV7_POLICY_TABLES_V1.startBias.resources,
      ...CIV7_POLICY_TABLES_V1.startBias.rivers,
      ...CIV7_POLICY_TABLES_V1.startBias.lakes,
      ...CIV7_POLICY_TABLES_V1.startBias.adjacentToCoasts,
      ...CIV7_POLICY_TABLES_V1.startBias.naturalWonders,
    ];
    expect(allRows.length).toBeGreaterThan(0);
    for (const row of allRows) {
      const owners = [row.civilizationType, row.leaderType].filter(Boolean);
      expect(owners.length).toBe(1);
      expect(Number.isFinite(row.score)).toBe(true);
    }
  });

  it("references only known V0 symbolic types from StartBias value rows", () => {
    const known = {
      biomes: CIV7_BROWSER_TABLES_V0.biomeGlobals as Record<string, number>,
      terrains: CIV7_BROWSER_TABLES_V0.terrainTypeIndices as Record<string, number>,
      resources: resourceIndexByType,
    };
    for (const row of CIV7_POLICY_TABLES_V1.startBias.biomes) {
      expect(known.biomes[row.value]).toBeDefined();
    }
    for (const row of CIV7_POLICY_TABLES_V1.startBias.terrains) {
      expect(known.terrains[row.value]).toBeDefined();
    }
    for (const row of CIV7_POLICY_TABLES_V1.startBias.resources) {
      expect(known.resources[row.value]).toBeDefined();
    }
  });

  it("captures the official 6/12 start buffers", () => {
    expect(CIV7_POLICY_TABLES_V1.startGlobals.requiredBufferBetweenMajorStarts).toBe(6);
    expect(CIV7_POLICY_TABLES_V1.startGlobals.desiredBufferBetweenMajorStarts).toBe(12);
  });
});
