import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { activeRuleGraphFacts } from "../rules/facts.js";
import { mergeBase } from "./baseline.js";
import type { CheckReport, RuleReport } from "./diagnostics.js";
import { repoRoot } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";
import {
  readWorkspaceGraph,
  type VerifyTargetPlan,
  VerifyTargetPlanSchema,
  verifyTargetNames,
  verifyTargetPlan,
} from "./workspace-graph/index.js";

export interface VerifyOptions {
  base?: string;
  commandArgs?: readonly string[];
}

export const VerifyNonClaimIdSchema = Type.Union([
  Type.Literal("does-not-prove-ci"),
  Type.Literal("does-not-prove-apply-safety"),
  Type.Literal("does-not-prove-graphite-readiness"),
  Type.Literal("does-not-prove-runtime"),
  Type.Literal("does-not-prove-rule-correctness"),
]);
export type VerifyNonClaimId = Static<typeof VerifyNonClaimIdSchema>;

export const VerifyCommandRecordSchema = Type.Object(
  {
    argv: Type.Array(Type.String()),
    cwd: Type.String(),
    env: Type.Record(Type.String(), Type.String()),
    startedAt: Type.String(),
    durationMs: Type.Number({ minimum: 0 }),
    exitCode: Type.Integer(),
  },
  { additionalProperties: false }
);

export const VerifyBaseSchema = Type.Object(
  {
    requested: Type.Union([Type.String(), Type.Null()]),
    resolved: Type.String(),
    source: Type.Union([Type.Literal("flag"), Type.Literal("default")]),
  },
  { additionalProperties: false }
);

export const VerifyHabitatCheckSummarySchema = Type.Object(
  {
    reportSchemaVersion: Type.Literal(1),
    selectedRuleIds: Type.Array(Type.String()),
    selectedRealRuleIds: Type.Array(Type.String()),
    builtInRuleIds: Type.Array(Type.String()),
    statusCounts: Type.Record(Type.String(), Type.Number({ minimum: 0 })),
    advisoryCount: Type.Number({ minimum: 0 }),
    failingCount: Type.Number({ minimum: 0 }),
  },
  { additionalProperties: false }
);

export const VerifyNxCacheTaskSchema = Type.Object(
  {
    taskId: Type.String(),
    project: Type.String(),
    target: Type.String(),
    cacheState: Type.Union([Type.Literal("cache-hit"), Type.Literal("unknown")]),
  },
  { additionalProperties: false }
);

const VerifyNxAffectedCompletedFieldsSchema = {
  argv: Type.Array(Type.String()),
  targets: Type.Array(Type.String()),
  projects: Type.Array(Type.String()),
  cacheStateByTask: Type.Array(VerifyNxCacheTaskSchema),
  exitCode: Type.Integer(),
  stdoutLength: Type.Number({ minimum: 0 }),
  stderrLength: Type.Number({ minimum: 0 }),
  stdoutPreview: Type.String(),
  stderrPreview: Type.String(),
  stdoutTruncated: Type.Boolean(),
  stderrTruncated: Type.Boolean(),
};

export const VerifyNxAffectedSchema = Type.Union([
  Type.Object(
    {
      status: Type.Literal("executed"),
      ...VerifyNxAffectedCompletedFieldsSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("failed"),
      ...VerifyNxAffectedCompletedFieldsSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("skipped"),
      skipReason: Type.Union([
        Type.Literal("habitat-check-failed"),
        Type.Literal("workspace-graph-refused"),
      ]),
      argv: Type.Array(Type.String()),
      targets: Type.Array(Type.String()),
      projects: Type.Array(Type.String(), { maxItems: 0 }),
      cacheStateByTask: Type.Array(VerifyNxCacheTaskSchema, { maxItems: 0 }),
      exitCode: Type.Null(),
      stdoutLength: Type.Literal(0),
      stderrLength: Type.Literal(0),
      stdoutPreview: Type.Literal(""),
      stderrPreview: Type.Literal(""),
      stdoutTruncated: Type.Literal(false),
      stderrTruncated: Type.Literal(false),
    },
    { additionalProperties: false }
  ),
]);

export const VerifyPostStateSchema = Type.Object(
  {
    gitStatusShort: Type.String(),
    resourcesStatus: Type.String(),
  },
  { additionalProperties: false }
);

export const VerifyReceiptSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    command: VerifyCommandRecordSchema,
    base: VerifyBaseSchema,
    habitatCheck: VerifyHabitatCheckSummarySchema,
    nxAffected: VerifyNxAffectedSchema,
    postState: VerifyPostStateSchema,
    nonClaims: Type.Array(VerifyNonClaimIdSchema),
  },
  { additionalProperties: false }
);
export type VerifyReceipt = Static<typeof VerifyReceiptSchema>;

export function validateVerifyReceipt(value: unknown): string[] {
  return [...Value.Errors(VerifyReceiptSchema, value)].map((error) => error.message);
}

export function isVerifyReceipt(value: unknown): value is VerifyReceipt {
  return Value.Check(VerifyReceiptSchema, value);
}

export function stringifyVerifyReceipt(receipt: VerifyReceipt): string {
  const schemaErrors = validateVerifyReceipt(receipt);
  if (schemaErrors.length > 0) {
    throw new Error(
      `habitat internal error: verify receipt violates its own schema:\n${schemaErrors.join("\n")}`
    );
  }
  return JSON.stringify(receipt, null, 2);
}

export interface VerifyReceiptInput {
  requestedBase?: string;
  resolvedBase: string;
  commandArgs?: readonly string[];
  startedAt: string;
  durationMs: number;
  exitCode: number;
  checkReport: CheckReport;
  verifyTargetPlan?: VerifyTargetPlan;
  affectedResult?: SpawnResult;
}

export const verifyAffectedTargets = [...verifyTargetNames()];

export function resolveVerifyBase(base?: string): string {
  return base ?? mergeBase("main") ?? "main";
}

export async function readVerifyTargetPlan(): Promise<VerifyTargetPlan> {
  const graph = await readWorkspaceGraph();
  if (graph.kind === "graph-ready")
    return verifyTargetPlan(graph.snapshot.projects, undefined, undefined, activeRuleGraphFacts);
  return graphRefusedVerifyTargetPlan(graph.kind, graph.message);
}

export function runAffectedVerification(
  base: string,
  targetPlan: VerifyTargetPlan = verifyTargetPlan()
): SpawnResult {
  return run(affectedVerificationArgv(base, targetPlan), {
    cwd: repoRoot,
  });
}

export function createVerifyReceipt(input: VerifyReceiptInput): VerifyReceipt {
  const targetPlan = input.verifyTargetPlan ?? verifyTargetPlan();
  const nxArgv = affectedVerificationArgv(input.resolvedBase, targetPlan);
  const gitStatus = run(["git", "status", "--short"], { cwd: repoRoot });
  const resourcesStatus = run(["bun", "run", "resources:status"], { cwd: repoRoot });
  const nxAffected =
    input.checkReport.ok && input.affectedResult
      ? completedNxAffected(nxArgv, input.affectedResult)
      : skippedNxAffected(nxArgv, input.checkReport.ok ? targetPlan : undefined);
  return {
    schemaVersion: 1,
    command: {
      argv: ["habitat", "verify", ...(input.commandArgs ?? [])],
      cwd: repoRoot,
      env: selectedVerifyEnv(),
      startedAt: input.startedAt,
      durationMs: input.durationMs,
      exitCode: input.exitCode,
    },
    base: {
      requested: input.requestedBase ?? null,
      resolved: input.resolvedBase,
      source: input.requestedBase ? "flag" : "default",
    },
    habitatCheck: summarizeVerifyCheckReport(input.checkReport),
    nxAffected,
    postState: {
      gitStatusShort: gitStatus.stdout.trim(),
      resourcesStatus: `${resourcesStatus.stdout}${resourcesStatus.stderr}`.trim(),
    },
    nonClaims: [
      "does-not-prove-ci",
      "does-not-prove-apply-safety",
      "does-not-prove-graphite-readiness",
      "does-not-prove-runtime",
      "does-not-prove-rule-correctness",
    ],
  };
}

function affectedVerificationArgv(base: string, targetPlan: VerifyTargetPlan): string[] {
  return ["nx", "affected", "-t", targetPlan.targets.join(","), "--base", base];
}

function completedNxAffected(
  argv: string[],
  affected: SpawnResult
): Extract<VerifyReceipt["nxAffected"], { status: "executed" | "failed" }> {
  const stdout = boundedPreview(affected.stdout);
  const stderr = boundedPreview(affected.stderr);
  return {
    status: affected.exitCode === 0 ? "executed" : "failed",
    argv,
    targets: targetsFromArgv(argv),
    projects: parseNxAffectedProjects(affected.stdout),
    cacheStateByTask: parseNxTaskCacheStates(affected.stdout),
    exitCode: affected.exitCode,
    stdoutLength: affected.stdout.length,
    stderrLength: affected.stderr.length,
    stdoutPreview: stdout.text,
    stderrPreview: stderr.text,
    stdoutTruncated: stdout.truncated,
    stderrTruncated: stderr.truncated,
  };
}

function skippedNxAffected(
  argv: string[],
  targetPlan?: VerifyTargetPlan
): Extract<VerifyReceipt["nxAffected"], { status: "skipped" }> {
  return {
    status: "skipped",
    skipReason:
      targetPlan?.kind === "verify-target-plan-refused"
        ? "workspace-graph-refused"
        : "habitat-check-failed",
    argv,
    targets: targetsFromArgv(argv),
    projects: [],
    cacheStateByTask: [],
    exitCode: null,
    stdoutLength: 0,
    stderrLength: 0,
    stdoutPreview: "",
    stderrPreview: "",
    stdoutTruncated: false,
    stderrTruncated: false,
  };
}

function graphRefusedVerifyTargetPlan(
  reason: "malformed-graph-json" | "nx-read-failure" | "nx-daemon-failure",
  message: string
): VerifyTargetPlan {
  return Value.Parse(VerifyTargetPlanSchema, {
    kind: "verify-target-plan-refused",
    targets: verifyAffectedTargets,
    refusal: { kind: "graph-refusal", reason, message },
  });
}

function targetsFromArgv(argv: readonly string[]): string[] {
  const targetFlagIndex = argv.indexOf("-t");
  if (targetFlagIndex === -1) return [];
  return (argv[targetFlagIndex + 1] ?? "").split(",").filter((target) => target.length > 0);
}

function summarizeVerifyCheckReport(report: CheckReport): VerifyReceipt["habitatCheck"] {
  const builtInRuleIds = report.rules
    .filter((rule) => rule.ownerTool === "habitat-native" && rule.detect.includes("(built-in)"))
    .map((rule) => rule.ruleId);
  const selectedRuleIds = report.rules.map((rule) => rule.ruleId);
  const selectedRealRuleIds = selectedRuleIds.filter((ruleId) => !builtInRuleIds.includes(ruleId));
  return {
    reportSchemaVersion: report.schemaVersion,
    selectedRuleIds,
    selectedRealRuleIds,
    builtInRuleIds,
    statusCounts: countRuleStatuses(report.rules),
    advisoryCount: report.rules.filter((rule) => rule.status === "advisory-findings").length,
    failingCount: report.rules.filter((rule) => rule.status === "fail").length,
  };
}

function countRuleStatuses(reports: readonly RuleReport[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const report of reports) {
    counts[report.status] = (counts[report.status] ?? 0) + 1;
  }
  return counts;
}

function selectedVerifyEnv(): Record<string, string> {
  return Object.fromEntries(
    ["CI", "FORCE_COLOR", "NX_DAEMON", "NX_CACHE_PROJECT_GRAPH", "NX_PROJECT_GRAPH_CACHE"]
      .map((key): [string, string] | undefined => {
        const value = process.env[key];
        return value === undefined ? undefined : [key, value];
      })
      .filter((entry): entry is [string, string] => entry !== undefined)
  );
}

function parseNxAffectedProjects(stdout: string): string[] {
  const projectLines = [...stdout.matchAll(/^\s*-\s+([^\s].*)$/gm)].map((match) => match[1].trim());
  return sortedUnique(
    projectLines
      .map((line) => line.split(/\s+/)[0])
      .filter((project) => project.length > 0 && !project.includes(":"))
  );
}

function parseNxTaskCacheStates(
  stdout: string
): Extract<VerifyReceipt["nxAffected"], { status: "executed" }>["cacheStateByTask"] {
  const tasks = [...stdout.matchAll(/^>\s+nx run ([^:\s]+):([^\s]+)(.*)$/gm)];
  return tasks.map((match) => {
    const project = match[1];
    const target = match[2];
    const taskLine = match[3] ?? "";
    return {
      taskId: `${project}:${target}`,
      project,
      target,
      cacheState: taskLine.includes("existing outputs match the cache") ? "cache-hit" : "unknown",
    };
  });
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function boundedPreview(value: string, limit = 4096): { text: string; truncated: boolean } {
  if (value.length <= limit) return { text: value, truncated: false };
  return { text: value.slice(0, limit), truncated: true };
}
