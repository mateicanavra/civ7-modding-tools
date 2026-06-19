import { Value } from "typebox/value";
import { Effect, Layer } from "effect";
import type { ApplyTransactionInputProjection } from "../../rules/pattern-governance/index.js";
import { gritMachineOutputEnv } from "../grit-env.js";
import {
  HabitatProcess,
  HabitatProcessLive,
  type HabitatCommandResult,
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "../habitat-process.js";
import { repoRoot } from "../paths.js";
import { runHabitatEffect } from "../effect-runtime.js";
import {
  type RecoveryInstruction,
  type TransactionRefusal,
  type TransformationRefusalReason,
  TransformationTransactionRecordSchema,
  type TransformationTransactionRecord,
  type TransformationTransactionRequest,
  type GritDryRunCommandInput,
  parseTransformationTransactionRequest,
  resolveTransactionInput,
} from "./schema.js";

export interface TransformationTransactionOptions {
  processLayer?: Layer.Layer<HabitatProcess>;
  transactionInputs?: readonly ApplyTransactionInputProjection[];
}

export async function runTransformationTransaction(
  input: unknown,
  options: TransformationTransactionOptions = {}
): Promise<TransformationTransactionRecord> {
  const request = parseTransformationTransactionRequest(input);

  if (request.kind === "live-write-intent" && request.worktree.dirty) {
    return refusalRecord(request, {
      reason: "dirty-worktree",
      message: "live fix requires a clean worktree before planning write-capable changes.",
      recovery: [
        {
          kind: "inspect-worktree",
          message: "Run git status --short --branch and clean or stash local changes before live fix.",
        },
      ],
      nonClaims: ["does-not-run-grit", "does-not-write-files"],
    });
  }

  if (request.kind === "live-write-intent" && !request.admission.protectedZoneRef) {
    return refusalRecord(request, {
      reason: "missing-protected-zone-decision",
      message: "live fix requires a protected-zone decision for the admitted write set.",
      recovery: [
        {
          kind: "provide-protected-zone-decision",
          message: "Route the admitted transaction through protected-zone authority before writing.",
        },
      ],
      nonClaims: ["does-not-run-grit", "does-not-write-files"],
    });
  }

  if (request.kind === "live-write-intent" && !request.admission.hostPolicyRef) {
    return refusalRecord(request, {
      reason: "missing-host-policy-decision",
      message: "live fix requires a host-policy decision for the admitted write set.",
      recovery: [
        {
          kind: "provide-host-policy-decision",
          message: "Route the admitted transaction through host policy before writing.",
        },
      ],
      nonClaims: ["does-not-run-grit", "does-not-write-files"],
    });
  }

  const transactionInput = resolveTransactionInput(request.admission, options.transactionInputs ?? []);
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
      nonClaims: ["does-not-run-grit", "does-not-write-files"],
    });
  }

  if (transactionInput.kind === "mismatched-transaction-input") {
    return refusalRecord(request, {
      reason: "transaction-input-admission-mismatch",
      message:
        "the admitted pattern identity does not match the declared transaction input projection.",
      recovery: [
        {
          kind: "provide-transaction-input",
          message:
            "Provide a D8 transaction input projection with matching pattern id, manifest path, and transaction input ref.",
        },
      ],
      nonClaims: ["does-not-run-grit", "does-not-write-files"],
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
            "Provide a TypeBox-valid D8 transaction input projection with repo-relative apply pattern and roots.",
        },
      ],
      nonClaims: ["does-not-run-grit", "does-not-write-files"],
    });
  }

  if (request.kind === "dry-run-intent") {
    const commandResults = await runDryRunCommands(transactionInput.dryRunCommands, options);
    const failed = commandResults.find((result) => result.exit.code !== 0 || result.exit.interrupted);
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
        nonClaims: ["does-not-write-files"],
      });
    }

    return Value.Parse(TransformationTransactionRecordSchema, {
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
        nonClaims: ["does-not-write-files", "does-not-authorize-live-write"],
      },
    });
  }

  return refusalRecord(request, {
    reason: "missing-protected-zone-decision",
    message: "live fix requires a protected-zone decision for the admitted write set.",
    recovery: [
      {
        kind: "provide-protected-zone-decision",
        message: "Route the admitted transaction through protected-zone authority before writing.",
      },
    ],
    nonClaims: ["does-not-run-grit", "does-not-write-files"],
  });
}

async function runDryRunCommands(
  commands: readonly GritDryRunCommandInput[],
  options: TransformationTransactionOptions
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
    kind: "grit-apply",
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
    env: gritMachineOutputEnv,
    scanRoots: input.roots,
    cachePolicy: { mode: "disabled", observableStatus: "unknown" },
    nonClaims: ["does-not-write-files"],
  };
}

function refusalRecord(
  request: TransformationTransactionRequest,
  refusal: TransactionRefusalInput
): TransformationTransactionRecord {
  const parsedRefusal: TransactionRefusal = {
    reason: refusal.reason,
    message: refusal.message,
    recovery: refusal.recovery,
    nonClaims: refusal.nonClaims,
  };
  return Value.Parse(TransformationTransactionRecordSchema, {
    schemaVersion: 1,
    request,
    outcome: {
      kind: "refused",
      refusal: parsedRefusal,
    },
  });
}

interface TransactionRefusalInput {
  reason: TransformationRefusalReason;
  message: string;
  recovery: RecoveryInstruction[];
  nonClaims: TransactionRefusal["nonClaims"];
}
