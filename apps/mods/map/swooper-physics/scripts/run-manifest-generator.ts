import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  civ7MapScriptTextEncoderBanner,
  civ7TypeBoxCompatibilityPlugin,
} from "@civ7/adapter/map-script-build";
import { assessCiv7SignedIntSeed } from "@civ7/map-policy/setup";
import { applyGeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";
import {
  readStudioRunGenerationManifest,
  runCorrelationForManifest,
} from "@civ7/studio-run-workspace";
import { STANDARD_RECIPE_ID } from "@swooper/swooper-physics/standard";
import { admitStandardMapConfig } from "@swooper/swooper-physics/standard/map-config";
import { build } from "esbuild";
import {
  buildSwooperRunGeneratedModFilePlan,
  renderSwooperRunMapSource,
  type SwooperRunGeneratedModPlanInput,
} from "./map-artifacts/file-plan.js";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

type SwooperRunGeneratedMod = Readonly<{
  runArtifactId: string;
  generatedModRoot: string;
}>;

type StudioRunGenerationManifest = Awaited<ReturnType<typeof readStudioRunGenerationManifest>>;

/**
 * A deserialized manifest that has passed Swooper's Standard run verification.
 * `renderInput.config` comes from the same pure Swooper admission rule used for
 * a new source request. Repeating that rule here rejects malformed or
 * self-consistently rehashed manifest data without creating another semantic
 * owner or applying defaults.
 */
type VerifiedSwooperStandardRun = Readonly<{
  manifest: StudioRunGenerationManifest;
  renderInput: SwooperRunGeneratedModPlanInput;
}>;

/**
 * Materializes and bundles the request-local Swooper mod authenticated by one
 * Studio generation manifest. The virtual map source is bundled in memory so
 * the one materialized file plan describes only the final mod tree.
 */
export async function generateSwooperRunGeneratedModFromManifestPath(
  manifestPath: string
): Promise<SwooperRunGeneratedMod> {
  const manifest = await readStudioRunGenerationManifest(manifestPath);
  const verifiedRun = verifySwooperStandardRunManifest(manifest);
  const { manifest: verifiedManifest, renderInput } = verifiedRun;
  const generatedModRoot = resolveSwooperRunGeneratedModRoot(manifestPath, verifiedManifest);
  const bundledMapScript = await bundleRunMapScript({
    source: renderSwooperRunMapSource(renderInput),
    sourceName: `${renderInput.correlation.runArtifactId}.ts`,
  });
  const plan = buildSwooperRunGeneratedModFilePlan(renderInput, bundledMapScript);
  await applyGeneratedFilePlan(plan, { outputRoot: generatedModRoot });

  return {
    runArtifactId: verifiedManifest.payload.runArtifactId,
    generatedModRoot,
  };
}

function resolveSwooperRunGeneratedModRoot(
  manifestPath: string,
  manifest: StudioRunGenerationManifest
): string {
  return resolve(dirname(manifestPath), manifest.payload.workspace.generatedModRoot);
}

/**
 * Verifies a deserialized Studio manifest before Swooper renders it. The
 * Standard config check deliberately reuses source admission; it neither
 * defines a second Standard semantic rule nor fills omitted values.
 */
export function verifySwooperStandardRunManifest(
  manifest: StudioRunGenerationManifest
): VerifiedSwooperStandardRun {
  if (manifest.payload.launchEnvelope.canonicalConfig.recipe !== STANDARD_RECIPE_ID) {
    throw new Error(
      `Swooper run manifest recipe envelope must be ${STANDARD_RECIPE_ID}; got ${manifest.payload.launchEnvelope.canonicalConfig.recipe}.`
    );
  }
  const config = admitStandardMapConfig(manifest.payload.launchEnvelope.canonicalConfig);
  return {
    manifest,
    renderInput: {
      correlation: runCorrelationForManifest(manifest),
      config,
      seed: numericLaunchSeed(manifest.payload.launchEnvelope.seed),
    },
  };
}

function numericLaunchSeed(value: number | string): number {
  const seed = typeof value === "number" ? value : Number(value);
  if (!assessCiv7SignedIntSeed(seed).ok) {
    throw new Error("Swooper run manifest seed must be a supported integer.");
  }
  return seed;
}

async function bundleRunMapScript(
  args: Readonly<{
    source: string;
    sourceName: string;
  }>
): Promise<string> {
  const result = await build({
    stdin: {
      contents: args.source,
      loader: "ts",
      resolveDir: pkgRoot,
      sourcefile: args.sourceName,
    },
    bundle: true,
    write: false,
    format: "esm",
    target: "esnext",
    platform: "neutral",
    banner: { js: civ7MapScriptTextEncoderBanner },
    external: ["/base-standard/*"],
    absWorkingDir: pkgRoot,
    nodePaths: [resolve(pkgRoot, "node_modules")],
    plugins: [civ7TypeBoxCompatibilityPlugin],
  });
  const output = result.outputFiles[0];
  if (!output) throw new Error("Swooper run manifest bundler produced no map script.");
  return output.text;
}
