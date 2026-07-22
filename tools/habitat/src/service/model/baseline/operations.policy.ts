import path from "node:path";
import { baselinesRepoPath, ruleRegistryRepoPath } from "@habitat/cli/resources/authority-paths";
import { renderHabitatError } from "@habitat/cli/resources/errors/index";
import {
  loadRuleRegistryDocumentEffect,
  parseRuleRegistryDocument,
  ruleBaselineFacts,
  ruleSelectorFacts,
} from "@habitat/cli/service/model/rules/index";
import { Effect, Either, Match, Schema } from "effect";
import type {
  BaselineAuthorityContext,
  BaselineDirectoryEntry,
  BaselineFileSystemPort,
} from "./context.policy.js";
import { errorMessage, externalSourceFilePath } from "./context.policy.js";
import {
  type BaselineAuthorityState,
  type BaselineExpansionDecision,
  type BaselineIntegrityFinding,
  type BaselineIntegrityResult,
  type BaselineOccurrence,
  type BaselineRefusal,
  type BaselineRuleContractInput,
} from "./dto/baseline.schema.js";
import { admitRuleIntroductionManifestEffect } from "./rule-introduction-manifest.policy.js";
import { type ParsedBaselineDocument, parseBaselineDocument } from "./state.policy.js";
import { countOccurrences, occurrenceCount } from "./utils.policy.js";

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

const preD14aAuthoredAuthorityPaths = {
  ruleRegistry: "tools/habitat/src/service/model/check/policy/rule-runtime/rules.json",
  baseline(ruleId: string): string {
    return `tools/habitat/baselines/${ruleId}.json`;
  },
};

/** Loads and validates one rule's explicit baseline authority document. */
export const loadBaselineStateEffect = Effect.fn("baseline.loadState")(function* (
  rule: BaselineRuleContractInput,
  options: BaselineAuthorityContext
) {
  const context = yield* resolveBaselineAuthorityContext(options);
  const selected = Match.value(rule.baselinePath).pipe(
    Match.when(Match.string, (baselinePath) =>
      loadExplicitBaselineStateEffect(rule.id, baselinePath, context)
    ),
    Match.orElse(() => Effect.succeed(baselineStateWithoutExplicitPath(rule, context)))
  );
  return yield* selected;
});

const loadExplicitBaselineStateEffect = Effect.fn("baseline.loadExplicitState")(function* (
  ruleId: string,
  baselinePath: string,
  context: RequiredBaselineAuthorityContext
) {
  const explicitPath = path.join(context.repoRoot, baselinePath);
  const exists = yield* fileExists(explicitPath, context);
  return yield* Match.value(exists).pipe(
    Match.when(true, () => parseBaselineFileEffect(explicitPath, ruleId, context)),
    Match.orElse(() =>
      Effect.succeed({
        kind: "baseline-refusal" as const,
        ruleId,
        path: baselinePath,
        reason: "missing-baseline" as const,
        message: `Registered rule '${ruleId}' declares baseline '${baselinePath}' but the file does not exist.`,
      })
    )
  );
});

function baselineStateWithoutExplicitPath(
  rule: BaselineRuleContractInput,
  context: RequiredBaselineAuthorityContext
): BaselineAuthorityState {
  return Match.value(rule.exceptionPath).pipe(
    Match.when(
      (exceptionPath): exceptionPath is string =>
        exceptionPath !== undefined && exceptionPath !== "none",
      (exceptionPath) => ({
        kind: "baseline-refusal" as const,
        ruleId: rule.id,
        path: exceptionPath,
        reason: "external-baseline-without-contract" as const,
        message: `Rule '${rule.id}' declares external baseline source '${exceptionPath}' but no Habitat baseline contract exists.`,
      })
    ),
    Match.orElse(() => ({
      kind: "baseline-refusal" as const,
      ruleId: rule.id,
      path: baselinePathForRule(rule.id, context),
      reason: "missing-baseline" as const,
      message: `Registered rule '${rule.id}' has no explicit baseline file and no modeled external exception source.`,
    }))
  );
}

/** Validates that every registered rule has one readable baseline and no orphan files exist. */
export const validateBaselineContractEffect = Effect.fn("baseline.validateContract")(function* (
  options: BaselineAuthorityContext
) {
  const context = yield* resolveBaselineAuthorityContext(options);
  const states = new Map<string, BaselineAuthorityState>();
  const refusals: BaselineRefusal[] = [];
  const registered = new Set(context.registry.map((rule) => rule.id));

  const baselineDirectoryExists = yield* directoryExists(context.baselinesDir, context);
  const entries = yield* Effect.if(baselineDirectoryExists, {
    onTrue: () =>
      context.fileSystem
        .readDirectory(context.baselinesDir)
        .pipe(Effect.catchAll(() => Effect.succeed([]))),
    onFalse: () => Effect.succeed([]),
  });
  refusals.push(...orphanBaselineRefusals(entries, registered, context.baselinesDir));

  for (const rule of context.registry) {
    const state = yield* loadBaselineStateEffect(rule, context);
    states.set(rule.id, state);
    refusals.push(...baselineStateRefusals(state));
  }

  return { states, refusals };
});

function baselineStateRefusals(state: BaselineAuthorityState): BaselineRefusal[] {
  return Match.value(state).pipe(
    Match.when({ kind: "baseline-refusal" }, (refusal) => [refusal]),
    Match.orElse(() => [])
  );
}

/** Compares current baseline debt with a trusted base and refuses every form of growth. */
export const checkBaselineIntegrityEffect = Effect.fn("baseline.checkIntegrity")(function* (
  base = "main",
  options: BaselineAuthorityContext
) {
  const context = yield* resolveBaselineAuthorityContext(options);
  const contract = yield* validateBaselineContractEffect(context);
  const refusals: BaselineRefusal[] = [...contract.refusals];
  const mb = yield* mergeBaseEffect(base, context);
  return yield* Match.value(mb).pipe(
    Match.when(Match.undefined, () =>
      Effect.succeed(
        refused([
          {
            kind: "baseline-refusal",
            path: ".",
            reason: "comparison-base-unavailable",
            message: `Unable to resolve a trusted comparison base for '${base}'.`,
          },
          ...refusals,
        ])
      )
    ),
    Match.orElse((mergeBase) =>
      checkBaselineIntegrityAgainstBaseEffect(base, mergeBase, contract.states, refusals, context)
    )
  );
});

const checkBaselineIntegrityAgainstBaseEffect = Effect.fn("baseline.checkIntegrityAgainstBase")(
  function* (
    base: string,
    mergeBase: string,
    states: ReadonlyMap<string, BaselineAuthorityState>,
    initialRefusals: readonly BaselineRefusal[],
    context: RequiredBaselineAuthorityContext
  ) {
    const baseRules = yield* loadBaseRuleIdsEffect(mergeBase, context);
    return yield* Match.value(baseRules).pipe(
      Match.when({ ok: false }, ({ refusal }) =>
        Effect.succeed(refused([refusal, ...initialRefusals]))
      ),
      Match.when({ ok: true }, ({ ruleIds }) =>
        collectBaselineIntegrityRefusalsEffect(
          base,
          mergeBase,
          states,
          ruleIds,
          initialRefusals,
          context
        )
      ),
      Match.exhaustive
    );
  }
);

const collectBaselineIntegrityRefusalsEffect = Effect.fn("baseline.collectIntegrityRefusals")(
  function* (
    base: string,
    mergeBase: string,
    states: ReadonlyMap<string, BaselineAuthorityState>,
    baseRuleIds: ReadonlySet<string>,
    initialRefusals: readonly BaselineRefusal[],
    context: RequiredBaselineAuthorityContext
  ) {
    const observed = yield* Effect.forEach(states, ([ruleId, state]) =>
      baselineIntegrityRefusalsForStateEffect(base, mergeBase, ruleId, state, baseRuleIds, context)
    );
    const refusals = [...initialRefusals, ...observed.flat()];
    return baselineIntegrityResult(refusals);
  }
);

type BaselineIntegrityStateDecision =
  | { readonly kind: "skip" }
  | { readonly kind: "refused"; readonly refusal: BaselineRefusal }
  | {
      readonly kind: "introduced";
      readonly state: Exclude<BaselineAuthorityState, BaselineRefusal>;
      readonly growth: ReturnType<typeof baselineGrowth>;
    }
  | { readonly kind: "existing"; readonly refusal: BaselineRefusal };

type AcceptedBaselineStateSelection =
  | { readonly kind: "skip" }
  | {
      readonly kind: "accepted";
      readonly state: Exclude<BaselineAuthorityState, BaselineRefusal>;
    };

function acceptedBaselineState(state: BaselineAuthorityState): AcceptedBaselineStateSelection {
  return Match.value(state).pipe(
    Match.when({ kind: "baseline-refusal" }, () => ({ kind: "skip" as const })),
    Match.when({ kind: "explicit-empty" }, (accepted) => ({
      kind: "accepted" as const,
      state: accepted,
    })),
    Match.when({ kind: "explicit-debt" }, (accepted) => ({
      kind: "accepted" as const,
      state: accepted,
    })),
    Match.exhaustive
  );
}

function baselineIntegrityStateDecision(
  ruleId: string,
  state: Exclude<BaselineAuthorityState, BaselineRefusal>,
  before:
    | { readonly ok: true; readonly document: ParsedBaselineDocument }
    | { readonly ok: false; readonly refusal: BaselineRefusal },
  baseRuleIds: ReadonlySet<string>,
  mergeBase: string
): BaselineIntegrityStateDecision {
  return Match.value(before).pipe(
    Match.when({ ok: false }, ({ refusal }) => ({ kind: "refused" as const, refusal })),
    Match.when({ ok: true }, ({ document }) =>
      baselineGrowthDecision(ruleId, state, document, baseRuleIds, mergeBase)
    ),
    Match.exhaustive
  );
}

function baselineGrowthDecision(
  ruleId: string,
  state: Exclude<BaselineAuthorityState, BaselineRefusal>,
  previous: ParsedBaselineDocument,
  baseRuleIds: ReadonlySet<string>,
  mergeBase: string
): BaselineIntegrityStateDecision {
  const growth = baselineGrowth(acceptedBaselineDocument(state), previous);
  return Match.value(growth.added.length).pipe(
    Match.when(0, () => ({ kind: "skip" as const })),
    Match.orElse(() =>
      existingOrIntroducedBaselineGrowthDecision(ruleId, state, growth, baseRuleIds, mergeBase)
    )
  );
}

function existingOrIntroducedBaselineGrowthDecision(
  ruleId: string,
  state: Exclude<BaselineAuthorityState, BaselineRefusal>,
  growth: ReturnType<typeof baselineGrowth>,
  baseRuleIds: ReadonlySet<string>,
  mergeBase: string
): BaselineIntegrityStateDecision {
  return Match.value(baseRuleIds.has(ruleId)).pipe(
    Match.when(false, () => ({ kind: "introduced" as const, state, growth })),
    Match.when(true, () => ({
      kind: "existing" as const,
      refusal: {
        kind: "baseline-refusal" as const,
        ruleId,
        path: state.path,
        reason: "baseline-growth-existing-rule" as const,
        addedKeys: growth.added.map(({ key }) => key),
        message: existingRuleBaselineGrowthMessage(
          ruleId,
          growth.kind,
          occurrenceCount(growth.added),
          mergeBase
        ),
      },
    })),
    Match.exhaustive
  );
}

const baselineIntegrityRefusalsForStateEffect = Effect.fn("baseline.integrityRefusalsForState")(
  function* (
    base: string,
    mergeBase: string,
    ruleId: string,
    state: BaselineAuthorityState,
    baseRuleIds: ReadonlySet<string>,
    context: RequiredBaselineAuthorityContext
  ) {
    const accepted = acceptedBaselineState(state);
    return yield* Match.value(accepted).pipe(
      Match.when({ kind: "skip" }, () => Effect.succeed([])),
      Match.when({ kind: "accepted" }, ({ state: acceptedState }) =>
        compareAcceptedBaselineStateEffect(
          base,
          mergeBase,
          ruleId,
          acceptedState,
          baseRuleIds,
          context
        )
      ),
      Match.exhaustive
    );
  }
);

const compareAcceptedBaselineStateEffect = Effect.fn("baseline.compareAcceptedState")(function* (
  base: string,
  mergeBase: string,
  ruleId: string,
  state: Exclude<BaselineAuthorityState, BaselineRefusal>,
  baseRuleIds: ReadonlySet<string>,
  context: RequiredBaselineAuthorityContext
) {
  const before = yield* loadBaseBaselineDocumentEffect(mergeBase, ruleId, state.path, context);
  const decision = baselineIntegrityStateDecision(ruleId, state, before, baseRuleIds, mergeBase);
  return yield* Match.value(decision).pipe(
    Match.when({ kind: "skip" }, () => Effect.succeed([])),
    Match.when({ kind: "refused" }, ({ refusal }) => Effect.succeed([refusal])),
    Match.when({ kind: "existing" }, ({ refusal }) => Effect.succeed([refusal])),
    Match.when({ kind: "introduced" }, ({ state: introduced, growth }) =>
      admitIntroducedBaselineIntegrityEffect(ruleId, base, introduced, growth, context)
    ),
    Match.exhaustive
  );
});

const admitIntroducedBaselineIntegrityEffect = Effect.fn("baseline.admitIntroducedIntegrity")(
  function* (
    ruleId: string,
    base: string,
    state: Exclude<BaselineAuthorityState, BaselineRefusal>,
    growth: ReturnType<typeof baselineGrowth>,
    context: RequiredBaselineAuthorityContext
  ) {
    const manifest = yield* admitRuleIntroductionManifestEffect(
      ruleId,
      growth.added,
      base,
      state.path,
      context
    );
    return Match.value(manifest).pipe(
      Match.when({ ok: true }, () => []),
      Match.when({ ok: false }, ({ refusal }) => [refusal]),
      Match.exhaustive
    );
  }
);

/** Projects baseline refusals into diagnostics for the built-in integrity rule. */
export const baselineIntegrityFindingsEffect = Effect.fn("baseline.integrityFindings")(
  (result: BaselineIntegrityResult) =>
    Effect.succeed(
      Match.value(result).pipe(
        Match.when({ status: "accepted" }, () => []),
        Match.when({ status: "refused" }, ({ refusals }) => refusals.map(findingFromRefusal)),
        Match.exhaustive
      )
    )
);

/** Admits a baseline authoring write only when rule-introduction authority exactly matches it. */
export const guardBaselineExpansionEffect = Effect.fn("baseline.guardExpansion")(function* (
  ruleId: string,
  keys: readonly string[],
  base = "main",
  options: BaselineAuthorityContext
) {
  const context = yield* resolveBaselineAuthorityContext(options);
  const occurrences = countOccurrences(keys);
  const requestedCount = occurrenceCount(occurrences);
  const occurrenceSuffix = Match.value(requestedCount).pipe(
    Match.when(1, () => ""),
    Match.orElse(() => "s")
  );
  const mb = yield* mergeBaseEffect(base, context);
  const baselinePath = baselineContractPathForRule(ruleId, context);
  return yield* Match.value(mb).pipe(
    Match.when(Match.undefined, () =>
      Effect.succeed(
        expansionRefusal({
          kind: "baseline-refusal",
          ruleId,
          path: baselinePath,
          reason: "comparison-base-unavailable",
          message: `Refusing baseline write for '${ruleId}': unable to resolve comparison base '${base}'.`,
        })
      )
    ),
    Match.orElse((mergeBase) =>
      guardBaselineExpansionAgainstBaseEffect(
        ruleId,
        occurrences,
        requestedCount,
        occurrenceSuffix,
        base,
        baselinePath,
        mergeBase,
        context
      )
    )
  );
});

const guardBaselineExpansionAgainstBaseEffect = Effect.fn("baseline.guardExpansionAgainstBase")(
  function* (
    ruleId: string,
    occurrences: readonly BaselineOccurrence[],
    requestedCount: number,
    occurrenceSuffix: string,
    base: string,
    baselinePath: string,
    mergeBase: string,
    context: RequiredBaselineAuthorityContext
  ) {
    const baseRules = yield* loadBaseRuleIdsEffect(mergeBase, context);
    const decision = expansionBaseDecision(
      baseRules,
      ruleId,
      occurrences,
      requestedCount,
      occurrenceSuffix,
      baselinePath,
      mergeBase
    );
    return yield* Match.value(decision).pipe(
      Match.when({ kind: "refused" }, ({ value }) => Effect.succeed(value)),
      Match.when({ kind: "admit" }, () =>
        admitBaselineExpansionEffect(ruleId, occurrences, base, baselinePath, context)
      ),
      Match.exhaustive
    );
  }
);

type ExpansionBaseDecision =
  | { readonly kind: "refused"; readonly value: BaselineExpansionDecision }
  | { readonly kind: "admit" };

function expansionBaseDecision(
  baseRules: { ok: true; ruleIds: Set<string> } | { ok: false; refusal: BaselineRefusal },
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  requestedCount: number,
  occurrenceSuffix: string,
  baselinePath: string,
  mergeBase: string
): ExpansionBaseDecision {
  return Match.value(baseRules).pipe(
    Match.when({ ok: false }, ({ refusal }) => ({
      kind: "refused" as const,
      value: expansionRefusal({
        kind: refusal.kind,
        reason: refusal.reason,
        ruleId,
        path: baselinePath,
        message: `Refusing baseline write for '${ruleId}': ${refusal.message}`,
      }),
    })),
    Match.when({ ok: true }, ({ ruleIds }) =>
      existingRuleExpansionDecision(
        ruleIds,
        ruleId,
        occurrences,
        requestedCount,
        occurrenceSuffix,
        baselinePath,
        mergeBase
      )
    ),
    Match.exhaustive
  );
}

function existingRuleExpansionDecision(
  baseRuleIds: ReadonlySet<string>,
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  requestedCount: number,
  occurrenceSuffix: string,
  baselinePath: string,
  mergeBase: string
): ExpansionBaseDecision {
  return Match.value(baseRuleIds.has(ruleId)).pipe(
    Match.when(false, () => ({ kind: "admit" as const })),
    Match.when(true, () => ({
      kind: "refused" as const,
      value: expansionRefusal({
        kind: "baseline-refusal",
        ruleId,
        path: baselinePath,
        reason: "baseline-growth-existing-rule",
        addedKeys: occurrences.map(({ key }) => key),
        message:
          `Refusing baseline write for existing rule '${ruleId}': ${requestedCount} new ` +
          `diagnostic occurrence${occurrenceSuffix} would grow tracked debt relative to ${mergeBase.slice(0, 9)}.`,
      }),
    })),
    Match.exhaustive
  );
}

const admitBaselineExpansionEffect = Effect.fn("baseline.admitExpansion")(function* (
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  base: string,
  baselinePath: string,
  context: RequiredBaselineAuthorityContext
) {
  const manifest = yield* admitRuleIntroductionManifestEffect(
    ruleId,
    occurrences,
    base,
    baselinePath,
    context
  );
  return Match.value(manifest).pipe(
    Match.when({ ok: false }, ({ refusal }) => expansionRefusal(refusal)),
    Match.when({ ok: true }, () => ({
      status: "accepted" as const,
      ruleId,
      baselinePath,
      occurrences: Array.from(occurrences),
      comparisonBase: base,
      message: `baseline write accepted for introduced rule '${ruleId}'`,
    })),
    Match.exhaustive
  );
});

/** Persists new nonempty baselines as exact counts while retaining the legacy empty lock form. */
export const writeBaselineEffect = Effect.fn("baseline.write")(function* (
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  options: BaselineAuthorityContext
) {
  const context = yield* resolveBaselineAuthorityContext(options);
  const baselinePath = absoluteBaselinePath(baselineContractPathForRule(ruleId, context), context);
  yield* context.fileSystem.makeDirectory(path.dirname(baselinePath));
  yield* context.fileSystem.writeText(baselinePath, renderBaselineDocument(occurrences));
});

function acceptedBaselineDocument(state: Exclude<BaselineAuthorityState, BaselineRefusal>) {
  return Match.value(state).pipe(
    Match.when(
      { kind: "explicit-empty" },
      () => ({ coverage: "key", occurrences: [] }) satisfies ParsedBaselineDocument
    ),
    Match.when(
      { kind: "explicit-debt" },
      (debt) =>
        ({
          coverage: debt.coverage,
          occurrences: debt.occurrences,
        }) satisfies ParsedBaselineDocument
    ),
    Match.exhaustive
  );
}

function baselineGrowth(
  current: ParsedBaselineDocument,
  previous: ParsedBaselineDocument
): {
  readonly kind: "occurrences" | "coverage-broadened";
  readonly added: BaselineOccurrence[];
} {
  const transition = `${current.coverage}:${previous.coverage}` as const;
  return Match.value(transition).pipe(
    Match.when(
      "key:occurrence",
      () =>
        ({
          kind: "coverage-broadened",
          added: current.occurrences,
        }) as const
    ),
    Match.when("key:key", () => baselineKeyGrowth(current, previous)),
    Match.when("occurrence:key", () => baselineKeyGrowth(current, previous)),
    Match.when("occurrence:occurrence", () => baselineOccurrenceGrowth(current, previous)),
    Match.exhaustive
  );
}

function baselineKeyGrowth(
  current: ParsedBaselineDocument,
  previous: ParsedBaselineDocument
): ReturnType<typeof baselineGrowth> {
  const previousKeys = new Set(previous.occurrences.map(({ key }) => key));
  return {
    kind: "occurrences",
    added: current.occurrences.filter(({ key }) => !previousKeys.has(key)),
  };
}

function baselineOccurrenceGrowth(
  current: ParsedBaselineDocument,
  previous: ParsedBaselineDocument
): ReturnType<typeof baselineGrowth> {
  const previousCounts = new Map(
    previous.occurrences.map(({ key, count }) => [key, count] as const)
  );
  return {
    kind: "occurrences",
    added: current.occurrences.flatMap((occurrence) =>
      additionalBaselineOccurrences(occurrence, previousCounts)
    ),
  };
}

function additionalBaselineOccurrences(
  occurrence: BaselineOccurrence,
  previousCounts: ReadonlyMap<string, number>
): BaselineOccurrence[] {
  const additional = occurrence.count - (previousCounts.get(occurrence.key) ?? 0);
  return Match.value(additional > 0).pipe(
    Match.when(false, () => []),
    Match.when(true, () => [{ key: occurrence.key, count: additional }]),
    Match.exhaustive
  );
}

function renderBaselineDocument(occurrences: readonly BaselineOccurrence[]): string {
  const document = Match.value(occurrences.length).pipe(
    Match.when(0, () => []),
    Match.orElse(() => ({ schemaVersion: 1 as const, occurrences }))
  );
  return `${Schema.encodeSync(Schema.parseJson())(document)}\n`;
}

const resolveBaselineAuthorityContext = Effect.fn("baseline.resolveContext")(function* (
  options: BaselineAuthorityContext
) {
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

const readCurrentRuleRegistryEffect = Effect.fn("baseline.readCurrentRuleRegistry")(function* (
  root: string,
  fileSystem: BaselineFileSystemPort
) {
  const parsed = yield* loadRuleRegistryDocumentEffect(path.join(root, ruleRegistryRepoPath), {
    isDirectory: fileSystem.isDirectory,
    readDirectory: fileSystem.readDirectory,
    readText: fileSystem.readText,
  }).pipe(Effect.catchAll(() => Effect.succeed(null)));
  return Match.value(parsed).pipe(
    Match.when(Match.null, () => []),
    Match.orElse((registry) => baselineRuleContractFacts(registry.rules))
  );
});

function baselineRuleContractFacts(
  rules: Parameters<typeof ruleSelectorFacts>[0]
): BaselineRuleContractInput[] {
  const selectorsByRuleId = new Map(ruleSelectorFacts(rules).map((fact) => [fact.id, fact]));
  return ruleBaselineFacts(rules).map((fact) => baselineRuleContractFact(fact, selectorsByRuleId));
}

function baselineRuleContractFact(
  fact: ReturnType<typeof ruleBaselineFacts>[number],
  selectorsByRuleId: ReadonlyMap<string, ReturnType<typeof ruleSelectorFacts>[number]>
): BaselineRuleContractInput {
  return Match.value(selectorsByRuleId.get(fact.id)).pipe(
    Match.when(Match.undefined, () => fact),
    Match.orElse((selected) => ({
      ...fact,
      ownerProject: selected.ownerProject,
      runner: selected.runner.name,
    }))
  );
}

const parseBaselineFileEffect = Effect.fn("baseline.parseFile")(function* (
  filePath: string,
  ruleId: string,
  context: RequiredBaselineAuthorityContext
) {
  const raw = yield* context.fileSystem.readText(filePath).pipe(Effect.either);
  return yield* Either.match(raw, {
    onLeft: (error) =>
      Effect.succeed(malformedBaselineFileRefusal(filePath, ruleId, error, context)),
    onRight: (contents) => decodeBaselineFileEffect(filePath, ruleId, contents, context),
  });
});

const decodeBaselineFileEffect = Effect.fn("baseline.decodeFile")(function* (
  filePath: string,
  ruleId: string,
  contents: string,
  context: RequiredBaselineAuthorityContext
) {
  const decoded = yield* Schema.decodeUnknown(Schema.parseJson())(contents).pipe(Effect.either);
  return Either.match(decoded, {
    onLeft: (error) => malformedBaselineFileRefusal(filePath, ruleId, error, context),
    onRight: (value) => parsedBaselineFileState(filePath, ruleId, value, context),
  });
});

function malformedBaselineFileRefusal(
  filePath: string,
  ruleId: string,
  error: unknown,
  context: RequiredBaselineAuthorityContext
): BaselineRefusal {
  const authorityPath = toAuthorityRelative(filePath, context);
  return {
    kind: "baseline-refusal",
    ruleId,
    path: authorityPath,
    reason: "malformed-baseline",
    message: `Baseline '${authorityPath}' is not readable JSON: ${errorMessage(error)}.`,
  };
}

function parsedBaselineFileState(
  filePath: string,
  ruleId: string,
  value: unknown,
  context: RequiredBaselineAuthorityContext
): BaselineAuthorityState {
  const authorityPath = toAuthorityRelative(filePath, context);
  const parsed = parseBaselineDocument(value, authorityPath, ruleId);
  return Match.value(parsed).pipe(
    Match.when({ ok: false }, ({ refusal }) => refusal),
    Match.when({ ok: true }, ({ document }) =>
      baselineStateFromParsedDocument(ruleId, authorityPath, document)
    ),
    Match.exhaustive
  );
}

function baselineStateFromParsedDocument(
  ruleId: string,
  authorityPath: string,
  document: ParsedBaselineDocument
): BaselineAuthorityState {
  return Match.value(document.occurrences.length).pipe(
    Match.when(0, () => ({
      kind: "explicit-empty" as const,
      ruleId,
      path: authorityPath,
      locked: true as const,
      keys: [] as [],
    })),
    Match.orElse(() => ({
      kind: "explicit-debt" as const,
      ruleId,
      path: authorityPath,
      locked: false as const,
      coverage: document.coverage,
      occurrences: document.occurrences,
    }))
  );
}

function fileExists(filePath: string, context: RequiredBaselineAuthorityContext) {
  return context.fileSystem.isFile(filePath).pipe(Effect.catchAll(() => Effect.succeed(false)));
}

function directoryExists(directoryPath: string, context: RequiredBaselineAuthorityContext) {
  return context.fileSystem
    .isDirectory(directoryPath)
    .pipe(Effect.catchAll(() => Effect.succeed(false)));
}

const mergeBaseEffect = Effect.fn("baseline.resolveMergeBase")(function* (
  base: string,
  context: RequiredBaselineAuthorityContext
) {
  for (const ref of [base, `origin/${base}`]) {
    const mb = yield* context.git.mergeBase(ref, { cwd: context.repoRoot });
    if (mb) return mb;
  }
  return undefined;
});

const loadBaseRuleIdsEffect = Effect.fn("baseline.loadBaseRuleIds")(function* (
  mb: string,
  context: RequiredBaselineAuthorityContext
) {
  const registryPath = ruleRegistryRepoPath;
  const rulePackAtBase = yield* gitShowMovedAuthoredArtifactEffect(
    mb,
    `${registryPath}/rules.json`,
    preD14aAuthoredAuthorityPaths.ruleRegistry,
    context
  );
  return yield* Match.value(rulePackAtBase).pipe(
    Match.when(Match.null, () => loadDirectoryBaseRuleIdsEffect(mb, registryPath, context)),
    Match.orElse(({ contents }) => decodeBaseRuleIdsEffect(mb, registryPath, contents))
  );
});

type BaseRuleIdsResult =
  | { readonly ok: true; readonly ruleIds: Set<string> }
  | { readonly ok: false; readonly refusal: BaselineRefusal };

const loadDirectoryBaseRuleIdsEffect = Effect.fn("baseline.loadDirectoryBaseRuleIds")(function* (
  mergeBase: string,
  registryPath: string,
  context: RequiredBaselineAuthorityContext
) {
  const ruleIds = yield* loadBaseRuleIdsFromDirectoryEffect(mergeBase, registryPath, context);
  return Match.value(ruleIds).pipe(
    Match.when(Match.undefined, () => missingBaseRuleRegistry(mergeBase, registryPath)),
    Match.orElse((ids) => ({ ok: true as const, ruleIds: ids }))
  );
});

const decodeBaseRuleIdsEffect = Effect.fn("baseline.decodeBaseRuleIds")(function* (
  mergeBase: string,
  registryPath: string,
  contents: string
) {
  const decoded = yield* Schema.decodeUnknown(Schema.parseJson())(contents).pipe(Effect.either);
  return Either.match(decoded, {
    onLeft: (error) => malformedBaseRuleRegistry(mergeBase, registryPath, errorMessage(error)),
    onRight: (parsedRaw) => parsedBaseRuleIds(mergeBase, registryPath, parsedRaw),
  });
});

function missingBaseRuleRegistry(mergeBase: string, registryPath: string): BaseRuleIdsResult {
  return {
    ok: false,
    refusal: {
      kind: "baseline-refusal",
      path: registryPath,
      reason: "base-rule-registry-missing",
      message: `Unable to read base rule registry at ${mergeBase.slice(0, 9)}.`,
    },
  };
}

const loadBaseRuleIdsFromDirectoryEffect = Effect.fn("baseline.loadBaseRuleDirectory")(function* (
  mb: string,
  registryPath: string,
  context: RequiredBaselineAuthorityContext
) {
  const lines = yield* context.git.lsTreeNameOnly(mb, registryPath, { cwd: context.repoRoot });
  return yield* Match.value(lines).pipe(
    Match.when(Match.null, () => Effect.succeed(undefined)),
    Match.orElse((entries) =>
      loadBaseRuleIdsFromManifestPathsEffect(
        mb,
        baseRuleManifestPaths(entries, registryPath),
        context
      )
    )
  );
});

function baseRuleManifestPaths(lines: readonly string[], registryPath: string): string[] {
  return lines
    .filter((line) => line.startsWith(`${registryPath}/`))
    .filter((line) => line.endsWith("/rule.json"))
    .sort();
}

const loadBaseRuleIdsFromManifestPathsEffect = Effect.fn("baseline.loadBaseRuleManifests")(
  function* (
    mergeBase: string,
    manifestPaths: readonly string[],
    context: RequiredBaselineAuthorityContext
  ) {
    const ids = yield* Effect.forEach(manifestPaths, (manifestPath) =>
      context.git
        .show(mergeBase, manifestPath, { cwd: context.repoRoot })
        .pipe(Effect.map(baseRuleIdFromManifestTextOrMissing))
    );
    return admittedBaseRuleIdSet(ids);
  }
);

function baseRuleIdFromManifestTextOrMissing(raw: string | null): string | undefined {
  return Match.value(raw).pipe(
    Match.when(Match.null, () => undefined),
    Match.orElse(baseRuleIdFromManifestText)
  );
}

function admittedBaseRuleIdSet(ids: readonly (string | undefined)[]): Set<string> | undefined {
  return Match.value(ids.some((id) => id === undefined)).pipe(
    Match.when(true, () => undefined),
    Match.when(false, () =>
      nonemptyBaseRuleIdSet(ids.filter((id): id is string => id !== undefined))
    ),
    Match.exhaustive
  );
}

function nonemptyBaseRuleIdSet(ids: readonly string[]): Set<string> | undefined {
  return Match.value(ids.length).pipe(
    Match.when(0, () => undefined),
    Match.orElse(() => new Set(ids))
  );
}

function baseRuleIdFromManifestText(raw: string): string | undefined {
  const decoded = Schema.decodeUnknownEither(Schema.parseJson())(raw);
  return Either.match(decoded, {
    onLeft: () => undefined,
    onRight: baseRuleIdFromManifest,
  });
}

const loadBaseBaselineDocumentEffect = Effect.fn("baseline.loadBaseDocument")(function* (
  mb: string,
  ruleId: string,
  baselinePath: string,
  context: RequiredBaselineAuthorityContext
) {
  const beforeRaw = yield* gitShowMovedAuthoredArtifactEffect(
    mb,
    baselinePath,
    preD14aAuthoredAuthorityPaths.baseline(ruleId),
    context
  );
  return yield* Match.value(beforeRaw).pipe(
    Match.when(Match.null, () => Effect.succeed(emptyBaseBaselineDocument())),
    Match.orElse(({ contents }) =>
      decodeBaseBaselineDocumentEffect(mb, ruleId, baselinePath, contents)
    )
  );
});

const decodeBaseBaselineDocumentEffect = Effect.fn("baseline.decodeBaseDocument")(function* (
  mergeBase: string,
  ruleId: string,
  baselinePath: string,
  contents: string
) {
  const decoded = yield* Schema.decodeUnknown(Schema.parseJson())(contents).pipe(Effect.either);
  return Either.match(decoded, {
    onLeft: (error) => unreadableBaseBaseline(mergeBase, ruleId, baselinePath, errorMessage(error)),
    onRight: (value) => parsedBaseBaseline(ruleId, baselinePath, value),
  });
});

function emptyBaseBaselineDocument(): {
  readonly ok: true;
  readonly document: ParsedBaselineDocument;
} {
  return { ok: true, document: { coverage: "key", occurrences: [] } };
}

const gitShowMovedAuthoredArtifactEffect = Effect.fn("baseline.showMovedArtifact")(function* (
  ref: string,
  currentRepoPath: string,
  previousRepoPath: string,
  context: RequiredBaselineAuthorityContext
) {
  const current = yield* context.git.show(ref, currentRepoPath, { cwd: context.repoRoot });
  if (current !== null) return { contents: current };

  const previous = yield* context.git.show(ref, previousRepoPath, { cwd: context.repoRoot });
  return Match.value(previous).pipe(
    Match.when(Match.null, () => null),
    Match.orElse((contents) => ({ contents }))
  );
});

function baseRuleIdsFromHistoricalRegistry(value: unknown): Set<string> | undefined {
  if (!value || typeof value !== "object" || !("rules" in value)) return undefined;
  const rules = (value as { rules: unknown }).rules;
  if (!Array.isArray(rules)) return undefined;

  const ruleIds: string[] = [];
  for (const rule of rules) {
    if (!rule || typeof rule !== "object" || !("id" in rule)) return undefined;
    const id = (rule as { id: unknown }).id;
    if (typeof id !== "string" || id.length === 0) return undefined;
    ruleIds.push(id);
  }
  return new Set(ruleIds);
}

function existingRuleBaselineGrowthMessage(
  ruleId: string,
  kind: "occurrences" | "coverage-broadened",
  addedCount: number,
  mergeBase: string
): string {
  const occurrenceSuffix = Match.value(addedCount).pipe(
    Match.when(1, () => ""),
    Match.orElse(() => "s")
  );
  const growth = Match.value(kind).pipe(
    Match.when(
      "coverage-broadened",
      () =>
        `baseline for existing rule '${ruleId}' broadened exact occurrence coverage to unbounded key coverage `
    ),
    Match.when(
      "occurrences",
      () =>
        `baseline for existing rule '${ruleId}' grew by ${addedCount} diagnostic occurrence${occurrenceSuffix} `
    ),
    Match.exhaustive
  );
  return `${growth}relative to merge-base ${mergeBase.slice(0, 9)}; baselines are shrink-only outside rule-introduction changes`;
}

function parsedBaseRuleIds(
  mergeBase: string,
  registryPath: string,
  parsedRaw: unknown
): { ok: true; ruleIds: Set<string> } | { ok: false; refusal: BaselineRefusal } {
  const parsed = parseRuleRegistryDocument(parsedRaw, registryPath);
  return Match.value(parsed).pipe(
    Match.when({ ok: true }, ({ document }) => ({
      ok: true as const,
      ruleIds: new Set(document.rules.map((rule) => rule.id)),
    })),
    Match.when({ ok: false }, ({ issues }) =>
      historicalBaseRuleIdsResult(mergeBase, registryPath, parsedRaw, issues)
    ),
    Match.exhaustive
  );
}

function historicalBaseRuleIdsResult(
  mergeBase: string,
  registryPath: string,
  parsedRaw: unknown,
  issues: readonly { readonly path: string; readonly message: string }[]
): BaseRuleIdsResult {
  const historical = baseRuleIdsFromHistoricalRegistry(parsedRaw);
  return Match.value(historical).pipe(
    Match.when(Match.undefined, () =>
      malformedBaseRuleRegistry(
        mergeBase,
        registryPath,
        issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ")
      )
    ),
    Match.orElse((ruleIds) => ({ ok: true as const, ruleIds }))
  );
}

function malformedBaseRuleRegistry(
  mergeBase: string,
  registryPath: string,
  detail: string
): { ok: false; refusal: BaselineRefusal } {
  return {
    ok: false,
    refusal: {
      kind: "baseline-refusal",
      path: registryPath,
      reason: "base-rule-registry-malformed",
      message: `Unable to parse base rule registry at ${mergeBase.slice(0, 9)}: ${detail}`,
    },
  };
}

function orphanBaselineRefusals(
  entries: readonly BaselineDirectoryEntry[],
  registered: ReadonlySet<string>,
  baselinesDir: string
): BaselineRefusal[] {
  return entries
    .filter((entry) => entry.kind === "file" && entry.name.endsWith(".json"))
    .map((entry) => ({ entry, ruleId: entry.name.replace(/\.json$/, "") }))
    .filter(({ ruleId }) => !registered.has(ruleId))
    .map(({ entry, ruleId }) => ({
      kind: "baseline-refusal",
      ruleId,
      path: path.join(baselinesDir, entry.name),
      reason: "orphan-baseline",
      message: `Baseline file '${entry.name}' has no registered Habitat rule.`,
    }));
}

function baseRuleIdFromManifest(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const id = (value as { id?: unknown }).id;
  if (typeof id !== "string" || id.length === 0) return undefined;
  return id;
}

function parsedBaseBaseline(
  ruleId: string,
  baselinePath: string,
  value: unknown
): { ok: true; document: ParsedBaselineDocument } | { ok: false; refusal: BaselineRefusal } {
  const parsed = parseBaselineDocument(value, baselinePath, ruleId);
  if (parsed.ok) return { ok: true, document: parsed.document };
  return {
    ok: false,
    refusal: {
      kind: parsed.refusal.kind,
      ruleId: parsed.refusal.ruleId,
      path: parsed.refusal.path,
      reason: "base-baseline-unreadable",
      message: parsed.refusal.message,
    },
  };
}

function unreadableBaseBaseline(
  mergeBase: string,
  ruleId: string,
  baselinePath: string,
  detail: string
): { ok: false; refusal: BaselineRefusal } {
  return {
    ok: false,
    refusal: {
      kind: "baseline-refusal",
      ruleId,
      path: baselinePath,
      reason: "base-baseline-unreadable",
      message: `Unable to read base baseline for '${ruleId}' at ${mergeBase.slice(0, 9)}: ${detail}`,
    },
  };
}

function baselineIntegrityResult(refusals: readonly BaselineRefusal[]): BaselineIntegrityResult {
  return Match.value(refusals.length).pipe(
    Match.when(0, () => ({ status: "accepted" as const, refusals: [] as [] })),
    Match.orElse(() => refused(Array.from(refusals)))
  );
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
  return Match.value(path.isAbsolute(baselinePath)).pipe(
    Match.when(true, () => baselinePath),
    Match.when(false, () => path.join(context.repoRoot, baselinePath)),
    Match.exhaustive
  );
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function toAuthorityRelative(filePath: string, context: { readonly repoRoot: string }): string {
  return externalSourceFilePath(
    path.relative(context.repoRoot, path.resolve(filePath)).split(path.sep).join("/")
  );
}
