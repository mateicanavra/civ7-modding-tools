import { describe, expect, test } from "vitest";
import type { WorkspaceGraphProjectReader } from "../../src/domains/workspace-graph-integration/index.js";
import {
  classifyPath,
  classifyPathResult,
  classifyTarget,
  classifyTargetResult,
  validateClassifyResult,
} from "../../src/domains/workspace-graph-integration/index.js";
import type { WorkspaceProject } from "../../src/providers/nx/schema.js";

const fixtureNxProjects: WorkspaceGraphProjectReader = {
  async readProjects() {
    return [
      project("@internal/habitat-harness", "tools/habitat-harness", "kind:tooling", [
        "biome:ci",
        "boundaries",
        "check",
        "generated:check",
        "source:check",
        "test",
        "validate:boundary-taxonomy",
        "validate:grit-patterns",
      ]),
      project("@civ7/adapter", "packages/civ7-adapter", "kind:adapter", ["build", "check"]),
      project("@civ7/config", "packages/config", "kind:foundation", ["build", "check", "test"]),
      project("@civ7/plugin-graph", "packages/plugins/plugin-graph", "kind:plugin", [
        "check",
        "test",
      ]),
      project("@civ7/types", "packages/civ7-types", "kind:foundation", ["check", "test"]),
      project("@swooper/mapgen-core", "packages/mapgen-core", "kind:foundation", [
        "check",
        "test",
        "test:architecture-core-purity",
      ]),
      project("mapgen-studio", "apps/mapgen-studio", "kind:app", ["check", "test"]),
      project("mod-civ7-intelligence-bridge", "mods/mod-civ7-intelligence-bridge", "kind:mod", [
        "test:architecture-bundle-runtime-imports",
      ]),
      project("mod-swooper-maps", "mods/mod-swooper-maps", "kind:mod", [
        "check",
        "test",
        "test:architecture-cutover",
        "test:architecture-ecology-step-imports",
        "test:architecture-m11-projection-band",
        "test:architecture-map-bundle-runtime-imports",
        "test:architecture-rng-authority",
      ]),
    ];
  },
};

describe("Habitat classify D4 result model", () => {
  test("classifies project paths with D2 routing and D3 target guidance", async () => {
    const result = await classifyPathResult("tools/habitat-harness/src/plugin.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.owner).toEqual({
      project: "@internal/habitat-harness",
      projectRoot: "tools/habitat-harness",
      tags: ["kind:tooling"],
    });
    expect(result.ruleRouting.map((rule) => rule.ruleId)).toContain("adapter-boundary");
    expect(result.runnableTargets).toContainEqual(
      expect.objectContaining({
        command: "nx run @internal/habitat-harness:check",
        source: {
          kind: "nx-project-graph",
          project: "@internal/habitat-harness",
          target: "check",
        },
      })
    );
    expect(result.runnableTargets).toContainEqual(
      expect.objectContaining({ command: "bun run lint", owner: "workspace" })
    );
    expect(result.runnableTargets).toContainEqual(
      expect.objectContaining({
        command: "bun run lint",
        source: {
          kind: "workspace-graph",
          target: "lint",
          reason: "aggregate target from workspace graph",
        },
      })
    );
    expect(validateClassifyResult(result)).toEqual([]);
    expect("project" in result).toBe(false);
    expect("requiredTargets" in result).toBe(false);
  });

  test("keeps exact routing metadata visible without prose scope inference", async () => {
    const result = await classifyPathResult(
      "mods/mod-swooper-maps/src/domain/hydrology/ops/plan-lakes/strategies/default.ts",
      { nxProjects: fixtureNxProjects }
    );

    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.ruleRouting).toContainEqual(
      expect.objectContaining({
        ruleId: "runtime-validation-imports",
        coverageKind: "exact-path",
      })
    );
  });

  test("separates unavailable targets from runnable target guidance", async () => {
    const result = await classifyPathResult("packages/civ7-adapter/src/index.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.runnableTargets.map((target) => target.command)).toContain(
      "nx run @civ7/adapter:check"
    );
    expect(result.runnableTargets.map((target) => target.command)).not.toContain(
      "nx run @civ7/adapter:test"
    );
    expect(result.unavailableTargets).toEqual([
      {
        owner: "project",
        project: "@civ7/adapter",
        target: "test",
        reason: "missing-nx-target",
      },
    ]);
  });

  test("distinguishes intentional workspace paths from unresolved owners", async () => {
    const workspace = await classifyPathResult("package.json", { nxProjects: fixtureNxProjects });
    const structuralWorkspace = await classifyPathResult(
      "openspec/changes/deep-habitat-d4-orientation-routing/tasks.md",
      { nxProjects: fixtureNxProjects }
    );
    const unresolved = await classifyPathResult("notes/not-yet-created.md", {
      nxProjects: fixtureNxProjects,
    });
    const unknownRoot = await classifyPathResult("whatever.md", {
      nxProjects: fixtureNxProjects,
    });

    expect(workspace.state).toBe("workspace-path");
    if (workspace.state !== "workspace-path") throw new Error("expected workspace-path");
    expect(workspace.workspaceOwner).toBe("workspace");
    expect(workspace.runnableTargets).toContainEqual(
      expect.objectContaining({ command: "bun run lint" })
    );
    expect(structuralWorkspace.state).toBe("workspace-path");
    if (structuralWorkspace.state !== "workspace-path") {
      throw new Error("expected workspace-path for existing structural root");
    }
    expect(structuralWorkspace.workspaceOwner).toBe("workspace");

    expect(unresolved.state).toBe("unresolved-owner");
    if (unresolved.state !== "unresolved-owner") throw new Error("expected unresolved-owner");
    expect(unresolved.recoveryInstructions).toHaveLength(1);
    expect("runnableTargets" in unresolved).toBe(false);

    expect(unknownRoot.state).toBe("unresolved-owner");
    if (unknownRoot.state !== "unresolved-owner") {
      throw new Error("expected unresolved-owner for unknown root file");
    }
    expect("runnableTargets" in unknownRoot).toBe(false);
  });

  test("classifies multi-path diffs independently and in stable order", async () => {
    const result = await classifyTargetResult(
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

    expect(result.state).toBe("diff");
    if (result.state !== "diff") throw new Error("expected diff");
    expect(result.paths.map((classification) => classification.path)).toEqual([
      "apps/mapgen-studio/src/main.tsx",
      "packages/plugins/plugin-graph/src/index.ts",
    ]);
    expect(result.paths.map((classification) => classification.state)).toEqual([
      "project-path",
      "project-path",
    ]);
    const owners = result.paths.map((classification) =>
      classification.state === "project-path" ? classification.owner.project : null
    );
    expect(owners).toEqual(["mapgen-studio", "@civ7/plugin-graph"]);
  });

  test("refuses malformed or pathless diff-like input", async () => {
    const result = await classifyTargetResult("not a diff\njust text", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.state).toBe("malformed-or-pathless-diff");
    if (result.state !== "malformed-or-pathless-diff") {
      throw new Error("expected malformed-or-pathless-diff");
    }
    expect(result.reason).toBe("no-classifiable-diff-paths");
    expect(result.recoveryInstructions).toHaveLength(1);
    expect("paths" in result).toBe(false);
  });

  test("refuses malformed or pathless diff-like input before reading the graph", async () => {
    const result = await classifyTargetResult("not a diff\njust text", {
      nxProjects: {
        async readProjects() {
          throw new Error("Nx daemon unavailable");
        },
      },
    });

    expect(result.state).toBe("malformed-or-pathless-diff");
  });

  test("renders malformed graph metadata as a D3-owned graph-refusal state", async () => {
    const result = await classifyPathResult("tools/habitat-harness/src/plugin.ts", {
      nxProjects: {
        async readProjects() {
          return [
            {
              name: "",
              root: "",
              sourceRoot: null,
              tags: [],
              targets: [],
            },
          ];
        },
      },
    });

    expect(result.state).toBe("graph-refusal");
    if (result.state !== "graph-refusal") throw new Error("expected graph-refusal");
    expect(result.refusal.reason).toBe("malformed-graph-json");
  });

  test("renders Nx graph read failures as D3-owned graph-refusal states", async () => {
    const readFailure = await classifyPathResult("tools/habitat-harness/src/plugin.ts", {
      nxProjects: {
        async readProjects() {
          throw new Error("cannot read project graph");
        },
      },
    });
    const result = await classifyPathResult("tools/habitat-harness/src/plugin.ts", {
      nxProjects: {
        async readProjects() {
          throw new Error("Nx daemon unavailable");
        },
      },
    });

    expect(readFailure.state).toBe("graph-refusal");
    if (readFailure.state !== "graph-refusal") throw new Error("expected graph-refusal");
    expect(readFailure.refusal.reason).toBe("nx-read-failure");

    expect(result.state).toBe("graph-refusal");
    if (result.state !== "graph-refusal") throw new Error("expected graph-refusal");
    expect(result.refusal).toEqual({
      kind: "graph-refusal",
      reason: "nx-daemon-failure",
      message: "Nx daemon unavailable",
    });
  });

  test("renders missing-project graph aliases as graph-refusal states", async () => {
    const result = await classifyPathResult("tools/habitat-harness/src/plugin.ts", {
      nxProjects: {
        async readProjects() {
          return [project("@civ7/adapter", "packages/civ7-adapter", "kind:adapter", ["check"])];
        },
      },
    });

    expect(result.state).toBe("graph-refusal");
    if (result.state !== "graph-refusal") throw new Error("expected graph-refusal");
    expect(result.refusal.reason).toBe("unresolved-alias-dependency");
    expect(result.refusal.message).toContain("is not visible");
    expect(result.runnableTargets).toBeUndefined();
  });

  test("renders missing-target graph aliases as graph-refusal states", async () => {
    const result = await classifyPathResult("tools/habitat-harness/src/plugin.ts", {
      nxProjects: {
        async readProjects() {
          return [
            project("@internal/habitat-harness", "tools/habitat-harness", "kind:tooling", [
              "check",
              "validate:boundary-taxonomy",
              "validate:grit-patterns",
            ]),
            project("@swooper/mapgen-core", "packages/mapgen-core", "kind:foundation", []),
          ];
        },
      },
    });

    expect(result.state).toBe("graph-refusal");
    if (result.state !== "graph-refusal") throw new Error("expected graph-refusal");
    expect(result.refusal.reason).toBe("unresolved-alias-dependency");
    expect(result.refusal.message).toContain("does not expose target");
    expect(result.runnableTargets).toBeUndefined();
  });
});

describe("Habitat classify public API", () => {
  test("classifyPath returns the owned D4 path model directly", async () => {
    const result = await classifyPath("tools/habitat-harness/src/plugin.ts", {
      nxProjects: fixtureNxProjects,
    });

    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.owner.project).toBe("@internal/habitat-harness");
    expect(result.ruleRouting).toContainEqual(
      expect.objectContaining({ ruleId: "adapter-boundary", coverageKind: "project-owner" })
    );
    expect(result.ruleRouting).toContainEqual(
      expect.objectContaining({ coverageKind: "workspace-gate" })
    );
    expect(result.runnableTargets.map((target) => target.command)).toContain(
      "nx run @internal/habitat-harness:check"
    );
  });

  test("classifyTarget returns malformed diff refusal without an old diff wrapper", async () => {
    const result = await classifyTarget("not a diff\njust text", { nxProjects: fixtureNxProjects });

    expect(result.state).toBe("malformed-or-pathless-diff");
    if (result.state !== "malformed-or-pathless-diff") {
      throw new Error("expected malformed-or-pathless-diff");
    }
    expect("inputKind" in result).toBe(false);
    expect("paths" in result).toBe(false);
  });
});

function project(
  name: string,
  root: string,
  tag: string,
  targets: readonly string[]
): WorkspaceProject {
  return {
    name,
    root,
    sourceRoot: null,
    tags: [tag],
    targets: targets.map((targetName) => ({ name: targetName })),
  };
}
