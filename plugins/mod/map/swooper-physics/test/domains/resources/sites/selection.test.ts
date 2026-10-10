import { describe, expect, it } from "bun:test";
import { CIV7_BROWSER_TABLES_V0, resolveResourceRuntimeIds } from "@civ7/map-policy";
import {
  admitPositiveResourceRegionMinimum,
  resolveEarthlikeResourceExpectations,
} from "../../../../src/domain/resources/index.js";

import resources from "../../../../src/domain/resources/router.js";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

type SelectInput = Parameters<typeof resources.sites.ops.selectResourceSites.run>[0];
type Demand = Pick<
  SelectInput["demands"][number],
  "resourceType" | "weight" | "targetCount" | "minCount" | "maxCount"
> &
  Partial<Pick<SelectInput["demands"][number], "family" | "regionMinimumRequirement">> &
  Readonly<{
    habitatMask?: Uint8Array;
    legalMask?: Uint8Array;
    intensity?: Float32Array;
  }>;

const { width, height } = TEST_MAP_SIZE.dimensions;
const cellCount = width * height;

// Reproduces the Earthlike Standard product regression rather than incidental test setup.
const RESOURCE_EQUITY_REGRESSION_MAP_SEED = 1356;

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (const value of mask) if (value !== 0) count += 1;
  return count;
}

function countEligible(habitatMask: Uint8Array, legalMask: Uint8Array): number {
  let count = 0;
  for (let index = 0; index < cellCount; index += 1) {
    if (habitatMask[index] !== 0 && legalMask[index] !== 0) count += 1;
  }
  return count;
}

function maskFromPlots(...plotIndices: readonly number[]): Uint8Array {
  const mask = new Uint8Array(cellCount);
  for (const plotIndex of plotIndices) mask[plotIndex] = 1;
  return mask;
}

function maskRectangle(columns: number, rows: number): Uint8Array {
  const mask = new Uint8Array(cellCount);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) mask[y * width + x] = 1;
  }
  return mask;
}

function buildInput(args: {
  demands: Demand[];
  seed?: number;
  landmassIdByTile?: Int32Array;
  landmassTileCounts?: number[];
  regionSlotByTile?: Uint8Array;
}): SelectInput {
  const allLand = new Uint8Array(cellCount).fill(1);
  const regionSlotByTile = args.regionSlotByTile?.slice() ?? new Uint8Array(cellCount);
  if (!args.regionSlotByTile) {
    for (let i = 0; i < cellCount; i++) {
      regionSlotByTile[i] = i % width < width / 2 ? 1 : 2;
    }
  }
  return {
    width,
    height,
    seed: args.seed ?? TEST_MAP_SEED,
    landMask: allLand,
    lakeMask: new Uint8Array(cellCount),
    landmassIdByTile: args.landmassIdByTile?.slice() ?? new Int32Array(cellCount),
    landmassTileCounts: args.landmassTileCounts?.slice() ?? [cellCount],
    regionSlotByTile,
    demands: args.demands.map((demand): SelectInput["demands"][number] => {
      const habitatMask = demand.habitatMask?.slice() ?? new Uint8Array(cellCount).fill(1);
      const legalMask = demand.legalMask?.slice() ?? new Uint8Array(cellCount).fill(1);
      const intensity = demand.intensity?.slice() ?? new Float32Array(cellCount).fill(1);
      return {
        resourceType: demand.resourceType,
        family: demand.family ?? "geological",
        laneId: "probe",
        laneKind: "land",
        weight: demand.weight,
        targetCount: demand.targetCount,
        minCount: demand.minCount,
        maxCount: demand.maxCount,
        regionMinimumRequirement: demand.regionMinimumRequirement ?? {
          kind: "not-applicable",
          reason: "no-official-minimum",
        },
        habitatMask,
        legalMask,
        intensity,
        habitatTileCount: countMask(habitatMask),
        legalTileCount: countMask(legalMask),
        eligibleTileCount: countEligible(habitatMask, legalMask),
      };
    }),
  };
}

type SelectResult = ReturnType<typeof resources.sites.ops.selectResourceSites.run>;

function run(
  input: ReturnType<typeof buildInput>,
  configure?: (
    config: (typeof resources.sites.ops.selectResourceSites.defaultConfig)["config"]
  ) => void
): SelectResult {
  const selection = structuredClone(resources.sites.ops.selectResourceSites.defaultConfig);
  configure?.(selection.config);
  return runAdmittedOperationForTest(resources.sites.ops.selectResourceSites, input, selection);
}

describe("select-resource-sites operation contract", () => {
  it.each([
    { resourceType: "RESOURCE_FISH", count: 3, density: 1, target: 9 },
    { resourceType: "RESOURCE_FISH", count: 4, density: 1, target: 12 },
    { resourceType: "RESOURCE_FISH", count: 10, density: 2, target: 40 },
    { resourceType: "RESOURCE_CRABS", count: 10, density: 1, target: 10 },
    { resourceType: "RESOURCE_CRABS", count: 10, density: 2, target: 15 },
    { resourceType: "RESOURCE_CRABS", count: 64, density: 1, target: 64 },
  ])(
    "retains deterministic floor four for $resourceType at target $target",
    ({ resourceType, count, density, target }) => {
      const expectation = resolveEarthlikeResourceExpectations({ aliveMajorPlayerCount: count })
        .find((row) => row.resourceType === resourceType)!;
      const range = expectation.expectedCountRange;
      const input = buildInput({
        demands: [{
          resourceType,
          family: "aquatic",
          weight: 1,
          targetCount: range.target,
          minCount: range.min,
          maxCount: range.max,
        }],
      });
      const result = run(input, (config) => {
        config.familyDensity.aquatic = density;
      });
      expect(result.perType[0]).toMatchObject({ effectiveTargetCount: target, spacingFloorTiles: 4 });
      expect(result.intents.length).toBeGreaterThan(1);
      for (let i = 0; i < result.intents.length; i++) {
        for (let j = i + 1; j < result.intents.length; j++) {
          expect(
            hexDistanceOddQPeriodicX(result.intents[i]!.plotIndex, result.intents[j]!.plotIndex, width)
          ).toBeGreaterThanOrEqual(4);
        }
      }
      expect(run(input, (config) => {
        config.familyDensity.aquatic = density;
      }).intents).toEqual(result.intents);
    }
  );

  it.each(["RESOURCE_FISH", "RESOURCE_CRABS"])(
    "preserves authored scaling and sparsity above target twelve for %s",
    (resourceType) => {
      const input = buildInput({
        demands: [{ resourceType, weight: 1, targetCount: 20, minCount: 16, maxCount: 24 }],
      });
      const result = run(input, (config) => {
        config.perTypeSpacingFloorScale = 1.5;
        config.sparsity = 0.5;
      });
      expect(result.perType[0]).toMatchObject({ effectiveTargetCount: 18, spacingFloorTiles: 9 });
    }
  );

  it("retains Fish supply and an explicit shortfall when only three admitted sites exist", () => {
    const range = resolveEarthlikeResourceExpectations({ aliveMajorPlayerCount: 10 })
      .find((row) => row.resourceType === "RESOURCE_FISH")!.expectedCountRange;
    const threeSites = maskFromPlots(8 * width + 8, 8 * width + 16, 8 * width + 24);
    const result = run(buildInput({
      demands: [{
        resourceType: "RESOURCE_FISH",
        weight: 1,
        targetCount: 3,
        minCount: range.min,
        maxCount: range.max,
        legalMask: threeSites,
        habitatMask: threeSites,
      }],
    }));
    expect(result.perType[0]).toMatchObject({
      authoredTargetCount: 3,
      effectiveTargetCount: 20,
      minCount: 20,
      maxCount: 40,
      plannedCount: 3,
      spacingFloorTiles: 4,
      shortfalls: [{ resourceType: "RESOURCE_FISH", reason: "no-admitted-site", count: 17 }],
    });
    expect(result.intents).toHaveLength(3);
  });

  it("distinguishes normal finite Fish rotation from the unchanged frozen legal-only minimum", () => {
    const landMask = new Uint8Array(cellCount).fill(1);
    const lakeMask = new Uint8Array(cellCount);
    const coastalWater = new Uint8Array(cellCount);
    const shelfWater = new Uint8Array(cellCount);
    const riverClass = new Uint8Array(cellCount);
    const temperature = new Float32Array(cellCount).fill(10);
    const seaIceCover = new Uint8Array(cellCount);
    const biomeType = new Int32Array(cellCount).fill(-1);
    const terrainType = new Int32Array(cellCount).fill(-1);
    const featureType = new Int32Array(cellCount).fill(-1);
    const engineWaterMask = new Uint8Array(cellCount);
    const fishId = resolveResourceRuntimeIds().byType.get("RESOURCE_FISH")?.resourceTypeId;
    if (fishId === undefined) throw new Error("Missing official Fish runtime id.");
    const placementRows: Readonly<
      Record<string, readonly (readonly [number, number, number])[] | undefined>
    > = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows;
    const placementRow = placementRows[String(fishId)]?.[0];
    if (!placementRow) throw new Error("Missing official Fish placement row.");
    const finitePlots: number[] = [];
    for (const y of [8, 16]) {
      for (const x of [8, 16, 24, 32, 40, 48]) finitePlots.push(y * width + x);
    }
    const marinePlots = [8 * width, 16 * width];
    const frozenTemperature = 24 * width + 8;
    const frozenCover = 24 * width + 16;
    const wrongSurface = 24 * width + 24;
    const excludedRiver = 24 * width + 32;
    const dry = 24 * width + 40;
    const finiteControls = [frozenTemperature, frozenCover, wrongSurface, excludedRiver];
    for (const plot of [...finitePlots, ...marinePlots, ...finiteControls]) {
      landMask[plot] = 0;
      engineWaterMask[plot] = 1;
      // Physical finite water uses the same legal coast row, not a native lake identity.
      biomeType[plot] = placementRow[0];
      terrainType[plot] = placementRow[1];
      featureType[plot] = placementRow[2];
    }
    for (const plot of [...finitePlots, ...finiteControls]) {
      lakeMask[plot] = 1;
      riverClass[plot + 1] = 1;
    }
    for (const plot of marinePlots) {
      coastalWater[plot] = 1;
      shelfWater[plot] = 1;
    }
    temperature[frozenTemperature] = -4;
    seaIceCover[frozenCover] = 128;
    featureType[wrongSurface] = -12345;
    const riverMask = maskFromPlots(excludedRiver);

    const physicalInput = {
      width,
      height,
      landMask,
      lakeMask,
      coastalWater,
      shelfWater,
      riverClass,
      surfaceTemperature: temperature,
      seaIceCover,
      aridityIndex: new Float32Array(cellCount),
      effectiveMoisture: new Float32Array(cellCount),
      vegetationDensity: new Float32Array(cellCount),
      fertility: new Float32Array(cellCount),
      elevation: new Int16Array(cellCount),
      hillMask: new Uint8Array(cellCount),
      mountainMask: new Uint8Array(cellCount),
    };
    const habitat = runAdmittedOperationForTest(
      resources.habitat.ops.deriveHabitatFields,
      physicalInput,
      resources.habitat.ops.deriveHabitatFields.defaultConfig
    );
    const resolved = runAdmittedOperationForTest(
      resources.demand.ops.resolveResourceDemands,
      {
        ...habitat,
        aliveMajorPlayerCount: 4,
        legalitySurface: { biomeType, terrainType, featureType, engineWaterMask },
        riverMasks: [riverMask],
      },
      resources.demand.ops.resolveResourceDemands.defaultConfig
    );
    const fish = resolved.candidates.admitted.find(
      (row) => row.source.resourceType === "RESOURCE_FISH"
    );
    if (!fish) throw new Error("Missing admitted physical finite Fish demand.");
    const landmassIdByTile = new Int32Array(cellCount);
    for (let i = 0; i < cellCount; i++) if (landMask[i] === 0) landmassIdByTile[i] = -1;
    const fishDemand: SelectInput["demands"][number] = {
      resourceType: fish.source.resourceType,
      family: fish.source.family,
      laneId: fish.source.laneId,
      laneKind: fish.source.laneKind,
      targetCount: fish.source.targetIntentCount,
      minCount: fish.source.expectedCountRange.min,
      maxCount: fish.source.expectedCountRange.max,
      habitatMask: fish.source.habitatMask,
      habitatTileCount: fish.source.habitatTileCount,
      ...fish.demand,
    };
    const input: SelectInput = {
      width,
      height,
      seed: TEST_MAP_SEED,
      landMask,
      lakeMask,
      landmassIdByTile,
      landmassTileCounts: [countMask(landMask)],
      regionSlotByTile: new Uint8Array(cellCount).fill(1),
      demands: [fishDemand],
    };
    const result = run(input);
    const finiteIntents = result.intents.filter((intent) => lakeMask[intent.plotIndex] === 1);

    expect(fish.source.expectedCountRange).toMatchObject({ min: 8, target: 12, max: 16 });
    expect(result.plannedCount).toBe(12);
    expect(result.rotationCount).toBe(12);
    expect(result.rangeFloorCount).toBe(0);
    expect(result.regionMinimumCount).toBe(0);
    expect(finiteIntents.length).toBeGreaterThan(0);
    expect(finiteIntents.length).toBeLessThan(finitePlots.length);
    expect(result.regionMinimums).toMatchObject([{ required: 1, forced: 0, shortfall: 0 }]);
    for (const intent of result.intents) {
      expect(intent).toMatchObject({ phase: "rotation", inHabitat: true, laneKind: "water" });
      expect(fish.demand.legalMask[intent.plotIndex]).toBe(1);
      expect(habitat.iceMask[intent.plotIndex]).toBe(0);
      expect([wrongSurface, excludedRiver, dry]).not.toContain(intent.plotIndex);
    }
    for (let i = 0; i < result.intents.length; i++) {
      for (let j = i + 1; j < result.intents.length; j++) {
        expect(
          hexDistanceOddQPeriodicX(result.intents[i]!.plotIndex, result.intents[j]!.plotIndex, width)
        ).toBeGreaterThanOrEqual(4);
      }
    }
    expect(run(input).intents).toEqual(result.intents);

    // The official regional floor is deliberately legal-only, not a normal habitat lane.
    temperature.fill(-4);
    for (const plot of marinePlots) featureType[plot] = -12345;
    const frozenHabitat = runAdmittedOperationForTest(
      resources.habitat.ops.deriveHabitatFields,
      physicalInput,
      resources.habitat.ops.deriveHabitatFields.defaultConfig
    );
    const frozenResolution = runAdmittedOperationForTest(
      resources.demand.ops.resolveResourceDemands,
      {
        ...frozenHabitat,
        aliveMajorPlayerCount: 4,
        legalitySurface: { biomeType, terrainType, featureType, engineWaterMask },
        riverMasks: [riverMask],
      },
      resources.demand.ops.resolveResourceDemands.defaultConfig
    );
    const frozenFish = frozenResolution.candidates.admitted.find(
      (row) => row.source.resourceType === "RESOURCE_FISH"
    );
    if (!frozenFish) throw new Error("Missing legal-only frozen finite Fish demand.");
    expect(frozenFish.source.habitatTileCount).toBe(0);
    expect(frozenFish.demand.eligibleTileCount).toBe(0);
    const legalOnly = run({
      ...input,
      demands: [
        {
          ...fishDemand,
          targetCount: frozenFish.source.targetIntentCount,
          habitatMask: frozenFish.source.habitatMask,
          habitatTileCount: frozenFish.source.habitatTileCount,
          ...frozenFish.demand,
        },
      ],
    });
    expect(legalOnly.plannedCount).toBe(1);
    expect(legalOnly.rotationCount).toBe(0);
    expect(legalOnly.rangeFloorCount).toBe(0);
    expect(legalOnly.regionMinimumCount).toBe(1);
    expect(legalOnly.intents).toMatchObject([{ phase: "region-minimum", inHabitat: false }]);
    expect(legalOnly.regionMinimums).toMatchObject([{ required: 1, forced: 1, shortfall: 0 }]);
    const legalOnlyPlot = legalOnly.intents[0]!.plotIndex;
    expect(lakeMask[legalOnlyPlot]).toBe(1);
    expect(frozenHabitat.iceMask[legalOnlyPlot]).toBe(1);
    expect(frozenHabitat.aquaticIntensity[legalOnlyPlot]).toBe(0);
    expect(frozenFish.demand.legalMask[legalOnlyPlot]).toBe(1);
  });

  describe("range completion competition", () => {
    // Both candidates fail seed 7331's thinning gate (draws 0.356 and 0.738).
    // A single false contest penalty would outweigh their 0.02 intensity gap.
    const preferredPlot = 1264;
    const fallbackPlot = 1268;
    const habitatMask = maskFromPlots(preferredPlot, fallbackPlot);
    const intensity = new Float32Array(cellCount);
    intensity[preferredPlot] = 0.3;
    intensity[fallbackPlot] = 0.28;
    const choosingDemand: Demand = {
      resourceType: "RESOURCE_CHOOSER",
      weight: 1,
      targetCount: 1,
      minCount: 1,
      maxCount: 1,
      habitatMask,
      legalMask: habitatMask,
      intensity,
    };

    for (const testCase of [
      { name: "already-satisfied", anchor: 691, targetCount: 1 },
      { name: "same-type-spacing-blocked", anchor: preferredPlot + 1, targetCount: 2 },
    ]) {
      it(`does not reserve a better site for ${testCase.name} competing demand`, () => {
        const rivalMask = maskFromPlots(testCase.anchor, preferredPlot);
        const rivalIntensity = new Float32Array(cellCount);
        rivalIntensity[testCase.anchor] = 1;
        const result = run(
          buildInput({
            seed: 7331,
            demands: [
              choosingDemand,
              {
                resourceType: "RESOURCE_RIVAL",
                weight: 1,
                targetCount: testCase.targetCount,
                minCount: 0,
                maxCount: 2,
                habitatMask: rivalMask,
                legalMask: rivalMask,
                intensity: rivalIntensity,
              },
            ],
          })
        );

        expect(result.intents.find((row) => row.resourceType === "RESOURCE_RIVAL")).toMatchObject({
          phase: "rotation",
          plotIndex: testCase.anchor,
        });
        expect(result.intents.find((row) => row.resourceType === "RESOURCE_CHOOSER")).toMatchObject(
          {
            phase: "range-floor",
            plotIndex: preferredPlot,
          }
        );
      });
    }

    it("does not reserve a better site for exclusion-blocked competing demand", () => {
      const rivalMask = maskFromPlots(preferredPlot);
      const blockerMask = maskFromPlots(preferredPlot + 1);
      const result = run(
        buildInput({
          seed: 7331,
          demands: [
            choosingDemand,
            {
              resourceType: "RESOURCE_RIVAL",
              weight: 1,
              targetCount: 1,
              minCount: 0,
              maxCount: 1,
              habitatMask: rivalMask,
              legalMask: rivalMask,
              intensity: new Float32Array(cellCount),
            },
            {
              resourceType: "RESOURCE_BLOCKER",
              weight: 1,
              targetCount: 1,
              minCount: 0,
              maxCount: 1,
              habitatMask: blockerMask,
              legalMask: blockerMask,
            },
          ],
        }),
        (config) => {
          config.affinityRules = [
            {
              resourceA: "RESOURCE_RIVAL",
              resourceB: "RESOURCE_BLOCKER",
              relation: "exclusion",
              radiusTiles: 2,
            },
          ];
        }
      );

      expect(result.intents.find((row) => row.resourceType === "RESOURCE_CHOOSER")).toMatchObject({
        phase: "range-floor",
        plotIndex: preferredPlot,
      });
      expect(result.perType.find((row) => row.resourceType === "RESOURCE_RIVAL")).toMatchObject({
        plannedCount: 0,
        shortfalls: [{ reason: "no-admitted-site", count: 1 }],
      });
    });

    it("still reserves a contested site for outstanding admissible target demand", () => {
      const rivalMask = maskFromPlots(preferredPlot);
      const result = run(
        buildInput({
          seed: 7331,
          demands: [
            choosingDemand,
            {
              resourceType: "RESOURCE_RIVAL",
              weight: 1,
              targetCount: 1,
              minCount: 0,
              maxCount: 1,
              habitatMask: rivalMask,
              legalMask: rivalMask,
              intensity: new Float32Array(cellCount),
            },
          ],
        })
      );

      expect(result.intents).toMatchObject([
        { phase: "range-floor", resourceType: "RESOURCE_CHOOSER", plotIndex: fallbackPlot },
        { phase: "range-floor", resourceType: "RESOURCE_RIVAL", plotIndex: preferredPlot },
      ]);
    });

    for (const inHabitat of [true, false]) {
      it(`preserves an outstanding regional minimum on a ${inHabitat ? "habitat" : "legal-only"} site`, () => {
        const rivalLegalMask = maskFromPlots(preferredPlot);
        const regionSlotByTile = new Uint8Array(cellCount);
        regionSlotByTile[preferredPlot] = 1;
        const result = run(
          buildInput({
            seed: 7331,
            regionSlotByTile,
            demands: [
              choosingDemand,
              {
                resourceType: "RESOURCE_RIVAL",
                weight: 1,
                targetCount: 0,
                minCount: 0,
                maxCount: 1,
                habitatMask: inHabitat ? rivalLegalMask : new Uint8Array(cellCount),
                legalMask: rivalLegalMask,
                regionMinimumRequirement: {
                  kind: "required",
                  minimumPerLandmass: admitPositiveResourceRegionMinimum(1),
                  source: "official-resource",
                },
              },
            ],
          })
        );

        expect(result.intents).toMatchObject([
          { phase: "range-floor", resourceType: "RESOURCE_CHOOSER", plotIndex: fallbackPlot },
          { phase: "region-minimum", resourceType: "RESOURCE_RIVAL", plotIndex: preferredPlot },
        ]);
        expect(result.regionMinimums).toMatchObject([{ required: 1, forced: 1, shortfall: 0 }]);
      });
    }
  });

  it("preserves high-versus-low intensity preference when both have ample legal capacity", () => {
    // A spacing-safe lattice gives equal capacity to both intensity bands,
    // so neither spacing nor a habitat/legality imbalance can explain preference.
    const admissionMask = new Uint8Array(cellCount);
    const intensity = new Float32Array(cellCount);
    let highCapacity = 0;
    let lowCapacity = 0;
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x <= width - 4; x += 4) {
        const plotIndex = y * width + x;
        const high = (x / 4 + y / 4) % 2 === 0;
        admissionMask[plotIndex] = 1;
        intensity[plotIndex] = high ? 0.9 : 0.1;
        if (high) highCapacity += 1;
        else lowCapacity += 1;
      }
    }
    const targetCount = 40;
    expect(highCapacity).toBeGreaterThan(targetCount);
    expect(lowCapacity).toBeGreaterThan(targetCount);
    const input = buildInput({
      seed: 1353,
      demands: [
        {
          resourceType: "RESOURCE_INTENSITY",
          weight: 1,
          targetCount,
          minCount: 0,
          maxCount: targetCount,
          habitatMask: admissionMask,
          legalMask: admissionMask,
          intensity,
        },
      ],
    });

    const result = run(input);
    const highCount = result.intents.filter((intent) => intensity[intent.plotIndex]! > 0.5).length;
    const lowCount = result.plannedCount - highCount;
    expect(result.rotationCount).toBe(targetCount);
    expect(result.rangeFloorCount).toBe(0);
    expect(highCount).toBeGreaterThan(3 * lowCount);
    expect(run(input).intents).toEqual(result.intents);
  });

  it("uses the supplied intensity directly instead of adding another admission baseline", () => {
    // Seed 7331 draws 0.356 at this plot: above its 0.3 intensity, but below
    // the duplicated 0.3 + 0.7 * intensity baseline of 0.51.
    const plotIndex = 1264;
    const admissionMask = maskFromPlots(plotIndex);
    const intensity = new Float32Array(cellCount);
    intensity[plotIndex] = 0.3;
    const result = run(
      buildInput({
        seed: 7331,
        demands: [
          {
            resourceType: "RESOURCE_INTENSITY",
            weight: 1,
            targetCount: 1,
            minCount: 0,
            maxCount: 1,
            habitatMask: admissionMask,
            legalMask: admissionMask,
            intensity,
          },
        ],
      })
    );

    expect(result.intents).toMatchObject([{ phase: "range-floor", plotIndex }]);
    expect(result.perType[0]).toMatchObject({
      rotationCount: 0,
      rangeFloorCount: 1,
      plannedCount: 1,
      shortfalls: [],
    });
  });

  it("leaves zero-intensity sites to lawful minimum and target completion, not rotation", () => {
    const admittedPlots = [0, 8, 16];
    const result = run(
      buildInput({
        seed: 1353,
        demands: [
          {
            resourceType: "RESOURCE_INTENSITY",
            weight: 1,
            targetCount: 3,
            minCount: 1,
            maxCount: 3,
            habitatMask: maskFromPlots(...admittedPlots, 24),
            legalMask: maskFromPlots(...admittedPlots, 32),
            intensity: new Float32Array(cellCount),
          },
        ],
      })
    );

    expect(result.intents.map((intent) => intent.plotIndex).sort((a, b) => a - b)).toEqual(
      admittedPlots
    );
    expect(result.intents.every((intent) => intent.phase === "range-floor")).toBe(true);
    expect(result.perType[0]).toMatchObject({
      effectiveTargetCount: 3,
      plannedCount: 3,
      rotationCount: 0,
      rangeFloorCount: 3,
      regionMinimumCount: 0,
      shortfalls: [],
    });
  });

  it("does not let a low-intensity family borrow another family's thinning admission", () => {
    // Seed 7331 orders the anchor first, then draws 0.356 at the contested plot:
    // admitted for intensity 1, rejected for intensity 0.
    const donorAnchor = 691;
    const contestedPlot = 1264;
    const donorFallback = 746;
    const borrowerFallback = 709;
    const donorMask = maskFromPlots(donorAnchor, contestedPlot, donorFallback);
    const borrowerMask = maskFromPlots(contestedPlot, borrowerFallback);
    const donorIntensity = new Float32Array(cellCount);
    donorIntensity[donorAnchor] = 1;
    donorIntensity[contestedPlot] = 1;
    donorIntensity[donorFallback] = 1;
    const borrowerIntensity = new Float32Array(cellCount);
    borrowerIntensity[borrowerFallback] = 1;

    const result = run(
      buildInput({
        seed: 7331,
        demands: [
          {
            resourceType: "RESOURCE_DONOR",
            family: "terrestrial",
            weight: 1,
            targetCount: 2,
            minCount: 0,
            maxCount: 2,
            habitatMask: donorMask,
            legalMask: donorMask,
            intensity: donorIntensity,
          },
          {
            resourceType: "RESOURCE_BORROWER",
            family: "geological",
            weight: 1,
            targetCount: 1,
            minCount: 0,
            maxCount: 1,
            habitatMask: borrowerMask,
            legalMask: borrowerMask,
            intensity: borrowerIntensity,
          },
        ],
      }),
      (config) => {
        config.siteSpacingTiles = 1;
        config.perTypeSpacingFloorScale = 0.5;
      }
    );

    expect(result.intents).toMatchObject([
      {
        phase: "rotation",
        plotIndex: donorAnchor,
        resourceType: "RESOURCE_DONOR",
        family: "terrestrial",
      },
      {
        phase: "rotation",
        plotIndex: contestedPlot,
        resourceType: "RESOURCE_DONOR",
        family: "terrestrial",
      },
      {
        phase: "rotation",
        plotIndex: borrowerFallback,
        resourceType: "RESOURCE_BORROWER",
        family: "geological",
      },
    ]);
  });

  it("allocates co-eligible rotation frequency proportional to 1/Weight (official deficit rotation, E2.1)", () => {
    // Scarce sites relative to targets so the rotation is the binding
    // mechanism: counts must fall as Weight rises.
    const scarceAdmissionMask = maskRectangle(20, 12);
    const result = run(
      buildInput({
        demands: [0.25, 0.5, 1, 2].map(
          (weight): Demand => ({
            resourceType: `RESOURCE_W${weight * 100}`,
            weight,
            targetCount: 60,
            minCount: 0,
            maxCount: 60,
            habitatMask: scarceAdmissionMask,
            legalMask: scarceAdmissionMask,
          })
        ),
      })
    );
    const byWeight = [...result.perType].sort((a, b) => a.weight - b.weight);
    expect(byWeight.map((row) => row.effectiveWeight)).toEqual([0.25, 0.5, 1, 2]);
    for (let i = 1; i < byWeight.length; i++) {
      expect(
        byWeight[i]!.rotationCount,
        `${byWeight[i]!.resourceType} vs ${byWeight[i - 1]!.resourceType}`
      ).toBeLessThan(byWeight[i - 1]!.rotationCount);
    }
  });

  it("honors per-type spacing floors and never plans above maxCount (E2.6, E2.7)", () => {
    const result = run(
      buildInput({
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 1,
            targetCount: 12,
            minCount: 4,
            maxCount: 14,
          },
          {
            resourceType: "RESOURCE_B",
            weight: 1,
            targetCount: 6,
            minCount: 2,
            maxCount: 8,
          },
        ],
      })
    );
    for (const row of result.perType) {
      expect(row.spacingFloorTiles).toBe(row.resourceType === "RESOURCE_A" ? 3 : 4);
      expect(row.plannedCount).toBeLessThanOrEqual(row.maxCount);
      const plots = result.intents
        .filter((intent) => intent.resourceType === row.resourceType)
        .map((intent) => intent.plotIndex);
      for (let i = 0; i < plots.length; i++) {
        for (let j = i + 1; j < plots.length; j++) {
          expect(hexDistanceOddQPeriodicX(plots[i]!, plots[j]!, width)).toBeGreaterThanOrEqual(
            row.spacingFloorTiles
          );
        }
      }
    }
  });

  it("records one truthful terminal deficit when complete site admission ends", () => {
    const oneLegalSite = maskFromPlots(0);
    const result = run(
      buildInput({
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 1,
            targetCount: 8,
            minCount: 1,
            maxCount: 10,
            legalMask: oneLegalSite,
          },
        ],
      })
    );
    const row = result.perType[0]!;
    expect(row.plannedCount).toBeGreaterThanOrEqual(row.minCount);
    expect(row.plannedCount).toBeLessThan(row.effectiveTargetCount);
    expect(row.shortfalls).toEqual([
      {
        resourceType: "RESOURCE_A",
        reason: "no-admitted-site",
        count: row.effectiveTargetCount - row.plannedCount,
      },
    ]);
  });

  it("collapses a terminal deficit with no legal site to complete admission failure", () => {
    const input = buildInput({
      demands: [
        {
          resourceType: "RESOURCE_A",
          weight: 1,
          targetCount: 1,
          minCount: 1,
          maxCount: 1,
          legalMask: new Uint8Array(cellCount),
        },
      ],
    });

    expect(run(input).perType[0]!.shortfalls).toEqual([
      {
        resourceType: "RESOURCE_A",
        reason: "no-admitted-site",
        count: 1,
      },
    ]);
  });

  it("records a shortfall instead of widening range repair beyond habitat admission", () => {
    const input = buildInput({
      demands: [
        {
          resourceType: "RESOURCE_A",
          weight: 1,
          targetCount: 4,
          minCount: 2,
          maxCount: 4,
          habitatMask: new Uint8Array(cellCount),
        },
      ],
    });

    const result = run(input);
    expect(result.intents).toEqual([]);
    expect(result.perType[0]?.shortfalls).toEqual([
      {
        resourceType: "RESOURCE_A",
        reason: "no-admitted-site",
        count: 4,
      },
    ]);
  });

  it("does not spend above-target headroom to repair density after region minimums", () => {
    const landmassBoundary = Math.floor(width / 2);
    const landmassIdByTile = new Int32Array(cellCount);
    for (let plotIndex = 0; plotIndex < cellCount; plotIndex += 1) {
      landmassIdByTile[plotIndex] = plotIndex % width < landmassBoundary ? 0 : 1;
    }
    const anchor = landmassBoundary - 5;
    const regionMinimumCandidate = landmassBoundary - 3;
    const overDensityCandidate = landmassBoundary - 1;
    const underDensityCandidates = [landmassBoundary, landmassBoundary + 3] as const;
    const habitatMask = maskFromPlots(anchor, overDensityCandidate, ...underDensityCandidates);
    const legalMask = maskFromPlots(
      anchor,
      regionMinimumCandidate,
      overDensityCandidate,
      ...underDensityCandidates
    );
    const intensity = new Float32Array(cellCount);
    intensity[anchor] = 1;
    intensity[overDensityCandidate] = 1;
    const regionSlotByTile = new Uint8Array(cellCount).fill(1);
    regionSlotByTile[regionMinimumCandidate] = 2;

    const result = run(
      buildInput({
        seed: RESOURCE_EQUITY_REGRESSION_MAP_SEED,
        landmassIdByTile,
        regionSlotByTile,
        landmassTileCounts: [landmassBoundary * height, (width - landmassBoundary) * height],
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 1,
            targetCount: 1,
            minCount: 1,
            maxCount: 4,
            habitatMask,
            legalMask,
            intensity,
            regionMinimumRequirement: {
              kind: "required",
              minimumPerLandmass: admitPositiveResourceRegionMinimum(1),
              source: "official-resource",
            },
          },
        ],
      }),
      (config) => {
        config.siteSpacingTiles = 6;
        config.perTypeSpacingFloorScale = 0.5;
      }
    );

    expect(result.intents[0]).toMatchObject({
      phase: "rotation",
      plotIndex: anchor,
      landmassId: 0,
    });
    expect(result.intents[1]).toMatchObject({
      phase: "region-minimum",
      plotIndex: regionMinimumCandidate,
      landmassId: 0,
      inHabitat: false,
    });
    expect(result.intents.filter((intent) => intent.phase === "range-floor")).toEqual([]);
    expect(result.intents.map((intent) => intent.plotIndex)).not.toContain(overDensityCandidate);
    for (const plotIndex of underDensityCandidates) {
      expect(result.intents.map((intent) => intent.plotIndex)).not.toContain(plotIndex);
    }
    expect(result.perType[0]).toMatchObject({
      effectiveTargetCount: 1,
      maxCount: 4,
      plannedCount: 2,
      rotationCount: 1,
      rangeFloorCount: 0,
      regionMinimumCount: 1,
    });
  });

  for (const alternativeSite of [false, true]) {
    it(`keeps regional minimums inside density equity with alternate site ${alternativeSite}`, () => {
      const boundary = width / 2;
      const left = [-26, -18, -10, -2].map((x) => 10 * width + boundary + x);
      const right = [6, 14].map((x) => 10 * width + boundary + x);
      const denseCandidate = 20 * width + 4;
      const sparseCandidate = 20 * width + boundary + 14;
      const landmassIdByTile = Int32Array.from({ length: cellCount }, (_, i) =>
        i % width < width / 2 ? 0 : 1
      );
      const regionSlotByTile = new Uint8Array(cellCount).fill(1);
      regionSlotByTile[denseCandidate] = 2;
      regionSlotByTile[sparseCandidate] = 2;
      const intensity = new Float32Array(cellCount);
      intensity[denseCandidate] = 1;
      const input = buildInput({
        landmassIdByTile,
        landmassTileCounts: [cellCount / 2, cellCount / 2],
        regionSlotByTile,
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 1,
            targetCount: 6,
            minCount: 6,
            maxCount: 6,
            habitatMask: maskFromPlots(...left, ...right),
            legalMask: maskFromPlots(...left, ...right),
          },
          {
            resourceType: "RESOURCE_B",
            weight: 1,
            targetCount: 0,
            minCount: 0,
            maxCount: 1,
            habitatMask: new Uint8Array(cellCount),
            legalMask: maskFromPlots(denseCandidate, ...(alternativeSite ? [sparseCandidate] : [])),
            intensity,
            regionMinimumRequirement: {
              kind: "required",
              minimumPerLandmass: admitPositiveResourceRegionMinimum(1),
              source: "official-resource",
            },
          },
        ],
      });
      const configure = (
        config: (typeof resources.sites.ops.selectResourceSites.defaultConfig)["config"]
      ) => {
        config.perTypeSpacingFloorScale = 0.5;
        config.equityMaxDensityRatio = 2;
      };
      const result = run(input, configure);
      expect(result.intents.filter((row) => row.resourceType === "RESOURCE_A")).toHaveLength(6);
      expect(result.intents.filter((row) => row.resourceType === "RESOURCE_B")).toEqual(
        alternativeSite
          ? [expect.objectContaining({ plotIndex: sparseCandidate, phase: "region-minimum" })]
          : []
      );
      expect(result.regionMinimums).toEqual([
        expect.objectContaining({
          regionSlot: 2,
          required: 1,
          forced: alternativeSite ? 1 : 0,
          shortfall: alternativeSite ? 0 : 1,
          ...(alternativeSite ? {} : { shortfallReason: "density-equity" }),
        }),
      ]);
      if (alternativeSite) expect(result.regionMinimums[0]?.shortfallReason).toBeUndefined();
      expect(run(input, configure)).toEqual(result);
    });
  }

  it("records density exhaustion after a successful placement in the same regional minimum", () => {
    const boundary = width / 2;
    const left = [-26, -18, -10].map((x) => 10 * width + boundary + x);
    const right = [6, 14].map((x) => 10 * width + boundary + x);
    const acceptedCandidate = 20 * width + 4;
    const blockedCandidate = 20 * width + 12;
    const regionSlotByTile = new Uint8Array(cellCount).fill(1);
    regionSlotByTile[acceptedCandidate] = 2;
    regionSlotByTile[blockedCandidate] = 2;
    const intensity = new Float32Array(cellCount);
    intensity[acceptedCandidate] = 1;
    intensity[blockedCandidate] = 0.5;
    const input = buildInput({
      landmassIdByTile: Int32Array.from({ length: cellCount }, (_, i) =>
        i % width < boundary ? 0 : 1
      ),
      landmassTileCounts: [cellCount / 2, cellCount / 2],
      regionSlotByTile,
      demands: [
        {
          resourceType: "RESOURCE_A",
          weight: 1,
          targetCount: 5,
          minCount: 5,
          maxCount: 5,
          habitatMask: maskFromPlots(...left, ...right),
          legalMask: maskFromPlots(...left, ...right),
        },
        {
          resourceType: "RESOURCE_B",
          weight: 1,
          targetCount: 0,
          minCount: 0,
          maxCount: 3,
          habitatMask: new Uint8Array(cellCount),
          legalMask: maskFromPlots(acceptedCandidate, blockedCandidate),
          intensity,
          regionMinimumRequirement: {
            kind: "required",
            minimumPerLandmass: admitPositiveResourceRegionMinimum(2),
            source: "official-resource",
          },
        },
      ],
    });
    const configure = (
      config: (typeof resources.sites.ops.selectResourceSites.defaultConfig)["config"]
    ) => {
      config.perTypeSpacingFloorScale = 0.5;
      config.equityMaxDensityRatio = 2;
    };
    const result = run(input, configure);

    expect(result.intents.filter((row) => row.resourceType === "RESOURCE_A")).toHaveLength(5);
    expect(result.intents.filter((row) => row.resourceType === "RESOURCE_B")).toEqual([
      expect.objectContaining({ plotIndex: acceptedCandidate, phase: "region-minimum" }),
    ]);
    // The first addition reaches 4:2; the second would cross the same density limit at 5:2.
    expect(result.intents.filter((row) => row.landmassId === 0)).toHaveLength(4);
    expect(result.intents.filter((row) => row.landmassId === 1)).toHaveLength(2);
    expect(result.regionMinimums).toEqual([
      {
        resourceType: "RESOURCE_B",
        regionSlot: 2,
        required: 2,
        fromRotation: 0,
        forced: 1,
        shortfall: 1,
        shortfallReason: "density-equity",
      },
    ]);
    expect(run(input, configure)).toEqual(result);
  });

  it("keeps required range completion intensity-scored while density admission is open", () => {
    const landmassBoundary = Math.floor(width / 2);
    const landmassIdByTile = new Int32Array(cellCount);
    for (let plotIndex = 0; plotIndex < cellCount; plotIndex += 1) {
      landmassIdByTile[plotIndex] = plotIndex % width < landmassBoundary ? 0 : 1;
    }
    const anchor = landmassBoundary - 5;
    const clusteredCandidate = landmassBoundary - 1;
    const lowerDensityCandidate = landmassBoundary;
    const admissionMask = maskFromPlots(anchor, clusteredCandidate, lowerDensityCandidate);
    const intensity = new Float32Array(cellCount);
    intensity[anchor] = 1;
    intensity[clusteredCandidate] = 0.9;
    intensity[lowerDensityCandidate] = 0.1;

    const result = run(
      buildInput({
        seed: RESOURCE_EQUITY_REGRESSION_MAP_SEED,
        landmassIdByTile,
        landmassTileCounts: [landmassBoundary * height, (width - landmassBoundary) * height],
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 1,
            targetCount: 2,
            minCount: 2,
            maxCount: 2,
            habitatMask: admissionMask,
            legalMask: admissionMask,
            intensity,
          },
        ],
      }),
      (config) => {
        config.siteSpacingTiles = 6;
        config.perTypeSpacingFloorScale = 0.5;
      }
    );

    expect(result.intents).toMatchObject([
      { phase: "rotation", plotIndex: anchor, landmassId: 0 },
      { phase: "range-floor", plotIndex: clusteredCandidate, landmassId: 0 },
    ]);
    expect(result.perType[0]).toMatchObject({
      effectiveTargetCount: 2,
      plannedCount: 2,
      rotationCount: 1,
      rangeFloorCount: 1,
    });
  });

  it("enforces an explicit regional minimum three and skips only an official zero (E2.2)", () => {
    const demand = {
      resourceType: "RESOURCE_REQ",
      weight: 1,
      targetCount: 0,
      minCount: 0,
      maxCount: 12,
    } as const;
    const required = run(
      buildInput({
        demands: [
          {
            ...demand,
            regionMinimumRequirement: {
              kind: "required",
              minimumPerLandmass: admitPositiveResourceRegionMinimum(3),
              source: "official-resource",
            },
          },
        ],
      })
    );
    expect(required.regionMinimums).toHaveLength(2);
    for (const row of required.regionMinimums) {
      expect(row.required).toBe(3);
      expect(row.fromRotation + row.forced + row.shortfall).toBeGreaterThanOrEqual(row.required);
    }
    const perType = required.perType[0]!;
    expect(perType.plannedCount).toBe(6);
    expect(required.intents.some((intent) => intent.phase === "region-minimum")).toBe(true);

    const skipped = run(buildInput({ demands: [demand] }));
    expect(skipped.regionMinimums).toEqual([]);
    expect(skipped.intents).toEqual([]);
  });

  it("creates floors only for existing positive engine-region slots with legal candidates", () => {
    const legalMask = maskFromPlots(0, 8, 16);
    const regionSlotByTile = new Uint8Array(cellCount).fill(2);
    regionSlotByTile[0] = 0;
    regionSlotByTile[8] = 1;
    regionSlotByTile[16] = 1;
    const landmassIdByTile = new Int32Array(cellCount);
    landmassIdByTile[16] = 1;
    const demand: Demand = {
      resourceType: "RESOURCE_FISH",
      weight: 1,
      targetCount: 0,
      minCount: 0,
      maxCount: 12,
      legalMask,
      habitatMask: new Uint8Array(cellCount),
      regionMinimumRequirement: {
        kind: "required",
        minimumPerLandmass: admitPositiveResourceRegionMinimum(1),
        source: "official-resource",
      },
    };
    const result = run(
      buildInput({
        demands: [demand],
        regionSlotByTile,
        landmassIdByTile,
        landmassTileCounts: [cellCount - 1, 1],
      })
    );
    expect(result.regionMinimums).toEqual([
      {
        resourceType: "RESOURCE_FISH",
        regionSlot: 1,
        required: 1,
        fromRotation: 0,
        forced: 1,
        shortfall: 0,
      },
    ]);
    expect(result.intents).toHaveLength(1);
    expect(result.intents[0]?.inHabitat).toBe(false);

    // The same legal tiles in region zero or with no positive slot have no regional floor.
    const none = run(
      buildInput({ demands: [demand], regionSlotByTile: new Uint8Array(cellCount) })
    );
    expect(none.regionMinimums).toEqual([]);
    expect(none.intents).toEqual([]);
    const absentEast = run(
      buildInput({ demands: [demand], regionSlotByTile: new Uint8Array(cellCount).fill(1) })
    );
    expect(absentEast.regionMinimums.map((row) => row.regionSlot)).toEqual([1]);
  });

  it("reports sparse legal capacity as a shortfall without inventing an absent region", () => {
    const result = run(
      buildInput({
        regionSlotByTile: new Uint8Array(cellCount).fill(1),
        demands: [
          {
            resourceType: "RESOURCE_FISH",
            weight: 1,
            targetCount: 0,
            minCount: 0,
            maxCount: 12,
            legalMask: maskFromPlots(0),
            regionMinimumRequirement: {
              kind: "required",
              minimumPerLandmass: admitPositiveResourceRegionMinimum(3),
              source: "official-resource",
            },
          },
        ],
      })
    );
    expect(result.regionMinimums).toEqual([
      {
        resourceType: "RESOURCE_FISH",
        regionSlot: 1,
        required: 3,
        fromRotation: 0,
        forced: 1,
        shortfall: 2,
        shortfallReason: "no-admitted-site",
      },
    ]);
  });

  it("attributes a regional shortfall to the resource count cap", () => {
    const result = run(
      buildInput({
        regionSlotByTile: new Uint8Array(cellCount).fill(1),
        demands: [
          {
            resourceType: "RESOURCE_FISH",
            weight: 1,
            targetCount: 0,
            minCount: 0,
            maxCount: 1,
            legalMask: maskFromPlots(0, 8, 16),
            regionMinimumRequirement: {
              kind: "required",
              minimumPerLandmass: admitPositiveResourceRegionMinimum(3),
              source: "official-resource",
            },
          },
        ],
      })
    );
    expect(result.regionMinimums).toEqual([
      {
        resourceType: "RESOURCE_FISH",
        regionSlot: 1,
        required: 3,
        fromRotation: 0,
        forced: 1,
        shortfall: 2,
        shortfallReason: "max-count",
      },
    ]);
    expect(result.intents).toHaveLength(1);
  });

  it("keeps exclusion hard during the region-minimum force pass", () => {
    const westCenter = Math.floor(height / 2) * width + (width / 2 - 1);
    const eastCenter = westCenter + 1;
    const result = run(
      buildInput({
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 1,
            targetCount: 1,
            minCount: 1,
            maxCount: 1,
            legalMask: maskFromPlots(westCenter),
          },
          {
            resourceType: "RESOURCE_B",
            weight: 1,
            targetCount: 0,
            minCount: 0,
            maxCount: 2,
            legalMask: maskFromPlots(westCenter, eastCenter),
            regionMinimumRequirement: {
              kind: "required",
              minimumPerLandmass: admitPositiveResourceRegionMinimum(1),
              source: "official-resource",
            },
          },
        ],
      }),
      (config) => {
        config.affinityRules = [
          {
            resourceA: "RESOURCE_A",
            resourceB: "RESOURCE_B",
            relation: "exclusion",
            radiusTiles: 8,
          },
        ];
      }
    );

    expect(result.intents.filter((row) => row.resourceType === "RESOURCE_A")).toHaveLength(1);
    expect(result.intents.filter((row) => row.resourceType === "RESOURCE_B")).toEqual([]);
    expect(result.regionMinimums).toEqual([
      {
        resourceType: "RESOURCE_B",
        regionSlot: 1,
        required: 1,
        fromRotation: 0,
        forced: 0,
        shortfall: 1,
        shortfallReason: "no-admitted-site",
      },
      {
        resourceType: "RESOURCE_B",
        regionSlot: 2,
        required: 1,
        fromRotation: 0,
        forced: 0,
        shortfall: 1,
        shortfallReason: "no-admitted-site",
      },
    ]);
    expect(result.perType.find((row) => row.resourceType === "RESOURCE_B")?.shortfalls).toEqual([]);
  });

  it("expresses sparsity at knob max and resource-resource exclusion (E3.4)", () => {
    const demands: Demand[] = [
      {
        resourceType: "RESOURCE_A",
        weight: 1,
        targetCount: 16,
        minCount: 4,
        maxCount: 20,
      },
      {
        resourceType: "RESOURCE_B",
        weight: 1,
        targetCount: 16,
        minCount: 4,
        maxCount: 20,
      },
    ];
    const baseline = run(buildInput({ demands }));
    const sparse = run(buildInput({ demands }), (config) => {
      config.sparsity = 1;
      config.affinityRules = [
        { resourceA: "RESOURCE_A", resourceB: "RESOURCE_B", relation: "exclusion", radiusTiles: 4 },
      ];
    });

    expect(sparse.plannedCount).toBeLessThan(baseline.plannedCount);
    for (const row of sparse.perType) {
      expect(row.plannedCount).toBeLessThanOrEqual(row.minCount);
    }
    const plotsA = sparse.intents
      .filter((row) => row.resourceType === "RESOURCE_A")
      .map((row) => row.plotIndex);
    const plotsB = sparse.intents
      .filter((row) => row.resourceType === "RESOURCE_B")
      .map((row) => row.plotIndex);
    for (const a of plotsA) {
      for (const b of plotsB) {
        expect(hexDistanceOddQPeriodicX(a, b, width)).toBeGreaterThan(4);
      }
    }
  });

  it("is deterministic for a fixed seed", () => {
    const make = () =>
      run(
        buildInput({
          demands: [
            {
              resourceType: "RESOURCE_A",
              weight: 1,
              targetCount: 8,
              minCount: 2,
              maxCount: 10,
            },
            {
              resourceType: "RESOURCE_B",
              weight: 2,
              targetCount: 8,
              minCount: 2,
              maxCount: 10,
            },
          ],
        })
      );
    const first = make();
    const second = make();
    expect(second.intents).toEqual(first.intents);
  });
});
