import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import type { MapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  runStandardRecipeTestMap,
  type StandardRecipeTestAdapterInput,
} from "../../fixtures/standard-recipe.js";

class RegionSensitiveResourceAdapter extends MockAdapter {
  readonly callOrder: string[] = [];

  override setLandmassRegionId(x: number, y: number, regionId: number): void {
    this.callOrder.push("setLandmassRegionId");
    super.setLandmassRegionId(x, y, regionId);
  }

  override validateAndFixTerrain(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        super.setLandmassRegionId(x, y, this.getLandmassId("NONE"));
      }
    }
  }

  override placeResourceIntent(
    intent: Parameters<MockAdapter["placeResourceIntent"]>[0]
  ): ReturnType<MockAdapter["placeResourceIntent"]> {
    this.callOrder.push("placeResourceIntent");
    return super.placeResourceIntent(intent);
  }
}

class RestampFailingAdapter extends RegionSensitiveResourceAdapter {
  override setLandmassRegionId(x: number, y: number, regionId: number): void {
    void x;
    void y;
    void regionId;
    throw new Error("forced restamp failure");
  }
}

type RegionAdapterFactory<TAdapter extends MockAdapter> = (
  input: StandardRecipeTestAdapterInput
) => TAdapter;

function runRecipeWithAdapter<TAdapter extends MockAdapter>(
  createAdapter: RegionAdapterFactory<TAdapter>
): Readonly<{ adapter: TAdapter; context: MapContext }> {
  return runStandardRecipeTestMap({
    mapInfo: {
      PlayersLandmass1: 1,
      PlayersLandmass2: 1,
      StartSectorRows: 1,
      StartSectorCols: 1,
      NumNaturalWonders: 0,
    },
    createAdapter,
    prepare: ({ preset, adapter }) => {
      const flatTerrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT;
      for (let y = 0; y < preset.dimensions.height; y++) {
        for (let x = 0; x < preset.dimensions.width; x++) {
          adapter.setTerrainType(x, y, flatTerrain);
        }
      }
    },
  });
}

describe("placement resources landmass-region restamp", () => {
  it("re-stamps landmass regions before typed resource materialization", () => {
    const { adapter, context } = runRecipeWithAdapter(
      ({ preset, mapInfo, mapSeed }) =>
        new RegionSensitiveResourceAdapter({
          ...preset.dimensions,
          mapInfo,
          mapSizeId: preset.id,
          rng: createLabelRng(mapSeed),
        })
    );

    const firstRestamp = adapter.callOrder.indexOf("setLandmassRegionId");
    const firstResourceIntent = adapter.callOrder.indexOf("placeResourceIntent");
    const resourceOutcomes = readValidatedArtifact(
      context,
      resourceSiteArtifacts.resourcePlacementOutcomes
    );

    expect(firstRestamp).toBeGreaterThanOrEqual(0);
    expect(firstResourceIntent).toBeGreaterThan(firstRestamp);
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(resourceOutcomes.summary.plannedCount).toBeGreaterThan(0);
    expect(adapter.calls.setResourceType.length).toBe(resourceOutcomes.summary.placedCount);
  });

  it("aborts placement before resource materialization when region restamp fails", () => {
    let adapter: RestampFailingAdapter | undefined;

    expect(() =>
      runRecipeWithAdapter(({ preset, mapInfo, mapSeed }) => {
        adapter = new RestampFailingAdapter({
          ...preset.dimensions,
          mapInfo,
          mapSizeId: preset.id,
          rng: createLabelRng(mapSeed),
        });
        return adapter;
      })
    ).toThrow(/forced restamp failure/i);

    if (!adapter) throw new Error("Expected the failing adapter to be constructed.");
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.callOrder.includes("placeResourceIntent")).toBe(false);
    expect(adapter.calls.recalculateFertility).toBe(0);
    expect(adapter.calls.assignAdvancedStartRegions).toBe(0);
  });
});
