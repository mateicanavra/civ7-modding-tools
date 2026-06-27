export const habitatArtifactsRoot = ".habitat";
export const habitatArtifactsProjectName = "habitat-artifacts";
export const habitatCacheRepoPath = `${habitatArtifactsRoot}/cache`;
export const habitatCacheRepoPathPrefix = `${habitatCacheRepoPath}/`;

export const ruleRegistryRepoPath = habitatArtifactsRoot;
export const ruleRegistryIndexRepoPath = `${habitatArtifactsRoot}/index.json`;
export const baselinesRepoPath = `${habitatArtifactsRoot}/baselines`;

export const patternRoot = `${habitatArtifactsRoot}/patterns`;
export const patternManifestRoot = `${patternRoot}/manifests`;
export const patternCandidateRoot = `${patternRoot}/candidates`;

export const checkPatternRoot = `${patternRoot}/checks`;
export const applyPatternRoot = `${patternRoot}/apply`;

export function baselineRepoPath(ruleId: string): string {
  return `${baselinesRepoPath}/${ruleId}.json`;
}
