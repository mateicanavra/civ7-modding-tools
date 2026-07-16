import path from "node:path";
import { baselinesRepoPath, ruleRegistryRepoPath } from "@habitat/cli/resources/authority-paths";
import { renderHabitatError } from "@habitat/cli/resources/errors/index";
import {
  loadRuleRegistryDocumentEffect,
  parseRuleRegistryDocument,
  ruleBaselineFacts,
  ruleSelectorFacts,
} from "@habitat/cli/service/model/rules/index";
import { Effect } from "effect";
import type { BaselineAuthorityContext, BaselineFileSystemPort } from "./context.policy.js";
import { errorMessage, externalSourceFilePath } from "./context.policy.js";
import {
  type BaselineAuthorityState,
  type BaselineExpansionDecision,
  type BaselineIntegrityFinding,
  type BaselineIntegrityResult,
  type BaselineRefusal,
  type BaselineRuleContractInput,
} from "./dto/baseline.schema.js";
import { admitRuleIntroductionManifestEffect } from "./rule-introduction-manifest.policy.js";
import { parseBaselineArray } from "./state.policy.js";
import { sortedUnique } from "./utils.policy.js";

interface RequiredBaselineAuthorityContext<R> {
  readonly fileSystem: BaselineAuthorityContext<R>["fileSystem"];
  readonly git: BaselineAuthorityContext<R>["git"];
  readonly repoRoot: string;
  readonly baselinesDir: string;
  readonly registry: readonly BaselineRuleContractInput[];
  readonly ruleIntroductionManifests: NonNullable<
    BaselineAuthorityContext<R>["ruleIntroductionManifests"]
  >;
}

const preD14aAuthoredAuthorityPaths = {
  ruleRegistry: "tools/habitat/src/service/model/check/policy/rule-runtime/rules.json",
  baseline(ruleId: string): string {
    return `tools/habitat/baselines/${ruleId}.json`;
  },
};

export function loadBaselineStateEffect<R>(
  rule: BaselineRuleContractInput,
  options: BaselineAuthorityContext<R>
): Effect.Effect<BaselineAuthorityState, never, R> {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext<R>(options);
    if (rule.baselinePath) {
      const explicitPath = path.join(context.repoRoot, rule.baselinePath);
      if (yield* fileExists(explicitPath, context)) {
        return yield* parseBaselineFileEffect<R>(explicitPath, rule.id, context);
      }
      return {
        kind: "baseline-refusal" as const,
        ruleId: rule.id,
        path: rule.baselinePath,
        reason: "missing-baseline" as const,
        message: `Registered rule '${rule.id}' declares baseline '${rule.baselinePath}' but the file does not exist.`,
      };
    }

    if (rule.exceptionPath && rule.exceptionPath !== "none") {
      return {
        kind: "baseline-refusal" as const,
        ruleId: rule.id,
        path: rule.exceptionPath,
        reason: "external-baseline-without-contract" as const,
        message: `Rule '${rule.id}' declares external baseline source '${rule.exceptionPath}' but no Habitat baseline contract exists.`,
      };
    }

    return {
      kind: "baseline-refusal" as const,
      ruleId: rule.id,
      path: baselinePathForRule(rule.id, context),
      reason: "missing-baseline" as const,
      message: `Registered rule '${rule.id}' has no explicit baseline file and no modeled external exception source.`,
    };
  });
}

export function validateBaselineContractEffect<R>(options: BaselineAuthorityContext<R>) {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext<R>(options);
    const states = new Map<string, BaselineAuthorityState>();
    const refusals: BaselineRefusal[] = [];
    const registered = new Set(context.registry.map((rule) => rule.id));

    if (yield* directoryExists(context.baselinesDir, context)) {
      const entries = yield* context.fileSystem
        .readDirectory(context.baselinesDir)
        .pipe(Effect.catchAll(() => Effect.succeed([])));
      for (const entry of entries) {
        if (entry.kind !== "file" || !entry.name.endsWith(".json")) continue;
        const ruleId = entry.name.replace(/\.json$/, "");
        if (!registered.has(ruleId)) {
          refusals.push({
            kind: "baseline-refusal",
            ruleId,
            path: path.join(context.baselinesDir, entry.name),
            reason: "orphan-baseline",
            message: `Baseline file '${entry.name}' has no registered Habitat rule.`,
          });
        }
      }
    }

    for (const rule of context.registry) {
      const state = yield* loadBaselineStateEffect<R>(rule, context);
      states.set(rule.id, state);
      if (state.kind === "baseline-refusal") refusals.push(state);
    }

    return { states, refusals };
  });
}

export function checkBaselineIntegrityEffect<R>(
  base = "main",
  options: BaselineAuthorityContext<R>
): Effect.Effect<BaselineIntegrityResult, never, R> {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext<R>(options);
    const contract = yield* validateBaselineContractEffect<R>(context);
    const refusals: BaselineRefusal[] = [...contract.refusals];

    const mb = yield* mergeBaseEffect<R>(base, context);
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

    const baseRules = yield* loadBaseRuleIdsEffect<R>(mb, context);
    if (!baseRules.ok) return refused([baseRules.refusal, ...refusals]);

    for (const [ruleId, state] of contract.states) {
      if (state.kind !== "explicit-empty" && state.kind !== "explicit-debt") continue;
      const before = yield* loadBaseBaselineKeysEffect<R>(mb, ruleId, state.path, context);
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
          path: state.path,
          reason: "baseline-growth-existing-rule",
          addedKeys: added,
          message:
            `baseline for existing rule '${ruleId}' grew by ${added.length} entr${added.length === 1 ? "y" : "ies"} ` +
            `relative to merge-base ${mb.slice(0, 9)}; baselines are shrink-only outside rule-introduction changes`,
        });
        continue;
      }

      const manifest = yield* admitRuleIntroductionManifestEffect<R>(
        ruleId,
        added,
        base,
        state.path,
        context
      );
      if (!manifest.ok) refusals.push(manifest.refusal);
    }

    return refusals.length > 0 ? refused(refusals) : { status: "accepted", refusals: [] };
  });
}

export function baselineIntegrityFindingsEffect(result: BaselineIntegrityResult) {
  return Effect.succeed(
    result.status === "accepted" ? [] : result.refusals.map(findingFromRefusal)
  );
}

export function guardBaselineExpansionEffect<R>(
  ruleId: string,
  keys: readonly string[],
  base = "main",
  options: BaselineAuthorityContext<R>
): Effect.Effect<BaselineExpansionDecision, never, R> {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext<R>(options);
    const uniqueKeys = sortedUnique(keys);
    const mb = yield* mergeBaseEffect<R>(base, context);
    const baselinePath = baselineContractPathForRule(ruleId, context);
    if (!mb) {
      return expansionRefusal({
        kind: "baseline-refusal",
        ruleId,
        path: baselinePath,
        reason: "comparison-base-unavailable",
        message: `Refusing baseline write for '${ruleId}': unable to resolve comparison base '${base}'.`,
      });
    }

    const baseRules = yield* loadBaseRuleIdsEffect<R>(mb, context);
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

    const manifest = yield* admitRuleIntroductionManifestEffect<R>(
      ruleId,
      uniqueKeys,
      base,
      baselinePath,
      context
    );
    if (!manifest.ok) return expansionRefusal(manifest.refusal);

    return {
      status: "accepted",
      ruleId,
      baselinePath,
      keys: uniqueKeys,
      comparisonBase: base,
      message: `baseline write accepted for introduced rule '${ruleId}'`,
    };
  });
}

export function writeBaselineEffect<R>(
  ruleId: string,
  keys: readonly string[],
  options: BaselineAuthorityContext<R>
): Effect.Effect<void, unknown, R> {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext<R>(options);
    const baselinePath = absoluteBaselinePath(
      baselineContractPathForRule(ruleId, context),
      context
    );
    yield* context.fileSystem.makeDirectory(path.dirname(baselinePath));
    yield* context.fileSystem.writeText(
      baselinePath,
      `${JSON.stringify([...keys].sort(), null, 2)}\n`
    );
  });
}

function resolveBaselineAuthorityContext<R>(
  options: BaselineAuthorityContext<R>
): Effect.Effect<RequiredBaselineAuthorityContext<R>, never, R> {
  return Effect.gen(function* () {
    return {
      git: options.git,
      fileSystem: options.fileSystem,
      repoRoot: options.repoRoot,
      baselinesDir: options.baselinesDir ?? path.join(options.repoRoot, baselinesRepoPath),
      registry:
        options.registry ??
        (yield* readCurrentRuleRegistryEffect<R>(options.repoRoot, options.fileSystem)),
      ruleIntroductionManifests: options.ruleIntroductionManifests ?? [],
    };
  });
}

function readCurrentRuleRegistryEffect<R>(
  root: string,
  fileSystem: BaselineFileSystemPort<R>
): Effect.Effect<BaselineRuleContractInput[], never, R> {
  return Effect.gen(function* () {
    try {
      const parsed = yield* loadRuleRegistryDocumentEffect(path.join(root, ruleRegistryRepoPath), {
        isDirectory: fileSystem.isDirectory,
        readDirectory: fileSystem.readDirectory,
        readText: fileSystem.readText,
      }).pipe(Effect.catchAll(() => Effect.succeed(null)));
      if (parsed === null) return [];
      const selectorsByRuleId = new Map(
        ruleSelectorFacts(parsed.rules).map((fact) => [fact.id, fact])
      );
      return ruleBaselineFacts(parsed.rules).map((fact) => {
        const selector = selectorsByRuleId.get(fact.id);
        return {
          ...fact,
          ...(selector
            ? {
                ownerProject: selector.ownerProject,
                runner: selector.runner.name,
              }
            : {}),
        };
      });
    } catch {
      return [];
    }
  });
}

function parseBaselineFileEffect<R>(
  filePath: string,
  ruleId: string,
  context: RequiredBaselineAuthorityContext<R>
): Effect.Effect<BaselineAuthorityState, never, R> {
  return Effect.gen(function* () {
    const raw = yield* context.fileSystem.readText(filePath).pipe(Effect.either);
    if (raw._tag === "Left") {
      return {
        kind: "baseline-refusal" as const,
        ruleId,
        path: toAuthorityRelative(filePath, context),
        reason: "malformed-baseline" as const,
        message: `Baseline '${toAuthorityRelative(filePath, context)}' is not readable JSON: ${errorMessage(raw.left)}.`,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.right);
    } catch (error) {
      return {
        kind: "baseline-refusal" as const,
        ruleId,
        path: toAuthorityRelative(filePath, context),
        reason: "malformed-baseline" as const,
        message: `Baseline '${toAuthorityRelative(filePath, context)}' is not readable JSON: ${errorMessage(error)}.`,
      };
    }

    const keys = parseBaselineArray(parsed, toAuthorityRelative(filePath, context), ruleId);
    if (!keys.ok) return keys.refusal;
    return keys.keys.length === 0
      ? {
          kind: "explicit-empty" as const,
          ruleId,
          path: toAuthorityRelative(filePath, context),
          locked: true as const,
          keys: [] as [],
        }
      : {
          kind: "explicit-debt" as const,
          ruleId,
          path: toAuthorityRelative(filePath, context),
          locked: false as const,
          keys: keys.keys,
        };
  });
}

function fileExists<R>(
  filePath: string,
  context: RequiredBaselineAuthorityContext<R>
): Effect.Effect<boolean, never, R> {
  return context.fileSystem.isFile(filePath).pipe(Effect.catchAll(() => Effect.succeed(false)));
}

function directoryExists<R>(
  directoryPath: string,
  context: RequiredBaselineAuthorityContext<R>
): Effect.Effect<boolean, never, R> {
  return context.fileSystem
    .isDirectory(directoryPath)
    .pipe(Effect.catchAll(() => Effect.succeed(false)));
}

function mergeBaseEffect<R>(
  base: string,
  context: RequiredBaselineAuthorityContext<R>
): Effect.Effect<string | null, never, R> {
  return Effect.gen(function* () {
    for (const ref of [base, `origin/${base}`]) {
      const mb = yield* context.git.mergeBase(ref, { cwd: context.repoRoot });
      if (mb) return mb;
    }
    return null;
  });
}

function loadBaseRuleIdsEffect<R>(
  mb: string,
  context: RequiredBaselineAuthorityContext<R>
): Effect.Effect<
  { ok: true; ruleIds: Set<string> } | { ok: false; refusal: BaselineRefusal },
  never,
  R
> {
  return Effect.gen(function* () {
    const registryPath = ruleRegistryRepoPath;
    const rulePackAtBase = yield* gitShowMovedAuthoredArtifactEffect<R>(
      mb,
      `${registryPath}/rules.json`,
      preD14aAuthoredAuthorityPaths.ruleRegistry,
      context
    );
    if (rulePackAtBase === null) {
      const ruleIds = yield* loadBaseRuleIdsFromDirectoryEffect<R>(mb, registryPath, context);
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
          message: `Unable to parse base rule registry at ${mb.slice(0, 9)}: ${errorMessage(error)}`,
        },
      };
    }
  });
}

function loadBaseRuleIdsFromDirectoryEffect<R>(
  mb: string,
  registryPath: string,
  context: RequiredBaselineAuthorityContext<R>
): Effect.Effect<Set<string> | null, never, R> {
  return Effect.gen(function* () {
    const lines = yield* context.git.lsTreeNameOnly(mb, registryPath, { cwd: context.repoRoot });
    if (lines === null) return null;
    const manifestPaths = lines
      .filter((line) => line.startsWith(`${registryPath}/`))
      .filter((line) => line.endsWith("/rule.json"))
      .sort();
    const ids: string[] = [];
    for (const manifestPath of manifestPaths) {
      const raw = yield* context.git.show(mb, manifestPath, { cwd: context.repoRoot });
      if (raw === null) return null;
      const id = baseRuleIdFromManifestText(raw);
      if (!id) return null;
      ids.push(id);
    }
    return ids.length === 0 ? null : new Set(ids);
  });
}

function baseRuleIdFromManifestText(raw: string): string | undefined {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    const id = (parsed as { id?: unknown }).id;
    return typeof id === "string" && id.length > 0 ? id : undefined;
  } catch {
    return undefined;
  }
}

function loadBaseBaselineKeysEffect<R>(
  mb: string,
  ruleId: string,
  baselinePath: string,
  context: RequiredBaselineAuthorityContext<R>
): Effect.Effect<{ ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal }, never, R> {
  return Effect.gen(function* () {
    const beforeRaw = yield* gitShowMovedAuthoredArtifactEffect<R>(
      mb,
      baselinePath,
      preD14aAuthoredAuthorityPaths.baseline(ruleId),
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
          message: `Unable to read base baseline for '${ruleId}' at ${mb.slice(0, 9)}: ${errorMessage(error)}`,
        },
      };
    }
  });
}

function gitShowMovedAuthoredArtifactEffect<R>(
  ref: string,
  currentRepoPath: string,
  previousRepoPath: string,
  context: RequiredBaselineAuthorityContext<R>
): Effect.Effect<{ contents: string } | null, never, R> {
  return Effect.gen(function* () {
    const current = yield* context.git.show(ref, currentRepoPath, { cwd: context.repoRoot });
    if (current !== null) return { contents: current };

    const previous = yield* context.git.show(ref, previousRepoPath, { cwd: context.repoRoot });
    return previous === null ? null : { contents: previous };
  });
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

function baselinePathForRule(ruleId: string, context: { readonly baselinesDir: string }): string {
  return path.join(context.baselinesDir, `${ruleId}.json`);
}

function baselineContractPathForRule(
  ruleId: string,
  context: {
    readonly baselinesDir: string;
    readonly registry: readonly BaselineRuleContractInput[];
    readonly repoRoot: string;
  }
): string {
  const rule = context.registry.find((candidate) => candidate.id === ruleId);
  if (rule?.baselinePath) return rule.baselinePath;
  return toAuthorityRelative(baselinePathForRule(ruleId, context), context);
}

function absoluteBaselinePath(
  baselinePath: string,
  context: { readonly repoRoot: string }
): string {
  return path.isAbsolute(baselinePath) ? baselinePath : path.join(context.repoRoot, baselinePath);
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function toAuthorityRelative(filePath: string, context: { readonly repoRoot: string }): string {
  return externalSourceFilePath(
    path.relative(context.repoRoot, path.resolve(filePath)).split(path.sep).join("/")
  );
}
