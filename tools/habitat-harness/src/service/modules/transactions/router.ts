import {
  type GritDryRunCommandInput,
  type PatternApplyRecord,
  PatternApplyRecordSchema,
  type PatternApplyRefusalReason,
  type PatternApplyRequest,
  parsePatternApplyRequest,
  type RecoveryInstruction,
  resolveTransactionInput,
  type TransactionRefusal,
} from "@internal/habitat-harness/core/domains/transformation-transaction/schema";
import {
  captureOutput,
  type HabitatCommandResult,
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/substrate/providers/command/index";
import { GritProvider } from "@internal/habitat-harness/substrate/providers/grit/index";
import { Effect } from "effect";
import { Value } from "typebox/value";
import { implementer, type TransactionsServiceModuleContext } from "./context.js";

export const transactionsRouter = {
  apply: implementer.apply.effect(({ context, input }) =>
    runTransactionApplyService(input, context)
  ),
};

export const router = transactionsRouter;

function runTransactionApplyService(
  input: unknown,
  options: TransactionsServiceModuleContext = {}
) {
  return Effect.gen(function* () {
    const request = parsePatternApplyRequest(input);

    if (request.kind === "live-write-intent" && request.worktree.dirty) {
      return refusalRecord(request, {
        reason: "dirty-worktree",
        message: "live fix requires a clean worktree before planning write-capable changes.",
        recovery: [
          {
            kind: "inspect-worktree",
            message:
              "Run git status --short --branch and clean or stash local changes before live fix.",
          },
        ],
      });
    }

    if (request.kind === "live-write-intent" && !request.pathDecision) {
      return refusalRecord(request, {
        reason: "missing-protected-zone-decision",
        message: "live fix requires a protected-zone decision for the admitted write set.",
        recovery: [
          {
            kind: "provide-protected-zone-decision",
            message:
              "Route the admitted transaction through protected-zone authority before writing.",
          },
        ],
      });
    }

    const pathDecision = request.kind === "live-write-intent" ? request.pathDecision : undefined;
    if (
      request.kind === "live-write-intent" &&
      pathDecision &&
      pathDecision.decision !== "allowed"
    ) {
      return refusalRecord(request, {
        reason: "protected-zone-refused",
        message: `live fix path authority ${pathDecision.decision} ${pathDecision.path}.`,
        recovery: [
          {
            kind: "provide-protected-zone-decision",
            message: "Provide an allowed protected-zone write decision before writing.",
          },
        ],
      });
    }

    if (
      request.kind === "live-write-intent" &&
      pathDecision?.decision === "allowed" &&
      !pathDecision.hostPolicyRef
    ) {
      return refusalRecord(request, {
        reason: "missing-host-policy-decision",
        message: "live fix requires a host-policy decision for the admitted write set.",
        recovery: [
          {
            kind: "provide-host-policy-decision",
            message: "Route the admitted transaction through host policy before writing.",
          },
        ],
      });
    }

    const transactionInput = resolveTransactionInput(
      request.admission,
      options.transactionInputs ?? []
    );
    if (transactionInput.kind === "unresolved-transaction-input") {
      return refusalRecord(request, {
        reason: "missing-transaction-input",
        message: "the admitted pattern does not yet resolve to executable transaction input.",
        recovery: [
          {
            kind: "provide-transaction-input",
            message: "Provide the transaction input referenced by the apply admission.",
          },
        ],
      });
    }

    if (transactionInput.kind === "mismatched-transaction-input") {
      return refusalRecord(request, {
        reason: "transaction-input-admission-mismatch",
        message: "the admitted pattern identity does not match the declared transaction contract.",
        recovery: [
          {
            kind: "provide-transaction-input",
            message:
              "Provide transaction input with matching pattern id, manifest path, and transaction input ref.",
          },
        ],
      });
    }

    if (transactionInput.kind === "invalid-transaction-input") {
      return refusalRecord(request, {
        reason: "invalid-transaction-input",
        message: transactionInput.message,
        recovery: [
          {
            kind: "provide-transaction-input",
            message:
              "Provide TypeBox-valid transaction input with repo-relative apply pattern and roots.",
          },
        ],
      });
    }

    if (
      request.kind === "live-write-intent" &&
      pathDecision?.decision === "allowed" &&
      !pathDecisionCoversTransactionInput(pathDecision.path, transactionInput)
    ) {
      return refusalRecord(request, {
        reason: "write-path-outside-approved-set",
        message: `Protected-zone write decision ${pathDecision.path} is outside the admitted transaction input roots.`,
        recovery: [
          {
            kind: "provide-protected-zone-decision",
            message:
              "Provide a protected-zone write decision for a path covered by the admitted transaction input.",
          },
        ],
      });
    }

    if (request.kind === "dry-run-intent") {
      const commandResults = yield* runDryRunCommands(transactionInput.dryRunCommands, options);
      const failed = commandResults.find(
        (result) => result.exit.code !== 0 || result.exit.interrupted
      );
      if (failed) {
        return refusalRecord(request, {
          reason: "transaction-input-command-failed",
          message: `dry-run command ${failed.commandId} failed before producing a write-free plan.`,
          recovery: [
            {
              kind: "inspect-dry-run-output",
              message: "Inspect the dry-run command stdout/stderr and repair the admitted input.",
            },
          ],
        });
      }

      return Value.Parse(PatternApplyRecordSchema, {
        schemaVersion: 1,
        request,
        outcome: {
          kind: "dry-run-completed",
          admission: request.admission,
          commandResults: commandResults.map((result) => ({
            commandId: result.commandId,
            exitCode: result.exit.code,
            interrupted: result.exit.interrupted,
            stdout: result.stdout.text,
            stderr: result.stderr.text,
          })),
        },
      });
    }

    return refusalRecord(request, {
      reason: "invalid-request-mode",
      message:
        "live fix has protected-zone write authorization but live write execution is not implemented.",
      recovery: [
        {
          kind: "inspect-dry-run-output",
          message: "Use dry-run mode until live write execution is implemented.",
        },
      ],
    });
  });
}

function pathDecisionCoversTransactionInput(
  authorityPath: string,
  input: { dryRunCommands: readonly GritDryRunCommandInput[] }
): boolean {
  return input.dryRunCommands.some((command) =>
    command.roots.some((root) => pathInRoot(authorityPath, root))
  );
}

function pathInRoot(candidate: string, root: string): boolean {
  const normalizedRoot = root.endsWith("/") ? root : `${root}/`;
  return candidate === root || candidate.startsWith(normalizedRoot);
}

function runDryRunCommands(
  commands: readonly GritDryRunCommandInput[],
  _options: TransactionsServiceModuleContext
) {
  return Effect.forEach(commands, (command) => runDryRunCommand(command), {
    concurrency: 1,
  });
}

function runDryRunCommand(input: GritDryRunCommandInput) {
  return Effect.gen(function* () {
    const grit = yield* GritProvider;
    const providerRequest = {
      commandId: input.commandId,
      patternPath: input.patternPath,
      scanRoots: input.roots,
      output: input.output,
      cacheMode: "disabled",
    } as const;
    const commandRequest = grit.applyDryRunRequest(providerRequest);
    return yield* grit.applyDryRun(providerRequest).pipe(
      Effect.catchTag("CommandUnavailable", (error) =>
        Effect.succeed(
          makeHabitatCommandResult(commandRequestFromProviderError(commandRequest, error), {
            requestedExecutable: error.executable,
            exit: { code: 1, signal: null, interrupted: false },
            stderr: captureOutput(`${error.cause}\n`),
            observation: { kind: "tool-unavailable", detail: error.cause },
          })
        )
      ),
      Effect.catchTag("CommandFailed", (error) =>
        Effect.succeed(
          makeHabitatCommandResult(commandRequestFromProviderError(commandRequest, error), {
            requestedExecutable: error.executable,
            exit: { code: error.exitCode, signal: null, interrupted: false },
            stderr: captureOutput(`${error.stderr}\n`),
          })
        )
      ),
      Effect.catchTag("CommandInterrupted", (error) =>
        Effect.succeed(
          makeHabitatCommandResult(commandRequestFromProviderError(commandRequest, error), {
            requestedExecutable: error.executable,
            exit: { code: 130, signal: error.signal, interrupted: true },
            stderr: captureOutput(`${error.cause}\n`),
          })
        )
      ),
      Effect.catchTag("FileWriteFailed", (error) =>
        Effect.succeed(
          makeHabitatCommandResult(commandRequest, {
            requestedExecutable: commandRequest.executable,
            exit: { code: 1, signal: null, interrupted: false },
            stderr: captureOutput(`cache resource unavailable at ${error.path}: ${error.cause}\n`),
            observation: { kind: "tool-unavailable", detail: error.cause },
          })
        )
      )
    );
  });
}

function commandRequestFromProviderError(
  request: HabitatProcessRequest,
  error: { executable: string; argv: readonly string[]; cwd: string }
): HabitatProcessRequest {
  return {
    ...request,
    executable: error.executable,
    argv: error.argv,
    cwd: error.cwd,
  };
}

function refusalRecord(
  request: PatternApplyRequest,
  refusal: TransactionRefusalInput
): PatternApplyRecord {
  const parsedRefusal: TransactionRefusal = {
    reason: refusal.reason,
    message: refusal.message,
    recovery: refusal.recovery,
  };
  return Value.Parse(PatternApplyRecordSchema, {
    schemaVersion: 1,
    request,
    outcome: {
      kind: "refused",
      refusal: parsedRefusal,
    },
  });
}

interface TransactionRefusalInput {
  reason: PatternApplyRefusalReason;
  message: string;
  recovery: RecoveryInstruction[];
}
