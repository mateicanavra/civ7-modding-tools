import { generateSwooperRunGeneratedModFromManifestPath } from "./run-manifest-generator.js";

export function parseSwooperRunManifestPathArg(args: readonly string[]): string {
  if (args.length !== 1 || !args[0]) {
    throw new Error("Usage: bun ./scripts/generate-run-manifest.ts <generation-manifest.json>");
  }
  return args[0];
}

async function main(): Promise<void> {
  const manifestPath = parseSwooperRunManifestPathArg(process.argv.slice(2));
  const generated = await generateSwooperRunGeneratedModFromManifestPath(manifestPath);
  console.log(
    `Generated Swooper Studio run mod ${generated.runArtifactId} at ${generated.generatedModRoot}`
  );
}

if (import.meta.main) {
  await main();
}
