import { describe, expect, it } from "bun:test";
import { ISLAND_FORMATION_CLASS } from "@mapgen/domain/morphology/modules/landforms/model/policy/island-formation.js";
import morphology from "@mapgen/domain/morphology/router";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import {
  createIslandTopographyInput,
  createIslandTopographySelection,
} from "./fixtures/island-topography.js";

const { computeIslandTopography } = morphology.landforms.ops;
const MICROCONTINENT_PATCH_AREA_FACTOR = 0.75;
const MINIMUM_MICROCONTINENT_TILES = 20;

function connectedClassTileCount(
  formationClasses: Uint8Array,
  formationClass: number,
  width: number,
  height: number
): number {
  const seedIndex = formationClasses.findIndex((value) => value === formationClass);
  if (seedIndex < 0) return 0;

  const visited = new Set([seedIndex]);
  const frontier = [seedIndex];
  while (frontier.length > 0) {
    const index = frontier.pop();
    if (index === undefined) break;
    const y = Math.floor(index / width);
    const x = index - y * width;

    for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
      if (formationClasses[neighbor] !== formationClass || visited.has(neighbor)) continue;
      visited.add(neighbor);
      frontier.push(neighbor);
    }
  }
  return visited.size;
}

describe("compute-island-topography microcontinent admission", () => {
  it("maps probability boundaries to zero or one connected bounded microcontinent patch", () => {
    const input = createIslandTopographyInput();
    const rejected = runAdmittedOperationForTest(
      computeIslandTopography,
      input,
      createIslandTopographySelection(0)
    );
    const admittedSelection = createIslandTopographySelection(1);
    const admitted = runAdmittedOperationForTest(computeIslandTopography, input, admittedSelection);
    const microcontinentClass = ISLAND_FORMATION_CLASS.microcontinent;
    const rejectedTileCount = rejected.islandClass.filter(
      (value) => value === microcontinentClass
    ).length;
    const admittedTileCount = admitted.islandClass.filter(
      (value) => value === microcontinentClass
    ).length;
    const connectedTileCount = connectedClassTileCount(
      admitted.islandClass,
      microcontinentClass,
      input.width,
      input.height
    );
    const configuredPatchBound = Math.round(
      admittedSelection.config.clusterMax *
        admittedSelection.config.clusterMax *
        MICROCONTINENT_PATCH_AREA_FACTOR
    );

    const incoherentMicrocontinentTiles: number[] = [];
    for (let index = 0; index < admitted.islandClass.length; index += 1) {
      if (admitted.islandClass[index] !== microcontinentClass) continue;
      if (
        admitted.topography.landMask[index] !== 1 ||
        (admitted.topography.elevation[index] ?? admitted.topography.seaLevel) <=
          admitted.topography.seaLevel ||
        admitted.topography.bathymetry[index] !== 0
      ) {
        incoherentMicrocontinentTiles.push(index);
      }
    }

    expect(rejectedTileCount).toBe(0);
    expect(admittedTileCount).toBeGreaterThanOrEqual(MINIMUM_MICROCONTINENT_TILES);
    expect(admittedTileCount).toBeLessThanOrEqual(configuredPatchBound);
    expect(connectedTileCount).toBe(admittedTileCount);
    expect(incoherentMicrocontinentTiles).toEqual([]);
  });

  it("rejects a fragmented candidate whose connected capacity cannot satisfy the floor", () => {
    const input = createIslandTopographyInput(({ width, distanceToCoast }) => {
      distanceToCoast.fill(0);
      const pocketY = 10;
      const pocketStartX = 12;
      const pocketTileCount = MINIMUM_MICROCONTINENT_TILES - 1;
      for (let offset = 0; offset < pocketTileCount; offset += 1) {
        distanceToCoast[pocketY * width + pocketStartX + offset] = 1;
      }
    });
    const baseSelection = createIslandTopographySelection(1);
    const selection = {
      ...baseSelection,
      config: {
        ...baseSelection.config,
        minDistFromLandRadius: 1,
      },
    };

    const result = runAdmittedOperationForTest(computeIslandTopography, input, selection);
    const microcontinentTileCount = result.islandClass.filter(
      (value) => value === ISLAND_FORMATION_CLASS.microcontinent
    ).length;

    expect(microcontinentTileCount).toBe(0);
  });
});
