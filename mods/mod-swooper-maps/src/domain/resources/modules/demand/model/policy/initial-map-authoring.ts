import type {
  OfficialAgeType,
  OfficialResourceCorpusEntry,
  OfficialResourceType,
} from "@civ7/map-policy";
import { OFFICIAL_RESOURCE_CORPUS } from "@civ7/map-policy";

/** Age whose valid resource rows may be authored onto the initial map surface. */
export const INITIAL_MAP_RESOURCE_AUTHORING_AGE =
  "AGE_ANTIQUITY" as const satisfies OfficialAgeType;

export type InitialMapResourceAuthoringStatus =
  | "eligible"
  | "deferred-future-age"
  | "blocked-official"
  | "not-placeable";

export type InitialMapResourceAuthoringPolicyEntry = {
  readonly resourceType: OfficialResourceType;
  readonly authoringAge: OfficialAgeType;
  readonly status: InitialMapResourceAuthoringStatus;
  readonly validAges: readonly OfficialAgeType[];
  readonly rationale: string;
};

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function isOfficiallyInitialMapPlaceable(entry: OfficialResourceCorpusEntry): boolean {
  return entry.placeability.status === "placeable";
}

function statusFor(
  entry: OfficialResourceCorpusEntry,
  authoringAge: OfficialAgeType
): InitialMapResourceAuthoringStatus {
  if (!isOfficiallyInitialMapPlaceable(entry)) {
    return entry.placeability.status === "not-map-placed" ? "not-placeable" : "blocked-official";
  }
  return entry.validAges.includes(authoringAge) ? "eligible" : "deferred-future-age";
}

function rationaleFor(
  entry: OfficialResourceCorpusEntry,
  authoringAge: OfficialAgeType,
  status: InitialMapResourceAuthoringStatus
): string {
  if (status === "eligible") {
    return `${entry.resourceType} is official-placeable and valid in ${authoringAge}, so it may be authored into the initial map surface.`;
  }
  if (status === "deferred-future-age") {
    return `${entry.resourceType} is official-placeable but not valid in ${authoringAge}; keep its corpus and physical expectation visible, but do not author it onto the initial map surface.`;
  }
  if (status === "blocked-official") {
    return `${entry.resourceType} is blocked by the official corpus placement disposition; keep it visible, but do not author it onto the initial map surface.`;
  }
  return `${entry.resourceType} is not map-placeable in the official corpus; do not author it onto the initial map surface.`;
}

function buildPolicyForAge(
  authoringAge: OfficialAgeType
): readonly InitialMapResourceAuthoringPolicyEntry[] {
  return deepFreeze(
    OFFICIAL_RESOURCE_CORPUS.map((entry) => {
      const status = statusFor(entry, authoringAge);
      return {
        resourceType: entry.resourceType,
        authoringAge,
        status,
        validAges: entry.validAges,
        rationale: rationaleFor(entry, authoringAge, status),
      };
    })
  );
}

function byType(
  policy: readonly InitialMapResourceAuthoringPolicyEntry[]
): Readonly<Record<OfficialResourceType, InitialMapResourceAuthoringPolicyEntry>> {
  return deepFreeze(
    Object.fromEntries(policy.map((entry) => [entry.resourceType, entry]))
  ) as Readonly<Record<OfficialResourceType, InitialMapResourceAuthoringPolicyEntry>>;
}

/** Frozen corpus-wide initial-map disposition for the configured authoring age. */
export const INITIAL_MAP_RESOURCE_AUTHORING_POLICY = buildPolicyForAge(
  INITIAL_MAP_RESOURCE_AUTHORING_AGE
);

/** Constant-time lookup of the default-age authoring disposition by official resource type. */
export const INITIAL_MAP_RESOURCE_POLICY_BY_TYPE = byType(INITIAL_MAP_RESOURCE_AUTHORING_POLICY);

/** Official resource types admitted onto the configured initial-age map surface. */
export const INITIAL_MAP_RESOURCE_TYPES = deepFreeze(
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY.filter((entry) => entry.status === "eligible").map(
    (entry) => entry.resourceType
  )
) as readonly OfficialResourceType[];

/** Placeable resource types withheld from the initial map because they belong to later ages. */
export const DEFERRED_INITIAL_MAP_RESOURCE_TYPES = deepFreeze(
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY.filter(
    (entry) => entry.status === "deferred-future-age"
  ).map((entry) => entry.resourceType)
) as readonly OfficialResourceType[];

/**
 * Derives a frozen initial-map disposition for every official resource at an arbitrary age,
 * preserving blocked and not-placeable rows rather than dropping them from policy evidence.
 */
export function buildInitialMapResourceAuthoringPolicy(
  authoringAge: OfficialAgeType = INITIAL_MAP_RESOURCE_AUTHORING_AGE
): readonly InitialMapResourceAuthoringPolicyEntry[] {
  return buildPolicyForAge(authoringAge);
}

/**
 * Returns the official initial-map authoring disposition for one resource and age. The
 * Antiquity default uses the frozen lookup; other ages rebuild the corpus-derived policy so
 * future-age resources are never admitted by stale default data.
 */
export function getInitialMapResourcePolicyForType(
  resourceType: OfficialResourceType,
  authoringAge: OfficialAgeType = INITIAL_MAP_RESOURCE_AUTHORING_AGE
): InitialMapResourceAuthoringPolicyEntry | undefined {
  if (authoringAge === INITIAL_MAP_RESOURCE_AUTHORING_AGE) {
    return INITIAL_MAP_RESOURCE_POLICY_BY_TYPE[resourceType];
  }
  return byType(buildPolicyForAge(authoringAge))[resourceType];
}

/** Reports whether an official resource may be authored onto the initial surface for an age. */
export function isInitialMapResourceType(
  resourceType: OfficialResourceType,
  authoringAge: OfficialAgeType = INITIAL_MAP_RESOURCE_AUTHORING_AGE
): boolean {
  return getInitialMapResourcePolicyForType(resourceType, authoringAge)?.status === "eligible";
}
