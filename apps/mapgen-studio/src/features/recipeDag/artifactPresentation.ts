import { chooseRecipeDagDomainId, normalizeRecipeDagDomainId } from "./domainPresentation";

const ARTIFACT_TAG_PREFIX = /^artifact:/i;

export type ArtifactPresentation = Readonly<{
  id: string;
  domainId: string | null;
  label: string;
}>;

export function parseArtifactPresentation(id: string): ArtifactPresentation {
  const withoutTag = id.replace(ARTIFACT_TAG_PREFIX, "");
  const segments = withoutTag.split(".").filter((segment) => segment.length > 0);
  const domainId = resolveSemanticArtifactDomainId(withoutTag, segments);
  if (segments.length < 2) {
    return {
      id,
      domainId,
      label: formatLocalArtifactLabel(withoutTag.length > 0 ? withoutTag : id, domainId),
    };
  }

  const [, ...localSegments] = segments;
  const visibleSegments = localSegments.filter((segment) => !segment.startsWith("_"));
  const localLabel = visibleSegments.at(-1) ?? localSegments.at(-1) ?? withoutTag;
  const label = formatLocalArtifactLabel(localLabel, domainId);

  return {
    id,
    domainId,
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
  const [first] = domains.map((domainId) => normalizeRecipeDagDomainId(domainId));
  return domains.every((domainId) => normalizeRecipeDagDomainId(domainId) === first) ? first ?? null : null;
}

function resolveSemanticArtifactDomainId(withoutTag: string, segments: readonly string[]): string | null {
  const candidates = segments.length > 1 ? segments : [withoutTag];
  const mapNamespaceCandidates = segments[0] === "map" ? segments.slice(1) : [];
  const domainId = chooseRecipeDagDomainId([...mapNamespaceCandidates, ...candidates]);
  return domainId;
}

function formatLocalArtifactLabel(label: string, domainId: string | null): string {
  const normalizedDomain = normalizeRecipeDagDomainId(domainId);
  const domainPrefixPatterns: Partial<Record<ReturnType<typeof normalizeRecipeDagDomainId>, RegExp>> = {
    foundation: /^foundation(?=[A-Z0-9_-])/,
    hydrology: /^hydrology(?=[A-Z0-9_-])/,
    ecology: /^ecology(?=[A-Z0-9_-])/,
    morphology: /^morphology(?=[A-Z0-9_-])/,
    placement: /^placement(?=[A-Z0-9_-])/,
    climate: /^climate(?=[A-Z0-9_-])/,
  };
  const pattern = domainPrefixPatterns[normalizedDomain];
  const nextLabel = pattern ? label.replace(pattern, "") : label;
  return nextLabel.length > 0 ? nextLabel : label;
}
