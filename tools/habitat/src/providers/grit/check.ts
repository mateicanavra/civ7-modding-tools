import path from "node:path";
import { FileSystem } from "@effect/platform";
import {
  nativeGritCommandRequestFromProcessRequest,
  observedGritDiagnosticIdentity,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Option } from "effect";
import {
  checkAcquisitionEvidence,
  commandFailure,
  completeCheckAcquisition,
  type GritCheckAcquisitionEvidence,
  type GritDiagnosticAcquisition,
  incompleteAcquisitionFailure,
  parseAcquisitionFailure,
  parseGritCheckCommand,
  preCommandFailure,
} from "./output.js";
import { captureGritCommandEffect } from "./request.js";
import type { GritProviderService } from "./resource.js";
import {
  acquireScopedGritWorkspaceEffect,
  GritPatternAssetInvalid,
  GritScopedConfigInvalid,
} from "./scoped-config.js";
import type { GritReport } from "./types.js";

export const runGritCheckAcquisitionEffect = Effect.fn("grit.check.acquire")(function* (
  rule: RuleSourceFacts,
  roots: readonly [string, ...string[]],
  options: { readonly repoRoot: string; readonly grit: GritProviderService }
) {
  return yield* Effect.gen(function* () {
    const workspace = yield* acquireScopedGritWorkspaceEffect(rule, options.repoRoot);
    const fs = yield* FileSystem.FileSystem;
    const providerRequest = {
      scanRoots: roots,
      cwd: workspace.cwd,
      gritDir: workspace.gritDir,
      cacheDir: workspace.cacheDir,
      gritUserConfigDir: workspace.userConfigDir,
    };
    const processRequest = options.grit.checkRequest(providerRequest);
    const nativeRequest = nativeGritCommandRequestFromProcessRequest({
      request: processRequest,
      commandFamily: "selected-rule-json-check",
    });
    const capture = yield* captureGritCommandEffect(
      processRequest,
      options.grit.check(providerRequest)
    );
    return yield* Match.value(capture).pipe(
      Match.when({ kind: "command-failed" }, (failure) =>
        Effect.succeed(commandFailure(nativeRequest, failure))
      ),
      Match.when({ kind: "completed" }, ({ result, command }) =>
        continueCompletedCheckEffect(rule, roots, result, nativeRequest, command, fs)
      ),
      Match.exhaustive
    );
  }).pipe(
    Effect.catchTags({
      GritPatternAssetInvalid: (error) =>
        Effect.succeed(preCommandFailure("GritPatternAssetFailed", error.detail)),
      GritScopedConfigInvalid: (error) =>
        Effect.succeed(preCommandFailure("GritScopedConfigFailed", error.detail)),
    })
  );
});

function continueCompletedCheckEffect(
  rule: RuleSourceFacts,
  roots: readonly [string, ...string[]],
  result: Parameters<typeof parseGritCheckCommand>[0],
  request: Parameters<typeof checkAcquisitionEvidence>[0],
  command: Parameters<typeof checkAcquisitionEvidence>[1],
  fs: FileSystem.FileSystem
) {
  return Match.value(checkAcquisitionEvidence(request, command)).pipe(
    Match.when({ kind: "failed" }, ({ acquisition }) => Effect.succeed(acquisition)),
    Match.when({ kind: "accepted" }, ({ evidence }) =>
      completeCapturedCheckEffect(rule, roots, result, evidence, fs)
    ),
    Match.exhaustive
  );
}

const completeCapturedCheckEffect = Effect.fn("grit.check.completeCapture")(function* (
  rule: RuleSourceFacts,
  roots: readonly [string, ...string[]],
  result: Parameters<typeof parseGritCheckCommand>[0],
  evidence: GritCheckAcquisitionEvidence,
  fs: FileSystem.FileSystem
) {
  const observation = yield* Match.value(parseGritCheckCommand(result)).pipe(
    Match.when({ kind: "parsed" }, ({ value: report }) =>
      canonicalCheckObservationEffect(report, fs)
    ),
    Match.when({ kind: "parse-failed" }, ({ failure, detail }) =>
      Effect.succeed({
        kind: "terminal" as const,
        acquisition: parseAcquisitionFailure(failure, detail, evidence),
      })
    ),
    Match.when({ kind: "parsed-incomplete" }, ({ failure, detail }) =>
      Effect.succeed({
        kind: "terminal" as const,
        acquisition: incompleteAcquisitionFailure(failure, detail, evidence),
      })
    ),
    Match.exhaustive
  );
  return Match.value(observation).pipe(
    Match.when({ kind: "terminal" }, ({ acquisition }) => acquisition),
    Match.orElse(({ report, processed, results }) =>
      reconcileCheckObservation(rule, roots, report, processed, results, evidence)
    )
  );
});

interface CanonicalPathsComplete {
  readonly kind: "complete";
  readonly paths: readonly string[];
}

interface CanonicalPathsFailed {
  readonly kind: "failed";
  readonly detail: string;
}

type CanonicalPaths = CanonicalPathsComplete | CanonicalPathsFailed;

const canonicalCheckObservationEffect = Effect.fn("grit.check.canonicalize")(function* (
  report: GritReport,
  fs: FileSystem.FileSystem
) {
  const processed = yield* canonicalPathsEffect(report.paths, fs);
  const results = yield* Effect.forEach(
    report.results,
    (result) =>
      Effect.if(path.isAbsolute(result.path), {
        onTrue: () => fs.realPath(result.path).pipe(Effect.option),
        onFalse: () => Effect.succeed(Option.none<string>()),
      }),
    { concurrency: 1 }
  );
  return { kind: "canonical" as const, report, processed, results };
});

function reconcileCheckObservation(
  rule: RuleSourceFacts,
  roots: readonly string[],
  report: GritReport,
  processed: CanonicalPaths,
  resultPaths: readonly Option.Option<string>[],
  evidence: GritCheckAcquisitionEvidence
): GritDiagnosticAcquisition {
  const processedPaths = Match.value(processed).pipe(
    Match.when({ kind: "complete" }, ({ paths }) => paths),
    Match.orElse(() => [])
  );
  const processedSet = new Set(processedPaths);
  const validationFailures = [
    ...Match.value(processed).pipe(
      Match.when({ kind: "failed" }, ({ detail }) => [
        { failure: "GritObservationIncomplete" as const, detail },
      ]),
      Match.orElse(() => [])
    ),
    ...processedPaths.flatMap((processedPath) =>
      validationFailure(
        !roots.some((root) => pathIsWithinRoot(processedPath, root)),
        "GritObservationIncomplete",
        `path-escape: processed path ${processedPath} is outside every admitted root.`
      )
    ),
    ...roots.flatMap((root) =>
      validationFailure(
        !processedPaths.some((processedPath) => pathIsWithinRoot(processedPath, root)),
        "GritObservationIncomplete",
        `unobserved-root: Grit check provided no processed path for ${root}.`
      )
    ),
    ...report.results.flatMap((result, index) =>
      resultValidationFailures(rule, result, resultPaths[index] ?? Option.none(), processedSet)
    ),
  ];
  return Match.value(Option.fromNullable(validationFailures[0])).pipe(
    Match.when({ _tag: "None" }, () => completeCheckAcquisition(report, evidence)),
    Match.orElse(({ value: { failure, detail } }) =>
      incompleteAcquisitionFailure(failure, detail, evidence)
    )
  );
}

const canonicalPathsEffect = Effect.fn("grit.check.canonicalPaths")(function* (
  paths: readonly string[],
  fs: FileSystem.FileSystem
) {
  const observations = yield* Effect.forEach(
    paths,
    (candidate) => fs.realPath(candidate).pipe(Effect.option),
    {
      concurrency: 1,
    }
  );
  return resolveCanonicalPaths(paths, observations);
});

function resolveCanonicalPaths(
  paths: readonly string[],
  observations: readonly Option.Option<string>[]
): CanonicalPaths {
  const relativePath = paths.find((candidate) => !path.isAbsolute(candidate));
  const missingIndex = observations.findIndex(Option.isNone);
  const failures = [
    ...validationFailure(
      paths.length === 0,
      "GritObservationIncomplete",
      "no-processed-paths: Grit check emitted no top-level processed paths."
    ),
    ...Match.value(relativePath).pipe(
      Match.when(undefined, () => []),
      Match.orElse((candidate) => [
        {
          failure: "GritObservationIncomplete" as const,
          detail: `relative-processed-path: ${candidate}.`,
        },
      ])
    ),
    ...validationFailure(
      missingIndex >= 0,
      "GritObservationIncomplete",
      `unresolvable-processed-path: ${paths[missingIndex] ?? "unknown"}.`
    ),
  ];
  return Match.value(Option.fromNullable(failures[0])).pipe(
    Match.when(
      { _tag: "None" },
      (): CanonicalPaths => ({
        kind: "complete",
        paths: observations.flatMap(Option.toArray),
      })
    ),
    Match.orElse(({ value: { detail } }): CanonicalPaths => ({ kind: "failed", detail }))
  );
}

type ValidationFailure = Readonly<{
  failure: "GritObservationIncomplete" | "GritUnexpectedDiagnosticIdentity";
  detail: string;
}>;

function validationFailure(
  condition: boolean,
  failure: ValidationFailure["failure"],
  detail: string
): readonly ValidationFailure[] {
  return Match.value(condition).pipe(
    Match.when(true, () => [{ failure, detail }]),
    Match.orElse(() => [])
  );
}

function resultValidationFailures(
  rule: RuleSourceFacts,
  result: GritReport["results"][number],
  resultPath: Option.Option<string>,
  processed: ReadonlySet<string>
): readonly ValidationFailure[] {
  const observed = observedGritDiagnosticIdentity(result);
  return [
    ...validationFailure(
      !path.isAbsolute(result.path),
      "GritObservationIncomplete",
      `relative-result-path: ${result.path}.`
    ),
    ...validationFailure(
      Option.isNone(resultPath) ||
        !Option.exists(resultPath, (candidate) => processed.has(candidate)),
      "GritObservationIncomplete",
      `result-without-processing-evidence: ${result.path}.`
    ),
    ...validationFailure(
      observed.kind === "observed-identity-mismatch" ||
        observed.observedPatternIdentity !== rule.patternName,
      "GritUnexpectedDiagnosticIdentity",
      `unexpected-identity: result did not belong to ${rule.patternName}.`
    ),
  ];
}

function pathIsWithinRoot(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`));
}
