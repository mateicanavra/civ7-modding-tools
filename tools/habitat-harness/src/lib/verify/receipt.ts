import { Value } from "typebox/value";
import { activeRuleGraphFacts } from "../../domains/rule-registry/active-facts.js";
import type { SpawnResult } from "../../providers/command/index.js";
import { type VerifyCheckSummary, verifyCheckSummary } from "../check-report.js";
import type { CheckReport } from "../diagnostics.js";
import { repoRoot } from "../paths.js";
import {
  readWorkspaceGraph,
  type VerifyTargetPlan,
  VerifyTargetPlanSchema,
  verifyTargetNames,
  verifyTargetPlan,
} from "../workspace-graph/index.js";
import { selectedVerifyEnv } from "./command-output.js";
import { affectedVerificationArgv, completedNxAffected, skippedNxAffected } from "./nx-affected.js";
import { postStateObservation } from "./post-state.js";
import {
  type VerifyBaseResolution,
  VerifyHabitatCheckSummarySchema,
  type VerifyReceipt,
  VerifyReceiptSchema,
  VerifySelectorStateSchema,
  VerifyTargetPlanConsumptionSchema,
} from "./schema.js";

/** Inputs needed to assemble a verify handoff receipt after command execution. */
export interface VerifyReceiptInput {
  /** Optional base ref explicitly requested by the caller. */
  requestedBase?: string;
  /** Effective Git base used for affected verification. */
  resolvedBase: string;
  /** Source of the effective base. */
  baseSource?: Extract<VerifyBaseResolution, { kind: "resolved" }>["source"];
  /** Raw verify command args recorded into the receipt. */
  commandArgs?: readonly string[];
  /** ISO timestamp captured when verify started. */
  startedAt: string;
  /** Elapsed command duration in milliseconds. */
  durationMs: number;
  /** Verify command exit code. */
  exitCode: number;
  /** Structural check report consumed before affected execution. */
  checkReport: CheckReport;
  /** Optional target plan supplied by tests or the command after reading the graph. */
  verifyTargetPlan?: VerifyTargetPlan;
  /** Optional affected command result; absent means verify skipped affected execution. */
  affectedResult?: SpawnResult;
  /** Git status observation captured through the Git provider before receipt assembly. */
  gitStatus: SpawnResult;
}

/** Verify target names currently owned by the workspace graph boundary. */
export const verifyAffectedTargets = [...verifyTargetNames()];

/**
 * Reads the workspace graph and returns the verify target plan.
 *
 * @returns Runnable target plan or graph-refusal plan for the verify receipt.
 */
export async function readVerifyTargetPlan(): Promise<VerifyTargetPlan> {
  const graph = await readWorkspaceGraph();
  if (graph.kind === "graph-ready")
    return verifyTargetPlan(graph.snapshot.projects, undefined, undefined, activeRuleGraphFacts);
  return graphRefusedVerifyTargetPlan(graph.kind, graph.message);
}

/**
 * Creates the versioned JSON receipt emitted by `habitat verify --json`.
 *
 * @param input - Command, check, target-plan, affected, and post-state inputs.
 * @returns TypeBox-validated verify receipt.
 */
export function createVerifyReceipt(input: VerifyReceiptInput): VerifyReceipt {
  const targetPlan = input.verifyTargetPlan ?? verifyTargetPlan();
  const nxArgv = affectedVerificationArgv(input.resolvedBase, targetPlan);
  const habitatCheckSummary = verifyCheckSummary(input.checkReport);
  const nxAffected =
    habitatCheckSummary.allowsAffectedExecution &&
    targetPlan.kind === "verify-target-plan" &&
    input.affectedResult
      ? completedNxAffected(nxArgv, input.affectedResult)
      : skippedNxAffected(
          nxArgv,
          habitatCheckSummary.allowsAffectedExecution ? targetPlan : undefined
        );
  const postState = postStateObservation(input.gitStatus);
  return Value.Parse(VerifyReceiptSchema, {
    schemaVersion: 1,
    outcome: receiptOutcome({
      check: habitatCheckSummary,
      targetPlan,
      nxAffected,
      postState,
    }),
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
      source: input.baseSource ?? (input.requestedBase ? "flag" : "merge-base"),
    },
    habitatCheck: summarizeVerifyCheckReport(habitatCheckSummary),
    targetPlan: consumeVerifyTargetPlan(targetPlan),
    nxAffected,
    postState,
  });
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

function consumeVerifyTargetPlan(targetPlan: VerifyTargetPlan): VerifyReceipt["targetPlan"] {
  if (targetPlan.kind === "verify-target-plan") {
    return Value.Parse(VerifyTargetPlanConsumptionSchema, {
      kind: "target-plan-ready",
      targets: targetPlan.targets,
    });
  }
  return Value.Parse(VerifyTargetPlanConsumptionSchema, {
    kind: "target-plan-refused",
    targets: targetPlan.targets,
    reason: targetPlan.refusal.reason,
    message: targetPlan.refusal.message,
  });
}

function summarizeVerifyCheckReport(summary: VerifyCheckSummary): VerifyReceipt["habitatCheck"] {
  return Value.Parse(VerifyHabitatCheckSummarySchema, {
    ...summary,
    consumption: summary.allowsAffectedExecution
      ? "allows-affected-execution"
      : "blocks-affected-execution",
    selectorState: selectorState(summary),
  });
}

function selectorState(
  summary: VerifyCheckSummary
): VerifyReceipt["habitatCheck"]["selectorState"] {
  const selectors = summary.requestedSelectors;
  if (!selectors.owner && !selectors.rule && !selectors.tool) {
    return Value.Parse(VerifySelectorStateSchema, { kind: "none" });
  }
  return Value.Parse(VerifySelectorStateSchema, {
    kind: "requested",
    selectors,
  });
}

function receiptOutcome(input: {
  check: VerifyCheckSummary;
  targetPlan: VerifyTargetPlan;
  nxAffected: VerifyReceipt["nxAffected"];
  postState: VerifyReceipt["postState"];
}): VerifyReceipt["outcome"] {
  if (
    !input.check.allowsAffectedExecution ||
    input.targetPlan.kind === "verify-target-plan-refused"
  )
    return "blocked";
  if (input.nxAffected.kind === "failed" || input.postState.kind === "unavailable") return "failed";
  return "succeeded";
}
