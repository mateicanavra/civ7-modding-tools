import { OFFICIAL_RESOURCE_CORPUS } from "../lib/corpus/index.js";
import type {
  OfficialAgeType,
  OfficialResourceCorpusEntry,
  OfficialResourceType,
} from "../lib/corpus/types.js";

export const INITIAL_MAP_RESOURCE_AUTHORING_AGE = "AGE_ANTIQUITY" as const satisfies OfficialAgeType;

export type InitialMapResourceAuthoringStatus =
  | "eligible"
  | "deferred-future-age"
  | "blocked-official"
  | "not-placeable";

export type InitialMapResourceAuthoringPolicyEntry = {
  readonly resourceType: OfficialResourceType;
  readonly staticResourceRowSlot: number;
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

const KNOWN_RESOURCE_AGES = new Set<OfficialAgeType>(
  OFFICIAL_RESOURCE_CORPUS.flatMap((entry) => entry.validAges)
);

function isKnownResourceAge(value: unknown): value is OfficialAgeType {
  return typeof value === "string" && KNOWN_RESOURCE_AGES.has(value as OfficialAgeType);
}

function isOfficiallyInitialMapPlaceable(entry: OfficialResourceCorpusEntry): boolean {
  return entry.placeability.status === "placeable" && entry.strategyRequired.status === "required";
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

function buildPolicyForAge(authoringAge: OfficialAgeType): readonly InitialMapResourceAuthoringPolicyEntry[] {
  return deepFreeze(
    OFFICIAL_RESOURCE_CORPUS.map((entry) => {
      const status = statusFor(entry, authoringAge);
      return {
        resourceType: entry.resourceType,
        staticResourceRowSlot: entry.staticResourceRowSlot,
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
  return deepFreeze(Object.fromEntries(policy.map((entry) => [entry.resourceType, entry]))) as Readonly<
    Record<OfficialResourceType, InitialMapResourceAuthoringPolicyEntry>
  >;
}

function byStaticSlot(
  policy: readonly InitialMapResourceAuthoringPolicyEntry[]
): Readonly<Record<number, InitialMapResourceAuthoringPolicyEntry>> {
  return deepFreeze(
    Object.fromEntries(policy.map((entry) => [entry.staticResourceRowSlot, entry]))
  ) as Readonly<Record<number, InitialMapResourceAuthoringPolicyEntry>>;
}

export const INITIAL_MAP_RESOURCE_AUTHORING_POLICY = buildPolicyForAge(
  INITIAL_MAP_RESOURCE_AUTHORING_AGE
);

export const INITIAL_MAP_RESOURCE_POLICY_BY_TYPE = byType(INITIAL_MAP_RESOURCE_AUTHORING_POLICY);

export const INITIAL_MAP_RESOURCE_POLICY_BY_STATIC_SLOT = byStaticSlot(
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY
);

export const INITIAL_MAP_RESOURCE_TYPES = deepFreeze(
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY.filter((entry) => entry.status === "eligible").map(
    (entry) => entry.resourceType
  )
) as readonly OfficialResourceType[];

export const INITIAL_MAP_RESOURCE_TYPE_IDS = deepFreeze(
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY.filter((entry) => entry.status === "eligible").map(
    (entry) => entry.staticResourceRowSlot
  )
) as readonly number[];

export const DEFERRED_INITIAL_MAP_RESOURCE_TYPES = deepFreeze(
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY.filter(
    (entry) => entry.status === "deferred-future-age"
  ).map((entry) => entry.resourceType)
) as readonly OfficialResourceType[];

export const DEFERRED_INITIAL_MAP_RESOURCE_TYPE_IDS = deepFreeze(
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY.filter(
    (entry) => entry.status === "deferred-future-age"
  ).map((entry) => entry.staticResourceRowSlot)
) as readonly number[];

export function buildInitialMapResourceAuthoringPolicy(
  authoringAge: OfficialAgeType = INITIAL_MAP_RESOURCE_AUTHORING_AGE
): readonly InitialMapResourceAuthoringPolicyEntry[] {
  return buildPolicyForAge(authoringAge);
}

export function resolveActiveResourceAge(): OfficialAgeType {
  const runtime = globalThis as typeof globalThis & {
    Game?: { age?: unknown };
    GameInfo?: { Ages?: { lookup?: (age: number) => { AgeType?: unknown } | null } };
  };
  const gameAge = runtime.Game?.age;
  const ageInfo =
    typeof gameAge === "number" && Number.isFinite(gameAge)
      ? runtime.GameInfo?.Ages?.lookup?.(gameAge)
      : null;
  const activeAge = ageInfo?.AgeType;
  return isKnownResourceAge(activeAge) ? activeAge : INITIAL_MAP_RESOURCE_AUTHORING_AGE;
}

export function filterResourceCandidatesForAge(
  candidateResourceTypes: readonly number[],
  activeAge: OfficialAgeType
): number[] {
  const allowedStaticSlots = new Set(
    buildPolicyForAge(activeAge)
      .filter((entry) => entry.status === "eligible")
      .map((entry) => entry.staticResourceRowSlot)
  );
  return candidateResourceTypes.filter((resourceType) => allowedStaticSlots.has(resourceType));
}

export function getInitialMapResourcePolicyForType(
  resourceType: OfficialResourceType,
  authoringAge: OfficialAgeType = INITIAL_MAP_RESOURCE_AUTHORING_AGE
): InitialMapResourceAuthoringPolicyEntry | undefined {
  if (authoringAge === INITIAL_MAP_RESOURCE_AUTHORING_AGE) {
    return INITIAL_MAP_RESOURCE_POLICY_BY_TYPE[resourceType];
  }
  return byType(buildPolicyForAge(authoringAge))[resourceType];
}

export function getInitialMapResourcePolicyForStaticSlot(
  staticResourceRowSlot: number,
  authoringAge: OfficialAgeType = INITIAL_MAP_RESOURCE_AUTHORING_AGE
): InitialMapResourceAuthoringPolicyEntry | undefined {
  const slot = Math.trunc(staticResourceRowSlot);
  if (authoringAge === INITIAL_MAP_RESOURCE_AUTHORING_AGE) {
    return INITIAL_MAP_RESOURCE_POLICY_BY_STATIC_SLOT[slot];
  }
  return byStaticSlot(buildPolicyForAge(authoringAge))[slot];
}

export function isInitialMapResourceType(
  resourceType: OfficialResourceType,
  authoringAge: OfficialAgeType = INITIAL_MAP_RESOURCE_AUTHORING_AGE
): boolean {
  return getInitialMapResourcePolicyForType(resourceType, authoringAge)?.status === "eligible";
}

export function isInitialMapResourceTypeId(
  resourceTypeId: number,
  authoringAge: OfficialAgeType = INITIAL_MAP_RESOURCE_AUTHORING_AGE
): boolean {
  return getInitialMapResourcePolicyForStaticSlot(resourceTypeId, authoringAge)?.status === "eligible";
}

export function filterInitialMapResourceTypeIds(
  values: readonly number[],
  noResourceSentinel: number,
  authoringAge: OfficialAgeType = resolveActiveResourceAge()
): number[] {
  const sentinel = Number.isFinite(noResourceSentinel) ? Math.trunc(noResourceSentinel) : -1;
  const candidates = Array.from(
    new Set(
      values
        .filter((value) => Number.isFinite(value))
        .map((value) => Math.trunc(value))
        .filter((value) => value >= 0 && value !== sentinel)
    )
  ).sort((a, b) => a - b);
  return filterResourceCandidatesForAge(candidates, authoringAge);
}
