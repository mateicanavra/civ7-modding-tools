import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import placementDomain from "@mapgen/domain/placement/ops";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import type { Static } from "@swooper/mapgen-core/authoring";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { artifactModules as placementArtifactModules } from "../../../../../../src/recipes/standard/stages/placement/artifacts/index.js";
import { materializeStartAssignment } from "../../../../../../src/recipes/standard/stages/placement/steps/assign-starts/materialize.js";
import { TEST_MAP_SIZE } from "../../../../../map-size.js";

const { planStarts } = placementDomain.ops;
type StartInput = Static<(typeof planStarts)["input"]>;

function makeInput(
  width: number,
  height: number,
  playersLandmass1: number,
  playersLandmass2: number,
  alivePlayerIds?: number[]
) {
  const size = width * height;
  const landmassTileCounts: number[] = [];
  return {
    baseStarts: { playersLandmass1, playersLandmass2 },
    ...(alivePlayerIds === undefined ? {} : { alivePlayerIds }),
    width,
    height,
    landMask: new Uint8Array(size),
    slotByTile: new Uint8Array(size),
    landmassIdByTile: new Int32Array(size).fill(-1),
    landmassTileCounts,
    coastalLand: new Uint8Array(size),
    distanceToCoast: new Uint16Array(size),
    shelfMask: new Uint8Array(size),
    elevation: new Int16Array(size),
    fertility: new Float32Array(size).fill(0.55),
    effectiveMoisture: new Float32Array(size).fill(0.55),
    surfaceTemperature: new Float32Array(size).fill(16),
    aridityIndex: new Float32Array(size).fill(0.35),
    riverClass: new Uint8Array(size),
    lakeMask: new Uint8Array(size),
  } satisfies StartInput;
}

function addLandmass(
  input: ReturnType<typeof makeInput>,
  tiles: ReadonlyArray<readonly [number, number]>
): void {
  input.landmassTileCounts[0] = tiles.length;
  for (const [x, y] of tiles) {
    const plotIndex = y * input.width + x;
    input.landMask[plotIndex] = 1;
    input.slotByTile[plotIndex] = 1;
    input.landmassIdByTile[plotIndex] = 0;
    input.coastalLand[plotIndex] = 1;
  }
}

function plan(
  input: StartInput,
  configure?: (config: (typeof planStarts.defaultConfig)["config"]) => void
) {
  const selection = structuredClone(planStarts.defaultConfig);
  selection.config.minContiguousLandTiles = 12;
  selection.config.minExpansionLandTiles = 6;
  selection.config.minIslandClusterLandTiles = 8;
  selection.config.maxIslandStartCoastDistance = 1;
  selection.config.spacingFloorTiles = 2;
  selection.config.desiredSpacingTiles = 4;
  configure?.(selection.config);
  return runAdmittedOperationForTest(planStarts, input, selection);
}

function contextFor() {
  const adapter = createMockAdapter({
    ...TEST_MAP_SIZE.dimensions,
    mapInfo: TEST_MAP_SIZE.mapInfo,
    mapSizeId: TEST_MAP_SIZE.id,
  });
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: 1,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: {
        topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
        bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
      },
    }),
    adapter,
  });
  return { adapter, context };
}

describe("start materializer (thin shell)", () => {
  it("stamps every seated intent via setStartPosition with the op's playerId and validates", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const input = makeInput(width, height, 2, 0, [4, 9]);
    addLandmass(
      input,
      Array.from({ length: 80 }, (_value, i) => [1 + (i % 10), 1 + Math.floor(i / 10)] as const)
    );
    const planned = plan(input);
    const { adapter, context } = contextFor();

    const assignment = materializeStartAssignment({ context, plan: planned });

    expect(assignment.assigned).toBe(2);
    expect(adapter.calls.setStartPosition.map((call) => call.playerId).sort()).toEqual([4, 9]);
    expect(
      adapter.calls.setStartPosition.map((call) => call.plotIndex).sort((a, b) => a - b)
    ).toEqual([...assignment.positions].sort((a, b) => a - b));
    expect(placementArtifactModules.startAssignment.validate(assignment)).toEqual([]);
    const [firstPosition, secondPosition] = assignment.positions;
    if (firstPosition === undefined || secondPosition === undefined) {
      throw new Error("Expected two materialized start positions.");
    }
    const spacing = hexDistanceOddQPeriodicX(firstPosition, secondPosition, input.width);
    expect(spacing).toBeGreaterThanOrEqual(2);
  });

  it("hard-fails ONLY when literally zero settleable land candidates exist", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const input = makeInput(width, height, 1, 0);
    const planned = plan(input);
    const { context } = contextFor();

    expect(() => materializeStartAssignment({ context, plan: planned })).toThrow(
      /No settleable land candidates/
    );
  });

  it("materializes degraded plans as data (no assign-or-throw)", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const input = makeInput(width, height, 3, 0);
    addLandmass(input, [
      [2, 2],
      [5, 4],
    ]);
    const planned = plan(input, (config) => {
      config.spacingFloorTiles = 1;
      config.desiredSpacingTiles = 2;
    });
    const { adapter, context } = contextFor();

    const assignment = materializeStartAssignment({ context, plan: planned });

    expect(assignment.assigned).toBe(2);
    expect(assignment.unseatedCount).toBe(1);
    expect(assignment.status).toBe("degraded");
    expect(adapter.calls.setStartPosition.length).toBe(2);
    expect(placementArtifactModules.startAssignment.validate(assignment)).toEqual([]);
  });
});
