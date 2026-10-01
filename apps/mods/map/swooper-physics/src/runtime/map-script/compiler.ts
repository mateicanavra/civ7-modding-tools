import { resolve } from "node:path";
import {
  civ7MapScriptTextEncoderBanner,
  civ7TypeBoxCompatibilityPlugin,
} from "@civ7/adapter/map-script-build";
import { build } from "esbuild";

/** Bundles one virtual TypeScript entrypoint into a self-contained Civ7 map script. */
export async function bundleCiv7MapScript(args: {
  source: string;
  sourceName: string;
  appRoot: string;
}): Promise<string> {
  const result = await build({
    stdin: {
      contents: args.source,
      loader: "ts",
      resolveDir: args.appRoot,
      sourcefile: args.sourceName,
    },
    bundle: true,
    write: false,
    format: "esm",
    target: "esnext",
    platform: "neutral",
    banner: { js: civ7MapScriptTextEncoderBanner },
    external: ["/base-standard/*"],
    absWorkingDir: args.appRoot,
    nodePaths: [resolve(args.appRoot, "node_modules")],
    plugins: [civ7TypeBoxCompatibilityPlugin],
  });
  const output = result.outputFiles[0];
  if (!output)
    throw new Error(`Civ7 map script bundler produced no output for ${args.sourceName}.`);
  return output.text;
}
