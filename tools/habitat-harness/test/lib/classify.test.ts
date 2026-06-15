import { describe, expect, test } from "vitest";
import { classifyPath, classifyTarget } from "../../src/lib/command-engine.js";
import type { NxProjectMetadataReader } from "../../src/lib/nx-projects.js";

const fixtureNxProjects: NxProjectMetadataReader = {
  async readProjects() {
    return [
      {
        name: "@civ7/adapter",
        root: "packages/civ7-adapter",
        sourceRoot: null,
        tags: ["kind:adapter"],
        targets: [{ name: "build" }, { name: "check" }],
      },
      {
        name: "@civ7/config",
        root: "packages/config",
        sourceRoot: null,
        tags: ["kind:foundation"],
        targets: [{ name: "build" }, { name: "check" }, { name: "test" }],
      },
      {
        name: "mapgen-studio",
        root: "apps/mapgen-studio",
        sourceRoot: null,
        tags: ["kind:app"],
        targets: [{ name: "check" }, { name: "test" }],
      },
      {
        name: "mod-swooper-maps",
        root: "mods/mod-swooper-maps",
        sourceRoot: null,
        tags: ["kind:mod"],
        targets: [{ name: "check" }, { name: "test" }],
      },
      {
        name: "@internal/habitat-harness",
        root: "tools/habitat-harness",
        sourceRoot: null,
        tags: ["kind:tooling"],
        targets: [{ name: "check" }, { name: "test" }],
      },
    ];
  },
};

describe("Habitat classify", () => {
  test.each([
    {
      path: "packages/civ7-adapter/src/index.ts",
      project: "@civ7/adapter",
      tag: "kind:adapter",
      rule: "adapter-boundary",
    },
    {
      path: "mods/mod-swooper-maps/src/recipes/standard/recipe.ts",
      project: "mod-swooper-maps",
      tag: "kind:mod",
      rule: "grit-recipe-domain-surface",
    },
    {
      path: "packages/config/src/index.ts",
      project: "@civ7/config",
      tag: "kind:foundation",
      rule: "workspace-entrypoints",
    },
    {
      path: "apps/mapgen-studio/src/main.tsx",
      project: "mapgen-studio",
      tag: "kind:app",
      rule: "grit-studio-recipe-artifacts",
    },
  ])("classifies $path with resolved targets", async ({ path, project, tag, rule }) => {
    const result = await classifyPath(path, { nxProjects: fixtureNxProjects });

    expect(result.project).toBe(project);
    expect(result.tags).toContain(tag);
    expect(result.rulesInScope).toContain(rule);
    expect(result.requiredTargets).toContain(`nx run ${project}:check`);
    expect(result.requiredTargets).toContain("bun run lint");
    expect(result.targets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: `nx run ${project}:check`,
          owner: "project",
          project,
          target: "check",
          proof: { kind: "nx-project-graph", project, target: "check" },
        }),
      ])
    );
  });

  test("does not emit project targets that Nx metadata does not resolve", async () => {
    const result = await classifyPath("packages/civ7-adapter/src/index.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.requiredTargets).toContain("nx run @civ7/adapter:check");
    expect(result.requiredTargets).not.toContain("nx run @civ7/adapter:test");
    expect(result.unavailableTargets).toEqual([
      {
        owner: "project",
        project: "@civ7/adapter",
        target: "test",
        reason: "missing-nx-target",
      },
    ]);
  });

  test("workspace-level paths report only workspace gates", async () => {
    const result = await classifyPath("package.json", { nxProjects: fixtureNxProjects });

    expect(result.project).toBeNull();
    expect(result.requiredTargets).toEqual(["bun run lint"]);
    expect(result.targets).toEqual([
      expect.objectContaining({ command: "bun run lint", owner: "workspace", project: null }),
    ]);
  });

  test("classifies literal diffs by changed path", async () => {
    const result = await classifyTarget(`diff --git a/packages/config/src/index.ts b/packages/config/src/index.ts
index 1111111..2222222 100644
--- a/packages/config/src/index.ts
+++ b/packages/config/src/index.ts
@@ -1 +1 @@
-export const a = 1;
+export const a = 2;
`, { nxProjects: fixtureNxProjects });

    expect("inputKind" in result && result.inputKind).toBe("diff");
    if (!("inputKind" in result)) throw new Error("expected diff classification");
    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]?.project).toBe("@civ7/config");
    expect(result.paths[0]?.requiredTargets).toContain("nx run @civ7/config:test");
  });

  test("real Nx graph omits missing adapter test target", async () => {
    const result = await classifyPath("packages/civ7-adapter/src/index.ts");

    expect(result.project).toBe("@civ7/adapter");
    expect(result.requiredTargets).toContain("nx run @civ7/adapter:check");
    expect(result.requiredTargets).not.toContain("nx run @civ7/adapter:test");
    expect(result.unavailableTargets).toContainEqual(
      expect.objectContaining({
        project: "@civ7/adapter",
        target: "test",
        reason: "missing-nx-target",
      })
    );
  });
});
