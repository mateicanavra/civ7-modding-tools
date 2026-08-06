import { Args, Command, Flags } from "@oclif/core";
import { inventoryPathVizLayers, readPathVizManifest } from "@swooper/mapgen-diagnostics";

export default class MapgenDiagnosticsList extends Command {
  static summary = "List the layers published by one MapGen diagnostic run";

  static examples = [
    "<%= config.bin %> mapgen diagnostics list run-a --prefix hydrology.",
    "<%= config.bin %> mapgen diagnostics list run-a --data-type-key morphology.topography.landMask",
  ];

  static args = {
    runDir: Args.directory({
      description: "Diagnostic run directory",
      exists: true,
      required: true,
    }),
  };

  static flags = {
    prefix: Flags.string({ description: "Include only layer keys with this prefix" }),
    "data-type-key": Flags.string({ description: "Include only this exact layer data-type key" }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MapgenDiagnosticsList);
    const manifest = readPathVizManifest(args.runDir);
    const layers = inventoryPathVizLayers(manifest, {
      prefix: flags.prefix,
      dataTypeKey: flags["data-type-key"],
    });
    this.log(JSON.stringify({ runId: manifest.runId, runDir: args.runDir, layers }, null, 2));
  }
}
