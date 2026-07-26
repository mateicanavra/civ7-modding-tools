import { describe, expect, it } from "bun:test";

import placementDomain from "@mapgen/domain/placement/router";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../setup.js";

const { planNaturalWonders, planWonders } = placementDomain.wonders.ops;

function naturalWonderSelection(minSpacingTiles: number) {
  const selection = structuredClone(planNaturalWonders.defaultConfig);
  selection.config.minSpacingTiles = minSpacingTiles;
  return selection;
}

describe("natural wonder planning", () => {
  it("plans wonders from map-size defaults without bonus inflation", () => {
    const result = runAdmittedOperationForTest(
      planWonders,
      { mapInfo: { NumNaturalWonders: 2 } },
      structuredClone(planWonders.defaultConfig)
    );
    expect(result.wondersCount).toBe(2);
  });

  it("plans zero wonders when map-size default is absent", () => {
    const result = runAdmittedOperationForTest(
      planWonders,
      { mapInfo: {} },
      structuredClone(planWonders.defaultConfig)
    );
    expect(result.wondersCount).toBe(0);
  });

  it("plans deterministic natural wonder placements from physical fields", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const result = runAdmittedOperationForTest(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 2,
        landMask: new Uint8Array(size).fill(1),
        elevation: Int16Array.from({ length: size }, (_, index) => (index * 37) % 120),
        aridityIndex: new Float32Array(size).fill(0.3),
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Int32Array(size).fill(1),
        biomeType: new Int32Array(size).fill(1),
        featureType: new Int32Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          {
            featureType: 35,
            direction: 0,
            footprintOffsetsByParity: { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] },
          },
          {
            featureType: 41,
            direction: 1,
            footprintOffsetsByParity: { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] },
          },
        ],
      },
      naturalWonderSelection(1)
    );

    expect(result.targetCount).toBe(2);
    expect(result.plannedCount).toBe(2);
    expect(result.placements.length).toBe(2);
    expect(result.placements[0]?.featureType).toBe(35);
    expect(result.placements[1]?.featureType).toBe(41);
  });

  it("drops explicit empty natural-wonder footprints from placement candidates", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const result = runAdmittedOperationForTest(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 2,
        landMask: new Uint8Array(size).fill(1),
        elevation: Int16Array.from({ length: size }, (_, index) => (index * 37) % 120),
        aridityIndex: new Float32Array(size).fill(0.3),
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Int32Array(size).fill(1),
        biomeType: new Int32Array(size).fill(1),
        featureType: new Int32Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          { featureType: 35, direction: 0 },
          { featureType: 37, direction: 0, footprintOffsetsByParity: { even: [], odd: [] } },
          {
            featureType: 41,
            direction: 1,
            footprintOffsetsByParity: { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] },
          },
        ],
      },
      naturalWonderSelection(1)
    );

    expect(result.targetCount).toBe(1);
    expect(result.plannedCount).toBe(1);
    expect(result.placements).toEqual([expect.objectContaining({ featureType: 41 })]);
  });

  it("produces identical natural-wonder placements on repeated runs (deterministic, no RNG)", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const f32 = (fn: (i: number) => number) =>
      Float32Array.from(Array.from({ length: size }, (_, i) => fn(i)));
    const anchorOnly = {
      even: [{ dx: 0, dy: 0 }],
      odd: [{ dx: 0, dy: 0 }],
    };
    const input = {
      width,
      height,
      wondersCount: 3,
      landMask: new Uint8Array(size).fill(1),
      elevation: Int16Array.from(Array.from({ length: size }, (_, i) => (i * 137) % 400)),
      aridityIndex: f32((i) => ((i * 7) % 100) / 100),
      riverClass: new Uint8Array(size),
      lakeMask: new Uint8Array(size),
      coastTerrainType: 2,
      mountainTerrainType: 3,
      iceFeatureType: 4,
      terrainType: new Int32Array(size).fill(1),
      biomeType: new Int32Array(size).fill(1),
      featureType: new Int32Array(size).fill(-1),
      noFeatureType: -1,
      naturalWonderBlockedMask: new Uint8Array(size),
      vegetationDensity: f32((i) => ((i * 11) % 100) / 100),
      effectiveMoisture: f32((i) => ((i * 13) % 100) / 100),
      surfaceTemperature: f32((i) => (i * 17) % 30),
      fertility: f32((i) => ((i * 19) % 100) / 100),
      discharge: f32((i) => (i * 23) % 50),
      slopeClass: new Uint8Array(size),
      // Distinct requirement groups (Redwood=I, Kilimanjaro=A, Uluru=H) so the
      // per-wonder suitability — and hence the cross-wonder ranking — differs.
      featureCatalog: [
        { featureType: 30, direction: 0, footprintOffsetsByParity: anchorOnly },
        { featureType: 35, direction: 0, footprintOffsetsByParity: anchorOnly },
        { featureType: 39, direction: 0, footprintOffsetsByParity: anchorOnly },
      ],
    };
    const cfg = naturalWonderSelection(1);
    const first = runAdmittedOperationForTest(planNaturalWonders, input, cfg);
    const second = runAdmittedOperationForTest(planNaturalWonders, input, cfg);
    expect(first.placements.length).toBeGreaterThan(0);
    expect(second.placements).toEqual(first.placements);
    for (const placement of first.placements) {
      expect(placement.priority).toBeGreaterThanOrEqual(0);
      expect(placement.priority).toBeLessThanOrEqual(1);
    }
  });

  it("emits next-best fallback anchors for materialize retry", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const result = runAdmittedOperationForTest(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 1,
        landMask: new Uint8Array(size).fill(1),
        elevation: Int16Array.from({ length: size }, (_, index) => (index * 37) % 120),
        aridityIndex: new Float32Array(size).fill(0.3),
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Int32Array(size).fill(1),
        biomeType: new Int32Array(size).fill(1),
        featureType: new Int32Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          {
            featureType: 35, // Kilimanjaro (group A); anchor-only here
            direction: 0,
            footprintOffsetsByParity: { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] },
          },
        ],
      },
      naturalWonderSelection(0)
    );

    expect(result.placements.length).toBe(1);
    const placement = result.placements[0]!;
    const fallbacks = placement.fallbackPlotIndices ?? [];
    // Fallbacks exist, are capped, distinct, exclude the primary, and are valid.
    expect(fallbacks.length).toBeGreaterThan(0);
    expect(fallbacks.length).toBeLessThanOrEqual(6);
    expect(new Set(fallbacks).size).toBe(fallbacks.length);
    expect(fallbacks).not.toContain(placement.plotIndex);
    for (const idx of fallbacks) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(size);
    }
  });

  it("excludes overlapping footprints from fallback anchors (multi-tile + used plots)", () => {
    // A controlled 6x6 topology makes multi-tile wrapping and overlap exclusions inspectable.
    const syntheticDimensions = { width: 6, height: 6 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    // TWO-tile footprint so fallbacks must avoid MULTI-tile overlaps, not just
    // the single anchor plot. Two wonders in distinct groups so both place and
    // the second wonder's fallbacks must also avoid the first wonder's footprint.
    const twoTile = {
      even: [
        { dx: 0, dy: 0 },
        { dx: 1, dy: 0 },
      ],
      odd: [
        { dx: 0, dy: 0 },
        { dx: 1, dy: 0 },
      ],
    };
    const result = runAdmittedOperationForTest(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 2,
        landMask: new Uint8Array(size).fill(1),
        elevation: Int16Array.from(Array.from({ length: size }, (_, i) => (i * 53) % 300)),
        aridityIndex: new Float32Array(size).fill(0.3),
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Int32Array(size).fill(1),
        biomeType: new Int32Array(size).fill(1),
        featureType: new Int32Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          { featureType: 35, direction: 0, footprintOffsetsByParity: twoTile }, // group A
          { featureType: 30, direction: 0, footprintOffsetsByParity: twoTile }, // group I
        ],
      },
      naturalWonderSelection(0)
    );

    expect(result.placements.length).toBe(2);
    // Reconstruct the parity-resolved footprint for an anchor (TWO is parity-
    // symmetric here, so even/odd agree).
    const footprintOf = (plotIndex: number): number[] => {
      const y = (plotIndex / width) | 0;
      const x = plotIndex - y * width;
      return [
        { dx: 0, dy: 0 },
        { dx: 1, dy: 0 },
      ].map((o) => {
        const fy = y + o.dy;
        const fx = (((x + o.dx) % width) + width) % width;
        return fy * width + fx;
      });
    };
    // Fallbacks for placement i must avoid its OWN footprint and the footprints
    // of every EARLIER placement (the usedPlots state when it was selected).
    for (let i = 0; i < result.placements.length; i++) {
      const placement = result.placements[i]!;
      const fallbacks = placement.fallbackPlotIndices ?? [];
      expect(fallbacks.length).toBeGreaterThan(0);
      expect(fallbacks.length).toBeLessThanOrEqual(6);
      const forbidden = new Set<number>(footprintOf(placement.plotIndex));
      for (let j = 0; j < i; j++) {
        for (const cell of footprintOf(result.placements[j]!.plotIndex)) forbidden.add(cell);
      }
      for (const fallbackAnchor of fallbacks) {
        for (const cell of footprintOf(fallbackAnchor)) {
          expect(forbidden.has(cell)).toBe(false);
        }
      }
    }
  });

  it("diminishing-returns decay flips the second pick to a fresh group (variety)", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const anchorOnly = { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] };
    // Uniform map tuned so two arid wonders (group H) each score ~0.8 and one
    // forest wonder (group I) scores ~0.48. WITHOUT the per-group decay the two
    // highest scores are both group H -> {31,39}. WITH decay the 2nd H drops to
    // 0.8*0.5=0.4 < 0.48, so the forest wonder wins the 2nd slot -> {30,31}.
    const result = runAdmittedOperationForTest(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 2,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(100),
        aridityIndex: new Float32Array(size).fill(1), // group H: 0.5*1 + 0.3*elevN(1) = 0.8
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        vegetationDensity: new Float32Array(size).fill(0.6), // group I: 0.55*0.6 = 0.33
        effectiveMoisture: new Float32Array(size).fill(0.5), //          + 0.3*0.5 = 0.15
        surfaceTemperature: new Float32Array(size).fill(35), // temperate term -> 0
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Int32Array(size).fill(1),
        biomeType: new Int32Array(size).fill(1),
        featureType: new Int32Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          { featureType: 31, direction: 0, footprintOffsetsByParity: anchorOnly }, // Grand Canyon (H)
          { featureType: 39, direction: 0, footprintOffsetsByParity: anchorOnly }, // Uluru (H)
          { featureType: 30, direction: 0, footprintOffsetsByParity: anchorOnly }, // Redwood (I)
        ],
      },
      naturalWonderSelection(0)
    );

    expect(result.plannedCount).toBe(2);
    const placed = result.placements.map((p) => p.featureType).sort((a, b) => a - b);
    // Cross-group MIX: one arid (31) + one forest (30); the 2nd arid (39) is NOT
    // selected because the decay made it lose to the fresh forest group.
    expect(placed).toEqual([30, 31]);
  });
});
