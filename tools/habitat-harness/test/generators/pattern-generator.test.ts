import { createRequire } from "node:module";
import { readJson } from "@nx/devkit";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { describe, expect, test } from "vitest";

const require = createRequire(import.meta.url);
const {
  candidateArtifactPaths,
  patternGenerator,
} = require("../../src/generators/pattern/generator.cjs");

const rulesPath = "tools/habitat-harness/src/rules/rules.json";

describe("Habitat pattern generator", () => {
  test("creates candidate artifacts without registering active enforcement state", async () => {
    const tree = createPatternTree();

    await patternGenerator(tree, { ruleId: "grit-dra-metadata-probe" });

    const candidatePaths = candidateArtifactPaths({
      ruleId: "grit-dra-metadata-probe",
      patternName: "dra_metadata_probe",
    });
    expect(tree.exists(candidatePaths.patternPath)).toBe(true);
    expect(tree.exists(candidatePaths.manifestPath)).toBe(true);
    expect(tree.exists(".grit/patterns/habitat/checks/dra_metadata_probe.md")).toBe(false);
    expect(tree.exists("tools/habitat-harness/baselines/grit-dra-metadata-probe.json")).toBe(false);
    expect(readJson(tree, rulesPath)).toEqual({ rules: [] });

    const manifest = readJson(tree, candidatePaths.manifestPath);
    expect(manifest).toMatchObject({
      schemaVersion: 1,
      ruleId: "grit-dra-metadata-probe",
      patternName: "dra_metadata_probe",
      lifecycle: "candidate",
      ownerTool: "grit-check",
      registration: { accepted: false },
    });
    expect(tree.read(candidatePaths.patternPath, "utf8")).toContain("level: info");
  });

  test("refuses registered advisory generation before any writes", async () => {
    const tree = createPatternTree();
    const beforeRules = tree.read(rulesPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: "grit-advisory-probe",
        lifecycle: "registered-advisory",
      })
    ).rejects.toThrow("Registered pattern generation");

    assertNoGeneratedArtifacts(tree, "grit-advisory-probe", "advisory_probe", beforeRules);
  });

  test("refuses registered enforced generation before any writes", async () => {
    const tree = createPatternTree();
    const beforeRules = tree.read(rulesPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: "grit-enforced-probe",
        lifecycle: "registered-enforced",
      })
    ).rejects.toThrow("Registered pattern generation");

    assertNoGeneratedArtifacts(tree, "grit-enforced-probe", "enforced_probe", beforeRules);
  });

  test("refuses candidate generation when the rule already exists", async () => {
    const tree = createPatternTree({
      rules: [{ id: "grit-existing-probe" }],
    });
    const beforeRules = tree.read(rulesPath, "utf8");

    await expect(patternGenerator(tree, { ruleId: "grit-existing-probe" })).rejects.toThrow(
      "Habitat rule already exists"
    );

    assertNoGeneratedArtifacts(tree, "grit-existing-probe", "existing_probe", beforeRules);
  });
});

function createPatternTree(rulesJson: { rules: unknown[] } = { rules: [] }) {
  const tree = createTreeWithEmptyWorkspace();
  tree.write(rulesPath, `${JSON.stringify(rulesJson, null, 2)}\n`);
  return tree;
}

function assertNoGeneratedArtifacts(
  tree: ReturnType<typeof createPatternTree>,
  ruleId: string,
  patternName: string,
  beforeRules: string | null
) {
  const candidatePaths = candidateArtifactPaths({ ruleId, patternName });
  expect(tree.exists(candidatePaths.patternPath)).toBe(false);
  expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
  expect(tree.exists(`.grit/patterns/habitat/checks/${patternName}.md`)).toBe(false);
  expect(tree.exists(`tools/habitat-harness/baselines/${ruleId}.json`)).toBe(false);
  expect(tree.read(rulesPath, "utf8")).toBe(beforeRules);
}
