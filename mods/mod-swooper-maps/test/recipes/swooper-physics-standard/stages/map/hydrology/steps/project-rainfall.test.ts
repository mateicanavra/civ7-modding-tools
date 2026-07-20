import { describe, expect, it } from "bun:test";
import { MockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifactModules as hydrologyClimateRefineArtifactModules } from "../../../../../../../src/recipes/standard/stages/hydrology-climate-refine/artifacts/index.js";
import { ProjectRainfallStep } from "../../../../../../../src/recipes/standard/stages/map-hydrology/steps/project-rainfall/step.js";

const SYNTHETIC_DIMENSIONS = { width: 3, height: 2 } as const;

class RainfallRecordingAdapter extends MockAdapter {
  readonly projected: { x: number; y: number; rainfall: number }[] = [];

  override setRainfall(x: number, y: number, rainfall: number): void {
    this.projected.push({ x, y, rainfall });
    super.setRainfall(x, y, rainfall);
  }
}

describe("map-hydrology/project-rainfall", () => {
  it("projects every final-refined rainfall sample exactly once in row-major order", () => {
    const { width, height } = SYNTHETIC_DIMENSIONS;
    const rainfall = new Uint8Array([0, 17, 200, 42, 81, 133]);
    const adapter = new RainfallRecordingAdapter({ width, height });
    const context = createMapContext({
      setup: admitMapSetup({
        mapSeed: 7,
        dimensions: SYNTHETIC_DIMENSIONS,
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      }),
      adapter,
    });
    withMapContextExecutionForTest(context, () => {
      publishTestArtifact(context, hydrologyClimateRefineArtifactModules.climateField, {
        rainfall,
        humidity: new Uint8Array(width * height),
      });

      ProjectRainfallStep.run(context, {}, {}, buildStepTestDependencies(ProjectRainfallStep));
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
  });
});
