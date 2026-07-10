import path from "node:path";
import { FileSystem } from "@effect/platform";
import { acquireTempDirectory } from "@habitat/cli/resources/platform/index";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import { Data, Effect } from "effect";
import { gritCheckProgram } from "./request.js";
import type { GritProviderService } from "./resource.js";
import { ruleHasDocsScanRoot } from "./scan-roots/index.js";
import type { GritCheckCacheMode, GritCheckOutputFormat } from "./types.js";

export function runGritCheckWithScopedConfigEffect(
  selectedRules: readonly RuleSourceFacts[],
  scanRoots: readonly string[],
  options: {
    repoRoot: string;
    grit: GritProviderService;
    cacheMode?: GritCheckCacheMode;
    requireObservableCacheStatus?: boolean;
    outputFormat: GritCheckOutputFormat;
  }
) {
  return Effect.scoped(
    Effect.gen(function* () {
      const gritDir = yield* acquireTempDirectory("habitat-grit-config-");
      // GRIT_USER_CONFIG is the user-level .grit directory, not its patterns child.
      const gritUserConfigDir = yield* acquireTempDirectory("habitat-grit-user-config-");
      const fs = yield* FileSystem.FileSystem;
      const config = yield* renderSelectedGritConfig(selectedRules, options.repoRoot, fs);
      yield* fs.writeFileString(path.join(gritDir, "grit.yaml"), config);
      return yield* gritCheckProgram(scanRoots, {
        repoRoot: options.repoRoot,
        grit: options.grit,
        cacheMode: options.cacheMode,
        requireObservableCacheStatus: options.requireObservableCacheStatus,
        allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
        outputFormat: options.outputFormat,
        cwd: options.repoRoot,
        gritDir,
        gritUserConfigDir,
      });
    })
  );
}

function renderSelectedGritConfig(
  selectedRules: readonly RuleSourceFacts[],
  repoRoot: string,
  fs: FileSystem.FileSystem
) {
  return Effect.forEach(selectedRules, (rule) => {
    const source = path.join(repoRoot, rule.runner.files.pattern);
    return fs.readFileString(source).pipe(
      Effect.flatMap((contents) => extractGritBody(contents, source)),
      Effect.map((body) => {
        return [
          `  - name: ${JSON.stringify(rule.patternName)}`,
          `    title: ${JSON.stringify(rule.id)}`,
          "    level: error",
          "    body: |",
          indentYamlBlock(body),
        ].join("\n");
      })
    );
  }).pipe(
    Effect.map((patternEntries) =>
      ["version: 0.0.2", "patterns:", ...patternEntries, ""].join("\n")
    )
  );
}

function extractGritBody(contents: string, source: string) {
  const match = contents.match(/```grit\n([\s\S]*?)\n```/);
  return match
    ? Effect.succeed(match[1] ?? "")
    : Effect.fail(new GritScopedConfigInvalid({ path: source }));
}

function indentYamlBlock(body: string) {
  return body
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");
}

class GritScopedConfigInvalid extends Data.TaggedError("GritScopedConfigInvalid")<{
  readonly path: string;
}> {}
