import { parseArgs } from "node:util";
import { isTraceDataRecordEvent, readTraceEvents } from "@swooper/mapgen-diagnostics";

type ExtractTraceCommandInput = Readonly<{
  runDir: string;
  eventKind?: string;
  eventPrefix?: string;
}>;

const USAGE =
  "Usage: bun ./scripts/diagnostics/extract-trace.ts -- <runDir> [--event-kind ...] [--event-prefix ...]";

/** Parses one dump run and the optional event filters understood by the trace command. */
export function parseExtractTraceArgs(argv: readonly string[]): ExtractTraceCommandInput {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      "event-kind": { type: "string" },
      "event-prefix": { type: "string" },
    },
    strict: true,
  });

  const [runDir] = positionals;
  if (!runDir || positionals.length !== 1) throw new Error(USAGE);
  return {
    runDir,
    eventKind: values["event-kind"],
    eventPrefix: values["event-prefix"],
  };
}

/**
 * Extract selected trace events from a dump run.
 *
 * Usage:
 *   bun ./scripts/diagnostics/extract-trace.ts -- <runDir> [--event-kind morphology.landmassPlates.summary]
 */
function main(): void {
  const { runDir, eventKind, eventPrefix } = parseExtractTraceArgs(process.argv.slice(2));

  const trace = readTraceEvents(runDir);

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
      if (eventKind && e.kind !== eventKind) return false;
      if (eventPrefix && typeof e.kind === "string" && !e.kind.startsWith(eventPrefix))
        return false;
      if (eventPrefix && typeof e.kind !== "string") return false;
      return true;
    });

  console.log(JSON.stringify({ runDir, count: events.length, events }, null, 2));
}

if (import.meta.main) {
  try {
    main();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}
