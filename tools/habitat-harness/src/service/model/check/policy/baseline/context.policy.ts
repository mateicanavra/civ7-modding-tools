import type { BaselineRuleContractInput, RuleIntroductionBaselineManifest } from "./schema.js";

export interface BaselineAuthorityContext {
  repoRoot?: string;
  baselinesDir?: string;
  registry?: readonly BaselineRuleContractInput[];
  ruleIntroductionManifests?: readonly RuleIntroductionBaselineManifest[];
}

export function externalSourceFilePath(sourcePath: string): string {
  return sourcePath.split("#")[0] ?? sourcePath;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
