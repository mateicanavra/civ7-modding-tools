import type { OfficialAgeType, OfficialResourceType } from "./corpus/types.js";

export const INITIAL_MAP_RESOURCE_AUTHORING_AGE = "AGE_ANTIQUITY" as const;

export type InitialMapResourceAuthoringStatus =
  | "eligible"
  | "deferred-future-age"
  | "blocked-official"
  | "not-placeable";

export type InitialMapResourceAuthoringPolicyEntry = {
  readonly resourceType: OfficialResourceType;
  readonly staticResourceRowSlot: number;
  readonly authoringAge: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE;
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

type PolicyRow = readonly [
  staticResourceRowSlot: number,
  resourceType: OfficialResourceType,
  status: InitialMapResourceAuthoringStatus,
  validAges: readonly OfficialAgeType[],
];

const POLICY_ROWS = [
  [0, "RESOURCE_COTTON", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [1, "RESOURCE_DATES", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [2, "RESOURCE_DYES", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [3, "RESOURCE_FISH", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [4, "RESOURCE_GOLD", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [5, "RESOURCE_GOLD_DISTANT_LANDS", "blocked-official", []],
  [6, "RESOURCE_GYPSUM", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [7, "RESOURCE_INCENSE", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [8, "RESOURCE_IVORY", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [9, "RESOURCE_JADE", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [10, "RESOURCE_KAOLIN", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [11, "RESOURCE_MARBLE", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [12, "RESOURCE_PEARLS", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [13, "RESOURCE_SILK", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [14, "RESOURCE_SILVER", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [15, "RESOURCE_SILVER_DISTANT_LANDS", "blocked-official", []],
  [16, "RESOURCE_WINE", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [17, "RESOURCE_CAMELS", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [18, "RESOURCE_HIDES", "eligible", ["AGE_ANTIQUITY"]],
  [19, "RESOURCE_HORSES", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [20, "RESOURCE_IRON", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [21, "RESOURCE_SALT", "eligible", ["AGE_ANTIQUITY"]],
  [22, "RESOURCE_WOOL", "eligible", ["AGE_ANTIQUITY"]],
  [23, "RESOURCE_LAPIS_LAZULI", "blocked-official", ["AGE_ANTIQUITY"]],
  [24, "RESOURCE_COCOA", "deferred-future-age", ["AGE_EXPLORATION", "AGE_MODERN"]],
  [25, "RESOURCE_FURS", "deferred-future-age", ["AGE_EXPLORATION", "AGE_MODERN"]],
  [26, "RESOURCE_SPICES", "deferred-future-age", ["AGE_EXPLORATION", "AGE_MODERN"]],
  [27, "RESOURCE_SUGAR", "deferred-future-age", ["AGE_EXPLORATION", "AGE_MODERN"]],
  [28, "RESOURCE_TEA", "deferred-future-age", ["AGE_EXPLORATION", "AGE_MODERN"]],
  [29, "RESOURCE_TRUFFLES", "deferred-future-age", ["AGE_EXPLORATION", "AGE_MODERN"]],
  [30, "RESOURCE_NITER", "deferred-future-age", ["AGE_EXPLORATION", "AGE_MODERN"]],
  [31, "RESOURCE_CLOVES", "blocked-official", ["AGE_EXPLORATION"]],
  [32, "RESOURCE_WHALES", "deferred-future-age", ["AGE_EXPLORATION", "AGE_MODERN"]],
  [33, "RESOURCE_COFFEE", "deferred-future-age", ["AGE_MODERN"]],
  [34, "RESOURCE_TOBACCO", "deferred-future-age", ["AGE_MODERN"]],
  [35, "RESOURCE_CITRUS", "deferred-future-age", ["AGE_MODERN"]],
  [36, "RESOURCE_COAL", "deferred-future-age", ["AGE_MODERN"]],
  [37, "RESOURCE_NICKEL", "blocked-official", ["AGE_MODERN"]],
  [38, "RESOURCE_OIL", "deferred-future-age", ["AGE_MODERN"]],
  [39, "RESOURCE_QUININE", "deferred-future-age", ["AGE_MODERN"]],
  [40, "RESOURCE_RUBBER", "deferred-future-age", ["AGE_MODERN"]],
  [41, "RESOURCE_MANGOS", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [42, "RESOURCE_CLAY", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [43, "RESOURCE_FLAX", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [44, "RESOURCE_RUBIES", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [45, "RESOURCE_RICE", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [46, "RESOURCE_LIMESTONE", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [47, "RESOURCE_TIN", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [48, "RESOURCE_LLAMAS", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [49, "RESOURCE_HARDWOOD", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [50, "RESOURCE_WILD_GAME", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [51, "RESOURCE_CRABS", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [52, "RESOURCE_COWRIE", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"]],
  [53, "RESOURCE_TURTLES", "eligible", ["AGE_ANTIQUITY", "AGE_EXPLORATION"]],
  [54, "RESOURCE_PITCH", "deferred-future-age", ["AGE_EXPLORATION", "AGE_MODERN"]],
] as const satisfies readonly PolicyRow[];

function rationaleFor(
  resourceType: OfficialResourceType,
  status: InitialMapResourceAuthoringStatus
): string {
  if (status === "eligible") {
    return `${resourceType} is official-placeable and valid in ${INITIAL_MAP_RESOURCE_AUTHORING_AGE}, so it may be authored into the initial map surface.`;
  }
  if (status === "deferred-future-age") {
    return `${resourceType} is official-placeable but not valid in ${INITIAL_MAP_RESOURCE_AUTHORING_AGE}; keep its corpus and physical expectation visible, but do not author it onto the initial map surface.`;
  }
  if (status === "blocked-official") {
    return `${resourceType} is blocked by the official corpus placement disposition; keep it visible, but do not author it onto the initial map surface.`;
  }
  return `${resourceType} is not map-placeable in the official corpus; do not author it onto the initial map surface.`;
}

export const INITIAL_MAP_RESOURCE_AUTHORING_POLICY = deepFreeze(
  POLICY_ROWS.map(([staticResourceRowSlot, resourceType, status, validAges]) => ({
    resourceType,
    staticResourceRowSlot,
    authoringAge: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
    status,
    validAges,
    rationale: rationaleFor(resourceType, status),
  }))
);

export const INITIAL_MAP_RESOURCE_POLICY_BY_TYPE = deepFreeze(
  Object.fromEntries(
    INITIAL_MAP_RESOURCE_AUTHORING_POLICY.map((entry) => [entry.resourceType, entry])
  )
) as Readonly<Record<OfficialResourceType, InitialMapResourceAuthoringPolicyEntry>>;

export const INITIAL_MAP_RESOURCE_POLICY_BY_STATIC_SLOT = deepFreeze(
  Object.fromEntries(
    INITIAL_MAP_RESOURCE_AUTHORING_POLICY.map((entry) => [entry.staticResourceRowSlot, entry])
  )
) as Readonly<Record<number, InitialMapResourceAuthoringPolicyEntry>>;

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

export function getInitialMapResourcePolicyForType(
  resourceType: OfficialResourceType
): InitialMapResourceAuthoringPolicyEntry | undefined {
  return INITIAL_MAP_RESOURCE_POLICY_BY_TYPE[resourceType];
}

export function getInitialMapResourcePolicyForStaticSlot(
  staticResourceRowSlot: number
): InitialMapResourceAuthoringPolicyEntry | undefined {
  return INITIAL_MAP_RESOURCE_POLICY_BY_STATIC_SLOT[Math.trunc(staticResourceRowSlot)];
}

export function isInitialMapResourceType(resourceType: OfficialResourceType): boolean {
  return getInitialMapResourcePolicyForType(resourceType)?.status === "eligible";
}

export function isInitialMapResourceTypeId(resourceTypeId: number): boolean {
  return getInitialMapResourcePolicyForStaticSlot(resourceTypeId)?.status === "eligible";
}

export function filterInitialMapResourceTypeIds(
  values: readonly number[],
  noResourceSentinel: number
): number[] {
  const sentinel = Number.isFinite(noResourceSentinel) ? Math.trunc(noResourceSentinel) : -1;
  return Array.from(
    new Set(
      values
        .filter((value) => Number.isFinite(value))
        .map((value) => Math.trunc(value))
        .filter((value) => value >= 0 && value !== sentinel && isInitialMapResourceTypeId(value))
    )
  ).sort((a, b) => a - b);
}
