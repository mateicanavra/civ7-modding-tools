import { stableStringify } from "@swooper/mapgen-core";
import {
  BOUNDED_JSON_LOG_PROTOCOL,
  BOUNDED_JSON_LOG_VERSION,
  decodeBoundedJsonLogSeries,
} from "@swooper/mapgen-core/lib/log";
import type { RunInGameDetailedExactAuthorshipEvidence } from "./evidenceTypes";

const BOUNDED_JSON_LOG_TOKEN = `[${BOUNDED_JSON_LOG_PROTOCOL}/v${BOUNDED_JSON_LOG_VERSION}]`;

/**
 * Reconstructs one correlated Swooper run from complete lifecycle and product log evidence.
 *
 * Bounded series must pass protocol, sequence, length, and digest admission before correlation;
 * historical one-line markers remain readable so existing run records do not lose provenance.
 */
export function parseSwooperMapgenLogEvidence(args: {
  text: string;
  logPath?: string;
  observedAt?: string;
  requestId: string;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: string;
  seed: number;
}): RunInGameDetailedExactAuthorshipEvidence["log"] | undefined {
  const lines = args.text.split(/\r?\n/);
  const completionLine = lastSwooperPayloadLine(lines, "[mapgen-complete]", args);
  const evidenceLine = completionLine
    ? lastSwooperPayloadLine(lines, "[mapgen-evidence]", args, {
        beforeIndex: completionLine.startIndex,
        matchingPayload: completionLine.payload,
      })
    : lastSwooperPayloadLine(lines, "[mapgen-evidence]", args);
  if (!evidenceLine || !completionLine) return undefined;
  const evidencePayload = evidenceLine.payload;
  const completionPayload = completionLine.payload;
  const evidenceDimensions = dimensionsFromPayload(evidencePayload);
  const completionDimensions = dimensionsFromPayload(completionPayload);
  if (
    !evidenceDimensions ||
    !completionDimensions ||
    evidenceDimensions.width !== completionDimensions.width ||
    evidenceDimensions.height !== completionDimensions.height
  ) {
    return undefined;
  }
  const resourcePlacement = parseResourcePlacementTelemetryBetween(
    lines,
    evidenceLine.endIndex,
    completionLine.startIndex
  );
  const naturalWonderPlan = parseNaturalWonderPlanTelemetryBetween(
    lines,
    evidenceLine.endIndex,
    completionLine.startIndex
  );
  const naturalWonderPlanInput = parseNaturalWonderPlanInputTelemetryBetween(
    lines,
    evidenceLine.endIndex,
    completionLine.startIndex
  );
  const naturalWonderPlacement = parseNaturalWonderPlacementTelemetryBetween(
    lines,
    evidenceLine.endIndex,
    completionLine.startIndex
  );
  const featureApply = parseFeatureApplyTelemetryBetween(
    lines,
    evidenceLine.endIndex,
    completionLine.startIndex
  );
  const placementParity = parsePlacementParityTelemetryBetween(
    lines,
    evidenceLine.endIndex,
    completionLine.startIndex
  );
  return {
    ...(args.logPath ? { logPath: args.logPath } : {}),
    ...(args.observedAt ? { observedAt: args.observedAt } : {}),
    requestId: args.requestId,
    canonicalConfigDigest: args.canonicalConfigDigest,
    launchEnvelopeDigest: args.launchEnvelopeDigest,
    seed: args.seed,
    ...(typeof evidencePayload.mapSize === "string" ? { mapSize: evidencePayload.mapSize } : {}),
    dimensions: evidenceDimensions,
    evidencePayload,
    completionPayload,
    ...(featureApply ? { featureApply } : {}),
    ...(placementParity ? { placementParity } : {}),
    ...(resourcePlacement ? { resourcePlacement } : {}),
    ...(naturalWonderPlan ? { naturalWonderPlan } : {}),
    ...(naturalWonderPlanInput ? { naturalWonderPlanInput } : {}),
    ...(naturalWonderPlacement ? { naturalWonderPlacement } : {}),
    matched: [
      "[mapgen-evidence]",
      args.requestId,
      args.canonicalConfigDigest,
      args.launchEnvelopeDigest,
      "[mapgen-complete]",
    ],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

type PayloadOccurrence = Readonly<{
  startIndex: number;
  endIndex: number;
  payload: Record<string, unknown>;
}>;

function payloadOccurrences(
  lines: readonly string[],
  marker: string
): readonly PayloadOccurrence[] {
  const bounded = decodeBoundedJsonLogSeries(lines, marker).flatMap((series) =>
    isRecord(series.payload)
      ? [
          {
            startIndex: series.startIndex,
            endIndex: series.endIndex,
            payload: series.payload,
          },
        ]
      : []
  );
  const legacy = lines.flatMap((line, index) => {
    if (!line.includes(marker) || line.includes(BOUNDED_JSON_LOG_TOKEN)) return [];
    const payload = parsePayloadAfterMarker(line, marker);
    return payload ? [{ startIndex: index, endIndex: index, payload }] : [];
  });
  return [...bounded, ...legacy].sort(
    (left, right) => left.startIndex - right.startIndex || left.endIndex - right.endIndex
  );
}

function payloadOccurrencesBetween(
  lines: readonly string[],
  marker: string,
  afterIndex: number,
  beforeIndex: number
): readonly PayloadOccurrence[] {
  return payloadOccurrences(lines, marker).filter(
    (occurrence) => occurrence.startIndex > afterIndex && occurrence.endIndex < beforeIndex
  );
}

function lastSwooperPayloadLine(
  lines: readonly string[],
  marker: "[mapgen-evidence]" | "[mapgen-complete]",
  expected: Pick<
    Parameters<typeof parseSwooperMapgenLogEvidence>[0],
    "requestId" | "canonicalConfigDigest" | "launchEnvelopeDigest" | "seed"
  >,
  options: { beforeIndex?: number; matchingPayload?: Record<string, unknown> } = {}
): PayloadOccurrence | null {
  const occurrences = payloadOccurrences(lines, marker);
  for (let index = occurrences.length - 1; index >= 0; index -= 1) {
    const occurrence = occurrences[index];
    if (!occurrence) continue;
    if (options.beforeIndex !== undefined && occurrence.endIndex >= options.beforeIndex) continue;
    const { payload } = occurrence;
    if (payload.requestId !== expected.requestId) continue;
    if (payload.canonicalConfigDigest !== expected.canonicalConfigDigest) continue;
    if (payload.launchEnvelopeDigest !== expected.launchEnvelopeDigest) continue;
    if (payload.seed !== expected.seed) continue;
    if (
      options.matchingPayload !== undefined &&
      stableStringify(payload) !== stableStringify(options.matchingPayload)
    ) {
      continue;
    }
    return occurrence;
  }
  return null;
}

function parseResourcePlacementTelemetryBetween(
  lines: readonly string[],
  evidenceIndex: number,
  completionIndex: number
):
  | NonNullable<NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["resourcePlacement"]>
  | undefined {
  for (const { payload } of payloadOccurrencesBetween(
    lines,
    "RESOURCE_PLACEMENT_V1",
    evidenceIndex,
    completionIndex
  )
    .slice()
    .reverse()) {
    return {
      marker: "RESOURCE_PLACEMENT_V1",
      payload,
      ...(resourcePlacementStats(payload) ?? {}),
      ...(resourcePlacementCoordinateEvidence(payload) ?? {}),
    };
  }
  return undefined;
}

function parsePlacementParityTelemetryBetween(
  lines: readonly string[],
  evidenceIndex: number,
  completionIndex: number
):
  | NonNullable<NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["placementParity"]>
  | undefined {
  for (const { payload } of payloadOccurrencesBetween(
    lines,
    "PLACEMENT_PARITY_V1",
    evidenceIndex,
    completionIndex
  )
    .slice()
    .reverse()) {
    const version = numberValue(payload.version);
    const waterDriftCount = numberValue(payload.waterDriftCount);
    const acceptedLakeTileCount = numberValue(payload.acceptedLakeTileCount);
    const finalLakeWaterDriftCount = numberValue(payload.finalLakeWaterDriftCount);
    const finalLakeClassificationDriftCount = numberValue(
      payload.finalLakeClassificationDriftCount
    );
    if (
      version !== 1 ||
      waterDriftCount === undefined ||
      acceptedLakeTileCount === undefined ||
      finalLakeWaterDriftCount === undefined ||
      finalLakeClassificationDriftCount === undefined
    ) {
      continue;
    }
    return {
      marker: "PLACEMENT_PARITY_V1",
      payload,
      version,
      waterDriftCount,
      acceptedLakeTileCount,
      finalLakeWaterDriftCount,
      finalLakeClassificationDriftCount,
    };
  }
  return undefined;
}

function parseFeatureApplyTelemetryBetween(
  lines: readonly string[],
  evidenceIndex: number,
  completionIndex: number
):
  | NonNullable<NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["featureApply"]>
  | undefined {
  for (const { payload } of payloadOccurrencesBetween(
    lines,
    "FEATURE_APPLY_V1",
    evidenceIndex,
    completionIndex
  )
    .slice()
    .reverse()) {
    return {
      marker: "FEATURE_APPLY_V1",
      payload,
      ...(featureApplyStats(payload) ?? {}),
    };
  }
  return undefined;
}

function parseNaturalWonderPlacementTelemetryBetween(
  lines: readonly string[],
  evidenceIndex: number,
  completionIndex: number
):
  | NonNullable<
      NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlacement"]
    >
  | undefined {
  for (const { payload } of payloadOccurrencesBetween(
    lines,
    "NATURAL_WONDER_PLACEMENT_V1",
    evidenceIndex,
    completionIndex
  )
    .slice()
    .reverse()) {
    return {
      marker: "NATURAL_WONDER_PLACEMENT_V1",
      payload,
      ...(naturalWonderPlacementStats(payload) ?? {}),
      ...(naturalWonderPlacementCoordinateEvidence(payload) ?? {}),
      ...(naturalWonderPlacementCoordinateRows(payload) ?? {}),
    };
  }
  return undefined;
}

function parseNaturalWonderPlanTelemetryBetween(
  lines: readonly string[],
  evidenceIndex: number,
  completionIndex: number
):
  | NonNullable<NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlan"]>
  | undefined {
  for (const { payload } of payloadOccurrencesBetween(
    lines,
    "NATURAL_WONDER_PLAN_V1",
    evidenceIndex,
    completionIndex
  )
    .slice()
    .reverse()) {
    return {
      marker: "NATURAL_WONDER_PLAN_V1",
      payload,
      ...(naturalWonderPlanStats(payload) ?? {}),
      ...(naturalWonderPlanCoordinateEvidence(payload) ?? {}),
      ...(naturalWonderPlanRows(payload) ?? {}),
    };
  }
  return undefined;
}

function parseNaturalWonderPlanInputTelemetryBetween(
  lines: readonly string[],
  evidenceIndex: number,
  completionIndex: number
):
  | NonNullable<
      NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlanInput"]
    >
  | undefined {
  for (const { payload } of payloadOccurrencesBetween(
    lines,
    "NATURAL_WONDER_PLAN_INPUT_V2",
    evidenceIndex,
    completionIndex
  )
    .slice()
    .reverse()) {
    return {
      marker: "NATURAL_WONDER_PLAN_INPUT_V2",
      payload,
    };
  }
  return undefined;
}

function featureApplyStats(payload: Record<string, unknown>):
  | {
      stats: NonNullable<
        NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["featureApply"]
      >["stats"];
    }
  | undefined {
  const attempted = numberValue(payload.attempted);
  const applied = numberValue(payload.applied);
  const rejected = numberValue(payload.rejected);
  const rejectedCanHaveFeature = numberValue(payload.rejectedCanHaveFeature);
  if (
    attempted === undefined ||
    applied === undefined ||
    rejected === undefined ||
    rejectedCanHaveFeature === undefined
  ) {
    return undefined;
  }
  return {
    stats: {
      attempted,
      applied,
      rejected,
      rejectedCanHaveFeature,
      ...countRecordField(payload, "attemptedByFeature"),
      ...countRecordField(payload, "appliedByFeature"),
      ...countRecordField(payload, "rejectedCanHaveFeatureByFeature"),
    },
  };
}

function naturalWonderPlanStats(payload: Record<string, unknown>):
  | {
      stats: NonNullable<
        NonNullable<
          NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlan"]
        >["stats"]
      >;
    }
  | undefined {
  const version = numberValue(payload.version);
  const wondersCount = numberValue(payload.wondersCount);
  const targetCount = numberValue(payload.targetCount);
  const plannedCount = numberValue(payload.plannedCount);
  if (
    version === undefined ||
    wondersCount === undefined ||
    targetCount === undefined ||
    plannedCount === undefined
  ) {
    return undefined;
  }
  return {
    stats: {
      version,
      wondersCount,
      targetCount,
      plannedCount,
    },
  };
}

function naturalWonderPlacementStats(payload: Record<string, unknown>):
  | {
      stats: NonNullable<
        NonNullable<
          NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlacement"]
        >["stats"]
      >;
    }
  | undefined {
  const version = numberValue(payload.version);
  const plannedCount = numberValue(payload.plannedCount);
  const targetCount = numberValue(payload.targetCount);
  const placedCount = numberValue(payload.placedCount);
  const terrainAdjustedCount = numberValue(payload.terrainAdjustedCount);
  const skippedOutOfBoundsCount = numberValue(payload.skippedOutOfBoundsCount);
  const rejectedCount = numberValue(payload.rejectedCount);
  const shortfallCount = numberValue(payload.shortfallCount);
  const rejectionExamples = Array.isArray(payload.rejectionExamples)
    ? payload.rejectionExamples
        .filter((entry): entry is string => typeof entry === "string")
        .slice(0, 8)
    : undefined;
  if (
    version === undefined ||
    plannedCount === undefined ||
    targetCount === undefined ||
    placedCount === undefined ||
    terrainAdjustedCount === undefined ||
    skippedOutOfBoundsCount === undefined ||
    rejectedCount === undefined ||
    shortfallCount === undefined
  ) {
    return undefined;
  }
  const rejectionExampleCount = numberValue(payload.rejectionExampleCount);
  return {
    stats: {
      version,
      plannedCount,
      targetCount,
      placedCount,
      terrainAdjustedCount,
      skippedOutOfBoundsCount,
      rejectedCount,
      shortfallCount,
      ...(rejectionExampleCount === undefined ? {} : { rejectionExampleCount }),
      ...(rejectionExamples === undefined ? {} : { rejectionExamples }),
    },
  };
}

function naturalWonderPlanCoordinateEvidence(payload: Record<string, unknown>):
  | {
      coordinateEvidence: NonNullable<
        NonNullable<
          NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlan"]
        >["coordinateEvidence"]
      >;
    }
  | undefined {
  const coordinateEvidence = isRecord(payload.coordinateEvidence)
    ? payload.coordinateEvidence
    : undefined;
  if (!coordinateEvidence) return undefined;
  const version = numberValue(coordinateEvidence.version);
  const plannedCount = numberValue(coordinateEvidence.plannedCount);
  const plannedHash32 = hash32Value(coordinateEvidence.plannedHash32);
  if (version === undefined || plannedCount === undefined || plannedHash32 === undefined) {
    return undefined;
  }
  return {
    coordinateEvidence: {
      version,
      planned: { count: plannedCount, hash32: plannedHash32 },
    },
  };
}

function naturalWonderPlanRows(payload: Record<string, unknown>):
  | {
      planRows: NonNullable<
        NonNullable<
          NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlan"]
        >["planRows"]
      >;
    }
  | undefined {
  if (!Array.isArray(payload.planRows)) return undefined;
  const planRows = payload.planRows
    .flatMap((row) => {
      if (!Array.isArray(row)) return [];
      const status = row[0] === "p" ? "planned" : undefined;
      const plotIndex = numberValue(row[1]);
      const x = numberValue(row[2]);
      const y = numberValue(row[3]);
      const featureType = numberValue(row[4]);
      const direction = numberValue(row[5]);
      const elevation = row[6] === null ? undefined : numberValue(row[6]);
      const priorityPpm = row[7] === null ? undefined : numberValue(row[7]);
      if (
        status === undefined ||
        plotIndex === undefined ||
        x === undefined ||
        y === undefined ||
        featureType === undefined ||
        direction === undefined
      ) {
        return [];
      }
      return [
        {
          plotIndex,
          x,
          y,
          featureType,
          direction,
          ...(elevation === undefined ? {} : { elevation }),
          ...(priorityPpm === undefined ? {} : { priorityPpm }),
        },
      ];
    })
    .slice(0, 16);
  return planRows.length === 0 ? undefined : { planRows };
}

function resourcePlacementStats(payload: Record<string, unknown>):
  | {
      stats: NonNullable<
        NonNullable<
          NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["resourcePlacement"]
        >["stats"]
      >;
    }
  | undefined {
  const version = numberValue(payload.version);
  const plannedCount = numberValue(payload.plannedCount);
  const placedCount = numberValue(payload.placedCount);
  const rejectedCount = numberValue(payload.rejectedCount);
  const mismatchCount = numberValue(payload.mismatchCount);
  const rejectionExamples = Array.isArray(payload.rejectionExamples)
    ? payload.rejectionExamples
        .filter((entry): entry is string => typeof entry === "string")
        .slice(0, 8)
    : undefined;
  if (
    version === undefined ||
    plannedCount === undefined ||
    placedCount === undefined ||
    rejectedCount === undefined ||
    mismatchCount === undefined
  ) {
    return undefined;
  }
  const rejectionExampleCount = numberValue(payload.rejectionExampleCount);
  const rejectionRows = resourcePlacementRejectionRows(payload);
  return {
    stats: {
      version,
      plannedCount,
      placedCount,
      rejectedCount,
      mismatchCount,
      ...(rejectionExampleCount === undefined ? {} : { rejectionExampleCount }),
      ...(rejectionExamples === undefined ? {} : { rejectionExamples }),
      ...(rejectionRows.length === 0 ? {} : { rejectionRows }),
    },
  };
}

function resourcePlacementRejectionRows(
  payload: Record<string, unknown>
): NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["resourcePlacement"]
    >["stats"]
  >["rejectionRows"]
> {
  if (!Array.isArray(payload.rejectionRows)) return [];
  return payload.rejectionRows
    .flatMap((value) => {
      if (!isRecord(value)) return [];
      const status: "rejected" | "mismatch" | undefined =
        value.status === "rejected" || value.status === "mismatch" ? value.status : undefined;
      const resourceType = numberValue(value.resourceType);
      const plotIndex = numberValue(value.plotIndex);
      const x = numberValue(value.x);
      const y = numberValue(value.y);
      const preferredValue = Object.hasOwn(value, "preferredResourceType")
        ? value.preferredResourceType
        : value.preferred;
      const preferredResourceType = preferredValue === null ? null : numberValue(preferredValue);
      if (
        status === undefined ||
        resourceType === undefined ||
        plotIndex === undefined ||
        x === undefined ||
        y === undefined
      ) {
        return [];
      }
      const observedResourceType = numberValue(value.observedResourceType);
      return [
        {
          status,
          resourceType,
          ...(stringValue(value.resource) === undefined
            ? {}
            : { resource: stringValue(value.resource) }),
          plotIndex,
          x,
          y,
          ...(stringValue(value.reason) === undefined ? {} : { reason: stringValue(value.reason) }),
          ...(observedResourceType === undefined ? {} : { observedResourceType }),
          ...(stringValue(value.observedResource) === undefined
            ? {}
            : { observedResource: stringValue(value.observedResource) }),
          ...(stringValue(value.assignmentPhase ?? value.phase) === undefined
            ? {}
            : { assignmentPhase: stringValue(value.assignmentPhase ?? value.phase) }),
          ...(numberValue(value.assignmentOrder ?? value.order) === undefined
            ? {}
            : { assignmentOrder: numberValue(value.assignmentOrder ?? value.order) }),
          ...(numberValue(value.initialResourceType ?? value.initial) === undefined
            ? {}
            : { initialResourceType: numberValue(value.initialResourceType ?? value.initial) }),
          ...(preferredResourceType === undefined ? {} : { preferredResourceType }),
          ...(numberValue(value.perTypeCountBefore ?? value.countBefore) === undefined
            ? {}
            : { perTypeCountBefore: numberValue(value.perTypeCountBefore ?? value.countBefore) }),
          ...(numberValue(value.legalPlotCountForResource ?? value.legalPlots) === undefined
            ? {}
            : {
                legalPlotCountForResource: numberValue(
                  value.legalPlotCountForResource ?? value.legalPlots
                ),
              }),
          ...(numberValue(value.targetMinPerType ?? value.targetMin) === undefined
            ? {}
            : { targetMinPerType: numberValue(value.targetMinPerType ?? value.targetMin) }),
        },
      ];
    })
    .slice(0, 8);
}

function naturalWonderPlacementCoordinateEvidence(payload: Record<string, unknown>):
  | {
      coordinateEvidence: NonNullable<
        NonNullable<
          NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlacement"]
        >["coordinateEvidence"]
      >;
    }
  | undefined {
  const coordinateEvidence = isRecord(payload.coordinateEvidence)
    ? payload.coordinateEvidence
    : undefined;
  if (!coordinateEvidence) return undefined;
  const version = numberValue(coordinateEvidence.version);
  const placedCount = numberValue(coordinateEvidence.placedCount);
  const placedHash32 = hash32Value(coordinateEvidence.placedHash32);
  if (version === undefined || placedCount === undefined || placedHash32 === undefined)
    return undefined;
  const rejectedCount = numberValue(coordinateEvidence.rejectedCount);
  const rejectedHash32 = hash32Value(coordinateEvidence.rejectedHash32);
  return {
    coordinateEvidence: {
      version,
      placed: { count: placedCount, hash32: placedHash32 },
      ...(rejectedCount === undefined || rejectedHash32 === undefined
        ? {}
        : { rejected: { count: rejectedCount, hash32: rejectedHash32 } }),
    },
  };
}

function naturalWonderPlacementCoordinateRows(payload: Record<string, unknown>):
  | {
      coordinateRows: NonNullable<
        NonNullable<
          NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlacement"]
        >["coordinateRows"]
      >;
    }
  | undefined {
  const coordinateRows = [
    ...naturalWonderVerboseCoordinateRows(payload.coordinateRows),
    ...naturalWonderCompactRejectedRows(payload.rejectedRows),
  ].slice(0, 16);
  return coordinateRows.length === 0 ? undefined : { coordinateRows };
}

function naturalWonderVerboseCoordinateRows(
  value: unknown
): NonNullable<
  NonNullable<
    NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlacement"]
  >["coordinateRows"]
> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((value) => {
    if (!isRecord(value)) return [];
    const status: "placed" | "rejected" | undefined =
      value.status === "placed" || value.status === "rejected" ? value.status : undefined;
    const featureType = numberValue(value.featureType);
    const plotIndex = numberValue(value.plotIndex);
    const x = numberValue(value.x);
    const y = numberValue(value.y);
    const direction = numberValue(value.direction);
    if (
      status === undefined ||
      featureType === undefined ||
      plotIndex === undefined ||
      x === undefined ||
      y === undefined ||
      direction === undefined ||
      stringValue(value.reason) === undefined
    ) {
      return [];
    }
    const elevation = numberValue(value.elevation);
    const observedFeatureType = numberValue(value.observedFeatureType);
    const observedPlotIndex = numberValue(value.observedPlotIndex);
    const expectedFootprintReadback = naturalWonderFootprintReadbackRows(
      value.expectedFootprintReadback
    );
    const expectedFootprintReadbackStatus = naturalWonderFootprintReadbackStatus(
      value.expectedFootprintReadbackStatus
    );
    return [
      {
        status,
        featureType,
        plotIndex,
        x,
        y,
        direction,
        ...(elevation === undefined ? {} : { elevation }),
        reason: stringValue(value.reason) as string,
        ...(observedFeatureType === undefined ? {} : { observedFeatureType }),
        ...(observedPlotIndex === undefined ? {} : { observedPlotIndex }),
        ...(expectedFootprintReadback.length === 0 ? {} : { expectedFootprintReadback }),
        ...(expectedFootprintReadbackStatus === undefined
          ? {}
          : { expectedFootprintReadbackStatus }),
      },
    ];
  });
}

function naturalWonderCompactRejectedRows(
  value: unknown
): NonNullable<
  NonNullable<
    NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["naturalWonderPlacement"]
  >["coordinateRows"]
> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!Array.isArray(row)) return [];
    const status = row[0] === "r" ? "rejected" : undefined;
    const plotIndex = numberValue(row[1]);
    const x = numberValue(row[2]);
    const y = numberValue(row[3]);
    const featureType = numberValue(row[4]);
    const direction = numberValue(row[5]);
    const elevation = row[6] === null ? undefined : numberValue(row[6]);
    const reason = stringValue(row[7]);
    const observedFeatureType = numberValue(row[8]);
    const observedPlotIndex = numberValue(row[9]);
    const expectedFootprintReadbackStatus = naturalWonderFootprintReadbackStatus(row[10]);
    if (
      status === undefined ||
      plotIndex === undefined ||
      x === undefined ||
      y === undefined ||
      featureType === undefined ||
      direction === undefined ||
      reason === undefined
    ) {
      return [];
    }
    return [
      {
        status,
        featureType,
        plotIndex,
        x,
        y,
        direction,
        ...(elevation === undefined ? {} : { elevation }),
        reason,
        ...(observedFeatureType === undefined ? {} : { observedFeatureType }),
        ...(observedPlotIndex === undefined ? {} : { observedPlotIndex }),
        ...(expectedFootprintReadbackStatus === undefined
          ? {}
          : { expectedFootprintReadbackStatus }),
      },
    ];
  });
}

function naturalWonderFootprintReadbackRows(value: unknown): ReadonlyArray<{
  plotIndex: number;
  observedFeatureType: number;
}> {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      if (!isRecord(entry)) return [];
      const plotIndex = numberValue(entry.plotIndex);
      const observedFeatureType = numberValue(entry.observedFeatureType);
      if (plotIndex === undefined || observedFeatureType === undefined) return [];
      return [{ plotIndex, observedFeatureType }];
    })
    .slice(0, 8);
}

function naturalWonderFootprintReadbackStatus(
  value: unknown
): "empty-expected-footprint" | "partial-expected-footprint" | undefined {
  return value === "empty-expected-footprint" || value === "partial-expected-footprint"
    ? value
    : undefined;
}

function resourcePlacementCoordinateEvidence(payload: Record<string, unknown>):
  | {
      coordinateEvidence: NonNullable<
        NonNullable<
          NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]>["resourcePlacement"]
        >["coordinateEvidence"]
      >;
    }
  | undefined {
  const coordinateEvidence = isRecord(payload.coordinateEvidence)
    ? payload.coordinateEvidence
    : undefined;
  if (!coordinateEvidence) return undefined;
  const version = numberValue(coordinateEvidence.version);
  const placedCount = numberValue(coordinateEvidence.placedCount);
  const placedHash32 = hash32Value(coordinateEvidence.placedHash32);
  if (version === undefined || placedCount === undefined || placedHash32 === undefined)
    return undefined;
  const rejectedCount = numberValue(coordinateEvidence.rejectedCount);
  const rejectedHash32 = hash32Value(coordinateEvidence.rejectedHash32);
  const mismatchCount = numberValue(coordinateEvidence.mismatchCount);
  const mismatchHash32 = hash32Value(coordinateEvidence.mismatchHash32);
  return {
    coordinateEvidence: {
      version,
      placed: { count: placedCount, hash32: placedHash32 },
      ...(rejectedCount === undefined || rejectedHash32 === undefined
        ? {}
        : { rejected: { count: rejectedCount, hash32: rejectedHash32 } }),
      ...(mismatchCount === undefined || mismatchHash32 === undefined
        ? {}
        : { mismatch: { count: mismatchCount, hash32: mismatchHash32 } }),
    },
  };
}

function countRecordField(
  payload: Record<string, unknown>,
  field: "attemptedByFeature" | "appliedByFeature" | "rejectedCanHaveFeatureByFeature"
): Partial<Record<typeof field, Readonly<Record<string, number>>>> {
  const source = isRecord(payload[field]) ? payload[field] : undefined;
  if (!source) return {};
  const entries = Object.entries(source)
    .map(([key, value]) => [key, numberValue(value)] as const)
    .filter((entry): entry is readonly [string, number] => entry[1] !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return entries.length === 0 ? {} : { [field]: Object.fromEntries(entries) };
}

function parsePayloadAfterMarker(line: string, marker: string): Record<string, unknown> | null {
  const markerIndex = line.indexOf(marker);
  if (markerIndex < 0) return null;
  const jsonStart = line.indexOf("{", markerIndex + marker.length);
  if (jsonStart < 0) return null;
  try {
    const payload = JSON.parse(line.slice(jsonStart)) as unknown;
    return isRecord(payload) ? payload : null;
  } catch {
    return null;
  }
}

function hash32Value(value: unknown): string | undefined {
  return typeof value === "string" && /^[0-9a-f]{8}$/.test(value) ? value : undefined;
}

function dimensionsFromPayload(
  payload: Record<string, unknown>
): { width: number; height: number } | null {
  if (!isRecord(payload.dimensions)) return null;
  const { width, height } = payload.dimensions;
  return typeof width === "number" && typeof height === "number" ? { width, height } : null;
}
