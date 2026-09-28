import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import type { DeclarationEdge } from "../../src/declaration-emit.js";
import type { ModuleCatalog } from "../../src/module-catalog.js";
import { projectDeclarationRealms } from "../../src/realms.js";

const roots: string[] = [];

async function tempRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "civ7-realms-"));
  roots.push(root);
  return root;
}

async function write(root: string, path: string, contents: string): Promise<void> {
  const absolutePath = join(root, path);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, contents);
}

function mapConfig(rowCount = 12): string {
  const rows = Array.from(
    { length: rowCount },
    (_, index) => `    <Row File="{base-standard}maps/map-${index}.js" />`
  ).join("\n");
  return `<?xml version="1.0"?>\n<Database>\n  <Maps>\n${rows}\n  </Maps>\n</Database>\n`;
}

function catalog(): ModuleCatalog {
  const mapIds = Array.from({ length: 12 }, (_, index) => `/base-standard/maps/map-${index}.js`);
  const declarationModuleIds = [
    ...mapIds,
    "/core/game-child.js",
    "/core/game-root.js",
    "/core/leaf.js",
    "/core/not-reached.js",
    "/core/shared.js",
    "/core/shell-root.js",
  ].sort();
  return {
    sourceMaps: {
      mapCount: 0,
      embeddedTypeScriptSources: [],
      emptyCompiledMapPaths: [],
      ignoredEmbeddedSourceCount: 0,
    },
    declarationModules: [],
    declarationModuleIds,
    compiledModuleIds: [...declarationModuleIds, "/core/compiled-root.js"].sort(),
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
}

function edge(fromVirtualId: string, targetVirtualId: string): DeclarationEdge {
  return {
    fromVirtualId,
    originalSpecifier: targetVirtualId,
    rewrittenSpecifier: targetVirtualId,
    targetVirtualId,
    status: "declaration",
  };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("official declaration realms", () => {
  test("uses only modinfo actions and exact map rows, then follows declaration edges", async () => {
    const root = await tempRoot();
    await write(
      root,
      "Base/modules/core/core.modinfo",
      [
        '<?xml version="1.0"?>',
        '<Mod id="core">',
        "  <ActionGroups>",
        '    <ActionGroup id="core-shell" scope="shell">',
        "      <Actions>",
        "        <UIScripts>",
        "          <Item>shell-root.js</Item>",
        "          <Item>compiled-root.js</Item>",
        "        </UIScripts>",
        "        <ImportFiles><Item>ignored.html</Item></ImportFiles>",
        "      </Actions>",
        "    </ActionGroup>",
        '    <ActionGroup id="core-game" scope="game">',
        "      <Actions><ImportFiles><Item>game-root.js</Item></ImportFiles></Actions>",
        "    </ActionGroup>",
        "  </ActionGroups>",
        "</Mod>",
        "",
      ].join("\n")
    );
    await write(root, "Base/modules/base-standard/config/config.xml", mapConfig());

    const realms = await projectDeclarationRealms(root, catalog(), [
      edge("/core/shell-root.js", "/core/shared.js"),
      edge("/core/shared.js", "/core/leaf.js"),
      edge("/core/game-root.js", "/core/game-child.js"),
      edge("/base-standard/maps/map-0.js", "/core/shared.js"),
      edge("/core/not-reached.js", "/core/leaf.js"),
    ]);

    expect(realms.shell.declarationRootIds).toEqual(["/core/shell-root.js"]);
    expect(realms.shell.moduleIds).toEqual([
      "/core/leaf.js",
      "/core/shared.js",
      "/core/shell-root.js",
    ]);
    expect(realms.shell.nonDeclarationRoots).toMatchObject([
      { virtualId: "/core/compiled-root.js", status: "compiled-only" },
    ]);
    expect(realms.game.moduleIds).toEqual(["/core/game-child.js", "/core/game-root.js"]);
    expect(realms.map.roots).toHaveLength(12);
    expect(realms.map.moduleIds).toHaveLength(14);
    expect(realms.map.moduleIds).toContain("/core/leaf.js");
    expect(realms.shell.moduleIds).not.toContain("/core/not-reached.js");
    expect(realms.rootEvidence).not.toContainEqual(
      expect.objectContaining({ item: "ignored.html" })
    );
  });

  test("rejects a Base config that no longer has the twelve exact map rows", async () => {
    const root = await tempRoot();
    await write(root, "Base/modules/base-standard/config/config.xml", mapConfig(11));
    await expect(projectDeclarationRealms(root, catalog(), [])).rejects.toThrow(
      "exactly 12 map rows"
    );
  });
});
