import path from "node:path";
import { FileSystem } from "@effect/platform";
import type {
  FileImpact,
  RuleFixPreviewResult,
  RuleFixPreviewRuleResult,
  RuleFixPreviewService,
} from "@habitat/cli/resources/rule-fix-preview/index";
import type {
  RuleFactsCatalog,
  RuleFixFacts,
  RuleGritFacts,
} from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Option } from "effect";
import { runGritApplyDryRunAcquisitionEffect } from "./apply-dry-run.js";
import type { GritCommandService } from "./command.js";
import type { GritApplyFindingEvidence, GritDiagnosticAcquisition } from "./output.js";
import { type PlannedGritRule, planGritRuleRoots } from "./scan-roots/index.js";

interface PreviewOptions {
  readonly repoRoot: string;
  readonly grit: GritCommandService;
  readonly fs: FileSystem.FileSystem;
}

type RunRuleFixPreview = (
  rule: RuleFixFacts
) => ReturnType<typeof Effect.succeed<RuleFixPreviewRuleResult>>;

export function makeGritRuleFixPreviewService(
  facts: RuleFactsCatalog,
  runRule: RunRuleFixPreview
): RuleFixPreviewService {
  const registeredRuleIds = new Set(facts.selector.map(({ id }) => id));
  const admittedById = new Map(facts.fix.map((fact) => [fact.id, fact]));
  return {
    preview: (demand) =>
      Match.value(selectRules(demand.ruleIds, facts.fix, registeredRuleIds, admittedById)).pipe(
        Match.when({ kind: "selection-refused" }, (refusal) => Effect.succeed(refusal)),
        Match.when({ kind: "selected" }, ({ rules }) => previewRules(rules, runRule)),
        Match.exhaustive
      ),
  };
}

type RuleFixSelection =
  | Extract<RuleFixPreviewResult, { kind: "selection-refused" }>
  | { readonly kind: "selected"; readonly rules: readonly RuleFixFacts[] };

type RuleFixSelectionRefusal = Extract<
  RuleFixPreviewResult,
  { kind: "selection-refused" }
>["refusals"][number];

function selectRules(
  demandedRuleIds: readonly [string, ...string[]] | undefined,
  defaultRules: readonly RuleFixFacts[],
  registeredRuleIds: ReadonlySet<string>,
  admittedById: ReadonlyMap<string, RuleFixFacts>
): RuleFixSelection {
  return Option.match(Option.fromNullable(demandedRuleIds), {
    onNone: () => ({ kind: "selected", rules: [...defaultRules] }),
    onSome: (ids) => selectExplicitRules([...new Set(ids)], registeredRuleIds, admittedById),
  });
}

function selectExplicitRules(
  ruleIds: readonly string[],
  registeredRuleIds: ReadonlySet<string>,
  admittedById: ReadonlyMap<string, RuleFixFacts>
): RuleFixSelection {
  const refusals = ruleIds.flatMap((ruleId) =>
    selectionRefusalForRule(ruleId, registeredRuleIds, admittedById)
  );
  const [firstRefusal, ...remainingRefusals] = refusals;
  return Option.match(Option.fromNullable(firstRefusal), {
    onNone: () => ({
      kind: "selected",
      rules: ruleIds.flatMap((id) => Option.toArray(Option.fromNullable(admittedById.get(id)))),
    }),
    onSome: (first) => ({
      kind: "selection-refused",
      refusals: [first, ...remainingRefusals],
    }),
  });
}

function selectionRefusalForRule(
  ruleId: string,
  registeredRuleIds: ReadonlySet<string>,
  admittedById: ReadonlyMap<string, RuleFixFacts>
): readonly RuleFixSelectionRefusal[] {
  return Match.value({
    registered: registeredRuleIds.has(ruleId),
    admitted: admittedById.has(ruleId),
  }).pipe(
    Match.when({ registered: false }, () => [{ ruleId, reason: "unknown" as const }]),
    Match.when({ registered: true, admitted: false }, () => [
      { ruleId, reason: "fix-not-admitted" as const },
    ]),
    Match.orElse(() => [])
  );
}

function previewRules(rules: readonly RuleFixFacts[], runRule: RunRuleFixPreview) {
  return Effect.forEach(rules, runRule, { concurrency: 1 }).pipe(
    Effect.map((results) => ({ kind: "completed" as const, results }))
  );
}

export function makeGritRuleFixPreviewRunner(options: PreviewOptions): RunRuleFixPreview {
  return (rule) =>
    previewRule(rule, options).pipe(Effect.provideService(FileSystem.FileSystem, options.fs));
}

const previewRule = Effect.fn("grit.fixPreview.previewRule")(function* (
  rule: RuleFixFacts,
  options: PreviewOptions
) {
  const gritRule = gritFactsForFix(rule);
  const [plan] = yield* planGritRuleRoots([gritRule], { repoRoot: options.repoRoot });
  if (!plan) return missingProviderResult(rule.id);
  return yield* Match.value(plan).pipe(
    Match.when({ kind: "not-applicable" }, ({ reason }) =>
      Effect.succeed({ kind: "not-applicable" as const, ruleId: rule.id, reason })
    ),
    Match.when({ kind: "refused" }, ({ decision }) =>
      Effect.succeed({
        kind: "scope-refused" as const,
        ruleId: rule.id,
        decision,
        detail: `Fix preview scan roots were refused for '${rule.id}'.`,
      })
    ),
    Match.when({ kind: "failed" }, ({ failure, detail }) =>
      Effect.succeed({ kind: "provider-failed" as const, ruleId: rule.id, failure, detail })
    ),
    Match.when({ kind: "execute" }, (execute) =>
      executePreviewPlanEffect(rule, gritRule, execute, options.grit)
    ),
    Match.exhaustive
  );
});

function executePreviewPlanEffect(
  rule: RuleFixFacts,
  gritRule: RuleGritFacts,
  execute: Extract<PlannedGritRule, { kind: "execute" }>,
  grit: GritCommandService
) {
  return runGritApplyDryRunAcquisitionEffect(gritRule, execute.roots, {
    repoRoot: execute.repoRoot,
    grit,
  }).pipe(
    Effect.scoped,
    Effect.map((acquisition) => resultFromAcquisition(rule, acquisition, execute.repoRoot))
  );
}

function resultFromAcquisition(
  rule: RuleFixFacts,
  acquisition: GritDiagnosticAcquisition,
  repoRoot: string
): RuleFixPreviewRuleResult {
  return Match.value(acquisition).pipe(
    Match.when({ kind: "observed-complete" }, ({ observation }) =>
      resultFromCompleteObservation(rule, observation, repoRoot)
    ),
    Match.orElse(({ failure, detail }) => ({
      kind: "provider-failed" as const,
      ruleId: rule.id,
      failure,
      detail,
    }))
  );
}

function resultFromCompleteObservation(
  rule: RuleFixFacts,
  observation: Extract<GritDiagnosticAcquisition, { kind: "observed-complete" }>["observation"],
  repoRoot: string
): RuleFixPreviewRuleResult {
  return Match.value(observation).pipe(
    Match.when({ kind: "check" }, () => missingProviderResult(rule.id)),
    Match.when({ kind: "apply-dry-run" }, (apply) => resultFromApply(rule, apply, repoRoot)),
    Match.exhaustive
  );
}

function resultFromApply(
  rule: RuleFixFacts,
  observation: Extract<
    Extract<GritDiagnosticAcquisition, { kind: "observed-complete" }>["observation"],
    { kind: "apply-dry-run" }
  >,
  repoRoot: string
): RuleFixPreviewRuleResult {
  const transformations = observation.findings.filter((finding) => finding.kind !== "match");
  return Match.value(observation.found > 0 && transformations.length === 0).pipe(
    Match.when(true, () => ({
      kind: "provider-failed" as const,
      ruleId: rule.id,
      failure: "DiagnosticOutputIncomplete" as const,
      detail:
        "transformation-evidence-missing: Grit reported findings without a transformation event.",
    })),
    Match.when(false, () => resultFromTransformations(rule, transformations, repoRoot)),
    Match.exhaustive
  );
}

function resultFromTransformations(
  rule: RuleFixFacts,
  transformations: readonly Exclude<GritApplyFindingEvidence, { kind: "match" }>[],
  repoRoot: string
): RuleFixPreviewRuleResult {
  const impacts = transformations.flatMap((finding) => impactsFromFinding(finding, repoRoot));
  const sorted = [...impacts].sort(compareImpacts);
  const declared = new Set(rule.fix.effects);
  const undeclared = effectOrder.filter(
    (effect) => sorted.some((impact) => impact.kind === effect) && !declared.has(effect)
  );
  return Option.match(Option.fromNullable(undeclared[0]), {
    onNone: () => ({ kind: "previewed", ruleId: rule.id, impacts: sorted }),
    onSome: (first) => ({
      kind: "authority-refused",
      ruleId: rule.id,
      undeclaredEffects: [first, ...undeclared.slice(1)],
    }),
  });
}

function impactsFromFinding(
  finding: Exclude<GritApplyFindingEvidence, { kind: "match" }>,
  repoRoot: string
): readonly FileImpact[] {
  return Match.value(finding).pipe(
    Match.when({ kind: "rewrite" }, (rewrite) => rewriteImpacts(rewrite, repoRoot)),
    Match.when({ kind: "create-file" }, ({ path: created }) => [
      { kind: "create" as const, path: repoRelative(repoRoot, created) },
    ]),
    Match.when({ kind: "remove-file" }, ({ path: removed }) => [
      { kind: "delete" as const, path: repoRelative(repoRoot, removed) },
    ]),
    Match.exhaustive
  );
}

function rewriteImpacts(
  finding: { readonly originalPath: string; readonly rewrittenPath: string },
  repoRoot: string
): readonly FileImpact[] {
  const from = repoRelative(repoRoot, finding.originalPath);
  const to = repoRelative(repoRoot, finding.rewrittenPath);
  return Match.value(from === to).pipe(
    Match.when(true, () => [{ kind: "modify" as const, path: from }]),
    Match.when(false, () => [
      { kind: "rename" as const, from, to },
      { kind: "modify" as const, path: to },
    ]),
    Match.exhaustive
  );
}

const effectOrder = ["modify", "create", "rename", "delete"] as const;

function compareImpacts(left: FileImpact, right: FileImpact): number {
  const kindOrder = effectOrder.indexOf(left.kind) - effectOrder.indexOf(right.kind);
  return kindOrder || impactKey(left).localeCompare(impactKey(right));
}

function impactKey(impact: FileImpact): string {
  return Match.value(impact).pipe(
    Match.when({ kind: "rename" }, ({ from, to }) => `${from}\0${to}`),
    Match.orElse(({ path: impactPath }) => impactPath)
  );
}

function repoRelative(repoRoot: string, absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

function gritFactsForFix(rule: RuleFixFacts): RuleGritFacts {
  return {
    id: rule.id,
    lane: rule.lane,
    message: rule.message,
    pathCoverage: rule.pathCoverage.map(clonePathCoverage),
    scanRoots: [...rule.scanRoots],
    runner: {
      name: "grit",
      files: { pattern: rule.fix.pattern },
      patternName: rule.patternName,
    },
    patternName: rule.patternName,
    diagnosticAcquisition: { kind: "apply-dry-run" },
  };
}

function clonePathCoverage(coverage: RuleFixFacts["pathCoverage"][number]) {
  return Match.value(coverage).pipe(
    Match.when({ kind: "exact-path" }, ({ kind, patterns }) => ({
      kind,
      patterns: [...patterns],
    })),
    Match.orElse((other) => ({ ...other }))
  );
}

function missingProviderResult(ruleId: string): RuleFixPreviewRuleResult {
  return {
    kind: "provider-failed",
    ruleId,
    failure: "DiagnosticProviderContractViolation",
    detail: `Fix preview provider returned no result for rule '${ruleId}'.`,
  };
}
