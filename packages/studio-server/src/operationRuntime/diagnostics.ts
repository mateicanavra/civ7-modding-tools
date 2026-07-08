import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
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
      const path = await findDiagnosticsRecordPath(root, diagnosticsId);
      if (!path) return notFound(diagnosticsId);
      return await readDiagnosticsRecord(path, diagnosticsId);
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
        },
      };
      const path = requestDiagnosticsPath(root, operation.requestId);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, `${JSON.stringify(record, null, 2)}\n`, "utf8");
    },
    catch: (err) => err,
  });
}

async function findDiagnosticsRecordPath(
  root: string,
  diagnosticsId: string
): Promise<string | null> {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !SAFE_RUN_REQUEST_ID.test(entry.name)) continue;
    const path = requestDiagnosticsPath(root, entry.name);
    try {
      const content = await readFile(path, "utf8");
      const parsed = JSON.parse(content) as unknown;
      if (
        Value.Check(runDiagnosticsRecordSchema, parsed) &&
        parsed.requestId === entry.name &&
        parsed.diagnosticsId === diagnosticsId
      ) {
        return path;
      }
    } catch (err) {
      if (isNotFoundError(err)) continue;
    }
  }
  return null;
}

async function readDiagnosticsRecord(
  path: string,
  diagnosticsId: string
): Promise<RunDiagnosticsLookupResult> {
  const content = await readFile(path, "utf8");
  const parsed = JSON.parse(content) as unknown;
  return Value.Check(runDiagnosticsRecordSchema, parsed) && parsed.diagnosticsId === diagnosticsId
    ? { ok: true, diagnostics: parsed as RunDiagnosticsRecord }
    : unavailable(diagnosticsId);
}

function workspaceRoot(root: string | undefined): string {
  return resolveRunWorkspaceRoot(root);
}

function requestDiagnosticsPath(root: string, requestId: string): string {
  assertSafeRunRequestId(requestId);
  return jailedRunWorkspacePath(root, requestId, "diagnostics", "diagnostics.json");
}

function notFound(diagnosticsId: string): RunDiagnosticsLookupResult {
  return { ok: false, diagnosticsId, reason: "not-found" };
}

function unavailable(diagnosticsId: string): RunDiagnosticsLookupResult {
  return { ok: false, diagnosticsId, reason: "unavailable" };
}

function isNotFoundError(err: unknown): boolean {
  return (
    err != null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === "ENOENT"
  );
}
