import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import type { HabitatGitState } from "../../src/lib/git-state.js";
import {
  classifyApplyDiffEvidence,
  classifyApplyRewriteInventory,
  type GritApplyDiffEvidenceInput,
  type GritApplyRewriteInventoryEntry,
  parseApplyRewriteInventory,
  runGritApplyTransaction,
} from "../../src/lib/grit-apply.js";
import {
  type HabitatProcessRequest,
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
  type OutputCapture,
} from "../../src/lib/habitat-process.js";
import { repoRoot } from "../../src/lib/paths.js";

const approvedFile = "mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts";
const existingApprovedFile =
  "mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/steps/plan-floodplains/index.ts";
const isolatedCopyProbeFile =
  "mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-validation/matching.ts";
const isolatedTypeProbeFile =
  "mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-validation/type-only.ts";
const isolatedMissingExportProbeFile =
  "mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-validation/missing-export.ts";

beforeEach(() => {
  cleanupIsolatedCopyProbe();
});

afterEach(() => {
  cleanupIsolatedCopyProbe();
});

describe("Grit apply transaction", () => {
  test("refuses live apply against a dirty worktree before executing Grit", async () => {
    let called = false;
    const result = await runGritApplyTransaction({
      dryRun: false,
      gitStateReader: () => gitState(" M tools/habitat-harness/src/lib/grit-apply.ts\n"),
      processLayer: makeFakeHabitatProcessLayer((request) => {
        called = true;
        return makeHabitatCommandResult(request);
      }),
    });

    expect(result.ok).toBe(false);
    expect(result.failureTag).toBe("GritApplyDirtyWorktree");
    expect(called).toBe(false);
  });

  test("allows dirty dry-runs because they do not write", async () => {
    const result = await runGritApplyTransaction({
      dryRun: true,
      gitStateReader: () => gitState(" M package.json\n"),
      processLayer: makeFakeHabitatProcessLayer((request) =>
        makeHabitatCommandResult(request, {
          stdout: output("Processed 1 files and found 0 matches\n"),
        })
      ),
    });

    expect(result.ok).toBe(true);
    expect(result.record.beforeGitState.dirty).toBe(true);
    expect(result.record.inventory).toEqual([]);
  });

  test("runs Grit apply requests with machine-output color disabled", async () => {
    const observedRequests: HabitatProcessRequest[] = [];
    const result = await runGritApplyTransaction({
      dryRun: true,
      gitStateReader: () => gitState(""),
      processLayer: makeFakeHabitatProcessLayer((request) => {
        observedRequests.push(request);
        if (
          request.patternPaths?.includes(
            ".grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md"
          )
        ) {
          return makeHabitatCommandResult(request, {
            stdout: output("docs/FALSE-POSITIVE.md\n\nProcessed 1 files and found 1 matches\n"),
          });
        }
        return makeHabitatCommandResult(request, {
          stdout: output("Processed 1 files and found 0 matches\n"),
        });
      }),
    });

    expect(result.ok).toBe(true);
    expect(observedRequests[0]?.env).toMatchObject({
      CLICOLOR: "0",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
    });
    expect(observedRequests[0]?.argv).toEqual([
      "apply",
      ".grit/patterns/habitat/apply/deep_import_to_public_surface.md",
      "mods/mod-swooper-maps/src/recipes",
      "mods/mod-swooper-maps/src/maps",
      "--force",
      "--output",
      "compact",
      "--dry-run",
    ]);
    expect(observedRequests[1]?.argv.slice(0, 2)).toEqual([
      "apply",
      ".grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md",
    ]);
    const docsApplyRoots = observedRequests[1]?.argv.slice(2, -4) ?? [];
    expect(docsApplyRoots.length).toBeGreaterThan(0);
    expect(docsApplyRoots.every((root) => root.startsWith("docs/") && root.endsWith(".md"))).toBe(
      true
    );
    expect(docsApplyRoots).not.toContain("docs");
    expect(observedRequests[1]?.argv.slice(-4)).toEqual([
      "--force",
      "--output",
      "standard",
      "--dry-run",
    ]);
    expect(result.record.patternPaths).toEqual([
      ".grit/patterns/habitat/apply/deep_import_to_public_surface.md",
      ".grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md",
    ]);
    expect(
      result.record.roots.some((root) => root.startsWith("docs/") && root.endsWith(".md"))
    ).toBe(true);
    expect(result.record.roots).not.toContain("docs");
    expect(result.record.roots).toContain("mods/mod-swooper-maps/src/maps");
    expect(result.record.roots).toContain("mods/mod-swooper-maps/src/recipes");
    expect(result.record.gateCommands.map((command) => command.commandId)).toContain(
      "grit-apply-dry-run"
    );
    expect(result.stdout).not.toContain("docs/FALSE-POSITIVE.md");
  });

  test("fails closed when dry-run output is not structured inventory or zero matches", () => {
    const parsed = parseApplyRewriteInventory(
      makeHabitatCommandResult(applyRequest(), {
        stdout: output("rewrote some files but did not say which\n"),
      })
    );

    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.failureTag).toBe("GritApplyDryRunMismatch");
  });

  test("fails if compact dry-run reports matches but isolated copy produces no diff", async () => {
    const result = await runGritApplyTransaction({
      dryRun: true,
      gitStateReader: () => gitState(""),
      processLayer: makeFakeHabitatProcessLayer((request) =>
        makeHabitatCommandResult(request, {
          stdout:
            request.commandId === "grit-apply-dry-run"
              ? output("demo.ts:1:1 - rewritten\n\nProcessed 1 files and found 1 matches\n")
              : output("Processed 1 files and found 1 matches\n"),
        })
      ),
    });

    expect(result.ok).toBe(false);
    expect(result.failureTag).toBe("GritApplyDryRunMismatch");
    expect(result.record.transactionCopyCommand?.commandId).toBe("grit-apply-isolated-copy");
  });

  test("classifies pattern-approved rewrites and blocks unapproved inventory", () => {
    const approved = inventory({
      symbol: "planFloodplains",
      currentImportSource: "@example/private-plan-floodplains",
      proposedImportSource: "@example/public-surface",
      approvedByPattern: true,
    });
    const unapproved = inventory({
      symbol: "missingPatternApproval",
      currentImportSource: "@example/private-missing",
      proposedImportSource: "@example/public-surface",
      approvedByPattern: false,
    });

    const classified = classifyApplyRewriteInventory(
      [approved, unapproved],
      ["mods/mod-swooper-maps/src/recipes"]
    );

    expect(classified[0]).toMatchObject({ classification: "pre-approved" });
    expect(classified[1]).toMatchObject({
      classification: "blocked",
      failureTag: "GritApplyDryRunMismatch",
    });
  });

  test("preserves pattern-owned failure tags from structured inventory", () => {
    const parsed = parseApplyRewriteInventory(
      makeHabitatCommandResult(applyRequest(), {
        stdout: output(
          "HABITAT_REWRITE file=mods%2Fmod-swooper-maps%2Fsrc%2Frecipes%2Fstandard%2Fstages%2Fdemo.ts symbol=missingExport current=%40example%2Fprivate proposed=%40example%2Fpublic range=1%3A1-1%3A30 approved=false failureTag=GritApplyMissingTargetExport failureReason=missing-public-export\n"
        ),
      })
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const [classified] = classifyApplyRewriteInventory(parsed.entries, [
      "mods/mod-swooper-maps/src/recipes",
    ]);

    expect(classified).toMatchObject({
      classification: "blocked",
      failureTag: "GritApplyMissingTargetExport",
      failureReason: "missing-public-export",
    });
  });

  test("blocks rewrites outside exact apply roots", () => {
    const classified = classifyApplyRewriteInventory(
      [
        inventory({
          file: "packages/config/src/demo.ts",
          symbol: "planFloodplains",
          currentImportSource: "@example/private-plan-floodplains",
          proposedImportSource: "@example/public-surface",
          approvedByPattern: true,
        }),
      ],
      ["mods/mod-swooper-maps/src/recipes"]
    );

    expect(classified[0]).toMatchObject({
      classification: "blocked",
      failureTag: "GritApplyUnexpectedFile",
    });
  });

  test("blocks isolated-copy create evidence inside approved roots without pattern approval", () => {
    const [classified] = classifyApplyDiffEvidence(
      [
        diffEvidence({
          path: "mods/mod-swooper-maps/src/recipes/standard/stages/created.ts",
          beforeSha256: null,
          afterSha256: digest("after-create"),
        }),
      ],
      ["mods/mod-swooper-maps/src/recipes"]
    );

    expect(classified).toMatchObject({
      classification: "blocked",
      failureTag: "GritApplyUnexpectedFile",
      failureReason:
        "Isolated apply created a file without pattern-owned create approval: mods/mod-swooper-maps/src/recipes/standard/stages/created.ts.",
    });
  });

  test("blocks isolated-copy delete evidence inside approved roots without pattern approval", () => {
    const [classified] = classifyApplyDiffEvidence(
      [
        diffEvidence({
          path: "mods/mod-swooper-maps/src/recipes/standard/stages/deleted.ts",
          beforeSha256: digest("before-delete"),
          afterSha256: null,
        }),
      ],
      ["mods/mod-swooper-maps/src/recipes"]
    );

    expect(classified).toMatchObject({
      classification: "blocked",
      failureTag: "GritApplyUnexpectedFile",
      failureReason:
        "Isolated apply deleted a file without pattern-owned delete approval: mods/mod-swooper-maps/src/recipes/standard/stages/deleted.ts.",
    });
  });

  test("pre-approves isolated-copy modification evidence inside approved roots", () => {
    const [classified] = classifyApplyDiffEvidence(
      [
        diffEvidence({
          path: existingApprovedFile,
          beforeSha256: digest("before-modify"),
          afterSha256: digest("after-modify"),
        }),
      ],
      ["mods/mod-swooper-maps/src/recipes"]
    );

    expect(classified).toMatchObject({
      classification: "pre-approved",
    });
    expect(classified?.failureTag).toBeUndefined();
    expect(classified?.failureReason).toBeUndefined();
  });

  test("records rollback failure after an approved apply write", async () => {
    const states = [
      gitState(""),
      gitState(` M ${existingApprovedFile}\n`),
      gitState(` M ${existingApprovedFile}\n`),
      gitState(` M ${existingApprovedFile}\n`),
    ];
    let stateIndex = 0;
    const seenCommands: string[] = [];
    const result = await runGritApplyTransaction({
      dryRun: false,
      rollbackAfterApply: true,
      allowDirtyWorktree: true,
      gitStateReader: () => states[Math.min(stateIndex++, states.length - 1)],
      processLayer: makeFakeHabitatProcessLayer((request) => {
        seenCommands.push(request.commandId);
        if (request.commandId === "grit-apply-dry-run") {
          return makeHabitatCommandResult(request, {
            stdout: output(approvedInventoryLine()),
          });
        }
        if (request.commandId === "grit-apply-rollback") {
          return makeHabitatCommandResult(request, {
            exit: { code: 2, signal: null, interrupted: false },
            failureTag: "GritCommandFailed",
            stderr: output("rollback failed\n"),
          });
        }
        return makeHabitatCommandResult(request);
      }),
    });

    expect(seenCommands).toContain("grit-apply-live");
    expect(seenCommands).toContain("grit-apply-rollback");
    expect(result.ok).toBe(false);
    expect(result.failureTag).toBe("GritApplyRollbackFailed");
    expect(result.record.rollbackCommand?.exit.code).toBe(2);
    expect(result.record.fileDigests).toHaveLength(1);
    expect(result.record.fileDigests[0]?.path).toBe(existingApprovedFile);
    expect(result.record.fileDigests[0]?.beforeSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.record.fileDigests[0]?.afterSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test("records rollback and clean final status after an approved apply", async () => {
    const states = [
      gitState(""),
      gitState(` M ${existingApprovedFile}\n`),
      gitState(` M ${existingApprovedFile}\n`),
      gitState(""),
    ];
    let stateIndex = 0;
    const result = await runGritApplyTransaction({
      dryRun: false,
      rollbackAfterApply: true,
      allowDirtyWorktree: true,
      gitStateReader: () => states[Math.min(stateIndex++, states.length - 1)],
      processLayer: makeFakeHabitatProcessLayer((request) => {
        if (request.commandId === "grit-apply-dry-run") {
          return makeHabitatCommandResult(request, {
            stdout: output(approvedInventoryLine()),
          });
        }
        return makeHabitatCommandResult(request);
      }),
    });

    expect(result.ok).toBe(true);
    expect(result.record.changedPaths).toEqual([existingApprovedFile]);
    expect(result.record.rollbackCommand?.commandId).toBe("grit-apply-rollback");
    expect(result.record.afterGitState.dirty).toBe(false);
  });

  test("rolls back when live apply fails after an approved dry-run", async () => {
    const result = await runFailureRollbackScenario({
      failingCommandId: "grit-apply-live",
      failureExitCode: 2,
      failureStderr: "apply failed after touching files\n",
    });

    expect(result.ok).toBe(false);
    expect(result.failureTag).toBe("GritCommandFailed");
    expect(result.record.applyCommand?.exit.code).toBe(2);
    expect(result.record.rollbackCommand?.commandId).toBe("grit-apply-rollback");
    expect(result.record.afterGitState.dirty).toBe(false);
  });

  test("rolls back when live apply is interrupted after an approved dry-run", async () => {
    const result = await runFailureRollbackScenario({
      failingCommandId: "grit-apply-live",
      failureExitCode: 130,
      failureInterrupted: true,
      failureSignal: "SIGINT",
      failureStderr: "interrupted\n",
    });

    expect(result.ok).toBe(false);
    expect(result.failureTag).toBe("GritCommandFailed");
    expect(result.record.applyCommand?.exit.interrupted).toBe(true);
    expect(result.record.applyCommand?.exit.signal).toBe("SIGINT");
    expect(result.record.rollbackCommand?.commandId).toBe("grit-apply-rollback");
    expect(result.record.afterGitState.dirty).toBe(false);
  });

  test("rolls back when Biome handoff fails after an approved apply", async () => {
    const result = await runFailureRollbackScenario({
      failingCommandId: "grit-apply-biome-handoff",
      failureExitCode: 1,
      failureStderr: "biome failed\n",
    });

    expect(result.ok).toBe(false);
    expect(result.failureTag).toBe("GritCommandFailed");
    expect(result.record.biomeCommand?.exit.code).toBe(1);
    expect(result.record.rollbackCommand?.commandId).toBe("grit-apply-rollback");
    expect(result.record.afterGitState.dirty).toBe(false);
  });

  test("rolls back when a selected gate fails after an approved apply", async () => {
    const result = await runFailureRollbackScenario({
      failingCommandId: "selected-type-gate",
      failureExitCode: 1,
      failureStderr: "type gate failed\n",
      gateCommands: [
        {
          commandId: "selected-type-gate",
          kind: "platform-parity",
          executable: "node",
          argv: ["--version"],
          cwd: repoRoot,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.failureTag).toBe("GritCommandFailed");
    expect(result.record.gateCommands).toHaveLength(1);
    expect(result.record.gateCommands[0]?.commandId).toBe("selected-type-gate");
    expect(result.record.rollbackCommand?.commandId).toBe("grit-apply-rollback");
    expect(result.record.afterGitState.dirty).toBe(false);
  });

  test("validates a matching apply through an isolated copy without writing the source tree", async () => {
    const absoluteProbeFile = path.join(repoRoot, isolatedCopyProbeFile);
    const absoluteProbeDir = path.dirname(absoluteProbeFile);
    const sourceText =
      'import { MountainsConfigSchema } from "@mapgen/domain/morphology/ops/mountains-shared/config";\n\nexport const demo = () => MountainsConfigSchema;\n';
    mkdirSync(absoluteProbeDir, { recursive: true });
    writeFileSync(absoluteProbeFile, sourceText);
    try {
      const result = await runGritApplyTransaction({
        dryRun: true,
        gitStateReader: () => gitState(`?? ${isolatedCopyProbeFile}\n`),
      });

      expect(result.ok).toBe(true);
      expect(result.record.transactionCopyCommand?.commandId).toBe("grit-apply-isolated-copy");
      expect(result.record.changedPaths).toContain(isolatedCopyProbeFile);
      expect(result.record.diffEvidence).toContainEqual(
        expect.objectContaining({
          path: isolatedCopyProbeFile,
          classification: "pre-approved",
        })
      );
      expect(result.record.appliedDiff).toContain("@mapgen/domain/morphology/ops");
      expect(readFileSync(absoluteProbeFile, "utf8")).toBe(sourceText);
    } finally {
      cleanupIsolatedCopyProbe();
    }
  });

  test("preserves type-only imports through isolated copy apply validation", async () => {
    const absoluteProbeFile = path.join(repoRoot, isolatedTypeProbeFile);
    const absoluteProbeDir = path.dirname(absoluteProbeFile);
    const sourceText =
      'import type { MountainsConfig } from "@mapgen/domain/morphology/ops/mountains-shared/config";\n\nexport type Demo = MountainsConfig;\n';
    mkdirSync(absoluteProbeDir, { recursive: true });
    writeFileSync(absoluteProbeFile, sourceText);
    try {
      const result = await runGritApplyTransaction({
        dryRun: true,
        gitStateReader: () => gitState(`?? ${isolatedTypeProbeFile}\n`),
      });

      expect(result.ok).toBe(true);
      expect(result.record.changedPaths).toContain(isolatedTypeProbeFile);
      expect(result.record.appliedDiff).toContain(
        'import type { MountainsConfig } from "@mapgen/domain/morphology/ops"'
      );
      expect(readFileSync(absoluteProbeFile, "utf8")).toBe(sourceText);
    } finally {
      cleanupIsolatedCopyProbe();
    }
  });

  test("blocks isolated copy apply validation when the public ops target lacks a named export", async () => {
    const absoluteProbeFile = path.join(repoRoot, isolatedMissingExportProbeFile);
    const absoluteProbeDir = path.dirname(absoluteProbeFile);
    const sourceText =
      'import { planFloodplains } from "@mapgen/domain/ecology/ops/features-plan-floodplains";\n\nexport const demo = () => planFloodplains;\n';
    mkdirSync(absoluteProbeDir, { recursive: true });
    writeFileSync(absoluteProbeFile, sourceText);
    try {
      const result = await runGritApplyTransaction({
        dryRun: true,
        gitStateReader: () => gitState(`?? ${isolatedMissingExportProbeFile}\n`),
      });

      expect(result.ok).toBe(false);
      expect(result.failureTag).toBe("GritApplyMissingTargetExport");
      expect(result.record.changedPaths).toContain(isolatedMissingExportProbeFile);
      expect(result.record.appliedDiff).toContain("@mapgen/domain/ecology/ops");
      expect(result.stderr).toContain("Missing public export planFloodplains");
      expect(readFileSync(absoluteProbeFile, "utf8")).toBe(sourceText);
    } finally {
      cleanupIsolatedCopyProbe();
    }
  });
});

function applyRequest(): HabitatProcessRequest {
  return {
    commandId: "grit-apply-dry-run",
    kind: "grit-apply",
    executable: "grit",
    argv: ["apply", "--dry-run"],
    cwd: repoRoot,
  };
}

function inventory(
  options: Partial<GritApplyRewriteInventoryEntry> = {}
): GritApplyRewriteInventoryEntry {
  return {
    file: approvedFile,
    symbol: "planFloodplains",
    currentImportSource: "@example/private-plan-floodplains",
    proposedImportSource: "@example/public-surface",
    range: "1:1-1:70",
    rewriteReason: "deep_import_to_public_surface",
    approvedByPattern: true,
    rawOutputDigest: "test",
    classification: "expected",
    ...options,
  };
}

function diffEvidence(options: Partial<GritApplyDiffEvidenceInput>): GritApplyDiffEvidenceInput {
  return {
    path: approvedFile,
    beforeSha256: digest("before"),
    afterSha256: digest("after"),
    diffSha256: digest("diff"),
    ...options,
  };
}

function digest(value: string): string {
  return Buffer.from(value).toString("hex").padEnd(64, "0").slice(0, 64);
}

function gitState(statusShort: string): HabitatGitState {
  return {
    branch: "test",
    head: "0000000",
    dirty: statusShort.trim().length > 0,
    statusShort,
    statusDigest: statusShort,
  };
}

function output(text: string): OutputCapture {
  return {
    text,
    truncated: false,
    sha256: "test",
    bytes: Buffer.byteLength(text, "utf8"),
  };
}

async function runFailureRollbackScenario(options: {
  failingCommandId: string;
  failureExitCode: number;
  failureInterrupted?: boolean;
  failureSignal?: string;
  failureStderr: string;
  gateCommands?: readonly HabitatProcessRequest[];
}) {
  const dirty = gitState(` M ${existingApprovedFile}\n`);
  const states =
    options.failingCommandId === "grit-apply-live"
      ? [gitState(""), dirty, gitState("")]
      : [gitState(""), dirty, dirty, gitState("")];
  let stateIndex = 0;
  return runGritApplyTransaction({
    dryRun: false,
    allowDirtyWorktree: true,
    gateCommands: options.gateCommands,
    gitStateReader: () => states[Math.min(stateIndex++, states.length - 1)],
    processLayer: makeFakeHabitatProcessLayer((request) => {
      if (request.commandId === "grit-apply-dry-run") {
        return makeHabitatCommandResult(request, {
          stdout: output(approvedInventoryLine()),
        });
      }
      if (request.commandId === options.failingCommandId) {
        return makeHabitatCommandResult(request, {
          exit: {
            code: options.failureExitCode,
            signal: options.failureSignal ?? null,
            interrupted: options.failureInterrupted ?? false,
          },
          failureTag: "GritCommandFailed",
          stderr: output(options.failureStderr),
        });
      }
      return makeHabitatCommandResult(request);
    }),
  });
}

function approvedInventoryLine(): string {
  return "HABITAT_REWRITE file=mods%2Fmod-swooper-maps%2Fsrc%2Frecipes%2Fstandard%2Fstages%2Fecology-features%2Fsteps%2Fplan-floodplains%2Findex.ts symbol=planFloodplains current=%40example%2Fprivate-plan-floodplains proposed=%40example%2Fpublic-surface range=1%3A1-1%3A70 approved=true pattern=deep_import_to_public_surface\n";
}

function cleanupIsolatedCopyProbe(): void {
  rmSync(
    path.join(
      repoRoot,
      "mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-validation"
    ),
    {
      recursive: true,
      force: true,
    }
  );
}
