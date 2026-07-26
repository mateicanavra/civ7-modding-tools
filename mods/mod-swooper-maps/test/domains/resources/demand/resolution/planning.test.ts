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
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../setup.js";

type ResolveInput = Parameters<typeof resources.demand.ops.resolveResourceDemands.run>[0];
type ResolveOutput = ReturnType<typeof resources.demand.ops.resolveResourceDemands.run>;
type TerminalCandidate =
  | ResolveOutput["candidates"]["admitted"][number]
  | ResolveOutput["candidates"]["excluded"]["expectationBlocked"][number]
  | ResolveOutput["candidates"]["excluded"]["ageDeferred"][number]
  | ResolveOutput["candidates"]["excluded"]["noLegalSites"][number];

const BLOCKED_RESOURCE_TYPES = [
  "RESOURCE_CLOVES",
  "RESOURCE_GOLD_DISTANT_LANDS",
  "RESOURCE_LAPIS_LAZULI",
  "RESOURCE_NICKEL",
  "RESOURCE_SILVER_DISTANT_LANDS",
] as const;

describe("resource demand resolution", () => {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;

  it("partitions the exact official corpus with canonical blocked, range, and lane identity", () => {
    const result = run(buildFixture());
    const candidates = allCandidates(result);
    const expectedTypes = EARTHLIKE_RESOURCE_EXPECTATIONS.map((row) => row.resourceType);

    expect(candidates).toHaveLength(expectedTypes.length);
    expect(new Set(candidates.map((candidate) => candidate.source.resourceType))).toEqual(
      new Set(expectedTypes)
    );
    expect(
      result.candidates.excluded.expectationBlocked
        .map((candidate) => candidate.source.resourceType)
        .sort()
    ).toEqual([...BLOCKED_RESOURCE_TYPES].sort());

    const selected = selectedResourceFixture();
    const admitted = result.candidates.admitted.find(
      (candidate) => candidate.source.resourceType === selected.resourceType
    );
    const expectation = EARTHLIKE_RESOURCE_EXPECTATIONS.find(
      (row) => row.resourceType === selected.resourceType
    );
    if (!admitted || !expectation) {
      throw new Error(`Expected admitted fixture ${selected.resourceType}.`);
    }
    const signal = RESOURCE_HABITAT_SIGNALS.get(selected.resourceType);
    if (!signal) throw new Error(`Missing signal for ${selected.resourceType}.`);

    expect(admitted.source.expectedCountRange).toEqual(expectation.expectedCountRange);
    expect(admitted.source.targetIntentCount).toBe(expectation.expectedCountRange.target);
    expect(admitted.source).toMatchObject({
      family: signal.family,
      laneId: signal.laneId,
      laneKind: signal.laneKind,
      habitatTileCount: size,
    });

    const dyes = candidates.find((candidate) => candidate.source.resourceType === "RESOURCE_DYES");
    expect(dyes?.source).toMatchObject({
      groupId: "cultivated-plantation-medicinal",
      family: "cultivated",
      laneId: "marine-dye",
      laneKind: "water",
    });
  });

  it("removes every river tile before deciding whether a resource has an eligible site", () => {
    const selected = selectedResourceFixture();
    const baseline = run(buildFixture(selected.resourceType));
    const baselineCandidate = baseline.candidates.admitted.find(
      (candidate) => candidate.source.resourceType === selected.resourceType
    );
    if (!baselineCandidate) throw new Error(`Missing admitted ${selected.resourceType}.`);

    const firstRiverMask = new Uint8Array(size);
    firstRiverMask[0] = 1;
    const secondRiverMask = new Uint8Array(size);
    secondRiverMask[1] = 1;
    const partial = run(buildFixture(selected.resourceType, [firstRiverMask, secondRiverMask]));
    const partialCandidate = partial.candidates.admitted.find(
      (candidate) => candidate.source.resourceType === selected.resourceType
    );
    if (!partialCandidate) throw new Error(`Missing partially masked ${selected.resourceType}.`);
    expect(partialCandidate.demand.legalMask[0]).toBe(0);
    expect(partialCandidate.demand.legalMask[1]).toBe(0);
    expect(partialCandidate.demand.eligibleTileCount).toBe(
      baselineCandidate.demand.eligibleTileCount - 2
    );

    const covered = run(buildFixture(selected.resourceType, [new Uint8Array(size).fill(1)]));
    const excluded = covered.candidates.excluded.noLegalSites.find(
      (candidate) => candidate.source.resourceType === selected.resourceType
    );
    expect(excluded?.reason.kind).toBe("no-legal-sites");
  });

  it("records the source-matched future-age disposition without weakening the corpus ledger", () => {
    const result = run(buildFixture());
    const withheld = EARTHLIKE_RESOURCE_EXPECTATIONS.find(
      (expectation) =>
        expectation.status === "expected" &&
        getInitialMapResourcePolicyForType(
          expectation.resourceType,
          INITIAL_MAP_RESOURCE_AUTHORING_AGE
        )?.status === "deferred-future-age"
    );
    if (!withheld) throw new Error("Missing a future-age resource fixture.");

    const candidate = result.candidates.excluded.ageDeferred.find(
      (row) => row.source.resourceType === withheld.resourceType
    );
    expect(candidate).toMatchObject({
      source: {
        resourceType: withheld.resourceType,
        expectationStatus: "expected",
        expectedCountRange: withheld.expectedCountRange,
      },
      reason: {
        kind: "age-policy",
        status: "deferred-future-age",
        age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
      },
    });
  });

  it("fails closed when a positive regional minimum has no engine observation", () => {
    expect(() => run(buildFixture("RESOURCE_GOLD", [], "RESOURCE_GOLD"))).toThrow(
      /Missing required-for-age observation for RESOURCE_GOLD with official regional minimum 8/
    );
  });

  it("preserves the legal-only regional-minimum pass when habitat has no overlap", () => {
    const input = buildFixture("RESOURCE_GOLD");
    const signal = RESOURCE_HABITAT_SIGNALS.get("RESOURCE_GOLD");
    if (!signal) throw new Error("Missing RESOURCE_GOLD habitat signal.");
    const habitatFields = input as ResolveInput & Record<string, Uint8Array>;
    for (const field of signal.primary) habitatFields[field].fill(0);

    const resolved = run(input);
    const candidate = resolved.candidates.admitted.find(
      (row) => row.source.resourceType === "RESOURCE_GOLD"
    );
    if (!candidate) throw new Error("Missing admitted RESOURCE_GOLD demand.");
    expect(candidate.source.habitatTileCount).toBe(0);
    expect(candidate.demand.eligibleTileCount).toBe(0);
    expect(candidate.demand.legalTileCount).toBeGreaterThan(0);
    expect(candidate.demand.regionMinimumRequirement.kind).toBe("required");

    const regionSlotByTile = new Uint8Array(size);
    for (let plotIndex = 0; plotIndex < size; plotIndex += 1) {
      regionSlotByTile[plotIndex] = plotIndex % width < width / 2 ? 1 : 2;
    }
    const selection = runAdmittedOperationForTest(
      resources.sites.ops.selectResourceSites,
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        landMask: new Uint8Array(size).fill(1),
        lakeMask: new Uint8Array(size),
        landmassIdByTile: new Int32Array(size),
        landmassTileCounts: [size],
        regionSlotByTile,
        minimumAmountModifier: resolved.minimumAmountModifier,
        demands: [
          {
            resourceType: candidate.source.resourceType,
            family: candidate.source.family,
            laneId: candidate.source.laneId,
            laneKind: candidate.source.laneKind,
            targetCount: candidate.source.targetIntentCount,
            minCount: candidate.source.expectedCountRange.min,
            maxCount: candidate.source.expectedCountRange.max,
            habitatMask: candidate.source.habitatMask,
            habitatTileCount: candidate.source.habitatTileCount,
            ...candidate.demand,
          },
        ],
      },
      resources.sites.ops.selectResourceSites.defaultConfig
    );

    expect(selection.regionMinimums).toHaveLength(2);
    expect(selection.intents.some((intent) => intent.phase === "region-minimum")).toBe(true);
  });

  function run(input: ResolveInput): ResolveOutput {
    return resources.demand.ops.resolveResourceDemands.run(
      input,
      resources.demand.ops.resolveResourceDemands.defaultConfig
    );
  }

  function buildFixture(
    requestedType: OfficialResourceType = selectedResourceFixture().resourceType,
    riverMasks: Uint8Array[] = [],
    omitRequiredObservation?: OfficialResourceType
  ): ResolveInput {
    const selected = selectedResourceFixture(requestedType);
    const primaryFields = new Set(
      [...RESOURCE_HABITAT_SIGNALS.values()].flatMap((signal) => signal.primary)
    );
    const habitatMasks = Object.fromEntries(
      HABITAT_MASK_FIELD_NAMES.map((field) => [
        field,
        new Uint8Array(size).fill(primaryFields.has(field) ? 1 : 0),
      ])
    ) as Record<(typeof HABITAT_MASK_FIELD_NAMES)[number], Uint8Array>;
    const requiredForAge = Object.fromEntries(
      [...resolveResourceRuntimeIds().byType.entries()]
        .filter(
          ([resourceType, value]) =>
            value.minimumPerHemisphere > 0 && resourceType !== omitRequiredObservation
        )
        .map(([resourceType]) => [resourceType, true])
    );

    return {
      width,
      height,
      ...habitatMasks,
      aquaticIntensity: new Float32Array(size).fill(1),
      cultivatedIntensity: new Float32Array(size).fill(1),
      terrestrialIntensity: new Float32Array(size).fill(1),
      geologicalIntensity: new Float32Array(size).fill(1),
      legalitySurface: {
        biomeType: new Int32Array(size).fill(selected.placementRow[0]),
        terrainType: new Int32Array(size).fill(selected.placementRow[1]),
        featureType: new Int32Array(size).fill(selected.placementRow[2]),
        engineWaterMask: new Uint8Array(size),
      },
      requiredForAge,
      riverMasks,
      minimumAmountModifier: 0,
    };
  }
});

function selectedResourceFixture(requestedType?: OfficialResourceType): {
  resourceType: OfficialResourceType;
  placementRow: readonly [number, number, number];
} {
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
      row.status === "expected" &&
      signal !== undefined &&
      signal.laneKind === "land" &&
      resolved !== undefined &&
      (requestedType !== undefined || resolved.minimumPerHemisphere === 0) &&
      getInitialMapResourcePolicyForType(row.resourceType, INITIAL_MAP_RESOURCE_AUTHORING_AGE)
        ?.status === "eligible" &&
      (validRows[String(resolved.resourceTypeId)]?.length ?? 0) > 0
    );
  });
  if (!expectation) throw new Error("Missing an age-eligible resource demand fixture.");
  const resolved = resolution.byType.get(expectation.resourceType);
  if (!resolved) throw new Error(`Missing runtime id for ${expectation.resourceType}.`);
  const placementRow = validRows[String(resolved.resourceTypeId)]?.[0];
  if (!placementRow) throw new Error(`Missing placement row for ${expectation.resourceType}.`);
  return { resourceType: expectation.resourceType, placementRow };
}

function allCandidates(result: ResolveOutput): TerminalCandidate[] {
  return [
    ...result.candidates.admitted,
    ...result.candidates.excluded.expectationBlocked,
    ...result.candidates.excluded.ageDeferred,
    ...result.candidates.excluded.noLegalSites,
  ];
}
