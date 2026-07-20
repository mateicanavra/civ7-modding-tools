import { describe, expect, it } from "bun:test";
import morphology from "@mapgen/domain/morphology/ops";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";

const { planRoughLands } = morphology.ops;
type RoughLandSelection = Extract<
  Parameters<typeof planRoughLands.run>[1],
  { strategy: "default" }
>;

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (const value of mask) if (value === 1) count++;
  return count;
}

function createInput(width: number, height: number) {
  const size = width * height;
  return {
    width,
    height,
    landMask: new Uint8Array(size).fill(1),
    mountainMask: new Uint8Array(size),
    mountainRegionMask: new Uint8Array(size),
    mountainRegionIdByTile: new Int32Array(size).fill(-1),
    foothillMask: new Uint8Array(size),
    elevation: new Int16Array(size).fill(30),
    seaLevel: 0,
    boundaryCloseness: new Uint8Array(size).fill(180),
    boundaryType: new Uint8Array(size).fill(BOUNDARY_TYPE.transform),
    upliftPotential: new Uint8Array(size).fill(220),
    riftPotential: new Uint8Array(size).fill(80),
    tectonicStress: new Uint8Array(size).fill(220),
    beltAge: new Uint8Array(size).fill(180),
    erodibilityK: new Float32Array(size).fill(0.1),
    sedimentDepth: new Float32Array(size).fill(0.1),
    flowAccum: new Float32Array(size).fill(6),
    distanceToCoast: new Uint16Array(size).fill(6),
    fractalRoughLand: new Int16Array(size).fill(255),
  };
}

function roughLandConfig(
  overrides: Partial<RoughLandSelection["config"]> = {}
): RoughLandSelection {
  return {
    strategy: "default",
    config: {
      ...planRoughLands.defaultConfig.config,
      driverSignalByteMin: 0,
      driverExponent: 1,
      hillThreshold: 0.01,
      tectonicIntensity: 1,
      ...overrides,
    },
  } satisfies RoughLandSelection;
}

describe("morphology/plan-rough-lands", () => {
  it("excludes water, mountains, and existing foothills while respecting remaining hill budget", () => {
    const syntheticDimensions = { width: 8, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const input = createInput(width, height);
    input.landMask[15] = 0;
    input.mountainMask[3] = 1;
    input.foothillMask[0] = 1;
    input.foothillMask[1] = 1;

    const result = planRoughLands.run(input, roughLandConfig({ hillMaxFraction: 0.25 }));

    expect(result.hillMask[15], "water tile").toBe(0);
    expect(result.hillMask[3], "mountain tile").toBe(0);
    expect(result.hillMask[0], "foothill tile 0").toBe(0);
    expect(result.hillMask[1], "foothill tile 1").toBe(0);
    expect(countMask(result.hillMask)).toBe(1);
    expect(result.roughnessPotential[2]).toBeGreaterThan(0);
  });

  it("does not turn fractal texture alone into rough-land hills", () => {
    const syntheticDimensions = { width: 5, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const input = createInput(width, height);
    input.boundaryCloseness.fill(0);
    input.boundaryType.fill(BOUNDARY_TYPE.none);
    input.upliftPotential.fill(0);
    input.riftPotential.fill(0);
    input.tectonicStress.fill(0);
    input.beltAge.fill(0);
    input.elevation.fill(0);
    input.erodibilityK.fill(1);
    input.sedimentDepth.fill(1);
    input.flowAccum.fill(0);
    input.distanceToCoast.fill(0);
    input.fractalRoughLand.fill(255);

    const result = planRoughLands.run(input, roughLandConfig({ hillMaxFraction: 1 }));

    expect(countMask(result.hillMask)).toBe(0);
    expect(Math.max(...result.roughnessPotential)).toBe(0);
  });

  it("keeps broad uplifted plateaus flat when there is no local relief or active deformation", () => {
    const syntheticDimensions = { width: 8, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const input = createInput(width, height);
    input.boundaryCloseness.fill(0);
    input.boundaryType.fill(BOUNDARY_TYPE.none);
    input.upliftPotential.fill(220);
    input.riftPotential.fill(0);
    input.tectonicStress.fill(0);
    input.beltAge.fill(180);
    input.elevation.fill(70);
    input.erodibilityK.fill(0.1);
    input.sedimentDepth.fill(0.1);
    input.flowAccum.fill(0);
    input.distanceToCoast.fill(8);
    input.fractalRoughLand.fill(255);

    const result = planRoughLands.run(input, roughLandConfig({ hillMaxFraction: 1 }));

    expect(countMask(result.hillMask)).toBe(0);
  });
});
