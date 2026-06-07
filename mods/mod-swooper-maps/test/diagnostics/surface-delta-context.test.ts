import { describe, expect, test } from "bun:test";

import type { FinalSurfaceSnapshot } from "../../src/dev/diagnostics/live-parity";
import {
  buildResourceDeltaFeasibilityContexts,
  buildResourceDeltaPlacementContexts,
  buildSurfaceDeltaContext,
  buildSurfaceDeltaContexts,
  staticSurfaceLegality,
} from "../../src/dev/diagnostics/surface-delta-context";

function snapshot(
  overrides: Partial<FinalSurfaceSnapshot["surfaces"]> = {},
  evidence?: Readonly<Record<string, unknown>>
): FinalSurfaceSnapshot {
  const width = 3;
  const height = 2;
  return {
    source: "local-mapgen",
    width,
    height,
    surfaces: {
      terrain: { width, height, values: [3, 3, 2, 2, 2, 3] },
      biome: { width, height, values: [5, 5, 1, 1, 2, 5] },
      feature: { width, height, values: [-1, -1, -1, 6, -1, -1] },
      resource: { width, height, values: [-1, 3, -1, -1, -1, -1] },
      ...overrides,
    },
    ...(evidence === undefined ? {} : { evidence }),
  };
}

describe("surface delta context diagnostics", () => {
  test("extracts feature/resource mismatch rows with symbols", () => {
    const local = snapshot({
      feature: { width: 3, height: 2, values: [11, -1, -1, 6, -1, -1] },
      resource: { width: 3, height: 2, values: [-1, 3, -1, -1, -1, -1] },
    });
    const live = snapshot({
      feature: { width: 3, height: 2, values: [-1, -1, -1, 6, -1, -1] },
      resource: { width: 3, height: 2, values: [-1, -1, -1, -1, -1, -1] },
    });

    const rows = buildSurfaceDeltaContexts({ local, live }, { keys: ["feature", "resource"] });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      key: "feature",
      x: 0,
      y: 0,
      local: { value: 11, symbol: "FEATURE_COLD_REEF" },
      live: { value: null, symbol: "empty" },
    });
    expect(rows[1]).toMatchObject({
      key: "resource",
      x: 1,
      y: 0,
      local: { value: 3, symbol: "RESOURCE_FISH" },
      live: { value: null, symbol: "empty" },
    });
  });

  test("checks static feature and resource surface legality against snapshot context", () => {
    const surface = snapshot();

    expect(staticSurfaceLegality(surface, "feature", 0, 0, 11)).toMatchObject({
      symbol: "FEATURE_COLD_REEF",
      validSurface: true,
    });
    expect(staticSurfaceLegality(surface, "feature", 2, 0, 11)).toMatchObject({
      symbol: "FEATURE_COLD_REEF",
      validSurface: false,
      reasons: ["feature.terrain", "feature.biome"],
    });
    expect(staticSurfaceLegality(surface, "resource", 1, 0, 3)).toMatchObject({
      symbol: "RESOURCE_FISH",
      validSurface: true,
      resourcePolicy: {
        matchingRows: [
          {
            biomeSymbol: "BIOME_MARINE",
            terrainSymbol: "TERRAIN_COAST",
            featureSymbol: "empty",
          },
        ],
        flags: {
          adjacentToLand: true,
          adjacentToLandRuntimeOptional: true,
          lakeEligible: true,
        },
        hasAdjacentLand: true,
      },
    });
    const openCoast = snapshot({
      terrain: { width: 3, height: 2, values: [3, 3, 3, 3, 3, 3] },
      biome: { width: 3, height: 2, values: [5, 5, 5, 5, 5, 5] },
      feature: { width: 3, height: 2, values: [-1, -1, -1, -1, -1, -1] },
    });
    expect(staticSurfaceLegality(openCoast, "resource", 1, 0, 3)).toMatchObject({
      symbol: "RESOURCE_FISH",
      validSurface: true,
    });
    const invalidWhales = staticSurfaceLegality(surface, "resource", 2, 0, 32);
    expect(invalidWhales).toMatchObject({
      symbol: "RESOURCE_WHALES",
      validSurface: false,
    });
    expect(invalidWhales.reasons).toContain("resource.surface");
  });

  test("cross-checks local and live values against both surfaces", () => {
    const local = snapshot({
      resource: { width: 3, height: 2, values: [-1, 3, -1, -1, -1, -1] },
    });
    const live = snapshot({
      terrain: { width: 3, height: 2, values: [3, 2, 2, 2, 2, 3] },
      biome: { width: 3, height: 2, values: [5, 1, 1, 1, 2, 5] },
      resource: { width: 3, height: 2, values: [-1, -1, -1, -1, -1, -1] },
    });

    const row = buildSurfaceDeltaContext(local, live, "resource", 1, 0);

    expect(row.legality.localValueOnLocal).toMatchObject({
      symbol: "RESOURCE_FISH",
      validSurface: true,
    });
    expect(row.legality.localValueOnLive).toMatchObject({
      symbol: "RESOURCE_FISH",
      validSurface: false,
      reasons: ["resource.surface"],
    });
  });

  test("joins resource deltas to local placement plan and assignment outcomes", () => {
    const local = snapshot(
      {
        resource: { width: 3, height: 2, values: [3, -1, 2, -1, -1, -1] },
      },
      {
        resourcePlan: {
          minSpacingTiles: 2,
          placements: [
            { plotIndex: 0, preferredResourceType: 3 },
            { plotIndex: 1, preferredResourceType: 3 },
            { plotIndex: 2, preferredResourceType: 2 },
          ],
        },
        resourcePlacementOutcomes: {
          outcomes: [
            {
              status: "placed",
              plotIndex: 0,
              x: 0,
              y: 0,
              resourceType: 3,
              observedResourceType: 3,
            },
            {
              status: "placed",
              plotIndex: 2,
              x: 2,
              y: 0,
              resourceType: 2,
              observedResourceType: 2,
            },
          ],
        },
      }
    );
    const live = snapshot({
      resource: { width: 3, height: 2, values: [-1, 3, 12, -1, -1, -1] },
    });

    const rows = buildResourceDeltaPlacementContexts({ local, live });

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      plotIndex: 0,
      localResource: { symbol: "RESOURCE_FISH" },
      liveResource: { symbol: "empty" },
      localContext: {
        terrainSymbol: "TERRAIN_COAST",
        biomeSymbol: "BIOME_MARINE",
        resourceSymbol: "RESOURCE_FISH",
      },
      liveContext: {
        terrainSymbol: "TERRAIN_COAST",
        biomeSymbol: "BIOME_MARINE",
        resourceSymbol: "empty",
      },
      plannedPreferredResourceSymbol: "RESOURCE_FISH",
      localOutcome: { status: "placed", resourceSymbol: "RESOURCE_FISH" },
      resourceNeighborhood: {
        minSpacingTiles: 2,
        localResourceOnLocal: {
          nearestSameType: null,
          nearestAnyResource: {
            plotIndex: 2,
            resourceSymbol: "RESOURCE_DYES",
          },
          anyResourceWithinMinSpacing: true,
        },
        localResourceOnLive: {
          nearestSameType: {
            plotIndex: 1,
            resourceSymbol: "RESOURCE_FISH",
          },
          sameTypeWithinMinSpacing: true,
        },
      },
      legality: {
        localValueOnLocal: {
          symbol: "RESOURCE_FISH",
          validSurface: true,
          reasons: [],
        },
      },
      evidenceClass: "local-assigned-live-empty",
    });
    expect(rows[1]).toMatchObject({
      plotIndex: 1,
      localResource: { symbol: "empty" },
      liveResource: { symbol: "RESOURCE_FISH" },
      plannedPreferredResourceSymbol: "RESOURCE_FISH",
      localOutcome: null,
      evidenceClass: "live-only-preferred-but-unassigned",
    });
    expect(rows[2]).toMatchObject({
      plotIndex: 2,
      localResource: { symbol: "RESOURCE_DYES" },
      liveResource: { symbol: "RESOURCE_PEARLS" },
      localOutcome: { status: "placed", resourceSymbol: "RESOURCE_DYES" },
      evidenceClass: "local-assigned-live-substitution",
    });
  });

  test("classifies resource deltas with Civ feasibility readback", () => {
    const local = snapshot(
      {
        resource: {
          width: 3,
          height: 2,
          values: [3, -1, 2, 6, 53, 14],
        },
      },
      {
        resourcePlan: {
          placements: [
            { plotIndex: 0, preferredResourceType: 3 },
            { plotIndex: 1, preferredResourceType: 3 },
            { plotIndex: 2, preferredResourceType: 2 },
            { plotIndex: 3, preferredResourceType: 6 },
            { plotIndex: 4, preferredResourceType: 53 },
            { plotIndex: 5, preferredResourceType: 14 },
          ],
        },
        resourcePlacementOutcomes: {
          outcomes: [
            { status: "placed", plotIndex: 0, x: 0, y: 0, resourceType: 3, observedResourceType: 3 },
            { status: "placed", plotIndex: 2, x: 2, y: 0, resourceType: 2, observedResourceType: 2 },
            { status: "placed", plotIndex: 3, x: 0, y: 1, resourceType: 6, observedResourceType: 6 },
            { status: "placed", plotIndex: 4, x: 1, y: 1, resourceType: 53, observedResourceType: 53 },
            { status: "placed", plotIndex: 5, x: 2, y: 1, resourceType: 14, observedResourceType: 14 },
          ],
        },
      }
    );
    const live = snapshot({
      resource: {
        width: 3,
        height: 2,
        values: [-1, 3, 12, -1, -1, 6],
      },
    });

    const rows = buildResourceDeltaFeasibilityContexts(
      { local, live },
      {
        cells: [
          feasibilityCell(0, 0, 0, { 3: true }),
          feasibilityCell(1, 0, 1, { 3: true }),
          feasibilityCell(2, 0, 2, { 2: true, 12: true }),
          feasibilityCell(0, 1, 3, { 6: false }),
          feasibilityCell(1, 1, 4, { 53: true }),
          feasibilityCell(2, 1, 5, { 14: false, 6: false }),
        ],
      }
    );

    expect(rows.map((row) => row.feasibilityClass)).toEqual([
      "local-feasible-live-empty",
      "live-feasible-no-local-assignment",
      "substitution-both-feasible",
      "local-overaccepted-live-empty",
      "local-feasible-live-empty",
      "substitution-both-infeasible",
    ]);
    expect(rows[3]).toMatchObject({
      evidenceClass: "local-assigned-live-empty",
      localResource: { symbol: "RESOURCE_GYPSUM" },
      liveResource: { symbol: "empty" },
      localFeasibleInCiv: { ok: true, value: false },
    });
    expect(rows[5]).toMatchObject({
      evidenceClass: "local-assigned-live-substitution",
      localResource: { symbol: "RESOURCE_SILVER" },
      liveResource: { symbol: "RESOURCE_GYPSUM" },
      feasibilityClass: "substitution-both-infeasible",
    });
  });
});

function feasibilityCell(
  x: number,
  y: number,
  index: number,
  values: Readonly<Record<number, boolean>>
) {
  return {
    location: { x, y, index: { ok: true, value: index } },
    feasibility: Object.fromEntries(
      Object.entries(values).map(([resourceType, value]) => [
        resourceType,
        { ok: true, value },
      ])
    ),
  };
}
