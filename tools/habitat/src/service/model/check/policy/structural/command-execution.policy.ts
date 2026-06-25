import {
  type HabitatCommandResult,
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
import { Clock, Effect } from "effect";
import type {
  RuleExecutionRecord,
  StructuralExecutionContext,
  StructuralNxPort,
} from "./context.policy.js";

export function executeFormatRulesEffect(
  formatRules: readonly RuleCommandExecutionFacts[],
  results: Map<string, RuleExecutionRecord>,
  context: StructuralExecutionContext
): Effect.Effect<void, never, any> {
  return Effect.gen(function* () {
    const records = yield* Effect.all(
      formatRules.map((rule) => executeFormatRuleEffect(rule, context)),
      {
        concurrency: "unbounded",
      }
    );
    for (const [ruleId, record] of records) results.set(ruleId, record);
  });
}

export function executeCommandRulesEffect(
  commandRules: readonly RuleCommandExecutionFacts[],
  results: Map<string, RuleExecutionRecord>,
  context: StructuralExecutionContext
): Effect.Effect<void, never, any> {
  return Effect.gen(function* () {
    const groupResults = yield* Effect.all(
      commandRuleExecutionGroups(commandRules, context).map((group) =>
        executeCommandRuleGroupEffect(group, context)
      ),
      {
        concurrency: "unbounded",
      }
    );
    for (const groupResult of groupResults) {
      for (const [ruleId, record] of groupResult) results.set(ruleId, record);
    }
  });
}

export function executeGraphBackedCommandRulesEffect(
  rules: readonly RuleCommandExecutionFacts[],
  graphRulesById: ReadonlyMap<string, RuleGraphFacts>,
  results: Map<string, RuleExecutionRecord>,
  context: StructuralExecutionContext
): Effect.Effect<void, never, any> {
  if (rules.length === 0) return Effect.void;
  const groups = groupedGraphBackedCommandRules(rules);
  return Effect.gen(function* () {
    const groupResults = yield* Effect.all(
      groups.map((group) => runGraphBackedCommandRuleGroup(group, graphRulesById, context)),
      { concurrency: "unbounded" }
    );
    for (const groupResult of groupResults) {
      for (const [ruleId, record] of groupResult) results.set(ruleId, record);
    }
  });
}

function executeFormatRuleEffect(
  rule: RuleCommandExecutionFacts,
  context: StructuralExecutionContext
): Effect.Effect<[string, RuleExecutionRecord], never, any> {
  return Effect.gen(function* () {
    const started = yield* Clock.currentTimeMillis;
    const result = yield* context.biome.run({ kind: "ci" }).pipe(
      Effect.match({
        onFailure: (error) => commandProviderFailureResult(rule, error),
        onSuccess: (commandResult) => commandRuleResult(rule, commandResult),
      })
    );
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    return [rule.id, { result, durationMs, disposition: { kind: "executed", durationMs } }];
  });
}

function runGraphBackedCommandRuleGroup(
  rules: readonly RuleCommandExecutionFacts[],
  graphRulesById: ReadonlyMap<string, RuleGraphFacts>,
  context: StructuralExecutionContext
): Effect.Effect<Map<string, RuleExecutionRecord>, never, any> {
  return Effect.gen(function* () {
    const targets = graphTargetsForRules(rules, graphRulesById);
    const started = yield* Clock.currentTimeMillis;
    const execution = yield* runGraphTargetsEffect(context.nx, targets).pipe(
      Effect.match({
        onFailure: (error) => ({ kind: "provider-failure" as const, error }),
        onSuccess: (commandResult) => ({
          kind: "completed" as const,
          result: spawnResultFromCommandResult(commandResult),
        }),
      })
    );
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    const records = new Map<string, RuleExecutionRecord>();
    for (const rule of rules) {
      const ruleResult =
        execution.kind === "provider-failure"
          ? commandProviderFailureResult(rule, execution.error)
          : {
              exitCode: execution.result.exitCode,
              diagnostics: ruleDiagnosticsFromCommandResult(rule, execution.result),
            };
      records.set(rule.id, {
        result: ruleResult,
        durationMs,
        timing: sharedExecutionTiming("nx:graph-targets", durationMs, rules),
        disposition: { kind: "executed", durationMs },
      });
    }
    return records;
  });
}

function sharedExecutionTiming(
  groupId: string,
  durationMs: number,
  rules: readonly { id: string }[]
): RuleExecutionTiming | undefined {
  if (rules.length < 2) return undefined;
  return {
    kind: "shared",
    groupId,
    durationMs,
    ruleCount: rules.length,
  };
}

function runGraphTargetsEffect(
  nx: StructuralNxPort,
  targets: readonly { project: string; target: string }[]
) {
  const uniqueTargets = uniqueGraphTargets(targets);
  if (uniqueTargets.length === 1) {
    const [target] = uniqueTargets;
    return nx.runTarget(target);
  }
  return nx.runMany({
    projects: sortedUnique(uniqueTargets.map((target) => target.project)),
    targets: sortedUnique(uniqueTargets.map((target) => target.target)),
  });
}

function uniqueGraphTargets(
  targets: readonly { project: string; target: string }[]
): Array<{ project: string; target: string }> {
  const seen = new Set<string>();
  const unique: Array<{ project: string; target: string }> = [];
  for (const target of targets) {
    const key = `${target.project}:${target.target}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(target);
  }
  return unique;
}

function groupedGraphBackedCommandRules(
  rules: readonly RuleCommandExecutionFacts[]
): RuleCommandExecutionFacts[][] {
  const groups = new Map<string, RuleCommandExecutionFacts[]>();
  for (const rule of rules) {
    const group = groups.get(rule.ownerTool) ?? [];
    group.push(rule);
    groups.set(rule.ownerTool, group);
  }
  return [...groups.values()];
}

function graphTargetsForRules(
  rules: readonly RuleCommandExecutionFacts[],
  graphRulesById: ReadonlyMap<string, RuleGraphFacts>
): Array<{ project: string; target: string }> {
  return rules.map((rule) => {
    const graphRule = graphRulesById.get(rule.id);
    if (graphRule?.alias.kind !== "depends-on") {
      throw new Error(`habitat internal error: missing graph target for ${rule.id}`);
    }
    return graphRule.alias.target;
  });
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
    const { executable, argv } = commandInvocationFromDetect(rule.detect);
    const key = JSON.stringify({ executable, argv, cwd: context.repoRoot });
    const current = groups.get(key);
    groups.set(key, {
      executable,
      argv,
      cwd: context.repoRoot,
      rules: current ? [...current.rules, rule] : [rule],
    });
  }
  return [...groups.values()];
}

function commandInvocationFromDetect(detect: readonly string[]): {
  readonly executable: string;
  readonly argv: readonly string[];
} {
  const executable = detect[0] ?? "";
  const argv = detect.slice(1);
  const runner = directScriptRunner(executable);
  if (!runner) return { executable, argv };
  return { executable: runner, argv: [executable, ...argv] };
}

function directScriptRunner(executable: string): "node" | "bash" | "python3" | undefined {
  if (!isScriptPath(executable)) return undefined;
  if (/\.(?:mjs|js|cjs)$/u.test(executable)) return "node";
  if (/\.sh$/u.test(executable)) return "bash";
  if (/\.py$/u.test(executable)) return "python3";
  return undefined;
}

function isScriptPath(value: string): boolean {
  return value.startsWith(".") || value.startsWith("/") || value.includes("/");
}

function executeCommandRuleGroupEffect(
  group: CommandRuleExecutionGroup,
  context: StructuralExecutionContext
): Effect.Effect<Map<string, RuleExecutionRecord>, never, any> {
  return Effect.gen(function* () {
    const started = yield* Clock.currentTimeMillis;
    const result = yield* context.command
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
    const records = new Map<string, RuleExecutionRecord>();
    for (const rule of group.rules) {
      records.set(rule.id, {
        result:
          result.kind === "provider-failure"
            ? commandProviderFailureResult(rule, result.error)
            : commandRuleResult(rule, result.commandResult),
        durationMs,
        timing: sharedExecutionTiming(commandTimingGroupId(group), durationMs, group.rules),
        disposition: { kind: "executed", durationMs },
      });
    }
    return records;
  });
}

function commandRuleGroupId(group: CommandRuleExecutionGroup): string {
  if (group.rules.length === 1) return group.rules[0]?.id ?? "command-rule";
  return `command-rules:${group.rules.map((rule) => rule.id).join("+")}`;
}

function commandTimingGroupId(group: CommandRuleExecutionGroup): string {
  return `command:${[group.executable, ...group.argv].join(" ")}`;
}

function commandRuleResult(
  rule: RuleCommandExecutionFacts,
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
  rule: RuleCommandExecutionFacts,
  error: unknown
): RuleRunResult {
  return {
    exitCode: 1,
    diagnostics: [
      {
        ruleId: rule.id,
        path: ".",
        message: `${rule.message}\n--- command provider failure ---\n${renderRuleExecutionError(error)}`,
        severity: rule.lane === "advisory" ? "advisory" : "error",
        baselined: false,
      },
    ],
  };
}

function renderRuleExecutionError(error: unknown): string {
  return isHabitatError(error)
    ? renderHabitatError(error)
    : error instanceof Error
      ? error.message
      : String(error);
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function isHabitatError(error: unknown): error is HabitatError {
  return Boolean(error && typeof error === "object" && "_tag" in error);
}
