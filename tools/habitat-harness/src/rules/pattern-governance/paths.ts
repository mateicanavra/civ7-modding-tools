export const patternAuthorityManifestSchemaVersion = 1;
export const patternAuthorityManifestRoot =
  "tools/habitat-harness/src/rules/pattern-authority";
export const patternAuthorityCandidateRoot = `${patternAuthorityManifestRoot}/candidates`;

export function patternAuthorityManifestPath(ruleId: string): string {
  return `${patternAuthorityManifestRoot}/${ruleId}.json`;
}
