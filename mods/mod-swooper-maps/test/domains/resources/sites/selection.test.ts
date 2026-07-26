import { describe, expect, it } from "bun:test";
import { admitPositiveResourceRegionMinimum } from "@mapgen/domain/resources";

import resources from "@mapgen/domain/resources/router";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

type SelectInput = Parameters<typeof resources.sites.ops.selectResourceSites.run>[0];
type Demand = Pick<
  SelectInput["demands"][number],
  "resourceType" | "weight" | "targetCount" | "minCount" | "maxCount"
> &
  Partial<Pick<SelectInput["demands"][number], "regionMinimumRequirement">>;

function buildInput(args: {
  width: number;
  height: number;
  demands: Demand[];
  seed?: number;
}): SelectInput {
  const { width, height } = args;
  const size = width * height;
  const allLand = new Uint8Array(size).fill(1);
  const regionSlotByTile = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    regionSlotByTile[i] = i % width < width / 2 ? 1 : 2;
  }
  const intensity = new Float32Array(size).fill(1);
  return {
    width,
    height,
    seed: args.seed ?? TEST_MAP_SEED,
    landMask: allLand,
    lakeMask: new Uint8Array(size),
    landmassIdByTile: new Int32Array(size),
    landmassTileCounts: [size],
    regionSlotByTile,
    minimumAmountModifier: 0,
    demands: args.demands.map((demand): SelectInput["demands"][number] => ({
      resourceType: demand.resourceType,
      family: "geological",
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
      habitatMask: allLand,
      legalMask: allLand,
      intensity,
      habitatTileCount: size,
      legalTileCount: size,
      eligibleTileCount: size,
    })),
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
  it("allocates co-eligible rotation frequency proportional to 1/Weight (official deficit rotation, E2.1)", () => {
    const syntheticDimensions = { width: 20, height: 12 } as const;
    // Scarce sites relative to targets so the rotation is the binding
    // mechanism: counts must fall as Weight rises.
    const result = run(
      buildInput({
        ...syntheticDimensions,
        demands: [5, 10, 20, 40].map(
          (weight): Demand => ({
            resourceType: `RESOURCE_W${weight}`,
            weight,
            targetCount: 60,
            minCount: 0,
            maxCount: 60,
          })
        ),
      })
    );
    const byWeight = [...result.perType].sort((a, b) => a.weight - b.weight);
    for (let i = 1; i < byWeight.length; i++) {
      expect(
        byWeight[i]!.rotationCount,
        `${byWeight[i]!.resourceType} vs ${byWeight[i - 1]!.resourceType}`
      ).toBeLessThan(byWeight[i - 1]!.rotationCount);
    }
  });

  it("honors per-type spacing floors and never plans above maxCount (E2.6, E2.7)", () => {
    const syntheticDimensions = { width: 24, height: 16 } as const;
    const { width } = syntheticDimensions;
    const result = run(
      buildInput({
        ...syntheticDimensions,
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 10,
            targetCount: 12,
            minCount: 4,
            maxCount: 14,
          },
          {
            resourceType: "RESOURCE_B",
            weight: 10,
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
    const syntheticDimensions = { width: 4, height: 3 } as const;
    // The 4x3 periodic grid can satisfy the floor but not the target while preserving spacing.
    const result = run(
      buildInput({
        ...syntheticDimensions,
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 10,
            targetCount: 8,
            minCount: 1,
            maxCount: 10,
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
      ...TEST_MAP_SIZE.dimensions,
      demands: [
        {
          resourceType: "RESOURCE_A",
          weight: 10,
          targetCount: 1,
          minCount: 1,
          maxCount: 1,
        },
      ],
    });
    input.demands[0]!.legalMask.fill(0);
    input.demands[0]!.legalTileCount = 0;
    input.demands[0]!.eligibleTileCount = 0;

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
      ...TEST_MAP_SIZE.dimensions,
      demands: [
        {
          resourceType: "RESOURCE_A",
          weight: 10,
          targetCount: 4,
          minCount: 2,
          maxCount: 4,
        },
      ],
    });
    input.demands[0]!.habitatMask.fill(0);
    input.demands[0]!.habitatTileCount = 0;
    input.demands[0]!.eligibleTileCount = 0;

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

  it("runs the region-minimum force pass only for an admitted required state (E2.2)", () => {
    const demand = {
      resourceType: "RESOURCE_REQ",
      weight: 10,
      targetCount: 0,
      minCount: 0,
      maxCount: 12,
    } as const;
    const required = run(
      buildInput({
        ...TEST_MAP_SIZE.dimensions,
        demands: [
          {
            ...demand,
            regionMinimumRequirement: {
              kind: "required",
              minimumPerHemisphere: admitPositiveResourceRegionMinimum(3),
              source: "engine",
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
    expect(perType.plannedCount).toBeGreaterThanOrEqual(4);
    expect(required.intents.some((intent) => intent.phase === "region-minimum")).toBe(true);

    for (const regionMinimumRequirement of [
      {
        kind: "not-required",
        minimumPerHemisphere: admitPositiveResourceRegionMinimum(3),
        source: "engine",
      },
      {
        kind: "unresolved",
        minimumPerHemisphere: admitPositiveResourceRegionMinimum(3),
        source: "engine-unavailable",
      },
    ] as const) {
      const skipped = run(
        buildInput({
          ...TEST_MAP_SIZE.dimensions,
          demands: [{ ...demand, regionMinimumRequirement }],
        })
      );
      expect(skipped.regionMinimums).toEqual([]);
      expect(skipped.intents).toEqual([]);
    }
  });

  it("keeps exclusion hard during the region-minimum force pass", () => {
    const syntheticDimensions = { width: 8, height: 6 } as const;
    const result = run(
      buildInput({
        ...syntheticDimensions,
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 10,
            targetCount: 1,
            minCount: 1,
            maxCount: 1,
          },
          {
            resourceType: "RESOURCE_B",
            weight: 10,
            targetCount: 0,
            minCount: 0,
            maxCount: 2,
            regionMinimumRequirement: {
              kind: "required",
              minimumPerHemisphere: admitPositiveResourceRegionMinimum(1),
              source: "engine",
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
    const syntheticDimensions = { width: 32, height: 20 } as const;
    const { width } = syntheticDimensions;
    const demands: Demand[] = [
      {
        resourceType: "RESOURCE_A",
        weight: 10,
        targetCount: 16,
        minCount: 4,
        maxCount: 20,
      },
      {
        resourceType: "RESOURCE_B",
        weight: 10,
        targetCount: 16,
        minCount: 4,
        maxCount: 20,
      },
    ];
    const baseline = run(buildInput({ ...syntheticDimensions, demands }));
    const sparse = run(buildInput({ ...syntheticDimensions, demands }), (config) => {
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
          ...TEST_MAP_SIZE.dimensions,
          demands: [
            {
              resourceType: "RESOURCE_A",
              weight: 10,
              targetCount: 8,
              minCount: 2,
              maxCount: 10,
            },
            {
              resourceType: "RESOURCE_B",
              weight: 20,
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
