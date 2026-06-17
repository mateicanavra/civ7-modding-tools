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
      {
        name: "@civ7/plugin-graph",
        root: "packages/plugins/plugin-graph",
        sourceRoot: null,
        tags: ["kind:plugin"],
        targets: [{ name: "check" }, { name: "test" }],
      },
      {
        name: "@civ7/types",
        root: "packages/civ7-types",
        sourceRoot: null,
        tags: ["kind:foundation"],
        targets: [{ name: "check" }, { name: "test" }],
      },
      {
        name: "@swooper/mapgen-core",
        root: "packages/mapgen-core",
        sourceRoot: null,
        tags: ["kind:foundation"],
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
    {
      path: "tools/habitat-harness/src/plugin.js",
      project: "@internal/habitat-harness",
      tag: "kind:tooling",
      rule: "workspace-entrypoints",
    },
    {
      path: "packages/plugins/plugin-graph/src/index.ts",
      project: "@civ7/plugin-graph",
      tag: "kind:plugin",
      rule: "workspace-entrypoints",
    },
    {
      path: "packages/civ7-types/generated/foo.d.ts",
      project: "@civ7/types",
      tag: "kind:foundation",
      rule: "file-layer-civ7-types-generated",
    },
  ])("classifies $path with resolved targets", async ({ path, project, tag, rule }) => {
    const result = await classifyPath(path, { nxProjects: fixtureNxProjects });

    expect(result.project).toBe(project);
    expect(result.tags).toContain(tag);
    expect(result.rulesInScope).toContain(rule);
    expect(result.requiredTargets).toContain(`nx run ${project}:check`);
    expect(result.requiredTargets).toContain("bun run lint");
    expect(result.rulesInScope).toEqual(result.scopedRules?.map((scopedRule) => scopedRule.ruleId));
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

  test("reports exact path scope when rule metadata matches the path", async () => {
    const result = await classifyPath("mods/mod-swooper-maps/src/recipes/standard/recipe.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.scopedRules).toContainEqual(
      expect.objectContaining({
        ruleId: "grit-recipe-domain-surface",
        scope: "exact-path",
      })
    );
  });

  test("reports project-owner scope for owned rules without exact path metadata", async () => {
    const result = await classifyPath("mods/mod-swooper-maps/src/recipes/standard/recipe.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.scopedRules).toContainEqual(
      expect.objectContaining({
        ruleId: "normalization-guardrails",
        scope: "project-owner",
      })
    );
  });

  test("reports workspace gates separately from exact path rules", async () => {
    const result = await classifyPath("packages/config/src/index.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.scopedRules).toContainEqual(
      expect.objectContaining({
        ruleId: "workspace-entrypoints",
        scope: "workspace-gate",
      })
    );
  });

  test("marks Grit rows with insufficient path metadata as unresolved", async () => {
    const result = await classifyPath(
      "mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-floodplains/index.ts",
      { nxProjects: fixtureNxProjects }
    );

    expect(result.scopedRules).toContainEqual(
      expect.objectContaining({
        ruleId: "grit-runtime-validation-imports",
        scope: "unresolved-metadata",
      })
    );
  });

  test("does not include exact internal rules for unrelated paths", async () => {
    const result = await classifyPath("packages/civ7-adapter/src/index.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.rulesInScope).not.toContain("grit-studio-recipe-artifacts");
  });

  test("does not scrape excluded prose scopes into exact matches", async () => {
    const result = await classifyPath("packages/civ7-adapter/src/index.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.rulesInScope).not.toContain("grit-adapter-base-standard-import");
    expect(result.scopedRules).not.toContainEqual(
      expect.objectContaining({
        ruleId: "grit-adapter-base-standard-import",
        scope: "exact-path",
      })
    );
  });

  test("preserves exact matches for pure machine-readable glob scopes", async () => {
    const result = await classifyPath("packages/mapgen-core/src/core/index.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.scopedRules).toContainEqual(
      expect.objectContaining({
        ruleId: "grit-mapgen-core-runtime-civ7",
        scope: "exact-path",
      })
    );
  });

  test("workspace-level paths report only workspace gates", async () => {
    const result = await classifyPath("package.json", { nxProjects: fixtureNxProjects });

    expect(result.project).toBeNull();
    expect(result.requiredTargets).toEqual(["bun run lint"]);
    expect(result.targets).toEqual([
      expect.objectContaining({ command: "bun run lint", owner: "workspace", project: null }),
    ]);
  });

  test("missing paths are classified by path ownership without filesystem proof", async () => {
    const projectPath = await classifyPath("packages/config/src/not-yet-created.ts", {
      nxProjects: fixtureNxProjects,
    });
    const workspacePath = await classifyPath("notes/not-yet-created.md", {
      nxProjects: fixtureNxProjects,
    });

    expect(projectPath.project).toBe("@civ7/config");
    expect(projectPath.requiredTargets).toEqual([
      "nx run @civ7/config:check",
      "nx run @civ7/config:test",
      "bun run lint",
    ]);
    expect(workspacePath.project).toBeNull();
    expect(workspacePath.note).toBe("workspace-level path");
    expect(workspacePath.requiredTargets).toEqual(["bun run lint"]);
  });

  test("classifies literal diffs by changed path", async () => {
    const result = await classifyTarget(
      `diff --git a/packages/config/src/index.ts b/packages/config/src/index.ts
index 1111111..2222222 100644
--- a/packages/config/src/index.ts
+++ b/packages/config/src/index.ts
@@ -1 +1 @@
-export const a = 1;
+export const a = 2;
`,
      { nxProjects: fixtureNxProjects }
    );

    expect("inputKind" in result && result.inputKind).toBe("diff");
    if (!("inputKind" in result)) throw new Error("expected diff classification");
    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]?.project).toBe("@civ7/config");
    expect(result.paths[0]?.requiredTargets).toContain("nx run @civ7/config:test");
  });

  test("classifies multi-path diffs independently and in stable path order", async () => {
    const result = await classifyTarget(
      `diff --git a/apps/mapgen-studio/src/main.tsx b/apps/mapgen-studio/src/main.tsx
index 1111111..2222222 100644
--- a/apps/mapgen-studio/src/main.tsx
+++ b/apps/mapgen-studio/src/main.tsx
@@ -1 +1 @@
-export const app = 1;
+export const app = 2;
diff --git a/packages/plugins/plugin-graph/src/index.ts b/packages/plugins/plugin-graph/src/index.ts
index 3333333..4444444 100644
--- a/packages/plugins/plugin-graph/src/index.ts
+++ b/packages/plugins/plugin-graph/src/index.ts
@@ -1 +1 @@
-export const plugin = 1;
+export const plugin = 2;
`,
      { nxProjects: fixtureNxProjects }
    );

    expect("inputKind" in result && result.inputKind).toBe("diff");
    if (!("inputKind" in result)) throw new Error("expected diff classification");
    expect(result.paths.map((classification) => classification.path)).toEqual([
      "apps/mapgen-studio/src/main.tsx",
      "packages/plugins/plugin-graph/src/index.ts",
    ]);
    expect(result.paths.map((classification) => classification.project)).toEqual([
      "mapgen-studio",
      "@civ7/plugin-graph",
    ]);
    expect(result.paths[0]?.requiredTargets).toContain("nx run mapgen-studio:test");
    expect(result.paths[1]?.requiredTargets).toContain("nx run @civ7/plugin-graph:test");
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
