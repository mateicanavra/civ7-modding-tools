import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";
import { runFix } from "../../src/lib/fix.js";
import {
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
  type HabitatProcessRequest,
} from "../../src/lib/habitat-process.js";
import {
  PatternApplyRequestSchema,
  renderPatternApply,
  runPatternApply,
  type PatternApplyRequest,
} from "../../src/lib/pattern-apply/index.js";
import type {
  ApplyAdmission,
  ApplyTransactionInput,
} from "../../src/rules/patterns/index.js";

describe("pattern apply", () => {
  test("requires apply admission before a transaction request is valid", () => {
    expect(
      Value.Check(PatternApplyRequestSchema, {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
      })
    ).toBe(false);
  });

  test("refuses fix at the command boundary before apply admission", async () => {
    const result = await runFix(
      { kind: "dry-run-intent" },
      {
        admissions: [],
      }
    );

    expect(result).toMatchObject({
      exitCode: 1,
      stdout: "",
      stderr: expect.stringContaining("missing-apply-admission"),
    });
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

  test("runs admitted dry-run commands through HabitatProcess", async () => {
    const requests: HabitatProcessRequest[] = [];
    const processLayer = makeFakeHabitatProcessLayer((request) => {
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

    const record = await runPatternApply(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
      } satisfies PatternApplyRequest,
      { processLayer, transactionInputs: [transactionInput()] }
    );

    expect(record.outcome).toMatchObject({
      kind: "dry-run-completed",
      admission: { patternId: "deep-import-to-public-surface" },
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      commandId: "habitat-fix-deep-import-dry-run",
      executable: "grit",
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
    const processLayer = makeFakeHabitatProcessLayer((request) =>
      makeHabitatCommandResult(request, {
        exit: { code: 2, signal: null, interrupted: false },
        stderr: { text: "grit failed\n", truncated: false, sha256: "", bytes: 12 },
      })
    );

    const record = await runPatternApply(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
      } satisfies PatternApplyRequest,
      { processLayer, transactionInputs: [transactionInput()] }
    );

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: {
        reason: "transaction-input-command-failed",
      },
    });
  });

  test("missing transaction input stays a refusal after admission", async () => {
    const record = await runPatternApply({
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

  test("invalid transaction input paths refuse before HabitatProcess", async () => {
    const requests: HabitatProcessRequest[] = [];
    const processLayer = makeFakeHabitatProcessLayer((request) => {
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

    const record = await runPatternApply(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
      } satisfies PatternApplyRequest,
      { processLayer, transactionInputs: [unsafeInput] }
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
    const record = await runPatternApply({
      kind: "dry-run-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission({
        patternId: "other-apply-pattern",
      }),
    } satisfies PatternApplyRequest, {
      transactionInputs: [transactionInput()],
    });

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "transaction-input-admission-mismatch" },
    });
    expect(renderPatternApply(record).stderr).toContain(
      "does not match the declared transaction contract"
    );
  });

  test("blocks live writes without protected-zone authority", async () => {
    const record = await runPatternApply({
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
    const record = await runPatternApply({
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
    const record = await runPatternApply({
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
    const record = await runPatternApply({
      kind: "live-write-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
      pathDecision: allowedPathDecision(),
    } satisfies PatternApplyRequest, {
      transactionInputs: [transactionInput()],
    });

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "invalid-request-mode" },
    });
  });

  test("binds protected-zone write decisions to the admitted transaction roots", async () => {
    const record = await runPatternApply({
      kind: "live-write-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
      pathDecision: allowedPathDecision({
        path: "packages/outside-admitted-root/example.ts",
      }),
    } satisfies PatternApplyRequest, {
      transactionInputs: [transactionInput()],
    });

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "write-path-outside-approved-set" },
    });
  });
});

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

function applyAdmission(
  overrides: Partial<ApplyAdmission> = {}
): ApplyAdmission {
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

function transactionInput(
  overrides: Partial<ApplyTransactionInput> = {}
): ApplyTransactionInput {
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

function allowedPathDecision(overrides: { path?: string } = {}) {
  return {
    kind: "transaction-path-decision",
    decision: "allowed",
    path: overrides.path ?? "tools/habitat-harness/test/fixtures/example.ts",
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
