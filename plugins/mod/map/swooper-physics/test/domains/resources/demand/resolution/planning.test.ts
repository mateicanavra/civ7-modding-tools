import { describe, expect, it } from "bun:test";
import {
  CIV7_BROWSER_TABLES_V0,
  type OfficialResourceType,
  isResourceAdjacentToLandRuntimeOptional,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import {
  admitPositiveResourceRegionMinimum,
  resolveEarthlikeResourceExpectations,
  getInitialMapResourcePolicyForType,
  HABITAT_MASK_FIELD_NAMES,
  type HabitatMaskFieldName,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  RESOURCE_HABITAT_SIGNALS,
} from "../../../../../src/domain/resources/index.js";
import resources from "../../../../../src/domain/resources/router.js";
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
const expectations = resolveEarthlikeResourceExpectations({ aliveMajorPlayerCount: 4 });

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

  it.each([1, 3, 4, 5, 6, 8, 10, 64])(
    "publishes the resolved range once for every candidate at P=%s",
    (aliveMajorPlayerCount) => {
      const result = run({ ...buildFixture("RESOURCE_FISH"), aliveMajorPlayerCount });
      const resolved = resolveEarthlikeResourceExpectations({ aliveMajorPlayerCount });
      expect(result.aliveMajorPlayerCount).toBe(aliveMajorPlayerCount);
      const candidates = allCandidates(result);
      for (const expectation of resolved) {
        expect(
          candidates.find((row) => row.source.resourceType === expectation.resourceType)?.source
            .expectedCountRange
        ).toEqual(expectation.expectedCountRange);
      }
      expect(
        result.candidates.admitted.find((row) => row.source.resourceType === "RESOURCE_FISH")?.source
          .targetIntentCount
      ).toBe(3 * aliveMajorPlayerCount);
    }
  );

  it.each([undefined, 0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 65])(
    "refuses invalid required player supply at operation admission: %s",
    (aliveMajorPlayerCount) => {
      expect(() =>
        run({ ...buildFixture(), aliveMajorPlayerCount: aliveMajorPlayerCount as number })
      ).toThrow();
    }
  );

  it("requires an explicit player count at operation admission", () => {
    const { aliveMajorPlayerCount, ...input } = buildFixture();
    expect(aliveMajorPlayerCount).toBe(4);
    expect(() => run(input as ResolveInput)).toThrow();
  });

  it("bounds target intent by habitat capacity without rewriting the resolved range", () => {
    const input = buildFixture("RESOURCE_FISH");
    const habitatMasks = Object.fromEntries(
      HABITAT_MASK_FIELD_NAMES.map((field) => [field, new Uint8Array(size)])
    ) as Record<HabitatMaskFieldName, Uint8Array>;
    const result = run({ ...input, ...habitatMasks, lakeMask: oneAt(8), aliveMajorPlayerCount: 10 });
    const fish = result.candidates.admitted.find(
      (row) => row.source.resourceType === "RESOURCE_FISH"
    );
    expect(fish?.source).toMatchObject({
      expectedCountRange: { min: 20, target: 30, max: 40, evidence: "authored-gameplay" },
      targetIntentCount: 1,
      habitatTileCount: 1,
    });
  });

  it("partitions the exact official corpus with canonical blocked, range, and lane identity", () => {
    const result = run(buildFixture());
    const candidates = allCandidates(result);
    const expectedTypes = expectations.map((row) => row.resourceType);

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
    const expectation = expectations.find(
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

  it("admits unfrozen finite Fish without broadening the other aquatic habitat predicates", () => {
    const source = resolveHabitatSource("RESOURCE_FISH", {
      coastalWaterMask: oneAt(4),
      shelfMask: oneAt(8),
      lakeMask: maskAt(5, 6),
      iceMask: oneAt(6),
    });
    expect(requireSignal("RESOURCE_FISH").primary).toEqual([
      "coastalWaterMask",
      "shelfMask",
      "lakeMask",
    ]);
    expect(requireSignal("RESOURCE_FISH").suppress).toEqual(["iceMask"]);
    expect(source.habitatTileCount).toBe(3);
    expect(source.habitatMask).toEqual(maskAt(4, 5, 8));
    expect(source.habitatMask[7]).toBe(0);

    for (const [resourceType, primary, suppress] of [
      [
        "RESOURCE_PEARLS",
        ["warmShallowWaterMask", "reefOrProtectedShallowsMask"],
        ["lakeMask", "iceMask"],
      ],
      ["RESOURCE_WHALES", ["coldProductiveWaterMask", "shelfMask"], ["lakeMask", "iceMask"]],
      [
        "RESOURCE_CRABS",
        ["estuaryMask", "navigableRiverMouthMask", "coastalWaterMask"],
        ["iceMask"],
      ],
      [
        "RESOURCE_COWRIE",
        ["warmShallowWaterMask", "reefOrProtectedShallowsMask"],
        ["lakeMask", "iceMask"],
      ],
      [
        "RESOURCE_TURTLES",
        ["warmShallowWaterMask", "reefOrProtectedShallowsMask", "coastalWaterMask"],
        ["lakeMask", "iceMask"],
      ],
    ] as const) {
      expect(requireSignal(resourceType).primary, resourceType).toEqual(primary);
      expect(requireSignal(resourceType).suppress, resourceType).toEqual(suppress);
    }
    expect(resolveHabitatSource("RESOURCE_CRABS", { lakeMask: oneAt(5) }).habitatTileCount).toBe(0);
  });

  it("keeps finite Fish subject to official surfaces, adjacency, river exclusion, age, and range", () => {
    const baseline = buildFixture("RESOURCE_FISH");
    const marine = 8 * width;
    const shore = 8 * width + 8;
    const frozen = 8 * width + 16;
    const wrongSurface = 8 * width + 24;
    const river = 8 * width + 32;
    const interior = 8 * width + 40;
    const engineWaterMask = new Uint8Array(size).fill(1);
    for (const plot of [marine, shore, frozen, wrongSurface, river]) {
      engineWaterMask[plot + 1] = 0;
    }
    const featureType = Int32Array.from(baseline.legalitySurface.featureType);
    featureType[wrongSurface] = -12345;
    const result = run({
      ...baseline,
      coastalWaterMask: oneAt(marine),
      shelfMask: new Uint8Array(size),
      lakeMask: maskAt(shore, frozen, wrongSurface, river, interior),
      iceMask: oneAt(frozen),
      legalitySurface: { ...baseline.legalitySurface, engineWaterMask, featureType },
      riverMasks: [oneAt(river)],
    });
    const fish = result.candidates.admitted.find(
      (row) => row.source.resourceType === "RESOURCE_FISH"
    );
    if (!fish) throw new Error("Missing admitted finite Fish fixture.");

    expect(fish.source.habitatTileCount).toBe(5);
    expect(fish.source.habitatMask[shore]).toBe(1);
    expect(fish.source.habitatMask[frozen]).toBe(0);
    expect(fish.source.habitatMask[interior]).toBe(1);
    expect(fish.demand.eligibleTileCount).toBe(3);
    for (const plot of [marine, shore, interior]) expect(fish.demand.legalMask[plot]).toBe(1);
    for (const plot of [wrongSurface, river]) expect(fish.demand.legalMask[plot]).toBe(0);
    expect(
      isResourceAdjacentToLandRuntimeOptional(
        resolveResourceRuntimeIds().byType.get("RESOURCE_FISH")!.resourceTypeId
      )
    ).toBe(true);
    expect(fish.source.expectedCountRange).toMatchObject({ min: 8, target: 12, max: 16 });
    expect(result.age).toBe(INITIAL_MAP_RESOURCE_AUTHORING_AGE);
    for (const age of ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"] as const) {
      expect(getInitialMapResourcePolicyForType("RESOURCE_FISH", age)?.status).toBe("eligible");
    }
    expect(
      result.candidates.excluded.ageDeferred.some(
        (row) => row.source.resourceType === "RESOURCE_WHALES"
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
    const withheld = expectations.find(
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

  it("admits a non-staple minimum and exact fractional weights without engine observations", () => {
    for (const resourceType of [
      "RESOURCE_FISH",
      "RESOURCE_GOLD",
      "RESOURCE_HIDES",
      "RESOURCE_TIN",
    ] as const) {
      const candidate = run(buildFixture(resourceType)).candidates.admitted.find(
        (row) => row.source.resourceType === resourceType
      );
      const official = resolveResourceRuntimeIds().byType.get(resourceType)!;
      expect(candidate?.demand.weight).toBe(official.weight);
      expect(candidate?.demand.regionMinimumRequirement).toEqual({
        kind: "required",
        minimumPerLandmass: admitPositiveResourceRegionMinimum(official.minimumPerLandmass),
        source: "official-resource",
      });
    }
  });

  it("preserves the legal-only regional-minimum pass when habitat has no overlap", () => {
    const input = buildFixture("RESOURCE_GOLD", [], "empty-primary-habitat");

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
    return maskAt(plotIndex);
  }

  function maskAt(...plotIndices: number[]): Uint8Array {
    const mask = new Uint8Array(size);
    for (const plotIndex of plotIndices) mask[plotIndex] = 1;
    return mask;
  }

  function buildFixture(
    requestedType: OfficialResourceType = selectedResourceFixture().resourceType,
    riverMasks: Uint8Array[] = [],
    habitatMode: "admitted" | "empty-primary-habitat" = "admitted"
  ): ResolveInput {
    const selected = selectedResourceFixture(requestedType);
    const primaryFields = new Set(
      [...RESOURCE_HABITAT_SIGNALS.values()].flatMap((signal) => signal.primary)
    );
    const habitatMasks = Object.fromEntries(
      HABITAT_MASK_FIELD_NAMES.map((field) => [
        field,
        new Uint8Array(size).fill(primaryFields.has(field) && field !== "lakeMask" ? 1 : 0),
      ])
    ) as Record<(typeof HABITAT_MASK_FIELD_NAMES)[number], Uint8Array>;
    if (habitatMode === "empty-primary-habitat") {
      const signal = RESOURCE_HABITAT_SIGNALS.get(requestedType);
      if (!signal) throw new Error(`Missing ${requestedType} habitat signal.`);
      for (const field of signal.primary) habitatMasks[field].fill(0);
    }
    return {
      width,
      height,
      aliveMajorPlayerCount: 4,
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
      riverMasks,
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
  const expectation = expectations.find((row) => {
    if (requestedType !== undefined && row.resourceType !== requestedType) return false;
    const signal = RESOURCE_HABITAT_SIGNALS.get(row.resourceType);
    const resolved = resolution.byType.get(row.resourceType);
    return (
      row.status === "expected" &&
      signal !== undefined &&
      (requestedType !== undefined || signal.laneKind === "land") &&
      resolved !== undefined &&
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
