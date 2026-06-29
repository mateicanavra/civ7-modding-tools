import { checkPatternRoot, patternCandidateRoot } from "@habitat/cli/resources/artifact-paths";

export function activePatternPathFor(options: { readonly patternName: string }) {
  return `${checkPatternRoot}/${options.patternName}.md`;
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
