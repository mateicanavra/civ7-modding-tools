import { createHabitatServiceClient } from "@internal/habitat-harness/service/client";
import type { FixServiceModuleContext } from "@internal/habitat-harness/service/modules/fix/context";
import type {
  ApplyAdmission,
  ApplyTransactionInput,
} from "@internal/habitat-harness/service/modules/fix/patterns/index";
import { fixRouter } from "@internal/habitat-harness/service/modules/fix/router";
import {
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/service/runtime/command/index";
import { makeFakeGritProviderLayer } from "@internal/habitat-harness/service/runtime/grit/index";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";

describe("Habitat fix service", () => {
  test("runs dry-run intent through admitted pattern transactions", async () => {
    const requests: HabitatProcessRequest[] = [];
    const layer = makeFakeGritProviderLayer((request) => {
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
      runFixProcedure({
        admissions: [applyAdmission()],
        transactionInputs: [transactionInput()],
        worktree: cleanWorktree(),
      }).pipe(Effect.provide(layer))
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
      runFixProcedure(
        {
          admissions: [applyAdmission()],
          transactionInputs: [transactionInput()],
          worktree: cleanWorktree(),
        },
        { kind: "live-write-intent" }
      )
    );

    expect(result).toMatchObject({
      exitCode: 1,
      stdout: "",
      stderr: expect.stringContaining("missing-protected-zone-decision"),
    });
  });

  test("refuses before planning when no apply admissions are present", async () => {
    const result = await Effect.runPromise(runFixProcedure({ admissions: [] }));

    expect(result).toMatchObject({
      exitCode: 1,
      stdout: "",
      stderr: expect.stringContaining("missing-apply-admission"),
    });
  });

  test("routes through the in-process Habitat service client", async () => {
    const result = await createHabitatServiceClient({
      fix: {
        admissions: [],
      },
    }).fix.run({ kind: "dry-run-intent" });

    expect(result).toMatchObject({
      exitCode: 1,
      stdout: "",
      stderr: expect.stringContaining("missing-apply-admission"),
    });
  });
});

function runFixProcedure(
  context: FixServiceModuleContext,
  input = { kind: "dry-run-intent" as const }
) {
  return Effect.gen(function* () {
    const runFix = fixRouter.run.callable({ context: { fix: context } });
    return yield* withFiberContext(() => runFix(input));
  });
}

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
