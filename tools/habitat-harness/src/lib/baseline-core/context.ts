import { readFileSync } from "node:fs";
import path from "node:path";
import {
  loadRuleRegistryDocument,
  ruleBaselineFacts,
  ruleSelectorFacts,
} from "../../rules/registry/index.js";
import { ruleRegistryRepoPath } from "../artifact-paths.ts";
import { baselinesDir, repoRoot } from "../paths.js";
import { run, type SpawnResult } from "../spawn.js";
import type { BaselineRuleContractInput, RuleIntroductionBaselineManifest } from "./schema.js";

export interface BaselineContractContext {
  repoRoot?: string;
  baselinesDir?: string;
  registry?: readonly BaselineRuleContractInput[];
  runCommand?: (argv: string[], options?: { cwd?: string }) => SpawnResult;
  ruleIntroductionManifests?: readonly RuleIntroductionBaselineManifest[];
}

export interface RequiredBaselineContext {
  repoRoot: string;
  baselinesDir: string;
  registry: readonly BaselineRuleContractInput[];
  runCommand: (argv: string[], options?: { cwd?: string }) => SpawnResult;
  ruleIntroductionManifests: readonly RuleIntroductionBaselineManifest[];
}

export function resolveBaselineContext(
  options: BaselineContractContext = {}
): RequiredBaselineContext {
  const root = options.repoRoot ?? repoRoot;
  return {
    repoRoot: root,
    baselinesDir: options.baselinesDir ?? baselinesDir,
    registry: options.registry ?? readCurrentRuleRegistry(root),
    runCommand:
      options.runCommand ?? ((argv, runOptions) => run(argv, { cwd: runOptions?.cwd ?? root })),
    ruleIntroductionManifests: options.ruleIntroductionManifests ?? [],
  };
}

export function readCurrentRuleRegistry(root: string): BaselineRuleContractInput[] {
  const p = path.join(root, ruleRegistryRepoPath);
  const records = loadRuleRegistryDocument(p).rules;
  const selectorsByRuleId = new Map(ruleSelectorFacts(records).map((fact) => [fact.id, fact]));
  return ruleBaselineFacts(records).map((fact) => {
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
}

export function gitShow(
  ref: string,
  repoRelPath: string,
  context = resolveBaselineContext()
): string | null {
  const res = context.runCommand(["git", "show", `${ref}:${repoRelPath}`], {
    cwd: context.repoRoot,
  });
  return res.exitCode === 0 ? res.stdout : null;
}

export function mergeBase(base = "main", context = resolveBaselineContext()): string | null {
  for (const ref of [base, `origin/${base}`]) {
    const res = context.runCommand(["git", "merge-base", "HEAD", ref], { cwd: context.repoRoot });
    if (res.exitCode === 0) return res.stdout.trim();
  }
  return null;
}

export function baselinePathForRule(ruleId: string, context: RequiredBaselineContext): string {
  return path.join(context.baselinesDir, `${ruleId}.json`);
}

export function toContextRelative(filePath: string, context: RequiredBaselineContext): string {
  return path.relative(context.repoRoot, path.resolve(filePath)).split(path.sep).join("/");
}

export function externalSourceFilePath(sourcePath: string): string {
  return sourcePath.split("#")[0] ?? sourcePath;
}

export function readJsonFile(pathName: string): unknown {
  return JSON.parse(readFileSync(pathName, "utf8"));
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
