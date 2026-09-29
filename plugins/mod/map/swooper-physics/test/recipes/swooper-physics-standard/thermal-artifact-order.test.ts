import { describe, expect, it } from "bun:test";
import { artifacts } from "../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { standardStageContractManifest } from "../../../src/recipes/standard/contract-manifest.js";
import { config as refineConfig } from "../../../src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/config.js";

describe("Standard singular thermal ownership", () => {
  it("declares one producer per vintage and exact downstream thermal dependencies", () => {
    const steps = standardStageContractManifest.flatMap((stage) =>
      stage.steps.map(({ contract }) => ({ stage: stage.id, contract }))
    );
    const baseline = steps.find(({ contract }) => contract.id === "climate-baseline")!;
    const refine = steps.find(({ contract }) => contract.id === "climate-refine")!;
    expect(
      steps.filter(({ contract }) =>
        contract.provides.includes(artifacts.baselineSurfaceTemperature)
      )
    ).toEqual([baseline]);
    expect(
      steps.filter(({ contract }) => contract.provides.includes(artifacts.surfaceTemperature))
    ).toEqual([refine]);
    expect(refine.contract.requires).toContain(artifacts.baselineSurfaceTemperature);
    expect(refineConfig.ops).not.toHaveProperty("computeThermalState");
    expect(refineConfig.ops).not.toHaveProperty("computeRadiativeForcing");
    const consumers = steps.filter(({ contract }) =>
      contract.requires.includes(artifacts.surfaceTemperature)
    );
    expect(consumers.map(({ contract }) => contract.id).sort()).toEqual([
      "assign-starts",
      "biomes",
      "plan-natural-wonders",
      "plan-plot-effects",
      "plan-resource-demands",
      "plan-vegetation",
      "plot-biomes",
      "score-layers",
    ]);
    for (const consumer of consumers) {
      expect(steps.indexOf(consumer)).toBeGreaterThan(steps.indexOf(refine));
    }
    expect(
      consumers.find(({ contract }) => contract.id === "plot-biomes")!.contract.requires
    ).not.toContain(artifacts.climateIndices);
  });
});
