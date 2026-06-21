import path from "node:path";
import { pathToFileURL } from "node:url";
import type { FileSystem } from "@effect/platform";
import { Effect } from "effect";
import ts from "typescript";
import { habitatCacheRepoPath, habitatCacheRepoPathPrefix } from "../../lib/artifact-paths.js";
import { repoRoot, toRepoRelative } from "../../lib/paths.js";
import { isDirectory, isFile, readDirectory, readText } from "../../resources/filesystem.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import { pathCoveragePatternMatches, type RuleSourceFacts } from "../rule-registry/index.js";
import type { HabitatDiagnostic } from "../structural-check/schema.js";
import { sourceCheckRuleModuleRepoPath } from "./module-paths.js";
import {
  pathsOverlap,
  selectedSourceScanRootsForRules,
  sortedUnique,
  sourceCheckCandidateExtensions,
} from "./scan-roots.js";
import type { SourceCheckOptions } from "./service.js";

interface SourceFileRecord {
  readonly path: string;
  readonly text: string;
  readonly sourceFile?: ts.SourceFile;
}

interface SourceCheckRuleModule {
  readonly ruleId: string;
  readonly diagnosticsForRule: (
    rule: RuleSourceFacts,
    file: SourceFileRecord
  ) => readonly HabitatDiagnostic[];
}

interface SourceRuleFilePlan {
  readonly rule: RuleSourceFacts;
  readonly scanRoots: readonly string[];
  readonly matches: (filePath: string) => boolean;
}

interface PlannedSourceFileRecord {
  readonly file: SourceFileRecord;
  readonly plans: readonly SourceRuleFilePlan[];
}

interface LoadedSourceRuleModule {
  readonly rule: RuleSourceFacts;
  readonly modulePath: string;
  readonly module?: SourceCheckRuleModule;
  readonly loadFailure?: string;
}

export function runSourceRulesEffect(
  rules: readonly RuleSourceFacts[],
  options: SourceCheckOptions = {}
) {
  return Effect.gen(function* () {
    const loadedModules = yield* loadSourceCheckRuleModulesEffect(rules);
    const modulesByRule = new Map(loadedModules.map((loaded) => [loaded.rule.id, loaded]));
    const executableRules = loadedModules
      .filter((loaded): loaded is LoadedSourceRuleModule & { module: SourceCheckRuleModule } =>
        Boolean(loaded.module)
      )
      .map((loaded) => loaded.rule);
    const plans = executableRules.map((rule) => sourceRuleFilePlan(rule, options));
    const files = yield* readPlannedSourceFiles(plans);
    const diagnosticsByRule = new Map<string, HabitatDiagnostic[]>(
      rules.map((rule) => [rule.id, []])
    );
    for (const { file, plans: matchingPlans } of files) {
      for (const plan of matchingPlans) {
        const loaded = modulesByRule.get(plan.rule.id);
        if (loaded?.module) {
          diagnosticsByRule
            .get(plan.rule.id)
            ?.push(...loaded.module.diagnosticsForRule(plan.rule, file));
        }
      }
    }
    return new Map(
      rules.map((rule) => {
        const loaded = modulesByRule.get(rule.id);
        if (!loaded?.module) return [rule.id, unsupportedNativeRule(rule, loaded)];
        const diagnostics = diagnosticsByRule.get(rule.id) ?? [];
        return [rule.id, { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics }];
      })
    );
  });
}

function loadSourceCheckRuleModulesEffect(
  rules: readonly RuleSourceFacts[]
): Effect.Effect<LoadedSourceRuleModule[], never> {
  return Effect.forEach(rules, loadSourceCheckRuleModuleEffect, { concurrency: 8 });
}

function loadSourceCheckRuleModuleEffect(
  rule: RuleSourceFacts
): Effect.Effect<LoadedSourceRuleModule, never> {
  const modulePath = sourceCheckRuleModuleRepoPath(rule.id);
  return Effect.tryPromise({
    try: async () => ({
      rule,
      modulePath,
      module: sourceCheckRuleModuleFromModule(rule.id, await import(moduleUrl(modulePath))),
    }),
    catch: (error) => error,
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        rule,
        modulePath,
        loadFailure: String(error),
      })
    )
  );
}

function moduleUrl(repoPath: string): string {
  return pathToFileURL(path.join(repoRoot, repoPath)).href;
}

function sourceCheckRuleModuleFromModule(ruleId: string, module: unknown): SourceCheckRuleModule {
  const candidate = module as Partial<SourceCheckRuleModule>;
  if (candidate.ruleId !== ruleId) {
    throw new Error(`${sourceCheckRuleModuleRepoPath(ruleId)} must export ruleId "${ruleId}".`);
  }
  if (typeof candidate.diagnosticsForRule !== "function") {
    throw new Error(`${sourceCheckRuleModuleRepoPath(ruleId)} must export diagnosticsForRule().`);
  }
  return {
    ruleId: candidate.ruleId,
    diagnosticsForRule: candidate.diagnosticsForRule,
  };
}

function sourceRuleFileMatcher(rule: RuleSourceFacts): (filePath: string) => boolean {
  const exactPathPatterns = rule.pathCoverage.flatMap((coverage) =>
    coverage.kind === "exact-path" ? coverage.patterns : []
  );
  if (exactPathPatterns.length > 0) {
    return (filePath) =>
      exactPathPatterns.some((pattern) => pathCoveragePatternMatches(pattern, filePath));
  }
  return (filePath) => rule.scanRoots.some((scanRoot) => pathsOverlap(filePath, scanRoot));
}

function sourceRuleFilePlan(
  rule: RuleSourceFacts,
  options: SourceCheckOptions
): SourceRuleFilePlan {
  return {
    rule,
    scanRoots: selectedSourceScanRootsForRules([rule], options.scanRoots),
    matches: sourceRuleFileMatcher(rule),
  };
}

function readPlannedSourceFiles(
  plans: readonly SourceRuleFilePlan[]
): Effect.Effect<PlannedSourceFileRecord[], never, FileSystem.FileSystem> {
  return Effect.gen(function* () {
    if (plans.length === 0) return [];
    const scanRoots = sortedUnique(plans.flatMap((plan) => plan.scanRoots));
    const paths = yield* Effect.forEach(scanRoots, collectSourcePaths, {
      concurrency: "unbounded",
    });
    const plannedPaths = sortedUnique(paths.flat()).flatMap((candidate) => {
      const matchingPlans = plans.filter((plan) => plan.matches(candidate));
      return matchingPlans.length > 0 ? [{ path: candidate, plans: matchingPlans }] : [];
    });
    const files = yield* Effect.forEach(
      plannedPaths,
      (plannedPath) =>
        readText(path.join(repoRoot, plannedPath.path)).pipe(
          Effect.map((text) => ({
            file: sourceFileRecord(plannedPath.path, text),
            plans: plannedPath.plans,
          })),
          Effect.catchAll(() => Effect.succeed(undefined))
        ),
      { concurrency: 16 }
    );
    return files.flatMap((file) => (file ? [file] : []));
  });
}

function sourceFileRecord(relativePath: string, text: string): SourceFileRecord {
  if (!isTsLikeFile(relativePath)) return { path: relativePath, text };

  let sourceFile: ts.SourceFile | undefined;
  return {
    path: relativePath,
    text,
    get sourceFile() {
      sourceFile ??= ts.createSourceFile(relativePath, text, ts.ScriptTarget.Latest, true);
      return sourceFile;
    },
  };
}

function collectSourcePaths(
  scanRoot: string
): Effect.Effect<string[], never, FileSystem.FileSystem> {
  const absolute = path.join(repoRoot, scanRoot);
  return isFile(absolute).pipe(
    Effect.flatMap((file) => {
      if (file) return Effect.succeed(isCandidateFile(scanRoot) ? [toRepoRelative(scanRoot)] : []);
      return isDirectory(absolute).pipe(
        Effect.flatMap((directory) => (directory ? collectDirectory(absolute) : Effect.succeed([])))
      );
    }),
    Effect.catchAll(() => Effect.succeed([]))
  );
}

function collectDirectory(
  absoluteDirectory: string
): Effect.Effect<string[], never, FileSystem.FileSystem> {
  return readDirectory(absoluteDirectory).pipe(
    Effect.flatMap((entries) =>
      Effect.forEach(
        entries,
        (entry) => {
          const absolute = path.join(absoluteDirectory, entry.name);
          const relative = toRepoRelative(absolute);
          if (entry.kind === "directory") {
            return ignoredDirectory(entry.name, relative)
              ? Effect.succeed([])
              : collectDirectory(absolute);
          }
          return Effect.succeed(
            entry.kind === "file" && isCandidateFile(relative) ? [relative] : []
          );
        },
        { concurrency: 8 }
      )
    ),
    Effect.map((groups) => groups.flat()),
    Effect.catchAll(() => Effect.succeed([]))
  );
}

function unsupportedNativeRule(
  rule: RuleSourceFacts,
  loaded: LoadedSourceRuleModule | undefined
): RuleRunResult {
  const modulePath = loaded?.modulePath ?? sourceCheckRuleModuleRepoPath(rule.id);
  const loadReason = loaded?.loadFailure
    ? ` ${modulePath} failed to load: ${loaded.loadFailure}`
    : "";
  return {
    exitCode: 1,
    diagnostics: [
      {
        ruleId: rule.id,
        path: modulePath,
        message: `No repo source-check implementation is registered for ${rule.id}.${loadReason}`,
        severity: rule.lane === "advisory" ? "advisory" : "error",
        baselined: false,
      },
    ],
  };
}

function isTsLikeFile(filePath: string): boolean {
  return /\.(?:cjs|cts|js|jsx|mjs|mts|ts|tsx)$/.test(filePath);
}

function isCandidateFile(filePath: string): boolean {
  return sourceCheckCandidateExtensions.has(path.extname(filePath));
}

function ignoredDirectory(name: string, relative: string): boolean {
  return (
    name === ".git" ||
    name === "node_modules" ||
    name === "dist" ||
    name === "coverage" ||
    relative === habitatCacheRepoPath ||
    relative.startsWith(habitatCacheRepoPathPrefix)
  );
}
