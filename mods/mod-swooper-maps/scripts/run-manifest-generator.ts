import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readStudioRunGenerationManifest,
  runCorrelationForManifest,
  STUDIO_RUN_MAP_ROW_ID,
  STUDIO_RUN_MAP_SCRIPT_PATH,
} from "@civ7/studio-run-workspace";
import { build } from "esbuild";
import { admitSwooperCatalogConfig } from "../src/maps/catalog/admission.js";
import { admitStandardMapConfig } from "../src/maps/configs/canonical.js";
import {
  buildSwooperRunGeneratedModFilePlan,
  type SwooperMapArtifactFilePlan,
  type SwooperRunGeneratedModPlanInput,
} from "./map-artifacts/file-plan.js";
import { writeSwooperMapArtifactFilePlan } from "./map-artifacts/write-file-plan.js";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const typeboxFormatShim = resolve(
  pkgRoot,
  "../../packages/mapgen-core/src/shims/typebox-format.ts"
);
const typeboxGuardEmitShim = resolve(
  pkgRoot,
  "../../packages/mapgen-core/src/shims/typebox-guard-emit.ts"
);
const SWOOPER_STANDARD_RECIPE_ID = "mod-swooper-maps/standard";

const civ7TextEncoderBootstrap = `
if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = class TextEncoder {
    constructor() {
      this.encoding = "utf-8";
    }
    encode(input = "") {
      const bytes = [];
      const value = String(input);
      for (let i = 0; i < value.length; i++) {
        let codePoint = value.codePointAt(i);
        if (codePoint === undefined) continue;
        if (codePoint > 0xffff) i++;
        if (codePoint <= 0x7f) {
          bytes.push(codePoint);
        } else if (codePoint <= 0x7ff) {
          bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
        } else if (codePoint <= 0xffff) {
          bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        } else {
          bytes.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        }
      }
      return new Uint8Array(bytes);
    }
    encodeInto(source, destination) {
      const encoded = this.encode(source);
      const writeLength = Math.min(encoded.length, destination.length);
      for (let i = 0; i < writeLength; i++) destination[i] = encoded[i];
      return { read: String(source).length, written: writeLength };
    }
  };
}
`;

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
  if (manifest.payload.launchEnvelope.recipeSettings.recipe !== SWOOPER_STANDARD_RECIPE_ID) {
    throw new Error(
      `Swooper run manifest recipe envelope must be ${SWOOPER_STANDARD_RECIPE_ID}; got ${manifest.payload.launchEnvelope.recipeSettings.recipe}.`
    );
  }
  const source = manifest.payload.launchEnvelope.source;
  const config =
    source.kind === "catalog"
      ? admitSwooperCatalogConfig({
          sourcePath: source.sourcePath,
          canonicalConfig: source.canonicalConfig,
        }).canonicalConfig
      : admitStandardMapConfig(source.canonicalConfig);
  return {
    manifest,
    renderInput: {
      correlation: runCorrelationForManifest(manifest),
      config,
      seed: numericLaunchSeed(manifest.payload.launchEnvelope.recipeSettings.seed),
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
    banner: { js: civ7TextEncoderBootstrap },
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
      {
        name: "typebox-format-shim",
        setup(buildApi) {
          buildApi.onResolve({ filter: /^typebox\/format$/ }, () => ({
            path: typeboxFormatShim,
          }));
          buildApi.onResolve({ filter: /format[/\\]index\.mjs$/ }, (resolveArgs) => {
            if (
              resolveArgs.importer.includes("/typebox/") ||
              resolveArgs.importer.includes("\\typebox\\")
            ) {
              return { path: typeboxFormatShim };
            }
            return undefined;
          });
          buildApi.onResolve({ filter: /(^|[/\\])emit\.mjs$/ }, (resolveArgs) => {
            if (
              resolveArgs.path.endsWith("emit.mjs") &&
              (resolveArgs.importer.includes("/typebox/build/guard/") ||
                resolveArgs.importer.includes("\\typebox\\build\\guard\\"))
            ) {
              return { path: typeboxGuardEmitShim };
            }
            return undefined;
          });
        },
      },
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
