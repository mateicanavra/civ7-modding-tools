import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import type { DeclarationEmission } from "../../src/declaration-emit.js";
import type { ModuleCatalog } from "../../src/module-catalog.js";
import type { MapScriptModuleResolution } from "../../src/module-resolution.js";
import {
  assertOfficialProjectionProfile,
  buildDeclarationProjectionReceipt,
} from "../../src/projection-receipt.js";
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
  nonScriptMaps: [
    {
      evidenceKind: "base-standard-config",
      disposition: "non-script-map",
      evidencePath: "Base/modules/base-standard/config/config.xml",
      rowIndex: 7,
      file: "{base-standard}maps/EarthMaps/Earth_Huge.Civ7Map",
      assetPath: "Base/modules/base-standard/maps/EarthMaps/Earth_Huge.Civ7Map",
      size: 3,
      sha256: sha256("map"),
    },
  ],
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
    expect(pretty.schemaVersion).toBe(5);
    expect(pretty.modules.compiledImportBarrelCount).toBe(0);
    expect(pretty.emission.runtimeStylesheetImports).toEqual(declarations.runtimeStylesheetImports);
    expect(pretty.realms.nonScriptMaps).toEqual(realms.nonScriptMaps);
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

    const withoutAsset = await buildDeclarationProjectionReceipt(
      root,
      catalog,
      declarations,
      { ...realms, nonScriptMaps: [] },
      mapScriptResolution
    );
    expect(withoutAsset.realms.sha256).not.toBe(compact.realms.sha256);
  });
});

describe("current official declaration profile", () => {
  const currentCatalog: ModuleCatalog = {
    ...catalog,
    sourceMaps: {
      ...catalog.sourceMaps,
      mapCount: 1433,
      embeddedTypeScriptSources: Array.from({ length: 960 }, (_, index) => ({
        ...catalog.sourceMaps.embeddedTypeScriptSources[0]!,
        sourceKind: index < 716 ? "ts" : "tsx",
      })),
    },
    declarationModules: [
      ...Array.from({ length: 3 }, (_, index) => ({
        evidenceKind: "compiled-barrel" as const,
        virtualId: `/core/barrel-${index}.js`,
        compiledPath: `Base/modules/core/barrel-${index}.js`,
        mapPath: `Base/modules/core/barrel-${index}.js.map`,
        reexports: [],
      })),
      ...Array.from({ length: 2 }, (_, index) => ({
        evidenceKind: "compiled-import-barrel" as const,
        virtualId: `/core/loader-${index}.js`,
        compiledPath: `Base/modules/core/loader-${index}.js`,
        mapPath: `Base/modules/core/loader-${index}.js.map`,
        imports: [],
      })),
    ],
  };
  const currentDeclarations: DeclarationEmission = {
    ...declarations,
    unresolvedTargets: Array.from({ length: 5 }, (_, index) => ({
      targetVirtualId: `/core/absent-${index}.js`,
      edges: [],
    })),
  };
  const currentRealms: RealmProjection = {
    ...realms,
    map: {
      ...realms.map,
      roots: Array.from({ length: 14 }, (_, index) => ({
        evidenceKind: "base-standard-config",
        realm: "map",
        virtualId: `/base-standard/maps/map-${index}.js`,
        status: "declaration",
        evidencePath: "Base/modules/base-standard/config/config.xml",
        rowIndex: index,
        file: `{base-standard}maps/map-${index}.js`,
      })),
    },
  };

  test("admits the reviewed 1.5 counts", () => {
    expect(() =>
      assertOfficialProjectionProfile(currentCatalog, currentDeclarations, currentRealms)
    ).not.toThrow();
  });

  test("refuses stale or changed source-map counts", () => {
    for (const mapCount of [1419, 1434]) {
      expect(() =>
        assertOfficialProjectionProfile(
          { ...currentCatalog, sourceMaps: { ...currentCatalog.sourceMaps, mapCount } },
          currentDeclarations,
          currentRealms
        )
      ).toThrow(`expected 1433 source maps; found ${mapCount}`);
    }
  });

  test("refuses the stale 940-source declaration split", () => {
    expect(() =>
      assertOfficialProjectionProfile(
        {
          ...currentCatalog,
          sourceMaps: {
            ...currentCatalog.sourceMaps,
            embeddedTypeScriptSources: Array.from({ length: 940 }, (_, index) => ({
              ...catalog.sourceMaps.embeddedTypeScriptSources[0]!,
              sourceKind: index < 715 ? "ts" : "tsx",
            })),
          },
        },
        currentDeclarations,
        currentRealms
      )
    ).toThrow("expected 960 sources (716 TS, 244 TSX); found 940 (715 TS, 225 TSX)");
  });

  test("counts only the fourteen JavaScript map roots", () => {
    expect(() =>
      assertOfficialProjectionProfile(currentCatalog, currentDeclarations, {
        ...currentRealms,
        map: { ...currentRealms.map, roots: currentRealms.map.roots.slice(0, 12) },
      })
    ).toThrow("expected 14; found 12");
  });

  test("requires both source-backed import-only realm loaders", () => {
    expect(() =>
      assertOfficialProjectionProfile(
        {
          ...currentCatalog,
          declarationModules: currentCatalog.declarationModules.filter(
            (module) => module.evidenceKind !== "compiled-import-barrel"
          ),
        },
        currentDeclarations,
        currentRealms
      )
    ).toThrow("expected 2 compiled import barrels; found 0");
  });
});
