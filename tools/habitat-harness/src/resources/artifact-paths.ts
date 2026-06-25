export const habitatArtifactsRoot = ".habitat";
export const habitatArtifactsProjectName = "@internal/habitat-artifacts";
export const habitatCacheRepoPath = `${habitatArtifactsRoot}/cache`;
export const habitatCacheRepoPathPrefix = `${habitatCacheRepoPath}/`;

export const ruleRegistryRepoPath = habitatArtifactsRoot;
export const ruleRegistryIndexRepoPath = `${habitatArtifactsRoot}/habitat/toolkit/_self/triage/rule-pack-index/index.json`;
export const baselinesRepoPath = `${habitatArtifactsRoot}/baselines`;

export const patternRoot = `${habitatArtifactsRoot}/patterns`;
export const patternManifestRoot = `${patternRoot}/manifests`;
export const patternCandidateRoot = `${patternRoot}/candidates`;

export const checkPatternRoot = `${patternRoot}/checks`;
export const applyPatternRoot = `${patternRoot}/apply`;

export function baselineRepoPath(ruleId: string): string {
  return `${baselinesRepoPath}/${ruleId}.json`;
}
