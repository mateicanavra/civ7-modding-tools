import { parseDiagnosticArgs } from "./command-input.js";
import { isTraceDataRecordEvent, loadTraceEvents } from "./serialized-evidence.js";

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Extract selected trace events from a dump run.
 *
 * Usage:
 *   bun ./scripts/diagnostics/extract-trace.ts -- <runDir> [--eventKind morphology.landmassPlates.summary]
 */
function main(): void {
  const { positionals, flags } = parseDiagnosticArgs(process.argv.slice(2));
  const runDir = positionals[0];
  if (!runDir)
    throw new Error(
      "Usage: bun ./scripts/diagnostics/extract-trace.ts -- <runDir> [--eventKind ...]"
    );

  const trace = loadTraceEvents(runDir);
  const kindFlag = asString(flags.eventKind);
  const prefixFlag = asString(flags.eventPrefix);

  const events = trace
    .filter(isTraceDataRecordEvent)
    .map((event) => ({
      tsMs: event.tsMs,
      stepId: event.stepId,
      stageId: event.stageId,
      kind: typeof event.data.kind === "string" ? event.data.kind : null,
      data: event.data,
    }))
    .filter((e) => {
      if (kindFlag && e.kind !== kindFlag) return false;
      if (prefixFlag && typeof e.kind === "string" && !e.kind.startsWith(prefixFlag)) return false;
      if (prefixFlag && typeof e.kind !== "string") return false;
      return true;
    });

  console.log(JSON.stringify({ runDir, count: events.length, events }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}
