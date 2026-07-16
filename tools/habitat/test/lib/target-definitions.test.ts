import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { repoRoot } from "@habitat/cli/resources/paths";
import type { NxTargetDependency } from "@habitat/cli/service/model/graph/dto/target-definition.schema";
import {
  directRuleTarget,
  habitatInputs,
  ownerLocalCheckTarget,
} from "@habitat/cli/service/model/graph/policy/target-definitions.policy";
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

  test("defines the closed Habitat runtime authority at the workspace root", () => {
    const nxConfiguration = JSON.parse(readFileSync(resolve(repoRoot, "nx.json"), "utf8"));
    expect(nxConfiguration.namedInputs.habitatRuntime).toEqual([
      "{workspaceRoot}/package.json",
      "{workspaceRoot}/bun.lock",
      "{workspaceRoot}/bunfig.toml",
      "{workspaceRoot}/tsconfig*.json",
      "{workspaceRoot}/tools/habitat/bin/**",
      "{workspaceRoot}/tools/habitat/src/**",
      "{workspaceRoot}/tools/habitat/package.json",
      "{workspaceRoot}/tools/habitat/tsconfig*.json",
      { env: "HABITAT_HARNESS_ROOT" },
      { env: "HABITAT_CACHE_ROOT" },
      { env: "HABITAT_PATTERN_CACHE_ROOT" },
      { env: "HABITAT_TELEMETRY_DISABLED" },
      { env: "HABITAT_COMMAND_TIMEOUT_MS" },
    ]);
  });

  test("links Habitat tests to the authority project", () => {
    const project = JSON.parse(
      readFileSync(resolve(repoRoot, "tools/habitat/project.json"), "utf8")
    );
    expect(project.implicitDependencies).toContain("habitat-authority");
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
