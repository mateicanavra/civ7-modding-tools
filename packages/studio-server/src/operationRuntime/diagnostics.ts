import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import type { RunDiagnosticsLookupResult, RunDiagnosticsRecord } from "@civ7/studio-contract";
import { runDiagnosticsRecordSchema } from "@civ7/studio-contract";
import { Effect } from "effect";
import { Value } from "typebox/value";
import type { RunInGameInternalOperation } from "./model.js";

const DEFAULT_WORKSPACE_ROOT = resolve(".mapgen-studio/run-in-game");
const SAFE_DIAGNOSTICS_ID = /^run-diagnostics-[A-Za-z0-9._-]{1,191}$/;
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,191}$/;

export function lookupRunDiagnostics(
  diagnosticsId: string,
  options: Readonly<{ workspaceRoot?: string }> = {}
): Effect.Effect<RunDiagnosticsLookupResult> {
  return Effect.promise(async () => {
    if (!SAFE_DIAGNOSTICS_ID.test(diagnosticsId)) return notFound(diagnosticsId);
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
      const record: RunDiagnosticsRecord = {
        diagnosticsId,
        requestId: operation.requestId,
        operationRevision: operation.operationRevision,
        createdAt: operation.startedAt,
        updatedAt: operation.updatedAt,
        summary: operation.failure?.message ?? `Run in Game ${operation.phase}`,
        sections: {
          operation: privateJson(operation),
        },
      };
      const path = requestDiagnosticsPath(workspaceRoot(options.workspaceRoot), operation.requestId);
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
    if (!entry.isDirectory() || !SAFE_REQUEST_ID.test(entry.name)) continue;
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
  return resolve(root ?? DEFAULT_WORKSPACE_ROOT);
}

function requestDiagnosticsPath(root: string, requestId: string): string {
  if (!SAFE_REQUEST_ID.test(requestId)) {
    throw new Error("Run in Game request id is not a safe storage key.");
  }
  const path = resolve(root, requestId, "diagnostics", "diagnostics.json");
  const rootRelative = relative(root, path);
  if (rootRelative.startsWith("..") || rootRelative === "" || rootRelative.startsWith("/")) {
    throw new Error("Run in Game diagnostics path escaped workspace root.");
  }
  return path;
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

function privateJson(value: unknown): unknown {
  const ancestors: object[] = [];
  return JSON.parse(
    JSON.stringify(value, function (this: unknown, _key, current) {
      if (typeof current === "bigint") return current.toString();
      if (current instanceof Map) return Object.fromEntries(current);
      if (current instanceof Set) return [...current];
      if (current && typeof current === "object") {
        while (ancestors.length > 0 && ancestors.at(-1) !== this) ancestors.pop();
        if (ancestors.includes(current)) return "[Circular]";
        ancestors.push(current);
      }
      return current;
    })
  );
}
