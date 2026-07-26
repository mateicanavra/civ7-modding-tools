import type { StandardSurfaceComparison } from "./surfaces.js";
import type {
  StandardExactParityCapture,
  StandardFloodplainApplyCounters,
  StandardLakeFinalCounters,
  StandardLiveParityCapture,
  StandardLocalParityCapture,
  StandardParityComparison,
  StandardParityGrid,
} from "./types.js";

const FLOODPLAIN_FEATURE_KEY_PATTERN = /^FEATURE_[A-Z]+_FLOODPLAIN_(?:MINOR|NAVIGABLE)$/;

/** Bounded cell witness connecting planned, projected, and live river states. */
export type StandardRiverParityExample = Readonly<{
  x: number;
  y: number;
  plannedMinor: number | null;
  projectedNavigableTerrain: number | null;
  liveTerrainNavigableRiver: number | null;
  liveNavigableRiver: number | null;
  liveMinorRiver: number | null;
  liveRiverType: number | null;
}>;

/** River parity result spanning terrain, metadata, and native Civ7 object evidence. */
export type StandardRiverParityComparison = Readonly<{
  terrain: StandardParityComparison;
  metadata: StandardParityComparison;
  nativeObjects: StandardParityComparison;
  counts: Readonly<{
    plannedMinor: number;
    plannedMajor: number;
    projectedNavigableTerrain: number;
    liveTerrainNavigableRiver: number;
    liveRiver: number;
    liveNavigableRiver: number;
    liveMinorRiver: number;
    liveMinorOnPlannedMinor: number;
    liveMinorOffPlannedMinor: number;
    plannedMinorWithoutLiveMinor: number;
    projectedVsLiveTerrainMismatches: number;
    projectedVsLiveNavigableMismatches: number;
    liveTerrainVsNavigableMismatches: number;
    plannedMinorVsLiveMinorMismatches: number;
  }>;
  minorRiverStamping: StandardLocalParityCapture["hydrology"]["rivers"]["minorRiverStamping"];
  nativeRiverObjectCount: number | null;
  nativeRiverObjectSampleCount: number;
  examples: ReadonlyArray<StandardRiverParityExample>;
}>;

/** Exact-versus-replay comparison of final lake placement and drift counters. */
export type StandardLakeParityComparison = Readonly<{
  claim: StandardParityComparison;
  local: StandardLakeFinalCounters;
  exact?: StandardLakeFinalCounters;
  mismatchedFields: ReadonlyArray<keyof StandardLakeFinalCounters>;
}>;

/** Floodplain counter comparison closed against the final live feature surface. */
export type StandardFloodplainParityComparison = Readonly<{
  claim: StandardParityComparison;
  local: StandardFloodplainApplyCounters;
  exact?: StandardFloodplainApplyCounters;
  mismatchedFields: ReadonlyArray<keyof StandardFloodplainApplyCounters>;
}>;

/** Standard Hydrology parity result across rivers, lakes, and floodplain projection. */
export type StandardHydrologyParityComparison = Readonly<{
  rivers: StandardRiverParityComparison;
  lakes: StandardLakeParityComparison;
  floodplains: StandardFloodplainParityComparison;
}>;

/** Compares Standard Hydrology plans and counters with exact and live product evidence. */
export function compareStandardHydrology(args: {
  exact: StandardExactParityCapture;
  local: StandardLocalParityCapture;
  live: StandardLiveParityCapture;
  featureSurface: StandardSurfaceComparison;
}): StandardHydrologyParityComparison {
  return {
    rivers: compareStandardRivers(args.local, args.live),
    lakes: compareStandardLakes(args.exact, args.local),
    floodplains: compareStandardFloodplains(args.exact, args.local, args.featureSurface),
  };
}

function compareStandardRivers(
  local: StandardLocalParityCapture,
  live: StandardLiveParityCapture
): StandardRiverParityComparison {
  const projection = local.hydrology.rivers;
  const readback = live.hydrology.rivers;
  const terrainShapeMatches = gridsHaveSameShape(
    projection.projectedNavigableTerrain,
    readback.terrainNavigableRiver
  );
  const navigableShapeMatches = gridsHaveSameShape(
    projection.projectedNavigableTerrain,
    readback.navigableRiver
  );
  const minorShapeMatches = gridsHaveSameShape(projection.plannedMinor, readback.minorRiver);
  const terrainMetadataShapeMatches = gridsHaveSameShape(
    readback.terrainNavigableRiver,
    readback.navigableRiver
  );

  const counts = {
    plannedMinor: countOnes(projection.plannedMinor),
    plannedMajor: countOnes(projection.plannedMajor),
    projectedNavigableTerrain: countOnes(projection.projectedNavigableTerrain),
    liveTerrainNavigableRiver: countOnes(readback.terrainNavigableRiver),
    liveRiver: countOnes(readback.river),
    liveNavigableRiver: countOnes(readback.navigableRiver),
    liveMinorRiver: countOnes(readback.minorRiver),
    liveMinorOnPlannedMinor: 0,
    liveMinorOffPlannedMinor: 0,
    plannedMinorWithoutLiveMinor: 0,
    projectedVsLiveTerrainMismatches: 0,
    projectedVsLiveNavigableMismatches: 0,
    liveTerrainVsNavigableMismatches: 0,
    plannedMinorVsLiveMinorMismatches: 0,
  };
  const missingTerrainIndices = new Set<number>();
  const missingMetadataIndices = new Set<number>();
  const mismatchIndices = new Set<number>();
  const examples: StandardRiverParityExample[] = [];

  if (terrainShapeMatches) {
    for (let index = 0; index < projection.projectedNavigableTerrain.values.length; index += 1) {
      const projected = maskValue(projection.projectedNavigableTerrain.values[index]);
      const terrain = maskValue(readback.terrainNavigableRiver.values[index]);
      if (terrain === null) missingTerrainIndices.add(index);
      if (projected !== null && terrain !== null && projected !== terrain) {
        counts.projectedVsLiveTerrainMismatches += 1;
        mismatchIndices.add(index);
      }
    }
  }

  if (navigableShapeMatches) {
    for (let index = 0; index < projection.projectedNavigableTerrain.values.length; index += 1) {
      const projected = maskValue(projection.projectedNavigableTerrain.values[index]);
      const navigable = maskValue(readback.navigableRiver.values[index]);
      if (navigable === null) missingMetadataIndices.add(index);
      if (projected !== null && navigable !== null && projected !== navigable) {
        counts.projectedVsLiveNavigableMismatches += 1;
        mismatchIndices.add(index);
      }
    }
  }

  if (terrainMetadataShapeMatches) {
    for (let index = 0; index < readback.terrainNavigableRiver.values.length; index += 1) {
      const terrain = maskValue(readback.terrainNavigableRiver.values[index]);
      const navigable = maskValue(readback.navigableRiver.values[index]);
      if (terrain === null || navigable === null) missingMetadataIndices.add(index);
      if (terrain !== null && navigable !== null && terrain !== navigable) {
        counts.liveTerrainVsNavigableMismatches += 1;
        mismatchIndices.add(index);
      }
    }
  }

  if (minorShapeMatches) {
    for (let index = 0; index < projection.plannedMinor.values.length; index += 1) {
      const plannedMinor = maskValue(projection.plannedMinor.values[index]);
      const liveMinor = maskValue(readback.minorRiver.values[index]);
      if (liveMinor === null) missingMetadataIndices.add(index);
      if (plannedMinor !== null && liveMinor !== null && plannedMinor !== liveMinor) {
        counts.plannedMinorVsLiveMinorMismatches += 1;
        mismatchIndices.add(index);
      }
      if (plannedMinor === 1 && liveMinor === 1) counts.liveMinorOnPlannedMinor += 1;
      if (plannedMinor === 0 && liveMinor === 1) counts.liveMinorOffPlannedMinor += 1;
      if (plannedMinor === 1 && liveMinor === 0) counts.plannedMinorWithoutLiveMinor += 1;
    }
  }

  for (const index of [...mismatchIndices].sort((left, right) => left - right).slice(0, 10)) {
    const y = Math.floor(index / projection.projectedNavigableTerrain.width);
    examples.push({
      x: index - y * projection.projectedNavigableTerrain.width,
      y,
      plannedMinor: maskValue(projection.plannedMinor.values[index]),
      projectedNavigableTerrain: maskValue(projection.projectedNavigableTerrain.values[index]),
      liveTerrainNavigableRiver: maskValue(readback.terrainNavigableRiver.values[index]),
      liveNavigableRiver: maskValue(readback.navigableRiver.values[index]),
      liveMinorRiver: maskValue(readback.minorRiver.values[index]),
      liveRiverType: readback.riverType.values[index] ?? null,
    });
  }

  const terrainFailureLinks = [
    ...(!terrainShapeMatches ? ["river-terrain.dimensions"] : []),
    ...(counts.projectedVsLiveTerrainMismatches > 0 ? ["river-terrain.mismatch"] : []),
  ];
  const terrainUnresolvedLinks = [
    ...(missingTerrainIndices.size > 0 ? ["river-terrain.live-readback"] : []),
  ];
  const terrain = parityClaim({
    passReason: "Projected navigable-river terrain matches live terrain readback.",
    failureReason: "Projected navigable-river terrain contradicts the live terrain readback.",
    unresolvedReason: "Live navigable-river terrain readback omitted one or more cells.",
    mixedReason:
      "Live navigable-river terrain readback omits cells and contradicts projection at other cells.",
    passLink: "river-terrain",
    failureLinks: terrainFailureLinks,
    unresolvedLinks: terrainUnresolvedLinks,
  });

  const metadataMismatchCount =
    counts.projectedVsLiveNavigableMismatches +
    counts.liveTerrainVsNavigableMismatches +
    counts.plannedMinorVsLiveMinorMismatches;
  const metadataFailureLinks = [
    ...(!navigableShapeMatches || !minorShapeMatches || !terrainMetadataShapeMatches
      ? ["river-metadata.dimensions"]
      : []),
    ...(metadataMismatchCount > 0 ? ["river-metadata.mismatch"] : []),
  ];
  const metadataUnresolvedLinks = [
    ...(projection.minorRiverStamping.status !== "supported"
      ? ["river-metadata.minor-stamping"]
      : []),
    ...(missingMetadataIndices.size > 0 ? ["river-metadata.live-readback"] : []),
  ];
  const metadata = parityClaim({
    passReason: "Live Civ7 navigable and minor-river metadata matches the Standard projection.",
    failureReason:
      "Live Civ7 river metadata contradicts the Standard projection or has incompatible dimensions.",
    unresolvedReason:
      projection.minorRiverStamping.status !== "supported"
        ? projection.minorRiverStamping.reason
        : "Live Civ7 river metadata readback omitted one or more cells.",
    mixedReason:
      "Known Civ7 river metadata contradicts projection while other metadata evidence remains unavailable.",
    passLink: "river-metadata",
    failureLinks: metadataFailureLinks,
    unresolvedLinks: metadataUnresolvedLinks,
  });

  const expectsNativeObjects =
    Math.max(
      counts.projectedNavigableTerrain,
      counts.liveTerrainNavigableRiver,
      counts.liveRiver,
      counts.liveNavigableRiver
    ) > 0;
  const nativeObjects: StandardParityComparison = !expectsNativeObjects
    ? {
        status: "not-applicable",
        reason: "The replay and live readback contain no river surface requiring native objects.",
        evidenceLinks: ["river-native-objects.not-applicable"],
      }
    : readback.nativeObjects.status === "unavailable"
      ? {
          status: "unresolved",
          reason: "Native Civ7 MapRivers object readback is unavailable.",
          evidenceLinks: ["river-native-objects.readback", ...readback.nativeObjects.blockedBy],
        }
      : readback.nativeObjects.count === 0
        ? {
            status: "fail",
            reason: "River terrain exists, but Civ7 reports zero native river objects.",
            evidenceLinks: ["river-native-objects.zero-rivers"],
          }
        : {
            status: "pass",
            reason: "Civ7 reports native river objects for the observed river surface.",
            evidenceLinks: ["river-native-objects"],
          };

  return {
    terrain,
    metadata,
    nativeObjects,
    counts,
    minorRiverStamping: projection.minorRiverStamping,
    nativeRiverObjectCount:
      readback.nativeObjects.status === "present" ? readback.nativeObjects.count : null,
    nativeRiverObjectSampleCount:
      readback.nativeObjects.status === "present" ? readback.nativeObjects.sampleCount : 0,
    examples,
  };
}

function compareStandardLakes(
  exact: StandardExactParityCapture,
  local: StandardLocalParityCapture
): StandardLakeParityComparison {
  const localCounters = local.hydrology.finalLakes;
  if (exact.lakes.status === "missing") {
    return {
      claim: {
        status: "unresolved",
        reason: "Exact-authorship evidence lacks final lake readback counters.",
        evidenceLinks: [exact.lakes.evidenceLink],
      },
      local: localCounters,
      mismatchedFields: [],
    };
  }
  const exactCounters = exact.lakes.value;
  const fields = [
    "acceptedLakeTileCount",
    "finalLakeWaterDriftCount",
    "finalLakeClassificationDriftCount",
  ] as const satisfies readonly (keyof StandardLakeFinalCounters)[];
  const mismatchedFields = fields.filter((field) => localCounters[field] !== exactCounters[field]);
  if (mismatchedFields.length > 0) {
    return {
      claim: {
        status: "fail",
        reason: "Exact and local final lake readback counters diverge.",
        evidenceLinks: mismatchedFields.map((field) => `lake-final.${field}`),
      },
      local: localCounters,
      exact: exactCounters,
      mismatchedFields,
    };
  }
  if (
    localCounters.finalLakeWaterDriftCount !== 0 ||
    localCounters.finalLakeClassificationDriftCount !== 0
  ) {
    return {
      claim: {
        status: "fail",
        reason: "Final lake counters agree, but accepted lakes drifted after placement.",
        evidenceLinks: ["lake-final.drift"],
      },
      local: localCounters,
      exact: exactCounters,
      mismatchedFields: [],
    };
  }
  return {
    claim: {
      status: "pass",
      reason: "Exact and local lake counters match with zero final lake drift.",
      evidenceLinks: ["lake-final"],
    },
    local: localCounters,
    exact: exactCounters,
    mismatchedFields: [],
  };
}

function compareStandardFloodplains(
  exact: StandardExactParityCapture,
  local: StandardLocalParityCapture,
  featureSurface: StandardSurfaceComparison
): StandardFloodplainParityComparison {
  const localCounters = floodplainCounters(local);
  if (exact.floodplains.status === "missing") {
    return {
      claim: {
        status: "unresolved",
        reason: "Exact-authorship evidence lacks floodplain feature-apply counters.",
        evidenceLinks: [exact.floodplains.evidenceLink],
      },
      local: localCounters,
      mismatchedFields: [],
    };
  }
  const exactCounters = exact.floodplains.value;
  const fields = [
    "attemptedFloodplainFeatureCount",
    "appliedFloodplainFeatureCount",
    "rejectedFloodplainFeatureCount",
  ] as const satisfies readonly (keyof StandardFloodplainApplyCounters)[];
  const mismatchedFields = fields.filter((field) => localCounters[field] !== exactCounters[field]);
  if (mismatchedFields.length > 0) {
    return {
      claim: {
        status: "fail",
        reason: "Exact and local floodplain feature-apply counters diverge.",
        evidenceLinks: mismatchedFields.map((field) => `floodplain-active.${field}`),
      },
      local: localCounters,
      exact: exactCounters,
      mismatchedFields,
    };
  }
  if (
    localCounters.attemptedFloodplainFeatureCount === 0 &&
    localCounters.appliedFloodplainFeatureCount === 0
  ) {
    return {
      claim: {
        status: "not-applicable",
        reason: "This replay contains no active floodplain projection signal.",
        evidenceLinks: ["floodplain-active.not-applicable"],
      },
      local: localCounters,
      exact: exactCounters,
      mismatchedFields: [],
    };
  }
  if (featureSurface.claim.status !== "pass") {
    return {
      claim: {
        status: featureSurface.claim.status === "unresolved" ? "unresolved" : "fail",
        reason: "Floodplain counters agree, but the final live feature surface does not close.",
        evidenceLinks: ["floodplain-active.feature-surface"],
      },
      local: localCounters,
      exact: exactCounters,
      mismatchedFields: [],
    };
  }
  return {
    claim: {
      status: "pass",
      reason: "Exact and local floodplain counters agree and the live feature surface matches.",
      evidenceLinks: ["floodplain-active"],
    },
    local: localCounters,
    exact: exactCounters,
    mismatchedFields: [],
  };
}

function floodplainCounters(local: StandardLocalParityCapture): StandardFloodplainApplyCounters {
  const measurement = local.hydrology.featureProjection;
  return {
    attemptedFloodplainFeatureCount: sumFloodplainCounts(measurement.attemptedByFeature),
    appliedFloodplainFeatureCount: sumFloodplainCounts(measurement.appliedByFeature),
    rejectedFloodplainFeatureCount: sumFloodplainCounts(
      measurement.rejectedCanHaveFeatureByFeature
    ),
  };
}

function sumFloodplainCounts(counts: Readonly<Record<string, number>>): number {
  let total = 0;
  for (const [feature, count] of Object.entries(counts)) {
    if (FLOODPLAIN_FEATURE_KEY_PATTERN.test(feature)) total += count;
  }
  return total;
}

function parityClaim(
  args: Readonly<{
    passReason: string;
    failureReason: string;
    unresolvedReason: string;
    mixedReason: string;
    passLink: string;
    failureLinks: ReadonlyArray<string>;
    unresolvedLinks: ReadonlyArray<string>;
  }>
): StandardParityComparison {
  const failureLinks = uniqueSorted(args.failureLinks);
  const unresolvedLinks = uniqueSorted(args.unresolvedLinks);
  if (unresolvedLinks.length > 0) {
    return {
      status: "unresolved",
      reason: failureLinks.length > 0 ? args.mixedReason : args.unresolvedReason,
      evidenceLinks: [...failureLinks, ...unresolvedLinks],
      failureLinks,
      unresolvedLinks,
    };
  }
  if (failureLinks.length > 0) {
    return {
      status: "fail",
      reason: args.failureReason,
      evidenceLinks: failureLinks,
    };
  }
  return {
    status: "pass",
    reason: args.passReason,
    evidenceLinks: [args.passLink],
  };
}

function uniqueSorted(values: ReadonlyArray<string>): ReadonlyArray<string> {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function gridsHaveSameShape(left: StandardParityGrid, right: StandardParityGrid): boolean {
  return (
    left.width === right.width &&
    left.height === right.height &&
    left.values.length === right.values.length
  );
}

function countOnes(grid: StandardParityGrid): number {
  let count = 0;
  for (const value of grid.values) {
    if (maskValue(value) === 1) count += 1;
  }
  return count;
}

function maskValue(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return value === 0 ? 0 : 1;
}
