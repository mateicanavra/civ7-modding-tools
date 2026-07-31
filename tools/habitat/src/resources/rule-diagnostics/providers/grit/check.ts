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

interface GritCheckPlan {
  readonly rule: RuleGritFacts;
  readonly roots: readonly [string, ...string[]];
}

type NonEmptyGritCheckPlans = readonly [GritCheckPlan, ...GritCheckPlan[]];

interface GritCheckBatchAcquisition {
  readonly acquisitions: ReadonlyMap<string, GritDiagnosticAcquisition>;
  readonly participantRuleIds: ReadonlySet<string>;
}

interface MaterializedRule {
  readonly kind: "materialized";
  readonly rule: RuleGritFacts;
  readonly roots: readonly [string, ...string[]];
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
  const batch = yield* runGritCheckAcquisitionsEffect([{ rule, roots }], options);
  return Option.getOrElse(Option.fromNullable(batch.acquisitions.get(rule.id)), () =>
    preCommandFailure(
      "DiagnosticProviderSetupFailed",
      `Grit check produced no acquisition for selected rule ${rule.id}.`
    )
  );
});

/**
 * Acquires one check report across the union of selected exact-path rule roots.
 * Asset admission and observed evidence remain projected independently per rule.
 */
export const runGritCheckAcquisitionsEffect = Effect.fn("grit.check.acquireBatch")(function* (
  plans: NonEmptyGritCheckPlans,
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  const materializations: readonly RuleMaterialization[] = yield* Effect.forEach(
    plans,
    ({ rule, roots }) =>
      materializeGritPatternEffect(rule, options.repoRoot).pipe(
        Effect.map(
          (pattern): RuleMaterialization => ({ kind: "materialized", rule, roots, pattern })
        ),
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
  const shared = yield* acquireSharedCheckEffect(nonEmptyMaterializations(valid), options);
  return {
    acquisitions: new Map(
      materializations.map((materialization) =>
        materializationAcquisitionEntry(materialization, shared)
      )
    ),
    participantRuleIds: new Set(valid.map(({ rule }) => rule.id)),
  } satisfies GritCheckBatchAcquisition;
});

function materializationAcquisitionEntry(
  materialization: RuleMaterialization,
  shared: ReadonlyMap<string, GritDiagnosticAcquisition>
): readonly [string, GritDiagnosticAcquisition] {
  const acquisition = Match.value(materialization).pipe(
    Match.when({ kind: "failed" }, ({ acquisition: failure }) => failure),
    Match.when({ kind: "materialized" }, ({ rule }) =>
      Option.getOrElse(Option.fromNullable(shared.get(rule.id)), () =>
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
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  return yield* Match.value(materializations).pipe(
    Match.when({ _tag: "None" }, () =>
      Effect.succeed(new Map<string, GritDiagnosticAcquisition>())
    ),
    Match.orElse(({ value }) => acquireMaterializedCheckEffect(value, options))
  );
});

const acquireMaterializedCheckEffect = Effect.fn("grit.check.acquireMaterialized")(function* (
  materializations: readonly [MaterializedRule, ...MaterializedRule[]],
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  return yield* runMaterializedCheckEffect(materializations, options).pipe(
    Effect.catchTag("GritScopedConfigInvalid", (error) =>
      Effect.succeed(
        sharedAcquisitions(
          materializations,
          preCommandFailure("DiagnosticProviderSetupFailed", error.detail)
        )
      )
    )
  );
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
  options: { readonly repoRoot: string; readonly grit: GritCommandService }
) {
  const workspace = yield* acquireScopedGritCatalogEffect(materializedPatterns(materializations));
  const fs = yield* FileSystem.FileSystem;
  const rules = materializedRules(materializations);
  const patternNames = materializedPatternNames(materializations);
  const roots = unionRoots(materializations);
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
      Effect.succeed(sharedAcquisitions(materializations, commandFailure(nativeRequest, failure)))
    ),
    Match.when({ kind: "completed" }, ({ result, command }) =>
      continueCompletedCheckEffect(
        materializations,
        rules,
        roots,
        result,
        nativeRequest,
        command,
        fs
      )
    ),
    Match.exhaustive
  );
});

function unionRoots(
  materializations: readonly [MaterializedRule, ...MaterializedRule[]]
): readonly [string, ...string[]] {
  const [first, ...rest] = [...new Set(materializations.flatMap(({ roots }) => roots))].sort(
    (left, right) => left.localeCompare(right)
  );
  if (first === undefined) throw new Error("Materialized Grit check batch has no roots.");
  return [first, ...rest];
}

function sharedAcquisitions(
  materializations: readonly MaterializedRule[],
  acquisition: GritDiagnosticAcquisition
): ReadonlyMap<string, GritDiagnosticAcquisition> {
  return new Map(materializations.map(({ rule }) => [rule.id, acquisition]));
}

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
  materializations: readonly [MaterializedRule, ...MaterializedRule[]],
  rules: NonEmptyGritRules,
  roots: readonly [string, ...string[]],
  result: Parameters<typeof parseGritCheckCommand>[0],
  request: Parameters<typeof checkAcquisitionEvidence>[0],
  command: Parameters<typeof checkAcquisitionEvidence>[1],
  fs: FileSystem.FileSystem
) {
  return Match.value(checkAcquisitionEvidence(request, command)).pipe(
    Match.when({ kind: "failed" }, ({ acquisition }) =>
      Effect.succeed(sharedAcquisitions(materializations, acquisition))
    ),
    Match.when({ kind: "accepted" }, ({ evidence }) =>
      completeCapturedCheckEffect(materializations, rules, roots, result, evidence, fs)
    ),
    Match.exhaustive
  );
}

const completeCapturedCheckEffect = Effect.fn("grit.check.completeCapture")(function* (
  materializations: readonly [MaterializedRule, ...MaterializedRule[]],
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
        acquisitions: sharedAcquisitions(
          materializations,
          parseAcquisitionFailure(failure, detail, evidence)
        ),
      })
    ),
    Match.when({ kind: "parsed-incomplete" }, ({ failure, detail }) =>
      Effect.succeed({
        kind: "terminal" as const,
        acquisitions: sharedAcquisitions(
          materializations,
          incompleteAcquisitionFailure(failure, detail, evidence)
        ),
      })
    ),
    Match.exhaustive
  );
  return Match.value(observation).pipe(
    Match.when({ kind: "terminal" }, ({ acquisitions }) => acquisitions),
    Match.orElse(({ report, processed, results }) =>
      reconcileCheckObservation(
        materializations,
        rules,
        roots,
        report,
        processed,
        results,
        evidence
      )
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
  materializations: readonly [MaterializedRule, ...MaterializedRule[]],
  rules: NonEmptyGritRules,
  roots: readonly string[],
  report: GritReport,
  processed: CanonicalPaths,
  resultPaths: readonly Option.Option<string>[],
  evidence: GritCheckAcquisitionEvidence
): ReadonlyMap<string, GritDiagnosticAcquisition> {
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
    Match.when(
      { _tag: "None" },
      () =>
        new Map(
          materializations.map((materialization) => [
            materialization.rule.id,
            projectRuleAcquisition(materialization, report, processedPaths, resultPaths, evidence),
          ])
        )
    ),
    Match.orElse(({ value: { failure, detail } }) =>
      sharedAcquisitions(materializations, incompleteAcquisitionFailure(failure, detail, evidence))
    )
  );
}

function projectRuleAcquisition(
  materialization: MaterializedRule,
  report: GritReport,
  processedPaths: readonly string[],
  resultPaths: readonly Option.Option<string>[],
  evidence: GritCheckAcquisitionEvidence
): GritDiagnosticAcquisition {
  const missingRoot = materialization.roots.find(
    (root) => !processedPaths.some((processedPath) => pathIsWithinRoot(processedPath, root))
  );
  if (missingRoot !== undefined) {
    return incompleteAcquisitionFailure(
      "DiagnosticOutputIncomplete",
      `unobserved-root: Grit check provided no processed path for ${missingRoot}.`,
      evidence
    );
  }

  const paths = processedPaths.filter((observed) =>
    materialization.roots.some((root) => pathIsWithinRoot(observed, root))
  );
  const results = report.results.flatMap((result, index) => {
    const observedPath = resultPaths[index];
    const observedIdentity = observedGritDiagnosticIdentity(result);
    const belongsToRule =
      observedIdentity.kind !== "observed-identity-mismatch" &&
      observedIdentity.observedPatternIdentity === materialization.rule.patternName &&
      Option.exists(observedPath, (candidate) =>
        materialization.roots.some((root) => pathIsWithinRoot(candidate, root))
      );
    if (!belongsToRule || Option.isNone(observedPath)) return [];
    return [{ ...result, path: observedPath.value }];
  });
  return completeCheckAcquisition({ paths, results }, evidence);
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
