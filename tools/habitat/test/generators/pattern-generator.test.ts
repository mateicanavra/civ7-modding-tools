import {
  candidateAuthorityPaths,
  patternGenerator,
} from "@habitat/cli/generators/scaffold/pattern/support/generator";
import { readJson } from "@nx/devkit";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { describe, expect, test } from "vitest";

const indexPath = ".habitat/index.json";

describe("Habitat pattern generator", () => {
  test("creates candidate authority files without registering active enforcement state", async () => {
    const tree = createPatternTree();

    await patternGenerator(tree, { ruleId: "dra-metadata-probe" });

    const candidatePaths = candidateAuthorityPaths({
      ruleId: "dra-metadata-probe",
      patternName: "dra_metadata_probe",
    });
    expect(tree.exists(candidatePaths.patternPath)).toBe(true);
    expect(tree.exists(candidatePaths.manifestPath)).toBe(true);
    expect(tree.exists(".habitat/patterns/checks/dra_metadata_probe.md")).toBe(false);
    expect(tree.exists(".habitat/docs/rules/dra-metadata-probe/rule.json")).toBe(false);
    expect(readJson(tree, indexPath)).toMatchObject({
      schemaVersion: 2,
      ownerRoots: { habitat: "tools/habitat" },
    });

    const manifest = readJson(tree, candidatePaths.manifestPath);
    expect(manifest).toMatchObject({
      schemaVersion: 1,
      ruleId: "dra-metadata-probe",
      patternName: "dra_metadata_probe",
      lifecycle: "candidate",
      patternRole: "diagnostic",
      registration: { accepted: false },
    });
    expect(manifest).not.toHaveProperty("openspecChangeId");
    expect(tree.read(candidatePaths.patternPath, "utf8")).toContain("level: info");
  });

  test("preserves an explicitly supplied OpenSpec owner in the candidate manifest", async () => {
    const tree = createPatternTree();

    await patternGenerator(tree, {
      ruleId: "owned-candidate-probe",
      openspecChangeId: "explicit-candidate-owner",
    });

    const candidatePaths = candidateAuthorityPaths({
      ruleId: "owned-candidate-probe",
      patternName: "owned_candidate_probe",
    });
    expect(readJson(tree, candidatePaths.manifestPath)).toMatchObject({
      ruleId: "owned-candidate-probe",
      lifecycle: "candidate",
      openspecChangeId: "explicit-candidate-owner",
      registration: { accepted: false },
    });
  });

  test.each([
    {
      label: "registered-advisory lifecycle",
      options: { ruleId: "advisory-probe", lifecycle: "registered-advisory" },
      patternName: "advisory_probe",
    },
    {
      label: "registered-enforced lifecycle",
      options: { ruleId: "enforced-probe", lifecycle: "registered-enforced" },
      patternName: "enforced_probe",
    },
    {
      label: "empty OpenSpec owner",
      options: { ruleId: "empty-owner-probe", openspecChangeId: "" },
      patternName: "empty_owner_probe",
    },
    {
      label: "null OpenSpec owner",
      options: { ruleId: "null-owner-probe", openspecChangeId: null },
      patternName: "null_owner_probe",
    },
  ])("rejects $label at the public generator boundary before any writes", async (testCase) => {
    const tree = createPatternTree();
    const beforeIndex = tree.read(indexPath, "utf8");
    const beforeTree = tree.listChanges();

    await expect(patternGenerator(tree, testCase.options as never)).rejects.toThrow();

    expect(tree.listChanges()).toEqual(beforeTree);
    assertNoGeneratedArtifacts(tree, testCase.options.ruleId, testCase.patternName, beforeIndex);
  });

  test.each([
    "recipe",
    "stage",
    "op",
    "step",
  ])("refuses product authoring field %s before candidate writes", async (field) => {
    const tree = createPatternTree();
    const beforeIndex = tree.read(indexPath, "utf8");
    const options = { ruleId: "product-authoring-probe", [field]: "standard" };

    await expect(patternGenerator(tree, options)).rejects.toMatchObject({
      refusal: expect.objectContaining({
        kind: "scaffold-refusal",
        requestClass: "unsupported-product-authoring",
        reason: "unsupported-product-authoring",
        writeSet: [],
      }),
    });

    assertNoGeneratedArtifacts(
      tree,
      "product-authoring-probe",
      "product_authoring_probe",
      beforeIndex
    );
  });

  test("refuses candidate generation when the rule already exists", async () => {
    const tree = createPatternTree({
      ...emptyRuleRegistryDocument([existingRegistryRule("existing-probe")]),
    });
    const beforeIndex = tree.read(indexPath, "utf8");

    await expect(patternGenerator(tree, { ruleId: "existing-probe" })).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "candidate-collision",
        writeSet: [],
      }),
    });

    assertNoGeneratedArtifacts(tree, "existing-probe", "existing_probe", beforeIndex);
  });

  test("refuses candidate generation when the active pattern name already exists", async () => {
    const tree = createPatternTree();
    tree.write(".habitat/patterns/checks/existing_probe.md", "existing active pattern");
    const beforeIndex = tree.read(indexPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: "new-probe",
        patternName: "existing-probe",
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "candidate-collision",
        writeSet: [],
      }),
    });

    const candidatePaths = candidateAuthorityPaths({
      ruleId: "new-probe",
      patternName: "existing_probe",
    });
    expect(tree.exists(candidatePaths.patternPath)).toBe(false);
    expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
    expect(tree.exists(".habitat/patterns/manifests/new-probe.json")).toBe(false);
    expect(tree.read(".habitat/patterns/checks/existing_probe.md", "utf8")).toBe(
      "existing active pattern"
    );
    expect(tree.read(indexPath, "utf8")).toBe(beforeIndex);
  });

  test("refuses candidate generation when an active manifest id already exists elsewhere", async () => {
    const tree = createPatternTree({
      ...emptyRuleRegistryDocument([existingRegistryRule("existing-baseline")]),
    });
    const beforeIndex = tree.read(indexPath, "utf8");

    await expect(patternGenerator(tree, { ruleId: "existing-baseline" })).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "candidate-collision",
        writeSet: [],
      }),
    });

    const candidatePaths = candidateAuthorityPaths({
      ruleId: "existing-baseline",
      patternName: "existing_baseline",
    });
    expect(tree.exists(candidatePaths.patternPath)).toBe(false);
    expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
    expect(tree.exists(".habitat/patterns/manifests/existing-baseline.json")).toBe(false);
    expect(tree.read(indexPath, "utf8")).toBe(beforeIndex);
  });
});

function createPatternTree(
  rulesJson: { ownerRoots: Record<string, string>; rules: unknown[] } = emptyRuleRegistryDocument()
) {
  const tree = createTreeWithEmptyWorkspace();
  tree.write(
    indexPath,
    `${JSON.stringify(
      {
        schemaVersion: 2,
        ownerRoots: rulesJson.ownerRoots,
      },
      null,
      2
    )}\n`
  );
  for (const rule of rulesJson.rules) {
    const id = (rule as { id?: unknown }).id;
    if (typeof id !== "string") continue;
    tree.write(`.habitat/docs/rules/${id}/rule.json`, `${JSON.stringify(rule, null, 2)}\n`);
  }
  return tree;
}

function emptyRuleRegistryDocument(rules: unknown[] = []) {
  return {
    schemaVersion: 2,
    ownerRoots: {
      habitat: "tools/habitat",
    },
    rules,
  };
}

function existingRegistryRule(ruleId: string) {
  return {
    schemaVersion: 2,
    id: ruleId,
    title: ruleId,
    placement: {
      niche: "docs",
      blueprint: "_self",
      category: "quality",
    },
    operation: { kind: "check" },
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "test fixture",
    why: "test fixture",
    remediate: null,
    message: "test fixture",
    pathCoverage: [{ kind: "project-owner" }],
    supportFiles: {
      baseline: `.habitat/docs/rules/${ruleId}/baseline.json`,
    },
    runner: {
      name: "habitat",
      mode: "script",
      files: {
        script: `.habitat/docs/rules/${ruleId}/check.mjs`,
      },
      runtime: "node",
    },
  };
}

function assertNoGeneratedArtifacts(
  tree: ReturnType<typeof createPatternTree>,
  ruleId: string,
  patternName: string,
  beforeIndex: string | null
) {
  const candidatePaths = candidateAuthorityPaths({ ruleId, patternName });
  expect(tree.exists(candidatePaths.patternPath)).toBe(false);
  expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
  expect(tree.exists(`.habitat/patterns/manifests/${ruleId}.json`)).toBe(false);
  expect(tree.exists(`.habitat/patterns/checks/${patternName}.md`)).toBe(false);
  expect(tree.read(indexPath, "utf8")).toBe(beforeIndex);
}
