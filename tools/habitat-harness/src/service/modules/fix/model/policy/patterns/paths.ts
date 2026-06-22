import {
  patternCandidateRoot,
  patternManifestRoot,
} from "@internal/habitat-harness/resources/artifact-paths";

export { patternCandidateRoot, patternManifestRoot };

export const patternManifestSchemaVersion = 1;

export function patternManifestPath(ruleId: string): string {
  return `${patternManifestRoot}/${ruleId}.json`;
}
