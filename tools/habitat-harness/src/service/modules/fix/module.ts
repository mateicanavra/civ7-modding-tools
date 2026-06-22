import { createHash } from "node:crypto";
import type {
  CommandProviderError,
  HabitatCommandResult,
  SpawnResult,
} from "@internal/habitat-harness/resources/command/index";
import { service } from "@internal/habitat-harness/service/impl";
import { Effect } from "effect";
import type {
  ApplyAdmission,
  PatternApplyRecord,
  PatternApplyRequest,
  WorktreeObservation,
} from "./model/dto/index.js";
import {
  admittedApplyTransactionInputs as admittedApplyTransactionInputsFromRules,
  defaultApplyAdmissions,
  type PatternApplyGritPort,
  renderPatternApply,
  runPatternApplyTransaction,
} from "./model/policy/index.js";

interface FixGitPort {
  readonly currentBranch: (options?: {
    readonly cwd?: string;
  }) => Effect.Effect<string | null, never, any>;
  readonly head: (options?: { readonly cwd?: string }) => Effect.Effect<string | null, never, any>;
  readonly statusShort: (options?: {
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
}

export interface FixModuleContext {
  readonly admittedApplyTransactionInputs: ReturnType<typeof makeAdmittedApplyTransactionInputs>;
  readonly defaultApplyAdmissions: typeof defaultApplyAdmissions;
  readonly missingAdmissionRefusal: typeof missingAdmissionRefusal;
  readonly renderPatternApply: typeof renderPatternApply;
  readonly runPatternApplyTransactions: ReturnType<typeof makeRunPatternApplyTransactions>;
}

export interface FixPatternApplyIntent {
  readonly kind: PatternApplyRequest["kind"];
}

export const module = service.fix.use(({ context, next }) => {
  const admittedApplyTransactionInputs = makeAdmittedApplyTransactionInputs(
    context.deps.rules.selector
  );
  const runPatternApplyTransactions = makeRunPatternApplyTransactions(
    context.deps.grit,
    context.deps.git,
    context.deps.platform.repoRoot
  );
  return next({
    context: {
      admittedApplyTransactionInputs,
      defaultApplyAdmissions,
      missingAdmissionRefusal,
      renderPatternApply,
      runPatternApplyTransactions,
    } satisfies FixModuleContext,
  });
});

function makeAdmittedApplyTransactionInputs(ruleFacts: readonly { id: string }[]) {
  return () => admittedApplyTransactionInputsFromRules(ruleFacts);
}

function makeRunPatternApplyTransactions(
  grit: PatternApplyGritPort,
  git: FixGitPort,
  repoRoot: string
) {
  return (
    input: FixPatternApplyIntent,
    admissions: readonly ApplyAdmission[],
    transactionInputs: ReturnType<typeof admittedApplyTransactionInputsFromRules>
  ): Effect.Effect<PatternApplyRecord[], never, any> =>
    Effect.gen(function* () {
      const worktree = yield* observeWorktreeEffect(git, repoRoot);
      return yield* Effect.forEach(
        admissions,
        (admission) =>
          runPatternApplyTransaction(transactionRequest(input, admission, worktree), {
            grit,
            transactionInputs,
          }),
        { concurrency: 1 }
      );
    });
}

function observeWorktreeEffect(
  git: FixGitPort,
  repoRoot: string
): Effect.Effect<WorktreeObservation, never, any> {
  return Effect.gen(function* () {
    const [branch, head, status] = yield* Effect.all(
      [
        git.currentBranch({ cwd: repoRoot }),
        git.head({ cwd: repoRoot }),
        git.statusShort({ cwd: repoRoot }).pipe(Effect.catchAll(() => Effect.succeed(undefined))),
      ],
      { concurrency: 3 }
    );
    const statusShort =
      status && status.exit.code === 0
        ? status.stdout.text
        : `${status?.stdout.text ?? ""}${status?.stderr.text ?? ""}`;
    return {
      kind: "worktree-observation",
      dirty: statusShort.trim().length > 0,
      dirtyPathCount: dirtyPathCount(statusShort),
      statusDigest: createHash("sha256").update(statusShort).digest("hex"),
      branch: branch ?? undefined,
      head: head ?? undefined,
    };
  });
}

function dirtyPathCount(statusShort: string): number {
  return statusShort
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function transactionRequest(
  intent: FixPatternApplyIntent,
  admission: ApplyAdmission,
  worktree: WorktreeObservation
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
