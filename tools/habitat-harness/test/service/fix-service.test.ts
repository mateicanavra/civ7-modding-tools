import { Effect } from "effect";
import { describe, expect, test } from "vitest";
import {
  type HabitatProcessRequest,
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
} from "../../src/lib/habitat-process.js";
import type { ApplyAdmission, ApplyTransactionInput } from "../../src/rules/patterns/index.js";
import { createHabitatServiceClient } from "../../src/service/client.js";
import { runFixService } from "../../src/service/modules/fix/run.js";

describe("Habitat fix service", () => {
  test("runs dry-run intent through admitted pattern transactions", async () => {
    const requests: HabitatProcessRequest[] = [];
    const processLayer = makeFakeHabitatProcessLayer((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request, {
        stdout: {
          text: "dry run ok\n",
          truncated: false,
          sha256: "",
          bytes: 11,
        },
      });
    });

    const result = await Effect.runPromise(
      runFixService(
        { kind: "dry-run-intent" },
        {
          admissions: [applyAdmission()],
          transactionInputs: [transactionInput()],
          worktree: cleanWorktree(),
          processLayer,
        }
      )
    );

    expect(result).toEqual({ exitCode: 0, stdout: "dry run ok\n", stderr: "" });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      commandId: "habitat-fix-deep-import-dry-run",
      executable: "grit",
      kind: "pattern-apply",
    });
  });

  test("runs live-write intent into protected-zone refusal", async () => {
    const result = await Effect.runPromise(
      runFixService(
        { kind: "live-write-intent" },
        {
          admissions: [applyAdmission()],
          transactionInputs: [transactionInput()],
          worktree: cleanWorktree(),
        }
      )
    );

    expect(result).toMatchObject({
      exitCode: 1,
      stdout: "",
      stderr: expect.stringContaining("missing-protected-zone-decision"),
    });
  });

  test("refuses before planning when no apply admissions are present", async () => {
    const result = await Effect.runPromise(
      runFixService({ kind: "dry-run-intent" }, { admissions: [] })
    );

    expect(result).toMatchObject({
      exitCode: 1,
      stdout: "",
      stderr: expect.stringContaining("missing-apply-admission"),
    });
  });

  test("runs through the in-process Habitat service client", async () => {
    const requests: HabitatProcessRequest[] = [];
    const processLayer = makeFakeHabitatProcessLayer((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request, {
        stdout: {
          text: "client dry run ok\n",
          truncated: false,
          sha256: "",
          bytes: 18,
        },
      });
    });

    const result = await createHabitatServiceClient({
      fix: {
        admissions: [applyAdmission()],
        transactionInputs: [transactionInput()],
        worktree: cleanWorktree(),
        processLayer,
      },
    }).fix.run({ kind: "dry-run-intent" });

    expect(result).toEqual({
      exitCode: 0,
      stdout: "client dry run ok\n",
      stderr: "",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      commandId: "habitat-fix-deep-import-dry-run",
      executable: "grit",
      kind: "pattern-apply",
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
