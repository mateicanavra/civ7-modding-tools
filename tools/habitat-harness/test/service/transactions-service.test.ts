import type {
  ApplyAdmission,
  ApplyTransactionInput,
} from "@internal/habitat-harness/core/domains/pattern-governance/index";
import { renderPatternApply } from "@internal/habitat-harness/core/domains/transformation-transaction/index";
import { createHabitatServiceClient } from "@internal/habitat-harness/service/client";
import { transactionsRouter } from "@internal/habitat-harness/service/modules/transactions/router";
import {
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/substrate/providers/command/index";
import { makeFakeGritProviderLayer } from "@internal/habitat-harness/substrate/providers/grit/index";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";

describe("Habitat transactions service", () => {
  test("runs admitted dry-run transactions through the service Effect boundary", async () => {
    const requests: HabitatProcessRequest[] = [];
    const layer = makeFakeGritProviderLayer((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request, {
        stdout: {
          text: "transaction dry run ok\n",
          truncated: false,
          sha256: "",
          bytes: 23,
        },
      });
    });

    const record = await Effect.runPromise(
      Effect.gen(function* () {
        const applyTransaction = transactionsRouter.apply.callable({
          context: { transactions: { transactionInputs: [transactionInput()] } },
        });
        return yield* withFiberContext(() =>
          applyTransaction({
            kind: "dry-run-intent",
            worktree: cleanWorktree(),
            admission: applyAdmission(),
          })
        );
      }).pipe(Effect.provide(layer))
    );

    expect(record.outcome).toMatchObject({
      kind: "dry-run-completed",
      admission: { patternId: "deep-import-to-public-surface" },
    });
    expect(renderPatternApply(record)).toEqual({
      exitCode: 0,
      stdout: "transaction dry run ok\n",
      stderr: "",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      commandId: "habitat-fix-deep-import-dry-run",
      executable: "grit",
      kind: "pattern-apply",
    });
  });

  test("refuses unresolved transaction input through the in-process service client", async () => {
    const record = await createHabitatServiceClient({
      transactions: {
        transactionInputs: [],
      },
    }).transactions.apply({
      kind: "dry-run-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
    });

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "missing-transaction-input" },
    });
  });
});

function applyAdmission(overrides: Partial<ApplyAdmission> = {}): ApplyAdmission {
  return {
    kind: "apply-admission",
    patternId: "deep-import-to-public-surface",
    manifestPath: ".habitat/patterns/apply/deep_import_to_public_surface.md",
    transactionInputRef: "patterns:deep-import-to-public-surface:transaction-input",
    transactionInputRuleIds: ["domain-deep-import"],
    dryRunRoots: ["tools/habitat-harness/test/fixtures"],
    dryRunOutput: "compact",
    ...overrides,
  };
}

function transactionInput(overrides: Partial<ApplyTransactionInput> = {}): ApplyTransactionInput {
  return {
    kind: "apply-transaction-input",
    patternId: "deep-import-to-public-surface",
    manifestPath: ".habitat/patterns/apply/deep_import_to_public_surface.md",
    transactionInputRef: "patterns:deep-import-to-public-surface:transaction-input",
    dryRunCommands: [
      {
        kind: "dry-run-command",
        commandId: "habitat-fix-deep-import-dry-run",
        patternPath: ".habitat/patterns/apply/deep_import_to_public_surface.md",
        roots: ["tools/habitat-harness/test/fixtures"],
        output: "compact",
      },
    ],
    ...overrides,
  };
}

function cleanWorktree() {
  return {
    kind: "worktree-observation",
    dirty: false,
    dirtyPathCount: 0,
    statusDigest: "e3b0c44298fc1c149afbf4c8996fb924",
  } as const;
}
