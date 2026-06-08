import { describe, expect, test } from "bun:test";

import type { FinalSurfaceSnapshot } from "../../src/dev/diagnostics/live-parity";
import {
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
      plannedPreferredResourceSymbol: "RESOURCE_FISH",
      localOutcome: { status: "placed", resourceSymbol: "RESOURCE_FISH" },
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
});
