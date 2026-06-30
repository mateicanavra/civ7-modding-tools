import { type NormalizedPatternGeneratorOptions } from "./schema.ts";
import { patternCandidateRoot } from "../../lib/artifact-paths.ts";

export function candidateArtifactPaths(
  options: Pick<NormalizedPatternGeneratorOptions, "ruleId" | "patternName">
) {
  const root = patternCandidateRoot;
  return {
    patternPath: `${root}/${options.patternName}.md`,
    manifestPath: `${root}/${options.ruleId}.json`,
  };
}
