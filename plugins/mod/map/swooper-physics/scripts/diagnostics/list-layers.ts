import { parseArgs } from "node:util";
import { inventoryPathVizLayers, readPathVizManifest } from "@swooper/mapgen-diagnostics";

type ListLayersCommandInput = Readonly<{
  runDir: string;
  prefix?: string;
  dataTypeKey?: string;
}>;

const USAGE =
  "Usage: bun ./scripts/diagnostics/list-layers.ts -- <runDir> [--prefix ...] [--data-type-key ...]";

/** Parses one dump run and the optional layer filter understood by the inventory command. */
export function parseListLayersArgs(argv: readonly string[]): ListLayersCommandInput {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      prefix: { type: "string" },
      "data-type-key": { type: "string" },
    },
    strict: true,
  });

  const [runDir] = positionals;
  if (!runDir || positionals.length !== 1) throw new Error(USAGE);
  return {
    runDir,
    prefix: values.prefix,
    dataTypeKey: values["data-type-key"],
  };
}

/**
 * List layers in a viz dump manifest.
 *
 * Usage:
 *   bun ./scripts/diagnostics/list-layers.ts -- <runDir> [--prefix foundation.] [--data-type-key morphology.topography.landMask]
 */
function main(): void {
  const { runDir, prefix, dataTypeKey } = parseListLayersArgs(process.argv.slice(2));

  const manifest = readPathVizManifest(runDir);
  const rows = inventoryPathVizLayers(manifest, { prefix, dataTypeKey });
  console.log(JSON.stringify({ runId: manifest.runId, runDir, layers: rows }, null, 2));
}

if (import.meta.main) {
  try {
    main();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}
