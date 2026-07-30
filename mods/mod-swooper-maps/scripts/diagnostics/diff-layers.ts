import { parseArgs } from "node:util";
import { diffPathVizRuns } from "@swooper/mapgen-diagnostics";

type DiffLayersCommandInput = Readonly<{
  runDirA: string;
  runDirB: string;
  prefix?: string;
  dataTypeKey?: string;
}>;

const USAGE =
  "Usage: bun ./scripts/diagnostics/diff-layers.ts -- <runDirA> <runDirB> [--prefix ...] [--data-type-key ...]";

/** Parses the two dump runs and optional layer filter understood by the diff command. */
export function parseDiffLayersArgs(argv: readonly string[]): DiffLayersCommandInput {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      prefix: { type: "string" },
      "data-type-key": { type: "string" },
    },
    strict: true,
  });

  const [runDirA, runDirB] = positionals;
  if (!runDirA || !runDirB || positionals.length !== 2) throw new Error(USAGE);
  return {
    runDirA,
    runDirB,
    prefix: values.prefix,
    dataTypeKey: values["data-type-key"],
  };
}

/**
 * Diff layer binaries between two runs for u8/i16/f32 grids.
 *
 * Usage:
 *   bun ./scripts/diagnostics/diff-layers.ts -- <runDirA> <runDirB> [--prefix morphology.topography] [--data-type-key morphology.topography.landMask]
 */
function main(): void {
  const { runDirA, runDirB, prefix, dataTypeKey } = parseDiffLayersArgs(process.argv.slice(2));
  console.log(JSON.stringify(diffPathVizRuns({ runDirA, runDirB, prefix, dataTypeKey }), null, 2));
}

if (import.meta.main) {
  try {
    main();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}
