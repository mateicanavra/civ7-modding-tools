import { readJson } from "@nx/devkit";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { describe, expect, test } from "vitest";
import {
  patternManifestPath,
  type RegisteredPatternManifest,
  validatePatternManifest,
} from "../../src/domains/pattern-governance/index.js";
import {
  candidateArtifactPaths,
  patternGenerator,
} from "../../src/generators/pattern/generator.js";

const rulesPath = ".habitat/rules";
const indexPath = `${rulesPath}/index.json`;

describe("Habitat pattern generator", () => {
  test("creates candidate artifacts without registering active enforcement state", async () => {
    const tree = createPatternTree();

    await patternGenerator(tree, { ruleId: "dra-metadata-probe" });

    const candidatePaths = candidateArtifactPaths({
      ruleId: "dra-metadata-probe",
      patternName: "dra_metadata_probe",
    });
    expect(tree.exists(candidatePaths.patternPath)).toBe(true);
    expect(tree.exists(candidatePaths.manifestPath)).toBe(true);
    expect(tree.exists(".habitat/patterns/checks/dra_metadata_probe.md")).toBe(false);
    expect(tree.exists(".habitat/baselines/dra-metadata-probe.json")).toBe(false);
    expect(readJson(tree, indexPath)).toMatchObject({
      schemaVersion: 1,
      ownerRoots: { "@internal/habitat-harness": "tools/habitat-harness" },
    });

    const manifest = readJson(tree, candidatePaths.manifestPath);
    expect(manifest).toMatchObject({
      schemaVersion: 1,
      ruleId: "dra-metadata-probe",
      patternName: "dra_metadata_probe",
      lifecycle: "candidate",
      openspecChangeId: "habitat-pattern-generator-metadata-repair",
      ownerTool: "pattern-check",
      registration: { accepted: false },
    });
    expect(
      validatePatternManifest(manifest, {
        manifestPath: candidatePaths.manifestPath,
      })
    ).toMatchObject({
      ok: true,
      state: "candidate",
      registrationAccepted: false,
    });
    expect(tree.read(candidatePaths.patternPath, "utf8")).toContain("level: info");
  });

  test("refuses registered advisory generation without a manifest before any writes", async () => {
    const tree = createPatternTree();
    const beforeIndex = tree.read(indexPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: "advisory-probe",
        lifecycle: "registered-advisory",
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        requestClass: "active-pattern-registration",
        reason: "registered-manifest-missing",
        writeSet: [],
      }),
    });

    assertNoGeneratedArtifacts(tree, "advisory-probe", "advisory_probe", beforeIndex);
  });

  test("refuses registered enforced generation without a manifest before any writes", async () => {
    const tree = createPatternTree();
    const beforeIndex = tree.read(indexPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: "enforced-probe",
        lifecycle: "registered-enforced",
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        requestClass: "active-pattern-registration",
        reason: "registered-manifest-missing",
        writeSet: [],
      }),
    });

    assertNoGeneratedArtifacts(tree, "enforced-probe", "enforced_probe", beforeIndex);
  });

  test("refuses registered generation when the manifest keeps placeholder manifest", async () => {
    const tree = createPatternTree();
    const beforeIndex = tree.read(indexPath, "utf8");
    const manifest = registeredManifest({
      normativeSources: [
        {
          kind: "accepted-spec",
          pathOrUrl: "openspec/changes/habitat-pattern-generator-metadata-repair/design.md",
          summary: "Accepted registration source for the fixture manifest.",
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

    assertNoPromotionWrites(tree, manifest, beforeIndex, manifestPath, beforeManifest);
  });

  test("refuses registered advisory output through pattern management", async () => {
    const tree = createPatternTree({
      ...emptyRuleRegistryDocument(),
    });
    const beforeIndex = tree.read(indexPath, "utf8");
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

    assertNoPromotionWrites(tree, manifest, beforeIndex, manifestPath, beforeManifest);
  });

  test("refuses registered enforced output through pattern management", async () => {
    const tree = createPatternTree({
      ...emptyRuleRegistryDocument(),
    });
    const beforeIndex = tree.read(indexPath, "utf8");
    const manifest = registeredManifest({
      lifecycle: "registered-enforced",
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

    assertNoPromotionWrites(tree, manifest, beforeIndex, manifestPath, beforeManifest);
  });

  test("refuses registered advisory output when the explicit baseline file is missing", async () => {
    const tree = createPatternTree();
    const beforeIndex = tree.read(indexPath, "utf8");
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

    assertNoPromotionWrites(tree, manifest, beforeIndex, manifestPath, beforeManifest);
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

    const candidatePaths = candidateArtifactPaths({
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

  test("refuses candidate generation when an active baseline already exists", async () => {
    const tree = createPatternTree();
    tree.write(".habitat/baselines/existing-baseline.json", "[]\n");
    const beforeIndex = tree.read(indexPath, "utf8");

    await expect(patternGenerator(tree, { ruleId: "existing-baseline" })).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "candidate-collision",
        writeSet: [],
      }),
    });

    const candidatePaths = candidateArtifactPaths({
      ruleId: "existing-baseline",
      patternName: "existing_baseline",
    });
    expect(tree.exists(candidatePaths.patternPath)).toBe(false);
    expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
    expect(tree.exists(".habitat/patterns/manifests/existing-baseline.json")).toBe(false);
    expect(tree.read(".habitat/baselines/existing-baseline.json", "utf8")).toBe("[]\n");
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
        schemaVersion: 1,
        ownerRoots: rulesJson.ownerRoots,
      },
      null,
      2
    )}\n`
  );
  for (const rule of rulesJson.rules) {
    const id = (rule as { id?: unknown }).id;
    if (typeof id !== "string") continue;
    tree.write(`${rulesPath}/${id}/rule.json`, `${JSON.stringify(rule, null, 2)}\n`);
  }
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
    ownerTool: "command-check",
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
  beforeIndex: string | null
) {
  const candidatePaths = candidateArtifactPaths({ ruleId, patternName });
  expect(tree.exists(candidatePaths.patternPath)).toBe(false);
  expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
  expect(tree.exists(`.habitat/patterns/manifests/${ruleId}.json`)).toBe(false);
  expect(tree.exists(`.habitat/patterns/checks/${patternName}.md`)).toBe(false);
  expect(tree.exists(`.habitat/baselines/${ruleId}.json`)).toBe(false);
  expect(tree.read(indexPath, "utf8")).toBe(beforeIndex);
}

function assertNoPromotionWrites(
  tree: ReturnType<typeof createPatternTree>,
  manifest: RegisteredPatternManifest,
  beforeIndex: string | null,
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
  expect(tree.exists(`.habitat/patterns/checks/${manifest.patternName}.md`)).toBe(false);
  expect(tree.exists(`.habitat/baselines/${manifest.ruleId}.json`)).toBe(false);
  expect(tree.read(indexPath, "utf8")).toBe(beforeIndex);
}

function writeRegisteredManifest(
  tree: ReturnType<typeof createPatternTree>,
  manifest: RegisteredPatternManifest
) {
  const manifestPath = patternManifestPath(manifest.ruleId);
  tree.write(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifestPath;
}

function registeredManifest(
  overrides: Partial<RegisteredPatternManifest> = {}
): RegisteredPatternManifest {
  return {
    schemaVersion: 1,
    ruleId: "registration-probe",
    patternName: "registration_probe",
    lifecycle: "registered-advisory",
    openspecChangeId: "habitat-pattern-generator-metadata-repair",
    ownerProject: "@internal/habitat-harness",
    ownerTool: "pattern-check",
    normativeSources: [
      {
        kind: "accepted-spec",
        pathOrUrl: "openspec/changes/habitat-pattern-generator-metadata-repair/design.md",
        summary:
          "Generated Grit-backed rules require structured Habitat pattern metadata before registration.",
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
      command: "bun run habitat:check -- --json --rule registration-probe",
      resultClass: "zero-findings",
    },
    baselineContract: {
      baselinePath: ".habitat/baselines/registration-probe.json",
      ruleIntroductionManifest:
        "openspec/changes/habitat-pattern-generator-metadata-repair/workstream/rule-introduction-baseline.json",
      baselineAction: "committed-empty",
    },
    applySafety: {
      kind: "not-apply",
      rationale: "This manifest describes a check-only Grit pattern.",
    },
    ...overrides,
  };
}
