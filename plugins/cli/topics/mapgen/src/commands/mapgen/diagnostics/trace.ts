import { Args, Command, Flags } from "@oclif/core";
import { isTraceDataRecordEvent, readTraceEvents } from "@swooper/mapgen-diagnostics";

export default class MapgenDiagnosticsTrace extends Command {
  static summary = "Read selected trace events from one MapGen diagnostic run";

  static examples = [
    "<%= config.bin %> mapgen diagnostics trace run-a --event-prefix hydrology.",
    "<%= config.bin %> mapgen diagnostics trace run-a --event-kind morphology.landmassPlates.summary",
  ];

  static args = {
    runDir: Args.directory({
      description: "Diagnostic run directory",
      exists: true,
      required: true,
    }),
  };

  static flags = {
    "event-kind": Flags.string({ description: "Include only this exact trace data kind" }),
    "event-prefix": Flags.string({ description: "Include only trace data kinds with this prefix" }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MapgenDiagnosticsTrace);
    const eventKind = flags["event-kind"];
    const eventPrefix = flags["event-prefix"];
    const events = readTraceEvents(args.runDir)
      .filter(isTraceDataRecordEvent)
      .map((event) => ({
        tsMs: event.tsMs,
        stepId: event.stepId,
        stageId: event.stageId,
        kind: typeof event.data.kind === "string" ? event.data.kind : null,
        data: event.data,
      }))
      .filter((event) => {
        if (eventKind && event.kind !== eventKind) return false;
        if (eventPrefix && typeof event.kind === "string" && !event.kind.startsWith(eventPrefix)) {
          return false;
        }
        if (eventPrefix && typeof event.kind !== "string") return false;
        return true;
      });

    this.log(JSON.stringify({ runDir: args.runDir, count: events.length, events }, null, 2));
  }
}
