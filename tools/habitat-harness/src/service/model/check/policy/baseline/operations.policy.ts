import path from "node:path";
import {
  baselineRepoPath,
  baselinesRepoPath,
  ruleRegistryRepoPath,
} from "@internal/habitat-harness/resources/artifact-paths";
import { renderHabitatError } from "@internal/habitat-harness/resources/errors/index";
import {
  parseRuleRegistryDocument,
  ruleBaselineFacts,
  ruleSelectorFacts,
} from "@internal/habitat-harness/service/model/rules/index";
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
} from "./schema.js";
import { parseBaselineArray } from "./state.policy.js";
import { sortedUnique } from "./utils.policy.js";

interface RequiredBaselineAuthorityContext {
  readonly fileSystem: BaselineAuthorityContext["fileSystem"];
  readonly git: BaselineAuthorityContext["git"];
  readonly repoRoot: string;
  readonly baselinesDir: string;
  readonly registry: readonly BaselineRuleContractInput[];
  readonly ruleIntroductionManifests: NonNullable<
    BaselineAuthorityContext["ruleIntroductionManifests"]
  >;
}

const preD14aAuthoredArtifactPaths = {
  ruleRegistry: "tools/habitat-harness/src/service/model/check/policy/rule-runtime/rules.json",
  baseline(ruleId: string): string {
    return `tools/habitat-harness/baselines/${ruleId}.json`;
  },
};

export function loadBaselineStateEffect(
  rule: BaselineRuleContractInput,
  options: BaselineAuthorityContext
) {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext(options);
    const p = baselinePathForRule(rule.id, context);
    if (yield* fileExists(p, context)) return yield* parseBaselineFileEffect(p, rule.id, context);

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

export function validateBaselineContractEffect(options: BaselineAuthorityContext) {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext(options);
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
      const state = yield* loadBaselineStateEffect(rule, context);
      states.set(rule.id, state);
      if (state.kind === "baseline-refusal") refusals.push(state);
    }

    return { states, refusals };
  });
}

export function checkBaselineIntegrityEffect(
  base = "main",
  options: BaselineAuthorityContext
): Effect.Effect<BaselineIntegrityResult, never, any> {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext(options);
    const contract = yield* validateBaselineContractEffect(context);
    const refusals: BaselineRefusal[] = [...contract.refusals];

    const mb = yield* mergeBaseEffect(base, context);
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

    const baseRules = yield* loadBaseRuleIdsEffect(mb, context);
    if (!baseRules.ok) return refused([baseRules.refusal, ...refusals]);

    for (const [ruleId, state] of contract.states) {
      if (state.kind !== "explicit-empty" && state.kind !== "explicit-debt") continue;
      const before = yield* loadBaseBaselineKeysEffect(mb, ruleId, context);
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
  });
}

export function baselineIntegrityFindingsEffect(result: BaselineIntegrityResult) {
  return Effect.succeed(
    result.status === "accepted" ? [] : result.refusals.map(findingFromRefusal)
  );
}

export function guardBaselineExpansionEffect(
  ruleId: string,
  keys: readonly string[],
  base = "main",
  options: BaselineAuthorityContext
): Effect.Effect<BaselineExpansionDecision, never, any> {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext(options);
    const uniqueKeys = sortedUnique(keys);
    const mb = yield* mergeBaseEffect(base, context);
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

    const baseRules = yield* loadBaseRuleIdsEffect(mb, context);
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
  });
}

export function writeBaselineEffect(
  ruleId: string,
  keys: readonly string[],
  options: BaselineAuthorityContext
): Effect.Effect<void, unknown, any> {
  return Effect.gen(function* () {
    const context = yield* resolveBaselineAuthorityContext(options);
    yield* context.fileSystem.makeDirectory(context.baselinesDir);
    yield* context.fileSystem.writeText(
      baselinePathForRule(ruleId, context),
      `${JSON.stringify([...keys].sort(), null, 2)}\n`
    );
  });
}

function resolveBaselineAuthorityContext(
  options: BaselineAuthorityContext
): Effect.Effect<RequiredBaselineAuthorityContext, never, any> {
  return Effect.gen(function* () {
    return {
      git: options.git,
      fileSystem: options.fileSystem,
      repoRoot: options.repoRoot,
      baselinesDir: options.baselinesDir ?? path.join(options.repoRoot, baselinesRepoPath),
      registry:
        options.registry ??
        (yield* readCurrentRuleRegistryEffect(options.repoRoot, options.fileSystem)),
      ruleIntroductionManifests: options.ruleIntroductionManifests ?? [],
    };
  });
}

function readCurrentRuleRegistryEffect(
  root: string,
  fileSystem: BaselineFileSystemPort
): Effect.Effect<BaselineRuleContractInput[], never, any> {
  return Effect.gen(function* () {
    const registryPath = path.join(root, ruleRegistryRepoPath, "rules.json");
    const raw = yield* fileSystem
      .readText(registryPath)
      .pipe(Effect.catchAll(() => Effect.succeed(null)));
    if (raw === null) return [];
    try {
      const parsed = parseRuleRegistryDocument(JSON.parse(raw), registryPath);
      if (!parsed.ok) return [];
      const selectorsByRuleId = new Map(
        ruleSelectorFacts(parsed.document.rules).map((fact) => [fact.id, fact])
      );
      return ruleBaselineFacts(parsed.document.rules).map((fact) => {
        const selector = selectorsByRuleId.get(fact.id);
        return {
          ...fact,
          ...(selector
            ? {
                ownerProject: selector.ownerProject,
                ownerTool: selector.ownerTool,
              }
            : {}),
        };
      });
    } catch {
      return [];
    }
  });
}

function parseBaselineFileEffect(
  filePath: string,
  ruleId: string,
  context: RequiredBaselineAuthorityContext
) {
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

function fileExists(
  filePath: string,
  context: RequiredBaselineAuthorityContext
): Effect.Effect<boolean, never, any> {
  return context.fileSystem.isFile(filePath).pipe(Effect.catchAll(() => Effect.succeed(false)));
}

function directoryExists(
  directoryPath: string,
  context: RequiredBaselineAuthorityContext
): Effect.Effect<boolean, never, any> {
  return context.fileSystem
    .isDirectory(directoryPath)
    .pipe(Effect.catchAll(() => Effect.succeed(false)));
}

function mergeBaseEffect(
  base: string,
  context: RequiredBaselineAuthorityContext
): Effect.Effect<string | null, never, any> {
  return Effect.gen(function* () {
    for (const ref of [base, `origin/${base}`]) {
      const mb = yield* context.git.mergeBase(ref, { cwd: context.repoRoot });
      if (mb) return mb;
    }
    return null;
  });
}

function loadBaseRuleIdsEffect(
  mb: string,
  context: RequiredBaselineAuthorityContext
): Effect.Effect<
  { ok: true; ruleIds: Set<string> } | { ok: false; refusal: BaselineRefusal },
  never,
  any
> {
  return Effect.gen(function* () {
    const registryPath = ruleRegistryRepoPath;
    const rulePackAtBase = yield* gitShowMovedAuthoredArtifactEffect(
      mb,
      `${registryPath}/rules.json`,
      preD14aAuthoredArtifactPaths.ruleRegistry,
      context
    );
    if (rulePackAtBase === null) {
      const ruleIds = yield* loadBaseRuleIdsFromDirectoryEffect(mb, registryPath, context);
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

function loadBaseRuleIdsFromDirectoryEffect(
  mb: string,
  registryPath: string,
  context: RequiredBaselineAuthorityContext
): Effect.Effect<Set<string> | null, never, any> {
  return Effect.gen(function* () {
    const lines = yield* context.git.lsTreeNameOnly(mb, registryPath, { cwd: context.repoRoot });
    if (lines === null) return null;
    const ids = lines
      .filter((line) => line.startsWith(`${registryPath}/`) && line.endsWith("/rule.json"))
      .map((line) => line.slice(`${registryPath}/`.length, -"/rule.json".length))
      .filter(Boolean)
      .sort();
    return ids.length === 0 ? null : new Set(ids);
  });
}

function loadBaseBaselineKeysEffect(
  mb: string,
  ruleId: string,
  context: RequiredBaselineAuthorityContext
): Effect.Effect<
  { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal },
  never,
  any
> {
  return Effect.gen(function* () {
    const baselinePath = baselineRepoPath(ruleId);
    const beforeRaw = yield* gitShowMovedAuthoredArtifactEffect(
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
          message: `Unable to read base baseline for '${ruleId}' at ${mb.slice(0, 9)}: ${errorMessage(error)}`,
        },
      };
    }
  });
}

function gitShowMovedAuthoredArtifactEffect(
  ref: string,
  currentRepoPath: string,
  previousRepoPath: string,
  context: RequiredBaselineAuthorityContext
): Effect.Effect<{ contents: string } | null, never, any> {
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

function acceptedRuleIntroductionManifest(
  ruleId: string,
  keys: readonly string[],
  base: string,
  context: RequiredBaselineAuthorityContext
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

function baselinePathForRule(
  ruleId: string,
  context: Pick<RequiredBaselineAuthorityContext, "baselinesDir">
): string {
  return path.join(context.baselinesDir, `${ruleId}.json`);
}

function toAuthorityRelative(
  filePath: string,
  context: Pick<RequiredBaselineAuthorityContext, "repoRoot">
): string {
  return externalSourceFilePath(
    path.relative(context.repoRoot, path.resolve(filePath)).split(path.sep).join("/")
  );
}

function sameLengthList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
