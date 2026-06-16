import { createRequire } from "node:module";
import { readJson } from "@nx/devkit";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { describe, expect, test } from "vitest";
import { validatePatternAuthorityManifest } from "../../src/rules/pattern-authority/manifest.js";

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
      openspecChangeId: "habitat-pattern-generator-metadata-repair",
      ownerTool: "grit-check",
      registration: { accepted: false },
    });
    expect(
      validatePatternAuthorityManifest(manifest, {
        manifestPath: candidatePaths.manifestPath,
      })
    ).toMatchObject({
      ok: true,
      state: "candidate",
      authorityAccepted: false,
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

  test("refuses candidate generation when the active pattern name already exists", async () => {
    const tree = createPatternTree();
    tree.write(".grit/patterns/habitat/checks/existing_probe.md", "existing active pattern");
    const beforeRules = tree.read(rulesPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: "grit-new-probe",
        patternName: "existing-probe",
      })
    ).rejects.toThrow("Grit pattern already exists");

    const candidatePaths = candidateArtifactPaths({
      ruleId: "grit-new-probe",
      patternName: "existing_probe",
    });
    expect(tree.exists(candidatePaths.patternPath)).toBe(false);
    expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
    expect(
      tree.exists("tools/habitat-harness/src/rules/pattern-authority/grit-new-probe.json")
    ).toBe(false);
    expect(tree.read(".grit/patterns/habitat/checks/existing_probe.md", "utf8")).toBe(
      "existing active pattern"
    );
    expect(tree.read(rulesPath, "utf8")).toBe(beforeRules);
  });

  test("refuses candidate generation when an active baseline already exists", async () => {
    const tree = createPatternTree();
    tree.write("tools/habitat-harness/baselines/grit-existing-baseline.json", "[]\n");
    const beforeRules = tree.read(rulesPath, "utf8");

    await expect(
      patternGenerator(tree, { ruleId: "grit-existing-baseline" })
    ).rejects.toThrow("Baseline already exists");

    const candidatePaths = candidateArtifactPaths({
      ruleId: "grit-existing-baseline",
      patternName: "existing_baseline",
    });
    expect(tree.exists(candidatePaths.patternPath)).toBe(false);
    expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
    expect(
      tree.exists(
        "tools/habitat-harness/src/rules/pattern-authority/grit-existing-baseline.json"
      )
    ).toBe(false);
    expect(tree.read("tools/habitat-harness/baselines/grit-existing-baseline.json", "utf8")).toBe(
      "[]\n"
    );
    expect(tree.read(rulesPath, "utf8")).toBe(beforeRules);
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
  expect(tree.exists(`tools/habitat-harness/src/rules/pattern-authority/${ruleId}.json`)).toBe(
    false
  );
  expect(tree.exists(`.grit/patterns/habitat/checks/${patternName}.md`)).toBe(false);
  expect(tree.exists(`tools/habitat-harness/baselines/${ruleId}.json`)).toBe(false);
  expect(tree.read(rulesPath, "utf8")).toBe(beforeRules);
}
