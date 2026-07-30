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
  type HabitatMaskFieldName,
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
type HabitatMaskFields = Partial<Record<HabitatMaskFieldName, Uint8Array>>;

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

  it("resolves the canonical aquatic and cultivated habitat lanes through the public operation", () => {
    const cases = [
      {
        resourceType: "RESOURCE_CRABS",
        field: "navigableRiverMouthMask",
        laneId: "aquatic",
        laneKind: "water",
        plotIndex: 4,
      },
      {
        resourceType: "RESOURCE_DYES",
        field: "coastalMarineMask",
        laneId: "marine-dye",
        laneKind: "water",
        plotIndex: 3,
      },
      {
        resourceType: "RESOURCE_DATES",
        field: "oasisOrDesertWaterMask",
        laneId: "arid-oasis-resin",
        laneKind: "land",
        plotIndex: 5,
      },
      {
        resourceType: "RESOURCE_RICE",
        field: "wetlandPaddyMask",
        laneId: "wetland-paddy",
        laneKind: "land",
        plotIndex: 7,
      },
    ] as const satisfies readonly {
      resourceType: OfficialResourceType;
      field: HabitatMaskFieldName;
      laneId: string;
      laneKind: "land" | "water";
      plotIndex: number;
    }[];

    for (const row of cases) {
      const signal = requireSignal(row.resourceType);
      const source = resolveHabitatSource(
        row.resourceType,
        fieldsWith(row.field, oneAt(row.plotIndex))
      );

      expect(signal.primary, row.resourceType).toContain(row.field);
      expect(source.laneId, row.resourceType).toBe(row.laneId);
      expect(source.laneKind, row.resourceType).toBe(row.laneKind);
      expect(source.habitatTileCount, row.resourceType).toBe(1);
      expect(source.habitatMask[row.plotIndex], row.resourceType).toBe(1);
    }

    expect(requireSignal("RESOURCE_CRABS").primary).toContain("navigableRiverMouthMask");
    expect(requireSignal("RESOURCE_TEA")).toMatchObject({
      laneId: "highland-medicinal",
      laneKind: "land",
    });
    expect(requireSignal("RESOURCE_TEA").primary).toContain("highlandOrReliefMask");
    expect(
      run(buildFixture()).candidates.excluded.ageDeferred.some(
        (candidate) => candidate.source.resourceType === "RESOURCE_TEA"
      )
    ).toBe(true);
  });

  it("keeps narrow geological proxies from broadening into adjacent signal fields", () => {
    const cases = [
      {
        resourceType: "RESOURCE_JADE",
        admittedField: "ultramaficMask",
        unrelatedField: "alluvialPlacerMask",
      },
      {
        resourceType: "RESOURCE_LIMESTONE",
        admittedField: "carbonateBeltMask",
        unrelatedField: "tundraDesertHillMask",
      },
      {
        resourceType: "RESOURCE_RUBIES",
        admittedField: "metamorphicBeltMask",
        unrelatedField: "carbonateBeltMask",
      },
    ] as const satisfies readonly {
      resourceType: OfficialResourceType;
      admittedField: HabitatMaskFieldName;
      unrelatedField: HabitatMaskFieldName;
    }[];

    for (const row of cases) {
      const signal = requireSignal(row.resourceType);
      const admitted = resolveHabitatSource(
        row.resourceType,
        fieldsWith(row.admittedField, oneAt(1))
      );
      const unrelated = resolveHabitatSource(
        row.resourceType,
        fieldsWith(row.unrelatedField, oneAt(1))
      );

      expect(signal.primary, row.resourceType).toContain(row.admittedField);
      expect(signal.primary, row.resourceType).not.toContain(row.unrelatedField);
      expect(admitted.habitatTileCount, row.resourceType).toBe(1);
      expect(unrelated.habitatTileCount, row.resourceType).toBe(0);
    }

    expect(requireSignal("RESOURCE_COAL").primary).toEqual([
      "sedimentaryBasinMask",
      "forestWetlandBasinMask",
    ]);
    expect(requireSignal("RESOURCE_NITER").primary).toContain("aridSoilMask");
    expect(requireSignal("RESOURCE_NITER").primary).not.toContain("wetAlluvialMask");
    expect(
      run(buildFixture()).candidates.excluded.ageDeferred.some(
        (candidate) => candidate.source.resourceType === "RESOURCE_NITER"
      )
    ).toBe(true);
  });

  it("applies terrestrial and geological suppressors after primary admission", () => {
    const cases = [
      {
        resourceType: "RESOURCE_HORSES",
        primaryField: "openGrassPlainsMask",
        suppressionField: "denseForestMask",
        suppressedPlot: 0,
      },
      {
        resourceType: "RESOURCE_WILD_GAME",
        primaryField: "diverseWildHabitatMask",
        suppressionField: "cultivatedPressureMask",
        suppressedPlot: 1,
      },
      {
        resourceType: "RESOURCE_GOLD",
        primaryField: "orogenyMask",
        suppressionField: "flatNonGeologicMask",
        suppressedPlot: 2,
      },
      {
        resourceType: "RESOURCE_LIMESTONE",
        primaryField: "carbonateBeltMask",
        suppressionField: "igneousTerrainMask",
        suppressedPlot: 4,
      },
    ] as const satisfies readonly {
      resourceType: OfficialResourceType;
      primaryField: HabitatMaskFieldName;
      suppressionField: HabitatMaskFieldName;
      suppressedPlot: number;
    }[];

    for (const row of cases) {
      const signal = requireSignal(row.resourceType);
      const source = resolveHabitatSource(
        row.resourceType,
        fieldsWith(
          row.primaryField,
          new Uint8Array(size).fill(1),
          row.suppressionField,
          oneAt(row.suppressedPlot)
        )
      );

      expect(signal.suppress, row.resourceType).toContain(row.suppressionField);
      expect(source.habitatTileCount, row.resourceType).toBe(size - 1);
      expect(source.habitatMask[row.suppressedPlot], row.resourceType).toBe(0);
    }

    expect(requireSignal("RESOURCE_OIL").primary).toContain("hydrocarbonBasinMask");
    expect(requireSignal("RESOURCE_OIL").suppress).toContain("offshoreMask");
    expect(
      run(buildFixture()).candidates.excluded.ageDeferred.some(
        (candidate) => candidate.source.resourceType === "RESOURCE_OIL"
      )
    ).toBe(true);
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
    const input = buildFixture("RESOURCE_GOLD", [], undefined, "empty-primary-habitat");

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

  function resolveHabitatSource(
    resourceType: OfficialResourceType,
    fields: HabitatMaskFields
  ): ResolveOutput["candidates"]["admitted"][number]["source"] {
    const habitatMasks = Object.fromEntries(
      HABITAT_MASK_FIELD_NAMES.map((field) => [
        field,
        fields[field]?.slice() ?? new Uint8Array(size),
      ])
    ) as Record<HabitatMaskFieldName, Uint8Array>;

    const result = run({ ...buildFixture(resourceType), ...habitatMasks });
    const candidate = [
      ...result.candidates.admitted,
      ...result.candidates.excluded.noLegalSites,
    ].find((row) => row.source.resourceType === resourceType);
    if (!candidate) {
      throw new Error(`${resourceType} did not reach habitat resolution.`);
    }
    return candidate.source;
  }

  function requireSignal(resourceType: OfficialResourceType) {
    const signal = RESOURCE_HABITAT_SIGNALS.get(resourceType);
    if (!signal) throw new Error(`Missing habitat signal for ${resourceType}.`);
    return signal;
  }

  function fieldsWith(
    field: HabitatMaskFieldName,
    mask: Uint8Array,
    secondField?: HabitatMaskFieldName,
    secondMask?: Uint8Array
  ): HabitatMaskFields {
    const fields: HabitatMaskFields = { [field]: mask };
    if (secondField !== undefined && secondMask !== undefined) fields[secondField] = secondMask;
    return fields;
  }

  function oneAt(plotIndex: number): Uint8Array {
    const mask = new Uint8Array(size);
    mask[plotIndex] = 1;
    return mask;
  }

  function buildFixture(
    requestedType: OfficialResourceType = selectedResourceFixture().resourceType,
    riverMasks: Uint8Array[] = [],
    omitRequiredObservation?: OfficialResourceType,
    habitatMode: "admitted" | "empty-primary-habitat" = "admitted"
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
    if (habitatMode === "empty-primary-habitat") {
      const signal = RESOURCE_HABITAT_SIGNALS.get(requestedType);
      if (!signal) throw new Error(`Missing ${requestedType} habitat signal.`);
      for (const field of signal.primary) habitatMasks[field].fill(0);
    }
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
      (requestedType !== undefined || signal.laneKind === "land") &&
      resolved !== undefined &&
      (requestedType !== undefined || resolved.minimumPerHemisphere === 0) &&
      getInitialMapResourcePolicyForType(row.resourceType, INITIAL_MAP_RESOURCE_AUTHORING_AGE)
        ?.status === "eligible" &&
      (requestedType !== undefined || (validRows[String(resolved.resourceTypeId)]?.length ?? 0) > 0)
    );
  });
  if (!expectation) throw new Error("Missing an age-eligible resource demand fixture.");
  const resolved = resolution.byType.get(expectation.resourceType);
  if (!resolved) throw new Error(`Missing runtime id for ${expectation.resourceType}.`);
  const placementRow = validRows[String(resolved.resourceTypeId)]?.[0] ?? ([0, 0, 0] as const);
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
