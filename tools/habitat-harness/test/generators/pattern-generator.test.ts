import { readJson } from "@nx/devkit";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { describe, expect, test } from "vitest";
import {
  candidateArtifactPaths,
  patternGenerator,
} from "../../src/generators/pattern/generator.js";
import {
  patternAuthorityManifestPath,
  type RegisteredPatternAuthorityManifest,
  validatePatternAuthorityManifest,
} from "../../src/rules/pattern-authority/manifest.js";

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
    expect(readJson(tree, rulesPath)).toMatchObject({ schemaVersion: 1, rules: [] });

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

  test("refuses registered advisory generation without a manifest before any writes", async () => {
    const tree = createPatternTree();
    const beforeRules = tree.read(rulesPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: "grit-advisory-probe",
        lifecycle: "registered-advisory",
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        requestClass: "active-pattern-registration",
        reason: "registered-manifest-missing",
        writeSet: [],
      }),
    });

    assertNoGeneratedArtifacts(tree, "grit-advisory-probe", "advisory_probe", beforeRules);
  });

  test("refuses registered enforced generation without a manifest before any writes", async () => {
    const tree = createPatternTree();
    const beforeRules = tree.read(rulesPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: "grit-enforced-probe",
        lifecycle: "registered-enforced",
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        requestClass: "active-pattern-registration",
        reason: "registered-manifest-missing",
        writeSet: [],
      }),
    });

    assertNoGeneratedArtifacts(tree, "grit-enforced-probe", "enforced_probe", beforeRules);
  });

  test("refuses registered generation when the manifest keeps placeholder authority", async () => {
    const tree = createPatternTree();
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest({
      normativeSources: [
        {
          kind: "accepted-spec",
          pathOrUrl: "openspec/changes/habitat-pattern-generator-metadata-repair/design.md",
          summary: "Accepted authority source for the fixture manifest.",
        },
      ],
    });
    const manifestPath = writeRegisteredManifest(tree, manifest);
    const beforeManifest = tree.read(manifestPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: manifest.ruleId,
        patternName: manifest.patternName,
        lifecycle: "registered-advisory",
        manifestPath,
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        requestClass: "active-pattern-registration",
        reason: "registered-manifest-rejected",
        writeSet: [],
      }),
    });

    assertNoPromotionWrites(tree, manifest, beforeRules, manifestPath, beforeManifest);
  });

  test("refuses registered advisory output through Pattern Governance", async () => {
    const tree = createPatternTree({
      ...emptyRuleRegistryDocument(),
    });
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest();
    const manifestPath = writeRegisteredManifest(tree, manifest);
    const beforeManifest = tree.read(manifestPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: manifest.ruleId,
        patternName: manifest.patternName,
        lifecycle: "registered-advisory",
        manifestPath,
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        requestClass: "active-pattern-registration",
        reason: "registered-manifest-rejected",
        writeSet: [],
      }),
    });

    assertNoPromotionWrites(tree, manifest, beforeRules, manifestPath, beforeManifest);
  });

  test("refuses registered enforced output through Pattern Governance", async () => {
    const tree = createPatternTree({
      ...emptyRuleRegistryDocument(),
    });
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest({
      lifecycle: "registered-enforced",
      hookScope: {
        decision: "none",
        rationale: "This enforced checkpoint is not hook-scoped.",
        costAndScopeRationale: "This enforced checkpoint is not hook-scoped.",
      },
    });
    const manifestPath = writeRegisteredManifest(tree, manifest);
    const beforeManifest = tree.read(manifestPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: manifest.ruleId,
        patternName: manifest.patternName,
        lifecycle: "registered-enforced",
        manifestPath,
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        requestClass: "active-pattern-registration",
        reason: "registered-manifest-rejected",
        writeSet: [],
      }),
    });

    assertNoPromotionWrites(tree, manifest, beforeRules, manifestPath, beforeManifest);
  });

  test("refuses registered advisory output when the explicit baseline file is missing", async () => {
    const tree = createPatternTree();
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest();
    const manifestPath = writeRegisteredManifest(tree, manifest);
    const beforeManifest = tree.read(manifestPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: manifest.ruleId,
        patternName: manifest.patternName,
        lifecycle: "registered-advisory",
        manifestPath,
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        requestClass: "active-pattern-registration",
        reason: "registered-manifest-rejected",
        writeSet: [],
      }),
    });

    assertNoPromotionWrites(tree, manifest, beforeRules, manifestPath, beforeManifest);
  });

  test("refuses registered enforced output with hook scope through Pattern Governance", async () => {
    const tree = createPatternTree({
      ...emptyRuleRegistryDocument(),
    });
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest({
      lifecycle: "registered-enforced",
      hookScope: {
        decision: "pre-commit",
        rationale: "staged scope accepted for this enforced rule",
        costAndScopeRationale: "staged scope is bounded enough for local hooks",
      },
    });
    const manifestPath = writeRegisteredManifest(tree, manifest);
    const beforeManifest = tree.read(manifestPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: manifest.ruleId,
        patternName: manifest.patternName,
        lifecycle: "registered-enforced",
        manifestPath,
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        requestClass: "active-pattern-registration",
        reason: "registered-manifest-rejected",
        writeSet: [],
      }),
    });

    assertNoPromotionWrites(tree, manifest, beforeRules, manifestPath, beforeManifest);
  });

  test("refuses candidate generation when the rule already exists", async () => {
    const tree = createPatternTree({
      ...emptyRuleRegistryDocument([existingRegistryRule("grit-existing-probe")]),
    });
    const beforeRules = tree.read(rulesPath, "utf8");

    await expect(patternGenerator(tree, { ruleId: "grit-existing-probe" })).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "candidate-collision",
        writeSet: [],
      }),
    });

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
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "candidate-collision",
        writeSet: [],
      }),
    });

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
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "candidate-collision",
        writeSet: [],
      }),
    });

    const candidatePaths = candidateArtifactPaths({
      ruleId: "grit-existing-baseline",
      patternName: "existing_baseline",
    });
    expect(tree.exists(candidatePaths.patternPath)).toBe(false);
    expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
    expect(
      tree.exists("tools/habitat-harness/src/rules/pattern-authority/grit-existing-baseline.json")
    ).toBe(false);
    expect(tree.read("tools/habitat-harness/baselines/grit-existing-baseline.json", "utf8")).toBe(
      "[]\n"
    );
    expect(tree.read(rulesPath, "utf8")).toBe(beforeRules);
  });
});

function createPatternTree(rulesJson: { rules: unknown[] } = emptyRuleRegistryDocument()) {
  const tree = createTreeWithEmptyWorkspace();
  tree.write(rulesPath, `${JSON.stringify(rulesJson, null, 2)}\n`);
  return tree;
}

function emptyRuleRegistryDocument(rules: unknown[] = []) {
  return {
    schemaVersion: 1,
    ownerRoots: {
      "@internal/habitat-harness": "tools/habitat-harness",
    },
    rules,
  };
}

function existingRegistryRule(ruleId: string) {
  return {
    id: ruleId,
    ownerTool: "habitat-native",
    ownerProject: "@internal/habitat-harness",
    lane: "enforced",
    scope: "workspace",
    forbids: "test fixture",
    why: "test fixture",
    detect: ["habitat", "check", "--rule", ruleId],
    remediate: null,
    message: "test fixture",
    exceptionPath: "none",
    pathCoverage: [{ kind: "project-owner" }],
  };
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

function assertNoPromotionWrites(
  tree: ReturnType<typeof createPatternTree>,
  manifest: RegisteredPatternAuthorityManifest,
  beforeRules: string | null,
  manifestPath: string,
  beforeManifest: string | null
) {
  const candidatePaths = candidateArtifactPaths({
    ruleId: manifest.ruleId,
    patternName: manifest.patternName,
  });
  expect(tree.exists(candidatePaths.patternPath)).toBe(false);
  expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
  expect(tree.read(manifestPath, "utf8")).toBe(beforeManifest);
  expect(tree.exists(`.grit/patterns/habitat/checks/${manifest.patternName}.md`)).toBe(false);
  expect(tree.exists(`tools/habitat-harness/baselines/${manifest.ruleId}.json`)).toBe(false);
  expect(tree.read(rulesPath, "utf8")).toBe(beforeRules);
}

function writeRegisteredManifest(
  tree: ReturnType<typeof createPatternTree>,
  manifest: RegisteredPatternAuthorityManifest
) {
  const manifestPath = patternAuthorityManifestPath(manifest.ruleId);
  tree.write(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifestPath;
}

function registeredManifest(
  overrides: Partial<RegisteredPatternAuthorityManifest> = {}
): RegisteredPatternAuthorityManifest {
  return {
    schemaVersion: 1,
    ruleId: "grit-authority-probe",
    patternName: "authority_probe",
    lifecycle: "registered-advisory",
    openspecChangeId: "habitat-pattern-generator-metadata-repair",
    ownerProject: "@internal/habitat-harness",
    ownerTool: "grit-check",
    normativeSources: [
      {
        kind: "accepted-spec",
        pathOrUrl: "openspec/changes/habitat-pattern-generator-metadata-repair/design.md",
        summary:
          "Generated Grit-backed rules require structured Habitat authority before registration.",
      },
    ],
    language: {
      gritLanguage: "js(typescript)",
      parserVariant: "typescript",
      officialDocsSource: "docs/projects/habitat-harness/research/official-docs-gritql.md",
    },
    scanRoots: {
      include: ["tools/habitat-harness/src"],
      exclude: ["tools/habitat-harness/dist"],
      gritignorePolicy: "Use committed .gritignore plus explicit manifest exclusions.",
    },
    fixtureStrategy: {
      positive: ["tools/habitat-harness/test/fixtures/positive.ts"],
      negative: ["tools/habitat-harness/test/fixtures/negative.ts"],
      parserEdge: ["tools/habitat-harness/test/fixtures/parser-edge.ts"],
      falsePositive: ["tools/habitat-harness/test/fixtures/allowed.ts"],
    },
    falsePositiveModel: {
      risk: ["Overmatching structurally similar imports outside the owning source root."],
      controls: ["Constrain scanRoots.include and verify negative fixtures."],
      suppressionPolicy: "No inline suppression accepted for generated registered rules.",
    },
    currentTreeScan: {
      command: "bun run habitat:check -- --json --rule grit-authority-probe",
      resultClass: "zero-findings",
    },
    baselineContract: {
      baselinePath: "tools/habitat-harness/baselines/grit-authority-probe.json",
      ruleIntroductionManifest:
        "openspec/changes/habitat-pattern-generator-metadata-repair/workstream/rule-introduction-baseline.json",
      baselineAction: "committed-empty",
    },
    hookScope: {
      decision: "none",
      rationale: "This advisory checkpoint is not hook-scoped.",
      costAndScopeRationale: "This advisory checkpoint is not hook-scoped.",
    },
    applySafety: {
      kind: "not-apply",
      rationale: "This manifest describes a check-only Grit pattern.",
    },
    ...overrides,
  };
}
