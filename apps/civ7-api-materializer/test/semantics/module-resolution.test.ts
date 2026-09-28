import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { afterEach, describe, expect, test } from "vitest";
import type { DeclarationEdge, DeclarationEmission } from "../../src/declaration-emit.js";
import {
  CIV7_MAP_SCRIPT_MODULE_ROOT_IDS,
  projectMapScriptModuleResolution,
} from "../../src/module-resolution.js";

const roots: string[] = [];
const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");
const apiRoot = join(repoRoot, "packages/civ7-api");

async function tempRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "civ7-map-resolution-"));
  roots.push(root);
  return root;
}

type DeclarationShard = DeclarationEmission["shards"][number];

function declarationEdge(
  fromVirtualId: string,
  targetVirtualId: string,
  status: "declaration" | "compiled-only" | "unresolved" = "declaration"
): DeclarationEdge {
  return {
    fromVirtualId,
    originalSpecifier: targetVirtualId,
    rewrittenSpecifier: targetVirtualId,
    targetVirtualId,
    status,
  };
}

function shard(
  virtualId: string,
  options: {
    readonly edges?: readonly DeclarationEdge[];
    readonly globalAugmentationCount?: number;
  } = {}
): DeclarationShard {
  const stem = virtualId.slice(1).replaceAll("/", "__").replace(/\.js$/, "");
  return {
    virtualId,
    outputFileName: `${stem}.d.ts`,
    evidenceKind: "embedded-typescript",
    sourcePath: `${stem}.ts`,
    text: "export {};\n",
    diagnostics: [],
    edges: options.edges ?? [],
    runtimeStylesheetImports: [],
    anyKeywordCount: 0,
    globalAugmentationCount: options.globalAugmentationCount ?? 0,
  };
}

function rootShards(overrides: ReadonlyMap<string, DeclarationShard> = new Map()) {
  return CIV7_MAP_SCRIPT_MODULE_ROOT_IDS.map(
    (virtualId) => overrides.get(virtualId) ?? shard(virtualId)
  );
}

function diagnosticsText(diagnostics: readonly ts.Diagnostic[]): string {
  return ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => repoRoot,
    getNewLine: () => "\n",
  });
}

function parseProject(configPath: string): ts.ParsedCommandLine {
  const loaded = ts.readConfigFile(configPath, ts.sys.readFile);
  if (loaded.error !== undefined) throw new Error(diagnosticsText([loaded.error]));
  return ts.parseJsonConfigFileContent(
    loaded.config,
    ts.sys,
    dirname(configPath),
    undefined,
    configPath
  );
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("Civ7 map-script module resolution", () => {
  test("selects only explicit roots and their declaration closure", () => {
    const dependencyId = "/base-standard/scripts/closure-dependency.js";
    const rootId = CIV7_MAP_SCRIPT_MODULE_ROOT_IDS[0];
    const face = projectMapScriptModuleResolution({
      shards: [
        ...rootShards(
          new Map([[rootId, shard(rootId, { edges: [declarationEdge(rootId, dependencyId)] })]])
        ),
        shard(dependencyId),
        shard("/base-standard/maps/unselected.js"),
      ],
    });

    expect(face.rootIds).toEqual(CIV7_MAP_SCRIPT_MODULE_ROOT_IDS);
    expect(face.modules.map((module) => module.virtualId)).toEqual(
      [...CIV7_MAP_SCRIPT_MODULE_ROOT_IDS, dependencyId].sort()
    );
    expect(face.config.compilerOptions.paths[dependencyId]).toEqual([
      "./generated/modules/base-standard__scripts__closure-dependency.d.ts",
    ]);
    expect(face.config.compilerOptions.paths["/base-standard/maps/unselected.js"]).toBeUndefined();
    expect("baseUrl" in face.config.compilerOptions).toBe(false);
  });

  test("refuses unresolved declaration edges and global augmentations", () => {
    const rootId = CIV7_MAP_SCRIPT_MODULE_ROOT_IDS[0];
    const unresolved = shard(rootId, {
      edges: [declarationEdge(rootId, "/base-standard/maps/missing.js", "unresolved")],
    });
    expect(() =>
      projectMapScriptModuleResolution({
        shards: rootShards(new Map([[rootId, unresolved]])),
      })
    ).toThrow("refuses unresolved edge");

    expect(() =>
      projectMapScriptModuleResolution({
        shards: rootShards(new Map([[rootId, shard(rootId, { globalAugmentationCount: 1 })]])),
      })
    ).toThrow("refuses global augmentation");
  });

  test("resolves every real absolute import through the exported TS6 config and no unlisted id", async () => {
    expect(ts.version).toBe("6.0.3");
    const root = await tempRoot();
    const packageDirectory = join(root, "node_modules/@civ7");
    await mkdir(packageDirectory, { recursive: true });
    await symlink(apiRoot, join(packageDirectory, "api"), "dir");
    await writeJson(join(root, "package.json"), { type: "module" });
    await writeFile(
      join(root, "globals.d.ts"),
      [
        "type float2 = { x: number; y: number };",
        "type float3 = { x: number; y: number; z: number };",
        "type float4 = { x: number; y: number; z: number; w: number };",
        "type TerrainType = number;",
        "type BiomeType = number;",
        "type FeatureType = number;",
        "type ResourceType = number;",
        // Native engine ambient, opaque here: this fixture tests resolution, not its fields.
        "interface ResourceDefinition { readonly __nativeResourceDefinition: unique symbol }",
        "interface ContinentBoundary { west: number; east: number; south: number; north: number }",
        "interface ParameterSpecGroup { readonly [key: string]: unknown }",
        "",
      ].join("\n")
    );
    await writeFile(
      join(root, "positive.ts"),
      [
        'import * as mapGlobals from "/base-standard/maps/map-globals.js";',
        'import { assignAdvancedStartRegions } from "/base-standard/maps/assign-advanced-start-region.js";',
        'import { assignStartPositions, chooseStartSectors } from "/base-standard/maps/assign-starting-plots.js";',
        'import { generateDiscoveries } from "/base-standard/maps/discovery-generator.js";',
        'import { expandCoasts, generateLakes } from "/base-standard/maps/elevation-terrain-generator.js";',
        'import { addFeatures, designateBiomes } from "/base-standard/maps/feature-biome-generator.js";',
        'import { needHumanNearEquator } from "/base-standard/maps/map-utilities.js";',
        'import * as resourceGenerator from "/base-standard/maps/resource-generator.js";',
        'import { prepareResourceSet } from "/base-standard/maps/resource-placement-common.js";',
        'import { generateSnow } from "/base-standard/maps/snow-generator.js";',
        'import { VoronoiUtils } from "/base-standard/scripts/voronoi-utils.js";',
        "void [",
        "  mapGlobals,",
        "  assignAdvancedStartRegions,",
        "  assignStartPositions,",
        "  chooseStartSectors,",
        "  generateDiscoveries,",
        "  expandCoasts,",
        "  generateLakes,",
        "  addFeatures,",
        "  designateBiomes,",
        "  needHumanNearEquator,",
        "  resourceGenerator,",
        "  prepareResourceSet,",
        "  generateSnow,",
        "  VoronoiUtils,",
        "];",
        "",
      ].join("\n")
    );
    const compilerOptions = {
      strict: true,
      noEmit: true,
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      types: [],
    };
    const positiveConfigPath = join(root, "tsconfig.json");
    await writeJson(positiveConfigPath, {
      extends: "@civ7/api/map-resolution",
      compilerOptions,
      files: ["globals.d.ts", "positive.ts"],
    });

    const positive = parseProject(positiveConfigPath);
    expect(diagnosticsText(positive.errors)).toBe("");
    expect(positive.options.baseUrl).toBeUndefined();
    expect(positive.options.skipLibCheck).not.toBe(true);
    const positiveProgram = ts.createProgram({
      rootNames: positive.fileNames,
      options: positive.options,
      projectReferences: positive.projectReferences,
    });
    expect(diagnosticsText(ts.getPreEmitDiagnostics(positiveProgram))).toBe("");

    const generatedConfig = JSON.parse(
      await readFile(join(apiRoot, "src/map-resolution.json"), "utf8")
    ) as { compilerOptions: { paths: Record<string, readonly [string]> } };
    const mappedShards = Object.values(generatedConfig.compilerOptions.paths).map(
      ([declaration]) => declaration
    );
    expect(Object.keys(generatedConfig.compilerOptions.paths)).toHaveLength(24);
    expect(Object.keys(generatedConfig.compilerOptions.paths).some((id) => id.includes("*"))).toBe(
      false
    );
    for (const declaration of mappedShards) {
      expect(
        positiveProgram
          .getSourceFiles()
          .some((sourceFile) => sourceFile.fileName.endsWith(declaration.slice(1)))
      ).toBe(true);
    }

    const unlistedId = "/base-standard/maps/natural-wonder-generator.js";
    expect(generatedConfig.compilerOptions.paths[unlistedId]).toBeUndefined();
    await access(
      join(
        apiRoot,
        "src/generated/modules/Base__modules__base-standard__maps__natural-wonder-generator.d.ts"
      )
    );
    await writeFile(
      join(root, "negative.ts"),
      `import { unlisted } from ${JSON.stringify(unlistedId)};\nvoid unlisted;\n`
    );
    const negativeConfigPath = join(root, "tsconfig.negative.json");
    await writeJson(negativeConfigPath, {
      extends: "@civ7/api/map-resolution",
      compilerOptions,
      files: ["globals.d.ts", "negative.ts"],
    });
    const negative = parseProject(negativeConfigPath);
    expect(diagnosticsText(negative.errors)).toBe("");
    expect(negative.options.baseUrl).toBeUndefined();
    expect(negative.options.skipLibCheck).not.toBe(true);
    const negativeProgram = ts.createProgram({
      rootNames: negative.fileNames,
      options: negative.options,
      projectReferences: negative.projectReferences,
    });
    const negativeDiagnostics = ts.getPreEmitDiagnostics(negativeProgram);
    expect(negativeDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([2307]);
    expect(diagnosticsText(negativeDiagnostics)).toContain(unlistedId);
  });
});
