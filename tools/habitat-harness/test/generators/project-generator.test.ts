import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { readJson } from "@nx/devkit";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { describe, expect, test } from "vitest";

const require = createRequire(import.meta.url);
const { projectGenerator } = require("../../src/generators/project/generator.cjs");
const repoRoot = path.resolve(import.meta.dirname, "../../../..");

const scratchDiscoveryProjects = [
  {
    kind: "plugin",
    name: "hr-scratch-discovery-plugin",
    root: "packages/plugins/plugin-hr-scratch-discovery-plugin",
    projectName: "@civ7/plugin-hr-scratch-discovery-plugin",
    tag: "kind:plugin",
  },
  {
    kind: "foundation",
    name: "hr-scratch-discovery-foundation",
    root: "packages/hr-scratch-discovery-foundation",
    projectName: "@civ7/hr-scratch-discovery-foundation",
    tag: "kind:foundation",
  },
  {
    kind: "app",
    name: "hr-scratch-discovery-app",
    root: "apps/hr-scratch-discovery-app",
    projectName: "hr-scratch-discovery-app",
    tag: "kind:app",
  },
];

describe("Habitat project generator", () => {
  test.each([
    {
      kind: "plugin",
      name: "rules",
      root: "packages/plugins/plugin-rules",
      packageName: "@civ7/plugin-rules",
      tag: "kind:plugin",
    },
    {
      kind: "foundation",
      name: "map-tools",
      root: "packages/map-tools",
      packageName: "@civ7/map-tools",
      tag: "kind:foundation",
    },
    {
      kind: "app",
      name: "map-console",
      root: "apps/map-console",
      packageName: "map-console",
      tag: "kind:app",
    },
  ])("creates supported $kind projects at their canonical root", async (fixture) => {
    const tree = createProjectTree();

    await projectGenerator(tree, { name: fixture.name, kind: fixture.kind });

    expect(tree.exists(`${fixture.root}/src/index.ts`)).toBe(true);
    expect(tree.exists(`${fixture.root}/test/index.test.ts`)).toBe(true);
    const packageJson = readJson(tree, `${fixture.root}/package.json`);
    expect(packageJson).toMatchObject({
      name: fixture.packageName,
      nx: { tags: [fixture.tag] },
      scripts: {
        build: "tsc -p tsconfig.json",
        check: "tsc -p tsconfig.json --noEmit",
        test: "bun test",
      },
    });
  });

  test("accepts kind-prefixed uniform kinds", async () => {
    const tree = createProjectTree();

    await projectGenerator(tree, { name: "runtime-kit", kind: "kind:foundation" });

    expect(readJson(tree, "packages/runtime-kit/package.json")).toMatchObject({
      name: "@civ7/runtime-kit",
      nx: { tags: ["kind:foundation"] },
    });
  });

  test("refuses unsupported non-uniform kinds before writes", async () => {
    const tree = createProjectTree();

    await expect(projectGenerator(tree, { name: "swooper", kind: "mod" })).rejects.toThrow(
      "supports only uniform kinds"
    );

    expect(tree.exists("mods/swooper/package.json")).toBe(false);
    expect(tree.exists("mods/swooper/src/index.ts")).toBe(false);
  });

  test("refuses mismatched kind and root pairs before writes", async () => {
    const tree = createProjectTree();

    await expect(
      projectGenerator(tree, {
        name: "misplaced-app",
        kind: "app",
        directory: "packages/misplaced-app",
      })
    ).rejects.toThrow("Refusing mismatched Habitat project root");

    expect(tree.exists("packages/misplaced-app/package.json")).toBe(false);
    expect(tree.exists("packages/misplaced-app/src/index.ts")).toBe(false);
  });

  test("refuses mismatched package names before writes", async () => {
    const tree = createProjectTree();

    await expect(
      projectGenerator(tree, {
        name: "plugin-rules",
        kind: "plugin",
        packageName: "@civ7/rules",
      })
    ).rejects.toThrow("Refusing mismatched Habitat package name");

    expect(tree.exists("packages/plugins/plugin-rules/package.json")).toBe(false);
    expect(tree.exists("packages/plugins/plugin-rules/src/index.ts")).toBe(false);
  });

  test("refuses package name collisions before writes", async () => {
    const tree = createProjectTree();
    tree.write("packages/existing/package.json", `${JSON.stringify({ name: "@civ7/collision" })}\n`);

    await expect(projectGenerator(tree, { name: "collision", kind: "foundation" })).rejects.toThrow(
      "package name already exists"
    );

    expect(tree.exists("packages/collision/package.json")).toBe(false);
    expect(tree.read("packages/existing/package.json", "utf8")).toBe('{"name":"@civ7/collision"}\n');
  });

  test("refuses non-empty project roots before writes", async () => {
    const tree = createProjectTree();
    tree.write("apps/occupied/README.md", "occupied\n");

    await expect(projectGenerator(tree, { name: "occupied", kind: "app" })).rejects.toThrow(
      "Refusing to overwrite non-empty project root"
    );

    expect(tree.read("apps/occupied/README.md", "utf8")).toBe("occupied\n");
    expect(tree.exists("apps/occupied/package.json")).toBe(false);
  });

  test("generated supported scratch projects are discovered by Nx with the accepted target matrix", () => {
    cleanupScratchDiscoveryProjects();

    try {
      for (const fixture of scratchDiscoveryProjects) {
        runNx([
          "g",
          "@internal/habitat-harness:project",
          fixture.name,
          `--kind=${fixture.kind}`,
          "--no-interactive",
        ]);
      }

      for (const fixture of scratchDiscoveryProjects) {
        const project = JSON.parse(runNx(["show", "project", fixture.projectName, "--json"]).stdout);

        expect(project.root).toBe(fixture.root);
        expect(project.tags).toContain(fixture.tag);
        expect(Object.keys(project.targets)).toEqual(expect.arrayContaining(["build", "check", "test"]));
      }
    } finally {
      cleanupScratchDiscoveryProjects();
    }

    for (const fixture of scratchDiscoveryProjects) {
      expect(existsSync(path.join(repoRoot, fixture.root))).toBe(false);
    }
  }, 60_000);
});

function createProjectTree() {
  const tree = createTreeWithEmptyWorkspace();
  tree.write("apps/.keep", "");
  tree.write("mods/.keep", "");
  tree.write("packages/.keep", "");
  tree.write("tools/.keep", "");
  return tree;
}

function cleanupScratchDiscoveryProjects(): void {
  for (const fixture of scratchDiscoveryProjects) {
    rmSync(path.join(repoRoot, fixture.root), { recursive: true, force: true });
  }
}

function runNx(args: string[]): { stdout: string; stderr: string } {
  const result = spawnSync("bun", ["run", "nx", ...args], {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(
      `Nx command failed (${result.status}): bun run nx ${args.join(" ")}\n${result.stdout}\n${result.stderr}`
    );
  }

  return {
    stdout: result.stdout,
    stderr: result.stderr,
  };
}
