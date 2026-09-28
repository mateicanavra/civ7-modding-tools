import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import type { DeclarationEdge } from "../../src/declaration-emit.js";
import type { ModuleCatalog } from "../../src/module-catalog.js";
import { projectDeclarationRealms } from "../../src/realms.js";

const roots: string[] = [];
const earthMapFile = "{base-standard}maps/EarthMaps/Earth_Huge.Civ7Map";
const earthMapPath = "Base/modules/base-standard/maps/EarthMaps/Earth_Huge.Civ7Map";
const earthMapBytes = "opaque map fixture\0";

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

function mapConfig(scriptCount = 14, nonScriptFiles: readonly string[] = [earthMapFile]): string {
  const files = Array.from(
    { length: scriptCount },
    (_, index) => `{base-standard}maps/map-${index}.js`
  );
  files.splice(7, 0, ...nonScriptFiles);
  const rows = files.map((file) => `    <Row File="${file}" />`).join("\n");
  return `<?xml version="1.0"?>\n<Database>\n  <Maps>\n${rows}\n  </Maps>\n</Database>\n`;
}

function catalog(): ModuleCatalog {
  const mapIds = Array.from({ length: 14 }, (_, index) => `/base-standard/maps/map-${index}.js`);
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
    await write(root, earthMapPath, earthMapBytes);

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
    expect(realms.map.roots).toHaveLength(14);
    expect(realms.map.moduleIds).toHaveLength(16);
    expect(realms.map.moduleIds).toContain("/core/leaf.js");
    expect(realms.shell.moduleIds).not.toContain("/core/not-reached.js");
    expect(realms.rootEvidence).not.toContainEqual(
      expect.objectContaining({ item: "ignored.html" })
    );
    expect(realms.nonScriptMaps).toEqual([
      {
        evidenceKind: "base-standard-config",
        disposition: "non-script-map",
        evidencePath: "Base/modules/base-standard/config/config.xml",
        rowIndex: 7,
        file: earthMapFile,
        assetPath: earthMapPath,
        size: Buffer.byteLength(earthMapBytes),
        sha256: createHash("sha256").update(earthMapBytes).digest("hex"),
      },
    ]);
    expect(realms.rootEvidence).not.toContainEqual(expect.objectContaining({ file: earthMapFile }));
    expect(realms.map.moduleIds.every((id) => id.endsWith(".js"))).toBe(true);
    expect(realms.map.roots[7]).toMatchObject({ rowIndex: 8 });
  });

  test("rejects the stale twelve-row corpus rather than admitting both profiles", async () => {
    const root = await tempRoot();
    await write(root, "Base/modules/base-standard/config/config.xml", mapConfig(12, []));
    await expect(projectDeclarationRealms(root, catalog(), [])).rejects.toThrow(
      "exactly 15 map rows"
    );
  });

  test("refuses fifteen JavaScript rows instead of the admitted mixed map corpus", async () => {
    const root = await tempRoot();
    await write(root, "Base/modules/base-standard/config/config.xml", mapConfig(15, []));
    await expect(projectDeclarationRealms(root, catalog(), [])).rejects.toThrow(
      "expected 14 JavaScript roots and 1 non-script map; found 15 and 0"
    );
  });

  test.each([
    "{base-standard}maps/EarthMaps/Other.Civ7Map",
    "{base-standard}maps/unknown.json",
    "{base-standard}maps/../Earth_Huge.Civ7Map",
    "{base-standard}../Earth_Huge.Civ7Map",
    "{base-standard}/maps/EarthMaps/Earth_Huge.Civ7Map",
    "{other}maps/EarthMaps/Earth_Huge.Civ7Map",
  ])("refuses unsupported or non-canonical map rows: %s", async (file) => {
    const root = await tempRoot();
    await write(root, "Base/modules/base-standard/config/config.xml", mapConfig(14, [file]));
    await expect(projectDeclarationRealms(root, catalog(), [])).rejects.toThrow(
      /Official Base map row has an? (unsupported non-script|invalid|non-canonical) File/
    );
  });

  test("refuses duplicate map rows", async () => {
    const root = await tempRoot();
    await write(
      root,
      "Base/modules/base-standard/config/config.xml",
      mapConfig().replace("maps/map-1.js", "maps/map-0.js")
    );
    await expect(projectDeclarationRealms(root, catalog(), [])).rejects.toThrow(
      "duplicate map File"
    );
  });

  test("requires nonempty map bytes and fingerprints the exact admitted asset", async () => {
    const root = await tempRoot();
    await write(root, "Base/modules/base-standard/config/config.xml", mapConfig());
    await expect(projectDeclarationRealms(root, catalog(), [])).rejects.toThrow(
      "non-script map asset is unavailable"
    );
    await write(root, earthMapPath, "");
    await expect(projectDeclarationRealms(root, catalog(), [])).rejects.toThrow(
      "non-script map asset is empty"
    );
    await write(root, earthMapPath, earthMapBytes);
    const original = await projectDeclarationRealms(root, catalog(), []);
    await write(root, earthMapPath, `${earthMapBytes}changed`);
    const changed = await projectDeclarationRealms(root, catalog(), []);
    expect(changed.nonScriptMaps[0]?.sha256).not.toBe(original.nonScriptMaps[0]?.sha256);
    expect(changed.nonScriptMaps[0]?.size).toBe(Buffer.byteLength(earthMapBytes) + 7);
    expect(changed.map).toEqual(original.map);
  });
});
