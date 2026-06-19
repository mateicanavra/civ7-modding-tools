import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  baselinePathForRule,
  errorMessage,
  readJsonFile,
  resolveBaselineContext,
  toContextRelative,
  type BaselineContractContext,
  type RequiredBaselineContext,
} from "./context.js";
import { projectExternalExceptionKeys } from "./sources.js";
import {
  parseBaselineKeys,
  type BaselineAuthorityProjection,
  type BaselineAuthorityState,
  type BaselineContractValidation,
  type BaselineRefusal,
  type BaselineRuleContractInput,
} from "./schema.js";
import { sameStringList } from "./utils.js";

export function baselinePath(ruleId: string): string {
  return baselinePathForRule(ruleId, resolveBaselineContext());
}

export function loadBaselineState(
  rule: BaselineRuleContractInput,
  options: BaselineContractContext = {}
): BaselineAuthorityState {
  const context = resolveBaselineContext(options);
  const p = baselinePathForRule(rule.id, context);
  if (existsSync(p)) return parseBaselineFile(p, rule.id, context);

  const external = context.externalSources[rule.id];
  if (external) {
    const projected = projectExternalExceptionKeys(rule.id, external, context);
    if (!projected.ok) return projected.refusal;
    return {
      kind: "external-exception",
      ruleId: rule.id,
      sourcePath: external.sourcePath,
      owner: external.owner,
      projectedKeys: projected.keys,
      locked: false,
    };
  }

  if (rule.exceptionPath && rule.exceptionPath !== "none") {
    return {
      kind: "baseline-refusal",
      ruleId: rule.id,
      path: rule.exceptionPath,
      reason: "unmodeled-external-exception",
      message: `Rule '${rule.id}' declares external exception source '${rule.exceptionPath}' but no modeled baseline contract exists.`,
    };
  }

  return {
    kind: "baseline-refusal",
    ruleId: rule.id,
    path: baselinePathForRule(rule.id, context),
    reason: "missing-baseline",
    message: `Registered rule '${rule.id}' has no explicit baseline file and no modeled external exception source.`,
  };
}

export function validateBaselineContract(
  options: BaselineContractContext = {}
): BaselineContractValidation {
  const context = resolveBaselineContext(options);
  const states = new Map<string, BaselineAuthorityState>();
  const refusals: BaselineRefusal[] = [];
  const registered = new Set(context.registry.map((rule) => rule.id));

  if (existsSync(context.baselinesDir)) {
    for (const file of readdirSync(context.baselinesDir)) {
      if (!file.endsWith(".json")) continue;
      const ruleId = file.replace(/\.json$/, "");
      if (!registered.has(ruleId)) {
        refusals.push({
          kind: "baseline-refusal",
          ruleId,
          path: path.join(context.baselinesDir, file),
          reason: "orphan-baseline",
          message: `Baseline file '${file}' has no registered Habitat rule.`,
        });
      }
    }
  }

  for (const rule of context.registry) {
    const state = loadBaselineState(rule, context);
    states.set(rule.id, state);
    if (state.kind === "baseline-refusal") refusals.push(state);
  }

  return { states, refusals };
}

export function baselineAuthorityProjection(
  state: BaselineAuthorityState
): BaselineAuthorityProjection {
  return state.kind === "baseline-refusal"
    ? { status: "refused", refusal: state }
    : { status: "accepted", state };
}

export function loadBaseline(ruleId: string): Set<string> {
  const state = loadBaselineState({ id: ruleId, exceptionPath: "none" });
  if (state.kind === "baseline-refusal") {
    throw new Error(state.message);
  }
  return new Set(state.kind === "external-exception" ? state.projectedKeys : state.keys);
}

export function isBaselineLocked(state: BaselineAuthorityState): boolean {
  return state.kind === "explicit-empty";
}

function parseBaselineFile(
  filePath: string,
  ruleId: string,
  context: RequiredBaselineContext
): BaselineAuthorityState {
  let parsed: unknown;
  try {
    parsed = readJsonFile(filePath);
  } catch (error) {
    return {
      kind: "baseline-refusal",
      ruleId,
      path: toContextRelative(filePath, context),
      reason: "malformed-baseline",
      message: `Baseline '${toContextRelative(filePath, context)}' is not readable JSON: ${errorMessage(error)}.`,
    };
  }

  const keys = parseBaselineArray(parsed, toContextRelative(filePath, context), ruleId);
  if (!keys.ok) return keys.refusal;
  return keys.keys.length === 0
    ? {
        kind: "explicit-empty",
        ruleId,
        path: toContextRelative(filePath, context),
        locked: true,
        keys: [],
      }
    : {
        kind: "explicit-debt",
        ruleId,
        path: toContextRelative(filePath, context),
        locked: false,
        keys: keys.keys,
      };
}

export function parseBaselineArray(
  value: unknown,
  filePath: string,
  ruleId: string
): { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal } {
  if (Array.isArray(value)) {
    const nonStringIndex = value.findIndex((entry) => typeof entry !== "string");
    if (nonStringIndex >= 0) {
      return {
        ok: false,
        refusal: {
          kind: "baseline-refusal",
          ruleId,
          path: filePath,
          reason: "non-string-baseline-key",
          message: `Baseline '${filePath}' contains a non-string entry at index ${nonStringIndex}.`,
        },
      };
    }
  }
  let keys: string[];
  try {
    keys = parseBaselineKeys(value);
  } catch (error) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: filePath,
        reason: "malformed-baseline",
        message: `Baseline '${filePath}' must be a JSON array of strings: ${errorMessage(error)}.`,
      },
    };
  }

  const seen = new Set<string>();
  const duplicate = keys.find((entry) => {
    if (seen.has(entry)) return true;
    seen.add(entry);
    return false;
  });
  if (duplicate) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: filePath,
        reason: "duplicate-baseline-key",
        message: `Baseline '${filePath}' contains duplicate key '${duplicate}'.`,
      },
    };
  }

  const sorted = [...keys].sort();
  if (!sameStringList(keys, sorted)) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: filePath,
        reason: "unsorted-baseline",
        message: `Baseline '${filePath}' entries must be sorted lexicographically.`,
      },
    };
  }
  return { ok: true, keys };
}
