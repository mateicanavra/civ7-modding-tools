import {
  ApplyPatternPathSchema,
  RepoRelativePathSchema,
} from "@habitat/cli/service/modules/fix/model/dto/index";
import {
  admittedApplyTransactionInputs,
  applyAdmission,
  applyAdmittedState,
  applyTransactionInputsFromRuleFacts,
  candidateDraftState,
  candidateHandoff,
  defaultApplyAdmissions,
  diagnosticAdmission,
  diagnosticAdmittedState,
  invalidCandidateState,
  patternAdmissionRefusal,
  patternRecovery,
  patternView,
  retiredPatternState,
} from "@habitat/cli/service/modules/fix/model/policy/index";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";
import { makeTestRuleFacts } from "../support/habitat-service-deps.js";

describe("pattern management views", () => {
  test("returns candidate drafts as candidate-only handoff state", () => {
    const state = candidateDraftState(candidateManifest());

    expect(patternView(state)).toMatchObject({
      patternId: "candidate-probe",
      lifecycle: "candidate-draft",
      admittedCapabilities: [],
    });
    expect(candidateHandoff(state)).toMatchObject({
      kind: "candidate-handoff",
      patternId: "candidate-probe",
      candidatePaths: {
        patternPath: ".habitat/patterns/candidates/candidate_probe.md",
        manifestPath: ".habitat/patterns/candidates/candidate-probe.json",
      },
    });
    expect(diagnosticAdmission(state)).toBeUndefined();
    expect(applyAdmission(state)).toBeUndefined();
  });

  test("keeps diagnostic admission separate from apply admission", () => {
    const diagnosticState = diagnosticAdmittedState({
      kind: "diagnostic-admission",
      patternId: "diagnostic-probe",
      manifestPath: ".habitat/patterns/manifests/diagnostic-probe.json",
      diagnosticIdentity: "diagnostic-probe",
      fixtureStrategyRef: "fixtures/diagnostic-probe",
      falsePositiveAssessment: "false-positive model accepted",
      currentTreeDisposition: "current tree accepted by structural check",
    });

    expect(diagnosticAdmission(diagnosticState)).toMatchObject({
      kind: "diagnostic-admission",
      patternId: "diagnostic-probe",
    });
    expect(applyAdmission(diagnosticState)).toBeUndefined();
    expect(patternView(diagnosticState)).toMatchObject({
      admittedCapabilities: ["diagnostic"],
    });
  });

  test("projects refused and invalid candidate states as recovery, not admitted apply state", () => {
    const refusal = patternAdmissionRefusal({
      reason: "manifest-invalid-candidate",
      patternId: "bad",
      path: ".habitat/patterns/candidates/bad.json",
      message: "Candidate manifest cannot be admitted.",
      protectedPaths: [".habitat/patterns/checks/bad.md"],
    });
    const state = invalidCandidateState(refusal);

    expect(patternView(state)).toMatchObject({
      lifecycle: "manifest-invalid-candidate",
      admittedCapabilities: [],
      refusalReason: "manifest-invalid-candidate",
    });
    expect(patternRecovery(state)).toMatchObject({
      kind: "pattern-recovery",
      reason: "manifest-invalid-candidate",
    });
    expect(diagnosticAdmission(state)).toBeUndefined();
    expect(applyAdmission(state)).toBeUndefined();
  });

  test("retired patterns do not return admitted apply state", () => {
    const state = retiredPatternState({
      patternId: "retired-probe",
      manifestPath: ".habitat/patterns/manifests/retired-probe.json",
      reason: "superseded by a narrower rule",
      recovery: {
        kind: "pattern-recovery",
        patternId: "retired-probe",
        reason: "retired-pattern-referenced",
        nextAction: "Create a new admission decision before reuse.",
      },
    });

    expect(patternView(state)).toMatchObject({
      lifecycle: "retired",
      admittedCapabilities: [],
    });
    expect(diagnosticAdmission(state)).toBeUndefined();
    expect(applyAdmission(state)).toBeUndefined();
  });

  test("default apply admissions return through admitted state", () => {
    const ruleFacts = makeTestRuleFacts().grit;
    const admissions = defaultApplyAdmissions(ruleFacts);
    const transactionInputs = admittedApplyTransactionInputs(ruleFacts);

    expect(admissions.length).toBeGreaterThan(0);
    for (const admission of admissions) {
      expect(applyAdmission(applyAdmittedState(admission))).toEqual(admission);
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
    expect(transactionInputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          patternId: "deep-import-to-public-surface",
          manifestPath:
            ".habitat/civ7/mapgen/domain/blueprints/domain-public-surface/require_public_domain_surfaces_in_recipes_and_maps/apply.pattern.md",
          dryRunCommands: [
            expect.objectContaining({
              patternPath:
                ".habitat/civ7/mapgen/domain/blueprints/domain-public-surface/require_public_domain_surfaces_in_recipes_and_maps/apply.pattern.md",
              roots: ["mods/mod-swooper-maps/src/maps", "mods/mod-swooper-maps/src/recipes"],
            }),
          ],
        }),
        expect.objectContaining({
          patternId: "ensure_docs_checkout_paths_are_portable",
          manifestPath: ".habitat/docs/rules/ensure_docs_checkout_paths_are_portable/pattern.md",
          dryRunCommands: [
            expect.objectContaining({
              patternPath: ".habitat/docs/rules/ensure_docs_checkout_paths_are_portable/pattern.md",
              roots: ["docs"],
            }),
          ],
        }),
      ])
    );
  });

  test("missing rule facts do not synthesize transaction inputs", () => {
    expect(applyTransactionInputsFromRuleFacts(defaultApplyAdmissions([]), [])).toEqual([]);
  });

  test("apply transaction paths stay repo-relative and non-traversing", () => {
    expect(Value.Check(RepoRelativePathSchema, "mods/mod-swooper-maps/src/maps")).toBe(true);
    expect(Value.Check(RepoRelativePathSchema, "/tmp/repo")).toBe(false);
    expect(Value.Check(RepoRelativePathSchema, "C:/Users/me/repo")).toBe(false);
    expect(Value.Check(RepoRelativePathSchema, "mods/../secrets")).toBe(false);
    expect(
      Value.Check(
        ApplyPatternPathSchema,
        ".habitat/civ7/mapgen/domain/blueprints/domain-public-surface/require_public_domain_surfaces_in_recipes_and_maps/apply.pattern.md"
      )
    ).toBe(true);
    expect(
      Value.Check(ApplyPatternPathSchema, ".habitat/future/ontology/docs-portability/pattern.md")
    ).toBe(true);
    expect(Value.Check(ApplyPatternPathSchema, ".habitat/patterns/apply/../x.md")).toBe(false);
  });
});

function candidateManifest() {
  return {
    schemaVersion: 1 as const,
    ruleId: "candidate-probe",
    patternName: "candidate_probe",
    lifecycle: "candidate" as const,
    openspecChangeId: "deep-habitat-d8-patterns",
    ownerProject: "habitat",
    patternRole: "diagnostic" as const,
    candidateArtifacts: {
      patternPath: ".habitat/patterns/candidates/candidate_probe.md",
      manifestPath: ".habitat/patterns/candidates/candidate-probe.json",
    },
    registration: {
      accepted: false as const,
      reason: "candidate-only generation",
    },
    requiredForRegistration: ["rule registry facts", "baseline authority", "diagnostics"],
  };
}
