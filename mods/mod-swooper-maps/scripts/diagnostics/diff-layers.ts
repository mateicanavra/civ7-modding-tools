import { diffPathVizRuns } from "@swooper/mapgen-diagnostics";
import { parseDiagnosticArgs } from "./command-input.js";

/**
 * Diff layer binaries between two runs for u8/i16/f32 grids.
 *
 * Usage:
 *   bun ./scripts/diagnostics/diff-layers.ts -- <runDirA> <runDirB> [--prefix morphology.topography] [--dataTypeKey morphology.topography.landMask]
 */
function main(): void {
  const { positionals, flags } = parseDiagnosticArgs(process.argv.slice(2));
  const runDirA = positionals[0];
  const runDirB = positionals[1];
  if (!runDirA || !runDirB) {
    throw new Error(
      "Usage: bun ./scripts/diagnostics/diff-layers.ts -- <runDirA> <runDirB> [--prefix ...]"
    );
  }

  const prefix = typeof flags.prefix === "string" ? flags.prefix : undefined;
  const dataTypeKey = typeof flags.dataTypeKey === "string" ? flags.dataTypeKey : undefined;
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
