import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";
import {
  applyAdmissionProjection,
  applyAdmittedState,
  diagnosticAdmittedState,
  candidateDraftState,
  candidateHandoffProjection,
  diagnosticAdmissionProjection,
  invalidCandidateState,
  patternAdmissionRefusal,
  patternAuthorityProjection,
  patternRecoveryProjection,
  retiredPatternState,
} from "../../src/rules/pattern-authority/manifest.js";
import {
  ApplyPatternPathSchema,
  RepoRelativePathSchema,
  activeApplyTransactionInputs,
  applyTransactionInputsFromRuleFacts,
  defaultApplyAdmissions,
} from "../../src/rules/pattern-governance/index.js";

describe("Pattern Governance projections", () => {
  test("projects candidate drafts as candidate-only handoff state", () => {
    const state = candidateDraftState(candidateManifest());

    expect(patternAuthorityProjection(state)).toMatchObject({
      patternId: "grit-candidate-probe",
      lifecycle: "candidate-draft",
      admittedCapabilities: [],
    });
    expect(candidateHandoffProjection(state)).toMatchObject({
      kind: "candidate-handoff",
      patternId: "grit-candidate-probe",
      candidatePaths: {
        patternPath:
          "tools/habitat-harness/src/rules/pattern-authority/candidates/candidate_probe.md",
        manifestPath:
          "tools/habitat-harness/src/rules/pattern-authority/candidates/grit-candidate-probe.json",
      },
    });
    expect(diagnosticAdmissionProjection(state)).toBeUndefined();
    expect(applyAdmissionProjection(state)).toBeUndefined();
  });

  test("keeps diagnostic admission separate from apply admission", () => {
    const diagnosticState = diagnosticAdmittedState({
      kind: "diagnostic-admission",
      patternId: "grit-diagnostic-probe",
      manifestPath: "tools/habitat-harness/src/rules/pattern-authority/grit-diagnostic-probe.json",
      diagnosticIdentity: "grit-diagnostic-probe",
      fixtureStrategyRef: "fixtures/grit-diagnostic-probe",
      falsePositiveAssessment: "false-positive model accepted",
      currentTreeDisposition: "current tree accepted by D7 projection",
      nonClaims: ["Diagnostic admission is not apply admission."],
    });

    expect(diagnosticAdmissionProjection(diagnosticState)).toMatchObject({
      kind: "diagnostic-admission",
      patternId: "grit-diagnostic-probe",
    });
    expect(applyAdmissionProjection(diagnosticState)).toBeUndefined();
    expect(patternAuthorityProjection(diagnosticState)).toMatchObject({
      admittedCapabilities: ["diagnostic"],
    });
  });

  test("projects refused and invalid candidate states as recovery, not active admission", () => {
    const refusal = patternAdmissionRefusal({
      reason: "manifest-invalid-candidate",
      patternId: "grit-bad",
      path: "tools/habitat-harness/src/rules/pattern-authority/candidates/grit-bad.json",
      message: "Candidate manifest cannot be admitted.",
      protectedPaths: [".grit/patterns/habitat/checks/bad.md"],
    });
    const state = invalidCandidateState(refusal);

    expect(patternAuthorityProjection(state)).toMatchObject({
      lifecycle: "manifest-invalid-candidate",
      admittedCapabilities: [],
      refusalReason: "manifest-invalid-candidate",
    });
    expect(patternRecoveryProjection(state)).toMatchObject({
      kind: "pattern-recovery",
      reason: "manifest-invalid-candidate",
    });
    expect(diagnosticAdmissionProjection(state)).toBeUndefined();
    expect(applyAdmissionProjection(state)).toBeUndefined();
  });

  test("retired patterns do not project active admission", () => {
    const state = retiredPatternState({
      patternId: "grit-retired-probe",
      manifestPath: "tools/habitat-harness/src/rules/pattern-authority/grit-retired-probe.json",
      reason: "superseded by a narrower rule",
      recovery: {
        kind: "pattern-recovery",
        patternId: "grit-retired-probe",
        owner: "D8",
        reason: "retired-pattern-referenced",
        nextAction: "Create a new admission decision before reuse.",
        nonClaims: ["Retirement recovery does not reactivate a pattern."],
      },
    });

    expect(patternAuthorityProjection(state)).toMatchObject({
      lifecycle: "retired",
      admittedCapabilities: [],
    });
    expect(diagnosticAdmissionProjection(state)).toBeUndefined();
    expect(applyAdmissionProjection(state)).toBeUndefined();
  });

  test("default apply admissions project through D8 admitted state", () => {
    const admissions = defaultApplyAdmissions();
    const transactionInputs = activeApplyTransactionInputs();

    expect(admissions.length).toBeGreaterThan(0);
    for (const admission of admissions) {
      expect(applyAdmissionProjection(applyAdmittedState(admission))).toEqual(admission);
      expect(
        transactionInputs.some(
          (input) =>
            input.patternId === admission.patternId &&
            input.manifestPath === admission.manifestPath &&
            input.transactionInputRef === admission.transactionInputRef &&
            input.dryRunCommands.every((command) => command.roots.length > 0)
        )
      ).toBe(true);
    }
  });

  test("missing rule facts do not synthesize transaction inputs", () => {
    expect(applyTransactionInputsFromRuleFacts(defaultApplyAdmissions(), [])).toEqual([]);
  });

  test("apply transaction paths stay repo-relative and non-traversing", () => {
    expect(Value.Check(RepoRelativePathSchema, "mods/mod-swooper-maps/src/maps")).toBe(true);
    expect(Value.Check(RepoRelativePathSchema, "/tmp/repo")).toBe(false);
    expect(Value.Check(RepoRelativePathSchema, "C:/Users/me/repo")).toBe(false);
    expect(Value.Check(RepoRelativePathSchema, "mods/../secrets")).toBe(false);
    expect(
      Value.Check(
        ApplyPatternPathSchema,
        ".grit/patterns/habitat/apply/deep_import_to_public_surface.md"
      )
    ).toBe(true);
    expect(Value.Check(ApplyPatternPathSchema, ".grit/patterns/habitat/apply/../x.md")).toBe(
      false
    );
  });
});

function candidateManifest() {
  return {
    schemaVersion: 1 as const,
    ruleId: "grit-candidate-probe",
    patternName: "candidate_probe",
    lifecycle: "candidate" as const,
    openspecChangeId: "deep-habitat-d8-pattern-governance",
    ownerProject: "@internal/habitat-harness",
    ownerTool: "grit-check" as const,
    candidateArtifacts: {
      patternPath:
        "tools/habitat-harness/src/rules/pattern-authority/candidates/candidate_probe.md",
      manifestPath:
        "tools/habitat-harness/src/rules/pattern-authority/candidates/grit-candidate-probe.json",
    },
    registration: {
      accepted: false as const,
      reason: "candidate-only generation",
    },
    requiredForRegistration: ["D2 governance facts", "D5 baseline authority", "D6 diagnostics"],
  };
}
