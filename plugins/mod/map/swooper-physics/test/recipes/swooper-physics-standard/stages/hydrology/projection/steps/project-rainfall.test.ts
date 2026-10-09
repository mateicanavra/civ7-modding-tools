import { describe, expect, it } from "bun:test";
import { MockAdapter } from "@civ7/adapter";
import { artifacts as climateArtifacts } from "../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { ProjectRainfallStep } from "../../../../../../../src/recipes/standard/stages/hydrology/projection/steps/project-rainfall/step.js";
import { PlotRiversStep } from "../../../../../../../src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/step.js";
import { TEST_MAP_SEED } from "../../../../../../setup.js";

const SYNTHETIC_DIMENSIONS = { width: 3, height: 2 } as const;

class RainfallRecordingAdapter extends MockAdapter {
  readonly projected: { x: number; y: number; rainfall: number }[] = [];

  override setRainfall(x: number, y: number, rainfall: number): void {
    this.projected.push({ x, y, rainfall });
    super.setRainfall(x, y, rainfall);
  }
}

describe("map-hydrology/project-rainfall", () => {
  it("does not invent a native rainfall prerequisite for authored river projection", () => {
    expect(ProjectRainfallStep.contract.provides).toEqual([]);
    expect(PlotRiversStep.contract.requires).not.toContain("completion:map.rainfall-projected");
    expect(PlotRiversStep.contract.engine).not.toContain("modelRivers");
  });

  it("projects only the native codec exactly once in row-major order", () => {
    const { width, height } = SYNTHETIC_DIMENSIONS;
    const rainfallCodec = new Uint8Array([0, 17, 200, 42, 81, 133]);
    const precipitation = new Float32Array([0.25, 17.25, 420.5, 42.25, 81.25, 133.25]);
    const surfaceWetness = new Float32Array([0.1, 0.2, 1, 0.4, 0.5, 0.6]);
    const adapter = new RainfallRecordingAdapter({ width, height });
    const context = createMapContext({
      setup: admitMapSetup({
        mapSeed: TEST_MAP_SEED,
        dimensions: SYNTHETIC_DIMENSIONS,
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      }),
      adapter,
    });
    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, climateArtifacts.climateField, {
        precipitation,
        surfaceWetness,
        rainfallCodec,
      });

      ProjectRainfallStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(ProjectRainfallStep, stepContext)
      );
    });

    expect(adapter.projected).toEqual([
      { x: 0, y: 0, rainfall: 0 },
      { x: 1, y: 0, rainfall: 17 },
      { x: 2, y: 0, rainfall: 200 },
      { x: 0, y: 1, rainfall: 42 },
      { x: 1, y: 1, rainfall: 81 },
      { x: 2, y: 1, rainfall: 133 },
    ]);
    expect(adapter.projected).toHaveLength(width * height);
    expect(precipitation).toEqual(new Float32Array([0.25, 17.25, 420.5, 42.25, 81.25, 133.25]));
    expect(surfaceWetness).toEqual(new Float32Array([0.1, 0.2, 1, 0.4, 0.5, 0.6]));
  });
});
