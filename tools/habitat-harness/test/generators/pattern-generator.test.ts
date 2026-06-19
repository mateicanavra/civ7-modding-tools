import { createRequire } from "node:module";
import { readJson } from "@nx/devkit";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { describe, expect, test } from "vitest";
import {
  patternAuthorityManifestPath,
  type RegisteredPatternAuthorityManifest,
  validatePatternAuthorityManifest,
} from "../../src/rules/pattern-authority/manifest.js";

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

  test("refuses registered advisory generation without a manifest before any writes", async () => {
    const tree = createPatternTree();
    const beforeRules = tree.read(rulesPath, "utf8");

    await expect(
      patternGenerator(tree, {
        ruleId: "grit-advisory-probe",
        lifecycle: "registered-advisory",
      })
    ).rejects.toThrow("requires --manifestPath");

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
    ).rejects.toThrow("requires --manifestPath");

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
          claim: "TODO replace with accepted authority claim",
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
    ).rejects.toThrow("placeholder-manifest");

    assertNoPromotionWrites(tree, manifest, beforeRules, manifestPath, beforeManifest);
  });

  test("refuses registered hook scope unless the invocation and manifest agree", async () => {
    const tree = createPatternTree();
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest({
      lifecycle: "registered-enforced",
      hookScope: {
        decision: "pre-commit",
        rationale: "staged-scope evidence accepted for this enforced rule",
        costAndScopeEvidence:
          "openspec/changes/habitat-pattern-generator-metadata-repair/workstream/phase-record.md",
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
    ).rejects.toThrow(
      "Manifest pre-commit hook scope requires matching rule-pack local feedback eligibility"
    );

    assertNoPromotionWrites(tree, manifest, beforeRules, manifestPath, beforeManifest);
  });

  test("writes registered advisory output after accepted manifest and explicit baseline contract", async () => {
    const tree = createPatternTree({
      $comment: "preserve rule-pack metadata",
      rules: [],
    });
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest();
    const manifestPath = writeRegisteredManifest(tree, manifest);
    const beforeManifest = tree.read(manifestPath, "utf8");
    writeBaselineContract(tree, manifest);

    await patternGenerator(tree, {
      ruleId: manifest.ruleId,
      patternName: manifest.patternName,
      lifecycle: "registered-advisory",
      manifestPath,
    });

    assertRegisteredWrites(tree, manifest, beforeRules, manifestPath, beforeManifest, "advisory");
  });

  test("writes registered enforced output after accepted non-hook manifest and explicit baseline contract", async () => {
    const tree = createPatternTree({
      $comment: "preserve rule-pack metadata",
      rules: [],
    });
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest({
      lifecycle: "registered-enforced",
      hookScope: {
        decision: "none",
        rationale: "This enforced checkpoint is not hook-scoped.",
        costAndScopeEvidence:
          "openspec/changes/habitat-pattern-generator-metadata-repair/workstream/phase-record.md",
      },
    });
    const manifestPath = writeRegisteredManifest(tree, manifest);
    const beforeManifest = tree.read(manifestPath, "utf8");
    writeBaselineContract(tree, manifest);

    await patternGenerator(tree, {
      ruleId: manifest.ruleId,
      patternName: manifest.patternName,
      lifecycle: "registered-enforced",
      manifestPath,
    });

    assertRegisteredWrites(tree, manifest, beforeRules, manifestPath, beforeManifest, "enforced");
  });

  test("refuses registered advisory output when the explicit baseline file is missing", async () => {
    const tree = createPatternTree();
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest();
    const manifestPath = writeRegisteredManifest(tree, manifest);
    const beforeManifest = tree.read(manifestPath, "utf8");
    tree.write(manifest.baselineContract.ruleIntroductionManifest, baselineContractText(manifest));

    await expect(
      patternGenerator(tree, {
        ruleId: manifest.ruleId,
        patternName: manifest.patternName,
        lifecycle: "registered-advisory",
        manifestPath,
      })
    ).rejects.toThrow("baseline file");

    assertNoPromotionWrites(tree, manifest, beforeRules, manifestPath, beforeManifest);
  });

  test("writes registered enforced pre-commit hook-scoped output after accepted hook evidence", async () => {
    const tree = createPatternTree({
      $comment: "preserve rule-pack metadata",
      rules: [],
    });
    const beforeRules = tree.read(rulesPath, "utf8");
    const manifest = registeredManifest({
      lifecycle: "registered-enforced",
      hookScope: {
        decision: "pre-commit",
        rationale: "staged-scope evidence accepted for this enforced rule",
        costAndScopeEvidence:
          "openspec/changes/habitat-pattern-generator-metadata-repair/workstream/phase-record.md",
      },
    });
    const manifestPath = writeRegisteredManifest(tree, manifest);
    const beforeManifest = tree.read(manifestPath, "utf8");
    writeBaselineContract(tree, manifest);

    await patternGenerator(tree, {
      ruleId: manifest.ruleId,
      patternName: manifest.patternName,
      lifecycle: "registered-enforced",
      manifestPath,
      hookScope: "pre-commit",
    });

    assertRegisteredWrites(tree, manifest, beforeRules, manifestPath, beforeManifest, "enforced");
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

    await expect(patternGenerator(tree, { ruleId: "grit-existing-baseline" })).rejects.toThrow(
      "Baseline already exists"
    );

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

function assertRegisteredWrites(
  tree: ReturnType<typeof createPatternTree>,
  manifest: RegisteredPatternAuthorityManifest,
  beforeRules: string | null,
  manifestPath: string,
  beforeManifest: string | null,
  lane: "advisory" | "enforced"
) {
  const candidatePaths = candidateArtifactPaths({
    ruleId: manifest.ruleId,
    patternName: manifest.patternName,
  });
  expect(tree.exists(candidatePaths.patternPath)).toBe(false);
  expect(tree.exists(candidatePaths.manifestPath)).toBe(false);
  expect(tree.read(manifestPath, "utf8")).toBe(beforeManifest);
  expect(tree.read(manifest.baselineContract.baselinePath, "utf8")).toBe("[]\n");
  const activePatternPath = `.grit/patterns/habitat/checks/${manifest.patternName}.md`;
  expect(tree.exists(activePatternPath)).toBe(true);
  expect(tree.read(activePatternPath, "utf8")).toContain("level: error");
  expect(tree.read(activePatternPath, "utf8")).toContain(`habitat-${lane}`);
  expect(tree.read(activePatternPath, "utf8")).toContain("language js(typescript)");
  const before = beforeRules ? JSON.parse(beforeRules) : { rules: [] };
  const rules = readJson(tree, rulesPath);
  expect(rules.$comment).toBe(before.$comment);
  expect(rules.rules).toHaveLength(before.rules.length + 1);
  expect(rules.rules.at(-1)).toMatchObject({
    id: manifest.ruleId,
    ownerTool: "grit-check",
    ownerProject: manifest.ownerProject,
    lane,
    detect: ["habitat", "check", "--tool", "grit-check"],
    gritPattern: manifest.patternName,
    scanRoots: manifest.scanRoots.include,
    manifestPath,
  });
  if (manifest.hookScope.decision === "pre-commit") {
    expect(rules.rules.at(-1)).toMatchObject({ localFeedback: true });
    expect(rules.rules.at(-1)).not.toHaveProperty("hookScope");
  } else {
    expect(rules.rules.at(-1)).not.toHaveProperty("localFeedback");
    expect(rules.rules.at(-1)).not.toHaveProperty("hookScope");
  }
}

function writeRegisteredManifest(
  tree: ReturnType<typeof createPatternTree>,
  manifest: RegisteredPatternAuthorityManifest
) {
  const manifestPath = patternAuthorityManifestPath(manifest.ruleId);
  tree.write(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifestPath;
}

function writeBaselineContract(
  tree: ReturnType<typeof createPatternTree>,
  manifest: RegisteredPatternAuthorityManifest
) {
  tree.write(manifest.baselineContract.baselinePath, "[]\n");
  tree.write(manifest.baselineContract.ruleIntroductionManifest, baselineContractText(manifest));
}

function baselineContractText(manifest: RegisteredPatternAuthorityManifest) {
  return `${JSON.stringify(
    {
      changeId: manifest.openspecChangeId,
      ruleId: manifest.ruleId,
      ownerProject: manifest.ownerProject,
      ownerTool: manifest.ownerTool,
      baselinePath: manifest.baselineContract.baselinePath,
      initialBaselineKeys: [],
      comparisonBase: "HEAD",
    },
    null,
    2
  )}\n`;
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
        claim:
          "Generated Grit-backed rules require structured Habitat authority before registration.",
      },
    ],
    provingSources: [
      {
        kind: "test",
        pathOrCommand: "bun run --cwd tools/habitat-harness test -- pattern-generator.test.ts",
        claim: "The generator validates registered manifests before promotion writes.",
      },
    ],
    language: {
      gritLanguage: "js(typescript)",
      parserVariant: "typescript",
      officialDocsSource: "docs/projects/habitat-harness/research/official-docs-gritql.md",
      localProofCommand:
        "GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --verbose",
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
      evidencePath:
        "openspec/changes/habitat-pattern-generator-metadata-repair/workstream/command-proof-log.md",
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
      costAndScopeEvidence:
        "openspec/changes/habitat-pattern-generator-metadata-repair/workstream/phase-record.md",
    },
    applySafety: {
      kind: "not-apply",
      rationale: "This manifest describes a check-only Grit pattern.",
    },
    ...overrides,
  };
}
