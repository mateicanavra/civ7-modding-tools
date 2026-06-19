import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Effect, Layer } from "effect";
import { runHabitatEffect } from "./effect-runtime.js";
import { type HabitatGitState, readGitState } from "./git-state.js";
import { gritMachineOutputEnv } from "./grit-env.js";
import {
  type GritAdapterFailureTag,
  isGritAdapterFailureTag,
  renderGritAdapterFailure,
} from "./grit-failures.js";
import {
  type HabitatCommandResult,
  HabitatProcess,
  HabitatProcessLive,
  type HabitatProcessRequest,
} from "./habitat-process.js";
import { repoRoot, toRepoRelative } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";

const sourceGritApplyPattern = ".grit/patterns/habitat/apply/deep_import_to_public_surface.md";
const docsGritApplyPattern = ".grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md";
const gritApplyPatterns = [sourceGritApplyPattern, docsGritApplyPattern];
const gritBin = "grit";

export interface GritApplyTransactionOptions {
  dryRun?: boolean;
  processLayer?: Layer.Layer<HabitatProcess>;
  gitStateReader?: () => HabitatGitState;
  allowDirtyWorktree?: boolean;
  rollbackAfterApply?: boolean;
  gateCommands?: readonly HabitatProcessRequest[];
}

export interface GritApplyRewriteInventoryEntry {
  file: string;
  symbol: string;
  currentImportSource: string;
  proposedImportSource: string;
  range: string;
  rewriteReason: string;
  approvedByPattern: boolean;
  rawOutputDigest: string;
  classification: "expected" | "pre-approved" | "rejected" | "blocked";
  failureTag?: GritAdapterFailureTag;
  failureReason?: string;
}

export interface GritApplyDiffEvidence {
  path: string;
  beforeSha256: string | null;
  afterSha256: string | null;
  diffSha256: string;
  classification: "pre-approved" | "blocked";
  failureTag?: GritAdapterFailureTag;
  failureReason?: string;
}

export interface GritApplyDiffEvidenceInput extends GritApplyFileDigest {
  diffSha256: string;
}

export interface GritApplyTransactionRecord {
  patternPaths: readonly string[];
  roots: readonly string[];
  beforeGitState: HabitatGitState;
  afterGitState: HabitatGitState;
  dryRunCommand: HabitatCommandResult | null;
  applyCommand: HabitatCommandResult | null;
  biomeCommand: HabitatCommandResult | null;
  gateCommands: readonly HabitatCommandResult[];
  rollbackCommand: HabitatCommandResult | null;
  transactionCopyCommand: HabitatCommandResult | null;
  inventory: readonly GritApplyRewriteInventoryEntry[];
  diffEvidence: readonly GritApplyDiffEvidence[];
  changedPaths: readonly string[];
  fileDigests: readonly GritApplyFileDigest[];
  appliedDiff: string;
  nonClaims: readonly string[];
}

export interface GritApplyFileDigest {
  path: string;
  beforeSha256: string | null;
  afterSha256: string | null;
}

export interface GritApplyTransactionResult extends SpawnResult {
  ok: boolean;
  failureTag: GritAdapterFailureTag | null;
  record: GritApplyTransactionRecord;
}

type ParsedInventory =
  | { ok: true; entries: GritApplyRewriteInventoryEntry[] }
  | { ok: false; failureTag: GritAdapterFailureTag; message: string };

export async function runGritApplyPatterns(
  options: GritApplyTransactionOptions = {}
): Promise<GritApplyTransactionResult> {
  return runGritApplyTransaction(options);
}

export async function runGritApplyTransaction(
  options: GritApplyTransactionOptions = {}
): Promise<GritApplyTransactionResult> {
  const gitStateReader = options.gitStateReader ?? (() => readGitState(repoRoot));
  const beforeGitState = gitStateReader();
  const sourceRoots = discoverApplySourceRoots();
  const docsRoots = discoverDocsApplyRoots();
  const roots = sortedUnique([...sourceRoots, ...docsRoots]);
  if (beforeGitState.dirty && !options.dryRun && !options.allowDirtyWorktree) {
    return transactionFailure({
      tag: "GritApplyDirtyWorktree",
      message:
        "Grit apply transaction requires a clean worktree unless an isolated transaction copy is used.",
      roots,
      beforeGitState,
      afterGitState: beforeGitState,
    });
  }

  const dryRunCommand = await runProcess(
    gritApplyRequest({
      roots: sourceRoots,
      patternPath: sourceGritApplyPattern,
      dryRun: true,
    }),
    options
  );
  if (dryRunCommand.exit.code !== 0 || dryRunCommand.exit.interrupted) {
    return transactionFailure({
      tag: dryRunCommand.failureTag ?? "GritCommandFailed",
      message: "Grit apply dry-run command failed before producing an approved inventory.",
      roots,
      beforeGitState,
      afterGitState: gitStateReader(),
      dryRunCommand,
    });
  }

  const parsedInventory = parseApplyRewriteInventory(dryRunCommand);
  let inventory: GritApplyRewriteInventoryEntry[] = [];
  let approvedApplyPaths: string[] = [];
  let approvalDiffEvidence: GritApplyDiffEvidence[] = [];
  let approvalFileDigests: GritApplyFileDigest[] = [];
  let approvalCopyCommand: HabitatCommandResult | null = null;
  let approvalAppliedDiff = "";
  let docsDryRunCommand: HabitatCommandResult | null = null;

  if (!parsedInventory.ok) {
    const copyCheck = await runIsolatedCopyApplyCheck(
      sourceRoots,
      [sourceGritApplyPattern],
      options
    );
    if (!copyCheck.ok) {
      return transactionFailure({
        tag: copyCheck.failureTag,
        message: copyCheck.message,
        roots,
        beforeGitState,
        afterGitState: gitStateReader(),
        dryRunCommand,
        transactionCopyCommand: copyCheck.command,
        diffEvidence: copyCheck.diffEvidence,
        changedPaths: copyCheck.changedPaths,
        fileDigests: copyCheck.fileDigests,
        appliedDiff: copyCheck.normalizedDiff,
      });
    }
    if (reportedMatchCount(dryRunCommand) > 0 && copyCheck.changedPaths.length === 0) {
      return transactionFailure({
        tag: "GritApplyDryRunMismatch",
        message: "Grit dry-run reported matches, but isolated apply copy produced no diff.",
        roots,
        beforeGitState,
        afterGitState: gitStateReader(),
        dryRunCommand,
        transactionCopyCommand: copyCheck.command,
        diffEvidence: copyCheck.diffEvidence,
        changedPaths: copyCheck.changedPaths,
        fileDigests: copyCheck.fileDigests,
        appliedDiff: copyCheck.normalizedDiff,
      });
    }
    approvalCopyCommand = copyCheck.command;
    approvedApplyPaths = [...copyCheck.changedPaths];
    approvalDiffEvidence = [...copyCheck.diffEvidence];
    approvalFileDigests = [...copyCheck.fileDigests];
    approvalAppliedDiff = copyCheck.normalizedDiff;
    if (options.dryRun) {
      return transactionSuccess({
        stdout: dryRunCommand.stdout.text,
        stderr: dryRunCommand.stderr.text,
        roots,
        beforeGitState,
        afterGitState: gitStateReader(),
        dryRunCommand,
        transactionCopyCommand: copyCheck.command,
        inventory: [],
        diffEvidence: copyCheck.diffEvidence,
        changedPaths: copyCheck.changedPaths,
        fileDigests: copyCheck.fileDigests,
        appliedDiff: copyCheck.normalizedDiff,
      });
    }
  } else {
    inventory = classifyApplyRewriteInventory(parsedInventory.entries, sourceRoots);
    const blocked = inventory.find((entry) => entry.classification === "blocked");
    if (blocked) {
      return transactionFailure({
        tag: blocked.failureTag ?? "GritApplyDryRunMismatch",
        message: blocked.failureReason ?? "Grit apply dry-run inventory was not approved.",
        roots,
        beforeGitState,
        afterGitState: gitStateReader(),
        dryRunCommand,
        inventory,
      });
    }
    approvedApplyPaths = inventory.map((entry) => entry.file);
  }

  if (docsRoots.length > 0) {
    docsDryRunCommand = await runProcess(
      gritApplyRequest({
        roots: docsRoots,
        patternPath: docsGritApplyPattern,
        dryRun: true,
        output: "standard",
      }),
      options
    );
    if (docsDryRunCommand.exit.code !== 0 || docsDryRunCommand.exit.interrupted) {
      return transactionFailure({
        tag: docsDryRunCommand.failureTag ?? "GritCommandFailed",
        message: "Docs Grit apply dry-run command failed before producing an approved inventory.",
        roots,
        beforeGitState,
        afterGitState: gitStateReader(),
        dryRunCommand,
        gateCommands: [docsDryRunCommand],
      });
    }
    const docsChangedPaths = parseStandardApplyChangedPaths(docsDryRunCommand.stdout.text);
    if (docsChangedPaths.length > 0) {
      const docsCopyCheck = await runIsolatedCopyApplyCheck(
        docsChangedPaths,
        [docsGritApplyPattern],
        options
      );
      if (!docsCopyCheck.ok) {
        return transactionFailure({
          tag: docsCopyCheck.failureTag,
          message: docsCopyCheck.message,
          roots,
          beforeGitState,
          afterGitState: gitStateReader(),
          dryRunCommand,
          gateCommands: [docsDryRunCommand],
          transactionCopyCommand: docsCopyCheck.command,
          diffEvidence: docsCopyCheck.diffEvidence,
          changedPaths: docsCopyCheck.changedPaths,
          fileDigests: docsCopyCheck.fileDigests,
          appliedDiff: docsCopyCheck.normalizedDiff,
        });
      }
      approvedApplyPaths = sortedUnique([...approvedApplyPaths, ...docsCopyCheck.changedPaths]);
      approvalDiffEvidence = [...approvalDiffEvidence, ...docsCopyCheck.diffEvidence];
      approvalFileDigests = [...approvalFileDigests, ...docsCopyCheck.fileDigests];
      approvalAppliedDiff = [approvalAppliedDiff, docsCopyCheck.normalizedDiff]
        .filter((part) => part.trim().length > 0)
        .join("\n");
      approvalCopyCommand = docsCopyCheck.command;
    }
  }

  if (options.dryRun || approvedApplyPaths.length === 0) {
    const afterGitState = gitStateReader();
    return transactionSuccess({
      stdout: dryRunCommand.stdout.text,
      stderr: dryRunCommand.stderr.text,
      roots,
      beforeGitState,
      afterGitState,
      dryRunCommand,
      gateCommands: docsDryRunCommand ? [docsDryRunCommand] : [],
      transactionCopyCommand: approvalCopyCommand,
      inventory,
      diffEvidence: approvalDiffEvidence,
      changedPaths: approvedApplyPaths,
      fileDigests: approvalFileDigests,
      appliedDiff: approvalAppliedDiff,
    });
  }

  const beforeFileDigestMap = captureFileDigestMap(approvedApplyPaths);
  const applyCommand = await runProcess(
    gritApplyRequest({
      roots: sourceRoots,
      patternPath: sourceGritApplyPattern,
      dryRun: false,
    }),
    options
  );
  if (applyCommand.exit.code !== 0 || applyCommand.exit.interrupted) {
    const rollback = await rollbackApplyTransaction(gitStateReader(), options);
    return transactionFailure({
      tag: rollback.failureTag ?? applyCommand.failureTag ?? "GritCommandFailed",
      message: rollback.message ?? "Grit apply command failed after dry-run approval.",
      roots,
      beforeGitState,
      afterGitState: gitStateReader(),
      dryRunCommand,
      applyCommand,
      transactionCopyCommand: approvalCopyCommand,
      rollbackCommand: rollback.command,
      inventory,
      diffEvidence: approvalDiffEvidence,
      changedPaths: approvedApplyPaths,
      fileDigests: fileDigests(beforeFileDigestMap, statusPaths(gitStateReader().statusShort)),
      appliedDiff: approvalAppliedDiff,
    });
  }

  const docsGritApplyCommand =
    docsRoots.length > 0 && approvedApplyPaths.some((changedPath) => isDocsApplyPath(changedPath))
      ? await runProcess(
          gritApplyRequest({
            roots: approvedApplyPaths.filter(isDocsApplyPath),
            patternPath: docsGritApplyPattern,
            dryRun: false,
            output: "standard",
          }),
          options
        )
      : null;
  if (
    docsGritApplyCommand &&
    (docsGritApplyCommand.exit.code !== 0 || docsGritApplyCommand.exit.interrupted)
  ) {
    const rollback = await rollbackApplyTransaction(gitStateReader(), options);
    return transactionFailure({
      tag: rollback.failureTag ?? docsGritApplyCommand.failureTag ?? "GritCommandFailed",
      message: rollback.message ?? "Docs Grit apply command failed after dry-run approval.",
      roots,
      beforeGitState,
      afterGitState: gitStateReader(),
      dryRunCommand,
      applyCommand,
      gateCommands: [docsGritApplyCommand],
      transactionCopyCommand: approvalCopyCommand,
      rollbackCommand: rollback.command,
      inventory,
      diffEvidence: approvalDiffEvidence,
      changedPaths: approvedApplyPaths,
      fileDigests: fileDigests(beforeFileDigestMap, statusPaths(gitStateReader().statusShort)),
      appliedDiff: approvalAppliedDiff,
    });
  }

  const changedPaths = statusPaths(gitStateReader().statusShort);
  const afterFileDigests = fileDigests(beforeFileDigestMap, changedPaths);
  const appliedDiff = diffForPaths(changedPaths);
  const unexpectedPath = changedPaths.find(
    (changedPath) => !approvedApplyPaths.includes(changedPath)
  );
  if (unexpectedPath) {
    const rollback = await rollbackApplyTransaction(gitStateReader(), options);
    return transactionFailure({
      tag: rollback.failureTag ?? "GritApplyUnexpectedFile",
      message: `Grit apply produced an unexpected changed path: ${unexpectedPath}.`,
      roots,
      beforeGitState,
      afterGitState: gitStateReader(),
      dryRunCommand,
      applyCommand,
      transactionCopyCommand: approvalCopyCommand,
      rollbackCommand: rollback.command,
      inventory,
      diffEvidence: approvalDiffEvidence,
      changedPaths,
      fileDigests: afterFileDigests,
      appliedDiff,
    });
  }

  const biomeCommand =
    changedPaths.length > 0 ? await runProcess(biomeHandoffRequest(changedPaths), options) : null;
  if (biomeCommand && biomeCommand.exit.code !== 0) {
    const rollback = await rollbackApplyTransaction(gitStateReader(), options);
    return transactionFailure({
      tag: rollback.failureTag ?? biomeCommand.failureTag ?? "GritCommandFailed",
      message: "Biome handoff failed after Grit apply.",
      roots,
      beforeGitState,
      afterGitState: gitStateReader(),
      dryRunCommand,
      applyCommand,
      biomeCommand,
      transactionCopyCommand: approvalCopyCommand,
      rollbackCommand: rollback.command,
      inventory,
      diffEvidence: approvalDiffEvidence,
      changedPaths,
      fileDigests: afterFileDigests,
      appliedDiff,
    });
  }

  const gateCommands: HabitatCommandResult[] = [];
  for (const gateCommand of options.gateCommands ?? []) {
    const gateResult = await runProcess(gateCommand, options);
    gateCommands.push(gateResult);
    if (gateResult.exit.code !== 0) {
      const rollback = await rollbackApplyTransaction(gitStateReader(), options);
      return transactionFailure({
        tag: rollback.failureTag ?? gateResult.failureTag ?? "GritCommandFailed",
        message: `Selected apply gate failed: ${gateCommand.commandId}.`,
        roots,
        beforeGitState,
        afterGitState: gitStateReader(),
        dryRunCommand,
        applyCommand,
        biomeCommand,
        gateCommands,
        transactionCopyCommand: approvalCopyCommand,
        rollbackCommand: rollback.command,
        inventory,
        diffEvidence: approvalDiffEvidence,
        changedPaths,
        fileDigests: afterFileDigests,
        appliedDiff,
      });
    }
  }

  const rollback =
    options.rollbackAfterApply && changedPaths.length > 0
      ? await rollbackApplyTransaction(gitStateReader(), options)
      : { command: null, failureTag: null, message: null };
  if (rollback.failureTag) {
    return transactionFailure({
      tag: rollback.failureTag,
      message: rollback.message ?? "Rollback failed after approved Grit apply.",
      roots,
      beforeGitState,
      afterGitState: gitStateReader(),
      dryRunCommand,
      applyCommand,
      biomeCommand,
      gateCommands,
      transactionCopyCommand: approvalCopyCommand,
      rollbackCommand: rollback.command,
      inventory,
      diffEvidence: approvalDiffEvidence,
      changedPaths,
      fileDigests: afterFileDigests,
      appliedDiff,
    });
  }

  return transactionSuccess({
    stdout: `${dryRunCommand.stdout.text}${applyCommand.stdout.text}${docsGritApplyCommand?.stdout.text ?? ""}${biomeCommand?.stdout.text ?? ""}`,
    stderr: `${dryRunCommand.stderr.text}${applyCommand.stderr.text}${docsGritApplyCommand?.stderr.text ?? ""}${biomeCommand?.stderr.text ?? ""}`,
    roots,
    beforeGitState,
    afterGitState: gitStateReader(),
    dryRunCommand,
    applyCommand,
    biomeCommand,
    gateCommands: docsGritApplyCommand ? [docsGritApplyCommand, ...gateCommands] : gateCommands,
    transactionCopyCommand: approvalCopyCommand,
    rollbackCommand: rollback.command,
    inventory,
    diffEvidence: approvalDiffEvidence,
    changedPaths,
    fileDigests: afterFileDigests,
    appliedDiff,
  });
}

function reportedMatchCount(commandResult: HabitatCommandResult): number {
  const rawText = `${commandResult.stdout.text}\n${commandResult.stderr.text}`;
  const match = rawText.match(/found\s+(\d+)\s+matches/i);
  return match ? Number(match[1]) : 0;
}

export function parseApplyRewriteInventory(commandResult: HabitatCommandResult): ParsedInventory {
  const rawText = `${commandResult.stdout.text}\n${commandResult.stderr.text}`.trim();
  const rawOutputDigest = createHash("sha256").update(rawText).digest("hex");
  if (rawText.length === 0 || /found 0 matches/i.test(rawText)) return { ok: true, entries: [] };

  const structuredLines = rawText
    .split("\n")
    .filter((line) => line.startsWith("HABITAT_REWRITE "))
    .map((line) => parseStructuredInventoryLine(line, rawOutputDigest));
  if (structuredLines.length > 0) {
    if (structuredLines.some((entry) => !entry)) {
      return {
        ok: false,
        failureTag: "GritApplyDryRunMismatch",
        message: "Grit apply structured rewrite inventory contained an invalid line.",
      };
    }
    return {
      ok: true,
      entries: structuredLines.filter((entry): entry is GritApplyRewriteInventoryEntry =>
        Boolean(entry)
      ),
    };
  }

  return {
    ok: false,
    failureTag: "GritApplyDryRunMismatch",
    message:
      "Grit apply dry-run output was not empty, zero-match, or Habitat structured rewrite inventory.",
  };
}

function parseStructuredInventoryLine(
  line: string,
  rawOutputDigest: string
): GritApplyRewriteInventoryEntry | null {
  const fields = Object.fromEntries(
    line
      .slice("HABITAT_REWRITE ".length)
      .split(/\s+/)
      .map((part) => {
        const separator = part.indexOf("=");
        return separator === -1
          ? [part, ""]
          : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      })
  );
  if (!fields.file || !fields.symbol || !fields.current || !fields.proposed || !fields.range) {
    return null;
  }
  if (fields.failureTag && !isGritAdapterFailureTag(fields.failureTag)) return null;
  return {
    file: fields.file,
    symbol: fields.symbol,
    currentImportSource: fields.current,
    proposedImportSource: fields.proposed,
    range: fields.range,
    rewriteReason: fields.reason ?? fields.pattern ?? "unknown",
    approvedByPattern: fields.approved === "true",
    rawOutputDigest,
    classification: "expected",
    failureTag: fields.failureTag as GritAdapterFailureTag | undefined,
    failureReason: fields.failureReason,
  };
}

function block(
  entry: GritApplyRewriteInventoryEntry,
  failureTag: GritAdapterFailureTag,
  failureReason: string
): GritApplyRewriteInventoryEntry {
  return { ...entry, classification: "blocked", failureTag, failureReason };
}

export function classifyApplyRewriteInventory(
  entries: readonly GritApplyRewriteInventoryEntry[],
  roots: readonly string[]
): GritApplyRewriteInventoryEntry[] {
  return entries.map((entry) => {
    if (!roots.some((root) => entry.file === root || entry.file.startsWith(`${root}/`))) {
      return block(
        entry,
        "GritApplyUnexpectedFile",
        `Rewrite file is outside approved apply roots: ${entry.file}.`
      );
    }
    if (!entry.approvedByPattern) {
      return block(
        entry,
        entry.failureTag ?? "GritApplyDryRunMismatch",
        entry.failureReason ??
          "Structured rewrite inventory entry was not approved by the pattern-owned output contract."
      );
    }
    return { ...entry, classification: "pre-approved" };
  });
}

export function classifyApplyDiffEvidence(
  entries: readonly GritApplyDiffEvidenceInput[],
  roots: readonly string[]
): GritApplyDiffEvidence[] {
  return entries.map((entry) => {
    const outsideRoot = !roots.some(
      (root) => entry.path === root || entry.path.startsWith(`${root}/`)
    );
    if (outsideRoot) {
      return blockDiffEvidence(
        entry,
        "GritApplyUnexpectedFile",
        `Isolated apply changed a path outside approved roots: ${entry.path}.`
      );
    }
    if (entry.beforeSha256 === null) {
      return blockDiffEvidence(
        entry,
        "GritApplyUnexpectedFile",
        `Isolated apply created a file without pattern-owned create approval: ${entry.path}.`
      );
    }
    if (entry.afterSha256 === null) {
      return blockDiffEvidence(
        entry,
        "GritApplyUnexpectedFile",
        `Isolated apply deleted a file without pattern-owned delete approval: ${entry.path}.`
      );
    }
    return {
      ...entry,
      classification: "pre-approved",
    };
  });
}

function blockDiffEvidence(
  entry: GritApplyDiffEvidenceInput,
  failureTag: GritAdapterFailureTag,
  failureReason: string
): GritApplyDiffEvidence {
  return {
    ...entry,
    classification: "blocked",
    failureTag,
    failureReason,
  };
}

function gritApplyRequest(options: {
  roots: readonly string[];
  patternPath: string;
  dryRun: boolean;
  output?: "compact" | "standard";
}): HabitatProcessRequest {
  return makeGritApplyRequest({
    commandId: options.dryRun ? "grit-apply-dry-run" : "grit-apply-live",
    roots: options.roots,
    patternPaths: [options.patternPath],
    dryRun: options.dryRun,
    cacheDir: path.join(repoRoot, ".grit", "cache"),
    output: options.output,
  });
}

function makeGritApplyRequest(options: {
  commandId: string;
  roots: readonly string[];
  patternPaths: readonly string[];
  dryRun: boolean;
  cacheDir: string;
  output?: "compact" | "standard";
}): HabitatProcessRequest {
  return {
    commandId: options.commandId,
    kind: "grit-apply",
    executable: gritBin,
    argv: [
      "apply",
      ...options.patternPaths,
      ...options.roots,
      "--force",
      "--output",
      options.output ?? "compact",
      ...(options.dryRun ? ["--dry-run"] : []),
    ],
    cwd: repoRoot,
    env: {
      ...gritMachineOutputEnv,
      GRIT_CACHE_DIR: options.cacheDir,
      GRIT_TELEMETRY_DISABLED: "true",
    },
    scanRoots: options.roots,
    cachePolicy: {
      mode: "isolated",
      cacheDir: options.cacheDir,
      observableStatus: "unknown",
    },
    nonClaims: [
      "does-not-prove-grit-current-tree",
      "does-not-prove-baseline-shrink",
      "does-not-prove-product-runtime",
    ],
  };
}

type IsolatedCopyApplyCheck =
  | {
      ok: true;
      command: HabitatCommandResult;
      changedPaths: string[];
      fileDigests: GritApplyFileDigest[];
      diffEvidence: GritApplyDiffEvidence[];
      normalizedDiff: string;
    }
  | {
      ok: false;
      failureTag: GritAdapterFailureTag;
      message: string;
      command: HabitatCommandResult | null;
      changedPaths: string[];
      fileDigests: GritApplyFileDigest[];
      diffEvidence: GritApplyDiffEvidence[];
      normalizedDiff: string;
    };

async function runIsolatedCopyApplyCheck(
  roots: readonly string[],
  patternPaths: readonly string[],
  options: Pick<GritApplyTransactionOptions, "processLayer">
): Promise<IsolatedCopyApplyCheck> {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "habitat-grit-apply-"));
  const beforeRoot = path.join(tempRoot, "before");
  const afterRoot = path.join(tempRoot, "after");
  try {
    for (const root of roots) {
      const source = path.join(repoRoot, root);
      if (!existsSync(source)) continue;
      mkdirSync(path.dirname(path.join(beforeRoot, root)), { recursive: true });
      mkdirSync(path.dirname(path.join(afterRoot, root)), { recursive: true });
      cpSync(source, path.join(beforeRoot, root), { recursive: true, dereference: false });
      cpSync(source, path.join(afterRoot, root), { recursive: true, dereference: false });
    }

    const copyRoots = roots.map((root) => path.join(afterRoot, root));
    const command = await runProcess(
      makeGritApplyRequest({
        commandId: "grit-apply-isolated-copy",
        roots: copyRoots,
        patternPaths: patternPaths.map((patternPath) => path.join(repoRoot, patternPath)),
        dryRun: false,
        cacheDir: path.join(tempRoot, ".grit-cache"),
      }),
      options
    );
    if (command.exit.code !== 0 || command.exit.interrupted) {
      return {
        ok: false,
        failureTag: command.failureTag ?? "GritCommandFailed",
        message: "Isolated Grit apply copy failed before producing diff evidence.",
        command,
        changedPaths: [],
        fileDigests: [],
        diffEvidence: [],
        normalizedDiff: "",
      };
    }

    const changedPaths = changedPathsBetweenCopies(beforeRoot, afterRoot);
    const normalizedDiff = normalizedNoIndexDiff(beforeRoot, afterRoot);
    const fileDigestsForCopy = changedPaths.map((changedPath) => ({
      path: changedPath,
      beforeSha256: fileSha256At(beforeRoot, changedPath),
      afterSha256: fileSha256At(afterRoot, changedPath),
    }));
    const diffEvidence = classifyApplyDiffEvidence(
      fileDigestsForCopy.map((digest) => {
        const fileDiff = normalizedNoIndexDiff(
          path.join(beforeRoot, digest.path),
          path.join(afterRoot, digest.path)
        );
        return {
          path: digest.path,
          beforeSha256: digest.beforeSha256,
          afterSha256: digest.afterSha256,
          diffSha256: createHash("sha256").update(fileDiff).digest("hex"),
        };
      }),
      roots
    );
    const blocked = diffEvidence.find((entry) => entry.classification === "blocked");
    if (blocked) {
      return {
        ok: false,
        failureTag: blocked.failureTag ?? "GritApplyUnexpectedFile",
        message: blocked.failureReason ?? "Isolated apply diff evidence was not approved.",
        command,
        changedPaths,
        fileDigests: fileDigestsForCopy,
        diffEvidence,
        normalizedDiff,
      };
    }
    const targetExportFailure = validateAppliedTargetExports(afterRoot, changedPaths);
    if (targetExportFailure) {
      return {
        ok: false,
        failureTag: "GritApplyMissingTargetExport",
        message: targetExportFailure,
        command,
        changedPaths,
        fileDigests: fileDigestsForCopy,
        diffEvidence,
        normalizedDiff,
      };
    }

    return {
      ok: true,
      command,
      changedPaths,
      fileDigests: fileDigestsForCopy,
      diffEvidence,
      normalizedDiff,
    };
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function validateAppliedTargetExports(
  copyRoot: string,
  changedPaths: readonly string[]
): string | null {
  for (const changedPath of changedPaths) {
    const absolute = path.join(copyRoot, changedPath);
    if (!existsSync(absolute)) continue;
    const sourceText = readFileSync(absolute, "utf8");
    const imports = publicOpsImports(sourceText);
    for (const importEntry of imports) {
      const exportSet = exportedNamesForPublicOps(importEntry.domainPath);
      if (!exportSet) {
        return `Missing public ops target for ${importEntry.source} imported by ${changedPath}.`;
      }
      for (const specifier of importEntry.specifiers) {
        const exported = exportSet.get(specifier.exportedName);
        if (!exported || (!specifier.typeOnly && exported === "type")) {
          return `Missing public export ${specifier.exportedName} from ${importEntry.source} for ${changedPath}.`;
        }
      }
    }
  }
  return null;
}

interface PublicOpsImport {
  source: string;
  domainPath: string;
  specifiers: PublicOpsImportSpecifier[];
}

interface PublicOpsImportSpecifier {
  exportedName: string;
  typeOnly: boolean;
}

function publicOpsImports(sourceText: string): PublicOpsImport[] {
  const imports: PublicOpsImport[] = [];
  const importPattern =
    /import\s+(type\s+)?\{([^}]+)\}\s+from\s+["'](@mapgen\/domain\/([^"']+)\/ops)["']/g;
  for (const match of sourceText.matchAll(importPattern)) {
    const declarationTypeOnly = Boolean(match[1]);
    const specifiers = match[2]
      .split(",")
      .map((rawSpecifier) => parseImportSpecifier(rawSpecifier, declarationTypeOnly))
      .filter((specifier): specifier is PublicOpsImportSpecifier => Boolean(specifier));
    if (specifiers.length === 0) continue;
    imports.push({
      source: match[3],
      domainPath: match[4],
      specifiers,
    });
  }
  return imports;
}

function parseImportSpecifier(
  rawSpecifier: string,
  declarationTypeOnly: boolean
): PublicOpsImportSpecifier | null {
  const trimmed = rawSpecifier.trim();
  if (!trimmed) return null;
  const specifierTypeOnly = trimmed.startsWith("type ");
  const withoutType = specifierTypeOnly ? trimmed.slice("type ".length).trim() : trimmed;
  const exportedName = withoutType.split(/\s+as\s+/)[0]?.trim();
  if (!exportedName) return null;
  return { exportedName, typeOnly: declarationTypeOnly || specifierTypeOnly };
}

type ExportKind = "type" | "value";

function exportedNamesForPublicOps(domainPath: string): Map<string, ExportKind> | null {
  if (domainPath.includes("..")) return null;
  const target = publicOpsTargetPath(domainPath);
  if (!target) return null;
  return exportedNames(readFileSync(target, "utf8"));
}

function publicOpsTargetPath(domainPath: string): string | null {
  for (const candidate of [
    path.join(repoRoot, "mods", "mod-swooper-maps", "src", "domain", domainPath, "ops.ts"),
    path.join(repoRoot, "mods", "mod-swooper-maps", "src", "domain", domainPath, "ops", "index.ts"),
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function exportedNames(sourceText: string): Map<string, ExportKind> {
  const names = new Map<string, ExportKind>();
  for (const match of sourceText.matchAll(
    /export\s+(const|let|var|function|class|enum)\s+([A-Za-z_$][\w$]*)/g
  )) {
    names.set(match[2], "value");
  }
  for (const match of sourceText.matchAll(/export\s+(type|interface)\s+([A-Za-z_$][\w$]*)/g)) {
    if (!names.has(match[2])) names.set(match[2], "type");
  }
  for (const match of sourceText.matchAll(/export\s+(type\s+)?\{([^}]+)\}/g)) {
    const kind: ExportKind = match[1] ? "type" : "value";
    for (const rawSpecifier of match[2].split(",")) {
      const exportedName = parseExportSpecifier(rawSpecifier);
      if (!exportedName) continue;
      if (kind === "value" || !names.has(exportedName)) names.set(exportedName, kind);
    }
  }
  return names;
}

function parseExportSpecifier(rawSpecifier: string): string | null {
  const trimmed = rawSpecifier.trim();
  if (!trimmed) return null;
  const withoutType = trimmed.startsWith("type ") ? trimmed.slice("type ".length).trim() : trimmed;
  const aliasParts = withoutType.split(/\s+as\s+/);
  return (aliasParts[1] ?? aliasParts[0])?.trim() || null;
}

function biomeHandoffRequest(changedPaths: readonly string[]): HabitatProcessRequest {
  return {
    commandId: "grit-apply-biome-handoff",
    kind: "biome-handoff",
    executable: "biome",
    argv: ["check", "--write", ...changedPaths],
    cwd: repoRoot,
    scanRoots: changedPaths,
    cachePolicy: { mode: "default", observableStatus: "unknown" },
    nonClaims: [
      "does-not-prove-biome-formatting-semantics",
      "does-not-prove-nx-scheduling",
      "does-not-prove-product-runtime",
    ],
  };
}

function rollbackRequest(changedPaths: readonly string[]): HabitatProcessRequest {
  return {
    commandId: "grit-apply-rollback",
    kind: "git-state",
    executable: "git",
    argv: ["checkout", "--", ...changedPaths],
    cwd: repoRoot,
    scanRoots: changedPaths,
    cachePolicy: { mode: "disabled", observableStatus: "fresh" },
    nonClaims: ["does-not-prove-product-runtime"],
  };
}

async function rollbackApplyTransaction(
  gitState: HabitatGitState,
  options: GritApplyTransactionOptions
): Promise<{
  command: HabitatCommandResult | null;
  failureTag: GritAdapterFailureTag | null;
  message: string | null;
}> {
  const changedPaths = statusPaths(gitState.statusShort);
  if (changedPaths.length === 0) return { command: null, failureTag: null, message: null };
  const command = await runProcess(rollbackRequest(changedPaths), options);
  if (command.exit.code !== 0) {
    return {
      command,
      failureTag: "GritApplyRollbackFailed",
      message: "Rollback command failed after apply transaction write.",
    };
  }
  return { command, failureTag: null, message: null };
}

async function runProcess(
  request: HabitatProcessRequest,
  options: Pick<GritApplyTransactionOptions, "processLayer">
): Promise<HabitatCommandResult> {
  return runHabitatEffect(
    Effect.gen(function* () {
      const process = yield* HabitatProcess;
      return yield* process.run(request);
    }).pipe(Effect.provide(options.processLayer ?? HabitatProcessLive))
  );
}

function transactionSuccess(input: {
  stdout: string;
  stderr: string;
  roots: readonly string[];
  beforeGitState: HabitatGitState;
  afterGitState: HabitatGitState;
  dryRunCommand: HabitatCommandResult | null;
  applyCommand?: HabitatCommandResult | null;
  biomeCommand?: HabitatCommandResult | null;
  gateCommands?: readonly HabitatCommandResult[];
  rollbackCommand?: HabitatCommandResult | null;
  transactionCopyCommand?: HabitatCommandResult | null;
  inventory: readonly GritApplyRewriteInventoryEntry[];
  diffEvidence?: readonly GritApplyDiffEvidence[];
  changedPaths?: readonly string[];
  fileDigests?: readonly GritApplyFileDigest[];
  appliedDiff?: string;
}): GritApplyTransactionResult {
  return {
    ok: true,
    exitCode: 0,
    stdout: input.stdout,
    stderr: input.stderr,
    failureTag: null,
    record: transactionRecord(input),
  };
}

function transactionFailure(input: {
  tag: GritAdapterFailureTag;
  message: string;
  roots: readonly string[];
  beforeGitState: HabitatGitState;
  afterGitState: HabitatGitState;
  dryRunCommand?: HabitatCommandResult | null;
  applyCommand?: HabitatCommandResult | null;
  biomeCommand?: HabitatCommandResult | null;
  gateCommands?: readonly HabitatCommandResult[];
  rollbackCommand?: HabitatCommandResult | null;
  transactionCopyCommand?: HabitatCommandResult | null;
  inventory?: readonly GritApplyRewriteInventoryEntry[];
  diffEvidence?: readonly GritApplyDiffEvidence[];
  changedPaths?: readonly string[];
  fileDigests?: readonly GritApplyFileDigest[];
  appliedDiff?: string;
}): GritApplyTransactionResult {
  return {
    ok: false,
    exitCode: 1,
    stdout: "",
    stderr: `${renderGritAdapterFailure(input.tag, input.message)}\n`,
    failureTag: input.tag,
    record: transactionRecord({
      roots: input.roots,
      beforeGitState: input.beforeGitState,
      afterGitState: input.afterGitState,
      dryRunCommand: input.dryRunCommand ?? null,
      applyCommand: input.applyCommand ?? null,
      biomeCommand: input.biomeCommand ?? null,
      gateCommands: input.gateCommands ?? [],
      rollbackCommand: input.rollbackCommand ?? null,
      transactionCopyCommand: input.transactionCopyCommand ?? null,
      inventory: input.inventory ?? [],
      diffEvidence: input.diffEvidence ?? [],
      changedPaths: input.changedPaths ?? [],
      fileDigests: input.fileDigests ?? [],
      appliedDiff: input.appliedDiff ?? "",
    }),
  };
}

function transactionRecord(input: {
  roots: readonly string[];
  beforeGitState: HabitatGitState;
  afterGitState: HabitatGitState;
  dryRunCommand: HabitatCommandResult | null;
  applyCommand?: HabitatCommandResult | null;
  biomeCommand?: HabitatCommandResult | null;
  gateCommands?: readonly HabitatCommandResult[];
  rollbackCommand?: HabitatCommandResult | null;
  transactionCopyCommand?: HabitatCommandResult | null;
  inventory: readonly GritApplyRewriteInventoryEntry[];
  diffEvidence?: readonly GritApplyDiffEvidence[];
  changedPaths?: readonly string[];
  fileDigests?: readonly GritApplyFileDigest[];
  appliedDiff?: string;
}): GritApplyTransactionRecord {
  return {
    patternPaths: gritApplyPatterns,
    roots: input.roots,
    beforeGitState: input.beforeGitState,
    afterGitState: input.afterGitState,
    dryRunCommand: input.dryRunCommand,
    applyCommand: input.applyCommand ?? null,
    biomeCommand: input.biomeCommand ?? null,
    gateCommands: input.gateCommands ?? [],
    rollbackCommand: input.rollbackCommand ?? null,
    transactionCopyCommand: input.transactionCopyCommand ?? null,
    inventory: input.inventory,
    diffEvidence: input.diffEvidence ?? [],
    changedPaths: input.changedPaths ?? [],
    fileDigests: input.fileDigests ?? [],
    appliedDiff: input.appliedDiff ?? "",
    nonClaims: [
      "does-not-prove-grit-current-tree",
      "does-not-prove-baseline-shrink",
      "does-not-prove-nx-scheduling",
      "does-not-prove-product-runtime",
    ],
  };
}

function discoverApplySourceRoots(): string[] {
  return discoverSourceRoots(["mods"]).flatMap((sourceRoot) =>
    ["recipes", "maps"]
      .map((child) => `${sourceRoot}/${child}`)
      .filter((candidate) => existsSync(path.join(repoRoot, candidate)))
  );
}

function discoverDocsApplyRoots(): string[] {
  return collectMarkdownFiles("docs").filter(hasDocsApplyCandidateText);
}

function isDocsApplyPath(changedPath: string): boolean {
  const relative = toRepoRelative(changedPath);
  return relative === "docs" || relative.startsWith("docs/");
}

function discoverSourceRoots(workspaceRoots: string[]): string[] {
  return workspaceRoots.flatMap((workspaceRoot) => {
    const fullRoot = path.join(repoRoot, workspaceRoot);
    if (!existsSync(fullRoot)) return [];
    return readdirSync(fullRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `${workspaceRoot}/${entry.name}/src`)
      .filter((sourceRoot) => existsSync(path.join(repoRoot, sourceRoot)));
  });
}

function collectMarkdownFiles(root: string): string[] {
  const absoluteRoot = path.join(repoRoot, root);
  if (!existsSync(absoluteRoot)) return [];
  const stats = statSync(absoluteRoot);
  if (stats.isFile()) return path.extname(root) === ".md" ? [toRepoRelative(root)] : [];
  if (!stats.isDirectory()) return [];

  const files: string[] = [];
  for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
    const child = `${root}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "dist" || entry.name === "node_modules") {
        continue;
      }
      files.push(...collectMarkdownFiles(child));
      continue;
    }
    if (entry.isFile() && path.extname(entry.name) === ".md") files.push(toRepoRelative(child));
  }
  return sortedUnique(files);
}

function hasDocsApplyCandidateText(filePath: string): boolean {
  const text = readFileSync(path.join(repoRoot, filePath), "utf8");
  return (
    text.includes("/docs/") &&
    text.includes(".md") &&
    (text.includes("/Users/") || text.includes("/home/") || text.includes("/Volumes/"))
  );
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map(toRepoRelative))].sort((a, b) => a.localeCompare(b));
}

function parseStandardApplyChangedPaths(stdout: string): string[] {
  const changedPaths: string[] = [];
  let currentPath: string | null = null;
  let sawRewriteLine = false;

  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("Processed ") || trimmed.startsWith("Skipped ")) continue;
    if (trimmed.endsWith(".md") && !trimmed.includes(": ERROR ")) {
      if (currentPath && sawRewriteLine) changedPaths.push(toRepoRelative(currentPath));
      currentPath = trimmed;
      sawRewriteLine = false;
      continue;
    }
    if (currentPath && (trimmed.startsWith("-") || trimmed.startsWith("+"))) {
      sawRewriteLine = true;
    }
  }
  if (currentPath && sawRewriteLine) changedPaths.push(toRepoRelative(currentPath));
  return sortedUnique(changedPaths);
}

function statusPaths(statusShort: string): string[] {
  return statusShort
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .sort();
}

function captureFileDigestMap(filePaths: readonly string[]): Map<string, string | null> {
  return new Map(
    [...new Set(filePaths)].sort().map((filePath) => [filePath, fileSha256(filePath)])
  );
}

function fileDigests(
  beforeDigests: ReadonlyMap<string, string | null>,
  afterPaths: readonly string[]
): GritApplyFileDigest[] {
  return [...new Set([...beforeDigests.keys(), ...afterPaths])].sort().map((filePath) => ({
    path: filePath,
    beforeSha256: beforeDigests.get(filePath) ?? null,
    afterSha256: fileSha256(filePath),
  }));
}

function fileSha256(filePath: string): string | null {
  const absolute = path.join(repoRoot, filePath);
  if (!existsSync(absolute)) return null;
  return createHash("sha256").update(readFileSync(absolute)).digest("hex");
}

function fileSha256At(root: string, filePath: string): string | null {
  const absolute = path.join(root, filePath);
  if (!existsSync(absolute)) return null;
  return createHash("sha256").update(readFileSync(absolute)).digest("hex");
}

function diffForPaths(changedPaths: readonly string[]): string {
  if (changedPaths.length === 0) return "";
  const result = run(["git", "diff", "--", ...changedPaths], { cwd: repoRoot });
  return `${result.stdout}${result.stderr}`;
}

function changedPathsBetweenCopies(beforeRoot: string, afterRoot: string): string[] {
  const result = run(["git", "diff", "--no-index", "--name-only", beforeRoot, afterRoot], {
    cwd: repoRoot,
  });
  if (result.exitCode === 0) return [];
  return result.stdout
    .split("\n")
    .map((line) => normalizeCopyPath(line.trim(), beforeRoot, afterRoot))
    .filter((line): line is string => Boolean(line))
    .sort();
}

function normalizedNoIndexDiff(beforePath: string, afterPath: string): string {
  const result = run(["git", "diff", "--no-index", "--", beforePath, afterPath], { cwd: repoRoot });
  if (result.exitCode === 0) return "";
  return `${result.stdout}${result.stderr}`
    .replaceAll(beforePath, "a")
    .replaceAll(afterPath, "b")
    .replaceAll(beforeRootPrefix(beforePath), "a/")
    .replaceAll(afterRootPrefix(afterPath), "b/");
}

function normalizeCopyPath(value: string, beforeRoot: string, afterRoot: string): string | null {
  if (!value) return null;
  const absolute = path.resolve(value);
  const afterRelative = path.relative(afterRoot, absolute);
  if (!afterRelative.startsWith("..") && !path.isAbsolute(afterRelative)) return afterRelative;
  const beforeRelative = path.relative(beforeRoot, absolute);
  if (!beforeRelative.startsWith("..") && !path.isAbsolute(beforeRelative)) return beforeRelative;
  return null;
}

function beforeRootPrefix(beforePath: string): string {
  return beforePath.endsWith(path.sep) ? beforePath : `${beforePath}${path.sep}`;
}

function afterRootPrefix(afterPath: string): string {
  return afterPath.endsWith(path.sep) ? afterPath : `${afterPath}${path.sep}`;
}
