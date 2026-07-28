import { describe, expect, it } from "bun:test";

import { ISLAND_FORMATION_CLASS } from "../../../../../../src/domain/morphology/modules/landforms/model/policy/island-formation.js";
import morphology from "../../../../../../src/domain/morphology/router.js";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import {
  createIslandTopographyInput,
  createIslandTopographySelection,
} from "./fixtures/island-topography.js";

const { computeIslandTopography } = morphology.landforms.ops;
const islandFormationClasses = new Set<number>(Object.values(ISLAND_FORMATION_CLASS));

describe("compute-island-topography surface coherence", () => {
  it("returns one deterministic complete product without mutating or aliasing admitted topography", () => {
    const input = createIslandTopographyInput();
    const inputSnapshots = {
      elevation: input.elevation.slice(),
      landMask: input.landMask.slice(),
      bathymetry: input.bathymetry.slice(),
      distanceToCoast: input.distanceToCoast.slice(),
      boundaryCloseness: input.boundaryCloseness.slice(),
      boundaryType: input.boundaryType.slice(),
      volcanism: input.volcanism.slice(),
    };
    const selection = createIslandTopographySelection(1);

    const first = runAdmittedOperationForTest(computeIslandTopography, input, selection);
    const second = runAdmittedOperationForTest(computeIslandTopography, input, selection);

    expect(input.elevation).toEqual(inputSnapshots.elevation);
    expect(input.landMask).toEqual(inputSnapshots.landMask);
    expect(input.bathymetry).toEqual(inputSnapshots.bathymetry);
    expect(input.distanceToCoast).toEqual(inputSnapshots.distanceToCoast);
    expect(input.boundaryCloseness).toEqual(inputSnapshots.boundaryCloseness);
    expect(input.boundaryType).toEqual(inputSnapshots.boundaryType);
    expect(input.volcanism).toEqual(inputSnapshots.volcanism);

    expect(first.topography.elevation).not.toBe(input.elevation);
    expect(first.topography.landMask).not.toBe(input.landMask);
    expect(first.topography.bathymetry).not.toBe(input.bathymetry);
    expect(first.topography.elevation).toEqual(second.topography.elevation);
    expect(first.topography.landMask).toEqual(second.topography.landMask);
    expect(first.topography.bathymetry).toEqual(second.topography.bathymetry);
    expect(first.islandClass).toEqual(second.islandClass);

    let formedTileCount = 0;
    let unchangedTileCount = 0;
    const invalidFormationClasses: number[] = [];
    const mutatedUnchangedTiles: number[] = [];
    const incoherentFormedTiles: number[] = [];
    for (let index = 0; index < first.islandClass.length; index += 1) {
      const formationClass = first.islandClass[index] ?? 0;
      if (!islandFormationClasses.has(formationClass)) invalidFormationClasses.push(index);

      if (formationClass === ISLAND_FORMATION_CLASS.unchanged) {
        unchangedTileCount += 1;
        if (
          first.topography.elevation[index] !== input.elevation[index] ||
          first.topography.landMask[index] !== input.landMask[index] ||
          first.topography.bathymetry[index] !== input.bathymetry[index]
        ) {
          mutatedUnchangedTiles.push(index);
        }
        continue;
      }

      formedTileCount += 1;
      if (
        first.topography.landMask[index] !== 1 ||
        (first.topography.elevation[index] ?? first.topography.seaLevel) <=
          first.topography.seaLevel ||
        first.topography.bathymetry[index] !== 0
      ) {
        incoherentFormedTiles.push(index);
      }
    }

    expect(invalidFormationClasses).toEqual([]);
    expect(mutatedUnchangedTiles).toEqual([]);
    expect(incoherentFormedTiles).toEqual([]);
    expect(formedTileCount).toBeGreaterThan(0);
    expect(unchangedTileCount).toBeGreaterThan(0);
  });
});
