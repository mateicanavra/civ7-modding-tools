import { type NormalizedPatternGeneratorOptions } from "./schema.ts";

export function candidateArtifactPaths(
  options: Pick<NormalizedPatternGeneratorOptions, "ruleId" | "patternName">
) {
  const root = "tools/habitat-harness/src/rules/pattern-authority/candidates";
  return {
    patternPath: `${root}/${options.patternName}.md`,
    manifestPath: `${root}/${options.ruleId}.json`,
  };
}
