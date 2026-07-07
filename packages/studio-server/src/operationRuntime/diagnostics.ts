import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import type { RunDiagnosticsLookupResult, RunDiagnosticsRecord } from "@civ7/studio-contract";
import { runDiagnosticsRecordSchema } from "@civ7/studio-contract";
import { Effect } from "effect";
import { Value } from "typebox/value";
import type { RunInGameInternalOperation } from "./model.js";

const WORKSPACE_ROOT = resolve(".mapgen-studio/run-in-game");
const SAFE_DIAGNOSTICS_ID = /^run-diagnostics-[A-Za-z0-9._-]{1,191}$/;

export function lookupRunDiagnostics(
  diagnosticsId: string
): Effect.Effect<RunDiagnosticsLookupResult> {
  return Effect.promise(async () => {
    if (!SAFE_DIAGNOSTICS_ID.test(diagnosticsId)) return notFound(diagnosticsId);
    try {
      const content = await readFile(diagnosticsPath(diagnosticsId), "utf8");
      const parsed = JSON.parse(content) as unknown;
      return Value.Check(runDiagnosticsRecordSchema, parsed) &&
        parsed.diagnosticsId === diagnosticsId
        ? { ok: true, diagnostics: parsed as RunDiagnosticsRecord }
        : unavailable(diagnosticsId);
    } catch (err) {
      return isNotFoundError(err) ? notFound(diagnosticsId) : unavailable(diagnosticsId);
    }
  });
}

export function writeRunDiagnostics(
  operation: RunInGameInternalOperation
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
      const path = diagnosticsPath(diagnosticsId);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, `${JSON.stringify(record, null, 2)}\n`, "utf8");
    },
    catch: (err) => err,
  });
}

function diagnosticsPath(diagnosticsId: string): string {
  if (!SAFE_DIAGNOSTICS_ID.test(diagnosticsId)) {
    throw new Error("Run in Game diagnostics id is not a safe storage key.");
  }
  const path = resolve(WORKSPACE_ROOT, "diagnostics", `${diagnosticsId}.json`);
  const rootRelative = relative(WORKSPACE_ROOT, path);
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
