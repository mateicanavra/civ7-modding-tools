import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";

import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { buildPlacementInputs } from "../../src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.js";
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
      naturalWonderCatalog: [
        { featureType: featureTypes.FEATURE_KILIMANJARO, direction: -1 },
      ],
      resourceTypeCatalog: [],
      discoveryCatalog: [],
    });
    const context = {
      dimensions: { width, height },
      adapter,
      buffers: {
        heightfield: {
          elevation: new Int16Array(size).fill(500),
        },
      },
    } as never;
    initializeStandardRuntime(context, { mapInfo });

    let capturedNaturalWonderInput:
      | { featureCatalog?: ReadonlyArray<{ direction: number; footprintOffsets?: unknown }> }
      | undefined;
    const ops = {
      wonders: () => ({ wondersCount: 1 }),
      naturalWonders: (input: typeof capturedNaturalWonderInput & {
        width: number;
        height: number;
        wondersCount: number;
      }) => {
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
      floodplains: () => ({
        minLength: 4,
        maxLength: 10,
      }),
    } as never;

    buildPlacementInputs(
      context,
      {},
      ops,
      {
        topography: { landMask: new Uint8Array(size).fill(1) },
        hydrography: { riverClass: new Uint8Array(size) },
        lakePlan: { lakeMask: new Uint8Array(size) },
        biomeClassification: {
          effectiveMoisture: new Float32Array(size).fill(0.5),
          surfaceTemperature: new Float32Array(size).fill(0.5),
          aridityIndex: new Float32Array(size).fill(0.5),
        },
        pedology: { fertility: new Float32Array(size).fill(0.5) },
      }
    );

    expect(capturedNaturalWonderInput?.featureCatalog).toHaveLength(1);
    expect(capturedNaturalWonderInput?.featureCatalog?.[0]).toMatchObject({
      direction: 0,
      footprintOffsets: [
        { dx: 0, dy: 0 },
        { dx: 1, dy: 1 },
        { dx: 1, dy: 0 },
      ],
    });
  });

  it("filters unsupported natural-wonder catalog entries before planning", () => {
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
      naturalWonderCatalog: [
        { featureType: featureTypes.FEATURE_BARRIER_REEF, direction: -1 },
      ],
      resourceTypeCatalog: [],
      discoveryCatalog: [],
    });
    const context = {
      dimensions: { width, height },
      adapter,
      buffers: {
        heightfield: {
          elevation: new Int16Array(size).fill(500),
        },
      },
    } as never;
    initializeStandardRuntime(context, { mapInfo });

    let capturedNaturalWonderInput:
      | { featureCatalog?: ReadonlyArray<{ featureType: number }> }
      | undefined;
    const ops = {
      wonders: () => ({ wondersCount: 1 }),
      naturalWonders: (input: typeof capturedNaturalWonderInput & {
        width: number;
        height: number;
        wondersCount: number;
      }) => {
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
      floodplains: () => ({
        minLength: 4,
        maxLength: 10,
      }),
    } as never;

    buildPlacementInputs(
      context,
      {},
      ops,
      {
        topography: { landMask: new Uint8Array(size).fill(1) },
        hydrography: { riverClass: new Uint8Array(size) },
        lakePlan: { lakeMask: new Uint8Array(size) },
        biomeClassification: {
          effectiveMoisture: new Float32Array(size).fill(0.5),
          surfaceTemperature: new Float32Array(size).fill(0.5),
          aridityIndex: new Float32Array(size).fill(0.5),
        },
        pedology: { fertility: new Float32Array(size).fill(0.5) },
      }
    );

    expect(capturedNaturalWonderInput?.featureCatalog).toEqual([]);
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
    expect(`[SWOOPER_MOD] NATURAL_WONDER_PLAN_V1 ${JSON.stringify(telemetry)}`.length).toBeLessThan(700);
  });
});
