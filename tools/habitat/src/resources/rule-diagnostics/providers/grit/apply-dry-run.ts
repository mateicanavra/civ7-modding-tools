import path from "node:path";
import { FileSystem } from "@effect/platform";
import { parseDiagnosticSelectedScanRoots } from "@habitat/cli/service/model/diagnostics/index";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Option } from "effect";
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
  root: string,
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  return yield* Effect.gen(function* () {
    const workspace = yield* acquireScopedGritWorkspaceEffect(rule, options.repoRoot);
    const fs = yield* FileSystem.FileSystem;
    const providerRequest = {
      commandId: `grit-diagnostic-apply-dry-run-${rule.id}`,
      patternPath: workspace.patternPath,
      scanRoots: parseDiagnosticSelectedScanRoots([root]),
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
        continueCompletedApplyEffect(result, root, nativeRequest, command, fs)
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
  root: string,
  request: Parameters<typeof applyAcquisitionEvidence>[0],
  command: Parameters<typeof applyAcquisitionEvidence>[1],
  fs: FileSystem.FileSystem
) {
  return Match.value(applyAcquisitionEvidence(request, command)).pipe(
    Match.when({ kind: "failed" }, ({ acquisition }) => Effect.succeed(acquisition)),
    Match.when({ kind: "accepted" }, ({ evidence }) =>
      completeCapturedApplyEffect(result, root, evidence, fs)
    ),
    Match.exhaustive
  );
}

const completeCapturedApplyEffect = Effect.fn("grit.applyDryRun.completeCapture")(function* (
  result: Parameters<typeof parseGritApplyDryRunCommand>[0],
  root: string,
  evidence: GritApplyAcquisitionEvidence,
  fs: FileSystem.FileSystem
) {
  return yield* Match.value(parseGritApplyDryRunCommand(result)).pipe(
    Match.when({ kind: "parsed" }, ({ value }) =>
      completeApplyObservationEffect(value, root, evidence, fs)
    ),
    Match.when({ kind: "parse-failed" }, ({ failure, detail }) =>
      Effect.succeed(parseAcquisitionFailure(failure, detail, evidence))
    ),
    Match.when({ kind: "parsed-incomplete" }, ({ failure, detail }) =>
      Effect.succeed(incompleteAcquisitionFailure(failure, detail, evidence))
    ),
    Match.exhaustive
  );
});

const completeApplyObservationEffect = Effect.fn("grit.applyDryRun.completeObservation")(function* (
  parsed: Extract<ReturnType<typeof parseGritApplyDryRunCommand>, { kind: "parsed" }>["value"],
  canonicalRoot: string,
  evidence: GritApplyAcquisitionEvidence,
  fs: FileSystem.FileSystem
) {
  const findings = yield* Effect.forEach(
    parsed.findings,
    (finding) => validateFindingPathEffect(finding, canonicalRoot, fs),
    { concurrency: 1 }
  );
  const findingPaths = findings.flatMap((finding) =>
    Match.value(finding).pipe(
      Match.when({ kind: "valid" }, ({ path: findingPath }) => [findingPath]),
      Match.orElse(() => [])
    )
  );
  const failures = [
    ...findings.flatMap((finding) =>
      Match.value(finding).pipe(
        Match.when({ kind: "invalid" }, ({ detail }) => [detail]),
        Match.orElse(() => [])
      )
    ),
    ...Match.value(parsed.found > 0 && findingPaths.length === 0).pipe(
      Match.when(true, () => [
        "finding-without-path: apply dry-run reported findings without path evidence.",
      ]),
      Match.orElse(() => [])
    ),
  ];
  return Match.value(Option.fromNullable(failures[0])).pipe(
    Match.when({ _tag: "None" }, () =>
      completeApplyAcquisition(
        { processed: parsed.processed, found: parsed.found, findingPaths },
        evidence
      )
    ),
    Match.orElse(({ value: detail }) =>
      incompleteAcquisitionFailure("DiagnosticOutputIncomplete", detail, evidence)
    )
  );
});

const validateFindingPathEffect = Effect.fn("grit.applyDryRun.validateFindingPath")(function* (
  finding: Extract<
    ReturnType<typeof parseGritApplyDryRunCommand>,
    { kind: "parsed" }
  >["value"]["findings"][number],
  canonicalRoot: string,
  fs: FileSystem.FileSystem
) {
  return yield* Effect.succeed(finding.path).pipe(
    Effect.filterOrFail(path.isAbsolute, () => ({
      kind: "invalid" as const,
      detail: `${finding.kind}-path-base-ambiguous: apply dry-run reported relative path ${finding.path}.`,
    })),
    Effect.map(path.normalize),
    Effect.flatMap((observedPath) => canonicalFindingPathEffect(finding.kind, observedPath, fs)),
    Effect.flatMap(
      Option.match({
        onNone: () =>
          Effect.fail({
            kind: "invalid" as const,
            detail: `unresolvable-${finding.kind}-path: apply dry-run reported ${finding.path}.`,
          }),
        onSome: Effect.succeed,
      })
    ),
    Effect.filterOrFail(
      (resolvedPath) => pathIsWithinRoot(resolvedPath, canonicalRoot),
      () => ({
        kind: "invalid" as const,
        detail: `path-escape: apply dry-run reported ${finding.path} outside ${canonicalRoot}.`,
      })
    ),
    Effect.map((resolvedPath) => ({ kind: "valid" as const, path: resolvedPath })),
    Effect.catchAll(Effect.succeed)
  );
});

function canonicalFindingPathEffect(
  kind: "match" | "rewrite" | "create-file",
  observedPath: string,
  fs: FileSystem.FileSystem
) {
  return Match.value(kind).pipe(
    Match.when("create-file", () => canonicalCreateFilePathEffect(observedPath, fs)),
    Match.orElse(() => Effect.option(fs.realPath(observedPath)))
  );
}

function canonicalCreateFilePathEffect(observedPath: string, fs: FileSystem.FileSystem) {
  const parent = path.dirname(observedPath);
  return fs
    .realPath(parent)
    .pipe(
      Effect.option,
      Effect.map(
        Option.map((canonicalParent) => path.join(canonicalParent, path.basename(observedPath)))
      )
    );
}

function pathIsWithinRoot(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`));
}
