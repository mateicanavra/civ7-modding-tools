const ARTIFACT_TAG_PREFIX = /^artifact:/i;

export function formatArtifactLabel(id: string): string {
  const label = id.replace(ARTIFACT_TAG_PREFIX, "");
  return label.length > 0 ? label : id;
}

export function formatArtifactGroupLabel(artifacts: readonly string[]): string {
  if (artifacts.length === 0) return "dependency";
  const first = formatArtifactLabel(artifacts[0] ?? "artifact");
  return artifacts.length === 1 ? first : `${first} +${artifacts.length - 1}`;
}
