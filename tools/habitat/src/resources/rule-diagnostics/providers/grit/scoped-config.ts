import path from "node:path";
import { FileSystem } from "@effect/platform";
import { acquireTempDirectory } from "@habitat/cli/resources/platform/index";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Data, Effect, Match, Option } from "effect";
import { pathIsWithinRoot } from "./path.js";
import { quoteGritYamlScalar } from "./types.js";

export interface ScopedGritWorkspace {
  readonly cwd: string;
  readonly gritDir: string;
  readonly userConfigDir: string;
  readonly cacheDir: string;
  readonly patternPath: string;
}

export const acquireScopedGritWorkspaceEffect = Effect.fn("grit.scopedWorkspace.acquire")(
  function* (rule: RuleGritFacts, repoRoot: string) {
    const fs = yield* FileSystem.FileSystem;
    const asset = yield* canonicalPatternAssetEffect(rule, repoRoot, fs);
    const source = yield* fs
      .readFileString(asset)
      .pipe(Effect.mapError((error) => patternAssetFailure(asset, error)));
    const body = yield* extractGritBody(source, asset);

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
      .writeFileString(path.join(gritDir, "grit.yaml"), renderConfig(rule, body))
      .pipe(Effect.mapError((error) => scopedConfigFailure("write scoped catalog", error)));
    return {
      cwd,
      gritDir,
      userConfigDir,
      cacheDir,
      patternPath: asset,
    } satisfies ScopedGritWorkspace;
  }
);

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

function renderConfig(rule: RuleGritFacts, body: string): string {
  return [
    "version: 0.0.2",
    "patterns:",
    `  - name: ${quoteGritYamlScalar(rule.patternName)}`,
    `    title: ${quoteGritYamlScalar(rule.id)}`,
    "    level: error",
    "    body: |",
    ...body.split("\n").map((line) => `      ${line}`),
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
