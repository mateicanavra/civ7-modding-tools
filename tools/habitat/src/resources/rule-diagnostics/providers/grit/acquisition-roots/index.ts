import path from "node:path";
import { FileSystem } from "@effect/platform";
import {
  type DiagnosticAcquisitionRootRefusal,
  parseDiagnosticSelectedAcquisitionRoots,
} from "@habitat/cli/service/model/diagnostics/index";
import {
  decideAcquisitionRootProtection,
  hostGeneratedSurfaceDeclarations,
} from "@habitat/cli/service/model/host/index";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Either, Match, Option } from "effect";
import { protectedAcquisitionRootPrefixes } from "../constants.js";
import { pathIsWithinRoot } from "../path.js";
import {
  deriveExactCoverageTraversalRoots,
  discoverExactCoverageInventoryEffect,
  type ExactCoverageInventory,
  selectExactCoverageEntries,
} from "./exact-coverage.js";

interface CanonicalAcquisitionRootDecisionOptions {
  readonly repoRoot: string;
  readonly approvedAcquisitionRoots: readonly string[];
}

export type PlannedGritRule =
  | {
      readonly kind: "execute";
      readonly rule: RuleGritFacts;
      readonly repoRoot: string;
      readonly roots: readonly [string, ...string[]];
    }
  | {
      readonly kind: "not-applicable";
      readonly rule: RuleGritFacts;
      readonly reason: "no-matched-acquisition-roots";
    }
  | {
      readonly kind: "refused";
      readonly rule: RuleGritFacts;
      readonly decision: DiagnosticAcquisitionRootRefusal;
    }
  | {
      readonly kind: "failed";
      readonly rule: RuleGritFacts;
      readonly failure: "DiagnosticScopePlanningFailed";
      readonly detail: string;
    };

type PreparedGritRule =
  | {
      readonly kind: "exact-check";
      readonly rule: RuleGritFacts;
      readonly repoRoot: string;
      readonly authorityRoots: readonly [string, ...string[]];
      readonly traversalRoots: readonly [string, ...string[]];
      readonly patterns: readonly string[];
    }
  | { readonly kind: "complete"; readonly plan: PlannedGritRule };

export const planGritRuleAcquisitions = Effect.fn("grit.acquisitionRoots.plan")(function* (
  selectedRules: readonly RuleGritFacts[],
  options: { readonly repoRoot: string; readonly acquisitionRoots?: readonly string[] }
) {
  const fs = yield* FileSystem.FileSystem;
  const canonicalRepo = yield* Effect.either(fs.realPath(options.repoRoot));
  return yield* Match.value(canonicalRepo).pipe(
    Match.when({ _tag: "Left" }, ({ left }) =>
      Effect.succeed(
        selectedRules.map((rule) =>
          rootCanonicalizationFailure(
            rule,
            `Repository root ${options.repoRoot} could not be canonicalized: ${String(left)}.`
          )
        )
      )
    ),
    Match.when({ _tag: "Right" }, ({ right }) =>
      planRulesForCanonicalRepoEffect(selectedRules, right, options.acquisitionRoots, fs)
    ),
    Match.exhaustive
  );
});

const planRulesForCanonicalRepoEffect = Effect.fn("grit.acquisitionRoots.planCanonicalRepo")(
  function* (
    selectedRules: readonly RuleGritFacts[],
    canonicalRepo: string,
    requestedRoots: readonly string[] | undefined,
    fs: FileSystem.FileSystem
  ) {
    const prepared = yield* Effect.forEach(
      selectedRules,
      (rule) => prepareGritRuleRootEffect(rule, canonicalRepo, requestedRoots, fs),
      { concurrency: 1 }
    );
    const exactTraversalRoots = prepared.flatMap((entry) =>
      entry.kind === "exact-check" ? entry.traversalRoots : []
    );
    if (exactTraversalRoots.length === 0) return prepared.map(completedPreparedPlan);

    const inventory = yield* discoverExactCoverageInventoryEffect(
      exactTraversalRoots,
      protectedExactCoverageRoots(canonicalRepo),
      fs
    );
    return prepared.map((entry) => finalizePreparedGritRule(entry, inventory));
  }
);

const prepareGritRuleRootEffect = Effect.fn("grit.acquisitionRoot.prepareRule")(function* (
  rule: RuleGritFacts,
  canonicalRepo: string,
  requestedRoots: readonly string[] | undefined,
  fs: FileSystem.FileSystem
) {
  const exactCheck = exactCheckCoveragePatterns(rule);
  const candidates = candidateAcquisitionRoots(
    canonicalRepo,
    rule.runner.acquisition.roots,
    requestedRoots,
    Option.isSome(exactCheck)
  );
  const lexicalRoots = sortedUnique(candidates).map((candidate) => ({
    candidate,
    absolute: path.resolve(canonicalRepo, candidate),
  }));
  const observations = yield* Effect.forEach(
    lexicalRoots,
    (root) =>
      canonicalizeRootEffect(
        rule,
        canonicalRepo,
        root,
        missingAcquisitionRootPolicy(
          root.candidate,
          rule.runner.acquisition.roots,
          requestedRoots,
          exactCheck
        ),
        fs
      ),
    { concurrency: 1 }
  );
  const authorityPlan = completeRootPlan(rule, canonicalRepo, observations);
  if (Option.isNone(exactCheck) || authorityPlan.kind !== "execute") {
    return { kind: "complete", plan: authorityPlan } satisfies PreparedGritRule;
  }
  const symlink = observations.find(isCanonicalSymlinkObservation);
  if (symlink) {
    return {
      kind: "complete",
      plan: rootCanonicalizationFailure(
        rule,
        `Exact coverage authority root ${symlink.candidate} is a symbolic link; exact check acquisition accepts canonical regular files and directories only.`
      ),
    } satisfies PreparedGritRule;
  }
  const traversalRoots = deriveExactCoverageTraversalRoots(
    canonicalRepo,
    authorityPlan.roots,
    exactCheck.value
  );
  const traversalRefusal = traversalRoots
    .map((root) =>
      canonicalAcquisitionRootRefusal(root, {
        repoRoot: canonicalRepo,
        approvedAcquisitionRoots: rule.runner.acquisition.roots,
      })
    )
    .find((decision): decision is DiagnosticAcquisitionRootRefusal => decision !== null);
  if (traversalRefusal) {
    return {
      kind: "complete",
      plan: { kind: "refused", rule, decision: traversalRefusal },
    } satisfies PreparedGritRule;
  }
  const [firstTraversalRoot, ...remainingTraversalRoots] = traversalRoots;
  if (firstTraversalRoot === undefined) {
    return {
      kind: "complete",
      plan: noMatchedAcquisitionRootsPlan(rule),
    } satisfies PreparedGritRule;
  }
  return {
    kind: "exact-check",
    rule,
    repoRoot: canonicalRepo,
    authorityRoots: authorityPlan.roots,
    traversalRoots: [firstTraversalRoot, ...remainingTraversalRoots],
    patterns: exactCheck.value,
  } satisfies PreparedGritRule;
});

type CanonicalRootObservation =
  | {
      readonly kind: "canonical";
      readonly root: string;
      readonly candidate: string;
      readonly throughSymlink: boolean;
    }
  | { readonly kind: "omitted" }
  | { readonly kind: "terminal"; readonly plan: PlannedGritRule };

type RootProbeObservation =
  | { readonly kind: "canonicalize" }
  | { readonly kind: "omitted" }
  | { readonly kind: "terminal"; readonly plan: PlannedGritRule };

function finalizePreparedGritRule(
  prepared: PreparedGritRule,
  inventory: ExactCoverageInventory
): PlannedGritRule {
  if (prepared.kind === "complete") return prepared.plan;
  if (inventory.kind === "failed") {
    return rootCanonicalizationFailure(prepared.rule, inventory.detail);
  }
  const discovery = selectExactCoverageEntries(
    prepared.repoRoot,
    prepared.authorityRoots,
    prepared.patterns,
    inventory
  );
  if (discovery.symlinks.length > 0) {
    return exactCoverageSymlinkFailure(prepared.rule, prepared.repoRoot, discovery.symlinks);
  }
  if (discovery.files.length === 0) return noMatchedAcquisitionRootsPlan(prepared.rule);
  return admittedRootPlan(prepared.rule, prepared.repoRoot, discovery.files);
}

const canonicalizeRootEffect = Effect.fn("grit.acquisitionRoot.canonicalize")(function* (
  rule: RuleGritFacts,
  canonicalRepo: string,
  root: { readonly candidate: string; readonly absolute: string },
  missing: "omit" | "refuse",
  fs: FileSystem.FileSystem
) {
  return yield* Match.value(lexicalRootObservation(rule, canonicalRepo, root)).pipe(
    Match.when({ kind: "terminal" }, (terminal) => Effect.succeed(terminal)),
    Match.when({ kind: "probe" }, () => probeRootEffect(rule, root, missing, fs)),
    Match.exhaustive
  );
});

function lexicalRootObservation(
  rule: RuleGritFacts,
  canonicalRepo: string,
  root: { readonly candidate: string; readonly absolute: string }
) {
  return Match.value(pathIsWithinRoot(root.absolute, canonicalRepo)).pipe(
    Match.when(false, () => ({
      kind: "terminal" as const,
      plan: {
        kind: "refused" as const,
        rule,
        decision: {
          kind: "refused" as const,
          reason: "outside-repo" as const,
          root: root.candidate,
        },
      } satisfies PlannedGritRule,
    })),
    Match.orElse(() => ({ kind: "probe" as const }))
  );
}

const probeRootEffect = Effect.fn("grit.acquisitionRoot.probe")(function* (
  rule: RuleGritFacts,
  root: { readonly candidate: string; readonly absolute: string },
  missing: "omit" | "refuse",
  fs: FileSystem.FileSystem
) {
  const existence = yield* Effect.either(fs.exists(root.absolute));
  return yield* Match.value(rootProbeObservation(rule, root, existence, missing)).pipe(
    Match.when({ kind: "terminal" }, (terminal) => Effect.succeed(terminal)),
    Match.when({ kind: "omitted" }, (omitted) => Effect.succeed(omitted)),
    Match.when({ kind: "canonicalize" }, () => canonicalizeExistingRootEffect(rule, root, fs)),
    Match.exhaustive
  );
});

function rootProbeObservation<E>(
  rule: RuleGritFacts,
  root: { readonly candidate: string; readonly absolute: string },
  existence: Either.Either<boolean, E>,
  missing: "omit" | "refuse"
): RootProbeObservation {
  return Either.match(existence, {
    onLeft: (left) => ({
      kind: "terminal" as const,
      plan: rootCanonicalizationFailure(
        rule,
        `Acquisition root ${root.candidate} could not be probed: ${String(left)}.`
      ),
    }),
    onRight: (exists) => rootExistenceObservation(rule, root.candidate, exists, missing),
  });
}

function rootExistenceObservation(
  rule: RuleGritFacts,
  candidate: string,
  exists: boolean,
  missing: "omit" | "refuse"
): RootProbeObservation {
  return Match.value({ exists, missing }).pipe(
    Match.when({ exists: true }, () => ({ kind: "canonicalize" as const })),
    Match.when({ missing: "omit" }, () => ({ kind: "omitted" as const })),
    Match.orElse(
      (): RootProbeObservation => ({
        kind: "terminal",
        plan: {
          kind: "refused",
          rule,
          decision: { kind: "refused", reason: "missing", root: candidate },
        },
      })
    )
  );
}

function missingAcquisitionRootPolicy(
  candidate: string,
  declaredRoots: readonly string[],
  requestedRoots: readonly string[] | undefined,
  exactCheck: Option.Option<readonly string[]>
): "omit" | "refuse" {
  if (Option.isNone(exactCheck) || requestedRoots === undefined) return "refuse";
  const normalizedCandidate = normalizeRepoRelativeAuthority(candidate);
  return declaredRoots.some((root) => normalizeRepoRelativeAuthority(root) === normalizedCandidate)
    ? "refuse"
    : "omit";
}

const canonicalizeExistingRootEffect = Effect.fn("grit.acquisitionRoot.realPath")(function* (
  rule: RuleGritFacts,
  root: { readonly candidate: string; readonly absolute: string },
  fs: FileSystem.FileSystem
) {
  const canonical = yield* Effect.either(fs.realPath(root.absolute));
  return canonicalRootObservation(rule, root, canonical);
});

function canonicalRootObservation<E>(
  rule: RuleGritFacts,
  root: { readonly candidate: string; readonly absolute: string },
  canonical: Either.Either<string, E>
): CanonicalRootObservation {
  return Either.match(canonical, {
    onLeft: (left) => ({
      kind: "terminal" as const,
      plan: rootCanonicalizationFailure(
        rule,
        `Acquisition root ${root.candidate} could not be canonicalized: ${String(left)}.`
      ),
    }),
    onRight: (right) => ({
      kind: "canonical" as const,
      root: right,
      candidate: root.candidate,
      throughSymlink: right !== path.resolve(root.absolute),
    }),
  });
}

function completeRootPlan(
  rule: RuleGritFacts,
  canonicalRepo: string,
  observations: readonly CanonicalRootObservation[]
): PlannedGritRule {
  const material = observations.filter((observation) => observation.kind !== "omitted");
  const terminal = material.find(isTerminalRootObservation);
  return Match.value({
    empty: material.length === 0,
    terminal: Option.fromNullable(terminal),
  }).pipe(
    Match.when({ empty: true }, () => noMatchedAcquisitionRootsPlan(rule)),
    Match.when({ terminal: { _tag: "Some" } }, ({ terminal: blocked }) => blocked.value.plan),
    Match.orElse(() =>
      admittedRootPlan(
        rule,
        canonicalRepo,
        material.filter(isCanonicalRootObservation).map(({ root }) => root)
      )
    )
  );
}

function isTerminalRootObservation(
  observation: CanonicalRootObservation
): observation is Extract<CanonicalRootObservation, { kind: "terminal" }> {
  return observation.kind === "terminal";
}

function isCanonicalRootObservation(
  observation: CanonicalRootObservation
): observation is Extract<CanonicalRootObservation, { kind: "canonical" }> {
  return observation.kind === "canonical";
}

function isCanonicalSymlinkObservation(
  observation: CanonicalRootObservation
): observation is Extract<CanonicalRootObservation, { kind: "canonical" }> & {
  readonly throughSymlink: true;
} {
  return observation.kind === "canonical" && observation.throughSymlink;
}

function admittedRootPlan(
  rule: RuleGritFacts,
  canonicalRepo: string,
  canonicalRoots: readonly string[]
): PlannedGritRule {
  const admittedRoots = [...new Set(canonicalRoots)].sort((left, right) =>
    left.localeCompare(right)
  );
  const decision = decideCanonicalAcquisitionRoots(admittedRoots, {
    repoRoot: canonicalRepo,
    approvedAcquisitionRoots: rule.runner.acquisition.roots,
  });
  const [first, ...rest] = admittedRoots;
  return Match.value(decision).pipe(
    Match.when({ kind: "refused" }, (refused) => ({
      kind: "refused" as const,
      rule,
      decision: refused,
    })),
    Match.when({ kind: "accepted" }, () => executeRootPlan(rule, canonicalRepo, first, rest)),
    Match.exhaustive
  );
}

function executeRootPlan(
  rule: RuleGritFacts,
  canonicalRepo: string,
  first: string | undefined,
  rest: readonly string[]
): PlannedGritRule {
  return Match.value(Option.fromNullable(first)).pipe(
    Match.when({ _tag: "None" }, () =>
      rootCanonicalizationFailure(rule, "Canonical acquisition-root planning produced no roots.")
    ),
    Match.orElse(({ value }) => ({
      kind: "execute" as const,
      rule,
      repoRoot: canonicalRepo,
      roots: parseDiagnosticSelectedAcquisitionRoots([value, ...rest]),
    }))
  );
}

function rootCanonicalizationFailure(rule: RuleGritFacts, detail: string): PlannedGritRule {
  return { kind: "failed", rule, failure: "DiagnosticScopePlanningFailed", detail };
}

function noMatchedAcquisitionRootsPlan(rule: RuleGritFacts): PlannedGritRule {
  return {
    kind: "not-applicable",
    rule,
    reason: "no-matched-acquisition-roots",
  };
}

function completedPreparedPlan(prepared: PreparedGritRule): PlannedGritRule {
  return Match.value(prepared).pipe(
    Match.when({ kind: "complete" }, ({ plan }) => plan),
    Match.when({ kind: "exact-check" }, ({ rule }) =>
      rootCanonicalizationFailure(rule, "Exact coverage inventory was not prepared.")
    ),
    Match.exhaustive
  );
}

function exactCoverageSymlinkFailure(
  rule: RuleGritFacts,
  canonicalRepo: string,
  symlinks: readonly string[]
): PlannedGritRule {
  const first = symlinks[0];
  const selected = first === undefined ? "<unknown>" : toRepoRelative(canonicalRepo, first);
  return rootCanonicalizationFailure(
    rule,
    `Exact coverage selected symbolic link ${selected}; exact check acquisition accepts existing regular files only and never follows symbolic links.`
  );
}

function decideCanonicalAcquisitionRoots(
  acquisitionRoots: readonly string[],
  options: CanonicalAcquisitionRootDecisionOptions
) {
  const refusal = acquisitionRoots
    .map((acquisitionRoot) => canonicalAcquisitionRootRefusal(acquisitionRoot, options))
    .find((decision): decision is DiagnosticAcquisitionRootRefusal => decision !== null);
  return Match.value({
    empty: acquisitionRoots.length === 0,
    refusal: Option.fromNullable(refusal),
  }).pipe(
    Match.when({ empty: true }, () => ({ kind: "refused", reason: "empty" }) as const),
    Match.when({ refusal: { _tag: "Some" } }, ({ refusal: blocked }) => blocked.value),
    Match.orElse(() => ({
      kind: "accepted" as const,
      roots: parseDiagnosticSelectedAcquisitionRoots(acquisitionRoots),
      source: "rule-registry-facts" as const,
    }))
  );
}

function canonicalAcquisitionRootRefusal(
  acquisitionRoot: string,
  options: CanonicalAcquisitionRootDecisionOptions
): DiagnosticAcquisitionRootRefusal | null {
  const absolute = path.resolve(options.repoRoot, acquisitionRoot);
  const relative = toRepoRelative(options.repoRoot, absolute);
  const protection = Match.value(relative).pipe(
    Match.when("", () => ({ kind: "accepted" as const })),
    Match.orElse((root) =>
      decideAcquisitionRootProtection(root, {
        protectedPrefixes: protectedAcquisitionRootPrefixes,
      })
    )
  );
  return Match.value({
    outside: !pathIsWithinRoot(absolute, options.repoRoot),
    protection,
    approved: isApprovedAcquisitionRoot(relative, options.approvedAcquisitionRoots),
  }).pipe(
    Match.when({ outside: true }, () => ({
      kind: "refused" as const,
      reason: "outside-repo" as const,
      root: acquisitionRoot,
    })),
    Match.when({ protection: { kind: "refused-generated-output" } }, ({ protection: blocked }) => ({
      kind: "refused" as const,
      reason: blocked.reason,
      root: relative,
      owner: blocked.owner,
      recovery: blocked.recovery,
    })),
    Match.when({ protection: { kind: "refused-protected-root" } }, ({ protection: blocked }) => ({
      kind: "refused" as const,
      reason: blocked.reason,
      root: relative,
      owner: blocked.owner,
      recovery: blocked.recovery,
    })),
    Match.when({ approved: false }, () => ({
      kind: "refused" as const,
      reason: "not-approved" as const,
      root: relative,
    })),
    Match.orElse(() => null)
  );
}

export function normalizeGritPath(gritPath: string | undefined): string {
  const normalized = normalizeRepoRelativeAuthority(gritPath ?? "");
  return Match.value(normalized).pipe(
    Match.when("", () => "."),
    Match.orElse((relative) => relative)
  );
}

export function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map(normalizeRepoRelativeAuthority))].sort((left, right) =>
    left.localeCompare(right)
  );
}

function isApprovedAcquisitionRoot(
  relative: string,
  approvedAcquisitionRoots: readonly string[] | undefined
) {
  const roots = approvedAcquisitionRoots ?? [];
  return Match.value(roots.length === 0).pipe(
    Match.when(true, () => true),
    Match.orElse(() =>
      roots.some((approvedRoot) => acquisitionRootIsWithinDeclaredRoot(relative, approvedRoot))
    )
  );
}

export function acquisitionRootIsWithinDeclaredRoot(
  candidate: string,
  declaredRoot: string
): boolean {
  const normalizedCandidate = normalizeRepoRelativeAuthority(candidate);
  const normalizedRoot = normalizeRepoRelativeAuthority(declaredRoot);
  return Match.value(normalizedRoot).pipe(
    Match.when("", () => true),
    Match.orElse(
      (root) => normalizedCandidate === root || normalizedCandidate.startsWith(`${root}/`)
    )
  );
}

function candidateAcquisitionRoots(
  canonicalRepo: string,
  declaredRoots: readonly string[],
  requestedRoots: readonly string[] | undefined,
  intersectAuthority: boolean
): readonly string[] {
  return Match.value(requestedRoots).pipe(
    Match.when(undefined, () => declaredRoots),
    Match.orElse((roots) =>
      roots.flatMap((candidate) =>
        candidateAcquisitionRootEntries(
          toRepoRelative(canonicalRepo, candidate),
          declaredRoots,
          intersectAuthority
        )
      )
    )
  );
}

function candidateAcquisitionRootEntries(
  relative: string,
  declaredRoots: readonly string[],
  intersectAuthority: boolean
): readonly string[] {
  return Match.value({
    intersectAuthority,
    withinDeclared: declaredRoots.some((declaredRoot) =>
      acquisitionRootIsWithinDeclaredRoot(relative, declaredRoot)
    ),
  }).pipe(
    Match.when({ intersectAuthority: true }, () =>
      intersectedAcquisitionRootEntries(relative, declaredRoots)
    ),
    Match.when({ withinDeclared: true }, () => [relative]),
    Match.orElse(() => [])
  );
}

function intersectedAcquisitionRootEntries(
  requestedRoot: string,
  declaredRoots: readonly string[]
): readonly string[] {
  return declaredRoots.flatMap((declaredRoot) =>
    intersectedAcquisitionRootEntry(requestedRoot, declaredRoot)
  );
}

function intersectedAcquisitionRootEntry(
  requestedRoot: string,
  declaredRoot: string
): readonly string[] {
  return Match.value({
    requestedInsideDeclared: acquisitionRootIsWithinDeclaredRoot(requestedRoot, declaredRoot),
    declaredInsideRequested: acquisitionRootIsWithinDeclaredRoot(declaredRoot, requestedRoot),
  }).pipe(
    Match.when({ requestedInsideDeclared: true }, () => [requestedRoot]),
    Match.when({ declaredInsideRequested: true }, () => [declaredRoot]),
    Match.orElse(() => [])
  );
}

function exactCheckCoveragePatterns(rule: RuleGritFacts): Option.Option<readonly string[]> {
  return Match.value({
    check: rule.runner.acquisition.kind === "check",
    exact: rule.pathCoverage.every((coverage) => coverage.kind === "exact-path"),
  }).pipe(
    Match.when({ check: true, exact: true }, () =>
      Option.some(rule.pathCoverage.flatMap(exactCoveragePatternEntry))
    ),
    Match.orElse(() => Option.none())
  );
}

function exactCoveragePatternEntry(
  coverage: RuleGritFacts["pathCoverage"][number]
): readonly string[] {
  return Match.value(coverage).pipe(
    Match.when({ kind: "exact-path" }, ({ patterns }) => patterns),
    Match.orElse(() => [])
  );
}

function protectedExactCoverageRoots(canonicalRepo: string): readonly string[] {
  return [
    ...protectedAcquisitionRootPrefixes.map((prefix) => prefix.replace(/\/$/, "")),
    ...hostGeneratedSurfaceDeclarations().map(({ matcher }) => matcher.value.replace(/\/$/, "")),
  ].map((relative) => path.resolve(canonicalRepo, relative));
}

function normalizeRepoRelativeAuthority(candidate: string): string {
  const normalized = path.posix.normalize(candidate.replace(/\\/g, "/"));
  return Match.value(normalized).pipe(
    Match.when(".", () => ""),
    Match.orElse((relative) => relative)
  );
}

function toRepoRelative(repoRoot: string, candidate: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, candidate)).split(path.sep).join("/");
}
