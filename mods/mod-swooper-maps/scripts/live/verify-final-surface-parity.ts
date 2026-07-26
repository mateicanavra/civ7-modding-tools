#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import {
  type Civ7MapSurfaceObservationInput,
  getCiv7MapSurfaceObservation,
} from "@civ7/direct-control";
import type {
  RunDiagnosticsLookupResult,
  RunInGameOperationStatus,
  StudioEffectContract,
} from "@civ7/studio-contract";
import {
  type RunCorrelation,
  readStudioRunGenerationManifest,
  runCorrelationForManifest,
  type StudioRunGenerationManifest,
} from "@civ7/studio-run-workspace";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import {
  type PublishJsonEvidenceOptions,
  type PublishJsonEvidenceResult,
  publishJsonEvidence,
} from "@swooper/mapgen-diagnostics";
import {
  buildStandardParityReport,
  projectStandardLiveParityCapture,
  resolveStandardParityReplayInput,
  runResolvedStandardParityReplay,
  type StandardLiveObservation,
  type StandardParityReport,
  type StandardParityReportState,
} from "../../src/recipes/standard/parity/index.js";

export type FinalSurfaceParityArgs = Readonly<{
  requestId?: string;
  diagnosticsId?: string;
  evidenceFile?: string;
  studioUrl: string;
  host?: string;
  port?: number;
  timeoutMs: number;
  maxPlotsPerRead: number;
  output?: string;
  help: boolean;
}>;

const usage = `Usage:
  nx run mod-swooper-maps:verify:operational -- --mode final-surface-parity --request-id <id>
  nx run mod-swooper-maps:verify:operational -- --mode final-surface-parity --diagnostics-id <id>
  nx run mod-swooper-maps:verify:operational -- --mode final-surface-parity --evidence-file <diagnostics.json>

Options:
  --request-id <id>           Bridge a fresh public completion to its private diagnostics record
  --diagnostics-id <id>       Read one private diagnostics record directly
  --evidence-file <path>      Read a saved private diagnostics record
  --studio-url <url>          Studio oRPC URL (default: http://127.0.0.1:5174)
  --host <host>               Civ7 tuner host
  --port <port>               Civ7 tuner port
  --timeout-ms <ms>           Direct-control timeout (default: 45000)
  --max-plots-per-read <n>    Direct-control tile read cap (default: 512)
  --output <path>             Atomically publish the complete JSON result
`;

type StudioRunInGameClient = Readonly<{
  runInGame: Readonly<{
    status: (input: Readonly<{ requestId: string }>) => Promise<RunInGameOperationStatus>;
    diagnostics: (
      input: Readonly<{ diagnosticsId: string }>
    ) => Promise<RunDiagnosticsLookupResult>;
  }>;
}>;

export type StudioRunInGameClientFactory = (studioUrl: string) => StudioRunInGameClient;

/** Raw private authorship evidence paired with its validated generation manifest. */
export type FinalSurfaceParityEvidence = Readonly<{
  exactAuthorshipEvidence: unknown;
  manifest: StudioRunGenerationManifest;
}>;

type CorrelationFailedOutput = Readonly<{
  schemaVersion: 1;
  kind: "standard-final-surface-parity";
  ok: false;
  status: "correlation-failed";
  correlation: RunCorrelation;
  failureLinks: ReadonlyArray<string>;
  unresolvedLinks: ReadonlyArray<string>;
}>;

type CorrelationBlockedOutput = Readonly<{
  schemaVersion: 1;
  kind: "standard-final-surface-parity";
  ok: false;
  status: "correlation-blocked";
  correlation: RunCorrelation;
  unresolvedLinks: ReadonlyArray<string>;
}>;

type ParityReportOutput = Readonly<{
  schemaVersion: 1;
  kind: "standard-final-surface-parity";
  ok: boolean;
  status: StandardParityReportState;
  correlation: RunCorrelation;
  observation: StandardLiveObservation["identity"];
  report: StandardParityReport;
}>;

export type FinalSurfaceParityOutput =
  | CorrelationFailedOutput
  | CorrelationBlockedOutput
  | ParityReportOutput;

type ObserveMapSurface = (
  input: Civ7MapSurfaceObservationInput,
  options: Parameters<typeof getCiv7MapSurfaceObservation>[1]
) => Promise<StandardLiveObservation>;

export type FinalSurfaceParityCommandDependencies = Readonly<{
  clientFactory: StudioRunInGameClientFactory;
  observeMapSurface: ObserveMapSurface;
  publish: (options: PublishJsonEvidenceOptions) => PublishJsonEvidenceResult;
  stdout: (message: string) => void;
  stderr: (message: string) => void;
}>;

const defaultDependencies: FinalSurfaceParityCommandDependencies = {
  clientFactory: createStudioRunInGameClient,
  observeMapSurface: getCiv7MapSurfaceObservation,
  publish: publishJsonEvidence,
  stdout: (message) => console.log(message),
  stderr: (message) => console.error(message),
};

/** Parses the one evidence selector and bounded Direct Control options. */
export function parseFinalSurfaceParityArgs(argv: string[]): FinalSurfaceParityArgs {
  const args: {
    requestId?: string;
    diagnosticsId?: string;
    evidenceFile?: string;
    studioUrl: string;
    host?: string;
    port?: number;
    timeoutMs: number;
    maxPlotsPerRead: number;
    output?: string;
    help: boolean;
  } = {
    studioUrl: "http://127.0.0.1:5174",
    timeoutMs: 45_000,
    maxPlotsPerRead: 512,
    help: false,
  };
  let selectorCount = 0;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      index += 1;
      return next;
    };
    switch (arg) {
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--request-id":
        selectorCount += 1;
        args.requestId = value();
        break;
      case "--diagnostics-id":
        selectorCount += 1;
        args.diagnosticsId = value();
        break;
      case "--evidence-file":
        selectorCount += 1;
        args.evidenceFile = value();
        break;
      case "--studio-url":
        args.studioUrl = value().replace(/\/+$/, "");
        break;
      case "--host":
        args.host = value();
        break;
      case "--port":
        args.port = parsePositiveInteger(value(), arg);
        break;
      case "--timeout-ms":
        args.timeoutMs = parsePositiveInteger(value(), arg);
        break;
      case "--max-plots-per-read":
        args.maxPlotsPerRead = parsePositiveInteger(value(), arg);
        break;
      case "--output":
        args.output = value();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!args.help && selectorCount !== 1) {
    throw new Error(
      "Exactly one of --request-id, --diagnostics-id, or --evidence-file is required"
    );
  }
  return args;
}

/**
 * Loads one private diagnostics record and validates its immutable manifest
 * reference without interpreting recipe-owned exact-authorship payloads.
 */
export async function loadFinalSurfaceParityEvidence(
  args: FinalSurfaceParityArgs,
  clientFactory: StudioRunInGameClientFactory = createStudioRunInGameClient
): Promise<FinalSurfaceParityEvidence> {
  if (args.evidenceFile) {
    return extractFinalSurfaceParityEvidenceFromDiagnostics(
      JSON.parse(readFileSync(args.evidenceFile, "utf8"))
    );
  }

  const client = clientFactory(args.studioUrl);
  if (args.diagnosticsId) {
    const diagnostics = await client.runInGame.diagnostics({ diagnosticsId: args.diagnosticsId });
    return loadFinalSurfaceParityEvidenceFromDiagnosticsLookup({
      diagnosticsId: args.diagnosticsId,
      diagnostics,
    });
  }
  if (!args.requestId) {
    throw new Error("Expected --request-id, --diagnostics-id, or --evidence-file");
  }

  const status = await client.runInGame.status({ requestId: args.requestId });
  const diagnosticsId = requireDiagnosticsId(args.requestId, status);
  const diagnostics = await client.runInGame.diagnostics({ diagnosticsId });
  return loadFinalSurfaceParityEvidenceFromDiagnosticsLookup({
    diagnosticsId,
    expectedRequestId: args.requestId,
    diagnostics,
  });
}

/** Resolves a typed diagnostics lookup before reading its private operation. */
async function loadFinalSurfaceParityEvidenceFromDiagnosticsLookup(
  args: Readonly<{
    diagnosticsId: string;
    expectedRequestId?: string;
    diagnostics: RunDiagnosticsLookupResult;
  }>
): Promise<FinalSurfaceParityEvidence> {
  if (!args.diagnostics.ok) {
    throw new Error(
      `Studio Run in Game diagnostics ${args.diagnosticsId} ${args.diagnostics.reason}`
    );
  }
  return extractFinalSurfaceParityEvidenceFromDiagnostics(args.diagnostics.diagnostics, {
    expectedDiagnosticsId: args.diagnosticsId,
    expectedRequestId: args.expectedRequestId,
  });
}

/**
 * Reads one private operation envelope while leaving exact-authorship
 * completeness and Standard product evidence to the parity resolver.
 */
export async function extractFinalSurfaceParityEvidenceFromDiagnostics(
  payload: unknown,
  expected: Readonly<{
    expectedDiagnosticsId?: string;
    expectedRequestId?: string;
  }> = {}
): Promise<FinalSurfaceParityEvidence> {
  if (!isRecord(payload)) throw new Error("Diagnostics payload must be an object");
  const diagnosticsId = requiredString(payload.diagnosticsId, "diagnostics id");
  const requestId = requiredString(payload.requestId, "diagnostics request id");
  if (
    expected.expectedDiagnosticsId !== undefined &&
    diagnosticsId !== expected.expectedDiagnosticsId
  ) {
    throw new Error(
      `Studio Run in Game diagnostics id mismatch: expected ${expected.expectedDiagnosticsId}, received ${diagnosticsId}`
    );
  }
  if (expected.expectedRequestId !== undefined && requestId !== expected.expectedRequestId) {
    throw new Error(
      `Studio Run in Game diagnostics request mismatch: expected ${expected.expectedRequestId}, received ${requestId}`
    );
  }

  const sections = recordValue(payload, "sections");
  const operation = recordValue(sections, "operation");
  if (!operation) {
    throw new Error(`Studio Run in Game diagnostics missing private operation for ${requestId}`);
  }
  if (operation.requestId !== requestId) {
    throw new Error(
      `Studio Run in Game private operation request mismatch: expected ${requestId}, received ${String(operation.requestId)}`
    );
  }
  if (operation.kind !== "run-in-game") {
    throw new Error(
      `Studio Run in Game private operation kind mismatch for ${requestId}: ${String(operation.kind)}`
    );
  }
  if (operation.status !== "complete") {
    throw new Error(
      `Studio Run in Game private operation must be complete for ${requestId}: ${String(operation.status)}`
    );
  }
  const persistedRevision = optionalRevision(payload.operationRevision, requestId, "persisted");
  const operationRevision = optionalRevision(
    operation.operationRevision,
    requestId,
    "private operation"
  );
  if (
    persistedRevision !== undefined &&
    operationRevision !== undefined &&
    persistedRevision !== operationRevision
  ) {
    throw new Error(
      `Studio Run in Game operation revision mismatch for ${requestId}: persisted ${persistedRevision}, private ${operationRevision}`
    );
  }

  const reference = privateManifestReference(operation, requestId);
  const manifest = await readStudioRunGenerationManifest(reference.path).catch((error: unknown) => {
    throw new Error(
      `Studio Run in Game generation manifest is unavailable for ${requestId}: ${errorMessage(error)}`
    );
  });
  validateManifestReference({ requestId, reference, manifest });

  return {
    exactAuthorshipEvidence: operation.exactAuthorshipEvidence,
    manifest,
  };
}

/** Runs correlation, replay, one coherent live observation, and report composition. */
async function runFinalSurfaceParity(
  args: FinalSurfaceParityArgs,
  dependencies: Pick<FinalSurfaceParityCommandDependencies, "clientFactory" | "observeMapSurface">
): Promise<FinalSurfaceParityOutput> {
  const evidence = await loadFinalSurfaceParityEvidence(args, dependencies.clientFactory);
  const correlation = runCorrelationForManifest(evidence.manifest);
  const resolution = resolveStandardParityReplayInput({
    exactAuthorship: evidence.exactAuthorshipEvidence,
    manifest: evidence.manifest,
  });

  if (resolution.status === "failed") {
    return {
      schemaVersion: 1,
      kind: "standard-final-surface-parity",
      ok: false,
      status: "correlation-failed",
      correlation,
      failureLinks: resolution.failureLinks,
      unresolvedLinks: resolution.unresolvedLinks,
    };
  }
  if (resolution.status === "blocked") {
    return {
      schemaVersion: 1,
      kind: "standard-final-surface-parity",
      ok: false,
      status: "correlation-blocked",
      correlation,
      unresolvedLinks: resolution.unresolvedLinks,
    };
  }

  const local = runResolvedStandardParityReplay(resolution);
  const observation = await dependencies.observeMapSurface(
    {
      fullGrid: {
        fields: ["terrain", "biome", "feature", "resource", "hydrology"],
        includeHidden: true,
        maxPlotsPerRead: args.maxPlotsPerRead,
      },
      nativeRiverObjects: { maxSamples: 16 },
    },
    {
      host: args.host,
      port: args.port,
      timeoutMs: args.timeoutMs,
    }
  );
  const live = projectStandardLiveParityCapture(observation);
  const report = buildStandardParityReport({
    exact: resolution.exact,
    local,
    live,
  });

  return {
    schemaVersion: 1,
    kind: "standard-final-surface-parity",
    ok: report.state === "complete-pass",
    status: report.state,
    correlation,
    observation: observation.identity,
    report,
  };
}

/** Maps only a fully resolved, contradiction-free parity report to success. */
export function finalSurfaceParityExitCode(status: FinalSurfaceParityOutput["status"]): 0 | 2 {
  return status === "complete-pass" ? 0 : 2;
}

/**
 * Executes the CLI boundary. Acquisition or transport failures return one;
 * honest correlation/product blockers return two.
 */
export async function executeFinalSurfaceParityCommand(
  argv: string[],
  dependencyOverrides: Partial<FinalSurfaceParityCommandDependencies> = {}
): Promise<0 | 1 | 2> {
  const dependencies = { ...defaultDependencies, ...dependencyOverrides };
  try {
    const args = parseFinalSurfaceParityArgs(argv);
    if (args.help) {
      dependencies.stdout(usage);
      return 0;
    }
    const output = await runFinalSurfaceParity(args, dependencies);
    if (args.output) {
      dependencies.publish({ path: args.output, evidence: output });
    }
    dependencies.stdout(JSON.stringify(output, null, 2));
    return finalSurfaceParityExitCode(output.status);
  } catch (error) {
    dependencies.stderr(
      JSON.stringify(
        {
          schemaVersion: 1,
          kind: "standard-final-surface-parity",
          ok: false,
          status: "error",
          error: errorMessage(error),
        },
        null,
        2
      )
    );
    return 1;
  }
}

function createStudioRunInGameClient(studioUrl: string): StudioRunInGameClient {
  return createORPCClient<ContractRouterClient<StudioEffectContract>>(
    new RPCLink({ url: () => `${studioUrl}/rpc` })
  );
}

function parsePositiveInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer: ${value}`);
  }
  return parsed;
}

function requireDiagnosticsId(
  requestId: string,
  status: Pick<RunInGameOperationStatus, "requestId" | "diagnosticsId" | "status">
): string {
  if (status.requestId !== requestId) {
    throw new Error(
      `Studio Run in Game status request mismatch: expected ${requestId}, received ${status.requestId}`
    );
  }
  if (status.status !== "completed") {
    throw new Error(
      `Studio Run in Game status must be completed for final-surface parity: ${requestId} is ${status.status}`
    );
  }
  if (typeof status.diagnosticsId !== "string" || status.diagnosticsId.length === 0) {
    throw new Error(`Studio Run in Game status missing diagnostics id for ${requestId}`);
  }
  return status.diagnosticsId;
}

type PrivateManifestReference = Readonly<{
  path: string;
  generationManifestDigest: string;
  runArtifactId: string;
  correlation: Readonly<Record<string, unknown>>;
}>;

function privateManifestReference(
  operation: Readonly<Record<string, unknown>>,
  requestId: string
): PrivateManifestReference {
  const value = recordValue(operation, "generationManifest");
  const path = nonEmptyString(value?.path);
  const generationManifestDigest = nonEmptyString(value?.generationManifestDigest);
  const runArtifactId = nonEmptyString(value?.runArtifactId);
  const correlation = recordValue(value, "correlation");
  if (!path || !generationManifestDigest || !runArtifactId || !correlation) {
    throw new Error(
      `Studio Run in Game diagnostics missing generation manifest reference for ${requestId}`
    );
  }
  return { path, generationManifestDigest, runArtifactId, correlation };
}

function validateManifestReference(
  args: Readonly<{
    requestId: string;
    reference: PrivateManifestReference;
    manifest: StudioRunGenerationManifest;
  }>
): void {
  const expected = runCorrelationForManifest(args.manifest);
  if (args.reference.generationManifestDigest !== expected.generationManifestDigest) {
    throw new Error(`Studio Run in Game generation manifest digest mismatch for ${args.requestId}`);
  }
  if (args.reference.runArtifactId !== expected.runArtifactId) {
    throw new Error(
      `Studio Run in Game generation manifest artifact mismatch for ${args.requestId}`
    );
  }
  if (args.manifest.payload.requestId !== args.requestId) {
    throw new Error(
      `Studio Run in Game generation manifest request mismatch for ${args.requestId}`
    );
  }
  for (const key of [
    "requestId",
    "runArtifactId",
    "canonicalConfigDigest",
    "launchEnvelopeDigest",
    "generationManifestDigest",
  ] as const) {
    if (args.reference.correlation[key] !== expected[key]) {
      throw new Error(
        `Studio Run in Game generation manifest correlation mismatch for ${args.requestId}: ${key}`
      );
    }
  }
}

function optionalRevision(value: unknown, requestId: string, owner: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  throw new Error(
    `Studio Run in Game ${owner} revision is invalid for ${requestId}: ${String(value)}`
  );
}

function requiredString(value: unknown, label: string): string {
  const string = nonEmptyString(value);
  if (string === undefined) throw new Error(`Studio Run in Game ${label} is missing`);
  return string;
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordValue(value: unknown, key: string): Readonly<Record<string, unknown>> | undefined {
  return isRecord(value) && isRecord(value[key]) ? value[key] : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

if (import.meta.main) {
  process.exitCode = await executeFinalSurfaceParityCommand(process.argv.slice(2));
}
