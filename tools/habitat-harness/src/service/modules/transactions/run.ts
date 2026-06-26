import { Effect } from "effect";
import { Value } from "typebox/value";
import { defaultGritCommandTimeoutMs } from "../../../adapters/grit/constants.js";
import { gritMachineOutputEnv } from "../../../lib/grit-env.js";
import {
  type HabitatCommandResult,
  HabitatProcess,
  HabitatProcessLive,
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "../../../lib/habitat-process.js";
import { repoRoot } from "../../../lib/paths.js";
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
} from "../../../lib/pattern-apply/schema.js";
import { runHabitatEffect } from "../../../runtime/index.js";
import type { TransactionsServiceOptions } from "./context.js";

/**
 * Runs an admitted Habitat transformation transaction from the owned service
 * module. This is the service boundary for pattern application; vendor command
 * execution is still provided by HabitatProcess until the Grit provider cutover.
 */
export function runTransactionApplyService(
  input: unknown,
  options: TransactionsServiceOptions = {}
) {
  return Effect.promise(() => runTransactionApply(input, options));
}

async function runTransactionApply(
  input: unknown,
  options: TransactionsServiceOptions
): Promise<PatternApplyRecord> {
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
  if (request.kind === "live-write-intent" && pathDecision && pathDecision.decision !== "allowed") {
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
    const commandResults = await runDryRunCommands(transactionInput.dryRunCommands, options);
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

async function runDryRunCommands(
  commands: readonly GritDryRunCommandInput[],
  options: TransactionsServiceOptions
): Promise<HabitatCommandResult[]> {
  const processLayer = options.processLayer ?? HabitatProcessLive;
  const program = Effect.forEach(commands, (command) => runDryRunCommand(command), {
    concurrency: 1,
  }).pipe(Effect.provide(processLayer));

  return runHabitatEffect(program);
}

function runDryRunCommand(input: GritDryRunCommandInput) {
  const request = gritDryRunRequest(input);
  return Effect.gen(function* () {
    const process = yield* HabitatProcess;
    return yield* process.run(request);
  }).pipe(
    Effect.catchTag("GritToolUnavailable", (error) =>
      Effect.succeed(
        makeHabitatCommandResult(request, {
          requestedExecutable: error.executable,
          exit: { code: 1, signal: null, interrupted: false },
          stderr: { text: error.cause, truncated: false, sha256: "", bytes: error.cause.length },
          failureTag: "GritToolUnavailable",
        })
      )
    )
  );
}

function gritDryRunRequest(input: GritDryRunCommandInput): HabitatProcessRequest {
  return {
    commandId: input.commandId,
    kind: "pattern-apply",
    executable: "grit",
    argv: [
      "apply",
      input.patternPath,
      ...input.roots,
      "--force",
      "--output",
      input.output,
      "--dry-run",
    ],
    cwd: repoRoot,
    timeoutMs: defaultGritCommandTimeoutMs,
    env: gritMachineOutputEnv,
    scanRoots: input.roots,
    cachePolicy: { mode: "disabled", observableStatus: "unknown" },
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
