import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";

import { BOUNDARY_TYPE } from "../../src/domain/foundation/constants.js";
import planIslandChains from "../../src/domain/morphology/ops/plan-island-chains/index.js";
import { mapArtifacts } from "../../src/recipes/standard/map-artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import islandsStep from "../../src/recipes/standard/stages/morphology-features/steps/islands.js";
import { buildTestDeps } from "../support/step-deps.js";

function componentSizes(mask: Uint8Array, width: number, height: number): number[] {
  const seen = new Uint8Array(mask.length);
  const sizes: number[] = [];
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 1 || seen[i] === 1) continue;
    let size = 0;
    const queue = [i];
    seen[i] = 1;
    while (queue.length > 0) {
      const current = queue.pop()!;
      size += 1;
      const x = current % width;
      const y = (current / width) | 0;
      for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
        if (mask[neighbor] !== 1 || seen[neighbor] === 1) continue;
        seen[neighbor] = 1;
        queue.push(neighbor);
      }
    }
    sizes.push(size);
  }
  sizes.sort((a, b) => b - a);
  return sizes;
}

describe("morphology plan-island-chains", () => {
  it("builds connected volcanic archipelago chains instead of singleton dot scatter", () => {
    const width = 24;
    const height = 8;
    const size = width * height;
    const boundaryCloseness = new Uint8Array(size).fill(210);
    const boundaryType = new Uint8Array(size).fill(BOUNDARY_TYPE.convergent);
    const volcanism = new Uint8Array(size).fill(230);
    const movementU = new Int8Array(size).fill(127);
    const movementV = new Int8Array(size);

    const result = planIslandChains.run(
      {
        width,
        height,
        landMask: new Uint8Array(size),
        boundaryCloseness,
        boundaryType,
        volcanism,
        movementU,
        movementV,
        rngSeed: 17,
      },
      {
        strategy: "default",
        config: {
          ...(planIslandChains.defaultConfig as any).config,
          islands: {
            ...(planIslandChains.defaultConfig as any).config.islands,
            fractalThresholdPercent: 0,
            minDistFromLandRadius: 0,
            baseIslandDenNearActive: 1,
            baseIslandDenElse: 1,
            hotspotSeedDenom: 1,
            clusterMax: 6,
            microcontinentChance: 0,
          },
        },
      }
    );

    const mask = new Uint8Array(size);
    for (const edit of result.edits) mask[edit.index] = 1;
    const sizes = componentSizes(mask, width, height);
    const singletonTiles = sizes.filter((size) => size === 1).length;

    expect(result.edits.length).toBeGreaterThan(0);
    expect(sizes[0]).toBeGreaterThanOrEqual(4);
    expect(singletonTiles / Math.max(1, result.edits.length)).toBeLessThanOrEqual(0.15);
  });
});

describe("morphology islands step", () => {
  it("materializes both coast and peak island edits as land", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(true);
    const context = createExtendedMapContext(
      { width, height },
      adapter,
      {
        seed: 1,
        dimensions: { width, height },
        latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
      }
    );
    context.buffers.heightfield.landMask.fill(0);
    context.buffers.heightfield.elevation.fill(-4);
    const bathymetry = new Int16Array(size).fill(-4);

    const artifacts = implementArtifacts(
      [mapArtifacts.foundationPlates, morphologyArtifacts.topography],
      { foundationPlates: {}, topography: {} }
    );
    artifacts.foundationPlates.publish(context, {
      id: new Int16Array(size),
      boundaryCloseness: new Uint8Array(size),
      boundaryType: new Uint8Array(size),
      tectonicStress: new Uint8Array(size),
      upliftPotential: new Uint8Array(size),
      riftPotential: new Uint8Array(size),
      shieldStability: new Uint8Array(size),
      volcanism: new Uint8Array(size),
      movementU: new Int8Array(size),
      movementV: new Int8Array(size),
      rotation: new Int8Array(size),
    });
    artifacts.topography.publish(context, {
      elevation: context.buffers.heightfield.elevation,
      seaLevel: 0,
      landMask: context.buffers.heightfield.landMask,
      bathymetry,
    });

    const ops = {
      islands: () => ({
        edits: [
          { index: 5, kind: "coast" as const },
          { index: 6, kind: "peak" as const },
        ],
      }),
    };

    islandsStep.run(
      context,
      { islands: { strategy: "default", config: {} } } as any,
      ops as any,
      buildTestDeps(islandsStep)
    );

    expect(context.buffers.heightfield.landMask[5]).toBe(1);
    expect(context.buffers.heightfield.landMask[6]).toBe(1);
    expect(context.buffers.heightfield.elevation[5]).toBe(1);
    expect(context.buffers.heightfield.elevation[6]).toBe(3);
    expect(bathymetry[5]).toBe(0);
    expect(bathymetry[6]).toBe(0);
  });
});
