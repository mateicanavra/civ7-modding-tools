import { realpathSync } from "node:fs";
import path from "node:path";
import { FileSystem } from "@effect/platform";
import { parseDiagnosticSelectedScanRoots } from "@habitat/cli/service/model/diagnostics/index";
import {
  pathCoveragePatternMatches,
  type RuleGritFacts,
} from "@habitat/cli/service/model/rules/index";
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
import { pathIsWithinRoot } from "./path.js";
import { captureGritCommandEffect } from "./request.js";
import {
  acquireScopedGritWorkspaceEffect,
  GritPatternAssetInvalid,
  GritScopedConfigInvalid,
} from "./scoped-config.js";

const canonicalExistingPath = Option.liftThrowable((candidate: string) =>
  realpathSync.native(candidate)
);

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
        continueCompletedApplyEffect(
          result,
          rule,
          root,
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
  root: string,
  repoRoot: string,
  request: Parameters<typeof applyAcquisitionEvidence>[0],
  command: Parameters<typeof applyAcquisitionEvidence>[1],
  fs: FileSystem.FileSystem
) {
  return Match.value(applyAcquisitionEvidence(request, command)).pipe(
    Match.when({ kind: "failed" }, ({ acquisition }) => Effect.succeed(acquisition)),
    Match.when({ kind: "accepted" }, ({ evidence }) =>
      completeCapturedApplyEffect(result, rule, root, repoRoot, evidence, fs)
    ),
    Match.exhaustive
  );
}

const completeCapturedApplyEffect = Effect.fn("grit.applyDryRun.completeCapture")(function* (
  result: Parameters<typeof parseGritApplyDryRunCommand>[0],
  rule: RuleGritFacts,
  root: string,
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
      completeParsedApplyEffect(result, rule, root, right, evidence, fs)
    ),
    Match.exhaustive
  );
});

/** Fails closed unless an absolute in-repo path is provably outside exact rule coverage. */
function analysisPathIsRelevant(
  observedPath: string,
  rule: RuleGritFacts,
  canonicalRepo: string
): boolean {
  if (!path.isAbsolute(observedPath)) return true;
  const canonicalObserved = canonicalExistingPath(observedPath);
  return Option.match(canonicalObserved, {
    onNone: () => true,
    onSome: (canonical) => canonicalAnalysisPathIsRelevant(canonical, rule, canonicalRepo),
  });
}

function canonicalAnalysisPathIsRelevant(
  canonicalPath: string,
  rule: RuleGritFacts,
  canonicalRepo: string
): boolean {
  if (!pathIsWithinRoot(canonicalPath, canonicalRepo)) return true;
  return Option.match(exactPathCoveragePatterns(rule), {
    onNone: () => true,
    onSome: (patterns) =>
      patterns.some((pattern) =>
        pathCoveragePatternMatches(pattern, repoRelativePath(canonicalRepo, canonicalPath))
      ),
  });
}

function completeParsedApplyEffect(
  result: Parameters<typeof parseGritApplyDryRunCommand>[0],
  rule: RuleGritFacts,
  root: string,
  canonicalRepo: string,
  evidence: GritApplyAcquisitionEvidence,
  fs: FileSystem.FileSystem
) {
  return Match.value(
    parseGritApplyDryRunCommand(result, {
      analysisPathIsRelevant: (observedPath) =>
        analysisPathIsRelevant(observedPath, rule, canonicalRepo),
    })
  ).pipe(
    Match.when({ kind: "parsed" }, ({ value }) =>
      completeApplyObservationEffect(value, rule, root, canonicalRepo, evidence, fs)
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
  canonicalRoot: string,
  canonicalRepo: string,
  evidence: GritApplyAcquisitionEvidence,
  fs: FileSystem.FileSystem
) {
  const findings = yield* Effect.forEach(
    parsed.findings,
    (finding) => validateFindingPathEffect(finding, rule, canonicalRoot, canonicalRepo, fs),
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
  rule: RuleGritFacts,
  canonicalRoot: string,
  canonicalRepo: string,
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
    Effect.filterOrFail(
      (resolvedPath) => pathIsWithinRoot(resolvedPath, canonicalRepo),
      () => ({
        kind: "invalid" as const,
        detail: `repository-path-escape: apply dry-run reported ${finding.path} outside ${canonicalRepo}.`,
      })
    ),
    Effect.filterOrFail(
      (resolvedPath) => exactCoverageContainsPath(rule, canonicalRepo, resolvedPath),
      () => ({
        kind: "invalid" as const,
        detail: `path-outside-exact-coverage: apply dry-run reported ${finding.path} outside ${rule.id} authority.`,
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
  return Effect.gen(function* () {
    const canonicalLeaf = yield* Effect.option(fs.realPath(observedPath));
    if (Option.isSome(canonicalLeaf)) return canonicalLeaf;

    const leafLink = yield* Effect.option(fs.readLink(observedPath));
    if (Option.isSome(leafLink)) return Option.none<string>();

    const leafExists = yield* Effect.option(fs.exists(observedPath));
    if (Option.isNone(leafExists) || leafExists.value) return Option.none<string>();

    const canonicalParent = yield* Effect.option(fs.realPath(path.dirname(observedPath)));
    return Option.map(canonicalParent, (parent) => path.join(parent, path.basename(observedPath)));
  });
}

function exactCoverageContainsPath(
  rule: RuleGritFacts,
  canonicalRepo: string,
  canonicalPath: string
): boolean {
  const patterns = exactPathCoveragePatterns(rule);
  const relative = repoRelativePath(canonicalRepo, canonicalPath);
  return Option.exists(patterns, (exactPatterns) =>
    exactPatterns.some((pattern) => pathCoveragePatternMatches(pattern, relative))
  );
}

function exactPathCoveragePatterns(rule: RuleGritFacts): Option.Option<readonly string[]> {
  return Match.value(rule.pathCoverage.every(isExactPathCoverage)).pipe(
    Match.when(false, () => Option.none()),
    Match.orElse(() =>
      Option.some(rule.pathCoverage.filter(isExactPathCoverage).flatMap(({ patterns }) => patterns))
    )
  );
}

function isExactPathCoverage(
  coverage: RuleGritFacts["pathCoverage"][number]
): coverage is Extract<RuleGritFacts["pathCoverage"][number], { kind: "exact-path" }> {
  return coverage.kind === "exact-path";
}

function repoRelativePath(canonicalRepo: string, canonicalPath: string): string {
  return path.relative(canonicalRepo, canonicalPath).split(path.sep).join("/");
}
