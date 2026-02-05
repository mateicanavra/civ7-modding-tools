import { parseArgs, loadManifest, listLayers } from "./shared.js";

/**
 * List layers in a viz dump manifest.
 *
 * Usage:
 *   bun ./src/dev/diagnostics/list-layers.ts -- <runDir> [--prefix foundation.] [--dataTypeKey morphology.topography.landMask]
 */
function main(): void {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const runDir = positionals[0];
  if (!runDir) throw new Error("Usage: bun ./src/dev/diagnostics/list-layers.ts -- <runDir> [--prefix ...]");

  const manifest = loadManifest(runDir);
  const prefix = typeof flags.prefix === "string" ? flags.prefix : undefined;
  const dataTypeKey = typeof flags.dataTypeKey === "string" ? flags.dataTypeKey : undefined;

  const rows = listLayers(manifest, { prefix, dataTypeKey });
  console.log(JSON.stringify({ runId: manifest.runId, runDir, layers: rows }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}

