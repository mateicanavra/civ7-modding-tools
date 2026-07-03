import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { baselineRepoPath, ruleRegistryRepoPath } from "../../lib/artifact-paths.ts";
import { parseRuleRegistryDocument } from "../rule-registry/index.js";
import {
  type BaselineContractContext,
  baselinePathForRule,
  gitShow,
  mergeBase,
  type RequiredBaselineContext,
  resolveBaselineContext,
} from "./context.js";
import {
  type BaselineExpansionDecision,
  type BaselineIntegrityFinding,
  type BaselineIntegrityResult,
  type BaselineRefusal,
} from "./schema.js";
import { parseBaselineArray, validateBaselineContract } from "./state.js";
import { sortedUnique } from "./utils.js";

const preD14aAuthoredArtifactPaths = {
  ruleRegistry: "tools/habitat-harness/src/rules/rules.json",
  baseline(ruleId: string): string {
    return `tools/habitat-harness/baselines/${ruleId}.json`;
  },
};

export function writeBaseline(
  ruleId: string,
  keys: string[],
  options: BaselineContractContext = {}
): void {
  const context = resolveBaselineContext(options);
  mkdirSync(context.baselinesDir, { recursive: true });
  writeFileSync(
    baselinePathForRule(ruleId, context),
    `${JSON.stringify([...keys].sort(), null, 2)}\n`
  );
}

export function checkBaselineIntegrity(
  base = "main",
  options: BaselineContractContext = {}
): BaselineIntegrityResult {
  const context = resolveBaselineContext(options);
  const refusals: BaselineRefusal[] = [...validateBaselineContract(options).refusals];

  const mb = mergeBase(base, context);
  if (!mb) {
    return refused([
      {
        kind: "baseline-refusal",
        path: ".",
        reason: "comparison-base-unavailable",
        message: `Unable to resolve a trusted comparison base for '${base}'.`,
      },
      ...refusals,
    ]);
  }

  const baseRules = loadBaseRuleIds(mb, context);
  if (!baseRules.ok) return refused([baseRules.refusal, ...refusals]);

  const contract = validateBaselineContract(options);
  for (const [ruleId, state] of contract.states) {
    if (state.kind !== "explicit-empty" && state.kind !== "explicit-debt") continue;
    const before = loadBaseBaselineKeys(mb, ruleId, context);
    if (!before.ok) {
      refusals.push(before.refusal);
      continue;
    }
    const previous = new Set<string>(before.keys);
    const added = state.keys.filter((key) => !previous.has(key));
    if (added.length === 0) continue;
    if (baseRules.ruleIds.has(ruleId)) {
      refusals.push({
        kind: "baseline-refusal",
        ruleId,
        path: baselineRepoPath(ruleId),
        reason: "baseline-growth-existing-rule",
        addedKeys: added,
        message:
          `baseline for existing rule '${ruleId}' grew by ${added.length} entr${added.length === 1 ? "y" : "ies"} ` +
          `relative to merge-base ${mb.slice(0, 9)}; baselines are shrink-only outside rule-introduction changes`,
      });
      continue;
    }

    const manifest = acceptedRuleIntroductionManifest(ruleId, added, base, context);
    if (!manifest.ok) refusals.push(manifest.refusal);
  }

  return refusals.length > 0 ? refused(refusals) : { status: "accepted", refusals: [] };
}

export function baselineIntegrityFindings(
  result: BaselineIntegrityResult
): BaselineIntegrityFinding[] {
  return result.status === "accepted" ? [] : result.refusals.map(findingFromRefusal);
}

export function guardBaselineExpansion(
  ruleId: string,
  keys: readonly string[],
  base = "main",
  options: BaselineContractContext = {}
): BaselineExpansionDecision {
  const context = resolveBaselineContext(options);
  const uniqueKeys = sortedUnique(keys);
  const mb = mergeBase(base, context);
  const baselinePath = baselineRepoPath(ruleId);
  if (!mb) {
    return expansionRefusal({
      kind: "baseline-refusal",
      ruleId,
      path: baselinePath,
      reason: "comparison-base-unavailable",
      message: `Refusing baseline write for '${ruleId}': unable to resolve comparison base '${base}'.`,
    });
  }

  const baseRules = loadBaseRuleIds(mb, context);
  if (!baseRules.ok) {
    return expansionRefusal({
      ...baseRules.refusal,
      ruleId,
      path: baselinePath,
      message: `Refusing baseline write for '${ruleId}': ${baseRules.refusal.message}`,
    });
  }

  if (baseRules.ruleIds.has(ruleId)) {
    return expansionRefusal({
      kind: "baseline-refusal",
      ruleId,
      path: baselinePath,
      reason: "baseline-growth-existing-rule",
      addedKeys: uniqueKeys,
      message:
        `Refusing baseline write for existing rule '${ruleId}': ${uniqueKeys.length} new ` +
        `baseline key${uniqueKeys.length === 1 ? "" : "s"} would grow tracked debt relative to ${mb.slice(0, 9)}.`,
    });
  }

  const manifest = acceptedRuleIntroductionManifest(ruleId, uniqueKeys, base, context);
  if (!manifest.ok) return expansionRefusal(manifest.refusal);

  return {
    status: "accepted",
    ruleId,
    baselinePath,
    keys: uniqueKeys,
    comparisonBase: base,
    message: `baseline write accepted for introduced rule '${ruleId}'`,
  };
}

function loadBaseRuleIds(
  mb: string,
  context: RequiredBaselineContext
): { ok: true; ruleIds: Set<string> } | { ok: false; refusal: BaselineRefusal } {
  const registryPath = ruleRegistryRepoPath;
  const rulePackAtBase = gitShowMovedAuthoredArtifact(
    mb,
    `${registryPath}/rules.json`,
    preD14aAuthoredArtifactPaths.ruleRegistry,
    context
  );
  if (rulePackAtBase === null) {
    const ruleIds = loadBaseRuleIdsFromDirectory(mb, registryPath, context);
    if (ruleIds) return { ok: true, ruleIds };
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        path: registryPath,
        reason: "base-rule-registry-missing",
        message: `Unable to read base rule registry at ${mb.slice(0, 9)}.`,
      },
    };
  }
  try {
    const parsedRaw = JSON.parse(rulePackAtBase.contents);
    const parsed = parseRuleRegistryDocument(parsedRaw, registryPath);
    if (!parsed.ok) {
      const baseRuleIds = baseRuleIdsFromHistoricalRegistry(parsedRaw);
      if (baseRuleIds) return { ok: true, ruleIds: baseRuleIds };
      throw new Error(parsed.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "));
    }
    return { ok: true, ruleIds: new Set(parsed.document.rules.map((rule) => rule.id)) };
  } catch (error) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        path: registryPath,
        reason: "base-rule-registry-malformed",
        message: `Unable to parse base rule registry at ${mb.slice(0, 9)}: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
}

function loadBaseRuleIdsFromDirectory(
  mb: string,
  registryPath: string,
  context: RequiredBaselineContext
): Set<string> | null {
  const res = context.runCommand(["git", "ls-tree", "-r", "--name-only", mb, registryPath], {
    cwd: context.repoRoot,
  });
  if (res.exitCode !== 0) return null;
  const ids = res.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith(`${registryPath}/`) && line.endsWith("/rule.json"))
    .map((line) => line.slice(`${registryPath}/`.length, -"/rule.json".length))
    .filter(Boolean)
    .sort();
  return ids.length === 0 ? null : new Set(ids);
}

function loadBaseBaselineKeys(
  mb: string,
  ruleId: string,
  context: RequiredBaselineContext
): { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal } {
  const baselinePath = baselineRepoPath(ruleId);
  const beforeRaw = gitShowMovedAuthoredArtifact(
    mb,
    baselinePath,
    preD14aAuthoredArtifactPaths.baseline(ruleId),
    context
  );
  if (beforeRaw === null) return { ok: true, keys: [] };
  try {
    const parsed = parseBaselineArray(JSON.parse(beforeRaw.contents), baselinePath, ruleId);
    return parsed.ok
      ? { ok: true, keys: parsed.keys }
      : { ok: false, refusal: { ...parsed.refusal, reason: "base-baseline-unreadable" } };
  } catch (error) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: baselinePath,
        reason: "base-baseline-unreadable",
        message: `Unable to read base baseline for '${ruleId}' at ${mb.slice(0, 9)}: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
}

function gitShowMovedAuthoredArtifact(
  ref: string,
  currentRepoPath: string,
  previousRepoPath: string,
  context: RequiredBaselineContext
): { contents: string } | null {
  const current = gitShow(ref, currentRepoPath, context);
  if (current !== null) return { contents: current };

  const previous = gitShow(ref, previousRepoPath, context);
  return previous === null ? null : { contents: previous };
}

function baseRuleIdsFromHistoricalRegistry(value: unknown): Set<string> | null {
  if (!value || typeof value !== "object" || !("rules" in value)) return null;
  const rules = (value as { rules: unknown }).rules;
  if (!Array.isArray(rules)) return null;

  const ruleIds: string[] = [];
  for (const rule of rules) {
    if (!rule || typeof rule !== "object" || !("id" in rule)) return null;
    const id = (rule as { id: unknown }).id;
    if (typeof id !== "string" || id.length === 0) return null;
    ruleIds.push(id);
  }
  return new Set(ruleIds);
}

function acceptedRuleIntroductionManifest(
  ruleId: string,
  keys: readonly string[],
  base: string,
  context: RequiredBaselineContext
): { ok: true } | { ok: false; refusal: BaselineRefusal } {
  const manifest = context.ruleIntroductionManifests.find(
    (candidate) => candidate.ruleId === ruleId
  );
  const baselinePath = baselineRepoPath(ruleId);
  if (!manifest) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: baselinePath,
        reason: "rule-introduction-manifest-missing",
        addedKeys: sortedUnique(keys),
        message:
          `baseline for introduced rule '${ruleId}' has seeded keys but no accepted rule-introduction ` +
          "baseline manifest; refusing baseline growth",
      },
    };
  }

  const sortedKeys = sortedUnique(keys);
  const manifestKeys = sortedUnique(manifest.initialBaselineKeys);
  const currentRule = context.registry.find((rule) => rule.id === ruleId);
  if (
    manifest.comparisonBase !== base ||
    manifest.baselinePath !== baselinePath ||
    manifest.ownerProject !== currentRule?.ownerProject ||
    manifest.ownerTool !== currentRule?.ownerTool ||
    manifestKeys.length !== manifest.initialBaselineKeys.length ||
    !sameLengthList(manifestKeys, sortedKeys)
  ) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: baselinePath,
        reason: "rule-introduction-manifest-mismatch",
        addedKeys: sortedUnique(keys),
        message: `rule-introduction baseline manifest for '${ruleId}' does not match the requested write`,
      },
    };
  }
  return { ok: true };
}

function refused(refusals: BaselineRefusal[]): BaselineIntegrityResult {
  return { status: "refused", refusals };
}

function expansionRefusal(refusal: BaselineRefusal): BaselineExpansionDecision {
  return { status: "refused", refusal, message: refusal.message };
}

function findingFromRefusal(refusal: BaselineRefusal): BaselineIntegrityFinding {
  return {
    file: refusal.path ?? ".",
    ruleId: refusal.ruleId ?? "baseline-integrity",
    addedKeys: refusal.addedKeys ?? [],
    reason: `baseline contract failure (${refusal.reason}): ${refusal.message}`,
  };
}

function sameLengthList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
