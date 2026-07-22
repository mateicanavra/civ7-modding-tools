import path from "node:path";
import { FileSystem } from "@effect/platform";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Option } from "effect";
import type { GritCommandService } from "./command.js";
import { nativeGritCommandRequestFromProcessRequest } from "./command.schema.js";
import { observedGritDiagnosticIdentity } from "./identity.js";
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
import { pathIsWithinRoot } from "./path.js";
import { captureGritCommandEffect } from "./request.js";
import {
  acquireScopedGritCatalogEffect,
  type MaterializedGritPattern,
  materializeGritPatternEffect,
} from "./scoped-config.js";
import type { GritReport } from "./types.js";

type NonEmptyGritRules = readonly [RuleGritFacts, ...RuleGritFacts[]];

interface MaterializedRule {
  readonly kind: "materialized";
  readonly rule: RuleGritFacts;
  readonly pattern: MaterializedGritPattern;
}

interface FailedRuleMaterialization {
  readonly kind: "failed";
  readonly rule: RuleGritFacts;
  readonly acquisition: GritDiagnosticAcquisition;
}

type RuleMaterialization = MaterializedRule | FailedRuleMaterialization;

/** Acquires the closed native-check evidence for one selected rule. */
export const runGritCheckAcquisitionEffect = Effect.fn("grit.check.acquire")(function* (
  rule: RuleGritFacts,
  roots: readonly [string, ...string[]],
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  const batch = yield* runGritCheckAcquisitionsEffect([rule], roots, options);
  return Option.getOrElse(Option.fromNullable(batch.acquisitions.get(rule.id)), () =>
    preCommandFailure(
      "DiagnosticProviderSetupFailed",
      `Grit check produced no acquisition for selected rule ${rule.id}.`
    )
  );
});

/**
 * Acquires one check report for rules with exactly equal ordered scan roots.
 * Asset admission remains per rule; provider execution is shared only by valid peers.
 */
export const runGritCheckAcquisitionsEffect = Effect.fn("grit.check.acquireBatch")(function* (
  rules: NonEmptyGritRules,
  roots: readonly [string, ...string[]],
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  const materializations: readonly RuleMaterialization[] = yield* Effect.forEach(
    rules,
    (rule) =>
      materializeGritPatternEffect(rule, options.repoRoot).pipe(
        Effect.map((pattern): RuleMaterialization => ({ kind: "materialized", rule, pattern })),
        Effect.catchTag("GritPatternAssetInvalid", (error) =>
          Effect.succeed({
            kind: "failed",
            rule,
            acquisition: preCommandFailure("DiagnosticRuleMaterializationFailed", error.detail),
          } satisfies FailedRuleMaterialization)
        )
      ),
    { concurrency: 1 }
  );
  const valid = materializations.flatMap(materializedRuleEntry);
  const shared = yield* acquireSharedCheckEffect(nonEmptyMaterializations(valid), roots, options);
  return {
    acquisitions: new Map(
      materializations.map((materialization) =>
        materializationAcquisitionEntry(materialization, shared)
      )
    ),
    admittedRuleIds: new Set(valid.map(({ rule }) => rule.id)),
  };
});

function materializationAcquisitionEntry(
  materialization: RuleMaterialization,
  shared: Option.Option<GritDiagnosticAcquisition>
): readonly [string, GritDiagnosticAcquisition] {
  const acquisition = Match.value(materialization).pipe(
    Match.when({ kind: "failed" }, ({ acquisition: failure }) => failure),
    Match.when({ kind: "materialized" }, ({ rule }) =>
      Option.getOrElse(shared, () =>
        preCommandFailure(
          "DiagnosticProviderSetupFailed",
          `Grit check produced no acquisition for materialized rule ${rule.id}.`
        )
      )
    ),
    Match.exhaustive
  );
  return [materialization.rule.id, acquisition];
}

const acquireSharedCheckEffect = Effect.fn("grit.check.acquireShared")(function* (
  materializations: Option.Option<readonly [MaterializedRule, ...MaterializedRule[]]>,
  roots: readonly [string, ...string[]],
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  return yield* Match.value(materializations).pipe(
    Match.when({ _tag: "None" }, () => Effect.succeed(Option.none<GritDiagnosticAcquisition>())),
    Match.orElse(({ value }) => acquireMaterializedCheckEffect(value, roots, options))
  );
});

const acquireMaterializedCheckEffect = Effect.fn("grit.check.acquireMaterialized")(function* (
  materializations: readonly [MaterializedRule, ...MaterializedRule[]],
  roots: readonly [string, ...string[]],
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  const acquisition = yield* runMaterializedCheckEffect(materializations, roots, options).pipe(
    Effect.catchTag("GritScopedConfigInvalid", (error) =>
      Effect.succeed(preCommandFailure("DiagnosticProviderSetupFailed", error.detail))
    )
  );
  return Option.some(acquisition);
});

function materializedRuleEntry(materialization: RuleMaterialization): readonly MaterializedRule[] {
  return Match.value(materialization).pipe(
    Match.when({ kind: "materialized" }, (value) => [value]),
    Match.orElse(() => [])
  );
}

function nonEmptyMaterializations(
  materializations: readonly MaterializedRule[]
): Option.Option<readonly [MaterializedRule, ...MaterializedRule[]]> {
  const [first, ...rest] = materializations;
  return Option.fromNullable(first).pipe(Option.map((value) => [value, ...rest]));
}

function materializedPatterns(
  materializations: readonly [MaterializedRule, ...MaterializedRule[]]
): readonly [MaterializedGritPattern, ...MaterializedGritPattern[]] {
  const [first, ...rest] = materializations;
  return [first.pattern, ...rest.map(({ pattern }) => pattern)];
}

const runMaterializedCheckEffect = Effect.fn("grit.check.runMaterializedBatch")(function* (
  materializations: readonly [MaterializedRule, ...MaterializedRule[]],
  roots: readonly [string, ...string[]],
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  const workspace = yield* acquireScopedGritCatalogEffect(materializedPatterns(materializations));
  const fs = yield* FileSystem.FileSystem;
  const rules = materializedRules(materializations);
  const patternNames = materializedPatternNames(materializations);
  const providerRequest = {
    patternNames,
    scanRoots: roots,
    cwd: workspace.cwd,
    gritDir: workspace.gritDir,
    cacheDir: workspace.cacheDir,
    gritUserConfigDir: workspace.userConfigDir,
  };
  const processRequest = options.grit.checkRequest(providerRequest);
  const nativeRequest = nativeGritCommandRequestFromProcessRequest({
    request: processRequest,
    commandFamily: "selected-rules-json-check",
    patternNames,
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
      continueCompletedCheckEffect(rules, roots, result, nativeRequest, command, fs)
    ),
    Match.exhaustive
  );
});

function materializedRules(
  materializations: readonly [MaterializedRule, ...MaterializedRule[]]
): NonEmptyGritRules {
  const [first, ...rest] = materializations;
  return [first.rule, ...rest.map(({ rule }) => rule)];
}

function materializedPatternNames(
  materializations: readonly [MaterializedRule, ...MaterializedRule[]]
): readonly [string, ...string[]] {
  const [first, ...rest] = materializations;
  return [first.rule.patternName, ...rest.map(({ rule }) => rule.patternName)];
}

function continueCompletedCheckEffect(
  rules: NonEmptyGritRules,
  roots: readonly [string, ...string[]],
  result: Parameters<typeof parseGritCheckCommand>[0],
  request: Parameters<typeof checkAcquisitionEvidence>[0],
  command: Parameters<typeof checkAcquisitionEvidence>[1],
  fs: FileSystem.FileSystem
) {
  return Match.value(checkAcquisitionEvidence(request, command)).pipe(
    Match.when({ kind: "failed" }, ({ acquisition }) => Effect.succeed(acquisition)),
    Match.when({ kind: "accepted" }, ({ evidence }) =>
      completeCapturedCheckEffect(rules, roots, result, evidence, fs)
    ),
    Match.exhaustive
  );
}

const completeCapturedCheckEffect = Effect.fn("grit.check.completeCapture")(function* (
  rules: NonEmptyGritRules,
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
      reconcileCheckObservation(rules, roots, report, processed, results, evidence)
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
  rules: NonEmptyGritRules,
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
  const selectedPatternNames = new Set(rules.map(({ patternName }) => patternName));
  const selectedPatternLabel = rules.map(({ patternName }) => patternName).join(", ");
  const validationFailures = [
    ...Match.value(processed).pipe(
      Match.when({ kind: "failed" }, ({ detail }) => [
        { failure: "DiagnosticOutputIncomplete" as const, detail },
      ]),
      Match.orElse(() => [])
    ),
    ...processedPaths.flatMap((processedPath) =>
      validationFailure(
        !roots.some((root) => pathIsWithinRoot(processedPath, root)),
        "DiagnosticOutputIncomplete",
        `path-escape: processed path ${processedPath} is outside every admitted root.`
      )
    ),
    ...roots.flatMap((root) =>
      validationFailure(
        !processedPaths.some((processedPath) => pathIsWithinRoot(processedPath, root)),
        "DiagnosticOutputIncomplete",
        `unobserved-root: Grit check provided no processed path for ${root}.`
      )
    ),
    ...report.results.flatMap((result, index) =>
      resultValidationFailures(
        selectedPatternNames,
        selectedPatternLabel,
        result,
        resultPaths[index] ?? Option.none(),
        processedSet
      )
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
      "DiagnosticOutputIncomplete",
      "no-processed-paths: Grit check emitted no top-level processed paths."
    ),
    ...Match.value(relativePath).pipe(
      Match.when(undefined, () => []),
      Match.orElse((candidate) => [
        {
          failure: "DiagnosticOutputIncomplete" as const,
          detail: `relative-processed-path: ${candidate}.`,
        },
      ])
    ),
    ...validationFailure(
      missingIndex >= 0,
      "DiagnosticOutputIncomplete",
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
  failure: "DiagnosticOutputIncomplete" | "DiagnosticUnexpectedIdentity";
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
  selectedPatternNames: ReadonlySet<string>,
  selectedPatternLabel: string,
  result: GritReport["results"][number],
  resultPath: Option.Option<string>,
  processed: ReadonlySet<string>
): readonly ValidationFailure[] {
  const observed = observedGritDiagnosticIdentity(result);
  return [
    ...validationFailure(
      !path.isAbsolute(result.path),
      "DiagnosticOutputIncomplete",
      `relative-result-path: ${result.path}.`
    ),
    ...validationFailure(
      Option.isNone(resultPath) ||
        !Option.exists(resultPath, (candidate) => processed.has(candidate)),
      "DiagnosticOutputIncomplete",
      `result-without-processing-evidence: ${result.path}.`
    ),
    ...validationFailure(
      observed.kind === "observed-identity-mismatch" ||
        !selectedPatternNames.has(observed.observedPatternIdentity),
      "DiagnosticUnexpectedIdentity",
      `unexpected-identity: result did not belong to selected patterns ${selectedPatternLabel}.`
    ),
  ];
}
