import { describe, expect, it } from "bun:test";

import { assertModeledLandBiomeCoverage } from "../../../../src/recipes/standard/metrics/capture.js";
import { artifactModules as ecologyArtifactModules } from "../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { artifactModules as hydrologyHydrographyArtifactModules } from "../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { artifactModules as morphologyArtifactModules } from "../../../../src/recipes/standard/stages/morphology/artifacts/index.js";

const dimensions = { width: 1, height: 1 } as const;

describe("metric source artifact validation", () => {
  it("refuses unknown biome indices and non-finite classifier fields", () => {
    const payload = biomePayload();
    payload.biomeIndex[0] = 8;
    payload.effectiveMoisture[0] = Number.NaN;

    const messages = ecologyArtifactModules.biomeClassification
      .validate(payload, { dimensions })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("closed biome vocabulary"))).toBe(true);
    expect(messages.some((message) => message.includes("effectiveMoisture"))).toBe(true);
  });

  it("admits the explicit biome sentinel off modeled land", () => {
    const value = biomePayload();
    value.biomeIndex[0] = 255;

    expect(ecologyArtifactModules.biomeClassification.validate(value, { dimensions })).toEqual([]);
    expect(() =>
      assertModeledLandBiomeCoverage(new Uint8Array([0]), value.biomeIndex)
    ).not.toThrow();
  });

  it("refuses the explicit biome sentinel on modeled land", () => {
    expect(() =>
      assertModeledLandBiomeCoverage(new Uint8Array([1]), new Uint8Array([255]))
    ).toThrow("unclassified biome on modeled-land tile 0");
  });

  it("refuses nonbinary orographic region masks", () => {
    const payload = {
      mountainMask: new Uint8Array(1),
      mountainRegionMask: new Uint8Array([2]),
      mountainRegionIdByTile: new Int32Array([-1]),
      hillMask: new Uint8Array(1),
      foothillMask: new Uint8Array(1),
      roughLandMask: new Uint8Array(1),
      orogenyPotential: new Uint8Array(1),
      fracturePotential: new Uint8Array(1),
      roughnessPotential: new Uint8Array(1),
    };

    expect(
      morphologyArtifactModules.mountains
        .validate(payload, { dimensions })
        .some((issue) => issue.message.includes("mountainRegionMask"))
    ).toBe(true);
  });

  it("refuses wrong mountain-field constructors and map-size mismatches", () => {
    const payload = mountainPayload() as Record<string, unknown>;
    payload.orogenyPotential = [0];
    payload.roughnessPotential = new Uint8Array(2);

    const messages = morphologyArtifactModules.mountains
      .validate(payload, { dimensions })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("orogenyPotential to be Uint8Array"))).toBe(
      true
    );
    expect(messages.some((message) => message.includes("roughnessPotential length 1"))).toBe(true);
  });

  it("refuses nonbinary outlets and unknown terminal classes", () => {
    const payload = hydrographyPayload();
    payload.outletMask[0] = 2;
    payload.terminalType[0] = 3;

    const messages = hydrologyHydrographyArtifactModules.hydrography
      .validate(payload, { dimensions })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("outletMask"))).toBe(true);
    expect(messages.some((message) => message.includes("terminalType"))).toBe(true);
  });
});

function biomePayload() {
  return {
    width: 1,
    height: 1,
    biomeIndex: new Uint8Array(1),
    vegetationDensity: new Float32Array(1),
    effectiveMoisture: new Float32Array(1),
    surfaceTemperature: new Float32Array(1),
    aridityIndex: new Float32Array(1),
    freezeIndex: new Float32Array(1),
    groundIce01: new Float32Array(1),
    permafrost01: new Float32Array(1),
    meltPotential01: new Float32Array(1),
    treeLine01: new Float32Array(1),
  };
}

function mountainPayload() {
  return {
    mountainMask: new Uint8Array(1),
    mountainRegionMask: new Uint8Array(1),
    mountainRegionIdByTile: new Int32Array([-1]),
    hillMask: new Uint8Array(1),
    foothillMask: new Uint8Array(1),
    roughLandMask: new Uint8Array(1),
    orogenyPotential: new Uint8Array(1),
    fracturePotential: new Uint8Array(1),
    roughnessPotential: new Uint8Array(1),
  };
}

function hydrographyPayload() {
  return {
    runoff: new Float32Array(1),
    discharge: new Float32Array(1),
    riverClass: new Uint8Array(1),
    flowDir: new Int32Array([-1]),
    sinkMask: new Uint8Array(1),
    outletMask: new Uint8Array(1),
    terminalType: new Uint8Array(1),
  };
}
