import {
  directRuleTarget,
  ownerLocalCheckTarget,
} from "@habitat/cli/service/model/graph/policy/target-definitions.policy";
import { describe, expect, test } from "vitest";

describe("Habitat target definitions", () => {
  test("runs source-owned policy leaves without materializing package outputs", () => {
    expect(directRuleTarget("sample-rule", "sample-app").dependsOn).toBeUndefined();
    expect(
      ownerLocalCheckTarget({
        owner: "sample-app",
        ruleIds: ["sample-rule"],
        inputs: ["{workspaceRoot}/apps/sample-app/**"],
      }).dependsOn
    ).toBeUndefined();
  });

  test("schedules exact output prerequisites without bypassing Habitat execution", () => {
    const dependency = { projects: ["mapgen-core"], target: "build" } as const;
    expect(directRuleTarget("sample-rule", "sample-app", undefined, [dependency])).toMatchObject({
      command: "bun tools/habitat/bin/dev.ts check --rule sample-rule",
      dependsOn: [dependency],
    });
    expect(
      ownerLocalCheckTarget({
        owner: "sample-app",
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
