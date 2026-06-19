import { Effect } from "effect";
import { runGritDiagnosticOutcomes } from "../adapters/grit/index.js";
import { activeRuleGritFacts } from "../rules/facts.js";
import type { RuleGritFacts } from "../rules/registry/index.js";
import {
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromRuleGritFacts,
  type GritDiagnosticIdentity,
  type InjectedProbeOutcome,
} from "./diagnostic-catalog/index.js";
import { runHabitatEffect } from "./effect-runtime.js";
import type { HabitatGitState } from "./git-state.js";
import { readGitState } from "./git-state.js";
import { acquireProbeFile } from "./injected-probe/file-lifecycle.js";
import {
  type InjectedGritProbeInput,
  type InjectedProbeScope,
  normalizeProbePath,
  validateInjectedGritProbeInput,
} from "./injected-probe/input.js";
import {
  probeAdapterFailed,
  probeCleanupFailed,
  probeProjectionMissed,
  probeRefused,
} from "./injected-probe/outcome.js";
import { repoRoot } from "./paths.js";

export type { InjectedProbeOutcome } from "./diagnostic-catalog/index.js";
export type { InjectedGritProbeInput, InjectedProbeScope } from "./injected-probe/input.js";

export async function runInjectedGritProbe(
  input: InjectedGritProbeInput
): Promise<InjectedProbeOutcome> {
  return runHabitatEffect(injectedGritProbeProgram(input));
}

export function injectedGritProbeProgram(
  input: InjectedGritProbeInput
): Effect.Effect<InjectedProbeOutcome> {
  return Effect.gen(function* () {
    const beforeGitState = readGitState(repoRoot);
    const validationFailure = validateInjectedGritProbeInput(input);
    if (validationFailure) return validationFailure;

    const registry = input.registry ?? activeRuleGritFacts;
    const rule = registry.find((candidate) => candidate.id === input.ruleId);
    if (!rule) {
      return probeRefused(
        "unregistered-rule",
        "Injected diagnostic probe requires a registered Grit check rule."
      );
    }

    const runResult = yield* Effect.scoped(
      Effect.gen(function* () {
        yield* acquireProbeFile(input.probePath, input.probeBody);
        yield* acquireProbeFile(input.controlPath, input.controlBody);
        return yield* Effect.tryPromise({
          try: () =>
            runGritDiagnosticOutcomes([rule], {
              scanRoots: input.scope.scanRoots,
              processLayer: input.processLayer,
              cacheMode: "fresh",
              requireObservableCacheStatus: true,
              allowInjectedProbeRoot: true,
              projection: { rejectUnexpectedPatternIdentity: true },
            }),
          catch: (error) =>
            probeAdapterFailed(
              "GritAdapterInternalContractViolation",
              `Injected probe adapter execution threw: ${String(error)}.`
            ),
        });
      }).pipe(Effect.catchAll((error: InjectedProbeOutcome) => Effect.succeed(error)))
    );

    if (!(runResult instanceof Map)) return runResult;
    return assertInjectedProbeOutcome(
      input,
      rule,
      runResult,
      beforeGitState,
      readGitState(repoRoot)
    );
  });
}

function assertInjectedProbeOutcome(
  input: InjectedGritProbeInput,
  rule: RuleGritFacts,
  outcomes: Map<string, DiagnosticRunOutcome>,
  beforeGitState: HabitatGitState,
  afterGitState: HabitatGitState
): InjectedProbeOutcome {
  const outcome = outcomes.get(rule.id);
  const expectedIdentity = diagnosticCatalogEntryFromRuleGritFacts(rule).diagnosticIdentity;
  if (!outcome) {
    return probeProjectionMissed(expectedIdentity, `No result was returned for ${rule.id}.`);
  }

  switch (outcome.kind) {
    case "adapter-failed":
      return probeAdapterFailed(outcome.failure, outcome.detail);
    case "projection-missed":
      return probeProjectionMissed(
        outcome.expectedIdentity,
        `Expected unbaselined finding for ${rule.id}.`
      );
    case "unexpected-diagnostic-identity":
      return probeAdapterFailed(
        "GritUnexpectedDiagnosticIdentity",
        "Unexpected diagnostic identity surfaced during injected diagnostic probe."
      );
    case "clean":
      return probeProjectionMissed(
        expectedIdentity,
        `Expected unbaselined finding for ${rule.id}.`
      );
    case "findings":
      return injectedFindingOutcome(input, outcome, beforeGitState, afterGitState);
  }
}

function injectedFindingOutcome(
  input: InjectedGritProbeInput,
  outcome: Extract<DiagnosticRunOutcome, { kind: "findings" }>,
  beforeGitState: HabitatGitState,
  afterGitState: HabitatGitState
): InjectedProbeOutcome {
  const probeRel = normalizeProbePath(input.probePath);
  const controlRel = normalizeProbePath(input.controlPath);
  const observedFinding = outcome.diagnostics.find(
    (diagnostic) =>
      normalizeProbePath(diagnostic.path) === probeRel &&
      diagnostic.baselineState === "unbaselined" &&
      (!input.expectedDiagnostic || diagnostic.message.includes(input.expectedDiagnostic))
  );
  if (!observedFinding) {
    return probeProjectionMissed(
      outcome.entry.diagnosticIdentity,
      `Expected unbaselined finding for ${outcome.entry.ruleId} at ${probeRel}.`
    );
  }

  const controlFinding = outcome.diagnostics.find(
    (diagnostic) => normalizeProbePath(diagnostic.path) === controlRel
  );
  if (controlFinding) {
    return {
      kind: "probe-control-matched",
      controlPath: controlRel,
      message: `Outside-scope control probe produced ${outcome.entry.ruleId} at ${controlRel}.`,
    };
  }

  if (beforeGitState.statusDigest !== afterGitState.statusDigest) {
    return probeCleanupFailed(
      "not-restored",
      observedFinding,
      "Injected diagnostic probe cleanup did not restore the previous Git status."
    );
  }
  if (input.requireCleanFinalStatus && afterGitState.dirty) {
    return probeCleanupFailed(
      "dirty",
      observedFinding,
      "Injected diagnostic probe final status is dirty."
    );
  }

  return {
    kind: "probe-diagnostic-observed",
    ruleId: outcome.entry.ruleId,
    diagnosticCatalogEntryId: outcome.entry.diagnosticCatalogEntryId,
    diagnosticIdentity: outcome.entry.diagnosticIdentity,
    matchingProbePath: probeRel,
    outsideScopeControlPath: controlRel,
    observedFinding,
    cleanup: "restored",
    validationClass: "injected-violation-diagnostic",
    limitations: outcome.entry.limitations,
  };
}
