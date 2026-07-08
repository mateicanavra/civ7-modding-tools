import {
  materializationFailed,
  proofFailed,
  type RunInGameDeployment,
  type RunInGameLogEvidence,
  type RunInGamePreparedRequest,
  type RunInGameRuntimeObservation,
  type RunInGameSetupPrepared,
  type StudioBoundedDiagnostics,
} from "@civ7/studio-server";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import type { Civ7LiveSnapshotOutput, Civ7LiveStatusOutput } from "@civ7/studio-contract";
import type { StudioContract } from "@civ7/studio-server/contract";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { buildLiveRuntimeStatusState } from "../../features/liveRuntime/model";

type RuntimeMarker = Readonly<{
  requestId?: string;
  runArtifactId?: string;
  generationManifestDigest?: string;
  runCorrelation?: Record<string, unknown>;
  dimensions?: Readonly<{ width: number; height: number }>;
  payload: unknown;
}>;

type Dimensions = Readonly<{ width: number; height: number }>;

export async function observeRunInGameRuntimeThroughStudioRpc(
  args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    deployment: RunInGameDeployment;
    setup: RunInGameSetupPrepared;
    log: RunInGameLogEvidence;
    selfRpcUrl?: string;
    signal?: AbortSignal;
  }>
): Promise<RunInGameRuntimeObservation> {
  const materialization = args.deployment.materialization;
  const runArtifactId = runArtifactIdFromMaterialization(materialization?.runArtifactId);
  const mapScript = mapScriptFromMaterialization(materialization?.mapScript);
  const correlation = {
    requestId: args.requestId,
    runArtifactId,
    launchSourceDigest: args.prepared.launchSourceDigest,
    launchEnvelopeDigest: args.prepared.launchEnvelopeDigest,
    generationManifestDigest: materialization?.generationManifestDigest ?? "",
  };
  const marker = runtimeMarkerFromLogProof(args.log.logProof);
  const markerMismatch = runCorrelationMismatches(marker?.runCorrelation, correlation);
  if (!marker || markerMismatch.length > 0) {
    throw proofFailed({
      message: "Run in Game runtime marker did not match the generated request",
      reason: marker ? "exact-authorship-mismatch" : "log-proof-missing",
      diagnostics: boundedDiagnostics({
        code: marker ? "run-in-game-runtime-marker-mismatch" : "run-in-game-runtime-marker-missing",
        requestId: args.requestId,
        mismatches: markerMismatch,
        marker,
        correlation,
        materialization,
      }),
    });
  }
  const dimensions = expectedDimensionsForMapSize(args.prepared.request.mapSize);
  const markerDimensionProblems = runtimeMarkerDimensionProblems(marker.dimensions, dimensions);
  if (markerDimensionProblems.length > 0) {
    throw proofFailed({
      message: "Run in Game runtime marker dimensions did not match the requested map size",
      reason: "exact-authorship-mismatch",
      diagnostics: boundedDiagnostics({
        code: "run-in-game-runtime-marker-dimensions-mismatch",
        requestId: args.requestId,
        problems: markerDimensionProblems,
        mapSize: args.prepared.request.mapSize,
        markerDimensions: marker.dimensions,
        expectedDimensions: dimensions,
        materialization,
      }),
    });
  }
  const rowProof = requiredSetupReadbackValue({
    requestId: args.requestId,
    materialization,
    key: "rowProof",
    value: args.setup.rowProof,
  });
  const rowVisibility = requiredSetupReadbackValue({
    requestId: args.requestId,
    materialization,
    key: "rowVisibility",
    value: args.setup.rowVisibility,
  });
  const baseUrl = args.selfRpcUrl;
  if (!baseUrl) {
    throw proofFailed({
      message: "Run in Game loaded-game readback endpoint is unavailable",
      reason: "timeout-uncertain",
      diagnostics: boundedDiagnostics({
        code: "run-in-game-live-endpoint-unavailable",
        requestId: args.requestId,
        materialization,
      }),
      recoveryActions: ["retry-run", "copy-diagnostics"],
    });
  }
  const liveClient: ContractRouterClient<StudioContract> = createORPCClient(
    new RPCLink({ url: `${baseUrl.replace(/\/$/, "")}/rpc` })
  );
  const liveStatus: Civ7LiveStatusOutput = await liveClient.civ7.live
    .status({}, { signal: args.signal })
    .catch((err: unknown) => {
      throw proofFailed({
        message: "Run in Game live status readback failed",
        reason: "timeout-uncertain",
        diagnostics: boundedDiagnostics({
          code: "run-in-game-live-status-unavailable",
          requestId: args.requestId,
          cause: diagnosticString(err),
          materialization,
        }),
        recoveryActions: ["retry-status", "retry-run", "copy-diagnostics"],
      });
    });
  const liveSnapshot: Civ7LiveSnapshotOutput = await liveClient.civ7.live
    .snapshot(
      {
        width: dimensions.width,
        height: dimensions.height,
        maxPlots: 512,
      },
      { signal: args.signal }
    )
    .catch((err: unknown) => {
      throw proofFailed({
        message: "Run in Game live snapshot readback failed",
        reason: "timeout-uncertain",
        diagnostics: boundedDiagnostics({
          code: "run-in-game-live-snapshot-unavailable",
          requestId: args.requestId,
          cause: diagnosticString(err),
          materialization,
        }),
        recoveryActions: ["retry-status", "retry-run", "copy-diagnostics"],
      });
    });
  const loadedGameProblems = loadedGameReadbackProblems({
    liveStatus,
    liveSnapshot,
    dimensions,
  });
  if (loadedGameProblems.length > 0) {
    throw proofFailed({
      message: "Run in Game loaded-game readback did not prove the generated request",
      reason: "exact-authorship-mismatch",
      diagnostics: boundedDiagnostics({
        code: "run-in-game-loaded-readback-mismatch",
        requestId: args.requestId,
        problems: loadedGameProblems,
        liveStatus,
        liveSnapshot,
        dimensions,
        materialization,
      }),
      recoveryActions: ["retry-status", "retry-run", "copy-diagnostics"],
    });
  }
  return {
    requestId: args.requestId,
    correlation,
    deploymentEvidence: {
      runDeployment: args.deployment.runDeployment,
      deployedSnapshot: args.deployment.deployedSnapshot,
    },
    scriptingLog: {
      requestId: args.requestId,
      correlation,
      ...scriptingLogObservationFields(args.log),
      proof: args.log.logProof,
    },
    setupRow: {
      requestId: args.requestId,
      correlation,
      state: "matched",
      mapScript,
      runArtifactId,
      deployedModId: args.deployment.runDeployment.deployedModId,
      rowProof,
      rowVisibility,
    },
    loadedGame: {
      requestId: args.requestId,
      correlation,
      marker,
      liveStatus,
      liveSnapshot,
      ...liveRuntimeIdentityFromStatus(liveStatus),
      dimensions,
      deployedModId: args.deployment.runDeployment.deployedModId,
      deployedSnapshotDigest: args.deployment.deployedSnapshot.digest,
    },
  };
}

export function liveRuntimeStatusFromObservation(
  value: Civ7LiveStatusOutput
): ReturnType<typeof buildLiveRuntimeStatusState> | undefined {
  return buildLiveRuntimeStatusState({
    body: liveRuntimeStatusBody(value),
    observedAtFallback: new Date().toISOString(),
    bindingStatus: "proven-studio-run",
  });
}

function liveRuntimeStatusBody(
  value: Civ7LiveStatusOutput
): Parameters<typeof buildLiveRuntimeStatusState>[0]["body"] {
  const status = asRecord(value.status);
  const readiness = stringValue(status?.readiness);
  const mapSummary = liveRuntimeMapSummaryBody(value.mapSummary);
  const autoplay = liveRuntimeAutoplayBody(value.autoplay);
  return {
    ok: value.ok,
    observedAt: value.observedAt,
    ...(readiness === undefined ? {} : { status: { readiness } }),
    ...(mapSummary === undefined ? {} : { mapSummary }),
    ...(autoplay === undefined ? {} : { autoplay }),
  };
}

function liveRuntimeMapSummaryBody(
  value: Civ7LiveStatusOutput["mapSummary"]
): Parameters<typeof buildLiveRuntimeStatusState>[0]["body"]["mapSummary"] {
  if (hasEmbeddedError(value)) return undefined;
  const mapSummary = asRecord(value);
  const map = recordValue(mapSummary, "map");
  const game = recordValue(mapSummary, "game");
  const mapBody = {
    ...optionalProbe("randomSeed", recordValue(map, "randomSeed")),
    ...optionalProbe("width", recordValue(map, "width")),
    ...optionalProbe("height", recordValue(map, "height")),
  };
  const gameBody = {
    ...optionalProbe("turn", recordValue(game, "turn")),
    ...optionalProbe("hash", recordValue(game, "hash")),
  };
  return {
    ...(Object.keys(mapBody).length === 0 ? {} : { map: mapBody }),
    ...(Object.keys(gameBody).length === 0 ? {} : { game: gameBody }),
  };
}

function liveRuntimeAutoplayBody(
  value: Civ7LiveStatusOutput["autoplay"]
): Parameters<typeof buildLiveRuntimeStatusState>[0]["body"]["autoplay"] {
  if (hasEmbeddedError(value)) return undefined;
  const autoplay = recordValue(value, "autoplay");
  const isActive = booleanValue(autoplay?.isActive);
  const isPaused = booleanValue(autoplay?.isPaused);
  if (isActive === undefined && isPaused === undefined) return undefined;
  return {
    autoplay: {
      ...(isActive === undefined ? {} : { isActive }),
      ...(isPaused === undefined ? {} : { isPaused }),
    },
  };
}

function optionalProbe(
  key: "randomSeed" | "width" | "height" | "turn" | "hash",
  value: Record<string, unknown> | undefined
): Partial<
  Record<"randomSeed" | "width" | "height" | "turn" | "hash", { ok: true; value: number }>
> {
  if (value?.ok !== true) return {};
  const number = numberValue(value.value);
  return number === undefined ? {} : { [key]: { ok: true, value: number } };
}

function runtimeMarkerFromLogProof(value: unknown): RuntimeMarker | undefined {
  const payload = recordValue(value, "proofPayload");
  if (!payload) return undefined;
  const runCorrelation = recordValue(payload, "runCorrelation");
  const dimensions = dimensionsFromValue(payload.dimensions);
  return {
    payload,
    ...(stringValue(payload.requestId) === undefined
      ? {}
      : { requestId: stringValue(payload.requestId) }),
    ...(stringValue(payload.runArtifactId) === undefined
      ? {}
      : { runArtifactId: stringValue(payload.runArtifactId) }),
    ...(stringValue(payload.generationManifestDigest) === undefined
      ? {}
      : { generationManifestDigest: stringValue(payload.generationManifestDigest) }),
    ...(runCorrelation === undefined ? {} : { runCorrelation }),
    ...(dimensions === undefined ? {} : { dimensions }),
  };
}

function runCorrelationMismatches(
  observed: Record<string, unknown> | undefined,
  expected: Readonly<{
    requestId: string;
    runArtifactId: string;
    launchSourceDigest: unknown;
    launchEnvelopeDigest: string;
    generationManifestDigest: string;
  }>
): string[] {
  if (!observed) return ["runCorrelation"];
  const mismatches: string[] = [];
  if (observed.requestId !== expected.requestId) mismatches.push("requestId");
  if (observed.runArtifactId !== expected.runArtifactId) mismatches.push("runArtifactId");
  if (observed.launchEnvelopeDigest !== expected.launchEnvelopeDigest) {
    mismatches.push("launchEnvelopeDigest");
  }
  if (observed.generationManifestDigest !== expected.generationManifestDigest) {
    mismatches.push("generationManifestDigest");
  }
  if (stableJson(observed.launchSourceDigest) !== stableJson(expected.launchSourceDigest)) {
    mismatches.push("launchSourceDigest");
  }
  return mismatches;
}

function runArtifactIdFromMaterialization(value: string | undefined): `run-${string}` {
  if (value?.startsWith("run-")) return value as `run-${string}`;
  throw materializationFailed({
    message: "Run in Game materialization has an invalid run artifact id",
    diagnostics: boundedDiagnostics({
      code: "run-in-game-run-artifact-id-invalid",
      runArtifactId: value,
    }),
  });
}

function mapScriptFromMaterialization(value: string | undefined): string {
  if (value) return value;
  throw materializationFailed({
    message: "Run in Game materialization is missing the map script id",
    diagnostics: boundedDiagnostics({
      code: "run-in-game-map-script-missing",
    }),
  });
}

function expectedDimensionsForMapSize(mapSize: string): Dimensions {
  const preset = getCiv7StandardMapSizePreset(mapSize);
  if (preset) return preset.dimensions;
  throw proofFailed({
    message: "Run in Game requested map size cannot be resolved for runtime observation",
    reason: "exact-authorship-mismatch",
    diagnostics: boundedDiagnostics({
      code: "run-in-game-runtime-map-size-unresolved",
      mapSize,
    }),
  });
}

function runtimeMarkerDimensionProblems(
  markerDimensions: Dimensions | undefined,
  expected: Dimensions
): string[] {
  if (!markerDimensions) return ["runtime-marker-dimensions-missing"];
  const problems: string[] = [];
  if (markerDimensions.width !== expected.width) problems.push("runtime-marker-width-mismatch");
  if (markerDimensions.height !== expected.height) problems.push("runtime-marker-height-mismatch");
  return problems;
}

function requiredSetupReadbackValue(
  args: Readonly<{
    requestId: string;
    materialization: RunInGameDeployment["materialization"];
    key: "rowProof" | "rowVisibility";
    value: unknown;
  }>
): unknown {
  if (args.value !== undefined) return args.value;
  throw proofFailed({
    message: "Run in Game setup row readback is missing",
    reason: "exact-authorship-mismatch",
    diagnostics: boundedDiagnostics({
      code: "run-in-game-setup-row-readback-missing",
      requestId: args.requestId,
      missing: args.key,
      materialization: args.materialization,
    }),
    recoveryActions: ["retry-run", "copy-diagnostics"],
  });
}

function loadedGameReadbackProblems(
  args: Readonly<{
    liveStatus: Civ7LiveStatusOutput;
    liveSnapshot: Civ7LiveSnapshotOutput;
    dimensions: Dimensions;
  }>
): string[] {
  const problems: string[] = [];
  const status = args.liveStatus;
  if (status.ok !== true || status.playable !== true) {
    problems.push("live-status-not-loaded");
  }
  if (hasEmbeddedError(recordValue(status, "status"))) problems.push("live-status-field-error");
  if (hasEmbeddedError(recordValue(status, "appUi"))) problems.push("live-app-ui-field-error");
  if (hasEmbeddedError(recordValue(status, "mapSummary"))) {
    problems.push("live-map-summary-field-error");
  }
  if (!appUiReadbackInGame(status.appUi)) problems.push("live-app-ui-not-in-game");

  const snapshot = args.liveSnapshot;
  const grid = recordValue(snapshot, "grid");
  const plotCount = numberValue(grid?.plotCount) ?? probeNumber(recordValue(grid, "plotCount"));
  const plots = Array.isArray(grid?.plots) ? grid.plots : undefined;
  if ((plotCount === undefined || plotCount <= 0) && (!plots || plots.length === 0)) {
    problems.push("live-snapshot-empty-grid");
  }
  const map = recordValue(grid, "map");
  const width = numberValue(grid?.width) ?? probeNumber(recordValue(map, "width"));
  const height = numberValue(grid?.height) ?? probeNumber(recordValue(map, "height"));
  if (width === undefined || height === undefined) {
    problems.push("live-snapshot-dimensions-missing");
  } else if (width !== args.dimensions.width || height !== args.dimensions.height) {
    problems.push("live-snapshot-dimensions-mismatch");
  }
  return problems;
}

function appUiReadbackInGame(value: unknown): boolean {
  const appUi = asRecord(value);
  const snapshot = recordValue(appUi, "snapshot");
  const ui = recordValue(snapshot, "ui");
  const inGame = recordValue(ui, "inGame");
  return inGame?.ok === true && inGame.value === true;
}

function scriptingLogObservationFields(log: RunInGameLogEvidence): {
  logPath?: string;
  observedAt?: string;
  startOffset?: number;
  matchedMarkers: readonly string[];
} {
  const markerProof = asRecord(log.logMarkerProof);
  return {
    ...(stringValue(markerProof?.logPath) === undefined
      ? {}
      : { logPath: stringValue(markerProof?.logPath) }),
    ...(stringValue(markerProof?.observedAt) === undefined
      ? {}
      : { observedAt: stringValue(markerProof?.observedAt) }),
    ...(numberValue(markerProof?.startOffset) === undefined
      ? {}
      : { startOffset: numberValue(markerProof?.startOffset) }),
    matchedMarkers: Array.isArray(markerProof?.matched)
      ? markerProof.matched.filter((entry): entry is string => typeof entry === "string")
      : [],
  };
}

function liveRuntimeIdentityFromStatus(value: Civ7LiveStatusOutput): {
  snapshotId?: string;
  snapshotHash?: string;
} {
  const state = liveRuntimeStatusFromObservation(value);
  return {
    ...(state?.snapshotId === undefined ? {} : { snapshotId: state.snapshotId }),
    ...(state?.snapshotHash === undefined ? {} : { snapshotHash: state.snapshotHash }),
  };
}

function hasEmbeddedError(value: unknown): boolean {
  return typeof asRecord(value)?.error === "string";
}

function dimensionsFromValue(value: unknown): { width: number; height: number } | undefined {
  const record = asRecord(value);
  const width = numberValue(record?.width);
  const height = numberValue(record?.height);
  return width === undefined || height === undefined ? undefined : { width, height };
}

function recordValue(value: unknown, key: string): Record<string, unknown> | undefined {
  const record = asRecord(value);
  const next = record?.[key];
  return asRecord(next);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function probeNumber(value: unknown): number | undefined {
  const record = asRecord(value);
  return record?.ok === true ? numberValue(record.value) : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function stableJson(value: unknown): string {
  return JSON.stringify(canonicalJson(value));
}

function canonicalJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalJson);
  const record = asRecord(value);
  if (!record) return value;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    const entry = record[key];
    if (entry !== undefined) out[key] = canonicalJson(entry);
  }
  return out;
}

function diagnosticString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function boundedDiagnostics(details: Record<string, unknown>): StudioBoundedDiagnostics {
  const out: Record<string, string | number | boolean | null | string[]> = {};
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      out[key] = value;
    } else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      out[key] = [...value];
    } else {
      const stringValue = diagnosticString(value);
      if (stringValue !== undefined) out[key] = stringValue;
    }
  }
  return out;
}
