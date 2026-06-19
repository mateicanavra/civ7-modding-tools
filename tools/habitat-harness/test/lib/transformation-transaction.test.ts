import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";
import { runFix } from "../../src/lib/fix.js";
import {
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
  type HabitatProcessRequest,
} from "../../src/lib/habitat-process.js";
import {
  TransformationTransactionRequestSchema,
  renderTransformationTransaction,
  runTransformationTransaction,
  type TransformationTransactionRequest,
} from "../../src/lib/transformation-transaction/index.js";
import type {
  ApplyAdmissionProjection,
  ApplyTransactionInputProjection,
} from "../../src/rules/pattern-governance/index.js";

describe("transformation transaction", () => {
  test("requires D8 apply admission before a transaction request is valid", () => {
    expect(
      Value.Check(TransformationTransactionRequestSchema, {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
      })
    ).toBe(false);
  });

  test("refuses fix at the command boundary before D8 apply admission", async () => {
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
      Value.Check(TransformationTransactionRequestSchema, {
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

    const record = await runTransformationTransaction(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
      } satisfies TransformationTransactionRequest,
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
      kind: "grit-apply",
    });
    expect(renderTransformationTransaction(record)).toMatchObject({
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

    const record = await runTransformationTransaction(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
      } satisfies TransformationTransactionRequest,
      { processLayer, transactionInputs: [transactionInput()] }
    );

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: {
        reason: "transaction-input-command-failed",
        nonClaims: ["does-not-write-files"],
      },
    });
  });

  test("missing transaction input stays a refusal after admission", async () => {
    const record = await runTransformationTransaction({
      kind: "dry-run-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission({
        transactionInputRef: "pattern-authority:unknown-apply-pattern:transaction-input",
      }),
    } satisfies TransformationTransactionRequest);

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "missing-transaction-input" },
    });
    expect(renderTransformationTransaction(record)).toMatchObject({
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
          kind: "grit-dry-run-command",
          commandId: "unsafe-absolute-root",
          patternPath: "/tmp/not-repo-local.md",
          roots: ["/tmp"],
          output: "compact",
        },
      ],
    } as Partial<ApplyTransactionInputProjection>);

    const record = await runTransformationTransaction(
      {
        kind: "dry-run-intent",
        worktree: cleanWorktree(),
        admission: applyAdmission(),
      } satisfies TransformationTransactionRequest,
      { processLayer, transactionInputs: [unsafeInput] }
    );

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: {
        reason: "invalid-transaction-input",
        nonClaims: ["does-not-run-grit", "does-not-write-files"],
      },
    });
    expect(requests).toHaveLength(0);
  });

  test("refuses transaction input whose identity does not match the admission", async () => {
    const record = await runTransformationTransaction({
      kind: "dry-run-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission({
        patternId: "other-apply-pattern",
      }),
    } satisfies TransformationTransactionRequest, {
      transactionInputs: [transactionInput()],
    });

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "transaction-input-admission-mismatch" },
    });
    expect(renderTransformationTransaction(record).stderr).toContain(
      "does not match the declared transaction input projection"
    );
  });

  test("blocks live writes without protected-zone authority", async () => {
    const record = await runTransformationTransaction({
      kind: "live-write-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
    } satisfies TransformationTransactionRequest);

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "missing-protected-zone-decision" },
    });
  });

  test("blocks live writes on dirty worktrees before zone or host decisions", async () => {
    const record = await runTransformationTransaction({
      kind: "live-write-intent",
      worktree: dirtyWorktree(),
      admission: applyAdmission(),
    } satisfies TransformationTransactionRequest);

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "dirty-worktree" },
    });
  });

  test("blocks live writes without host-policy authority", async () => {
    const record = await runTransformationTransaction({
      kind: "live-write-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
      pathAuthority: refusedPathAuthority(),
    } satisfies TransformationTransactionRequest);

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "protected-zone-refused" },
    });
  });

  test("consumes an allowed D10 transaction path authority projection before live execution", async () => {
    const record = await runTransformationTransaction({
      kind: "live-write-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
      pathAuthority: allowedPathAuthority(),
    } satisfies TransformationTransactionRequest, {
      transactionInputs: [transactionInput()],
    });

    expect(record.outcome).toMatchObject({
      kind: "refused",
      refusal: { reason: "invalid-request-mode" },
    });
  });

  test("binds D10 path authority to the admitted transaction roots", async () => {
    const record = await runTransformationTransaction({
      kind: "live-write-intent",
      worktree: cleanWorktree(),
      admission: applyAdmission(),
      pathAuthority: allowedPathAuthority({
        path: "packages/outside-admitted-root/example.ts",
      }),
    } satisfies TransformationTransactionRequest, {
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
  overrides: Partial<ApplyAdmissionProjection> = {}
): ApplyAdmissionProjection {
  return {
    kind: "apply-admission",
    patternId: "deep-import-to-public-surface",
    manifestPath: ".grit/patterns/habitat/apply/deep_import_to_public_surface.md",
    transactionInputRef: "pattern-authority:deep-import-to-public-surface:transaction-input",
    transactionInputRuleIds: ["grit-domain-deep-import"],
    dryRunOutput: "compact",
    nonClaims: ["does-not-authorize-host-policy"],
    ...overrides,
  };
}

function transactionInput(
  overrides: Partial<ApplyTransactionInputProjection> = {}
): ApplyTransactionInputProjection {
  return {
    kind: "apply-transaction-input",
    patternId: "deep-import-to-public-surface",
    manifestPath: ".grit/patterns/habitat/apply/deep_import_to_public_surface.md",
    transactionInputRef: "pattern-authority:deep-import-to-public-surface:transaction-input",
    dryRunCommands: [
      {
        kind: "grit-dry-run-command",
        commandId: "habitat-fix-deep-import-dry-run",
        patternPath: ".grit/patterns/habitat/apply/deep_import_to_public_surface.md",
        roots: ["tools/habitat-harness/test/fixtures"],
        output: "compact",
      },
    ],
    nonClaims: ["does-not-write-files", "does-not-authorize-live-write"],
    ...overrides,
  };
}

function allowedPathAuthority(overrides: { path?: string } = {}) {
  return {
    kind: "transaction-path-authority",
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
      retryCondition: "Retry after D10 path authority is accepted.",
      nonClaims: ["does-not-prove-apply-transaction-safety"],
    },
    hostPolicyRef: "G-HOST:apply-gate",
    nonClaims: ["does-not-prove-apply-transaction-safety"],
  } as const;
}

function refusedPathAuthority() {
  return {
    kind: "transaction-path-authority",
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
      nonClaims: ["does-not-prove-resource-submodule-freshness"],
    },
    nonClaims: ["does-not-prove-resource-submodule-freshness"],
  } as const;
}
