import { Args, Command, Flags } from "@oclif/core";
import { diffPathVizRuns } from "@swooper/mapgen-diagnostics";

export default class MapgenDiagnosticsDiff extends Command {
  static summary = "Compare corresponding diagnostic layers from two MapGen runs";

  static examples = [
    "<%= config.bin %> mapgen diagnostics diff run-a run-b --prefix foundation.",
    "<%= config.bin %> mapgen diagnostics diff run-a run-b --data-type-key morphology.topography.landMask",
  ];

  static args = {
    runDirA: Args.directory({
      description: "First diagnostic run directory",
      exists: true,
      required: true,
    }),
    runDirB: Args.directory({
      description: "Second diagnostic run directory",
      exists: true,
      required: true,
    }),
  };

  static flags = {
    prefix: Flags.string({ description: "Include only layer keys with this prefix" }),
    "data-type-key": Flags.string({ description: "Include only this exact layer data-type key" }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MapgenDiagnosticsDiff);
    this.log(
      JSON.stringify(
        diffPathVizRuns({
          runDirA: args.runDirA,
          runDirB: args.runDirB,
          prefix: flags.prefix,
          dataTypeKey: flags["data-type-key"],
        }),
        null,
        2
      )
    );
  }
}
