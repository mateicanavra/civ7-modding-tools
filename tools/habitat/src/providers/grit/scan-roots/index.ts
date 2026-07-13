import path from "node:path";
import { FileSystem } from "@effect/platform";
import {
  type DiagnosticScanRootRefusal,
  parseDiagnosticSelectedScanRoots,
} from "@habitat/cli/service/model/diagnostics/index";
import { decideScanRootProtection } from "@habitat/cli/service/model/host/index";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Either, Match, Option } from "effect";
import { protectedScanRootPrefixes } from "../constants.js";

interface CanonicalScanRootDecisionOptions {
  readonly repoRoot: string;
  readonly approvedScanRoots: readonly string[];
}

export type PlannedGritRule =
  | {
      readonly kind: "execute";
      readonly rule: RuleSourceFacts;
      readonly repoRoot: string;
      readonly roots: readonly [string, ...string[]];
    }
  | {
      readonly kind: "not-applicable";
      readonly rule: RuleSourceFacts;
      readonly reason: "no-matched-scan-roots";
    }
  | {
      readonly kind: "refused";
      readonly rule: RuleSourceFacts;
      readonly decision: DiagnosticScanRootRefusal;
    }
  | {
      readonly kind: "failed";
      readonly rule: RuleSourceFacts;
      readonly failure: "GritRootCanonicalizationFailed";
      readonly detail: string;
    };

export const planGritRuleRoots = Effect.fn("grit.scanRoots.plan")(function* (
  selectedRules: readonly RuleSourceFacts[],
  options: { readonly repoRoot: string; readonly scanRoots?: readonly string[] }
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
      Effect.forEach(
        selectedRules,
        (rule) => planGritRuleRootEffect(rule, right, options.scanRoots, fs),
        { concurrency: 1 }
      )
    ),
    Match.exhaustive
  );
});

const planGritRuleRootEffect = Effect.fn("grit.scanRoot.planRule")(function* (
  rule: RuleSourceFacts,
  canonicalRepo: string,
  requestedRoots: readonly string[] | undefined,
  fs: FileSystem.FileSystem
) {
  const candidates = Match.value(requestedRoots).pipe(
    Match.when(undefined, () => rule.scanRoots),
    Match.orElse((roots) =>
      roots.filter((candidate) =>
        rule.scanRoots.some((declaredRoot) => scanRootIsWithinDeclaredRoot(candidate, declaredRoot))
      )
    )
  );
  const lexicalRoots = sortedUnique(candidates).map((candidate) => ({
    candidate,
    absolute: path.resolve(canonicalRepo, candidate),
  }));
  const observations = yield* Effect.forEach(
    lexicalRoots,
    (root) => canonicalizeRootEffect(rule, canonicalRepo, root, fs),
    { concurrency: 1 }
  );
  return completeRootPlan(rule, canonicalRepo, observations);
});

type CanonicalRootObservation =
  | { readonly kind: "canonical"; readonly root: string }
  | { readonly kind: "terminal"; readonly plan: PlannedGritRule };

const canonicalizeRootEffect = Effect.fn("grit.scanRoot.canonicalize")(function* (
  rule: RuleSourceFacts,
  canonicalRepo: string,
  root: { readonly candidate: string; readonly absolute: string },
  fs: FileSystem.FileSystem
) {
  return yield* Match.value(lexicalRootObservation(rule, canonicalRepo, root)).pipe(
    Match.when({ kind: "terminal" }, (terminal) => Effect.succeed(terminal)),
    Match.when({ kind: "probe" }, () => probeRootEffect(rule, root, fs)),
    Match.exhaustive
  );
});

function lexicalRootObservation(
  rule: RuleSourceFacts,
  canonicalRepo: string,
  root: { readonly candidate: string; readonly absolute: string }
) {
  const relative = toRepoRelative(canonicalRepo, root.absolute);
  return Match.value(pathIsOutsideRepo(relative)).pipe(
    Match.when(true, () => ({
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

const probeRootEffect = Effect.fn("grit.scanRoot.probe")(function* (
  rule: RuleSourceFacts,
  root: { readonly candidate: string; readonly absolute: string },
  fs: FileSystem.FileSystem
) {
  const existence = yield* Effect.either(fs.exists(root.absolute));
  return yield* Match.value(rootProbeObservation(rule, root, existence)).pipe(
    Match.when({ kind: "terminal" }, (terminal) => Effect.succeed(terminal)),
    Match.when({ kind: "canonicalize" }, () => canonicalizeExistingRootEffect(rule, root, fs)),
    Match.exhaustive
  );
});

function rootProbeObservation<E>(
  rule: RuleSourceFacts,
  root: { readonly candidate: string; readonly absolute: string },
  existence: Either.Either<boolean, E>
) {
  return Either.match(existence, {
    onLeft: (left) => ({
      kind: "terminal" as const,
      plan: rootCanonicalizationFailure(
        rule,
        `Scan root ${root.candidate} could not be probed: ${String(left)}.`
      ),
    }),
    onRight: (exists) => rootExistenceObservation(rule, root.candidate, exists),
  });
}

function rootExistenceObservation(rule: RuleSourceFacts, candidate: string, exists: boolean) {
  return Match.value(exists).pipe(
    Match.when(false, () => ({
      kind: "terminal" as const,
      plan: {
        kind: "refused" as const,
        rule,
        decision: { kind: "refused" as const, reason: "missing" as const, root: candidate },
      } satisfies PlannedGritRule,
    })),
    Match.orElse(() => ({ kind: "canonicalize" as const }))
  );
}

const canonicalizeExistingRootEffect = Effect.fn("grit.scanRoot.realPath")(function* (
  rule: RuleSourceFacts,
  root: { readonly candidate: string; readonly absolute: string },
  fs: FileSystem.FileSystem
) {
  const canonical = yield* Effect.either(fs.realPath(root.absolute));
  return canonicalRootObservation(rule, root, canonical);
});

function canonicalRootObservation<E>(
  rule: RuleSourceFacts,
  root: { readonly candidate: string },
  canonical: Either.Either<string, E>
): CanonicalRootObservation {
  return Either.match(canonical, {
    onLeft: (left) => ({
      kind: "terminal" as const,
      plan: rootCanonicalizationFailure(
        rule,
        `Scan root ${root.candidate} could not be canonicalized: ${String(left)}.`
      ),
    }),
    onRight: (right) => ({
      kind: "canonical" as const,
      root: right,
    }),
  });
}

function completeRootPlan(
  rule: RuleSourceFacts,
  canonicalRepo: string,
  observations: readonly CanonicalRootObservation[]
): PlannedGritRule {
  const terminal = observations.find(isTerminalRootObservation);
  return Match.value({
    empty: observations.length === 0,
    terminal: Option.fromNullable(terminal),
  }).pipe(
    Match.when({ empty: true }, () => ({
      kind: "not-applicable" as const,
      rule,
      reason: "no-matched-scan-roots" as const,
    })),
    Match.when({ terminal: { _tag: "Some" } }, ({ terminal: blocked }) => blocked.value.plan),
    Match.orElse(() =>
      admittedRootPlan(
        rule,
        canonicalRepo,
        observations.filter(isCanonicalRootObservation).map(({ root }) => root)
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

function admittedRootPlan(
  rule: RuleSourceFacts,
  canonicalRepo: string,
  canonicalRoots: readonly string[]
): PlannedGritRule {
  const admittedRoots = [...new Set(canonicalRoots)].sort((left, right) =>
    left.localeCompare(right)
  );
  const decision = decideCanonicalScanRoots(admittedRoots, {
    repoRoot: canonicalRepo,
    approvedScanRoots: rule.scanRoots,
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
  rule: RuleSourceFacts,
  canonicalRepo: string,
  first: string | undefined,
  rest: readonly string[]
): PlannedGritRule {
  return Match.value(Option.fromNullable(first)).pipe(
    Match.when({ _tag: "None" }, () =>
      rootCanonicalizationFailure(rule, "Canonical scan-root planning produced no roots.")
    ),
    Match.orElse(({ value }) => ({
      kind: "execute" as const,
      rule,
      repoRoot: canonicalRepo,
      roots: parseDiagnosticSelectedScanRoots([value, ...rest]),
    }))
  );
}

function rootCanonicalizationFailure(rule: RuleSourceFacts, detail: string): PlannedGritRule {
  return { kind: "failed", rule, failure: "GritRootCanonicalizationFailed", detail };
}

function decideCanonicalScanRoots(
  scanRoots: readonly string[],
  options: CanonicalScanRootDecisionOptions
) {
  const refusal = scanRoots
    .map((scanRoot) => canonicalScanRootRefusal(scanRoot, options))
    .find((decision): decision is DiagnosticScanRootRefusal => decision !== null);
  return Match.value({ empty: scanRoots.length === 0, refusal: Option.fromNullable(refusal) }).pipe(
    Match.when({ empty: true }, () => ({ kind: "refused", reason: "empty" }) as const),
    Match.when({ refusal: { _tag: "Some" } }, ({ refusal: blocked }) => blocked.value),
    Match.orElse(() => ({
      kind: "accepted" as const,
      roots: parseDiagnosticSelectedScanRoots(scanRoots),
      source: "rule-registry-facts" as const,
    }))
  );
}

function canonicalScanRootRefusal(
  scanRoot: string,
  options: CanonicalScanRootDecisionOptions
): DiagnosticScanRootRefusal | null {
  const absolute = path.resolve(options.repoRoot, scanRoot);
  const relative = toRepoRelative(options.repoRoot, absolute);
  const protection = Match.value(relative).pipe(
    Match.when("", () => ({ kind: "accepted" as const })),
    Match.orElse((root) =>
      decideScanRootProtection(root, {
        protectedPrefixes: protectedScanRootPrefixes,
      })
    )
  );
  return Match.value({
    outside: pathIsOutsideRepo(relative),
    protection,
    approved: isApprovedScanRoot(relative, options.approvedScanRoots),
  }).pipe(
    Match.when({ outside: true }, () => ({
      kind: "refused" as const,
      reason: "outside-repo" as const,
      root: scanRoot,
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

function isApprovedScanRoot(relative: string, approvedScanRoots: readonly string[] | undefined) {
  const roots = approvedScanRoots ?? [];
  return Match.value(roots.length === 0).pipe(
    Match.when(true, () => true),
    Match.orElse(() =>
      roots.some((approvedRoot) => scanRootIsWithinDeclaredRoot(relative, approvedRoot))
    )
  );
}

export function scanRootIsWithinDeclaredRoot(candidate: string, declaredRoot: string): boolean {
  const normalizedCandidate = normalizeRepoRelativeAuthority(candidate);
  const normalizedRoot = normalizeRepoRelativeAuthority(declaredRoot);
  return Match.value(normalizedRoot).pipe(
    Match.when("", () => true),
    Match.orElse(
      (root) => normalizedCandidate === root || normalizedCandidate.startsWith(`${root}/`)
    )
  );
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

function pathIsOutsideRepo(relative: string): boolean {
  return relative === ".." || relative.startsWith("../");
}
