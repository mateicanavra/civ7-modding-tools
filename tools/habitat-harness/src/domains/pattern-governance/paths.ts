import { patternCandidateRoot, patternManifestRoot } from "../../lib/artifact-paths.ts";

export { patternCandidateRoot, patternManifestRoot };

export const patternManifestSchemaVersion = 1;

export function patternManifestPath(ruleId: string): string {
  return `${patternManifestRoot}/${ruleId}.json`;
}
