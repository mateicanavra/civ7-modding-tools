import type { RegisteredPatternManifest } from "@habitat/cli/service/modules/fix/model/dto/index";
import {
  patternManifestPath,
  patternRuleReferenceFromRule,
  validatePatternManifest,
} from "@habitat/cli/service/modules/fix/model/policy/index";
import { describe, expect, test } from "vitest";

describe("pattern manifest validator", () => {
  test("accepts a structured registered advisory manifest with a matching rule reference", () => {
    const manifest = registeredManifest();
    const result = validatePatternManifest(manifest, {
      manifestPath: patternManifestPath(manifest.ruleId),
      requireRuleReference: true,
      ruleReferences: [
        {
          ruleId: manifest.ruleId,
          patternName: manifest.patternName,
          manifestPath: patternManifestPath(manifest.ruleId),
          patternRole: "diagnostic",
          lifecycle: "advisory",
        },
      ],
    });

    expect(result).toMatchObject({
      ok: true,
      state: "registered-advisory",
      registrationAccepted: false,
    });
  });

  test("classifies candidate manifests as valid drafts, not registered", () => {
    const result = validatePatternManifest({
      schemaVersion: 1,
      ruleId: "candidate-probe",
      patternName: "candidate_probe",
      lifecycle: "candidate",
      openspecChangeId: "habitat-pattern-generator-metadata-repair",
      ownerProject: "habitat",
      patternRole: "diagnostic",
      candidateAuthorityFiles: {
        patternPath: ".habitat/patterns/candidates/candidate_probe.md",
        manifestPath: ".habitat/patterns/candidates/candidate-probe.json",
      },
      registration: {
        accepted: false,
        reason: "candidate-only generation",
      },
      requiredForRegistration: ["accepted registration manifest"],
    });

    expect(result).toMatchObject({
      ok: true,
      state: "candidate",
      registrationAccepted: false,
    });
  });

  test("reports a missing manifest", () => {
    const result = validatePatternManifest(undefined, {
      manifestPath: patternManifestPath("missing-probe"),
    });

    expect(issueReasons(result)).toContain("missing-manifest");
  });

  test("reports malformed manifest fields", () => {
    const result = validatePatternManifest({
      schemaVersion: 1,
      ruleId: "malformed-probe",
      patternName: "malformed_probe",
      lifecycle: "registered-advisory",
      patternRole: "diagnostic",
    });

    expect(issueReasons(result)).toContain("malformed-manifest");
  });

  test("rejects placeholder manifest text", () => {
    const manifest = registeredManifest({
      normativeSources: [
        {
          kind: "accepted-spec",
          pathOrUrl: "openspec/changes/habitat-pattern-generator-metadata-repair/design.md",
          summary: "Replace with architectural rationale before registration",
        },
      ],
    });

    const result = validatePatternManifest(manifest);

    expect(issueReasons(result)).toContain("placeholder-manifest");
  });

  test("rejects orphan registered manifests when a rule-pack reference is required", () => {
    const manifest = registeredManifest();
    const result = validatePatternManifest(manifest, {
      manifestPath: patternManifestPath(manifest.ruleId),
      requireRuleReference: true,
      ruleReferences: [],
    });

    expect(issueReasons(result)).toContain("orphan-manifest");
  });

  test("rejects registered manifests outside the canonical source-authority path", () => {
    const manifest = registeredManifest();
    const result = validatePatternManifest(manifest, {
      manifestPath: ".habitat/patterns/candidates/registration-probe.json",
      requireRuleReference: true,
      ruleReferences: [
        {
          ruleId: manifest.ruleId,
          patternName: manifest.patternName,
          manifestPath: ".habitat/patterns/candidates/registration-probe.json",
          patternRole: "diagnostic",
          lifecycle: "advisory",
        },
      ],
    });

    expect(issueReasons(result)).toContain("contradicted-manifest");
  });

  test("rejects registered rule-pack references without manifest paths", () => {
    const manifest = registeredManifest();
    const result = validatePatternManifest(manifest, {
      manifestPath: patternManifestPath(manifest.ruleId),
      requireRuleReference: true,
      ruleReferences: [
        {
          ruleId: manifest.ruleId,
          patternName: manifest.patternName,
          manifestPath: "",
          patternRole: "diagnostic",
          lifecycle: "advisory",
        },
      ],
    });

    expect(issueReasons(result)).toContain("orphan-manifest");
  });

  test("rejects sparse registered rule-pack references", () => {
    const manifest = registeredManifest();
    const result = validatePatternManifest(manifest, {
      manifestPath: patternManifestPath(manifest.ruleId),
      requireRuleReference: true,
      ruleReferences: [
        {
          ruleId: manifest.ruleId,
          manifestPath: patternManifestPath(manifest.ruleId),
        },
      ],
    });

    expect(issueReasons(result)).toContain("orphan-manifest");
  });

  test("projects Habitat rule metadata into a pattern manifest rule reference", () => {
    expect(
      patternRuleReferenceFromRule({
        id: "registration-probe",
        runner: {
          name: "grit",
          patternPath: ".habitat/fixtures/rules/registration-probe/pattern.md",
          patternName: "registration_probe",
        },
        manifestPath: patternManifestPath("registration-probe"),
        patternRole: "diagnostic",
        lane: "advisory",
      })
    ).toEqual({
      ruleId: "registration-probe",
      patternName: "registration_probe",
      manifestPath: patternManifestPath("registration-probe"),
      patternRole: "diagnostic",
      lifecycle: "advisory",
    });
  });

  test("rejects Grit frontmatter or prose as Habitat pattern metadata", () => {
    const result = validatePatternManifest({
      frontmatter: { level: "error", tags: ["habitat"] },
      markdown: "# Rule rationale\n\nThis prose explains the Grit pattern.",
    });

    expect(issueReasons(result)).toContain("metadata-only");
  });

  test("rejects Nx generator options as Habitat pattern metadata", () => {
    const result = validatePatternManifest({
      ruleId: "options-probe",
      patternName: "options_probe",
      lifecycle: "registered-enforced",
      ownerProject: "habitat",
      scope: "source scope",
      forbids: "forbidden shape",
      why: "architectural rationale",
      message: "diagnostic message",
    });

    expect(issueReasons(result)).toContain("nx-options-only");
  });

  test("rejects placeholder baseline manifest references", () => {
    const result = validatePatternManifest(
      registeredManifest({
        baselineContract: {
          baselinePath: ".habitat/baselines/registration-probe.json",
          ruleIntroductionManifest: "placeholder-baseline-manifest-path",
          baselineAction: "committed-empty",
        },
      })
    );

    expect(issueReasons(result)).toContain("placeholder-manifest");
  });
});

function issueReasons(result: ReturnType<typeof validatePatternManifest>) {
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues.map((issue) => issue.reason);
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
    ownerProject: "habitat",
    patternRole: "diagnostic",
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
      include: ["tools/habitat/src"],
      exclude: ["tools/habitat/dist"],
      gritignorePolicy: "Use committed .gritignore plus explicit manifest exclusions.",
    },
    fixtureStrategy: {
      positive: ["tools/habitat/test/fixtures/positive.ts"],
      negative: ["tools/habitat/test/fixtures/negative.ts"],
      parserEdge: ["tools/habitat/test/fixtures/parser-edge.ts"],
      falsePositive: ["tools/habitat/test/fixtures/allowed.ts"],
    },
    falsePositiveModel: {
      risk: ["Overmatching structurally similar imports outside the owning source root."],
      controls: ["Constrain scanRoots.include and verify negative fixtures."],
      suppressionPolicy: "No inline suppression accepted for generated registered rules.",
    },
    currentTreeScan: {
      command: "bun habitat check --json --rule registration-probe",
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
