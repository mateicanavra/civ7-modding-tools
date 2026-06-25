import {
  baselineRepoPath,
  checkPatternRoot,
  patternCandidateRoot,
  ruleRegistryRepoPath,
} from "@habitat/cli/resources/artifact-paths";

export function activePatternPathFor(options: { readonly patternName: string }) {
  return `${checkPatternRoot}/${options.patternName}.md`;
}

export function activeBaselinePathFor(options: { readonly ruleId: string }) {
  return baselineRepoPath(options.ruleId);
}

export function registeredRulePathFor(options: { readonly ruleId: string }) {
  return `${ruleRegistryRepoPath}/${options.ruleId}/rule.json`;
}

export function candidateArtifactPaths(options: {
  readonly ruleId: string;
  readonly patternName: string;
}) {
  return {
    patternPath: `${patternCandidateRoot}/${options.patternName}.md`,
    manifestPath: `${patternCandidateRoot}/${options.ruleId}.json`,
  };
}
