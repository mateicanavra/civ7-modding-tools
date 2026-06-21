export const habitatArtifactsRoot = ".habitat";
export const habitatCacheRepoPath = `${habitatArtifactsRoot}/cache`;
export const habitatCacheRepoPathPrefix = `${habitatCacheRepoPath}/`;

export const ruleRegistryRepoPath = `${habitatArtifactsRoot}/rules`;
export const ruleRegistryIndexRepoPath = `${ruleRegistryRepoPath}/index.json`;
export const baselinesRepoPath = `${habitatArtifactsRoot}/baselines`;

export const patternRoot = `${habitatArtifactsRoot}/patterns`;
export const patternManifestRoot = `${patternRoot}/manifests`;
export const patternCandidateRoot = `${patternRoot}/candidates`;

export const checkPatternRoot = `${patternRoot}/checks`;
export const applyPatternRoot = `${patternRoot}/apply`;
export const sourceCheckPolicyRepoPath = `${habitatArtifactsRoot}/source-check/pattern-rules.mjs`;

export function baselineRepoPath(ruleId: string): string {
  return `${baselinesRepoPath}/${ruleId}.json`;
}
