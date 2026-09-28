import { describe, expect, it } from "bun:test";
import { admitPositiveResourceRegionMinimum } from "../../../../src/domain/resources/index.js";

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
        expect(result.intents.find((row) => row.resourceType === "RESOURCE_CHOOSER")).toMatchObject({
          phase: "range-floor",
          plotIndex: preferredPlot,
        });
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
      },
    ]);
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
      },
      {
        resourceType: "RESOURCE_B",
        regionSlot: 2,
        required: 1,
        fromRotation: 0,
        forced: 0,
        shortfall: 1,
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
