import { describe, it, expect } from "bun:test";
import planRidges from "../../src/domain/morphology/ops/plan-ridges/index.js";
import planFoothills from "../../src/domain/morphology/ops/plan-foothills/index.js";

function countMask(mask: Uint8Array, start: number, end: number): number {
  let count = 0;
  for (let i = start; i < end; i++) if (mask[i] === 1) count++;
  return count;
}

describe("m11 mountains (physics-anchored)", () => {
  it("correlates convergence regime with mountain density (noise minimized)", () => {
    const width = 20;
    const height = 1;
    const size = width * height;

    const landMask = new Uint8Array(size);
    landMask.fill(1);

    const boundaryCloseness = new Uint8Array(size);
    const boundaryType = new Uint8Array(size);
    const upliftPotential = new Uint8Array(size);
    const riftPotential = new Uint8Array(size);
    const tectonicStress = new Uint8Array(size);
    const beltAge = new Uint8Array(size);
    const fractalMountain = new Int16Array(size);
    const fractalHill = new Int16Array(size);

    for (let i = 0; i < 10; i++) {
      boundaryCloseness[i] = 255;
      boundaryType[i] = 1;
      upliftPotential[i] = 220;
      tectonicStress[i] = 220;
    }

    const ridges = planRidges.run(
      {
        width,
        height,
        landMask,
        boundaryCloseness,
        boundaryType,
        upliftPotential,
        riftPotential,
        tectonicStress,
        beltAge,
        fractalMountain,
      },
      {
        strategy: "default",
        config: {
          ...(planRidges.defaultConfig as any).config,
          boundaryGate: 0,
          boundaryExponent: 1,
          fractalWeight: 0,
          mountainThreshold: 0.15,
          hillThreshold: 0.1,
        },
      }
    );

    const foothills = planFoothills.run(
      {
        width,
        height,
        landMask,
        mountainMask: ridges.mountainMask,
        boundaryCloseness,
        boundaryType,
        upliftPotential,
        riftPotential,
        tectonicStress,
        beltAge,
        fractalHill,
      },
      {
        strategy: "default",
        config: {
          ...(planFoothills.defaultConfig as any).config,
          boundaryGate: 0,
          boundaryExponent: 1,
          fractalWeight: 0,
          mountainThreshold: 0.15,
          hillThreshold: 0.1,
        },
      }
    );

    const mountainsNearConvergence = countMask(ridges.mountainMask, 0, 10);
    const mountainsInterior = countMask(ridges.mountainMask, 10, 20);
    expect(mountainsNearConvergence).toBeGreaterThan(0);
    expect(mountainsInterior).toBe(0);

    // No assertion about foothills here; this test is specifically about ridge correlation.
    expect(foothills.hillMask).toBeInstanceOf(Uint8Array);
  });

  it("noise-only runs cannot create mountain belts without orogeny signal", () => {
    const width = 20;
    const height = 1;
    const size = width * height;

    const landMask = new Uint8Array(size);
    landMask.fill(1);

    const boundaryCloseness = new Uint8Array(size);
    const boundaryType = new Uint8Array(size);
    const upliftPotential = new Uint8Array(size);
    const riftPotential = new Uint8Array(size);
    const tectonicStress = new Uint8Array(size);
    const beltAge = new Uint8Array(size);

    const fractalMountain = new Int16Array(size);
    const fractalHill = new Int16Array(size);
    fractalMountain.fill(255);
    fractalHill.fill(255);

    const ridges = planRidges.run(
      {
        width,
        height,
        landMask,
        boundaryCloseness,
        boundaryType,
        upliftPotential,
        riftPotential,
        tectonicStress,
        beltAge,
        fractalMountain,
      },
      {
        strategy: "default",
        config: {
          ...(planRidges.defaultConfig as any).config,
          boundaryGate: 0,
          boundaryExponent: 1,
          fractalWeight: 5,
          mountainThreshold: 0.01,
          hillThreshold: 0.01,
        },
      }
    );

    const foothills = planFoothills.run(
      {
        width,
        height,
        landMask,
        mountainMask: ridges.mountainMask,
        boundaryCloseness,
        boundaryType,
        upliftPotential,
        riftPotential,
        tectonicStress,
        beltAge,
        fractalHill,
      },
      {
        strategy: "default",
        config: {
          ...(planFoothills.defaultConfig as any).config,
          boundaryGate: 0,
          boundaryExponent: 1,
          fractalWeight: 5,
          mountainThreshold: 0.01,
          hillThreshold: 0.01,
        },
      }
    );

    expect(countMask(ridges.mountainMask, 0, size)).toBe(0);
    expect(countMask(foothills.hillMask, 0, size)).toBe(0);
    expect(Array.from(ridges.orogenyPotential)).toEqual(Array.from(new Uint8Array(size)));
    expect(Array.from(ridges.fracturePotential)).toEqual(Array.from(new Uint8Array(size)));
  });
});
