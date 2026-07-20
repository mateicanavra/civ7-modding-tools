import type {
  WorkspaceGraphReadState,
  WorkspaceProject,
} from "@habitat/cli/service/model/workspace/index";
import { habitatServiceRouter } from "@habitat/cli/service/router";
import { createRouterClient } from "@orpc/server";
import { Effect } from "effect";
import { assert, describe, expect, test } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

const workspaceGraph = graphReady([
  project("habitat", "tools/habitat", "kind:tooling", [
    "check",
    "check:boundaries",
    "check:hygiene",
    "check:policy",
    "lint",
    "typecheck",
    "test",
  ]),
  project("civ7-adapter", "packages/civ7-adapter", "kind:adapter", ["build", "check"]),
  project("civ7-config", "packages/config", "kind:library", ["build", "check", "test"]),
  project("plugin-graph", "packages/plugins/plugin-graph", "kind:plugin", ["check", "test"]),
  project("civ7-types", "packages/civ7-types", "kind:library", ["check", "test"]),
  project("mapgen-core", "packages/mapgen-core", "kind:library", ["check", "test"]),
  project("mapgen-studio", "apps/mapgen-studio", "kind:app", ["check", "test"]),
  project("mod-intelligence-bridge", "mods/mod-civ7-intelligence-bridge", "kind:mod", [
    "build",
    "test",
  ]),
  project("mod-swooper-maps", "mods/mod-swooper-maps", "kind:mod", [
    "check",
    "check:policy",
    "test",
  ]),
]);

describe("Habitat classify service", () => {
  test("classifies targets through the in-process Habitat service router", async () => {
    const result = await createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(() => workspaceGraph),
      },
    }).classify.target({ target: "tools/habitat/src/cli/commands/classify.ts" });

    assert(result.state === "project-path");
    expect(result.owner.project).toBe("habitat");
    expect(result.runnableTargets.map((target) => target.command)).toContain(
      "nx run habitat:check"
    );
  });

  test("routes classify through the in-process Habitat service router", async () => {
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(() => workspaceGraph),
      },
    });

    const result = await client.classify.target({
      target: "tools/habitat/src/cli/commands/classify.ts",
    });

    assert(result.state === "project-path");
    expect(result.owner.tags).toEqual(["kind:tooling"]);
  });

  test("preserves diff classification through the service contract boundary", async () => {
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(() => workspaceGraph),
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

    assert(result.state === "diff");
    expect(
      result.paths.map((classification) => {
        if (!("path" in classification)) throw new Error("expected path classification");
        return classification.path;
      })
    ).toEqual(["apps/mapgen-studio/src/main.tsx", "packages/plugins/plugin-graph/src/index.ts"]);
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

    expect(result).toMatchObject({
      state: "malformed-or-pathless-diff",
      reason: "no-classifiable-diff-paths",
    });
  });

  test("preserves unresolved-owner path states through the service boundary", async () => {
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(() => workspaceGraph),
      },
    });

    const result = await client.classify.target({ target: "notes/not-yet-created.md" });

    assert(result.state === "unresolved-owner");
    expect(result.reason).toBe("no-project-or-workspace-owner");
  });

  test("preserves graph-refusal states through the service boundary", async () => {
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeClassifyDeps(() => ({
          kind: "malformed-graph-json",
          message: "workspace graph fixture is malformed",
        })),
      },
    });

    const result = await client.classify.target({
      target: "tools/habitat/src/cli/commands/classify.ts",
    });

    assert(result.state === "graph-refusal");
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
  readGraph: () => WorkspaceGraphReadState
): ReturnType<typeof makeTestHabitatServiceDeps> {
  const deps = makeTestHabitatServiceDeps();
  return {
    ...deps,
    nx: {
      ...deps.nx,
      workspaceGraph: () => Effect.sync(readGraph),
    },
  };
}

function graphReady(projects: readonly WorkspaceProject[]): WorkspaceGraphReadState {
  return { kind: "graph-ready", snapshot: { projects: [...projects] } };
}
