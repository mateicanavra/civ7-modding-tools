import type {
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcDestinationAnalysisResult,
  Civ7ControlOrpcTargetCandidatesResult,
} from "./dependencies/direct-control";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;

type MapLocation = Readonly<{ x: number; y: number }>;
type StrategyUnit = Civ7ControlOrpcBattlefieldScanResult["units"] extends
  ReadonlyArray<infer Unit> ? Unit : never;
type StrategyCity = Civ7ControlOrpcBattlefieldScanResult["cities"] extends
  ReadonlyArray<infer City> ? City : never;
type StrategyOwner = Civ7ControlOrpcBattlefieldScanResult["owners"] extends
  ReadonlyArray<infer Owner> ? Owner : never;

export type Civ7GameUiStrategyFrontTarget = Readonly<{
  Cities?: {
    get?: (id: Civ7ControlOrpcComponentId) => unknown;
  };
  GameContext?: {
    localPlayerID?: number;
  };
  GameInfo?: {
    Units?: {
      lookup?: (type: unknown) => unknown;
    };
  };
  GameplayMap?: {
    isWater?: (x: number, y: number) => unknown;
  };
  Players?: {
    get?: (playerId: number) => unknown;
    getAliveIds?: () => readonly number[];
    Cities?: {
      get?: (playerId: number) => {
        getCityIds?: () => readonly Civ7ControlOrpcComponentId[];
      } | null;
    };
    Units?: {
      get?: (playerId: number) => {
        getUnitIds?: () => readonly Civ7ControlOrpcComponentId[];
      } | null;
    };
  };
  UI?: {
    Player?: {
      getFirstReadyUnit?: () => unknown;
      getHeadSelectedUnit?: () => unknown;
    };
  };
  Units?: {
    get?: (id: Civ7ControlOrpcComponentId) => unknown;
  };
}>;

export function civ7GameUiStrategyFrontAvailable(
  target: Civ7GameUiStrategyFrontTarget,
): boolean {
  return typeof target.GameContext?.localPlayerID === "number"
    && typeof target.Players?.getAliveIds === "function"
    && typeof target.Players?.get === "function"
    && typeof target.Players?.Units?.get === "function"
    && typeof target.Players?.Cities?.get === "function"
    && typeof target.Units?.get === "function"
    && typeof target.Cities?.get === "function";
}

export async function getCiv7GameUiTargetCandidates(
  input: Readonly<{
    playerId?: number;
    origins?: readonly MapLocation[];
    maxCandidates?: number;
    maxPlayers?: number;
    unitRadius?: number;
  }> = {},
  target: Civ7GameUiStrategyFrontTarget =
    globalThis as Civ7GameUiStrategyFrontTarget,
): Promise<Civ7ControlOrpcTargetCandidatesResult> {
  if (!civ7GameUiStrategyFrontAvailable(target)) {
    throw new Error("Civ7 game UI strategy front dependency is unavailable.");
  }
  const localPlayerId = target.GameContext?.localPlayerID ?? 0;
  const playerId = input.playerId ?? localPlayerId;
  const maxCandidates = boundedInteger(input.maxCandidates ?? 8, 1, 64);
  const maxPlayers = boundedInteger(input.maxPlayers ?? 32, 1, 128);
  const unitRadius = boundedInteger(input.unitRadius ?? 4, 0, 16);
  const origins = collectOrigins(input.origins, playerId, target);

  const candidates = alivePlayerIds(target)
    .filter((owner) => owner !== playerId)
    .slice(0, maxPlayers)
    .map((owner) => targetCandidateFor(owner, { playerId, origins, unitRadius }, target))
    .filter((candidate): candidate is NonNullable<typeof candidate> =>
      candidate != null
    )
    .sort((left, right) => {
      const leftDistance = left.nearestDistance ?? 9_999;
      const rightDistance = right.nearestDistance ?? 9_999;
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      if (left.nearbyUnitCount !== right.nearbyUnitCount) {
        return left.nearbyUnitCount - right.nearbyUnitCount;
      }
      return left.apparentStrength - right.apparentStrength;
    })
    .slice(0, maxCandidates);

  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    localPlayerId,
    playerId,
    origins,
    unitRadius,
    hiddenInfoPolicy:
      "game-ui-runtime-summary; may include game-resident unit or city summaries until paired with visibility reads",
    relationshipLabelPolicy,
    candidates,
    notes: [
      "Read-only game UI target-candidate runtime port for strategy.frontSummary.",
      "Other-owner candidates stay relationship-unproven until official relationship evidence proves more.",
      "Use unit action validation before any movement or target send.",
    ],
  };
}

export async function getCiv7GameUiBattlefieldScan(
  input: Readonly<{
    playerId?: number;
    origins?: readonly MapLocation[];
    radius?: number;
    maxPlayers?: number;
    maxUnits?: number;
    maxCities?: number;
  }> = {},
  target: Civ7GameUiStrategyFrontTarget =
    globalThis as Civ7GameUiStrategyFrontTarget,
): Promise<Civ7ControlOrpcBattlefieldScanResult> {
  if (!civ7GameUiStrategyFrontAvailable(target)) {
    throw new Error("Civ7 game UI strategy front dependency is unavailable.");
  }
  const localPlayerId = target.GameContext?.localPlayerID ?? 0;
  const playerId = input.playerId ?? localPlayerId;
  const radius = boundedInteger(input.radius ?? 8, 1, 32);
  const maxPlayers = boundedInteger(input.maxPlayers ?? 32, 1, 128);
  const maxUnits = boundedInteger(input.maxUnits ?? 80, 1, 256);
  const maxCities = boundedInteger(input.maxCities ?? 32, 1, 128);
  const origins = collectOrigins(input.origins, playerId, target);
  const units: StrategyUnit[] = [];
  const cities: StrategyCity[] = [];
  const owners: StrategyOwner[] = [];

  for (const owner of alivePlayerIds(target).slice(0, maxPlayers)) {
    const ownerUnits = ownerUnitIds(owner, target)
      .map((id) => battlefieldUnit(id, playerId, origins, radius, target))
      .filter((unit): unit is StrategyUnit => unit != null);
    const ownerCities = ownerCityIds(owner, target)
      .map((id) => battlefieldCity(id, playerId, origins, radius, target))
      .filter((city): city is StrategyCity => city != null);
    if (ownerUnits.length === 0 && ownerCities.length === 0) continue;
    units.push(...ownerUnits);
    cities.push(...ownerCities);
    owners.push(ownerSummary(owner, playerId, ownerUnits, ownerCities));
  }

  const limitedUnits = units
    .sort((left, right) => left.distance - right.distance || right.strength - left.strength)
    .slice(0, maxUnits);
  const limitedCities = cities
    .sort((left, right) => left.distance - right.distance)
    .slice(0, maxCities);

  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    localPlayerId,
    playerId,
    origins,
    radius,
    hiddenInfoPolicy:
      "game-ui-runtime-summary; may include game-resident unit or city summaries until paired with visibility reads",
    relationshipLabelPolicy,
    units: limitedUnits,
    cities: limitedCities,
    owners: owners.sort((left, right) => {
      if (left.stance !== right.stance) return left.stance === "friendly" ? -1 : 1;
      return right.apparentStrength - left.apparentStrength;
    }),
    pointsOfInterest: pointsOfInterest(playerId, limitedUnits, limitedCities, owners),
    notes: [
      "Read-only game UI battlefield runtime port for strategy.frontSummary.",
      "Owner mismatch is contact evidence, not relationship proof.",
      "Use unit action validation before any movement or target send.",
    ],
  };
}

export async function getCiv7GameUiDestinationAnalysis(
  input: Readonly<{
    playerId?: number;
    origin?: MapLocation;
    destination: MapLocation;
    corridorRadius?: number;
    destinationRadius?: number;
    maxPlayers?: number;
    maxUnits?: number;
    maxCities?: number;
  }>,
  target: Civ7GameUiStrategyFrontTarget =
    globalThis as Civ7GameUiStrategyFrontTarget,
): Promise<Civ7ControlOrpcDestinationAnalysisResult> {
  if (!civ7GameUiStrategyFrontAvailable(target)) {
    throw new Error("Civ7 game UI strategy front dependency is unavailable.");
  }
  const localPlayerId = target.GameContext?.localPlayerID ?? 0;
  const playerId = input.playerId ?? localPlayerId;
  const destinationRadius = boundedInteger(input.destinationRadius ?? 4, 1, 16);
  const corridorRadius = boundedInteger(input.corridorRadius ?? 2, 0, 8);
  const scan = await getCiv7GameUiBattlefieldScan({
    playerId,
    origins: [input.destination],
    radius: destinationRadius,
    maxPlayers: input.maxPlayers,
    maxUnits: input.maxUnits,
    maxCities: input.maxCities,
  }, target);
  const destinationUnits = scan.units.map((unit) => ({
    ...unit,
    destinationDistance: unit.distance,
  }));
  const destinationCities = scan.cities.map((city) => ({
    ...city,
    destinationDistance: city.distance,
  }));

  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    localPlayerId,
    playerId,
    origin: input.origin ?? null,
    destination: input.destination,
    corridorRadius,
    destinationRadius,
    hiddenInfoPolicy:
      "game-ui-runtime-summary; may include game-resident unit or city summaries until paired with visibility reads",
    relationshipLabelPolicy,
    corridor: {
      routeHint: "direct-grid",
      directGridDistance: input.origin == null
        ? null
        : distance(input.origin, input.destination),
      sampleCount: input.origin == null ? 0 : 2,
      sampledPlots: input.origin == null
        ? []
        : [input.origin, input.destination],
      units: [],
      unitCount: 0,
    },
    destinationPressure: {
      units: destinationUnits,
      unitCount: destinationUnits.length,
      cities: destinationCities,
      cityCount: destinationCities.length,
      apparentOtherStrength: scan.owners
        .filter((owner) => owner.relationshipProof !== "self")
        .reduce((sum, owner) => sum + owner.apparentStrength, 0),
    },
    pointsOfInterest: scan.pointsOfInterest.map((point) => ({
      kind: point.kind,
      severity: point.severity,
      location: point.location,
      summary: point.summary,
      units: destinationUnits,
      cities: destinationCities,
    })),
    notes: [
      "Read-only game UI destination-analysis runtime port for strategy.frontSummary.",
      "Owner mismatch and proximity remain relationship-unproven planning evidence.",
      "Use visibility and validator-backed unit action procedures before any mutation.",
    ],
  };
}

const relationshipLabelPolicy = {
  relationshipSource: "not-classified",
  relationshipProof: "none",
  unprovenLabel: "relationship-unproven",
  guidance:
    "Game UI tactical reads expose owner ids and proximity only. They do not classify relationship, alliance, neutrality, suzerain, or war-target status without official relationship, team, diplomacy, independent-power, or war-state evidence.",
} as const;

function targetCandidateFor(
  owner: number,
  input: Readonly<{
    playerId: number;
    origins: readonly MapLocation[];
    unitRadius: number;
  }>,
  target: Civ7GameUiStrategyFrontTarget,
): Civ7ControlOrpcTargetCandidatesResult["candidates"][number] | null {
  const player = target.Players?.get?.(owner);
  const units = ownerUnitIds(owner, target)
    .map((id) => candidateUnit(id, target))
    .filter((unit): unit is NonNullable<typeof unit> => unit != null);
  const cities = ownerCityIds(owner, target)
    .map((id) => candidateCity(id, target))
    .filter((city): city is NonNullable<typeof city> => city != null);
  if (units.length === 0 && cities.length === 0) return null;

  const cityTargets = cities
    .map((city) => ({ city, ...bestDistance(city.location, input.origins) }))
    .sort((left, right) => (left.distance ?? 9_999) - (right.distance ?? 9_999));
  const nearestCity = cityTargets[0]
    ? {
        city: cityTargets[0].city,
        distance: cityTargets[0].distance,
        nearestOrigin: cityTargets[0].nearestOrigin,
      }
    : null;
  const fallbackUnit = nearestCity == null
    ? nearestUnitTarget(units, input.origins)
    : null;
  const selected = nearestCity ?? fallbackUnit;
  const targetLocation = selected == null
    ? null
    : selected.city?.location ?? ("unit" in selected ? selected.unit.location : null);
  const nearbyUnits = targetLocation == null
    ? []
    : units.filter((unit) => {
        const value = distance(unit.location, targetLocation);
        return value != null && value <= input.unitRadius;
      });
  const apparentStrength = round1(
    nearbyUnits.reduce((sum, unit) => sum + unit.strength, 0),
  );
  const route = routeApproach(selected?.nearestOrigin ?? null, targetLocation, target);
  const reasons: string[] = [];
  if (selected?.distance != null) reasons.push(`nearest target distance ${selected.distance}`);
  if (cities.length === 1) reasons.push("single known city target");
  if (nearbyUnits.length <= 4) reasons.push("low nearby unit density");
  if (nearbyUnits.length > 8) reasons.push("high nearby unit density");

  return {
    owner,
    leaderName: probe(() => readValue(player, ["leaderName", "name"], ["getLeaderName", "getName"])),
    civilizationName: probe(() =>
      readValue(player, ["civilizationName", "civilizationType"], [
        "getCivilizationName",
        "getCivilizationType",
      ])
    ),
    isHuman: probe(() => readValue(player, ["isHuman"], ["isHuman"])),
    cityCount: cities.length,
    unitCount: units.length,
    cities: cityTargets.slice(0, 12).map((entry) => ({
      ...entry.city,
      distance: entry.distance,
      nearestOrigin: entry.nearestOrigin,
      water: plotWater(entry.city.location, target),
    })),
    nearestCity: selected?.city ?? null,
    nearestDistance: selected?.distance ?? null,
    nearbyUnits: nearbyUnits.slice(0, 12),
    nearbyUnitCount: nearbyUnits.length,
    apparentStrength,
    approach: {
      nearestOrigin: selected?.nearestOrigin ?? null,
      targetLocation,
      directGridDistance: distance(selected?.nearestOrigin ?? null, targetLocation),
      routeKind: route.routeKind,
      routeHint: routeHint(selected?.distance ?? null, nearbyUnits.length, cities.length),
      originWater: route.originWater,
      targetWater: route.targetWater,
      waterSampleCount: route.waterSampleCount,
      landSampleCount: route.landSampleCount,
      notes: [
        "Distance is a cheap grid heuristic for target ranking, not a pathfinder result.",
        "Route kind is sampled from endpoints and a straight grid line; it is not Civ pathfinding.",
        "Use map/visibility and unit-target validation before moving or attacking.",
      ],
    },
    reasons,
  };
}

function candidateUnit(
  id: Civ7ControlOrpcComponentId,
  target: Civ7GameUiStrategyFrontTarget,
) {
  const unit = target.Units?.get?.(id);
  if (unit == null || typeof unit !== "object") return null;
  const record = unit as Record<string, any>;
  const location = toLocation(record.location ?? record.getLocation?.());
  if (location == null) return null;
  const type = record.type ?? record.getType?.();
  const typeName = unitTypeName(type, target);
  return {
    id: toComponentId(record.id ?? id) ?? id,
    owner: Number(record.owner ?? record.player ?? record.getOwner?.()),
    type,
    typeName,
    location,
    damage: Number(record.damage ?? record.Health?.damage ?? 0),
    strength: unitStrength(record, typeName, target),
  };
}

function candidateCity(
  id: Civ7ControlOrpcComponentId,
  target: Civ7GameUiStrategyFrontTarget,
) {
  const city = target.Cities?.get?.(id);
  if (city == null || typeof city !== "object") return null;
  const record = city as Record<string, any>;
  const location = toLocation(record.location ?? record.getLocation?.());
  if (location == null) return null;
  return {
    id: toComponentId(id) ?? id,
    observedCityId: toComponentId(record.id),
    owner: Number(record.owner ?? record.player ?? record.getOwner?.()),
    name: typeof record.getName === "function" ? record.getName() : record.name ?? null,
    location,
    population: record.population ?? null,
    isTown: record.isTown ?? null,
  };
}

function battlefieldUnit(
  id: Civ7ControlOrpcComponentId,
  playerId: number,
  origins: readonly MapLocation[],
  radius: number,
  target: Civ7GameUiStrategyFrontTarget,
): StrategyUnit | null {
  const unit = candidateUnit(id, target);
  if (unit == null) return null;
  const proximity = bestDistance(unit.location, origins);
  if (proximity.distance == null || proximity.distance > radius) return null;
  return {
    id: unit.id,
    owner: unit.owner,
    stance: unit.owner === playerId ? "friendly" : "other",
    relationshipProof: unit.owner === playerId ? "self" : "none",
    relationshipLabel: unit.owner === playerId ? "friendly" : "relationship-unproven",
    type: unit.type,
    typeName: unit.typeName,
    role: roleForUnit(unit.typeName),
    location: unit.location,
    distance: proximity.distance,
    nearestOrigin: proximity.nearestOrigin,
    damage: unit.damage,
    wounded: unit.damage > 0,
    strength: unit.strength,
    movementMovesRemaining: null,
    attacksRemaining: null,
  } as StrategyUnit;
}

function battlefieldCity(
  id: Civ7ControlOrpcComponentId,
  playerId: number,
  origins: readonly MapLocation[],
  radius: number,
  target: Civ7GameUiStrategyFrontTarget,
): StrategyCity | null {
  const city = candidateCity(id, target);
  if (city == null) return null;
  const proximity = bestDistance(city.location, origins);
  if (proximity.distance == null || proximity.distance > radius) return null;
  return {
    id: city.id,
    observedCityId: city.observedCityId,
    owner: city.owner,
    stance: city.owner === playerId ? "friendly" : "other",
    relationshipProof: city.owner === playerId ? "self" : "none",
    relationshipLabel: city.owner === playerId ? "friendly" : "relationship-unproven",
    name: city.name,
    location: city.location,
    distance: proximity.distance,
    nearestOrigin: proximity.nearestOrigin,
    population: city.population,
    isTown: city.isTown,
  } as StrategyCity;
}

function ownerSummary(
  owner: number,
  playerId: number,
  units: readonly StrategyUnit[],
  cities: readonly StrategyCity[],
): StrategyOwner {
  const roles = units.reduce<Record<string, number>>((out, unit) => {
    out[unit.role] = (out[unit.role] ?? 0) + 1;
    return out;
  }, {});
  const nearestUnit = nearestByDistance(units);
  const nearestCity = nearestByDistance(cities);
  return {
    owner,
    stance: owner === playerId ? "friendly" : "other",
    relationshipProof: owner === playerId ? "self" : "none",
    relationshipLabel: owner === playerId ? "friendly" : "relationship-unproven",
    unitCount: units.length,
    cityCount: cities.length,
    roles,
    apparentStrength: round1(
      units.reduce((sum, unit) => sum + (Number(unit.strength) || 0), 0),
    ),
    nearestUnit,
    nearestCity,
  } as StrategyOwner;
}

function pointsOfInterest(
  playerId: number,
  units: readonly StrategyUnit[],
  cities: readonly StrategyCity[],
  owners: readonly StrategyOwner[],
): Civ7ControlOrpcBattlefieldScanResult["pointsOfInterest"] {
  const points: Civ7ControlOrpcBattlefieldScanResult["pointsOfInterest"] = [];
  const otherUnits = units.filter((unit) => unit.owner !== playerId);
  const ownUnits = units.filter((unit) => unit.owner === playerId);
  const closeOther = otherUnits.filter((unit) => unit.distance <= 3);
  if (closeOther.length > 0) {
    points.push({
      kind: "nearby-other-owners",
      severity: closeOther.length >= 4 ? "high" : "medium",
      location: closeOther[0]?.location ?? null,
      summary: `${closeOther.length} other-owner units within 3 tiles of an origin`,
      units: closeOther.slice(0, 8),
    });
  }

  const woundedOwn = ownUnits
    .filter((unit) => unit.wounded)
    .sort((left, right) => right.damage - left.damage);
  if (woundedOwn.length > 0) {
    points.push({
      kind: "wounded-friendly",
      severity: woundedOwn[0].damage >= 50 ? "high" : "medium",
      location: woundedOwn[0].location,
      summary: "friendly wounded unit near scan origin",
      units: woundedOwn.slice(0, 6),
    });
  }

  const otherCities = cities
    .filter((city) => city.owner !== playerId)
    .sort((left, right) => left.distance - right.distance);
  if (otherCities.length > 0) {
    points.push({
      kind: "city-front",
      severity: otherCities[0].distance <= 6 ? "medium" : "low",
      location: otherCities[0].location,
      summary: "nearest relationship-unproven city in scan radius",
      cities: otherCities.slice(0, 4),
    });
  }

  const strongestOther = [...owners]
    .filter((entry) => entry.owner !== playerId)
    .sort((left, right) => right.apparentStrength - left.apparentStrength)[0];
  if (strongestOther != null && strongestOther.apparentStrength > 0) {
    const nearestUnit = strongestOther.nearestUnit as { location?: MapLocation } | null;
    const nearestCity = strongestOther.nearestCity as { location?: MapLocation } | null;
    points.push({
      kind: "owner-pressure",
      severity: strongestOther.apparentStrength >= 60 ? "high" : "medium",
      location: nearestUnit?.location ?? nearestCity?.location ?? null,
      summary: "strongest other-owner pressure in scan radius",
    });
  }
  return points;
}

function collectOrigins(
  requested: readonly MapLocation[] | undefined,
  playerId: number,
  target: Civ7GameUiStrategyFrontTarget,
): MapLocation[] {
  const inputOrigins = requested?.map(toLocation).filter(isLocation) ?? [];
  if (inputOrigins.length > 0) return inputOrigins.slice(0, 12);
  const origins: MapLocation[] = [];
  for (const getter of [
    target.UI?.Player?.getFirstReadyUnit,
    target.UI?.Player?.getHeadSelectedUnit,
  ]) {
    const id = probe(() => getter?.()).ok ? getter?.() : null;
    const unit = toComponentId(id) == null ? null : target.Units?.get?.(toComponentId(id)!);
    const location = unitLocation(unit);
    if (location != null) origins.push(location);
  }
  for (const cityId of ownerCityIds(playerId, target)) {
    const city = target.Cities?.get?.(cityId);
    const location = cityLocation(city);
    if (location != null) origins.push(location);
    if (origins.length >= 6) break;
  }
  return origins.slice(0, 6);
}

function alivePlayerIds(target: Civ7GameUiStrategyFrontTarget): number[] {
  try {
    return [...(target.Players?.getAliveIds?.() ?? [])]
      .filter((id): id is number => Number.isInteger(id));
  } catch {
    return [];
  }
}

function ownerUnitIds(
  owner: number,
  target: Civ7GameUiStrategyFrontTarget,
): Civ7ControlOrpcComponentId[] {
  try {
    return [...(target.Players?.Units?.get?.(owner)?.getUnitIds?.() ?? [])]
      .map(toComponentId)
      .filter((id): id is Civ7ControlOrpcComponentId => id != null);
  } catch {
    return [];
  }
}

function ownerCityIds(
  owner: number,
  target: Civ7GameUiStrategyFrontTarget,
): Civ7ControlOrpcComponentId[] {
  try {
    return [...(target.Players?.Cities?.get?.(owner)?.getCityIds?.() ?? [])]
      .map(toComponentId)
      .filter((id): id is Civ7ControlOrpcComponentId => id != null);
  } catch {
    return [];
  }
}

function nearestUnitTarget(
  units: readonly ReturnType<typeof candidateUnit>[],
  origins: readonly MapLocation[],
) {
  return units.reduce<null | {
    city: null;
    unit: NonNullable<ReturnType<typeof candidateUnit>>;
    distance: number | null;
    nearestOrigin: MapLocation | null;
  }>((best, unit) => {
    if (unit == null) return best;
    const score = bestDistance(unit.location, origins);
    if (best == null || (
      score.distance != null && (best.distance == null || score.distance < best.distance)
    )) {
      return { city: null, unit, ...score };
    }
    return best;
  }, null);
}

function bestDistance(
  location: MapLocation | null,
  origins: readonly MapLocation[],
): { distance: number | null; nearestOrigin: MapLocation | null } {
  let best: number | null = null;
  let nearestOrigin: MapLocation | null = null;
  for (const origin of origins) {
    const value = distance(location, origin);
    if (value == null) continue;
    if (best == null || value < best) {
      best = value;
      nearestOrigin = origin;
    }
  }
  return { distance: best, nearestOrigin };
}

function distance(
  left: MapLocation | null | undefined,
  right: MapLocation | null | undefined,
): number | null {
  if (left == null || right == null) return null;
  return Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y));
}

function routeApproach(
  origin: MapLocation | null,
  targetLocation: MapLocation | null,
  target: Civ7GameUiStrategyFrontTarget,
) {
  const samples = lineSamples(origin, targetLocation);
  const waterValues = samples
    .map((location) => plotWater(location, target))
    .filter((value): value is RuntimeProbe<unknown> => value != null)
    .map((value) => value.ok === true && typeof value.value === "boolean"
      ? value.value
      : null
    )
    .filter((value): value is boolean => value != null);
  const originWater = origin == null ? null : plotWater(origin, target);
  const targetWater = targetLocation == null ? null : plotWater(targetLocation, target);
  const originIsWater = booleanProbeValue(originWater);
  const targetIsWater = booleanProbeValue(targetWater);
  const waterSampleCount = waterValues.filter(Boolean).length;
  const landSampleCount = waterValues.filter((value) => value === false).length;
  const routeKind = (() => {
    if (origin == null || targetLocation == null) return "unknown";
    if (originIsWater === true && targetIsWater === true) return "sea";
    if (originIsWater === false && targetIsWater === false && waterSampleCount === 0) return "land";
    if (originIsWater === false && targetIsWater === false && waterSampleCount > 0) {
      return "mixed-or-coastal";
    }
    if (originIsWater === true || targetIsWater === true) return "coastal-amphibious";
    return "unknown";
  })();
  return {
    routeKind,
    originWater,
    targetWater,
    waterSampleCount,
    landSampleCount,
  };
}

function lineSamples(
  from: MapLocation | null,
  to: MapLocation | null,
): MapLocation[] {
  if (from == null || to == null) return [];
  const direct = distance(from, to);
  if (direct == null) return [];
  const steps = Math.max(1, Math.min(12, direct));
  const out: MapLocation[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const ratio = index / steps;
    const location = {
      x: Math.round(from.x + (to.x - from.x) * ratio),
      y: Math.round(from.y + (to.y - from.y) * ratio),
    };
    if (!out.some((item) => item.x === location.x && item.y === location.y)) {
      out.push(location);
    }
  }
  return out;
}

function plotWater(
  location: MapLocation,
  target: Civ7GameUiStrategyFrontTarget,
): RuntimeProbe<unknown> {
  return probe(() => target.GameplayMap?.isWater?.(location.x, location.y) ?? null);
}

function booleanProbeValue(input: RuntimeProbe<unknown> | null): boolean | null {
  return input?.ok === true && typeof input.value === "boolean" ? input.value : null;
}

function routeHint(
  distanceValue: number | null,
  unitCount: number,
  cityCount: number,
): string {
  if (distanceValue == null) return "unknown";
  if (distanceValue <= 6 && unitCount <= 6) return "near-low-density";
  if (distanceValue <= 10) return "near";
  if (cityCount > 2 && unitCount > 8) return "major-front";
  return "longer-approach";
}

function roleForUnit(typeName: string | null): string {
  const name = String(typeName ?? "").toUpperCase();
  if (name.includes("SETTLER") || name.includes("MIGRANT") || name.includes("MERCHANT")) {
    return "civilian";
  }
  if (name.includes("COMMANDER") || name.includes("TURTANU")) return "commander";
  if (name.includes("BALLISTA") || name.includes("CATAPULT") || name.includes("SIEGE")) {
    return "siege";
  }
  if (name.includes("ARCHER") || name.includes("SLINGER") || name.includes("CROSSBOW")) {
    return "ranged";
  }
  if (name.includes("SHIP") || name.includes("GALLEY") || name.includes("NAVAL")) return "naval";
  if (name.includes("AIR") || name.includes("BOMBER") || name.includes("FIGHTER")) return "air";
  if (
    name.includes("WARRIOR")
    || name.includes("SPEARMAN")
    || name.includes("INFANTRY")
    || name.includes("CAVALRY")
  ) {
    return "melee";
  }
  return "unknown";
}

function unitStrength(
  unit: Record<string, any>,
  typeName: string | null,
  target: Civ7GameUiStrategyFrontTarget,
): number {
  const definition = unit.type == null
    ? null
    : probe(() => target.GameInfo?.Units?.lookup?.(unit.type)).ok
      ? target.GameInfo?.Units?.lookup?.(unit.type)
      : null;
  const values = [
    Number((definition as Record<string, unknown> | null)?.Combat),
    Number((definition as Record<string, unknown> | null)?.RangedCombat),
    Number((definition as Record<string, unknown> | null)?.Bombard),
    Number((definition as Record<string, unknown> | null)?.AntiAirCombat),
    Number((definition as Record<string, unknown> | null)?.BaseMoves),
  ].filter((value) => Number.isFinite(value) && value > 0);
  const fallback = roleForUnit(typeName) === "unknown" ? 1 : 10;
  const best = values.length > 0 ? Math.max(...values) : fallback;
  const damage = Number(unit.damage ?? unit.Health?.damage ?? 0);
  return round1(Math.max(0, best * Math.max(0.1, (100 - damage) / 100)));
}

function unitTypeName(
  type: unknown,
  target: Civ7GameUiStrategyFrontTarget,
): string | null {
  if (type == null) return null;
  const definition = probe(() => target.GameInfo?.Units?.lookup?.(type));
  return definition.ok && definition.value != null && typeof definition.value === "object"
    ? String((definition.value as Record<string, unknown>).UnitType ?? type)
    : String(type);
}

function nearestByDistance<T extends { distance?: number }>(
  values: readonly T[],
): T | null {
  return values.reduce<T | null>((best, value) =>
    best == null || (value.distance ?? 9_999) < (best.distance ?? 9_999)
      ? value
      : best
  , null);
}

function unitLocation(value: unknown): MapLocation | null {
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, any>;
  return toLocation(record.location ?? record.getLocation?.());
}

function cityLocation(value: unknown): MapLocation | null {
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, any>;
  return toLocation(record.location ?? record.getLocation?.());
}

function toLocation(value: unknown): MapLocation | null {
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const x = Number(record.x ?? record.X);
  const y = Number(record.y ?? record.Y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function isLocation(value: MapLocation | null): value is MapLocation {
  return value != null;
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const owner = Number(record.owner ?? record.Owner ?? record.player ?? record.Player);
  const id = Number(record.id ?? record.ID);
  const type = Number(record.type ?? record.Type);
  if (!Number.isFinite(owner) || !Number.isFinite(id) || !Number.isFinite(type)) {
    return null;
  }
  return { owner, id, type };
}

function readValue(
  value: unknown,
  props: readonly string[],
  methods: readonly string[],
): unknown {
  if (value == null || typeof value !== "object") return undefined;
  const record = value as Record<string, any>;
  for (const prop of props) {
    if (record[prop] !== undefined) return record[prop];
  }
  for (const method of methods) {
    if (typeof record[method] === "function") return record[method]();
  }
  return undefined;
}

function boundedInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`Expected integer ${min}..${max}.`);
  }
  return value;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function probe<T>(fn: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
