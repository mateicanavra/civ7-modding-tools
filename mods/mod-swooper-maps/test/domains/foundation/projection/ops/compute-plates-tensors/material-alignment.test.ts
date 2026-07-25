import { describe, expect, it } from "bun:test";
import foundation from "@mapgen/domain/foundation/router";
import { HEX_WIDTH } from "@swooper/mapgen-core/lib/grid";

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

describe("compute-plates-tensors material alignment", () => {
  it("uses one wrapped nearest-cell mapping for crust, history, and provenance", () => {
    const syntheticDimensions = { width: 2, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const cellCount = 4;
    const wrapWidth = width * HEX_WIDTH;
    const eras = Array.from({ length: 5 }, () => zeroEra(cellCount));
    eras[0] = {
      ...zeroEra(cellCount),
      boundaryType: new Uint8Array([1, 2, 3, 4]),
      upliftPotential: new Uint8Array([10, 11, 12, 13]),
    };
    eras[1] = {
      ...zeroEra(cellCount),
      boundaryType: new Uint8Array([5, 6, 7, 8]),
      upliftPotential: new Uint8Array([60, 61, 62, 63]),
    };

    const projected = computePlatesTensors.run(
      {
        width,
        height,
        mesh: {
          cellCount,
          wrapWidth,
          siteX: new Float32Array([wrapWidth - 0.05, 0.5, HEX_WIDTH, 0.2]),
          siteY: new Float32Array(cellCount),
        },
        crust: {
          maturity: new Float32Array([0.9, 0.1, 0.2, 0.3]),
          thickness: new Float32Array([0.8, 0.2, 0.3, 0.4]),
          damage: new Uint8Array([0, 5, 0, 0]),
          type: new Uint8Array([1, 0, 0, 0]),
          age: new Uint8Array([200, 10, 20, 30]),
          buoyancy: new Float32Array([0.9, 0.2, 0.3, 0.4]),
          baseElevation: new Float32Array([0.9, 0.2, 0.3, 0.4]),
          strength: new Float32Array([0.9, 0.2, 0.3, 0.4]),
        },
        plateGraph: {
          cellToPlate: new Int16Array(cellCount),
          plates: [
            {
              id: 0,
              role: "tectonic" as const,
              kind: "major" as const,
              seedX: 0,
              seedY: 0,
            },
          ],
        },
        plateMotion: {
          plateCount: 1,
          plateVelocityX: new Float32Array(1),
          plateVelocityY: new Float32Array(1),
          plateOmega: new Float32Array(1),
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
          eraCount: eras.length,
          eras,
          upliftTotal: new Uint8Array([10, 11, 12, 13]),
          collisionTotal: new Uint8Array([14, 15, 16, 17]),
          subductionTotal: new Uint8Array([18, 19, 20, 21]),
          fractureTotal: new Uint8Array([20, 21, 22, 23]),
          volcanismTotal: new Uint8Array([30, 31, 32, 33]),
          upliftRecentFraction: new Uint8Array([40, 41, 42, 43]),
          collisionRecentFraction: new Uint8Array([44, 45, 46, 47]),
          subductionRecentFraction: new Uint8Array([48, 49, 50, 51]),
          lastActiveEra: new Uint8Array([1, 1, 0, 0]),
          lastCollisionEra: new Uint8Array([1, 1, 0, 0]),
          lastSubductionEra: new Uint8Array([1, 1, 0, 0]),
        },
        tectonicProvenance: {
          provenance: {
            originEra: new Uint8Array([0, 1, 1, 0]),
            originPlateId: new Int16Array([0, 0, 1, 1]),
            lastBoundaryEra: new Uint8Array([255, 0, 1, 255]),
            lastBoundaryType: new Uint8Array([255, 1, 2, 255]),
          },
        },
      },
      computePlatesTensors.defaultConfig
    );

    expect(Array.from(projected.tileToCellIndex)).toEqual([0, 2]);
    expect(Array.from(projected.crustTiles.type)).toEqual([1, 0]);
    expect(Array.from(projected.crustTiles.age)).toEqual([200, 20]);
    expect(Array.from(projected.tectonicHistoryTiles.perEra[0]!.boundaryType)).toEqual([1, 3]);
    expect(Array.from(projected.tectonicHistoryTiles.perEra[1]!.boundaryType)).toEqual([5, 7]);
    expect(Array.from(projected.tectonicHistoryTiles.rollups.upliftTotal)).toEqual([10, 12]);
    expect(Array.from(projected.tectonicProvenanceTiles.originEra)).toEqual([0, 1]);
    expect(Array.from(projected.tectonicProvenanceTiles.lastBoundaryType)).toEqual([255, 2]);
  });
});
