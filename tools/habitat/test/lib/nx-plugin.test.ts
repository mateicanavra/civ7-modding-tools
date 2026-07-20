import { describe, expect, test, vi } from "vitest";
import { createNodesV2 } from "../../src/nx-plugin.ts";

const ruleIntroductionManifestPath =
  ".habitat/fixtures/rules/sample-rule/rule-introduction-manifest.json";

vi.mock("../../src/nx-rule-registry-loader.ts", () => ({
  loadRuleRegistryDocumentForNxPlugin: () => ({
    schemaVersion: 2,
    ownerRoots: { habitat: "tools/habitat" },
    rules: [
      {
        schemaVersion: 2,
        id: "sample-rule",
        title: "Sample Rule",
        placement: {
          niche: "fixtures",
          blueprint: "_self",
          category: "quality",
        },
        operation: { kind: "check" },
        ownerProject: "habitat",
        lane: "enforced",
        forbids: "broken structure",
        why: "Keeps the workspace structurally coherent.",
        remediate: null,
        message: "Fix the structural issue.",
        pathCoverage: [{ kind: "project-owner" }],
        manifestFilePath: ".habitat/fixtures/rules/sample-rule/rule.json",
        supportFiles: {
          baseline: ".habitat/fixtures/rules/sample-rule/baseline.json",
          ruleIntroductionManifest:
            ".habitat/fixtures/rules/sample-rule/rule-introduction-manifest.json",
        },
        runner: {
          name: "habitat",
          mode: "script",
          files: { script: ".habitat/fixtures/rules/sample-rule/check.mjs" },
          runtime: "node",
        },
      },
    ],
  }),
}));

describe("Habitat Nx plugin inputs", () => {
  test("includes a declared rule introduction manifest in direct and owner targets", () => {
    const handler = createNodesV2[1];
    if (typeof handler !== "function") throw new Error("Expected a createNodesV2 handler.");

    const [[, result]] = handler([".habitat/index.json"], {});
    const manifestInput = `{workspaceRoot}/${ruleIntroductionManifestPath}`;

    expect(result.projects["tools/habitat"]?.targets["habitat:rule:sample-rule"]?.inputs).toContain(
      manifestInput
    );
    expect(result.projects["tools/habitat"]?.targets["habitat:check"]?.inputs).toContain(
      manifestInput
    );
  });
});
