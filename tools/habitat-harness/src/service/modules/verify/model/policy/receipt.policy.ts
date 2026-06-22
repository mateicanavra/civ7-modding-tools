import { readWorkspaceGraph } from "@internal/habitat-harness/providers/nx/graph";
import { workspaceGraphTargetNames } from "@internal/habitat-harness/providers/nx/targets";
import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import {
  type CheckReport,
  type VerifyCheckSummary,
  verifyCheckSummary,
} from "@internal/habitat-harness/service/model/check/index";
import { verifyAffectedTargetNames } from "@internal/habitat-harness/service/model/graph/policy/validation-routing.policy";
import { activeRuleGraphFacts } from "@internal/habitat-harness/service/model/rules/policy/active-facts.policy";
import {
  type VerifyBaseResolution,
  VerifyHabitatCheckSummarySchema,
  type VerifyReceipt,
  VerifyReceiptSchema,
  VerifySelectorStateSchema,
  VerifyTargetPlanConsumptionSchema,
} from "@internal/habitat-harness/service/model/verify/index";
import {
  type VerifyTargetPlan,
  VerifyTargetPlanSchema,
  verifyTargetPlan,
} from "@internal/habitat-harness/service/model/workspace/index";
import { Value } from "typebox/value";
import { selectedVerifyEnv } from "./command-output.policy.js";
import {
  affectedVerificationArgv,
  completedNxAffected,
  skippedNxAffected,
} from "./nx-affected.policy.js";
import { postStateObservation } from "./post-state.policy.js";

/** Inputs needed to assemble a verify handoff receipt after command execution. */
export interface VerifyReceiptInput {
  /** Optional base ref explicitly requested by the caller. */
  requestedBase?: string;
  /** Effective Git base used for affected verification. */
  resolvedBase: string;
  /** Source of the effective base. */
  baseSource?: Extract<VerifyBaseResolution, { kind: "resolved" }>["source"];
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
  /** Explicit skip reason when the caller intentionally plans affected execution without running it. */
  affectedSkipReason?: Extract<VerifyReceipt["nxAffected"], { kind: "skipped" }>["skipReason"];
  /** Git status observation captured through the Git provider before receipt assembly. */
  gitStatus: SpawnResult;
}

/** Verify target names currently owned by the workspace graph boundary. */
export const verifyAffectedTargets = [...verifyAffectedTargetNames(workspaceGraphTargetNames())];

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
          habitatCheckSummary.allowsAffectedExecution
            ? { targetPlan, reason: input.affectedSkipReason }
            : {}
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
      argv: ["habitat", "verify"],
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
  if (input.nxAffected.kind === "skipped" && input.nxAffected.skipReason === "receipt-only")
    return "planned";
  if (input.nxAffected.kind === "failed" || input.postState.kind === "unavailable") return "failed";
  return "succeeded";
}
