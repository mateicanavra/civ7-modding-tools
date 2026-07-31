#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ledgerRepoPath =
  ".habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json";

export interface RuleAuthorityLedgerParityIssue {
  readonly code:
    | "ledger-shape-invalid"
    | "ledger-rule-id-invalid"
    | "ledger-rule-id-duplicate"
    | "ledger-live-rule-missing"
    | "ledger-manifestless-rule"
    | "ledger-corpus-count-drift"
    | "ledger-corpus-duplicate-drift";
  readonly message: string;
}

interface LedgerCorpus {
  readonly liveManifestCount: number;
  readonly currentRowCount: number;
  readonly duplicateLiveRows: readonly string[];
}

interface ActiveLedgerProjection {
  readonly ruleIds: readonly string[];
  readonly corpus: LedgerCorpus | undefined;
}

const nodeRuleRegistryFileSystem = {
  isDirectory(candidatePath: string) {
    return fs.existsSync(candidatePath) && fs.statSync(candidatePath).isDirectory();
  },
  readDirectory(candidatePath: string) {
    return fs.readdirSync(candidatePath, { withFileTypes: true }).map((entry) => ({
      name: entry.name,
      kind: entry.isDirectory() ? "directory" : entry.isFile() ? "file" : "other",
    }));
  },
  readText(candidatePath: string) {
    return fs.readFileSync(candidatePath, "utf8");
  },
};

/** Compares live registry identities with the active rule-authority ledger. */
export function auditActiveRuleAuthorityLedgerIdentityParity(
  liveRuleIds: readonly string[],
  ledger: unknown
): readonly RuleAuthorityLedgerParityIssue[] {
  const issues: RuleAuthorityLedgerParityIssue[] = [];
  const projection = projectActiveLedger(ledger, issues);
  if (!projection) return issues;

  const liveDuplicates = duplicateIds(liveRuleIds);
  const ledgerDuplicates = duplicateIds(projection.ruleIds);
  if (ledgerDuplicates.length > 0) {
    issues.push({
      code: "ledger-rule-id-duplicate",
      message: `Duplicate current ledger rule ids: ${ledgerDuplicates.join(", ")}.`,
    });
  }

  const liveSet = new Set(liveRuleIds);
  const ledgerSet = new Set(projection.ruleIds);
  const missing = [...liveSet].filter((ruleId) => !ledgerSet.has(ruleId)).sort();
  if (missing.length > 0) {
    issues.push({
      code: "ledger-live-rule-missing",
      message: `Live rule ids missing current ledger rows: ${missing.join(", ")}.`,
    });
  }

  const manifestless = [...ledgerSet].filter((ruleId) => !liveSet.has(ruleId)).sort();
  if (manifestless.length > 0) {
    issues.push({
      code: "ledger-manifestless-rule",
      message: `Current ledger ids without live manifests: ${manifestless.join(", ")}.`,
    });
  }

  const corpus = projection.corpus;
  if (corpus) {
    compareCount(issues, "liveManifestCount", corpus.liveManifestCount, liveRuleIds.length);
    compareCount(issues, "currentRowCount", corpus.currentRowCount, projection.ruleIds.length);
    if (!sameStrings(corpus.duplicateLiveRows, liveDuplicates)) {
      issues.push({
        code: "ledger-corpus-duplicate-drift",
        message: `corpus.duplicateLiveRows is ${JSON.stringify(
          [...corpus.duplicateLiveRows].sort()
        )}; expected ${JSON.stringify(liveDuplicates)}.`,
      });
    }
  }

  return issues.sort(
    (left, right) =>
      left.code.localeCompare(right.code) || left.message.localeCompare(right.message)
  );
}

/** Runs the identity audit against Habitat's canonical registry discovery. */
export async function auditCurrentRuleAuthorityLedgerIdentityParity(
  workspaceRoot = findWorkspaceRoot(process.cwd())
): Promise<readonly RuleAuthorityLedgerParityIssue[]> {
  const registryModuleUrl = pathToFileURL(
    path.join(
      workspaceRoot,
      "tools/habitat/src/service/model/rules/repositories/registry.repository.ts"
    )
  ).href;
  const { loadRuleRegistryDocumentWithDiscovery } = await import(registryModuleUrl);
  const registry = loadRuleRegistryDocumentWithDiscovery(
    path.join(workspaceRoot, ".habitat"),
    nodeRuleRegistryFileSystem
  ).document;
  const ledger = JSON.parse(
    fs.readFileSync(path.join(workspaceRoot, ledgerRepoPath), "utf8")
  ) as unknown;
  return auditActiveRuleAuthorityLedgerIdentityParity(
    registry.rules.map((rule: { id: string }) => rule.id),
    ledger
  );
}

function projectActiveLedger(
  value: unknown,
  issues: RuleAuthorityLedgerParityIssue[]
): ActiveLedgerProjection | undefined {
  if (!isRecord(value) || !Array.isArray(value.rules)) {
    issues.push({
      code: "ledger-shape-invalid",
      message: "The active rule-authority ledger must contain a rules array.",
    });
    return undefined;
  }

  const ruleIds: string[] = [];
  for (const [index, row] of value.rules.entries()) {
    if (!isRecord(row) || typeof row.ruleId !== "string" || row.ruleId.trim() === "") {
      issues.push({
        code: "ledger-rule-id-invalid",
        message: `rules[${index}].ruleId must be a non-empty string.`,
      });
      continue;
    }
    ruleIds.push(row.ruleId);
  }

  return {
    ruleIds,
    corpus: projectCorpus(value.corpus, issues),
  };
}

function projectCorpus(
  value: unknown,
  issues: RuleAuthorityLedgerParityIssue[]
): LedgerCorpus | undefined {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.liveManifestCount) ||
    !Number.isInteger(value.currentRowCount) ||
    !Array.isArray(value.duplicateLiveRows) ||
    value.duplicateLiveRows.some((ruleId) => typeof ruleId !== "string")
  ) {
    issues.push({
      code: "ledger-shape-invalid",
      message:
        "corpus must declare integer liveManifestCount/currentRowCount and string[] duplicateLiveRows.",
    });
    return undefined;
  }

  return {
    liveManifestCount: value.liveManifestCount as number,
    currentRowCount: value.currentRowCount as number,
    duplicateLiveRows: value.duplicateLiveRows as string[],
  };
}

function compareCount(
  issues: RuleAuthorityLedgerParityIssue[],
  field: "liveManifestCount" | "currentRowCount",
  actual: number,
  expected: number
): void {
  if (actual === expected) return;
  issues.push({
    code: "ledger-corpus-count-drift",
    message: `corpus.${field} is ${actual}; expected ${expected}.`,
  });
}

function duplicateIds(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return (
    sortedLeft.length === sortedRight.length &&
    sortedLeft.every((value, index) => value === sortedRight[index])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findWorkspaceRoot(startDirectory: string): string {
  let current = path.resolve(startDirectory);
  while (true) {
    if (fs.existsSync(path.join(current, ".habitat", "index.json"))) return current;
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(`Could not locate a Habitat workspace from ${startDirectory}.`);
    }
    current = parent;
  }
}

if (import.meta.main) {
  const issues = await auditCurrentRuleAuthorityLedgerIdentityParity();
  if (issues.length > 0) {
    for (const issue of issues) console.error(`[${issue.code}] ${issue.message}`);
    process.exit(1);
  }

  console.log("Active rule-authority ledger identity parity: PASS");
}
