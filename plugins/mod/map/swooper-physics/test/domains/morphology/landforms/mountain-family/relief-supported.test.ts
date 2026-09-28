import { describe, expect, it } from "bun:test";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";
import morphology from "../../../../../src/domain/morphology/router.js";
import { computeLandNeighborRelief } from "../../../../../src/domain/morphology/modules/landforms/model/policy/land-neighbor-relief.js";

const { planRidges, planFoothills, planRoughLands } = morphology.landforms.ops;
type RidgeConfig = Parameters<typeof planRidges.run>[1]["config"];
type FoothillConfig = Parameters<typeof planFoothills.run>[1]["config"];
type RoughConfig = Parameters<typeof planRoughLands.run>[1]["config"];
type Input = Parameters<typeof planRidges.run>[0] &
  Parameters<typeof planFoothills.run>[0] & Parameters<typeof planRoughLands.run>[0];

function createInput(width: number, height: number, elevation: Int16Array) {
  const size = width * height;
  return {
    width,
    height,
    elevation,
    seaLevel: 0,
    landMask: new Uint8Array(size).fill(1),
    mountainMask: new Uint8Array(size),
    mountainRegionMask: new Uint8Array(size),
    mountainRegionIdByTile: new Int32Array(size).fill(-1),
    foothillMask: new Uint8Array(size),
    boundaryCloseness: new Uint8Array(size).fill(255),
    boundaryType: new Uint8Array(size).fill(BOUNDARY_TYPE.convergent),
    upliftPotential: new Uint8Array(size).fill(255),
    collisionPotential: new Uint8Array(size).fill(255),
    subductionPotential: new Uint8Array(size),
    riftPotential: new Uint8Array(size),
    tectonicStress: new Uint8Array(size).fill(255),
    beltAge: new Uint8Array(size),
    erodibilityK: new Float32Array(size).fill(0.1),
    sedimentDepth: new Float32Array(size).fill(0.1),
    flowAccum: new Float32Array(size).fill(6),
    distanceToCoast: new Uint16Array(size).fill(8),
    fractalMountain: new Int16Array(size).fill(255),
    fractalHill: new Int16Array(size).fill(255),
    fractalRoughLand: new Int16Array(size).fill(255),
  };
}

function ridges(input: Input, overrides: Partial<RidgeConfig> = {}) {
  return planRidges.run(
    {
      width: input.width,
      height: input.height,
      elevation: input.elevation,
      landMask: input.landMask,
      boundaryCloseness: input.boundaryCloseness,
      boundaryType: input.boundaryType,
      upliftPotential: input.upliftPotential,
      collisionPotential: input.collisionPotential,
      subductionPotential: input.subductionPotential,
      riftPotential: input.riftPotential,
      tectonicStress: input.tectonicStress,
      beltAge: input.beltAge,
      fractalMountain: input.fractalMountain,
    },
    {
      strategy: "orogenic-range-growth",
      config: {
        ...planRidges.defaultConfig.config,
        mountainMaxFraction: 1,
        mountainMinFraction: 0,
        mountainSpineFraction: 1,
        mountainRangeSpacingTiles: 0,
        mountainRangeLengthTiles: 0,
        mountainSpineDilationSteps: 0,
        mountainSpineMinDistance: 0,
        mountainThreshold: 0,
        driverSignalByteMin: 1,
        boundaryGate: 0,
        fractalWeight: 0,
        ...overrides,
      },
    }
  );
}

function foothills(input: Input, overrides: Partial<FoothillConfig> = {}) {
  return planFoothills.run(
    {
      width: input.width,
      height: input.height,
      elevation: input.elevation,
      landMask: input.landMask,
      mountainMask: input.mountainMask,
      mountainRegionMask: input.mountainRegionMask,
      mountainRegionIdByTile: input.mountainRegionIdByTile,
      boundaryCloseness: input.boundaryCloseness,
      boundaryType: input.boundaryType,
      upliftPotential: input.upliftPotential,
      collisionPotential: input.collisionPotential,
      subductionPotential: input.subductionPotential,
      riftPotential: input.riftPotential,
      tectonicStress: input.tectonicStress,
      beltAge: input.beltAge,
      fractalHill: input.fractalHill,
    },
    {
      strategy: "mountain-proximity",
      config: {
        ...planFoothills.defaultConfig.config,
        hillMaxFraction: 1,
        foothillMaxFraction: 1,
        foothillMinFraction: 1,
        hillThreshold: 0,
        driverSignalByteMin: 1,
        boundaryGate: 0,
        fractalWeight: 0,
        ...overrides,
      },
    }
  );
}

function roughLands(input: Input, overrides: Partial<RoughConfig> = {}) {
  return planRoughLands.run(
    {
      width: input.width,
      height: input.height,
      elevation: input.elevation,
      seaLevel: input.seaLevel,
      landMask: input.landMask,
      mountainMask: input.mountainMask,
      mountainRegionMask: input.mountainRegionMask,
      mountainRegionIdByTile: input.mountainRegionIdByTile,
      foothillMask: input.foothillMask,
      boundaryCloseness: input.boundaryCloseness,
      boundaryType: input.boundaryType,
      upliftPotential: input.upliftPotential,
      riftPotential: input.riftPotential,
      tectonicStress: input.tectonicStress,
      beltAge: input.beltAge,
      erodibilityK: input.erodibilityK,
      sedimentDepth: input.sedimentDepth,
      flowAccum: input.flowAccum,
      distanceToCoast: input.distanceToCoast,
      fractalRoughLand: input.fractalRoughLand,
    },
    {
      strategy: "relief-substrate-clusters",
      config: {
        ...planRoughLands.defaultConfig.config,
        hillMaxFraction: 1,
        roughLandMaxFraction: 1,
        hillThreshold: 0.1,
        driverSignalByteMin: 1,
        ...overrides,
      },
    }
  );
}

function count(mask: Uint8Array): number {
  return mask.reduce((sum, value) => sum + value, 0);
}

function reliefAt(input: Input, index: number) {
  return computeLandNeighborRelief({ ...input, index });
}

describe("land-neighbor relief geometry", () => {
  it("separates downward and upward support on a slope without requiring a summit", () => {
    const input = createInput(5, 1, Int16Array.of(0, 4, 8, 12, 16));
    expect(reliefAt(input, 2)).toEqual({ upward: 4, downward: 4 });
    expect(ridges(input).mountainMask[2]).toBe(1);
  });

  it("uses wrapped adjacency and never turns an ocean drop into land relief", () => {
    const input = createInput(4, 1, Int16Array.of(16, 16, 16, 0));
    expect(reliefAt(input, 0)).toEqual({ upward: 0, downward: 16 });
    expect(ridges(input).mountainMask[0]).toBe(1);
    input.landMask[3] = 0;
    input.elevation[3] = -300;
    expect(reliefAt(input, 0)).toEqual({ upward: 0, downward: 0 });
    expect(reliefAt(input, 3)).toEqual({ upward: 0, downward: 0 });
    expect(count(ridges(input).mountainMask)).toBe(0);
    expect(count(foothills(input).hillMask)).toBe(0);
    expect(count(roughLands(input).hillMask)).toBe(0);
  });

  it("returns no support for isolated land or a one-cell wrapped map", () => {
    const single = createInput(1, 1, Int16Array.of(800));
    expect(reliefAt(single, 0)).toEqual({ upward: 0, downward: 0 });
    const isolated = createInput(3, 3, new Int16Array(9).fill(-100));
    isolated.landMask.fill(0);
    isolated.landMask[4] = 1;
    isolated.elevation[4] = 800;
    expect(reliefAt(isolated, 4)).toEqual({ upward: 0, downward: 0 });
  });
});

describe("relief-supported landform admission", () => {
  it("leaves flat high plateaus flat despite strong drivers and unfilled coverage floors", () => {
    const input = createInput(30, 3, new Int16Array(90).fill(800));
    const result = ridges(input, {
      mountainMinFraction: 1,
      mountainRangeSpacingTiles: 3,
      mountainRangeLengthTiles: 80,
      mountainSpineDilationSteps: 6,
      mountainThreshold: 10,
    });
    expect(count(result.mountainMask)).toBe(0);
    input.mountainRegionMask.fill(1);
    input.mountainRegionIdByTile.fill(0);
    input.mountainMask[45] = 1;
    expect(count(foothills(input, { hillThreshold: 10 }).hillMask)).toBe(0);
    expect(count(roughLands(input).hillMask)).toBe(0);
  });

  it("admits a low rugged range, excludes enclosed minima, and leaves unsupported quota unfilled", () => {
    const input = createInput(5, 5, new Int16Array(25).fill(8));
    input.elevation[12] = 0;
    const result = ridges(input, { mountainMinFraction: 1 });
    expect(count(result.mountainMask)).toBeGreaterThan(0);
    expect(count(result.mountainMask)).toBeLessThan(25);
    expect(reliefAt(input, 12)).toEqual({ upward: 8, downward: 0 });
    expect(result.mountainMask[12]).toBe(0);
    expect(foothills({ ...input, ...result }).hillMask[12]).toBe(1);
    for (let i = 0; i < result.mountainMask.length; i++) {
      if (result.mountainMask[i] === 1)
        expect(reliefAt(input, i).downward).toBeGreaterThanOrEqual(4);
    }
  });

  it("uses inclusive model-unit floors rather than altitude or strict-summit admission", () => {
    for (const downward of [3, 4]) {
      const input = createInput(3, 1, Int16Array.of(0, downward, 0));
      expect(ridges(input, { mountainMinFraction: 1 }).mountainMask[1]).toBe(
        downward === 4 ? 1 : 0
      );
    }
    for (const absolute of [1, 2]) {
      const input = createInput(3, 1, Int16Array.of(0, absolute, 0));
      expect(foothills(input).hillMask[1]).toBe(absolute === 2 ? 1 : 0);
      expect(count(roughLands(input).hillMask) > 0).toBe(absolute === 2);
    }
  });

  it("keeps geometric range corridors through flat passes without promoting the passes", () => {
    const input = createInput(30, 1, new Int16Array(30).fill(4));
    input.elevation[5] = 20;
    input.elevation[20] = 20;
    const result = ridges(input, {
      mountainRangeSpacingTiles: Math.sqrt(30),
      mountainRangeLengthTiles: 500,
      mountainRegionRadiusTiles: 0,
      mountainMinFraction: 1,
    });
    expect(result.mountainMask[5]).toBe(1);
    expect(result.mountainMask[20]).toBe(1);
    expect(reliefAt(input, 10)).toEqual({ upward: 0, downward: 0 });
    expect(result.mountainMask[10]).toBe(0);
    expect(result.mountainRegionMask[10]).toBe(1);
    expect(result.mountainRegionIdByTile[10]).toBe(result.mountainRegionIdByTile[5]);
    expect(count(result.mountainMask)).toBe(2);
    expect(count(result.mountainRegionMask)).toBe(30);
  });

  it("does not relax the tectonic gate for distributed anchors, corridor promotion, or hill floors", () => {
    const input = createInput(
      30,
      1,
      Int16Array.from({ length: 30 }, (_, i) => i * 16)
    );
    input.upliftPotential.fill(0);
    input.collisionPotential.fill(0);
    input.tectonicStress.fill(0);
    const unsupported = ridges(input, {
      mountainRangeSpacingTiles: 3,
      mountainRangeLengthTiles: 500,
      mountainMinFraction: 1,
    });
    expect(count(unsupported.mountainMask)).toBe(0);
    input.upliftPotential[5] = 255;
    input.collisionPotential[5] = 255;
    input.tectonicStress[5] = 255;
    const oneDriver = ridges(input, {
      mountainRangeSpacingTiles: 3,
      mountainRangeLengthTiles: 500,
      mountainMinFraction: 1,
    });
    expect(count(oneDriver.mountainMask)).toBe(1);
    expect(oneDriver.mountainMask[5]).toBe(1);
    expect(count(foothills({ ...input, ...oneDriver }, { hillThreshold: 10 }).hillMask)).toBe(0);
  });

  it("ranks eligible mountains by downward relief and both hill families by absolute relief", () => {
    const input = createInput(5, 1, Int16Array.of(0, 4, 0, 16, 0));
    const mountains = ridges(input, { mountainMaxFraction: 0.2 });
    expect(Array.from(mountains.mountainMask)).toEqual([0, 0, 0, 1, 0]);
    input.mountainMask.set([1, 0, 1, 0, 1]);
    const hills = foothills(input, { foothillMaxFraction: 0.2, foothillMinFraction: 0 });
    expect(Array.from(hills.hillMask)).toEqual([0, 0, 0, 1, 0]);
    const rough = roughLands(input, { hillMaxFraction: 0.2 });
    expect(Array.from(rough.hillMask)).toEqual([0, 0, 0, 1, 0]);
  });

  it("does not let a stronger ineligible neighbor suppress an eligible ridge seed", () => {
    const input = createInput(9, 1, Int16Array.of(0, 4, 6, 4, 0, 0, 4, 0, 0));
    const drivers = Uint8Array.of(0, 128, 255, 0, 0, 0, 64, 0, 0);
    input.upliftPotential.set(drivers);
    input.collisionPotential.set(drivers);
    input.tectonicStress.set(drivers);
    const result = ridges(input, { mountainMaxFraction: 1 / 9 });
    expect(reliefAt(input, 2).downward).toBe(2);
    expect(Array.from(result.mountainMask)).toEqual([0, 1, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("is invariant to datum shifts and leaves inputs immutable with disjoint deterministic classes", () => {
    const input = createInput(
      8,
      4,
      Int16Array.from({ length: 32 }, (_, i) => (i % 8) * 16)
    );
    const before = structuredClone(input);
    const run = (source: Input) => {
      const mountain = ridges(source, { mountainMaxFraction: 0.2 });
      const hill = foothills(
        { ...source, ...mountain },
        { foothillMaxFraction: 0.25, foothillMinFraction: 0 }
      );
      const rough = roughLands({ ...source, ...mountain, foothillMask: hill.hillMask });
      return { mountain, hill, rough };
    };
    const result = run(input);
    expect(run(input)).toEqual(result);
    expect(input).toEqual(before);
    const shifted = {
      ...input,
      seaLevel: 1000,
      elevation: Int16Array.from(input.elevation, (value) => value + 1000),
    };
    expect(run(shifted)).toEqual(result);
    expect(count(result.mountain.mountainMask)).toBeGreaterThan(0);
    expect(count(result.hill.hillMask)).toBeGreaterThan(0);
    expect(count(result.rough.hillMask)).toBeGreaterThan(0);
    for (let i = 0; i < input.elevation.length; i++) {
      const mountain = result.mountain.mountainMask[i]!;
      const hill = result.hill.hillMask[i]!;
      const rough = result.rough.hillMask[i]!;
      expect(mountain + hill + rough).toBeLessThanOrEqual(1);
      const relief = reliefAt(input, i);
      if (mountain === 1) expect(relief.downward).toBeGreaterThanOrEqual(4);
      if (hill + rough > 0)
        expect(Math.max(relief.upward, relief.downward)).toBeGreaterThanOrEqual(2);
    }
  });
});
