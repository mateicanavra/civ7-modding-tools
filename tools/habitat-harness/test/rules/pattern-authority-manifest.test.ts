import { describe, expect, test } from "vitest";
import {
  patternAuthorityManifestPath,
  patternAuthorityRuleReferenceFromRule,
  type RegisteredPatternAuthorityManifest,
  validatePatternAuthorityManifest,
} from "../../src/rules/pattern-authority/manifest.js";

describe("Pattern Authority Manifest validator", () => {
  test("accepts a structured registered advisory manifest with a matching rule reference", () => {
    const manifest = registeredManifest();
    const result = validatePatternAuthorityManifest(manifest, {
      manifestPath: patternAuthorityManifestPath(manifest.ruleId),
      requireRuleReference: true,
      ruleReferences: [
        {
          ruleId: manifest.ruleId,
          patternName: manifest.patternName,
          manifestPath: patternAuthorityManifestPath(manifest.ruleId),
          ownerTool: "grit-check",
          lifecycle: "advisory",
        },
      ],
    });

    expect(result).toMatchObject({
      ok: true,
      state: "registered-advisory",
      authorityAccepted: false,
    });
  });

  test("classifies candidate manifests as valid drafts, not accepted authority", () => {
    const result = validatePatternAuthorityManifest({
      schemaVersion: 1,
      ruleId: "grit-candidate-probe",
      patternName: "candidate_probe",
      lifecycle: "candidate",
      openspecChangeId: "habitat-pattern-generator-metadata-repair",
      ownerProject: "@internal/habitat-harness",
      ownerTool: "grit-check",
      candidateArtifacts: {
        patternPath:
          "tools/habitat-harness/src/rules/pattern-authority/candidates/candidate_probe.md",
        manifestPath:
          "tools/habitat-harness/src/rules/pattern-authority/candidates/grit-candidate-probe.json",
      },
      registration: {
        accepted: false,
        reason: "candidate-only generation",
      },
      requiredForRegistration: ["accepted authority source"],
    });

    expect(result).toMatchObject({
      ok: true,
      state: "candidate",
      authorityAccepted: false,
    });
  });

  test("reports a missing manifest", () => {
    const result = validatePatternAuthorityManifest(undefined, {
      manifestPath: patternAuthorityManifestPath("grit-missing-probe"),
    });

    expect(issueReasons(result)).toContain("missing-manifest");
  });

  test("reports malformed manifest fields", () => {
    const result = validatePatternAuthorityManifest({
      schemaVersion: 1,
      ruleId: "grit-malformed-probe",
      patternName: "malformed_probe",
      lifecycle: "registered-advisory",
      ownerTool: "grit-check",
    });

    expect(issueReasons(result)).toContain("malformed-manifest");
  });

  test("rejects placeholder authority text", () => {
    const manifest = registeredManifest({
      normativeSources: [
        {
          kind: "accepted-spec",
          pathOrUrl: "openspec/changes/habitat-pattern-generator-metadata-repair/design.md",
          summary: "TODO replace with architectural rationale",
        },
      ],
    });

    const result = validatePatternAuthorityManifest(manifest);

    expect(issueReasons(result)).toContain("placeholder-manifest");
  });

  test("rejects contradicted registered manifest states", () => {
    const manifest = registeredManifest({
      lifecycle: "registered-advisory",
      hookScope: {
        decision: "pre-commit",
        rationale: "staged scope is accepted for this rule",
        costAndScopeRationale: "staged scope is bounded and low cost for this rule",
      },
    });

    const result = validatePatternAuthorityManifest(manifest);

    expect(issueReasons(result)).toContain("contradicted-manifest");
  });

  test("rejects orphan registered manifests when a rule-pack reference is required", () => {
    const manifest = registeredManifest();
    const result = validatePatternAuthorityManifest(manifest, {
      manifestPath: patternAuthorityManifestPath(manifest.ruleId),
      requireRuleReference: true,
      ruleReferences: [],
    });

    expect(issueReasons(result)).toContain("orphan-manifest");
  });

  test("rejects registered manifests outside the canonical source-artifact path", () => {
    const manifest = registeredManifest();
    const result = validatePatternAuthorityManifest(manifest, {
      manifestPath:
        "tools/habitat-harness/src/rules/pattern-authority/candidates/grit-authority-probe.json",
      requireRuleReference: true,
      ruleReferences: [
        {
          ruleId: manifest.ruleId,
          patternName: manifest.patternName,
          manifestPath:
            "tools/habitat-harness/src/rules/pattern-authority/candidates/grit-authority-probe.json",
          ownerTool: "grit-check",
          lifecycle: "advisory",
        },
      ],
    });

    expect(issueReasons(result)).toContain("contradicted-manifest");
  });

  test("rejects registered rule-pack references without manifest paths", () => {
    const manifest = registeredManifest();
    const result = validatePatternAuthorityManifest(manifest, {
      manifestPath: patternAuthorityManifestPath(manifest.ruleId),
      requireRuleReference: true,
      ruleReferences: [
        {
          ruleId: manifest.ruleId,
          patternName: manifest.patternName,
          manifestPath: "",
          ownerTool: "grit-check",
          lifecycle: "advisory",
        },
      ],
    });

    expect(issueReasons(result)).toContain("orphan-manifest");
  });

  test("rejects sparse registered rule-pack references", () => {
    const manifest = registeredManifest();
    const result = validatePatternAuthorityManifest(manifest, {
      manifestPath: patternAuthorityManifestPath(manifest.ruleId),
      requireRuleReference: true,
      ruleReferences: [
        {
          ruleId: manifest.ruleId,
          manifestPath: patternAuthorityManifestPath(manifest.ruleId),
        },
      ],
    });

    expect(issueReasons(result)).toContain("orphan-manifest");
  });

  test("projects Habitat rule metadata into a Pattern Authority rule reference", () => {
    expect(
      patternAuthorityRuleReferenceFromRule({
        id: "grit-authority-probe",
        gritPattern: "authority_probe",
        manifestPath: patternAuthorityManifestPath("grit-authority-probe"),
        ownerTool: "grit-check",
        lane: "advisory",
      })
    ).toEqual({
      ruleId: "grit-authority-probe",
      patternName: "authority_probe",
      manifestPath: patternAuthorityManifestPath("grit-authority-probe"),
      ownerTool: "grit-check",
      lifecycle: "advisory",
    });
  });

  test("rejects Grit frontmatter or prose as Habitat authority", () => {
    const result = validatePatternAuthorityManifest({
      frontmatter: { level: "error", tags: ["habitat"] },
      markdown: "# Rule rationale\n\nThis prose explains the Grit pattern.",
    });

    expect(issueReasons(result)).toContain("grit-metadata-only");
  });

  test("rejects Nx generator options as Habitat authority", () => {
    const result = validatePatternAuthorityManifest({
      ruleId: "grit-options-probe",
      patternName: "options_probe",
      lifecycle: "registered-enforced",
      ownerProject: "@internal/habitat-harness",
      scope: "source scope",
      forbids: "forbidden shape",
      why: "architectural rationale",
      message: "diagnostic message",
    });

    expect(issueReasons(result)).toContain("nx-options-only");
  });

  test("rejects placeholder baseline manifest references", () => {
    const result = validatePatternAuthorityManifest(
      registeredManifest({
        baselineContract: {
          baselinePath: "tools/habitat-harness/baselines/grit-authority-probe.json",
          ruleIntroductionManifest: "TODO replace with baseline manifest path",
          baselineAction: "committed-empty",
        },
      })
    );

    expect(issueReasons(result)).toContain("placeholder-manifest");
  });
});

function issueReasons(result: ReturnType<typeof validatePatternAuthorityManifest>) {
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues.map((issue) => issue.reason);
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
