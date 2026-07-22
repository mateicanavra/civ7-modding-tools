import {
  type HabitatCommandResult,
  type SpawnResult,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import { type HabitatError, renderHabitatError } from "@habitat/cli/resources/errors/index";
import type { RuleExecutionTiming } from "@habitat/cli/service/model/check/index";
import {
  type RuleRunResult,
  ruleDiagnosticsFromCommandResult,
} from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type {
  RuleCommandExecutionFacts,
  RuleGraphFacts,
} from "@habitat/cli/service/model/rules/index";
import { Clock, Effect, Match } from "effect";
import type {
  RuleExecutionRecord,
  StructuralExecutionContext,
  StructuralNxPort,
} from "./context.policy.js";

type ExecutableRuleResultFacts = Pick<
  RuleCommandExecutionFacts | RuleGraphFacts,
  "id" | "lane" | "message"
>;

interface ProviderFailureExecution {
  readonly kind: "provider-failure";
  readonly error: unknown;
}

interface CompletedSpawnExecution {
  readonly kind: "completed";
  readonly result: SpawnResult;
}

type GraphTargetExecution = ProviderFailureExecution | CompletedSpawnExecution;

interface CompletedCommandExecution {
  readonly kind: "completed";
  readonly commandResult: HabitatCommandResult;
}

type CommandExecution = ProviderFailureExecution | CompletedCommandExecution;

export const executeCommandRulesEffect = Effect.fn("habitat.check.executeCommandRules")(function* (
  commandRules: readonly RuleCommandExecutionFacts[],
  results: Map<string, RuleExecutionRecord>,
  context: Pick<StructuralExecutionContext, "command" | "repoRoot">
) {
  const groupResults = yield* Effect.all(
    commandRuleExecutionGroups(commandRules, context).map((group) =>
      executeCommandRuleGroupEffect(group, context)
    ),
    { concurrency: "unbounded" }
  );
  for (const groupResult of groupResults) {
    for (const [ruleId, record] of groupResult) results.set(ruleId, record);
  }
});

export const executeGraphBackedCommandRulesEffect = Effect.fn(
  "habitat.check.executeGraphBackedCommandRules"
)(function* (
  rules: readonly RuleGraphFacts[],
  results: Map<string, RuleExecutionRecord>,
  context: Pick<StructuralExecutionContext, "nx">
) {
  const groupResults = yield* Effect.if(rules.length === 0, {
    onTrue: () => Effect.succeed([]),
    onFalse: () => runGraphBackedCommandRuleGroupEffect(rules, context).pipe(Effect.map(Array.of)),
  });
  for (const groupResult of groupResults) {
    for (const [ruleId, record] of groupResult) results.set(ruleId, record);
  }
});

const runGraphBackedCommandRuleGroupEffect = Effect.fn(
  "habitat.check.runGraphBackedCommandRuleGroup"
)(function* (rules: readonly RuleGraphFacts[], context: Pick<StructuralExecutionContext, "nx">) {
  const targets = graphTargetsForRules(rules);
  const started = yield* Clock.currentTimeMillis;
  const execution: GraphTargetExecution = yield* runGraphTargetsEffect(context.nx, targets).pipe(
    Effect.match({
      onFailure: (error) => ({ kind: "provider-failure" as const, error }),
      onSuccess: (commandResult) => ({
        kind: "completed" as const,
        result: spawnResultFromCommandResult(commandResult),
      }),
    })
  );
  const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
  return new Map(
    rules.map((rule) => [rule.id, graphRuleExecutionRecord(rule, execution, durationMs, rules)])
  );
});

function graphRuleExecutionRecord(
  rule: RuleGraphFacts,
  execution: GraphTargetExecution,
  durationMs: number,
  rules: readonly RuleGraphFacts[]
): RuleExecutionRecord {
  const result = Match.value(execution).pipe(
    Match.when({ kind: "provider-failure" }, ({ error }) =>
      commandProviderFailureResult(rule, error)
    ),
    Match.when({ kind: "completed" }, ({ result: commandResult }) => ({
      exitCode: commandResult.exitCode,
      diagnostics: ruleDiagnosticsFromCommandResult(rule, commandResult),
    })),
    Match.exhaustive
  );
  return {
    result,
    durationMs,
    timing: sharedExecutionTiming("nx:graph-targets", durationMs, rules),
    disposition: { kind: "executed", durationMs },
  };
}

function sharedExecutionTiming(
  groupId: string,
  durationMs: number,
  rules: readonly { id: string }[]
): RuleExecutionTiming | undefined {
  return Match.value(rules.length < 2).pipe(
    Match.when(true, () => undefined),
    Match.when(false, () => ({
      kind: "shared" as const,
      groupId,
      durationMs,
      ruleCount: rules.length,
    })),
    Match.exhaustive
  );
}

const runGraphTargetsEffect = Effect.fn("habitat.check.runGraphTargets")(function* (
  nx: StructuralNxPort,
  targets: readonly { project: string; target: string }[]
) {
  const uniqueTargets = uniqueGraphTargets(targets);
  return yield* Match.value(uniqueTargets.length === 1).pipe(
    Match.when(true, () => nx.runTarget(requireSingleGraphTarget(uniqueTargets))),
    Match.when(false, () =>
      nx.runMany({
        projects: sortedUnique(uniqueTargets.map((target) => target.project)),
        targets: sortedUnique(uniqueTargets.map((target) => target.target)),
      })
    ),
    Match.exhaustive
  );
});

function requireSingleGraphTarget(targets: readonly { project: string; target: string }[]): {
  project: string;
  target: string;
} {
  return Match.value(targets[0]).pipe(
    Match.when(Match.undefined, () => {
      throw new Error("habitat internal error: expected one graph target");
    }),
    Match.orElse((target) => target)
  );
}

function uniqueGraphTargets(
  targets: readonly { project: string; target: string }[]
): Array<{ project: string; target: string }> {
  return [
    ...new Map(targets.map((target) => [`${target.project}:${target.target}`, target])).values(),
  ];
}

function graphTargetsForRules(
  rules: readonly RuleGraphFacts[]
): Array<{ project: string; target: string }> {
  return rules.map((rule) =>
    Match.value(rule.alias).pipe(
      Match.when({ kind: "depends-on" }, ({ target }) => target),
      Match.orElse(() => {
        throw new Error(`habitat internal error: missing graph target for ${rule.id}`);
      })
    )
  );
}

interface CommandRuleExecutionGroup {
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly rules: readonly RuleCommandExecutionFacts[];
}

function commandRuleExecutionGroups(
  rules: readonly RuleCommandExecutionFacts[],
  context: { readonly repoRoot: string }
): CommandRuleExecutionGroup[] {
  const groups = new Map<string, CommandRuleExecutionGroup>();
  for (const rule of rules) {
    const { executable, argv } = commandInvocationFromRunner(rule.runner);
    const key = commandExecutionGroupKey(executable, argv, context.repoRoot);
    const current = groups.get(key);
    const groupedRules = Match.value(current).pipe(
      Match.when(Match.undefined, () => [rule]),
      Match.orElse((group) => [...group.rules, rule])
    );
    groups.set(key, {
      executable,
      argv,
      cwd: context.repoRoot,
      rules: groupedRules,
    });
  }
  return [...groups.values()];
}

function commandExecutionGroupKey(
  executable: string,
  argv: readonly string[],
  cwd: string
): string {
  return [executable, cwd, ...argv].map((part) => `${part.length}:${part}`).join("|");
}

function commandInvocationFromRunner(runner: RuleCommandExecutionFacts["runner"]): {
  readonly executable: string;
  readonly argv: readonly string[];
} {
  return Match.value(runner.runtime).pipe(
    Match.when("bun", () => ({ executable: "bun", argv: [runner.files.script] })),
    Match.when("node", () => ({ executable: "node", argv: [runner.files.script] })),
    Match.when("bash", () => ({ executable: "bash", argv: [runner.files.script] })),
    Match.exhaustive
  );
}

const executeCommandRuleGroupEffect = Effect.fn("habitat.check.executeCommandRuleGroup")(function* (
  group: CommandRuleExecutionGroup,
  context: Pick<StructuralExecutionContext, "command">
) {
  const started = yield* Clock.currentTimeMillis;
  const execution: CommandExecution = yield* context.command
    .run({
      commandId: commandRuleGroupId(group),
      kind: "workspace-tool",
      executable: group.executable,
      argv: group.argv,
      cwd: group.cwd,
      captureGitState: false,
    })
    .pipe(
      Effect.match({
        onFailure: (error) => ({ kind: "provider-failure" as const, error }),
        onSuccess: (commandResult) => ({ kind: "completed" as const, commandResult }),
      })
    );
  const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
  return new Map(
    group.rules.map((rule) => [
      rule.id,
      commandRuleExecutionRecord(rule, execution, durationMs, group),
    ])
  );
});

function commandRuleExecutionRecord(
  rule: RuleCommandExecutionFacts,
  execution: CommandExecution,
  durationMs: number,
  group: CommandRuleExecutionGroup
): RuleExecutionRecord {
  const result = Match.value(execution).pipe(
    Match.when({ kind: "provider-failure" }, ({ error }) =>
      commandProviderFailureResult(rule, error)
    ),
    Match.when({ kind: "completed" }, ({ commandResult }) =>
      commandRuleResult(rule, commandResult)
    ),
    Match.exhaustive
  );
  return {
    result,
    durationMs,
    timing: sharedExecutionTiming(commandTimingGroupId(group), durationMs, group.rules),
    disposition: { kind: "executed", durationMs },
  };
}

function commandRuleGroupId(group: CommandRuleExecutionGroup): string {
  return Match.value(group.rules.length === 1).pipe(
    Match.when(true, () => group.rules[0]?.id ?? "command-rule"),
    Match.when(false, () => `command-rules:${group.rules.map((rule) => rule.id).join("+")}`),
    Match.exhaustive
  );
}

function commandTimingGroupId(group: CommandRuleExecutionGroup): string {
  return `command:${[group.executable, ...group.argv].join(" ")}`;
}

function commandRuleResult(
  rule: ExecutableRuleResultFacts,
  result: HabitatCommandResult
): RuleRunResult {
  return {
    exitCode: result.exit.code,
    diagnostics: ruleDiagnosticsFromCommandResult(rule, {
      exitCode: result.exit.code,
      stdout: result.stdout.text,
      stderr: result.stderr.text,
    }),
  };
}

function commandProviderFailureResult(
  rule: ExecutableRuleResultFacts,
  error: unknown
): RuleRunResult {
  const severity = Match.value(rule.lane).pipe(
    Match.when("advisory", () => "advisory" as const),
    Match.orElse(() => "error" as const)
  );
  return {
    exitCode: 1,
    diagnostics: [
      {
        ruleId: rule.id,
        path: ".",
        message: `${rule.message}\n--- command provider failure ---\n${renderRuleExecutionError(error)}`,
        severity,
        baselined: false,
      },
    ],
  };
}

function renderRuleExecutionError(error: unknown): string {
  return Match.value(error).pipe(
    Match.when(isHabitatError, renderHabitatError),
    Match.orElse(renderNonHabitatError)
  );
}

function renderNonHabitatError(error: unknown): string {
  return Match.value(error).pipe(
    Match.when(Match.instanceOf(Error), (cause) => cause.message),
    Match.orElse(String)
  );
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function isHabitatError(error: unknown): error is HabitatError {
  return Boolean(error && typeof error === "object" && "_tag" in error);
}
