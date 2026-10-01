import { describe, expect, it } from "bun:test";
import { standardStageContractManifest } from "../../../src/recipes/standard/contract-manifest.js";
import { artifacts } from "../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";

describe("Standard physical water and surface order", () => {
  it("settles ground before water, surface categories after water, and native rivers after elevation", () => {
    const stages = standardStageContractManifest.map(({ id }) => id);
    const ordered = [
      "morphology-erosion", "morphology-islands", "morphology-shelf",
      "hydrology-climate-baseline", "hydrology-hydrography", "morphology-features",
      "hydrology-climate-refine", "ecology-pedology", "ecology-biomes",
      "map-morphology", "map-hydrology", "map-elevation", "map-rivers", "ecology-features",
    ];
    for (let i = 1; i < ordered.length; i++) {
      expect(stages.indexOf(ordered[i - 1]!)).toBeGreaterThanOrEqual(0);
      expect(stages.indexOf(ordered[i]!)).toBeGreaterThan(stages.indexOf(ordered[i - 1]!));
    }
    expect(standardStageContractManifest.find(({ id }) => id === "hydrology-hydrography")?.steps.map(({ contract }) => contract.id)).toEqual(["network"]);
    expect(standardStageContractManifest.find(({ id }) => id === "morphology-islands")?.steps.map(({ contract }) => contract.id)).toEqual(["islands"]);
    const features = standardStageContractManifest.find(({ id }) => id === "morphology-features")!;
    expect(features.steps.map(({ contract }) => contract.id)).toEqual(["landmasses", "resolved-coastline", "mountains", "volcanoes"]);
    for (const { contract } of features.steps) {
      expect(contract.requires).toContain(artifacts.hydrography);
    }
  });
});
