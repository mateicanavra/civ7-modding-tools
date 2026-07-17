import { describe, expect, it } from "bun:test";

import resources from "@mapgen/domain/resources/ops";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import { artifactModules as placementArtifactModules } from "../../../src/recipes/standard/stages/placement/artifacts/index.js";
import { runOpValidated } from "../../support/compiler-helpers.js";

type SelectInput = Parameters<typeof resources.ops.selectResourceSites.run>[0];
type Demand = Pick<
  SelectInput["demands"][number],
  "resourceType" | "weight" | "targetCount" | "minCount" | "maxCount"
> &
  Partial<Pick<SelectInput["demands"][number], "minimumPerHemisphere" | "requiredForAge">>;

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
    seed: args.seed ?? 1337,
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
      minimumPerHemisphere: demand.minimumPerHemisphere ?? 0,
      requiredForAge: demand.requiredForAge ?? false,
      habitatMask: allLand,
      legalMask: allLand,
      intensity,
    })),
  };
}

type SelectResult = ReturnType<typeof resources.ops.selectResourceSites.run>;

function run(
  input: ReturnType<typeof buildInput>,
  configure?: (config: (typeof resources.ops.selectResourceSites.defaultConfig)["config"]) => void
): SelectResult {
  const selection = structuredClone(resources.ops.selectResourceSites.defaultConfig);
  configure?.(selection.config);
  return runOpValidated(resources.ops.selectResourceSites, input, selection);
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

  it("records one terminal target deficit after satisfying the range floor", () => {
    // The 4x3 periodic grid can satisfy the floor but not the target while preserving spacing.
    const result = run(
      buildInput({
        width: 4,
        height: 3,
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
        reason: "spacing-floor-preserved",
        count: row.effectiveTargetCount - row.plannedCount,
      },
    ]);
  });

  it("classifies a terminal deficit with no free legal site as eligibility exhaustion", () => {
    const input = buildInput({
      width: 4,
      height: 3,
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

    expect(run(input).perType[0]!.shortfalls).toEqual([
      {
        resourceType: "RESOURCE_A",
        reason: "eligible-tiles-exhausted",
        count: 1,
      },
    ]);
  });

  it("rejects stale terminal deficit evidence at the resource-plan artifact boundary", () => {
    const input = buildInput({
      width: 4,
      height: 3,
      demands: [
        {
          resourceType: "RESOURCE_A",
          weight: 10,
          targetCount: 8,
          minCount: 1,
          maxCount: 10,
        },
      ],
    });
    const result = run(input);
    const context = { dimensions: { width: input.width, height: input.height } };
    expect(placementArtifactModules.resourcePlan.validate(result, context)).toEqual([]);

    const missing = structuredClone(result);
    missing.perType[0]!.shortfalls.splice(0);
    expect(
      placementArtifactModules.resourcePlan
        .validate(missing, context)
        .some((entry) => entry.message.includes("requires one terminal shortfall"))
    ).toBe(true);

    const wrongType = structuredClone(result);
    wrongType.perType[0]!.shortfalls[0]!.resourceType = "RESOURCE_B";
    expect(
      placementArtifactModules.resourcePlan
        .validate(wrongType, context)
        .some((entry) => entry.message.includes("names another resource type"))
    ).toBe(true);

    const wrongCount = structuredClone(result);
    wrongCount.perType[0]!.shortfalls[0]!.count += 1;
    expect(
      placementArtifactModules.resourcePlan
        .validate(wrongCount, context)
        .some((entry) => entry.message.includes("terminal deficit"))
    ).toBe(true);

    const stale = structuredClone(result);
    stale.perType[0]!.effectiveTargetCount = stale.perType[0]!.plannedCount;
    expect(
      placementArtifactModules.resourcePlan
        .validate(stale, context)
        .some((entry) => entry.message.includes("requires no terminal shortfall"))
    ).toBe(true);
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

  it("keeps exclusion hard during the region-minimum force pass", () => {
    const result = run(
      buildInput({
        width: 8,
        height: 6,
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
            minimumPerHemisphere: 1,
            requiredForAge: true,
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
    const sparse = run(buildInput({ width, height: 20, demands }), (config) => {
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
