const ARTIFACT_TAG_PREFIX = /^artifact:/i;

export type ArtifactPresentation = Readonly<{
  id: string;
  domainId: string | null;
  label: string;
}>;

export function parseArtifactPresentation(id: string): ArtifactPresentation {
  const withoutTag = id.replace(ARTIFACT_TAG_PREFIX, "");
  const segments = withoutTag.split(".").filter((segment) => segment.length > 0);
  if (segments.length < 2) {
    return {
      id,
      domainId: null,
      label: withoutTag.length > 0 ? withoutTag : id,
    };
  }

  const [, ...localSegments] = segments;
  const visibleSegments = localSegments.filter((segment) => !segment.startsWith("_"));
  const label = visibleSegments.at(-1) ?? localSegments.at(-1) ?? withoutTag;

  return {
    id,
    domainId: segments[0] ?? null,
    label,
  };
}

export function formatArtifactLabel(id: string): string {
  return parseArtifactPresentation(id).label;
}

export function formatArtifactGroupLabel(artifacts: readonly string[]): string {
  if (artifacts.length === 0) return "dependency";
  const first = formatArtifactLabel(artifacts[0] ?? "artifact");
  return artifacts.length === 1 ? first : `${first} +${artifacts.length - 1}`;
}

export function resolveArtifactGroupDomainId(artifacts: readonly string[]): string | null {
  const domains = artifacts
    .map((artifact) => parseArtifactPresentation(artifact).domainId)
    .filter((domainId): domainId is string => Boolean(domainId));
  if (domains.length === 0) return null;
  const [first] = domains;
  return domains.every((domainId) => domainId === first) ? first : null;
}
