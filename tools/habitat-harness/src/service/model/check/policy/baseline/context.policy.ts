import { readFileSync } from "node:fs";
import path from "node:path";
import { ruleRegistryRepoPath } from "@internal/habitat-harness/resources/artifact-paths";
import { baselinesDir, repoRoot } from "@internal/habitat-harness/resources/paths";
import {
  loadRuleRegistryDocument,
  ruleBaselineFacts,
  ruleSelectorFacts,
} from "@internal/habitat-harness/service/model/rules/index";
import type { BaselineRuleContractInput, RuleIntroductionBaselineManifest } from "./schema.js";

export interface BaselineAuthorityContext {
  repoRoot?: string;
  baselinesDir?: string;
  registry?: readonly BaselineRuleContractInput[];
  ruleIntroductionManifests?: readonly RuleIntroductionBaselineManifest[];
}

export interface RequiredBaselineContext {
  repoRoot: string;
  baselinesDir: string;
  registry: readonly BaselineRuleContractInput[];
  ruleIntroductionManifests: readonly RuleIntroductionBaselineManifest[];
}

export function resolveBaselineContext(
  options: BaselineAuthorityContext = {}
): RequiredBaselineContext {
  const root = options.repoRoot ?? repoRoot;
  return {
    repoRoot: root,
    baselinesDir: options.baselinesDir ?? baselinesDir,
    registry: options.registry ?? readCurrentRuleRegistry(root),
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
