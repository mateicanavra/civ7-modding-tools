import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";

import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { buildPlacementInputs } from "../../src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.js";
import { buildNaturalWonderPlanInputRuntimeTelemetry } from "../../src/recipes/standard/stages/placement/steps/derive-placement-inputs/natural-wonder-plan-input-telemetry.js";
import { buildNaturalWonderPlanRuntimeTelemetry } from "../../src/recipes/standard/stages/placement/steps/derive-placement-inputs/natural-wonder-plan-telemetry.js";

const { featureTypes, terrainTypeIndices, biomeGlobals } = CIV7_BROWSER_TABLES_V0;

describe("derive placement inputs", () => {
  it("passes explicit projected natural-wonder direction to materialization planning", () => {
    const width = 6;
    const height = 6;
    const size = width * height;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      PlayersLandmass1: 1,
      PlayersLandmass2: 1,
      StartSectorRows: 1,
      StartSectorCols: 1,
      NumNaturalWonders: 1,
    };
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      defaultTerrainType: terrainTypeIndices.TERRAIN_MOUNTAIN,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      naturalWonderCatalog: [{ featureType: featureTypes.FEATURE_KILIMANJARO, direction: -1 }],
    });
    const context = {
      dimensions: { width, height },
      adapter,
      fields: {
        featureType: new Int16Array(size).fill(adapter.NO_FEATURE),
      },
      buffers: {
        heightfield: {
          elevation: new Int16Array(size).fill(500),
        },
      },
    } as never;
    initializeStandardRuntime(context, { mapInfo });

    let capturedNaturalWonderInput:
      | {
          featureCatalog?: ReadonlyArray<{ direction: number; footprintOffsetsByParity?: unknown }>;
        }
      | undefined;
    const ops = {
      wonders: () => ({ wondersCount: 1 }),
      naturalWonders: (
        input: typeof capturedNaturalWonderInput & {
          width: number;
          height: number;
          wondersCount: number;
        }
      ) => {
        capturedNaturalWonderInput = input;
        return {
          width: input.width,
          height: input.height,
          wondersCount: input.wondersCount,
          targetCount: 0,
          plannedCount: 0,
          placements: [],
        };
      },
      discoveries: () => ({
        width,
        height,
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      }),
      resources: () => ({
        width,
        height,
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      }),
    } as never;

    buildPlacementInputs(context, {}, ops, {
      topography: {
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(500),
      },
      hydrography: { riverClass: new Uint8Array(size) },
      lakePlan: { lakeMask: new Uint8Array(size) },
      biomeClassification: {
        effectiveMoisture: new Float32Array(size).fill(0.5),
        surfaceTemperature: new Float32Array(size).fill(0.5),
        aridityIndex: new Float32Array(size).fill(0.5),
      },
      biomeBindings: {
        engineBiomeId: new Uint16Array(size).fill(biomeGlobals.BIOME_PLAINS),
      },
      pedology: { fertility: new Float32Array(size).fill(0.5) },
    });

    expect(capturedNaturalWonderInput?.featureCatalog).toHaveLength(1);
    expect(capturedNaturalWonderInput?.featureCatalog?.[0]).toMatchObject({
      direction: 0,
      // Parity-keyed odd-R footprint (THREETRIANGLE, dir 0): even and odd rows
      // differ in the parity-dependent diagonals (indices 0,2,3,5).
      footprintOffsetsByParity: {
        even: [
          { dx: 0, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 1, dy: 0 },
        ],
        odd: [
          { dx: 0, dy: 0 },
          { dx: 1, dy: 1 },
          { dx: 1, dy: 0 },
        ],
      },
    });
  });

  it("includes the recovered 4-tile natural wonders (Barrier Reef) in the plan catalog", () => {
    const width = 6;
    const height = 6;
    const size = width * height;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      PlayersLandmass1: 1,
      PlayersLandmass2: 1,
      StartSectorRows: 1,
      StartSectorCols: 1,
      NumNaturalWonders: 1,
    };
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      defaultTerrainType: terrainTypeIndices.TERRAIN_MOUNTAIN,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      naturalWonderCatalog: [{ featureType: featureTypes.FEATURE_BARRIER_REEF, direction: -1 }],
    });
    const context = {
      dimensions: { width, height },
      adapter,
      fields: {
        featureType: new Int16Array(size).fill(adapter.NO_FEATURE),
      },
      buffers: {
        heightfield: {
          elevation: new Int16Array(size).fill(500),
        },
      },
    } as never;
    initializeStandardRuntime(context, { mapInfo });

    let capturedNaturalWonderInput:
      | {
          featureCatalog?: ReadonlyArray<{
            featureType: number;
            footprintOffsetsByParity?: unknown;
          }>;
        }
      | undefined;
    const ops = {
      wonders: () => ({ wondersCount: 1 }),
      naturalWonders: (
        input: typeof capturedNaturalWonderInput & {
          width: number;
          height: number;
          wondersCount: number;
        }
      ) => {
        capturedNaturalWonderInput = input;
        return {
          width: input.width,
          height: input.height,
          wondersCount: input.wondersCount,
          targetCount: 0,
          plannedCount: 0,
          placements: [],
        };
      },
      discoveries: () => ({
        width,
        height,
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      }),
      resources: () => ({
        width,
        height,
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      }),
    } as never;

    buildPlacementInputs(context, {}, ops, {
      topography: {
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(500),
      },
      hydrography: { riverClass: new Uint8Array(size) },
      lakePlan: { lakeMask: new Uint8Array(size) },
      biomeClassification: {
        effectiveMoisture: new Float32Array(size).fill(0.5),
        surfaceTemperature: new Float32Array(size).fill(0.5),
        aridityIndex: new Float32Array(size).fill(0.5),
      },
      biomeBindings: {
        engineBiomeId: new Uint16Array(size).fill(biomeGlobals.BIOME_PLAINS),
      },
      pedology: { fertility: new Float32Array(size).fill(0.5) },
    });

    // Barrier Reef (FOURADJACENT) was previously dropped (null footprint). It is
    // now placement-eligible, but as a self-orienting 4-tile class it keeps the
    // engine sentinel direction (-1) and an ANCHOR-ONLY offline footprint: the
    // engine stamps the remaining 3 cells by self-orientation (forcing a concrete
    // Direction 0 is refused live — set-feature-false).
    expect(capturedNaturalWonderInput?.featureCatalog).toHaveLength(1);
    expect(capturedNaturalWonderInput?.featureCatalog?.[0]).toMatchObject({
      featureType: featureTypes.FEATURE_BARRIER_REEF,
      direction: -1,
      footprintOffsetsByParity: {
        even: [{ dx: 0, dy: 0 }],
        odd: [{ dx: 0, dy: 0 }],
      },
    });
  });

  it("builds compact natural-wonder plan telemetry for exact runtime proof", () => {
    const telemetry = buildNaturalWonderPlanRuntimeTelemetry({
      width: 106,
      height: 66,
      wondersCount: 7,
      targetCount: 7,
      plannedCount: 2,
      placements: [
        {
          plotIndex: 4130,
          featureType: 30,
          direction: 0,
          elevation: 3,
          priority: 0.6107035471190667,
        },
        {
          plotIndex: 1785,
          featureType: 36,
          direction: 0,
          elevation: 4,
          priority: 0.8272660786093309,
        },
      ],
    });

    expect(telemetry).toMatchObject({
      version: 1,
      wondersCount: 7,
      targetCount: 7,
      plannedCount: 2,
      planRows: [
        ["p", 4130, 102, 38, 30, 0, 3, 610704],
        ["p", 1785, 89, 16, 36, 0, 4, 827266],
      ],
      coordinateProof: {
        version: 1,
        plannedCount: 2,
      },
    });
    expect(telemetry.coordinateProof.plannedHash32).toMatch(/^[0-9a-f]{8}$/);
    expect(`[SWOOPER_MOD] NATURAL_WONDER_PLAN_V1 ${JSON.stringify(telemetry)}`.length).toBeLessThan(
      700
    );
  });

  it("builds compact natural-wonder plan input telemetry for exact runtime proof", () => {
    const width = 4;
    const height = 4;
    const size = width * height;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      PlayersLandmass1: 1,
      PlayersLandmass2: 1,
      StartSectorRows: 1,
      StartSectorCols: 1,
      NumNaturalWonders: 1,
    };
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      defaultTerrainType: terrainTypeIndices.TERRAIN_MOUNTAIN,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
    });
    adapter.setFeatureType(1, 1, featureTypes.FEATURE_ICE);
    const elevation = new Int16Array(size).fill(100);
    elevation[5] = 240;
    const context = {
      dimensions: { width, height },
      adapter,
      buffers: {
        heightfield: {
          elevation,
        },
      },
    } as never;
    const telemetry = buildNaturalWonderPlanInputRuntimeTelemetry({
      context,
      plan: {
        width,
        height,
        wondersCount: 1,
        targetCount: 1,
        plannedCount: 1,
        placements: [
          {
            plotIndex: 5,
            featureType: featureTypes.FEATURE_KILIMANJARO,
            direction: 0,
            elevation: 240,
            priority: 0.5,
          },
        ],
      },
      physical: {
        topography: { landMask: new Uint8Array(size).fill(1), elevation },
        hydrography: { riverClass: new Uint8Array(size).fill(2) },
        lakePlan: { lakeMask: new Uint8Array(size) },
        biomeClassification: {
          aridityIndex: new Float32Array(size).fill(0.25),
        },
      },
    });

    expect(telemetry).toMatchObject({
      version: 1,
      plannedCount: 1,
      surfaceDigests: {
        version: 1,
        plotCount: size,
        landMaskHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        elevationHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        aridityPpmHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        riverClassHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        lakeMaskHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        blockedMaskHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        terrainTypeHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        biomeTypeHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
        featureTypeHash32: expect.stringMatching(/^[0-9a-f]{8}$/),
      },
      inputRows: [
        [
          "p",
          5,
          1,
          1,
          featureTypes.FEATURE_KILIMANJARO,
          terrainTypeIndices.TERRAIN_MOUNTAIN,
          biomeGlobals.BIOME_PLAINS,
          0,
          240,
          250000,
          2,
          0,
          1,
          1,
        ],
      ],
    });
    expect(
      `[SWOOPER_MOD] NATURAL_WONDER_PLAN_INPUT_V1 ${JSON.stringify(telemetry)}`.length
    ).toBeLessThan(800);
  });
});
