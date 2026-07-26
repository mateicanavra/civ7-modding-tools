import { describe, expect, it } from "bun:test";
import {
  CIV7_BROWSER_TABLES_V0,
  type OfficialResourceType,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  getInitialMapResourcePolicyForType,
  HABITAT_MASK_FIELD_NAMES,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  RESOURCE_HABITAT_SIGNALS,
} from "@mapgen/domain/resources";
import resources from "@mapgen/domain/resources/router";
import { TEST_MAP_SIZE } from "../../../../setup.js";

type ResolveInput = Parameters<typeof resources.demand.ops.resolveResourceDemands.run>[0];

describe("resource demand resolution", () => {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;

  it("removes every planned and current river tile before reporting selectable capacity", () => {
    const baseline = run(buildFixture());
    const firstRiverMask = new Uint8Array(size);
    firstRiverMask[0] = 1;
    const secondRiverMask = new Uint8Array(size);
    secondRiverMask[1] = 1;

    const result = run(buildFixture(undefined, [firstRiverMask, secondRiverMask]));

    expect(result.demands).toHaveLength(1);
    expect(result.demands[0]!.legalMask[0]).toBe(0);
    expect(result.demands[0]!.legalMask[1]).toBe(0);
    expect(result.demands[0]!.legalMask[2]).toBe(1);
    expect(result.summaries[0]!.legalTileCount).toBe(baseline.summaries[0]!.legalTileCount - 2);
    expect(result.summaries[0]!.eligibleTileCount).toBe(
      baseline.summaries[0]!.eligibleTileCount - 2
    );
  });

  it("records a terminal exclusion when rivers cover every otherwise legal site", () => {
    const result = run(buildFixture(undefined, [new Uint8Array(size).fill(1)]));

    expect(result.demands).toEqual([]);
    expect(result.excluded).toEqual([
      expect.objectContaining({ reason: { kind: "no-admitted-legal-tiles" } }),
    ]);
  });

  it("fails closed when a positive regional minimum has no engine observation", () => {
    expect(() => run(buildFixture("RESOURCE_GOLD", [], false))).toThrow(
      /Missing required-for-age observation for RESOURCE_GOLD with official regional minimum 8/
    );
  });

  function run(input: ResolveInput) {
    return resources.demand.ops.resolveResourceDemands.run(
      input,
      resources.demand.ops.resolveResourceDemands.defaultConfig
    );
  }

  function buildFixture(
    requestedType?: OfficialResourceType,
    riverMasks: Uint8Array[] = [],
    includeRequiredObservation = true
  ): ResolveInput {
    const resolution = resolveResourceRuntimeIds();
    const validRows = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows as Record<
      string,
      readonly (readonly [number, number, number])[] | undefined
    >;
    const expectation = EARTHLIKE_RESOURCE_EXPECTATIONS.find((row) => {
      if (requestedType !== undefined && row.resourceType !== requestedType) return false;
      const signal = RESOURCE_HABITAT_SIGNALS.get(row.resourceType);
      const resolved = resolution.byType.get(row.resourceType);
      return (
        signal !== undefined &&
        signal.family !== "aquatic" &&
        resolved !== undefined &&
        (requestedType !== undefined || resolved.minimumPerHemisphere === 0) &&
        getInitialMapResourcePolicyForType(row.resourceType, INITIAL_MAP_RESOURCE_AUTHORING_AGE)
          ?.status === "eligible" &&
        (validRows[String(resolved.resourceTypeId)]?.length ?? 0) > 0
      );
    });
    if (!expectation) throw new Error("Missing an age-eligible resource demand fixture.");

    const signal = RESOURCE_HABITAT_SIGNALS.get(expectation.resourceType)!;
    const resolved = resolution.byType.get(expectation.resourceType)!;
    const placementRow = validRows[String(resolved.resourceTypeId)]![0]!;
    const habitatMasks = Object.fromEntries(
      HABITAT_MASK_FIELD_NAMES.map((field) => [field, new Uint8Array(size)])
    );
    for (const field of signal.primary) {
      habitatMasks[field] = new Uint8Array(size).fill(1);
    }

    return {
      width,
      height,
      plannedRows: [
        {
          resourceType: expectation.resourceType,
          status: "planned",
          proofStatus: "warning-only",
          targetIntentCount: 2,
          eligibleTileCount: size,
        },
      ],
      ...habitatMasks,
      aquaticIntensity: new Float32Array(size).fill(1),
      cultivatedIntensity: new Float32Array(size).fill(1),
      terrestrialIntensity: new Float32Array(size).fill(1),
      geologicalIntensity: new Float32Array(size).fill(1),
      legalitySurface: {
        biomeType: new Int32Array(size).fill(placementRow[0]),
        terrainType: new Int32Array(size).fill(placementRow[1]),
        featureType: new Int32Array(size).fill(placementRow[2]),
        engineWaterMask: new Uint8Array(size),
      },
      requiredForAge:
        includeRequiredObservation && resolved.minimumPerHemisphere > 0
          ? { [expectation.resourceType]: true }
          : {},
      riverMasks,
      minimumAmountModifier: 0,
    } as ResolveInput;
  }
});
