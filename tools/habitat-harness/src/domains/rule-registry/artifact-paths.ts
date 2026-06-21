export interface HabitatArtifactPathPlan {
  readonly paths: readonly string[];
  readonly allHabitatArtifacts: boolean;
  readonly hasSourceCheckArtifact: boolean;
  readonly hasGritPatternArtifact: boolean;
}

export function habitatArtifactPathPlan(changedPaths: readonly string[]): HabitatArtifactPathPlan {
  const paths = changedPaths.map(normalizeRepoPath).filter(Boolean);
  return {
    paths,
    allHabitatArtifacts: paths.length > 0 && paths.every(isHabitatArtifactPath),
    hasSourceCheckArtifact: paths.some(isSourceCheckArtifactPath),
    hasGritPatternArtifact: paths.some(isGritPatternArtifactPath),
  };
}

function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

function isHabitatArtifactPath(filePath: string): boolean {
  return filePath === ".habitat" || filePath.startsWith(".habitat/");
}

function isSourceCheckArtifactPath(filePath: string): boolean {
  return filePath.startsWith(".habitat/source-check/") || filePath.startsWith(".habitat/rules/");
}

function isGritPatternArtifactPath(filePath: string): boolean {
  return filePath.startsWith(".habitat/patterns/");
}
