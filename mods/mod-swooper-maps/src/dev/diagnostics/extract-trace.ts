import { parseArgs, loadTraceLines } from "./shared.js";

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Extract selected trace events from a dump run.
 *
 * Usage:
 *   bun ./src/dev/diagnostics/extract-trace.ts -- <runDir> [--eventKind morphology.landmassPlates.summary]
 */
function main(): void {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const runDir = positionals[0];
  if (!runDir) throw new Error("Usage: bun ./src/dev/diagnostics/extract-trace.ts -- <runDir> [--eventKind ...]");

  const trace = loadTraceLines(runDir);
  const kindFlag = asString(flags.eventKind);
  const prefixFlag = asString(flags.eventPrefix);

  const events = trace
    .filter((e) => e?.kind === "step.event" && e?.data)
    .map((e) => ({
      tsMs: e.tsMs ?? null,
      stepId: e.stepId ?? null,
      phase: e.phase ?? null,
      kind: e.data.kind ?? null,
      data: e.data,
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

