import { describe, expect, it } from "bun:test";
import foundation from "@mapgen/domain/foundation/router";
import { HEX_WIDTH, projectOddqToHexSpace } from "@swooper/mapgen-core/lib/grid";

const { computePlatesTensors } = foundation.projection.ops;

function zeroEra(cellCount: number) {
  return {
    boundaryType: new Uint8Array(cellCount),
    upliftPotential: new Uint8Array(cellCount),
    collisionPotential: new Uint8Array(cellCount),
    subductionPotential: new Uint8Array(cellCount),
    riftPotential: new Uint8Array(cellCount),
    shearStress: new Uint8Array(cellCount),
    volcanism: new Uint8Array(cellCount),
    fracture: new Uint8Array(cellCount),
  };
}

describe("compute-plates-tensors boundary influence", () => {
  it("decays from plate boundaries and stops at the authored influence radius", () => {
    const syntheticDimensions = { width: 18, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const cellCount = width * height;
    const siteX = new Float32Array(cellCount);
    const siteY = new Float32Array(cellCount);
    const cellToPlate = new Int16Array(cellCount);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const site = projectOddqToHexSpace(x, y);
        siteX[index] = site.x;
        siteY[index] = site.y;
        cellToPlate[index] = x < width / 2 ? 0 : 1;
      }
    }

    const input = {
      width,
      height,
      mesh: {
        cellCount,
        wrapWidth: width * HEX_WIDTH,
        siteX,
        siteY,
      },
      crust: {
        maturity: new Float32Array(cellCount),
        thickness: new Float32Array(cellCount),
        damage: new Uint8Array(cellCount),
        type: new Uint8Array(cellCount),
        age: new Uint8Array(cellCount),
        buoyancy: new Float32Array(cellCount),
        baseElevation: new Float32Array(cellCount),
        strength: new Float32Array(cellCount),
      },
      plateGraph: {
        cellToPlate,
        plates: [
          {
            id: 0,
            role: "tectonic" as const,
            kind: "major" as const,
            seedX: 0,
            seedY: 0,
          },
          {
            id: 1,
            role: "tectonic" as const,
            kind: "major" as const,
            seedX: width / 2,
            seedY: 0,
          },
        ],
      },
      plateMotion: {
        plateCount: 2,
        plateVelocityX: new Float32Array(2),
        plateVelocityY: new Float32Array(2),
        plateOmega: new Float32Array(2),
      },
      tectonics: {
        boundaryType: new Uint8Array(cellCount),
        upliftPotential: new Uint8Array(cellCount),
        riftPotential: new Uint8Array(cellCount),
        shearStress: new Uint8Array(cellCount),
        volcanism: new Uint8Array(cellCount),
        cumulativeUplift: new Uint8Array(cellCount),
      },
      tectonicHistory: {
        eraCount: 5,
        eras: Array.from({ length: 5 }, () => zeroEra(cellCount)),
        upliftTotal: new Uint8Array(cellCount),
        collisionTotal: new Uint8Array(cellCount),
        subductionTotal: new Uint8Array(cellCount),
        fractureTotal: new Uint8Array(cellCount),
        volcanismTotal: new Uint8Array(cellCount),
        upliftRecentFraction: new Uint8Array(cellCount),
        collisionRecentFraction: new Uint8Array(cellCount),
        subductionRecentFraction: new Uint8Array(cellCount),
        lastActiveEra: new Uint8Array(cellCount),
        lastCollisionEra: new Uint8Array(cellCount),
        lastSubductionEra: new Uint8Array(cellCount),
      },
    };
    const projectWithDecay = (boundaryDecay: number) =>
      computePlatesTensors.run(input, {
        ...computePlatesTensors.defaultConfig,
        config: {
          ...computePlatesTensors.defaultConfig.config,
          boundaryInfluenceDistance: 4,
          boundaryDecay,
        },
      });

    const projected = projectWithDecay(0.5);
    const steeper = projectWithDecay(1);

    const row = 1;
    const closenessAt = (x: number) => projected.plates.boundaryCloseness[row * width + x]!;
    const shieldAt = (x: number) => projected.plates.shieldStability[row * width + x]!;

    expect(closenessAt(0)).toBe(255);
    expect(closenessAt(1)).toBeGreaterThan(closenessAt(2));
    expect(closenessAt(2)).toBeGreaterThan(closenessAt(3));
    expect(closenessAt(3)).toBeGreaterThan(0);
    expect(closenessAt(4)).toBe(0);
    expect(closenessAt(2)).toBeGreaterThan(steeper.plates.boundaryCloseness[row * width + 2]!);
    expect(shieldAt(0)).toBe(0);
    expect(shieldAt(3)).toBe(255 - closenessAt(3));
    expect(shieldAt(4)).toBe(255);
  });
});
