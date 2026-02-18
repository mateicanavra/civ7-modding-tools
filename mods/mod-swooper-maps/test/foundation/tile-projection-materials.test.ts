import { describe, it, expect } from "bun:test";
import { HEX_WIDTH } from "@swooper/mapgen-core/lib/grid";
import computePlatesTensors from "../../src/domain/foundation/ops/compute-plates-tensors/index.js";

describe("foundation tile projection (materials)", () => {
  it("projects tileToCellIndex with wrapX and deterministic tie-breakers", () => {
    const width = 2;
    const height = 1;
    const wrapWidth = width * HEX_WIDTH;

    const mesh = {
      cellCount: 4,
      wrapWidth,
      siteX: new Float32Array([wrapWidth - 0.05, wrapWidth - 0.05, HEX_WIDTH, 0.2]),
      siteY: new Float32Array([0, 0, 0, 0]),
      neighborsOffsets: new Int32Array([0, 0, 0, 0, 0]),
      neighbors: new Int32Array([]),
      areas: new Float32Array([1, 1, 1, 1]),
      bbox: { xl: 0, xr: wrapWidth, yt: 0, yb: 1 },
    } as const;

    const crust = {
      maturity: new Float32Array([0.9, 0.1, 0.2, 0.3]),
      thickness: new Float32Array([0.8, 0.2, 0.3, 0.4]),
      thermalAge: new Uint8Array([200, 10, 20, 30]),
      damage: new Uint8Array([0, 5, 0, 0]),
      type: new Uint8Array([1, 0, 0, 0]),
      age: new Uint8Array([200, 10, 20, 30]),
      buoyancy: new Float32Array([0.9, 0.2, 0.3, 0.4]),
      baseElevation: new Float32Array([0.9, 0.2, 0.3, 0.4]),
      strength: new Float32Array([0.9, 0.2, 0.3, 0.4]),
    } as const;

    const plateGraph = {
      cellToPlate: new Int16Array([0, 0, 0, 0]),
      plates: [{ id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 }],
    } as const;

    const plateMotion = {
      version: 1,
      cellCount: 4,
      plateCount: 1,
      plateCenterX: new Float32Array([0]),
      plateCenterY: new Float32Array([0]),
      plateVelocityX: new Float32Array([0]),
      plateVelocityY: new Float32Array([0]),
      plateOmega: new Float32Array([0]),
      plateFitRms: new Float32Array([0]),
      plateFitP90: new Float32Array([0]),
      plateQuality: new Uint8Array([0]),
      cellFitError: new Uint8Array(4),
    } as const;

    const tectonics = {
      boundaryType: new Uint8Array(4),
      upliftPotential: new Uint8Array(4),
      riftPotential: new Uint8Array(4),
      shearStress: new Uint8Array(4),
      volcanism: new Uint8Array(4),
      fracture: new Uint8Array(4),
      cumulativeUplift: new Uint8Array(4),
    } as const;

    const tectonicHistory = {
      eraCount: 5,
      eras: [
        {
          boundaryType: new Uint8Array([1, 2, 3, 4]),
          upliftPotential: new Uint8Array([10, 11, 12, 13]),
          collisionPotential: new Uint8Array([14, 15, 16, 17]),
          subductionPotential: new Uint8Array([18, 19, 20, 21]),
          riftPotential: new Uint8Array([20, 21, 22, 23]),
          shearStress: new Uint8Array([30, 31, 32, 33]),
          volcanism: new Uint8Array([40, 41, 42, 43]),
          fracture: new Uint8Array([50, 51, 52, 53]),
        },
        {
          boundaryType: new Uint8Array([5, 6, 7, 8]),
          upliftPotential: new Uint8Array([60, 61, 62, 63]),
          collisionPotential: new Uint8Array([64, 65, 66, 67]),
          subductionPotential: new Uint8Array([68, 69, 70, 71]),
          riftPotential: new Uint8Array([70, 71, 72, 73]),
          shearStress: new Uint8Array([80, 81, 82, 83]),
          volcanism: new Uint8Array([90, 91, 92, 93]),
          fracture: new Uint8Array([100, 101, 102, 103]),
        },
        {
          boundaryType: new Uint8Array([0, 0, 0, 0]),
          upliftPotential: new Uint8Array([0, 0, 0, 0]),
          collisionPotential: new Uint8Array([0, 0, 0, 0]),
          subductionPotential: new Uint8Array([0, 0, 0, 0]),
          riftPotential: new Uint8Array([0, 0, 0, 0]),
          shearStress: new Uint8Array([0, 0, 0, 0]),
          volcanism: new Uint8Array([0, 0, 0, 0]),
          fracture: new Uint8Array([0, 0, 0, 0]),
        },
        {
          boundaryType: new Uint8Array([0, 0, 0, 0]),
          upliftPotential: new Uint8Array([0, 0, 0, 0]),
          collisionPotential: new Uint8Array([0, 0, 0, 0]),
          subductionPotential: new Uint8Array([0, 0, 0, 0]),
          riftPotential: new Uint8Array([0, 0, 0, 0]),
          shearStress: new Uint8Array([0, 0, 0, 0]),
          volcanism: new Uint8Array([0, 0, 0, 0]),
          fracture: new Uint8Array([0, 0, 0, 0]),
        },
        {
          boundaryType: new Uint8Array([0, 0, 0, 0]),
          upliftPotential: new Uint8Array([0, 0, 0, 0]),
          collisionPotential: new Uint8Array([0, 0, 0, 0]),
          subductionPotential: new Uint8Array([0, 0, 0, 0]),
          riftPotential: new Uint8Array([0, 0, 0, 0]),
          shearStress: new Uint8Array([0, 0, 0, 0]),
          volcanism: new Uint8Array([0, 0, 0, 0]),
          fracture: new Uint8Array([0, 0, 0, 0]),
        },
      ],
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
    } as const;

    const tectonicProvenance = {
      version: 1,
      eraCount: 5,
      cellCount: 4,
      tracerIndex: [
        new Uint32Array([0, 1, 2, 3]),
        new Uint32Array([3, 2, 1, 0]),
        new Uint32Array([0, 1, 2, 3]),
        new Uint32Array([3, 2, 1, 0]),
        new Uint32Array([0, 1, 2, 3]),
      ],
      provenance: {
        originEra: new Uint8Array([0, 1, 1, 0]),
        originPlateId: new Int16Array([0, 0, 1, 1]),
        lastBoundaryEra: new Uint8Array([255, 0, 1, 255]),
        lastBoundaryType: new Uint8Array([255, 1, 2, 255]),
        lastBoundaryPolarity: new Int8Array([0, 1, -1, 0]),
        lastBoundaryIntensity: new Uint8Array([0, 10, 20, 0]),
        crustAge: new Uint8Array([200, 10, 20, 30]),
      },
    } as const;

    const first = computePlatesTensors.run(
      {
        width,
        height,
        mesh: mesh as any,
        crust: crust as any,
        plateGraph: plateGraph as any,
        plateMotion: plateMotion as any,
        tectonics: tectonics as any,
        tectonicHistory: tectonicHistory as any,
        tectonicProvenance: tectonicProvenance as any,
      },
      computePlatesTensors.defaultConfig
    );

    const second = computePlatesTensors.run(
      {
        width,
        height,
        mesh: mesh as any,
        crust: crust as any,
        plateGraph: plateGraph as any,
        plateMotion: plateMotion as any,
        tectonics: tectonics as any,
        tectonicHistory: tectonicHistory as any,
        tectonicProvenance: tectonicProvenance as any,
      },
      computePlatesTensors.defaultConfig
    );

    expect(Array.from(first.tileToCellIndex)).toEqual(Array.from(second.tileToCellIndex));
    expect(Array.from(first.crustTiles.type)).toEqual(Array.from(second.crustTiles.type));
    expect(Array.from(first.crustTiles.age)).toEqual(Array.from(second.crustTiles.age));
    expect(Array.from(first.tectonicHistoryTiles.rollups.upliftTotal)).toEqual(
      Array.from(second.tectonicHistoryTiles.rollups.upliftTotal)
    );
    expect(Array.from(first.tectonicProvenanceTiles.originEra)).toEqual(
      Array.from(second.tectonicProvenanceTiles.originEra)
    );

    expect(first.tileToCellIndex.length).toBe(width * height);
    expect(first.tileToCellIndex[0]).toBe(0);
    expect(first.tileToCellIndex[1]).toBe(2);

    expect(first.crustTiles.type.length).toBe(width * height);
    expect(first.crustTiles.age.length).toBe(width * height);
    expect(first.crustTiles.type[0]).toBe(1);
    expect(first.crustTiles.age[0]).toBe(200);
    expect(first.crustTiles.type[1]).toBe(0);
    expect(first.crustTiles.age[1]).toBe(20);

    expect(first.tectonicHistoryTiles.perEra[0]?.boundaryType[0]).toBe(1);
    expect(first.tectonicHistoryTiles.perEra[1]?.boundaryType[1]).toBe(7);
    expect(first.tectonicHistoryTiles.rollups.upliftTotal[0]).toBe(10);
    expect(first.tectonicHistoryTiles.rollups.upliftTotal[1]).toBe(12);
    expect(first.tectonicProvenanceTiles.originEra[0]).toBe(0);
    expect(first.tectonicProvenanceTiles.originEra[1]).toBe(1);
    expect(first.tectonicProvenanceTiles.lastBoundaryType[0]).toBe(255);
  });
});
