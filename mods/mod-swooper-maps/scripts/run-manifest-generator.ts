import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  civ7MapScriptTextEncoderBanner,
  civ7TypeBoxCompatibilityPlugin,
} from "@civ7/adapter/map-script-build";
import {
  readStudioRunGenerationManifest,
  runCorrelationForManifest,
  STUDIO_RUN_MAP_ROW_ID,
  STUDIO_RUN_MAP_SCRIPT_PATH,
} from "@civ7/studio-run-workspace";
import { build } from "esbuild";
import { admitStandardMapConfig } from "../src/maps/configs/canonical.js";
import {
  buildSwooperRunGeneratedModFilePlan,
  type SwooperMapArtifactFilePlan,
  type SwooperRunGeneratedModPlanInput,
} from "./map-artifacts/file-plan.js";
import { writeSwooperMapArtifactFilePlan } from "./map-artifacts/write-file-plan.js";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SWOOPER_STANDARD_RECIPE_ID = "standard";

export type SwooperRunGeneratedMod = Readonly<{
  requestId: string;
  runArtifactId: string;
  generatedModRoot: string;
  mapRowId: string;
  mapScriptPath: string;
  fileCount: number;
}>;

type StudioRunGenerationManifest = Awaited<ReturnType<typeof readStudioRunGenerationManifest>>;

/**
 * A deserialized manifest that has passed Swooper's Standard run verification.
 * `renderInput.config` comes from the same pure Swooper admission rule used for
 * a new source request. Repeating that rule here rejects malformed or
 * self-consistently rehashed manifest data without creating another semantic
 * owner or applying defaults.
 */
export type VerifiedSwooperStandardRun = Readonly<{
  manifest: StudioRunGenerationManifest;
  renderInput: SwooperRunGeneratedModPlanInput;
}>;

export async function generateSwooperRunGeneratedModFromManifestPath(
  manifestPath: string
): Promise<SwooperRunGeneratedMod> {
  const manifest = await readStudioRunGenerationManifest(manifestPath);
  const verifiedRun = verifySwooperStandardRunManifest(manifest);
  const { manifest: verifiedManifest, renderInput } = verifiedRun;
  const generatedModRoot = resolveSwooperRunGeneratedModRoot(manifestPath, verifiedManifest);
  const mapRowId = STUDIO_RUN_MAP_ROW_ID;
  const plan = buildSwooperRunGeneratedModFilePlan(renderInput);
  await writeSwooperMapArtifactFilePlan(plan, { outputRoot: generatedModRoot });

  const mapScriptPath = STUDIO_RUN_MAP_SCRIPT_PATH;
  const bundledMap = await bundleRunMapScript({
    generatedModRoot,
    correlation: renderInput.correlation,
  });
  await writeSwooperMapArtifactFilePlan(bundledMap, { outputRoot: generatedModRoot });

  return {
    requestId: verifiedManifest.payload.requestId,
    runArtifactId: verifiedManifest.payload.runArtifactId,
    generatedModRoot,
    mapRowId,
    mapScriptPath,
    fileCount: plan.files.length + bundledMap.files.length,
  };
}

export function resolveSwooperRunGeneratedModRoot(
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
  if (manifest.payload.launchEnvelope.canonicalConfig.recipe !== SWOOPER_STANDARD_RECIPE_ID) {
    throw new Error(
      `Swooper run manifest recipe envelope must be ${SWOOPER_STANDARD_RECIPE_ID}; got ${manifest.payload.launchEnvelope.canonicalConfig.recipe}.`
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
  if (!Number.isInteger(seed) || seed < 0 || seed > 0x7fff_ffff) {
    throw new Error("Swooper run manifest seed must be a supported integer.");
  }
  return seed;
}

async function bundleRunMapScript(
  args: Readonly<{
    generatedModRoot: string;
    correlation: ReturnType<typeof runCorrelationForManifest>;
  }>
): Promise<SwooperMapArtifactFilePlan> {
  const entryPoint = resolve(
    args.generatedModRoot,
    ".source/maps",
    `${args.correlation.runArtifactId}.ts`
  );
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    format: "esm",
    target: "esnext",
    platform: "neutral",
    banner: { js: civ7MapScriptTextEncoderBanner },
    external: ["/base-standard/*"],
    absWorkingDir: pkgRoot,
    nodePaths: [resolve(pkgRoot, "node_modules")],
    plugins: [
      {
        name: "workspace-package-resolution",
        setup(buildApi) {
          buildApi.onResolve({ filter: /^mod-swooper-maps\/recipes\/standard$/ }, () => ({
            path: resolve(pkgRoot, "src/recipes/standard/recipe.ts"),
          }));
        },
      },
      civ7TypeBoxCompatibilityPlugin,
    ],
  });
  const output = result.outputFiles[0];
  if (!output) throw new Error("Swooper run manifest bundler produced no map script.");

  return {
    metadata: { configProjections: [] },
    exclusiveSets: [
      {
        id: "generated-map-entrypoints",
        relativeDir: ".source/maps",
        fileExtension: ".ts",
        artifactKind: "generated-map-entry",
      },
    ],
    files: [
      {
        relativePath: STUDIO_RUN_MAP_SCRIPT_PATH,
        kind: "generated-map-entry",
        content: { kind: "text", text: output.text },
        markerMetadata: {
          configId: args.correlation.runArtifactId,
          configHash: "bundled",
          launchEnvelopeDigest: args.correlation.launchEnvelopeDigest,
          requestId: args.correlation.requestId,
        },
      },
    ],
  };
}

export function generatedModRelative(path: string): string {
  return relative(pkgRoot, path).replaceAll("\\", "/");
}
