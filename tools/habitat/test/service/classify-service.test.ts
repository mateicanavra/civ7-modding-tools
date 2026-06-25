import type {
  WorkspaceGraphReadState,
  WorkspaceProject,
} from "@habitat/cli/service/model/workspace/index";
import { habitatServiceRouter } from "@habitat/cli/service/router";
import { createRouterClient } from "@orpc/server";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

const workspaceGraph = graphReady([
  project("habitat", "tools/habitat", "kind:tooling", [
    "biome:ci",
    "boundaries",
    "check",
    "generated:check",
    "source:check",
    "test",
    "lint",
  ]),
  project("civ7-adapter", "packages/civ7-adapter", "kind:adapter", ["build", "check"]),
  project("civ7-config", "packages/config", "kind:foundation", ["build", "check", "test"]),
  project("plugin-graph", "packages/plugins/plugin-graph", "kind:plugin", ["check", "test"]),
  project("civ7-types", "packages/civ7-types", "kind:foundation", ["check", "test"]),
  project("mapgen-core", "packages/mapgen-core", "kind:foundation", [
    "check",
    "test",
    "test:architecture-core-purity",
  ]),
  project("mapgen-studio", "apps/mapgen-studio", "kind:app", ["check", "test"]),
  project("mod-intelligence-bridge", "mods/mod-civ7-intelligence-bridge", "kind:mod", [
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
]);

describe("Habitat classify service", () => {
  test("classifies targets through the in-process Habitat service router", async () => {
    const result = await createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(workspaceGraph),
      },
    }).classify.target({ target: "tools/habitat/src/cli/commands/classify.ts" });

    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.owner.project).toBe("habitat");
    expect(result.runnableTargets.map((target) => target.command)).toContain(
      "nx run habitat:check"
    );
  });

  test("routes classify through the in-process Habitat service router", async () => {
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(workspaceGraph),
      },
    });

    const result = await client.classify.target({
      target: "tools/habitat/src/cli/commands/classify.ts",
    });

    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.owner.tags).toEqual(["kind:tooling"]);
  });

  test("preserves diff classification through the service contract boundary", async () => {
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(workspaceGraph),
      },
    });

    const result = await client.classify.target({
      target: `diff --git a/apps/mapgen-studio/src/main.tsx b/apps/mapgen-studio/src/main.tsx
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
    });

    expect(result.state).toBe("diff");
    if (result.state !== "diff") throw new Error("expected diff");
    expect(result.paths.map((classification) => classification.path)).toEqual([
      "apps/mapgen-studio/src/main.tsx",
      "packages/plugins/plugin-graph/src/index.ts",
    ]);
  });

  test("preserves malformed diff refusal before graph reads", async () => {
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(() => {
          throw new Error("graph should not be read for malformed diff refusal");
        }),
      },
    });

    const result = await client.classify.target({ target: "not a diff\njust text" });

    expect(result.state).toBe("malformed-or-pathless-diff");
    if (result.state !== "malformed-or-pathless-diff") {
      throw new Error("expected malformed-or-pathless-diff");
    }
    expect(result.reason).toBe("no-classifiable-diff-paths");
  });

  test("preserves unresolved-owner path states through the service boundary", async () => {
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(workspaceGraph),
      },
    });

    const result = await client.classify.target({ target: "notes/not-yet-created.md" });

    expect(result.state).toBe("unresolved-owner");
    if (result.state !== "unresolved-owner") throw new Error("expected unresolved-owner");
    expect(result.reason).toBe("no-project-or-workspace-owner");
  });

  test("preserves graph-refusal states through the service boundary", async () => {
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps({
          kind: "malformed-graph-json",
          message: "workspace graph fixture is malformed",
        }),
      },
    });

    const result = await client.classify.target({
      target: "tools/habitat/src/cli/commands/classify.ts",
    });

    expect(result.state).toBe("graph-refusal");
    if (result.state !== "graph-refusal") throw new Error("expected graph-refusal");
    expect(result.refusal.reason).toBe("malformed-graph-json");
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

function makeClassifyDeps(
  graph: WorkspaceGraphReadState | (() => WorkspaceGraphReadState)
): ReturnType<typeof makeTestHabitatServiceDeps> {
  const deps = makeTestHabitatServiceDeps();
  return {
    ...deps,
    nx: {
      ...deps.nx,
      workspaceGraph: () => Effect.sync(() => (typeof graph === "function" ? graph() : graph)),
    },
  };
}

function graphReady(projects: readonly WorkspaceProject[]): WorkspaceGraphReadState {
  return { kind: "graph-ready", snapshot: { projects } };
}
