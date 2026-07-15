import { randomUUID } from "node:crypto";
import { link, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { RunDiagnosticsLookupResult, RunDiagnosticsRecord } from "@civ7/studio-contract";
import { runDiagnosticsRecordSchema } from "@civ7/studio-contract";
import {
  assertSafeRunRequestId,
  jailedRunWorkspacePath,
  resolveRunWorkspaceRoot,
  SAFE_RUN_REQUEST_ID,
} from "@civ7/studio-run-workspace";
import { Effect } from "effect";
import { Value } from "typebox/value";
import { SAFE_RUN_DIAGNOSTICS_ID } from "../runInGamePublic.js";
import { writeRunAttributionReport } from "./attributionReport.js";
import type { RunInGameInternalOperation } from "./model.js";
import { privateJson } from "./privateJson.js";

export function lookupRunDiagnostics(
  diagnosticsId: string,
  options: Readonly<{ workspaceRoot?: string }> = {}
): Effect.Effect<RunDiagnosticsLookupResult> {
  return Effect.promise(async () => {
    if (!SAFE_RUN_DIAGNOSTICS_ID.test(diagnosticsId)) return notFound(diagnosticsId);
    try {
      const root = workspaceRoot(options.workspaceRoot);
      const index = await readDiagnosticsIndex(root, diagnosticsId);
      if (!index) return notFound(diagnosticsId);
      return await readDiagnosticsRecord(
        requestDiagnosticsPath(root, index.requestId),
        diagnosticsId,
        index.requestId
      );
    } catch (err) {
      return isNotFoundError(err) ? notFound(diagnosticsId) : unavailable(diagnosticsId);
    }
  });
}

export function writeRunDiagnostics(
  operation: RunInGameInternalOperation,
  options: Readonly<{ workspaceRoot?: string }> = {}
): Effect.Effect<void, unknown> {
  const diagnosticsId = operation.diagnosticsId;
  if (!diagnosticsId) return Effect.void;
  return Effect.tryPromise({
    try: async () => {
      const root = workspaceRoot(options.workspaceRoot);
      const attribution = await writeRunAttributionReport(operation, {
        workspaceRoot: root,
      });
      const setupFailure = setupFailureSection(operation);
      const record: RunDiagnosticsRecord = {
        diagnosticsId,
        requestId: operation.requestId,
        operationRevision: operation.operationRevision,
        createdAt: operation.startedAt,
        updatedAt: operation.updatedAt,
        summary: operation.failure?.message ?? `Run in Game ${operation.phase}`,
        sections: {
          attribution: privateJson(attribution),
          operation: privateJson(operation),
          ...(setupFailure === undefined ? {} : { setupFailure }),
        },
      };
      const path = requestDiagnosticsPath(root, operation.requestId);
      await writeDiagnosticsRecord(path, record);
      await ensureDiagnosticsIndex(root, {
        diagnosticsId,
        requestId: operation.requestId,
      });
    },
    catch: (err) => err,
  });
}

async function readDiagnosticsRecord(
  path: string,
  diagnosticsId: string,
  requestId: string
): Promise<RunDiagnosticsLookupResult> {
  const content = await readFile(path, "utf8");
  const parsed: unknown = JSON.parse(content);
  return Value.Check(runDiagnosticsRecordSchema, parsed) &&
    parsed.diagnosticsId === diagnosticsId &&
    parsed.requestId === requestId
    ? { ok: true, diagnostics: parsed }
    : unavailable(diagnosticsId);
}

type DiagnosticsIndexRecord = Readonly<{
  diagnosticsId: string;
  requestId: string;
}>;

async function readDiagnosticsIndex(
  root: string,
  diagnosticsId: string
): Promise<DiagnosticsIndexRecord | null> {
  try {
    const content = await readFile(runDiagnosticsIndexPath(root, diagnosticsId), "utf8");
    const parsed: unknown = JSON.parse(content);
    return isDiagnosticsIndexRecord(parsed, diagnosticsId) ? parsed : null;
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

async function ensureDiagnosticsIndex(root: string, record: DiagnosticsIndexRecord): Promise<void> {
  const path = runDiagnosticsIndexPath(root, record.diagnosticsId);
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(record)}\n`, "utf8");
  try {
    await link(tempPath, path);
  } catch (err) {
    if (!isAlreadyExistsError(err)) throw err;
    const existing = await readDiagnosticsIndex(root, record.diagnosticsId);
    if (existing?.requestId !== record.requestId) {
      throw new Error("Run diagnostics id is already assigned to another request.");
    }
  } finally {
    await rm(tempPath, { force: true });
  }
}

export async function removeRunDiagnosticsIndex(
  args: Readonly<{
    root: string;
    diagnosticsId: string;
    requestId: string;
  }>
): Promise<void> {
  if (!SAFE_RUN_DIAGNOSTICS_ID.test(args.diagnosticsId)) return;
  const existing = await readDiagnosticsIndex(args.root, args.diagnosticsId);
  if (existing?.requestId !== args.requestId) return;
  await rm(runDiagnosticsIndexPath(args.root, args.diagnosticsId), { force: true });
}

export function runDiagnosticsIndexPath(root: string, diagnosticsId: string): string {
  if (!SAFE_RUN_DIAGNOSTICS_ID.test(diagnosticsId)) {
    throw new TypeError("Unsafe Run diagnostics id.");
  }
  return join(root, ".diagnostics", "by-id", `${diagnosticsId}.json`);
}

function isDiagnosticsIndexRecord(
  value: unknown,
  diagnosticsId: string
): value is DiagnosticsIndexRecord {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.keys(value).length === 2 &&
    "diagnosticsId" in value &&
    value.diagnosticsId === diagnosticsId &&
    "requestId" in value &&
    typeof value.requestId === "string" &&
    SAFE_RUN_REQUEST_ID.test(value.requestId)
  );
}

function workspaceRoot(root: string | undefined): string {
  return resolveRunWorkspaceRoot(root);
}

function requestDiagnosticsPath(root: string, requestId: string): string {
  assertSafeRunRequestId(requestId);
  return jailedRunWorkspacePath(root, requestId, "diagnostics", "diagnostics.json");
}

async function writeDiagnosticsRecord(path: string, record: RunDiagnosticsRecord): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  await rename(tempPath, path);
}

function notFound(diagnosticsId: string): RunDiagnosticsLookupResult {
  return { ok: false, diagnosticsId, reason: "not-found" };
}

function unavailable(diagnosticsId: string): RunDiagnosticsLookupResult {
  return { ok: false, diagnosticsId, reason: "unavailable" };
}

function setupFailureSection(operation: RunInGameInternalOperation) {
  const diagnostics = operation.failure?.diagnostics;
  const setupFailureReason = diagnostics?.setupFailureReason ?? diagnostics?.code;
  if (setupFailureReason !== "setup-map-row-mismatched") {
    return undefined;
  }
  return privateJson({
    requestId: operation.requestId,
    runArtifactId: operation.materialization?.runArtifactId,
    expectedGeneratedMapFile: diagnostics?.mapScript ?? diagnostics?.expectedMapScript,
    setupPhase: operation.failedAtPhase,
    setupFailureReason,
    observedMapScripts: diagnostics?.observedMapScripts,
  });
}

function isNotFoundError(err: unknown): boolean {
  return err != null && typeof err === "object" && "code" in err && err.code === "ENOENT";
}

function isAlreadyExistsError(err: unknown): boolean {
  return err != null && typeof err === "object" && "code" in err && err.code === "EEXIST";
}
