import path from "node:path";
import { FileSystem } from "@effect/platform";
import { acquireTempDirectory } from "@habitat/cli/resources/platform/index";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Data, Effect, Match, Option } from "effect";
import { pathIsWithinRoot } from "./path.js";
import { quoteGritYamlScalar } from "./types.js";

/** Isolated catalog, user-config, and cache roots held for one native Grit command. */
export interface ScopedGritCatalogWorkspace {
  readonly cwd: string;
  readonly gritDir: string;
  readonly userConfigDir: string;
  readonly cacheDir: string;
}

/** Single-pattern workspace retaining the admitted asset path required by dry-run apply. */
export interface ScopedGritWorkspace extends ScopedGritCatalogWorkspace {
  readonly patternPath: string;
}

/** One admitted rule asset ready to become an entry in an isolated Grit catalog. */
export interface MaterializedGritPattern {
  readonly rule: RuleGritFacts;
  readonly patternPath: string;
  readonly body: string;
}

export const acquireScopedGritWorkspaceEffect = Effect.fn("grit.scopedWorkspace.acquire")(
  function* (rule: RuleGritFacts, repoRoot: string) {
    const pattern = yield* materializeGritPatternEffect(rule, repoRoot);
    const workspace = yield* acquireScopedGritCatalogEffect([pattern]);
    return { ...workspace, patternPath: pattern.patternPath } satisfies ScopedGritWorkspace;
  }
);

/**
 * Resolves one registered rule's authored asset into a closed Grit catalog entry.
 * This happens before workspace acquisition so one invalid asset cannot block valid peers.
 */
export const materializeGritPatternEffect = Effect.fn("grit.pattern.materialize")(function* (
  rule: RuleGritFacts,
  repoRoot: string
) {
  const fs = yield* FileSystem.FileSystem;
  const patternPath = yield* canonicalPatternAssetEffect(rule, repoRoot, fs);
  const source = yield* fs
    .readFileString(patternPath)
    .pipe(Effect.mapError((error) => patternAssetFailure(patternPath, error)));
  const body = yield* extractGritBody(source, patternPath);
  return { rule, patternPath, body } satisfies MaterializedGritPattern;
});

/**
 * Acquires one hermetic Grit workspace for an ordered, already-materialized catalog.
 * No catalog entry is privileged after acquisition; apply recombines its one admitted path.
 */
export const acquireScopedGritCatalogEffect = Effect.fn("grit.scopedCatalog.acquire")(function* (
  patterns: readonly [MaterializedGritPattern, ...MaterializedGritPattern[]]
) {
  const fs = yield* FileSystem.FileSystem;

  const cwd = yield* acquireTempDirectory("habitat-grit-diagnostic-").pipe(
    Effect.mapError((error) => scopedConfigFailure("allocate temporary workspace", error))
  );
  const gritDir = path.join(cwd, ".grit");
  const userConfigDir = path.join(cwd, "user-config");
  const cacheDir = path.join(cwd, "cache");
  yield* Effect.all(
    [gritDir, userConfigDir, cacheDir].map((directory) => fs.makeDirectory(directory)),
    { concurrency: 1 }
  ).pipe(Effect.mapError((error) => scopedConfigFailure("create isolated directories", error)));
  yield* fs
    .writeFileString(path.join(gritDir, "grit.yaml"), renderConfig(patterns))
    .pipe(Effect.mapError((error) => scopedConfigFailure("write scoped catalog", error)));
  return {
    cwd,
    gritDir,
    userConfigDir,
    cacheDir,
  } satisfies ScopedGritCatalogWorkspace;
});

const canonicalPatternAssetEffect = Effect.fn("grit.patternAsset.canonicalize")(function* (
  rule: RuleGritFacts,
  repoRoot: string,
  fs: FileSystem.FileSystem
) {
  const canonicalRepo = yield* fs
    .realPath(repoRoot)
    .pipe(Effect.mapError((error) => patternAssetFailure(repoRoot, error)));
  const habitatLexical = path.join(canonicalRepo, ".habitat");
  const assetLexical = yield* Effect.succeed(
    path.resolve(canonicalRepo, rule.runner.files.pattern)
  ).pipe(
    Effect.filterOrFail(
      (candidate) => pathIsWithinRoot(candidate, habitatLexical),
      () =>
        new GritPatternAssetInvalid({
          detail: `Grit pattern asset is outside lexical .habitat authority: ${rule.runner.files.pattern}.`,
        })
    )
  );
  const canonicalHabitat = yield* fs.realPath(habitatLexical).pipe(
    Effect.mapError((error) => patternAssetFailure(habitatLexical, error)),
    Effect.filterOrFail(
      (candidate) => pathIsWithinRoot(candidate, canonicalRepo),
      (candidate) =>
        new GritPatternAssetInvalid({
          detail: `Canonical .habitat authority escapes the repository: ${candidate}.`,
        })
    )
  );
  const canonicalAsset = yield* fs.realPath(assetLexical).pipe(
    Effect.mapError((error) => patternAssetFailure(assetLexical, error)),
    Effect.filterOrFail(
      (candidate) => pathIsWithinRoot(candidate, canonicalHabitat),
      (candidate) =>
        new GritPatternAssetInvalid({
          detail: `Canonical Grit pattern asset escapes .habitat authority: ${candidate}.`,
        })
    )
  );
  return canonicalAsset;
});

function renderConfig(
  patterns: readonly [MaterializedGritPattern, ...MaterializedGritPattern[]]
): string {
  return [
    "version: 0.0.2",
    "patterns:",
    ...patterns.flatMap(({ rule, body }) => [
      `  - name: ${quoteGritYamlScalar(rule.patternName)}`,
      `    title: ${quoteGritYamlScalar(rule.id)}`,
      "    level: error",
      "    body: |",
      ...body.split("\n").map((line) => `      ${line}`),
    ]),
    "",
  ].join("\n");
}

function extractGritBody(contents: string, source: string) {
  const match = /```grit\n([\s\S]*?)\n```/.exec(contents);
  return Match.value(Option.fromNullable(match?.[1])).pipe(
    Match.when({ _tag: "Some" }, ({ value }) => Effect.succeed(value)),
    Match.orElse(() =>
      Effect.fail(
        new GritPatternAssetInvalid({
          detail: `Grit pattern asset has no closed grit fence: ${source}.`,
        })
      )
    )
  );
}

function patternAssetFailure(asset: string, error: unknown): GritPatternAssetInvalid {
  return new GritPatternAssetInvalid({
    detail: `Grit pattern asset failed at ${asset}: ${String(error)}.`,
  });
}

function scopedConfigFailure(operation: string, error: unknown): GritScopedConfigInvalid {
  return new GritScopedConfigInvalid({
    detail: `Failed to ${operation}: ${String(error)}.`,
  });
}

export class GritPatternAssetInvalid extends Data.TaggedError("GritPatternAssetInvalid")<{
  readonly detail: string;
}> {}

export class GritScopedConfigInvalid extends Data.TaggedError("GritScopedConfigInvalid")<{
  readonly detail: string;
}> {}
