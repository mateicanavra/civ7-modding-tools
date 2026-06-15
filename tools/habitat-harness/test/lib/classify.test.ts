import { describe, expect, test } from "vitest";
import { classifyPath, classifyTarget } from "../../src/lib/command-engine.js";

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
  ])("classifies $path", ({ path, project, tag, rule }) => {
    const result = classifyPath(path);

    expect(result.project).toBe(project);
    expect(result.tags).toContain(tag);
    expect(result.rulesInScope).toContain(rule);
    expect(result.requiredTargets).toContain(`nx run ${project}:check`);
    expect(result.requiredTargets).toContain("bun run lint");
  });

  test("classifies literal diffs by changed path", () => {
    const result =
      classifyTarget(`diff --git a/packages/config/src/index.ts b/packages/config/src/index.ts
index 1111111..2222222 100644
--- a/packages/config/src/index.ts
+++ b/packages/config/src/index.ts
@@ -1 +1 @@
-export const a = 1;
+export const a = 2;
`);

    expect("inputKind" in result && result.inputKind).toBe("diff");
    if (!("inputKind" in result)) throw new Error("expected diff classification");
    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]?.project).toBe("@civ7/config");
  });
});
