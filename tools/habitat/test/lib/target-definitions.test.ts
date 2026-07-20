import { repoRoot } from "@habitat/cli/resources/paths";
import type { NxTargetDependency } from "@habitat/cli/service/model/graph/dto/target-definition.schema";
import {
  directRuleTarget,
  habitatInputs,
  ownerLocalCheckTarget,
} from "@habitat/cli/service/model/graph/policy/target-definitions.policy";
import { createProjectGraphAsync, DependencyType } from "@nx/devkit";
import { describe, expect, test } from "vitest";

describe("Habitat target definitions", () => {
  test("runs source-owned policy leaves without materializing package outputs", () => {
    expect(directRuleTarget("sample-rule", "sample-app", repoRoot).dependsOn).toBeUndefined();
    expect(
      ownerLocalCheckTarget({
        owner: "sample-app",
        repoRoot,
        ruleIds: ["sample-rule"],
        inputs: ["{workspaceRoot}/apps/sample-app/**"],
      }).dependsOn
    ).toBeUndefined();
  });

  test("keys every source-executed target on the Habitat runtime", () => {
    expect(directRuleTarget("sample-rule", "sample-app", repoRoot, [])).toMatchObject({
      inputs: ["habitatRuntime"],
      options: {
        cwd: "{workspaceRoot}",
        env: { HABITAT_REPO_ROOT: repoRoot },
      },
    });
    expect(
      ownerLocalCheckTarget({
        owner: "sample-app",
        repoRoot,
        ruleIds: ["sample-rule"],
        inputs: ["{workspaceRoot}/apps/sample-app/**"],
      })
    ).toMatchObject({
      inputs: ["habitatRuntime", "{workspaceRoot}/apps/sample-app/**"],
      options: {
        cwd: "{workspaceRoot}",
        env: { HABITAT_REPO_ROOT: repoRoot },
      },
    });
    expect(habitatInputs()).toContain("habitatRuntime");
  });

  test("links Habitat to its authority through the resolved Nx graph", async () => {
    const graph = await createProjectGraphAsync({ exitOnError: false });
    expect(graph.dependencies.habitat).toContainEqual({
      source: "habitat",
      target: "habitat-authority",
      type: DependencyType.implicit,
    });
  });

  test("schedules exact output prerequisites without bypassing Habitat execution", () => {
    const dependency: NxTargetDependency = { projects: ["mapgen-core"], target: "build" };
    expect(
      directRuleTarget("sample-rule", "sample-app", repoRoot, undefined, [dependency])
    ).toMatchObject({
      command: "bun tools/habitat/bin/dev.ts check --rule sample-rule",
      dependsOn: [dependency],
    });
    expect(
      ownerLocalCheckTarget({
        owner: "sample-app",
        repoRoot,
        ruleIds: ["sample-rule"],
        inputs: ["{workspaceRoot}/apps/sample-app/**"],
        graphDependencies: [dependency, dependency],
      })
    ).toMatchObject({
      command: "bun tools/habitat/bin/dev.ts check --rule sample-rule",
      dependsOn: [dependency],
    });
  });
});
