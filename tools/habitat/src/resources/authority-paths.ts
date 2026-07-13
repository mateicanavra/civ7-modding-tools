export const habitatAuthorityRoot = ".habitat";
export const habitatAuthorityProjectName = "habitat-authority";
export const habitatCacheRepoPath = `${habitatAuthorityRoot}/cache`;
export const habitatCacheRepoPathPrefix = `${habitatCacheRepoPath}/`;

export const ruleRegistryRepoPath = habitatAuthorityRoot;
export const ruleRegistryIndexRepoPath = `${habitatAuthorityRoot}/index.json`;
export const baselinesRepoPath = `${habitatAuthorityRoot}/baselines`;

export const patternRoot = `${habitatAuthorityRoot}/patterns`;
export const patternCandidateRoot = `${patternRoot}/candidates`;

export const checkPatternRoot = `${patternRoot}/checks`;

export function baselineRepoPath(ruleId: string): string {
  return `${baselinesRepoPath}/${ruleId}.json`;
}
