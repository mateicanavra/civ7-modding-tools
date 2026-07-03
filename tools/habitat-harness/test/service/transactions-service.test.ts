import { describe, expect, test } from "vitest";
import { makeFakeGritProviderLayer } from "../../src/adapters/grit/provider/index.js";
import type {
  ApplyAdmission,
  ApplyTransactionInput,
} from "../../src/domains/pattern-governance/index.js";
import { renderPatternApply } from "../../src/domains/transformation-transaction/index.js";
import {
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "../../src/providers/command/index.js";
import { createHabitatServiceClient } from "../../src/service/client.js";

describe("Habitat transactions service", () => {
  test("runs admitted dry-run transactions through the in-process service client", async () => {
    const requests: HabitatProcessRequest[] = [];
    const providerLayer = makeFakeGritProviderLayer((request) => {
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

    const record = await createHabitatServiceClient({
      transactions: {
        providerLayer,
        transactionInputs: [transactionInput()],
      },
    }).transactions.apply({
      kind: "dry-run-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
    });

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

  test("refuses unresolved transaction input before vendor execution", async () => {
    const requests: HabitatProcessRequest[] = [];
    const providerLayer = makeFakeGritProviderLayer((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request);
    });

    const record = await createHabitatServiceClient({
      transactions: {
        providerLayer,
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
    expect(requests).toHaveLength(0);
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
