import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import type { DeclarationEmission } from "../../src/declaration-emit.js";
import type { ModuleCatalog } from "../../src/module-catalog.js";
import type { MapScriptModuleResolution } from "../../src/module-resolution.js";
import { buildDeclarationProjectionReceipt } from "../../src/projection-receipt.js";
import type { RealmClosure, RealmProjection } from "../../src/realms.js";

const roots: string[] = [];

async function tempRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "civ7-projection-receipt-"));
  roots.push(root);
  return root;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function emptyClosure(realm: RealmClosure["realm"]): RealmClosure {
  return {
    realm,
    roots: [],
    declarationRootIds: [],
    moduleIds: [],
    nonDeclarationRoots: [],
  };
}

const catalog: ModuleCatalog = {
  sourceMaps: {
    mapCount: 1,
    embeddedTypeScriptSources: [
      {
        mapPath: "Base/modules/core/example.js.map",
        compiledPath: "Base/modules/core/example.js",
        sourcePath: "Base/modules/core/example.ts",
        sourceKind: "ts",
        sourceText: "export interface Example {}\n",
      },
    ],
    emptyCompiledMapPaths: [],
    ignoredEmbeddedSourceCount: 0,
  },
  declarationModules: [],
  declarationModuleIds: ["/core/example.js"],
  compiledModuleIds: ["/core/example.js"],
  compiledStylesheetPaths: [],
  solidTypeEvidence: {
    packageName: "solid-js",
    version: "1.9.5",
    sourceMapPaths: [
      "Base/modules/core/vendor/solid-js/dist/solid.js.map",
      "Base/modules/core/vendor/solid-js/store/dist/store.js.map",
      "Base/modules/core/vendor/solid-js/web/dist/web.js.map",
    ],
    embeddedSourcePaths: [],
  },
};

const declarations: DeclarationEmission = {
  compiler: { name: "typescript", version: "6.0.3" },
  shards: [
    {
      virtualId: "/core/example.js",
      outputFileName: "Base__modules__core__example.d.ts",
      evidenceKind: "embedded-typescript",
      sourcePath: "Base/modules/core/example.ts",
      text: "export interface Example {}\n",
      diagnostics: [],
      edges: [],
      runtimeStylesheetImports: [],
      anyKeywordCount: 0,
      globalAugmentationCount: 0,
    },
  ],
  diagnostics: [],
  edges: [],
  runtimeStylesheetImports: [
    {
      fromVirtualId: "/core/example.js",
      originalSpecifier: "./example.scss",
      sourcePath: "Base/modules/core/example.ts",
      mapPath: "Base/modules/core/example.js.map",
      stylesheetPath: "Base/modules/core/example.css",
    },
  ],
  unresolvedTargets: [],
  anyKeywordCount: 0,
  globalAugmentationCount: 0,
};

const realms: RealmProjection = {
  rootEvidence: [],
  shell: emptyClosure("shell"),
  game: emptyClosure("game"),
  map: emptyClosure("map"),
};

const mapScriptResolution: MapScriptModuleResolution = {
  rootIds: ["/base-standard/maps/example.js"],
  modules: [
    {
      virtualId: "/base-standard/maps/example.js",
      declarationPath: "./generated/modules/Base__modules__base-standard__maps__example.d.ts",
    },
  ],
  config: {
    compilerOptions: {
      paths: {
        "/base-standard/maps/example.js": [
          "./generated/modules/Base__modules__base-standard__maps__example.d.ts",
        ],
      },
    },
  },
};

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("declaration projection receipt", () => {
  test("pins the exact source receipt text in addition to its snapshot digest", async () => {
    const root = await tempRoot();
    const sourceReceipt = {
      profile: { id: "civ7-official-api-v1" },
      snapshot: { sha256: "snapshot-digest", fileCount: 3, totalBytes: 123 },
      source: {
        application: { longVersion: "Civilization VII fixture" },
        steam: { buildId: "fixture-build" },
      },
    };
    const prettyText = `${JSON.stringify(sourceReceipt, null, 2)}\n`;
    await mkdir(root, { recursive: true });
    await writeFile(join(root, ".civ7-source-receipt.json"), prettyText);
    const pretty = await buildDeclarationProjectionReceipt(
      root,
      catalog,
      declarations,
      realms,
      mapScriptResolution
    );
    expect(pretty.schemaVersion).toBe(4);
    expect(pretty.emission.runtimeStylesheetImports).toEqual(declarations.runtimeStylesheetImports);
    expect(pretty.sourceSnapshot.sourceReceiptSha256).toBe(sha256(prettyText));
    expect(pretty.moduleResolution.mapScript).toEqual({
      path: "map-resolution.json",
      rootIds: mapScriptResolution.rootIds,
      moduleIds: ["/base-standard/maps/example.js"],
      sha256: sha256(`${JSON.stringify(mapScriptResolution.config, null, 2)}\n`),
    });

    const compactText = JSON.stringify(sourceReceipt);
    await writeFile(join(root, ".civ7-source-receipt.json"), compactText);
    const compact = await buildDeclarationProjectionReceipt(
      root,
      catalog,
      declarations,
      realms,
      mapScriptResolution
    );
    expect(compact.sourceSnapshot.sha256).toBe(pretty.sourceSnapshot.sha256);
    expect(compact.sourceSnapshot.sourceReceiptSha256).toBe(sha256(compactText));
    expect(compact.sourceSnapshot.sourceReceiptSha256).not.toBe(
      pretty.sourceSnapshot.sourceReceiptSha256
    );
  });
});
