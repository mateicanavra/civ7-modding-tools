import type {
  GritProviderRequirements,
  GritProviderService,
} from "@internal/habitat-harness/providers/grit/index";
import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import { service } from "@internal/habitat-harness/service/impl";
import { Effect } from "effect";
import type { FixServiceRunInput } from "./contract.js";
import type {
  ApplyAdmission,
  PatternApplyRecord,
  PatternApplyRequest,
  WorktreeObservation,
} from "./model/dto/index.js";
import {
  activeApplyTransactionInputs,
  defaultApplyAdmissions,
  renderPatternApply,
  runPatternApplyTransaction,
} from "./model/policy/index.js";
import { observeWorktree } from "./model/repositories/index.js";

export interface FixModuleContext {
  readonly activeApplyTransactionInputs: typeof activeApplyTransactionInputs;
  readonly defaultApplyAdmissions: typeof defaultApplyAdmissions;
  readonly missingAdmissionRefusal: typeof missingAdmissionRefusal;
  readonly renderPatternApply: typeof renderPatternApply;
  readonly runPatternApplyTransactions: ReturnType<typeof makeRunPatternApplyTransactions>;
}

export const module = service.fix.use(({ context, next }) => {
  const runPatternApplyTransactions = makeRunPatternApplyTransactions(context.deps.grit);
  return next({
    context: {
      activeApplyTransactionInputs,
      defaultApplyAdmissions,
      missingAdmissionRefusal,
      renderPatternApply,
      runPatternApplyTransactions,
    } satisfies FixModuleContext,
  });
});

function makeRunPatternApplyTransactions(grit: GritProviderService) {
  return (
    input: FixServiceRunInput,
    admissions: readonly ApplyAdmission[],
    transactionInputs: ReturnType<typeof activeApplyTransactionInputs>
  ): Effect.Effect<PatternApplyRecord[], never, GritProviderRequirements> =>
    Effect.forEach(
      admissions,
      (admission) =>
        runPatternApplyTransaction(transactionRequest(input, admission), {
          grit,
          transactionInputs,
        }),
      { concurrency: 1 }
    );
}

function transactionRequest(
  intent: FixServiceRunInput,
  admission: ApplyAdmission,
  worktree: WorktreeObservation = observeWorktree()
): PatternApplyRequest {
  return {
    kind: intent.kind,
    worktree,
    admission,
  };
}

function missingAdmissionRefusal(): SpawnResult {
  return {
    exitCode: 1,
    stdout: "",
    stderr: [
      "habitat fix refused: missing-apply-admission",
      "habitat fix requires an apply admission before it can plan or write changes.",
      "recovery: Admit an apply-capable pattern through pattern manifest before invoking fix.",
      "",
    ].join("\n"),
  };
}
