import type { FileSystem } from "@effect/platform";
import {
  applyBaseline,
  type BaselineAuthorityContext,
  type BaselineExpansionDecision,
  type BaselineRuleContractInput,
  baselineContractInputs,
  errorMessage,
  guardBaselineExpansionEffect,
  loadBaselineStateEffect,
  violationKey,
  writeBaselineEffect,
} from "@habitat/cli/service/model/baseline/index";
import {
  executeSelectedRulesEffect,
  type RuleExecutionRecord,
  type StructuralExecutionContext,
} from "@habitat/cli/service/model/check/policy/structural/index";
import type { RuleSelectorFacts } from "@habitat/cli/service/model/rules/index";
import type { RuleSelection } from "@habitat/cli/service/model/rules/policy/selection.policy";
import {
  type RuleSelectionResult,
  selectRules,
} from "@habitat/cli/service/model/rules/policy/selection.policy";
import { Effect, Match, Option } from "effect";

export type BaselineExpansionResult =
  | { ok: true; messages: string[] }
  | Extract<RuleSelectionResult, { ok: false }>
  | {
      ok: false;
      requested: RuleSelection;
      reason: "baseline-contract";
      message: string;
    };

type BaselineContractFailure = Extract<BaselineExpansionResult, { reason: "baseline-contract" }>;
type BaselineExpansionProgress = { ok: true; messages: string[] } | BaselineContractFailure;

export const expandBaselinesEffect = Effect.fn("habitat.check.expandBaselines")(function* (
  selection: RuleSelection = {},
  options: { base?: string; repoRoot: string },
  executionContext: StructuralExecutionContext
): Effect.fn.Return<BaselineExpansionResult, never, FileSystem.FileSystem> {
  const selected = selectRules(selection, executionContext.rules.selector);
  return yield* Match.value(selected).pipe(
    Match.when({ ok: false }, (refusal) => Effect.succeed(refusal)),
    Match.when({ ok: true }, ({ rules }) =>
      expandSelectedBaselinesEffect(selection, rules, options, executionContext)
    ),
    Match.exhaustive
  );
});

const expandSelectedBaselinesEffect = Effect.fn("habitat.check.expandSelectedBaselines")(function* (
  selection: RuleSelection,
  rules: readonly RuleSelectorFacts[],
  options: { base?: string; repoRoot: string },
  executionContext: StructuralExecutionContext
): Effect.fn.Return<BaselineExpansionProgress, never, FileSystem.FileSystem> {
  const context = baselineContext(executionContext);
  const ruleResults = yield* executeSelectedRulesEffect(rules, {}, executionContext);
  const baselinesByRuleId = factsByRuleId(
    baselineContractInputs(
      executionContext.rules,
      rules.map((rule) => rule.id)
    )
  );
  const initial: BaselineExpansionProgress = { ok: true, messages: [] };
  return yield* Effect.reduce<
    RuleSelectorFacts,
    BaselineExpansionProgress,
    never,
    FileSystem.FileSystem
  >(rules, initial, (progress, rule) =>
    expandBaselineRuleFromProgressEffect(
      progress,
      rule,
      selection,
      options,
      context,
      executionContext,
      baselinesByRuleId,
      ruleResults
    )
  );
});

const expandBaselineRuleFromProgressEffect = Effect.fn(
  "habitat.check.expandBaselineRuleFromProgress"
)(function* (
  progress: BaselineExpansionProgress,
  rule: RuleSelectorFacts,
  selection: RuleSelection,
  options: { base?: string; repoRoot: string },
  context: BaselineAuthorityContext,
  executionContext: StructuralExecutionContext,
  baselinesByRuleId: ReadonlyMap<string, BaselineRuleContractInput>,
  ruleResults: ReadonlyMap<string, RuleExecutionRecord>
) {
  return yield* Match.value(progress).pipe(
    Match.when({ ok: false }, (failure) => Effect.succeed(failure)),
    Match.when({ ok: true }, ({ messages }) =>
      expandBaselineRuleEffect(
        rule,
        selection,
        options,
        messages,
        context,
        executionContext,
        requireMapValue(baselinesByRuleId, rule.id, "baseline facts"),
        requireMapValue(ruleResults, rule.id, "rule result")
      )
    ),
    Match.exhaustive
  );
});

const expandBaselineRuleEffect = Effect.fn("habitat.check.expandBaselineRule")(function* (
  rule: RuleSelectorFacts,
  selection: RuleSelection,
  options: { base?: string; repoRoot: string },
  messages: string[],
  context: BaselineAuthorityContext,
  executionContext: StructuralExecutionContext,
  baselineFacts: BaselineRuleContractInput,
  execution: RuleExecutionRecord
) {
  const baseline = yield* loadBaselineStateEffect(baselineFacts, context);
  const { diagnostics } = execution.result;
  const baselineResult = applyBaseline(diagnostics, baseline);
  return yield* Match.value(baselineResult).pipe(
    Match.when({ status: "refused" }, ({ refusals }) =>
      Effect.succeed(
        baselineContractFailure(selection, refusals.map((failure) => failure.message).join(" "))
      )
    ),
    Match.when({ status: "applied" }, () =>
      expandUncoveredDiagnosticsEffect(
        rule,
        selection,
        options,
        messages,
        diagnostics,
        context,
        executionContext
      )
    ),
    Match.exhaustive
  );
});

const expandUncoveredDiagnosticsEffect = Effect.fn("habitat.check.expandUncoveredDiagnostics")(
  function* (
    rule: RuleSelectorFacts,
    selection: RuleSelection,
    options: { base?: string; repoRoot: string },
    messages: string[],
    diagnostics: RuleExecutionRecord["result"]["diagnostics"],
    context: BaselineAuthorityContext,
    executionContext: StructuralExecutionContext
  ) {
    const keys = diagnostics
      .filter((diagnostic) => diagnostic.severity === "error" && !diagnostic.baselined)
      .map(violationKey);
    return yield* Match.value(keys.length > 0).pipe(
      Match.when(false, () => Effect.succeed({ ok: true as const, messages })),
      Match.when(true, () =>
        guardAndWriteBaselineEffect(
          rule.id,
          keys,
          selection,
          options,
          messages,
          context,
          executionContext
        )
      ),
      Match.exhaustive
    );
  }
);

const guardAndWriteBaselineEffect = Effect.fn("habitat.check.guardAndWriteBaseline")(function* (
  ruleId: string,
  keys: readonly string[],
  selection: RuleSelection,
  options: { base?: string; repoRoot: string },
  messages: string[],
  context: BaselineAuthorityContext,
  executionContext: StructuralExecutionContext
) {
  const authorityContext = baselineContextWithRegistry(context, executionContext);
  const guard = yield* guardBaselineExpansionEffect(
    ruleId,
    keys,
    options.base ?? "main",
    authorityContext
  );
  return yield* Match.value(guard).pipe(
    Match.when({ status: "refused" }, ({ message }) =>
      Effect.succeed(baselineContractFailure(selection, message))
    ),
    Match.when({ status: "accepted" }, (accepted) =>
      writeAcceptedBaselineEffect(
        ruleId,
        keys.length,
        accepted,
        selection,
        messages,
        authorityContext
      )
    ),
    Match.exhaustive
  );
});

const writeAcceptedBaselineEffect = Effect.fn("habitat.check.writeAcceptedBaseline")(function* (
  ruleId: string,
  entryCount: number,
  guard: Extract<BaselineExpansionDecision, { status: "accepted" }>,
  selection: RuleSelection,
  messages: string[],
  context: ReturnType<typeof baselineContextWithRegistry>
) {
  const writeResult = yield* writeBaselineEffect(ruleId, guard.occurrences, context).pipe(
    Effect.map(() => null),
    Effect.catchAll((error) => Effect.succeed(error))
  );
  return Match.value(writeResult).pipe(
    Match.when(Match.null, () => ({
      ok: true as const,
      messages: [...messages, `baseline written: ${ruleId} (${entryCount} entries)`],
    })),
    Match.orElse((failure) =>
      baselineContractFailure(
        selection,
        `Unable to write baseline for '${ruleId}': ${errorMessage(failure)}`
      )
    )
  );
});

function baselineContractFailure(
  requested: RuleSelection,
  message: string
): BaselineContractFailure {
  return { ok: false, requested, reason: "baseline-contract", message };
}

function baselineContext(context: StructuralExecutionContext): BaselineAuthorityContext {
  return {
    fileSystem: context.baselineFileSystem,
    git: context.git,
    repoRoot: context.repoRoot,
  };
}

function baselineContextWithRegistry(
  context: BaselineAuthorityContext,
  executionContext: StructuralExecutionContext
) {
  return {
    fileSystem: context.fileSystem,
    git: context.git,
    repoRoot: context.repoRoot,
    registry: baselineContractInputs(executionContext.rules),
  };
}

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}

function requireMapValue<T extends object>(
  map: ReadonlyMap<string, T>,
  ruleId: string,
  factKind: string
): T {
  return Option.fromNullable(map.get(ruleId)).pipe(
    Option.getOrThrowWith(
      () => new Error(`habitat internal error: missing ${factKind} for ${ruleId}`)
    )
  );
}
