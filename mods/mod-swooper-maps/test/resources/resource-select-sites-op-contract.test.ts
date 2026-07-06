import { describe, expect, it } from "bun:test";

import resources from "@mapgen/domain/resources/ops";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import { runOpValidated } from "../support/compiler-helpers.js";

type Demand = {
  resourceType: string;
  weight: number;
  targetCount: number;
  minCount: number;
  maxCount: number;
  minimumPerHemisphere?: number;
  requiredForAge?: boolean;
};

function buildInput(args: { width: number; height: number; demands: Demand[]; seed?: number }) {
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
    seed: args.seed ?? 1337,
    landMask: allLand,
    lakeMask: new Uint8Array(size),
    landmassIdByTile: new Int32Array(size),
    landmassTileCounts: [size],
    regionSlotByTile,
    minimumAmountModifier: 0,
    demands: args.demands.map((demand) => ({
      resourceType: demand.resourceType,
      family: "geological" as const,
      laneId: "probe",
      laneKind: "land" as const,
      weight: demand.weight,
      targetCount: demand.targetCount,
      minCount: demand.minCount,
      maxCount: demand.maxCount,
      minimumPerHemisphere: demand.minimumPerHemisphere ?? 0,
      requiredForAge: demand.requiredForAge ?? false,
      habitatMask: allLand,
      legalMask: allLand,
      intensity,
    })),
  };
}

type SelectResult = {
  plannedCount: number;
  intents: ReadonlyArray<{
    plotIndex: number;
    resourceType: string;
    phase: string;
  }>;
  perType: ReadonlyArray<{
    resourceType: string;
    weight: number;
    plannedCount: number;
    rotationCount: number;
    regionMinimumCount: number;
    minCount: number;
    maxCount: number;
    spacingFloorTiles: number;
    shortfalls: ReadonlyArray<{ reason: string; count: number }>;
  }>;
  regionMinimums: ReadonlyArray<{
    resourceType: string;
    regionSlot: number;
    required: number;
    forced: number;
    shortfall: number;
  }>;
};

function run(
  input: ReturnType<typeof buildInput>,
  config: Record<string, unknown> = {}
): SelectResult {
  return runOpValidated(resources.ops.selectResourceSites, input as never, {
    strategy: "default",
    config,
  }) as unknown as SelectResult;
}

describe("select-resource-sites operation contract", () => {
  it("materializes family density from property defaults", () => {
    expect(resources.ops.selectResourceSites.defaultConfig.config.familyDensity).toEqual({
      aquatic: 1,
      cultivated: 1,
      terrestrial: 1,
      geological: 1,
    });
  });

  it("allocates co-eligible rotation frequency proportional to 1/Weight (official deficit rotation, E2.1)", () => {
    // Scarce sites relative to targets so the rotation is the binding
    // mechanism: counts must fall as Weight rises.
    const result = run(
      buildInput({
        width: 20,
        height: 12,
        demands: [5, 10, 20, 40].map((weight, index) => ({
          resourceType: `RESOURCE_W${weight}`,
          weight,
          targetCount: 60,
          minCount: 0,
          maxCount: 60,
        })),
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
    const result = run(
      buildInput({
        width: 24,
        height: 16,
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
          expect(hexDistanceOddQPeriodicX(plots[i]!, plots[j]!, 24)).toBeGreaterThanOrEqual(
            row.spacingFloorTiles
          );
        }
      }
    }
  });

  it("records typed shortfalls instead of breaking floors when minimums are unreachable", () => {
    // 4x3 grid with min 8: spacing floors make 8 placements impossible.
    const result = run(
      buildInput({
        width: 4,
        height: 3,
        demands: [
          {
            resourceType: "RESOURCE_A",
            weight: 10,
            targetCount: 8,
            minCount: 8,
            maxCount: 10,
          },
        ],
      })
    );
    const row = result.perType[0]!;
    expect(row.plannedCount).toBeLessThan(row.minCount);
    const shortfall = row.shortfalls.reduce((sum, item) => sum + item.count, 0);
    expect(shortfall).toBeGreaterThan(0);
  });

  it("forces region minimums for required-for-age types with typed provenance (E2.2)", () => {
    const result = run(
      buildInput({
        width: 24,
        height: 16,
        demands: [
          {
            resourceType: "RESOURCE_REQ",
            weight: 10,
            targetCount: 2,
            minCount: 0,
            maxCount: 12,
            minimumPerHemisphere: 3,
            requiredForAge: true,
          },
        ],
      })
    );
    expect(result.regionMinimums).toHaveLength(2);
    for (const row of result.regionMinimums) {
      expect(row.required).toBe(3);
      expect(row.fromRotation + row.forced + row.shortfall).toBeGreaterThanOrEqual(row.required);
    }
    const perType = result.perType[0]!;
    expect(perType.plannedCount).toBeGreaterThanOrEqual(4);
    expect(result.intents.some((intent) => intent.phase === "region-minimum")).toBe(true);
  });

  it("expresses sparsity at knob max and resource-resource exclusion (E3.4)", () => {
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
    const width = 32;
    const baseline = run(buildInput({ width, height: 20, demands }));
    const sparse = run(buildInput({ width, height: 20, demands }), {
      sparsity: 1,
      affinityRules: [
        { resourceA: "RESOURCE_A", resourceB: "RESOURCE_B", relation: "exclusion", radiusTiles: 4 },
      ],
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
          width: 24,
          height: 16,
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
