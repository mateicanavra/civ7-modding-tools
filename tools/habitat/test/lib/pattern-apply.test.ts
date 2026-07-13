import {
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "@habitat/cli/resources/command/index";
import { makeFakeGritCommandService } from "@habitat/cli/resources/rule-diagnostics/providers/grit/index";
import type { GritApplyDryRunService } from "@habitat/cli/resources/rule-diagnostics/providers/grit/provider";
import type {
  ApplyAdmission,
  ApplyTransactionInput,
  PatternApplyRequest,
} from "@habitat/cli/service/modules/fix/model/dto/index";
import { PatternApplyRequestSchema } from "@habitat/cli/service/modules/fix/model/dto/index";
import {
  renderPatternApply,
  runPatternApplyTransaction,
} from "@habitat/cli/service/modules/fix/model/policy/index";
import { fixRouter } from "@habitat/cli/service/modules/fix/router";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

const runtimeHelperApplyPatternPath =
  ".habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/apply.pattern.md";

describe("pattern apply", () => {
  test("requires apply admission before a transaction request is valid", () => {
    expect(
      Value.Check(PatternApplyRequestSchema, {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
      })
    ).toBe(false);
  });

  test("fix command boundary consumes service-owned apply admissions", async () => {
    const requests: HabitatProcessRequest[] = [];
    const grit = makeFakeGritCommandService((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request);
    });

    const planPatterns = fixRouter.planPatterns.callable({
      context: { deps: makeTestHabitatServiceDeps({ gritApplyDryRun: grit }) },
    });
    const result = await Effect.runPromise(withFiberContext(() => planPatterns({})));

    expect(result).toMatchObject({
      exitCode: 0,
      stderr: "",
    });
    expect(requests).toHaveLength(1);
  });

  test("rejects unsupported request properties through TypeBox", () => {
    expect(
      Value.Check(PatternApplyRequestSchema, {
        kind: "unsupported-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
        rollbackAfterApply: true,
      })
    ).toBe(false);
  });

  test("runs admitted dry-run commands through the Grit command service", async () => {
    const requests: HabitatProcessRequest[] = [];
    const grit = makeFakeGritCommandService((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request, {
        stdout: {
          text: "Processed 237 files and found 0 matches\n",
          truncated: false,
          sha256: "",
          bytes: 40,
        },
      });
    });

    const record = await applyTransaction(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
      } satisfies PatternApplyRequest,
      { transactionInputs: [transactionInput()] },
      grit
    );

    expect(record.outcome).toMatchObject({
      kind: "dry-run-completed",
      admission: { patternId: "prohibit_runtime_helper_redeclarations" },
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      commandId: "habitat-fix-runtime-helper-dry-run",
      executable: expect.stringMatching(/(^|\/)grit$/),
      argv: expect.arrayContaining(["apply", "--dry-run"]),
      kind: "pattern-apply",
    });
    expect(renderPatternApply(record)).toMatchObject({
      exitCode: 0,
      stdout: expect.stringContaining("Processed 237 files"),
      stderr: "",
    });
  });

  test("refuses failed dry-run commands without writing", async () => {
    const grit = makeFakeGritCommandService((request) =>
      makeHabitatCommandResult(request, {
        exit: { code: 2, signal: null, interrupted: false },
        stderr: { text: "grit failed\n", truncated: false, sha256: "", bytes: 12 },
      })
    );

    const record = await applyTransaction(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
      } satisfies PatternApplyRequest,
      { transactionInputs: [transactionInput()] },
      grit
    );

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: {
        reason: "transaction-input-command-failed",
      },
    });
  });

  test("missing transaction input stays a refusal after admission", async () => {
    const record = await applyTransaction({
      kind: "dry-run-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission({
        transactionInputRef: "patterns:unknown-apply-pattern:transaction-input",
      }),
    } satisfies PatternApplyRequest);

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "missing-transaction-input" },
    });
    expect(renderPatternApply(record)).toMatchObject({
      exitCode: 1,
      stdout: "",
      stderr: expect.stringContaining("missing-transaction-input"),
    });
  });

  test("invalid transaction input paths refuse before the Grit command service", async () => {
    const requests: HabitatProcessRequest[] = [];
    const grit = makeFakeGritCommandService((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request);
    });
    const unsafeInput = transactionInput({
      dryRunCommands: [
        {
          kind: "dry-run-command",
          commandId: "unsafe-absolute-root",
          patternPath: "/tmp/not-repo-local.md",
          roots: ["/tmp"],
          output: "compact",
        },
      ],
    } as Partial<ApplyTransactionInput>);

    const record = await applyTransaction(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
      } satisfies PatternApplyRequest,
      { transactionInputs: [unsafeInput] },
      grit
    );

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: {
        reason: "invalid-transaction-input",
      },
    });
    expect(requests).toHaveLength(0);
  });

  test("refuses transaction input whose identity does not match the admission", async () => {
    const record = await applyTransaction(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission({
          patternId: "other-apply-pattern",
        }),
      } satisfies PatternApplyRequest,
      {
        transactionInputs: [transactionInput()],
      }
    );

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "transaction-input-admission-mismatch" },
    });
    expect(renderPatternApply(record).stderr).toContain(
      "does not match the declared transaction contract"
    );
  });

  test("blocks live writes without protected-zone authority", async () => {
    const record = await applyTransaction({
      kind: "live-write-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
    } satisfies PatternApplyRequest);

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "missing-protected-zone-decision" },
    });
  });

  test("blocks live writes on dirty worktrees before zone or host decisions", async () => {
    const record = await applyTransaction({
      kind: "live-write-intent",
      worktree: dirtyWorktree(),
      admission: applyAdmission(),
    } satisfies PatternApplyRequest);

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "dirty-worktree" },
    });
  });

  test("blocks live writes without host-policy authority", async () => {
    const record = await applyTransaction({
      kind: "live-write-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
      pathDecision: refusedPathDecision(),
    } satisfies PatternApplyRequest);

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "protected-zone-refused" },
    });
  });

  test("consumes an allowed protected-zone write decision before live execution", async () => {
    const record = await applyTransaction(
      {
        kind: "live-write-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
        pathDecision: allowedPathDecision(),
      } satisfies PatternApplyRequest,
      {
        transactionInputs: [transactionInput()],
      }
    );

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "invalid-request-mode" },
    });
  });

  test("binds protected-zone write decisions to the admitted transaction roots", async () => {
    const record = await applyTransaction(
      {
        kind: "live-write-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
        pathDecision: allowedPathDecision({
          path: "packages/outside-admitted-root/example.ts",
        }),
      } satisfies PatternApplyRequest,
      {
        transactionInputs: [transactionInput()],
      }
    );

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "write-path-outside-approved-set" },
    });
  });
});

function applyTransaction(
  input: PatternApplyRequest,
  options?: { readonly transactionInputs?: readonly ApplyTransactionInput[] },
  grit: GritApplyDryRunService = makeTestHabitatServiceDeps().gritApplyDryRun
) {
  return Effect.runPromise(
    runPatternApplyTransaction(input, {
      ...options,
      grit,
    })
  );
}

function cleanWorktree() {
  return {
    kind: "worktree-observation",
    dirty: false,
    dirtyPathCount: 0,
    statusDigest: "e3b0c44298fc1c149afbf4c8996fb924",
  } as const;
}

function dirtyWorktree() {
  return {
    kind: "worktree-observation",
    dirty: true,
    dirtyPathCount: 1,
    statusDigest: "dirty-status-digest",
  } as const;
}

function applyAdmission(overrides: Partial<ApplyAdmission> = {}): ApplyAdmission {
  return {
    kind: "apply-admission",
    patternId: "prohibit_runtime_helper_redeclarations",
    manifestPath: runtimeHelperApplyPatternPath,
    transactionInputRef: "patterns:prohibit_runtime_helper_redeclarations:transaction-input",
    transactionInputRuleIds: ["prohibit_runtime_helper_redeclarations"],
    dryRunRoots: ["tools/habitat/test/fixtures"],
    dryRunOutput: "compact",
    ...overrides,
  };
}

function transactionInput(overrides: Partial<ApplyTransactionInput> = {}): ApplyTransactionInput {
  return {
    kind: "apply-transaction-input",
    patternId: "prohibit_runtime_helper_redeclarations",
    manifestPath: runtimeHelperApplyPatternPath,
    transactionInputRef: "patterns:prohibit_runtime_helper_redeclarations:transaction-input",
    dryRunCommands: [
      {
        kind: "dry-run-command",
        commandId: "habitat-fix-runtime-helper-dry-run",
        patternPath: runtimeHelperApplyPatternPath,
        roots: ["tools/habitat/test/fixtures"],
        output: "compact",
      },
    ],
    ...overrides,
  };
}

function allowedPathDecision(overrides: { path?: string } = {}) {
  return {
    kind: "transaction-path-decision",
    decision: "allowed",
    path: overrides.path ?? "tools/habitat/test/fixtures/example.ts",
    action: "modified",
    owner: {
      ownerId: "habitat-repo-policy",
      displayName: "Habitat repo policy",
      recoveryContact: "docs/process/CONTRIBUTING.md",
    },
    recovery: {
      ownerId: "habitat-repo-policy",
      actionKind: "documented-workflow",
      documentRef: "docs/process/CONTRIBUTING.md",
      retryCondition: "Retry after protected-zone write authorization is accepted.",
    },
    hostPolicyRef: "host-policy:apply-gate",
  } as const;
}

function refusedPathDecision() {
  return {
    kind: "transaction-path-decision",
    decision: "refused",
    path: "packages/civ7-types/generated/index.ts",
    action: "modified",
    owner: {
      ownerId: "civ7-resources-workflow",
      displayName: "Civ7 resources workflow",
      recoveryContact: "docs/process/resources-submodule.md",
    },
    recovery: {
      ownerId: "civ7-resources-workflow",
      actionKind: "documented-workflow",
      documentRef: "docs/process/resources-submodule.md",
      retryCondition: "Retry after the documented workflow has been completed.",
    },
  } as const;
}
