import { FileSystem } from "@effect/platform";
import { parseDiagnosticSelectedScanRoots } from "@habitat/cli/service/model/diagnostics/index";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Match } from "effect";
import {
  gritApplyAnalysisPathIsRelevant,
  validateGritApplyFindingsEffect,
} from "./apply-findings.js";
import type { GritCommandService } from "./command.js";
import { nativeGritCommandRequestFromProcessRequest } from "./command.schema.js";
import {
  applyAcquisitionEvidence,
  commandFailure,
  completeApplyAcquisition,
  type GritApplyAcquisitionEvidence,
  type GritDiagnosticAcquisition,
  incompleteAcquisitionFailure,
  parseAcquisitionFailure,
  parseGritApplyDryRunCommand,
  preCommandFailure,
} from "./output.js";
import { captureGritCommandEffect } from "./request.js";
import {
  acquireScopedGritWorkspaceEffect,
  GritPatternAssetInvalid,
  GritScopedConfigInvalid,
} from "./scoped-config.js";

export const runGritApplyDryRunAcquisitionEffect = Effect.fn("grit.applyDryRun.acquire")(function* (
  rule: RuleGritFacts,
  roots: readonly [string, ...string[]],
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  return yield* Effect.gen(function* () {
    const workspace = yield* acquireScopedGritWorkspaceEffect(rule, options.repoRoot);
    const fs = yield* FileSystem.FileSystem;
    const providerRequest = {
      commandId: `grit-diagnostic-apply-dry-run-${rule.id}`,
      patternPath: workspace.patternPath,
      scanRoots: parseDiagnosticSelectedScanRoots(roots),
      output: "compact" as const,
      serialization: "jsonl" as const,
      cacheMode: "isolated" as const,
      cwd: workspace.cwd,
      cacheDir: workspace.cacheDir,
      gritUserConfigDir: workspace.userConfigDir,
    };
    const processRequest = options.grit.applyDryRunRequest(providerRequest);
    const nativeRequest = nativeGritCommandRequestFromProcessRequest({
      request: processRequest,
      commandFamily: "selected-rule-apply-dry-run-observation",
    });
    const capture = yield* captureGritCommandEffect(
      processRequest,
      options.grit.applyDryRun(providerRequest)
    );
    return yield* Match.value(capture).pipe(
      Match.when({ kind: "command-failed" }, (failure) =>
        Effect.succeed(commandFailure(nativeRequest, failure))
      ),
      Match.when({ kind: "completed" }, ({ result, command }) =>
        continueCompletedApplyEffect(
          result,
          rule,
          roots,
          options.repoRoot,
          nativeRequest,
          command,
          fs
        )
      ),
      Match.exhaustive
    );
  }).pipe(
    Effect.catchTags({
      GritPatternAssetInvalid: (error) =>
        Effect.succeed(preCommandFailure("DiagnosticRuleMaterializationFailed", error.detail)),
      GritScopedConfigInvalid: (error) =>
        Effect.succeed(preCommandFailure("DiagnosticProviderSetupFailed", error.detail)),
    })
  );
});

function continueCompletedApplyEffect(
  result: Parameters<typeof parseGritApplyDryRunCommand>[0],
  rule: RuleGritFacts,
  roots: readonly [string, ...string[]],
  repoRoot: string,
  request: Parameters<typeof applyAcquisitionEvidence>[0],
  command: Parameters<typeof applyAcquisitionEvidence>[1],
  fs: FileSystem.FileSystem
) {
  return Match.value(applyAcquisitionEvidence(request, command)).pipe(
    Match.when({ kind: "failed" }, ({ acquisition }) => Effect.succeed(acquisition)),
    Match.when({ kind: "accepted" }, ({ evidence }) =>
      completeCapturedApplyEffect(result, rule, roots, repoRoot, evidence, fs)
    ),
    Match.exhaustive
  );
}

const completeCapturedApplyEffect = Effect.fn("grit.applyDryRun.completeCapture")(function* (
  result: Parameters<typeof parseGritApplyDryRunCommand>[0],
  rule: RuleGritFacts,
  roots: readonly [string, ...string[]],
  repoRoot: string,
  evidence: GritApplyAcquisitionEvidence,
  fs: FileSystem.FileSystem
) {
  const canonicalRepo = yield* Effect.either(fs.realPath(repoRoot));
  return yield* Match.value(canonicalRepo).pipe(
    Match.when({ _tag: "Left" }, ({ left }) =>
      Effect.succeed(
        incompleteAcquisitionFailure(
          "DiagnosticOutputIncomplete",
          `unresolvable-repository-root: ${repoRoot}: ${String(left)}.`,
          evidence
        )
      )
    ),
    Match.when({ _tag: "Right" }, ({ right }) =>
      completeParsedApplyEffect(result, rule, roots, right, evidence, fs)
    ),
    Match.exhaustive
  );
});

function completeParsedApplyEffect(
  result: Parameters<typeof parseGritApplyDryRunCommand>[0],
  rule: RuleGritFacts,
  roots: readonly [string, ...string[]],
  canonicalRepo: string,
  evidence: GritApplyAcquisitionEvidence,
  fs: FileSystem.FileSystem
) {
  return Match.value(
    parseGritApplyDryRunCommand(result, {
      analysisPathIsRelevant: (observedPath) =>
        gritApplyAnalysisPathIsRelevant(observedPath, rule, canonicalRepo),
    })
  ).pipe(
    Match.when({ kind: "parsed" }, ({ value }) =>
      completeApplyObservationEffect(value, rule, roots, canonicalRepo, evidence, fs)
    ),
    Match.when({ kind: "parse-failed" }, ({ failure, detail }) =>
      Effect.succeed(parseAcquisitionFailure(failure, detail, evidence))
    ),
    Match.when({ kind: "parsed-incomplete" }, ({ failure, detail }) =>
      Effect.succeed(incompleteAcquisitionFailure(failure, detail, evidence))
    ),
    Match.exhaustive
  );
}

const completeApplyObservationEffect = Effect.fn("grit.applyDryRun.completeObservation")(function* (
  parsed: Extract<ReturnType<typeof parseGritApplyDryRunCommand>, { kind: "parsed" }>["value"],
  rule: RuleGritFacts,
  roots: readonly [string, ...string[]],
  canonicalRepo: string,
  evidence: GritApplyAcquisitionEvidence,
  fs: FileSystem.FileSystem
) {
  const validation = yield* validateGritApplyFindingsEffect(parsed.findings, {
    rule,
    roots,
    canonicalRepo,
    fs,
  });
  return Match.value(validation).pipe(
    Match.when({ kind: "accepted" }, ({ findings }) =>
      completeApplyAcquisition(
        { processed: parsed.processed, found: parsed.found, findings: [...findings] },
        evidence
      )
    ),
    Match.when({ kind: "rejected" }, ({ detail }) =>
      incompleteAcquisitionFailure("DiagnosticOutputIncomplete", detail, evidence)
    ),
    Match.exhaustive
  );
});
