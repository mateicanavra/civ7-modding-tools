import { createRequire } from "node:module";
import path from "node:path";
import { FileSystem } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import { pathCoveragePatternMatches } from "@habitat/cli/service/model/rules/policy/path-coverage.policy";
import { Effect, Either, Match } from "effect";
import { pathIsWithinRoot } from "../path.js";

interface PicomatchScan {
  readonly base: string;
  readonly negated: boolean;
  readonly negatedExtglob: boolean;
}

interface Picomatch {
  readonly scan: (glob: string) => PicomatchScan;
}

const require = createRequire(import.meta.url);
const picomatch: Picomatch = require("picomatch");

export type ExactCoverageInventory =
  | {
      readonly kind: "complete";
      readonly regularFiles: readonly string[];
      readonly symlinks: readonly string[];
    }
  | { readonly kind: "failed"; readonly detail: string };

export interface ExactCoverageSelection {
  readonly files: readonly string[];
  readonly symlinks: readonly string[];
}

interface ExactCoverageInspectionFailure {
  readonly _tag: "ExactCoverageInspectionFailure";
  readonly detail: string;
}

type InspectedPathKind = "directory" | "other";

/**
 * Inventories regular files and symlinks once for one diagnostic planning request.
 *
 * Bounded traversal roots are reduced to their minimal non-overlapping set before
 * traversal. Excluded roots are pruned before inspection. Directory symlinks are
 * recorded but never followed; every filesystem failure other than a path
 * disappearing during the current-tree read fails closed.
 */
export const discoverExactCoverageInventoryEffect = Effect.fn(
  "grit.acquisitionRoots.discoverExactCoverageInventory"
)(function* (
  traversalRoots: readonly string[],
  excludedRoots: readonly string[],
  fs: FileSystem.FileSystem
) {
  const regularFiles = new Set<string>();
  const symlinks = new Set<string>();
  const pending = [...minimalAbsoluteRoots(traversalRoots)];
  const excluded = minimalAbsoluteRoots(excludedRoots);
  const visited = new Set<string>();
  let cursor = 0;

  const inspection = yield* Effect.either(
    Effect.gen(function* () {
      while (cursor < pending.length) {
        const candidate = pending[cursor];
        cursor += 1;
        if (candidate === undefined) continue;

        const absolute = path.resolve(candidate);
        if (visited.has(absolute)) continue;
        visited.add(absolute);
        if (excluded.some((root) => pathIsWithinRoot(absolute, root))) continue;

        const kind = yield* inspectExactCoveragePathEffect(absolute, regularFiles, symlinks, fs);
        if (kind !== "directory") continue;

        const children = yield* readExactCoverageDirectoryEffect(absolute, fs);
        children
          .sort((left, right) => left.localeCompare(right))
          .forEach((name) => pending.push(path.join(absolute, name)));
      }
    })
  );

  return Either.match(inspection, {
    onLeft: ({ detail }): ExactCoverageInventory => ({ kind: "failed", detail }),
    onRight: (): ExactCoverageInventory => ({
      kind: "complete",
      regularFiles: sortedUniqueAbsolute(regularFiles),
      symlinks: sortedUniqueAbsolute(symlinks),
    }),
  });
});

/**
 * Derives the smallest traversal roots implied by exact coverage and authority.
 *
 * Each pattern contributes only its literal directory prefix. The prefix is then
 * intersected with the already-resolved declared/requested authority roots, so a
 * broad acquisition ceiling never causes unrelated repository siblings to be
 * inventoried.
 */
export function deriveExactCoverageTraversalRoots(
  canonicalRepo: string,
  authorityRoots: readonly string[],
  patterns: readonly string[]
): readonly string[] {
  const literalPrefixes = patterns.map((pattern) =>
    exactCoverageLiteralPrefix(canonicalRepo, pattern)
  );
  return minimalAbsoluteRoots(
    literalPrefixes.flatMap((prefix) =>
      authorityRoots.flatMap((authorityRoot) => intersectAbsoluteRoots(prefix, authorityRoot))
    )
  );
}

/** Selects the inventory entries admitted by one rule's authority roots and exact coverage. */
export function selectExactCoverageEntries(
  canonicalRepo: string,
  authorityRoots: readonly string[],
  patterns: readonly string[],
  inventory: Extract<ExactCoverageInventory, { kind: "complete" }>
): ExactCoverageSelection {
  const matches = (candidate: string) =>
    authorityRoots.some((root) => pathIsWithinRoot(candidate, root)) &&
    pathMatchesCoverage(canonicalRepo, candidate, patterns);
  return {
    files: inventory.regularFiles.filter(matches),
    symlinks: inventory.symlinks.filter(matches),
  };
}

const inspectExactCoveragePathEffect = Effect.fn("grit.acquisitionRoots.inspectExactCoveragePath")(
  function* (
    candidate: string,
    regularFiles: Set<string>,
    symlinks: Set<string>,
    fs: FileSystem.FileSystem
  ): Effect.fn.Return<InspectedPathKind, ExactCoverageInspectionFailure> {
    const canonical = yield* Effect.either(fs.realPath(candidate));
    if (Either.isLeft(canonical)) {
      if (isMissingPath(canonical.left)) return "other";
      return yield* Effect.fail(inspectionFailure(candidate, "canonicalized", canonical.left));
    }

    if (canonical.right !== path.resolve(candidate)) {
      symlinks.add(path.resolve(candidate));
      return "other";
    }

    const stat = yield* Effect.either(fs.stat(candidate));
    if (Either.isLeft(stat)) {
      if (isMissingPath(stat.left)) return "other";
      return yield* Effect.fail(inspectionFailure(candidate, "inspected", stat.left));
    }

    return yield* Match.value(stat.right.type).pipe(
      Match.when("File", () =>
        Effect.sync(() => {
          regularFiles.add(canonical.right);
          return "other" as const;
        })
      ),
      Match.when("Directory", () => Effect.succeed("directory" as const)),
      Match.orElse(() => Effect.succeed("other" as const))
    );
  }
);

const readExactCoverageDirectoryEffect = Effect.fn(
  "grit.acquisitionRoots.readExactCoverageDirectory"
)(function* (
  directory: string,
  fs: FileSystem.FileSystem
): Effect.fn.Return<string[], ExactCoverageInspectionFailure> {
  const entries = yield* Effect.either(fs.readDirectory(directory));
  if (Either.isRight(entries)) return entries.right;
  if (isMissingPath(entries.left)) return [];
  return yield* Effect.fail(inspectionFailure(directory, "read", entries.left));
});

function pathMatchesCoverage(
  canonicalRepo: string,
  candidate: string,
  patterns: readonly string[]
): boolean {
  const relative = path.relative(canonicalRepo, candidate).split(path.sep).join("/");
  return patterns.some((pattern) => pathCoveragePatternMatches(pattern, relative));
}

function exactCoverageLiteralPrefix(canonicalRepo: string, pattern: string): string {
  const normalized = pattern.replaceAll("\\", "/");
  const scan = picomatch.scan(normalized);
  const base = scan.negated || scan.negatedExtglob ? "" : scan.base;
  return path.resolve(canonicalRepo, base);
}

function intersectAbsoluteRoots(left: string, right: string): readonly string[] {
  return Match.value({
    leftInsideRight: pathIsWithinRoot(left, right),
    rightInsideLeft: pathIsWithinRoot(right, left),
  }).pipe(
    Match.when({ leftInsideRight: true }, () => [left]),
    Match.when({ rightInsideLeft: true }, () => [right]),
    Match.orElse(() => [])
  );
}

function minimalAbsoluteRoots(roots: readonly string[]): readonly string[] {
  const ordered = [...new Set(roots.map((root) => path.resolve(root)))].sort(
    (left, right) => left.length - right.length || left.localeCompare(right)
  );
  const minimal: string[] = [];
  for (const candidate of ordered) {
    if (minimal.some((root) => pathIsWithinRoot(candidate, root))) continue;
    minimal.push(candidate);
  }
  return minimal;
}

function inspectionFailure(
  candidate: string,
  operation: string,
  error: PlatformError
): ExactCoverageInspectionFailure {
  return {
    _tag: "ExactCoverageInspectionFailure",
    detail: `Exact coverage path ${candidate} could not be ${operation}: ${String(error)}.`,
  };
}

function isMissingPath(error: PlatformError): boolean {
  return error._tag === "SystemError" && error.reason === "NotFound";
}

function sortedUniqueAbsolute(values: ReadonlySet<string>): readonly string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}
