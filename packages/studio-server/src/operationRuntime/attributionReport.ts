import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { assertSafeRunRequestId, jailedRunWorkspacePath } from "@civ7/studio-run-workspace";
import type { RunInGameInternalOperation } from "./model.js";
import { type JsonValue, privateJson } from "./privateJson.js";

export const RUN_ATTRIBUTION_REPORT_FILE = "attribution/attribution.json";

const RUN_ATTRIBUTION_SECTION_DEFINITIONS = [
  { id: "source", key: "source" },
  { id: "manifest", key: "manifest" },
  { id: "generation", key: "generation" },
  { id: "deployment", key: "deployment" },
  { id: "scripting-log-observation", key: "scriptingLogObservation" },
  { id: "setup-row-readback", key: "setupRowReadback" },
  { id: "bounded-loaded-game-readback", key: "boundedLoadedGameReadback" },
  { id: "terminal-result", key: "terminalResult" },
] as const;

export type RunAttributionSectionId = (typeof RUN_ATTRIBUTION_SECTION_DEFINITIONS)[number]["id"];

type RunAttributionSectionKey = (typeof RUN_ATTRIBUTION_SECTION_DEFINITIONS)[number]["key"];
type MissingRunAttributionSections = readonly [
  RunAttributionSectionId,
  ...RunAttributionSectionId[],
];
type RunAttributionSections = Readonly<Record<RunAttributionSectionKey, unknown>>;
type PartialRunAttributionSections = Readonly<Partial<RunAttributionSections>>;

export type RunAttributionReportStatus = "complete" | "incomplete";

type RunAttributionReportBase = Readonly<{
  schemaVersion: 1;
  requestId: string;
  runArtifactId?: string;
}>;

export type CompleteRunAttributionReport = RunAttributionReportBase &
  Readonly<{
    status: "complete";
    missingSections: readonly [];
    sections: RunAttributionSections;
  }>;

export type IncompleteRunAttributionReport = RunAttributionReportBase &
  Readonly<{
    status: "incomplete";
    missingSections: MissingRunAttributionSections;
    sections: PartialRunAttributionSections;
  }>;

export type RunAttributionReport = CompleteRunAttributionReport | IncompleteRunAttributionReport;

type JsonRunAttributionReport = Readonly<{
  schemaVersion: 1;
  requestId: string;
  runArtifactId?: string;
  status: RunAttributionReportStatus;
  missingSections: readonly RunAttributionSectionId[];
  sections: JsonValue;
}>;

export type RunAttributionReportReference = Readonly<{
  path: string;
  report: JsonRunAttributionReport;
}>;

/**
 * Assembles the private attribution record from the operation's durable runtime
 * facts. Public projections get only a diagnostics id; this report is for the
 * explicit diagnostics lookup path.
 */
export function buildRunAttributionReport(
  operation: RunInGameInternalOperation
): RunAttributionReport {
  const sections: PartialRunAttributionSections = {
    ...sourceSection(operation),
    ...manifestSection(operation),
    ...generationSection(operation),
    ...deploymentSection(operation),
    ...observationSections(operation),
    ...terminalResultSection(operation),
  };
  const runArtifactId = runArtifactIdFor(operation);
  const base = {
    schemaVersion: 1,
    requestId: operation.requestId,
    ...(runArtifactId === undefined ? {} : { runArtifactId }),
  } satisfies RunAttributionReportBase;
  if (hasAllAttributionSections(sections)) {
    return {
      ...base,
      status: "complete",
      missingSections: [],
      sections,
    };
  }
  const missingSections = nonEmptyMissingSections(sections);
  return {
    ...base,
    status: "incomplete",
    missingSections,
    sections,
  };
}

export async function writeRunAttributionReport(
  operation: RunInGameInternalOperation,
  options: Readonly<{ workspaceRoot: string }>
): Promise<RunAttributionReportReference> {
  const path = runAttributionReportPath(options.workspaceRoot, operation.requestId);
  const report = privateJson(buildRunAttributionReport(operation));
  if (!isJsonRunAttributionReport(report)) {
    throw new Error(`Run attribution report did not serialize to a valid JSON report: ${path}`);
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return { path, report };
}

export function runAttributionReportPath(workspaceRoot: string, requestId: string): string {
  assertSafeRunRequestId(requestId);
  return jailedRunWorkspacePath(workspaceRoot, requestId, RUN_ATTRIBUTION_REPORT_FILE);
}

function sourceSection(
  operation: RunInGameInternalOperation
): Pick<PartialRunAttributionSections, "source"> {
  const source =
    operation.request.resolvedLaunchSource === undefined ||
    operation.request.launchSourceDigest === undefined ||
    operation.request.launchEnvelopeDigest === undefined
      ? undefined
      : {
          resolvedLaunchSource: operation.request.resolvedLaunchSource,
          launchSourceDigest: operation.request.launchSourceDigest,
          launchEnvelopeDigest: operation.request.launchEnvelopeDigest,
          ...(operation.request.launchEnvelope === undefined
            ? {}
            : { launchEnvelope: operation.request.launchEnvelope }),
        };
  return source === undefined ? {} : { source };
}

function manifestSection(
  operation: RunInGameInternalOperation
): Pick<PartialRunAttributionSections, "manifest"> {
  return operation.generationManifest === undefined
    ? {}
    : { manifest: operation.generationManifest };
}

function generationSection(
  operation: RunInGameInternalOperation
): Pick<PartialRunAttributionSections, "generation"> {
  return operation.materialization === undefined ? {} : { generation: operation.materialization };
}

function deploymentSection(
  operation: RunInGameInternalOperation
): Pick<PartialRunAttributionSections, "deployment"> {
  return operation.deploymentEvidence === undefined
    ? {}
    : { deployment: operation.deploymentEvidence };
}

function observationSections(
  operation: RunInGameInternalOperation
): Pick<
  PartialRunAttributionSections,
  "scriptingLogObservation" | "setupRowReadback" | "boundedLoadedGameReadback"
> {
  const observation = operation.runtimeObservation;
  if (observation === undefined) return {};
  return {
    scriptingLogObservation: observation.scriptingLog,
    setupRowReadback: observation.setupRow,
    boundedLoadedGameReadback: observation.loadedGame,
  };
}

function terminalResultSection(
  operation: RunInGameInternalOperation
): Pick<PartialRunAttributionSections, "terminalResult"> {
  if (operation.status === "running") return {};
  return {
    terminalResult: {
      status: operation.status,
      phase: operation.phase,
      updatedAt: operation.updatedAt,
      completedPhases: operation.completedPhases,
      ...(operation.result === undefined ? {} : { result: operation.result }),
      ...(operation.failure === undefined ? {} : { failure: operation.failure }),
      ...(operation.cancellationCleanupFailure === undefined
        ? {}
        : { cancellationCleanupFailure: operation.cancellationCleanupFailure }),
    },
  };
}

function hasAllAttributionSections(
  sections: PartialRunAttributionSections
): sections is RunAttributionSections {
  return RUN_ATTRIBUTION_SECTION_DEFINITIONS.every(({ key }) => sections[key] !== undefined);
}

function nonEmptyMissingSections(
  sections: PartialRunAttributionSections
): MissingRunAttributionSections {
  const missing = RUN_ATTRIBUTION_SECTION_DEFINITIONS.flatMap(({ id, key }) =>
    sections[key] === undefined ? [id] : []
  );
  const [first, ...rest] = missing;
  if (first === undefined) {
    throw new Error("Expected at least one missing attribution section");
  }
  return [first, ...rest];
}

function isJsonRunAttributionReport(value: JsonValue): value is JsonRunAttributionReport {
  return (
    isJsonObject(value) &&
    value.schemaVersion === 1 &&
    typeof value.requestId === "string" &&
    (value.runArtifactId === undefined || typeof value.runArtifactId === "string") &&
    (value.status === "complete" || value.status === "incomplete") &&
    Array.isArray(value.missingSections) &&
    value.missingSections.every(isRunAttributionSectionId) &&
    isJsonObject(value.sections)
  );
}

function isJsonObject(value: JsonValue): value is { readonly [key: string]: JsonValue } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRunAttributionSectionId(value: unknown): value is RunAttributionSectionId {
  return RUN_ATTRIBUTION_SECTION_DEFINITIONS.some(({ id }) => id === value);
}

function runArtifactIdFor(operation: RunInGameInternalOperation): string | undefined {
  return (
    operation.generationManifest?.runArtifactId ??
    operation.materialization?.runArtifactId ??
    operation.runtimeObservation?.correlation.runArtifactId
  );
}
