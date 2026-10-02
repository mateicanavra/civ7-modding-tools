import { describe, expect, it } from "bun:test";
import { artifacts as erosionArtifacts } from "../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts } from "../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { ClimateBaselineStep } from "../../../../../src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/step.js";
import { IslandsStep } from "../../../../../src/recipes/standard/stages/morphology/islands/steps/islands/step.js";
import { ComputeShelfStep } from "../../../../../src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/step.js";

const dimensions = { width: 3, height: 2 };
const fixture = () => ({
  elevation: new Int16Array([5, -2, -3, -4, 5, 5]),
  seaLevel: 0,
  landMask: new Uint8Array([1, 0, 0, 0, 1, 1]),
  bathymetry: new Int16Array([0, -2, -3, -4, 0, 0]),
  externalWaterMask: new Uint8Array([0, 1, 1, 0, 0, 0]),
});

describe("initial topography publication vintage", () => {
  it("owns a distinct provider with the same five field atoms and no final Landforms alias", () => {
    expect(artifacts.initialTopography.name).toBe("initialTopography");
    expect(artifacts.initialTopography.id).toBe("artifact:morphology.topography.initial");
    expect(erosionArtifacts.topography.id).toBe("artifact:morphology.topography");
    expect(artifacts.initialTopography).not.toBe(erosionArtifacts.topography);
    expect(artifacts.initialTopography.schema.properties).toEqual(
      erosionArtifacts.topography.schema.properties
    );
    expect("topography" in artifacts).toBe(false);
  });

  it("selects initial terrain for islands, fixed shelf and baseline climate, never final terrain", () => {
    expect(IslandsStep.contract.provides).toEqual([artifacts.initialTopography]);
    for (const step of [ComputeShelfStep, ClimateBaselineStep]) {
      expect(step.contract.requires).toContain(artifacts.initialTopography);
      expect(step.contract.requires).not.toContain(erosionArtifacts.topography);
    }
  });

  it("retains initial-water and fixed-head admission without changing supplied fields", () => {
    const value = fixture();
    const before = structuredClone(value);
    expect(artifacts.initialTopography.validate(value, { dimensions })).toEqual([]);
    expect(value).toEqual(before);
    value.externalWaterMask[0] = 1;
    value.externalWaterMask[1] = 2;
    value.elevation[2] = 1;
    value.landMask[3] = 2;
    const messages = artifacts.initialTopography
      .validate(value, { dimensions })
      .map(({ message }) => message);
    expect(messages.some((message) => message.includes("externalWaterMask[1] must be binary"))).toBe(true);
    expect(messages.some((message) => message.includes("landMask[3] must be binary"))).toBe(true);
    expect(messages.some((message) => message.includes("subset of initial water"))).toBe(true);
    expect(messages.some((message) => message.includes("prescribed seaLevel datum"))).toBe(true);
  });

  it("requires exact grid buffers, the declaration and a finite existing sea datum", () => {
    const { externalWaterMask: _, ...withoutDeclaration } = fixture();
    expect(
      artifacts.initialTopography.validate(withoutDeclaration, { dimensions }).length
    ).toBeGreaterThan(0);
    expect(
      artifacts.initialTopography.validate(
        { ...fixture(), elevation: new Int16Array(5) },
        { dimensions }
      ).length
    ).toBeGreaterThan(0);
    for (const seaLevel of [NaN, Infinity, -Infinity]) {
      expect(
        artifacts.initialTopography.validate({ ...fixture(), seaLevel }, { dimensions }).length
      ).toBeGreaterThan(0);
    }
  });
});
