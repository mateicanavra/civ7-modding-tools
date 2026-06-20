import { Effect } from "effect";
import { Type } from "typebox";
import { Value } from "typebox/value";
import {
  type ApplyAdmission,
  ApplyAdmissionSchema,
  activeApplyTransactionInputs,
  defaultApplyAdmissions,
} from "../../../domains/pattern-governance/index.js";
import {
  observeWorktree,
  type PatternApplyRequest,
  renderPatternApply,
  type WorktreeObservation,
} from "../../../lib/pattern-apply/index.js";
import type { SpawnResult } from "../../../providers/command/index.js";
import { runTransactionApplyService } from "../transactions/router.js";
import type { FixServiceOptions } from "./context.js";
import type { FixServiceRunInput } from "./contract.js";
import { FixCommandIntentSchema } from "./contract.js";
import { module as fixModule } from "./module.js";

const FixAdmissionSetSchema = Type.Array(ApplyAdmissionSchema);

export const fixRouter = {
  run: fixModule.run.effect(({ context, input }) => runFixService(input, context.fix)),
};

export const router = fixRouter;

export function runFixService(input: FixServiceRunInput, options: FixServiceOptions = {}) {
  return Effect.gen(function* () {
    const parsed = Value.Parse(FixCommandIntentSchema, input);
    const admissions = Value.Parse(
      FixAdmissionSetSchema,
      options.admissions ?? defaultApplyAdmissions()
    );

    if (admissions.length === 0) {
      return missingAdmissionRefusal();
    }

    const transactionInputs = options.transactionInputs ?? activeApplyTransactionInputs();
    const records = yield* Effect.forEach(
      admissions,
      (admission) =>
        runTransactionApplyService(transactionRequest(parsed, admission, options.worktree), {
          providerLayer: options.providerLayer,
          transactionInputs,
        }),
      { concurrency: 1 }
    );
    const rendered = records.map(renderPatternApply);
    const failed = rendered.find((result) => result.exitCode !== 0);
    if (failed) return failed;

    return {
      exitCode: 0,
      stdout: rendered.map((result) => result.stdout).join(""),
      stderr: rendered.map((result) => result.stderr).join(""),
    };
  });
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
