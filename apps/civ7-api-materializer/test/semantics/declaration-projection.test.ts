import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { afterEach, describe, expect, test } from "vitest";
import { emitBaseDeclarationProjection } from "../../src/declaration-emit.js";
import { buildBaseModuleCatalog } from "../../src/module-catalog.js";
import { collectBaseSourceMapEvidence } from "../../src/source-maps.js";

const roots: string[] = [];
const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");

async function tempRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "civ7-declaration-projection-"));
  roots.push(root);
  return root;
}

async function write(root: string, path: string, contents: string): Promise<void> {
  const absolutePath = join(root, path);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, contents);
}

function sourceMap(source: string, sourceText: string): string {
  return JSON.stringify({ version: 3, sources: [source], sourcesContent: [sourceText] });
}

async function writeCompiledSource(
  root: string,
  compiledPath: string,
  sourcePath: string,
  sourceText: string
): Promise<void> {
  await write(root, compiledPath, "export {};\n");
  await write(root, `${compiledPath}.map`, sourceMap(sourcePath, sourceText));
}

async function writeSolidEvidence(root: string): Promise<void> {
  const maps = [
    [
      "Base/modules/core/vendor/solid-js/dist/solid.js.map",
      "../../../../../node_modules/.pnpm/solid-js@1.9.5/node_modules/solid-js/dist/solid.js",
    ],
    [
      "Base/modules/core/vendor/solid-js/store/dist/store.js.map",
      "../../../../../../node_modules/.pnpm/solid-js@1.9.5/node_modules/solid-js/store/dist/store.js",
    ],
    [
      "Base/modules/core/vendor/solid-js/web/dist/web.js.map",
      "../../../../../../node_modules/.pnpm/solid-js@1.9.5/node_modules/solid-js/web/dist/web.js",
    ],
  ] as const;
  for (const [mapPath, embeddedPath] of maps) {
    await write(root, mapPath, sourceMap(embeddedPath, "export {};\n"));
  }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("Base source-map declaration evidence", () => {
  test("canonicalizes one embedded TS/TSX source per declaration map", async () => {
    const root = await tempRoot();
    await writeCompiledSource(
      root,
      "Base/modules/core/ui/example.js",
      "../../../modules/core/ui/example.ts",
      "export interface Example { value: string }\n"
    );
    await writeCompiledSource(
      root,
      "Base/modules/core/ui/view.js",
      "view.tsx",
      "export interface ViewProps { title: string }\n"
    );
    await write(
      root,
      "Base/modules/core/ui/style.scss.js.map",
      sourceMap("style.scss?url", ".style {}\n")
    );

    const evidence = await collectBaseSourceMapEvidence(root);
    expect(evidence.embeddedTypeScriptSources).toMatchObject([
      { sourcePath: "Base/modules/core/ui/example.ts", sourceKind: "ts" },
      { sourcePath: "Base/modules/core/ui/view.tsx", sourceKind: "tsx" },
    ]);
    expect(evidence.ignoredEmbeddedSourceCount).toBe(1);
  });

  test("rejects Base escapes, multi-source declaration maps, and canonical collisions", async () => {
    const escaping = await tempRoot();
    await write(
      escaping,
      "Base/modules/core/escape.js.map",
      sourceMap("../../../../outside.ts", "export {};\n")
    );
    await expect(collectBaseSourceMapEvidence(escaping)).rejects.toThrow(
      "escapes the official Base root"
    );

    const multiple = await tempRoot();
    await write(
      multiple,
      "Base/modules/core/multiple.js.map",
      JSON.stringify({
        version: 3,
        sources: ["first.ts", "second.ts"],
        sourcesContent: ["export {};\n", "export {};\n"],
      })
    );
    await expect(collectBaseSourceMapEvidence(multiple)).rejects.toThrow(
      "exactly one embedded TS/TSX source"
    );

    const collision = await tempRoot();
    await write(
      collision,
      "Base/modules/core/first.js.map",
      sourceMap("same.ts", "export const first = 1;\n")
    );
    await write(
      collision,
      "Base/modules/core/second.js.map",
      sourceMap("same.ts", "export const second = 2;\n")
    );
    await expect(collectBaseSourceMapEvidence(collision)).rejects.toThrow(
      "Embedded source path collision"
    );
  });
});

describe("declaration emission", () => {
  test("records extracted SCSS evidence without retaining runtime styles in declarations", async () => {
    const root = await tempRoot();
    await writeSolidEvidence(root);
    await writeCompiledSource(
      root,
      "Base/modules/core/ui/root.js",
      "root.ts",
      [
        'import "./root.scss";',
        'import "#core/ui/themes/default.scss";',
        'import "#base/ui/game.scss";',
        'import "./behavior.js";',
        "export interface Root { ready: boolean }",
      ].join("\n")
    );
    const stylesheetPaths = [
      "Base/modules/core/ui/root.css",
      "Base/modules/core/ui/themes/default.css",
      "Base/modules/base-standard/ui/game.css",
    ];
    for (const stylesheetPath of stylesheetPaths) await write(root, stylesheetPath, ".root {}\n");
    await write(root, "Base/modules/core/ui/behavior.js", "globalThis.ready = true;\n");

    const catalog = await buildBaseModuleCatalog(root);
    const emission = emitBaseDeclarationProjection(catalog);
    const shard = emission.shards[0];
    expect(emission.shards).toHaveLength(1);
    expect(shard?.text).toContain('import "/core/ui/behavior.js";');
    expect(shard?.text).toContain("export interface Root");
    expect(shard?.text).not.toContain(".scss");
    expect(shard?.text).not.toContain(".css");
    expect(emission.anyKeywordCount).toBe(0);
    expect(emission.unresolvedTargets).toEqual([]);
    expect(emission.edges).toMatchObject([
      { originalSpecifier: "./behavior.js", status: "compiled-only" },
    ]);
    expect(emission.runtimeStylesheetImports).toEqual(
      ["./root.scss", "#core/ui/themes/default.scss", "#base/ui/game.scss"].map(
        (originalSpecifier, index) => ({
          fromVirtualId: "/core/ui/root.js",
          originalSpecifier,
          sourcePath: "Base/modules/core/ui/root.ts",
          mapPath: "Base/modules/core/ui/root.js.map",
          stylesheetPath: stylesheetPaths[index],
        })
      )
    );
    expect(shard?.runtimeStylesheetImports).toEqual(emission.runtimeStylesheetImports);
    expect(emitBaseDeclarationProjection(catalog)).toEqual(emission);
    expect(catalog.sourceMaps.embeddedTypeScriptSources[0]?.sourceText).toContain("./root.scss");
  });

  test("preserves module scope when SCSS is the only retained import", async () => {
    const root = await tempRoot();
    await writeSolidEvidence(root);
    await writeCompiledSource(
      root,
      "Base/modules/core/root.js",
      "root.ts",
      'import "./root.scss"; declare global { interface Window { ready: boolean } }\n'
    );
    await write(root, "Base/modules/core/root.css", ".root {}\n");

    const emission = emitBaseDeclarationProjection(await buildBaseModuleCatalog(root));
    const shard = emission.shards[0];
    expect(shard?.text).toContain("export {};");
    expect(shard?.text).toContain("declare global");
    expect(emission.globalAugmentationCount).toBe(1);
    expect(emission.anyKeywordCount).toBe(0);
  });

  test.each([
    ['import "./missing.scss";', "no compiled CSS evidence"],
    ['import "./root.css";', "does not identify JavaScript"],
    ['import "./unknown.svg";', "does not identify JavaScript"],
    ['import "unknown-package";', "Unsupported retained declaration module specifier"],
    ['import "unknown-package/root.scss";', "Unsupported runtime stylesheet import"],
    ['import styles from "./root.scss"; export { styles };', "does not identify JavaScript"],
    ['export type Styles = typeof import("./root.scss");', "does not identify JavaScript"],
    ['export * from "./root.scss";', "does not identify JavaScript"],
    [
      'import "./root.scss" with { type: "unknown" };',
      "Unsupported runtime stylesheet import attributes",
    ],
  ])("refuses unsupported declaration evidence: %s", async (sourceText, error) => {
    const root = await tempRoot();
    await writeSolidEvidence(root);
    await writeCompiledSource(root, "Base/modules/core/root.js", "root.ts", sourceText);
    await write(root, "Base/modules/core/root.css", ".root {}\n");

    const catalog = await buildBaseModuleCatalog(root);
    expect(() => emitBaseDeclarationProjection(catalog)).toThrow(error);
  });

  test("preserves official declaration types and retains ordered diagnostics", async () => {
    const root = await tempRoot();
    await writeSolidEvidence(root);
    await writeCompiledSource(
      root,
      "Base/modules/core/thing.js",
      "thing.ts",
      [
        "export class Thing {}",
        "export type Callback = (",
        "  /** The value. */",
        "  value: string,",
        "  /** The optional count. */",
        "  count?: number,",
        ") => void;",
        "declare global {",
        "  interface Window { thing: Thing; loose: any }",
        "}",
        "",
      ].join("\n")
    );
    await writeCompiledSource(
      root,
      "Base/modules/core/widget.js",
      "widget.tsx",
      "export interface Widget { label: string }\n"
    );
    await writeCompiledSource(
      root,
      "Base/modules/core/consumer.js",
      "consumer.ts",
      [
        "export function first(value) { return value; }",
        'export type ThingAlias = import("./thing.js").Thing;',
        'export type WidgetAlias = import("#core/widget.jsx").Widget;',
        'export type Missing = import("#base/missing.js").Missing;',
        'export type SideEffect = typeof import("./side-effect.js");',
        'export type SolidAccessor = import("solid-js").Accessor<string>;',
        "",
      ].join("\n")
    );
    await write(root, "Base/modules/core/side-effect.js", "globalThis.sideEffect = true;\n");
    await write(root, "Base/modules/core/index.js", 'export { Thing } from "./thing.js";\n');
    await write(
      root,
      "Base/modules/core/index.js.map",
      JSON.stringify({ version: 3, sources: [], sourcesContent: [] })
    );

    const catalog = await buildBaseModuleCatalog(root);
    const emission = emitBaseDeclarationProjection(catalog);
    expect(catalog.solidTypeEvidence.version).toBe("1.9.5");
    expect(emission.shards.every((shard) => !/[ \t]+$/m.test(shard.text))).toBe(true);
    expect(
      catalog.declarationModules.filter((module) => module.evidenceKind === "compiled-barrel")
    ).toHaveLength(1);
    expect(emission.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([9007, 9011]);
    expect(emission.anyKeywordCount).toBe(3);

    const consumer = emission.shards.find((shard) => shard.virtualId === "/core/consumer.js");
    expect(consumer?.text).toContain('import("/core/thing.js")');
    expect(consumer?.text).toContain('import("/core/widget.js")');
    expect(consumer?.text).toContain('import("/base-standard/missing.js")');
    expect(consumer?.text).toContain('import("solid-js")');
    expect(consumer?.text).toContain("first(value: any): any");
    expect(consumer?.outputFileName).toBe("Base__modules__core__consumer.d.ts");

    const thing = emission.shards.find((shard) => shard.virtualId === "/core/thing.js");
    expect(thing?.text).toContain("export declare class Thing");
    expect(thing?.text).toContain("declare global");
    expect(thing?.text).toContain("loose: any");
    expect(thing?.text).not.toContain('declare module "/core/thing.js"');
    expect(emission.globalAugmentationCount).toBe(1);

    const barrel = emission.shards.find((shard) => shard.virtualId === "/core/index.js");
    expect(barrel?.text).toContain('from "/core/thing.js"');
    expect(emission.unresolvedTargets.map((target) => target.targetVirtualId)).toEqual([
      "/base-standard/missing.js",
    ]);
    expect(
      emission.edges.find((edge) => edge.targetVirtualId === "/core/side-effect.js")?.status
    ).toBe("compiled-only");
  });

  test("resolves the pinned Solid declarations from a real realm program", () => {
    const entry = join(repoRoot, "packages/civ7-api/src/app-ui-shell.d.ts");
    const program = ts.createProgram({
      rootNames: [entry],
      options: {
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        strict: true,
        target: ts.ScriptTarget.ES2022,
      },
    });
    const solidDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n").includes("solid-js")
      );

    expect(solidDiagnostics).toEqual([]);
    expect(
      program
        .getSourceFiles()
        .some((sourceFile) => sourceFile.fileName.includes("/solid-js/types/index.d.ts"))
    ).toBe(true);
  });
});
