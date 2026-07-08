import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readStudioRunGenerationManifest,
  runCorrelationForManifest,
} from "@civ7/studio-run-workspace";
import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { build } from "esbuild";
import {
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../src/maps/configs/canonical.js";
import { STANDARD_STAGES } from "../src/recipes/standard/recipe.js";
import {
  buildSwooperRunGeneratedModFilePlan,
  runMapRowIdForArtifact,
  type SwooperMapArtifactFilePlan,
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

export async function generateSwooperRunGeneratedModFromManifestPath(
  manifestPath: string
): Promise<SwooperRunGeneratedMod> {
  const manifest = await readStudioRunGenerationManifest(manifestPath);
  assertSwooperStandardRunManifest(manifest);
  const generatedModRoot = resolveSwooperRunGeneratedModRoot(manifestPath, manifest);
  const mapRowId = runMapRowIdForArtifact(manifest.payload.runArtifactId);
  const config = validatedRunConfigFromManifest(manifest, mapRowId);
  const plan = buildSwooperRunGeneratedModFilePlan({
    selectedConfigId: manifest.payload.request.selectedConfigId,
    correlation: runCorrelationForManifest(manifest),
    config,
    seed: manifest.payload.request.seed,
  });
  await writeSwooperMapArtifactFilePlan(plan, { outputRoot: generatedModRoot });

  const mapScriptPath = `maps/${manifest.payload.runArtifactId}.js`;
  const bundledMap = await bundleRunMapScript({
    generatedModRoot,
    runArtifactId: manifest.payload.runArtifactId,
  });
  await writeSwooperMapArtifactFilePlan(bundledMap, { outputRoot: generatedModRoot });

  return {
    requestId: manifest.payload.requestId,
    runArtifactId: manifest.payload.runArtifactId,
    generatedModRoot,
    mapRowId,
    mapScriptPath,
    fileCount: plan.files.length + bundledMap.files.length,
  };
}

export function resolveSwooperRunGeneratedModRoot(
  manifestPath: string,
  manifest: Awaited<ReturnType<typeof readStudioRunGenerationManifest>>
): string {
  return resolve(dirname(manifestPath), manifest.payload.workspace.generatedModRoot);
}

function validatedRunConfigFromManifest(
  manifest: Awaited<ReturnType<typeof readStudioRunGenerationManifest>>,
  mapRowId: string
): ValidatedMapConfig {
  const recipeSchema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const envelope = manifest.payload.launchEnvelope;
  const validated = validateCanonicalMapConfig({
    fileName: `${mapRowId}.config.json`,
    raw: {
      id: mapRowId,
      name: envelope.source.label,
      description: envelope.source.description ?? "Generated Studio Run in Game map",
      recipe: "standard",
      sortIndex: envelope.source.sortIndex,
      ...(envelope.source.latitudeBounds === undefined
        ? {}
        : { latitudeBounds: envelope.source.latitudeBounds }),
      config: envelope.config,
    },
    recipeSchema,
    stages: STANDARD_STAGES,
  });
  return {
    ...validated,
    outputFile: `${manifest.payload.runArtifactId}.js`,
  };
}

function assertSwooperStandardRunManifest(
  manifest: Awaited<ReturnType<typeof readStudioRunGenerationManifest>>
): void {
  if (manifest.payload.request.recipeId !== SWOOPER_STANDARD_RECIPE_ID) {
    throw new Error(
      `Swooper run manifest generator only supports ${SWOOPER_STANDARD_RECIPE_ID}; got ${manifest.payload.request.recipeId}.`
    );
  }
  if (manifest.payload.launchEnvelope.recipeSettings.recipe !== SWOOPER_STANDARD_RECIPE_ID) {
    throw new Error(
      `Swooper run manifest recipe envelope must be ${SWOOPER_STANDARD_RECIPE_ID}; got ${manifest.payload.launchEnvelope.recipeSettings.recipe}.`
    );
  }
}

async function bundleRunMapScript(
  args: Readonly<{
    generatedModRoot: string;
    runArtifactId: string;
  }>
): Promise<SwooperMapArtifactFilePlan> {
  const entryPoint = resolve(args.generatedModRoot, ".source/maps", `${args.runArtifactId}.ts`);
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
        relativePath: `maps/${args.runArtifactId}.js`,
        kind: "generated-map-entry",
        content: { kind: "text", text: output.text },
        markerMetadata: {
          configId: args.runArtifactId,
          configHash: "bundled",
          envelopeHash: "bundled",
        },
      },
    ],
  };
}

export function generatedModRelative(path: string): string {
  return relative(pkgRoot, path).replaceAll("\\", "/");
}
