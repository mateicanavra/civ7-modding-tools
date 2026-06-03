import { Civ7DirectControlError } from "../../direct-control-error.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import { boundedInteger, validatePlayerId } from "../../validation.js";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";

export type Civ7TargetCandidatesInput = Readonly<{
  playerId?: number;
  origins?: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  maxCandidates?: number;
  maxPlayers?: number;
  unitRadius?: number;
}>;

export type Civ7TargetCandidate = Readonly<{
  owner: number;
  leaderName: Civ7RuntimeProbe<unknown>;
  civilizationName: Civ7RuntimeProbe<unknown>;
  isHuman: Civ7RuntimeProbe<unknown>;
  cityCount: number;
  unitCount: number;
  cities: unknown;
  nearestCity: unknown;
  nearestDistance: number | null;
  nearbyUnits: unknown;
  nearbyUnitCount: number;
  apparentStrength: number;
  approach: Readonly<{
    nearestOrigin: Readonly<{ x: number; y: number }> | null;
    targetLocation: Readonly<{ x: number; y: number }> | null;
    directGridDistance: number | null;
    routeHint: string;
    routeKind: string;
    originWater: Civ7RuntimeProbe<unknown> | null;
    targetWater: Civ7RuntimeProbe<unknown> | null;
    waterSampleCount: number;
    landSampleCount: number;
    notes: ReadonlyArray<string>;
  }>;
  reasons: ReadonlyArray<string>;
}>;

export type Civ7TargetCandidatesResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  origins: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  unitRadius: number;
  hiddenInfoPolicy: string;
  relationshipLabelPolicy: unknown;
  candidates: ReadonlyArray<Civ7TargetCandidate>;
  notes: ReadonlyArray<string>;
}>;

type TargetCandidatesDependencies = Readonly<{
  validatePlayerId: (playerId: number) => void;
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseTargetCandidates: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7TargetCandidatesResult;
}>;

export async function getCiv7TargetCandidates(
  input: Civ7TargetCandidatesInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: TargetCandidatesDependencies = defaultTargetCandidatesDependencies,
): Promise<Civ7TargetCandidatesResult> {
  if (input.playerId !== undefined) dependencies.validatePlayerId(input.playerId);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildTargetCandidatesCommand({
      ...input,
      maxCandidates: dependencies.boundedInteger(input.maxCandidates ?? 8, 1, 64, "maxCandidates"),
      maxPlayers: dependencies.boundedInteger(input.maxPlayers ?? 32, 1, 128, "maxPlayers"),
      unitRadius: dependencies.boundedInteger(input.unitRadius ?? 4, 0, 16, "unitRadius"),
    }),
  });
  return dependencies.parseTargetCandidates(result, "Civ7 target candidates");
}

function buildTargetCandidatesCommand(input: Civ7TargetCandidatesInput & { maxCandidates: number; maxPlayers: number; unitRadius: number }): string {
  return `(() => {
    ${targetCandidatesSource()}
    return JSON.stringify(readTargetCandidates(${jsLiteral(input)}));
  })()`;
}

function jsLiteral(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input");
  }
  return json;
}

const probeHelperSource = (): string => `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;

const runtimeObjectReaderSource = (): string => `const callMaybe = (value, key) => {
      const candidate = value == null ? undefined : value[key];
      return typeof candidate === "function" ? candidate.call(value) : undefined;
    };
    const readValue = (value, props, methods) => {
      if (value == null) return undefined;
      for (const prop of props) {
        if (value[prop] !== undefined) return value[prop];
      }
      for (const method of methods) {
        const result = callMaybe(value, method);
        if (result !== undefined) return result;
      }
      return undefined;
    };`;

export function targetCandidatesSource(): string {
  return `${probeHelperSource()}
    ${runtimeObjectReaderSource()}
    const relationshipLabelPolicy = {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "Target candidates rank other owners from runtime city/unit summaries. They do not classify relationship, alliance, neutrality, suzerain, or war-target status without official relationship, team, diplomacy, independent-power, or war-state evidence.",
    };
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      const owner = Number(value.owner ?? value.Owner ?? value.player ?? value.Player);
      const id = Number(value.id ?? value.ID);
      const type = Number(value.type ?? value.Type);
      if (!Number.isFinite(owner) || !Number.isFinite(id) || !Number.isFinite(type)) return null;
      return { owner, id, type };
    };
    const toLocation = (value) => {
      if (!value) return null;
      const x = Number(value.x ?? value.X);
      const y = Number(value.y ?? value.Y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y };
    };
    const distance = (a, b) => {
      if (!a || !b) return null;
      return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    };
    const callMap = (name, location) => {
      const fn = typeof GameplayMap !== "undefined" ? GameplayMap[name] : undefined;
      if (typeof fn !== "function") throw new Error("GameplayMap." + name + " is not a function");
      return fn.call(GameplayMap, location.x, location.y);
    };
    const plotWater = (location) => location ? probe(() => callMap("isWater", location)) : null;
    const probeBoolean = (value) => value && value.ok === true && typeof value.value === "boolean" ? value.value : null;
    const bestDistance = (location, origins) => {
      let best = null;
      let nearestOrigin = null;
      for (const origin of origins) {
        const value = distance(location, origin);
        if (value == null) continue;
        if (best == null || value < best) {
          best = value;
          nearestOrigin = origin;
        }
      }
      return { distance: best, nearestOrigin };
    };
    const lineSamples = (from, to) => {
      if (!from || !to) return [];
      const direct = distance(from, to);
      if (direct == null) return [];
      const steps = Math.max(1, Math.min(12, direct));
      const out = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = Math.round(from.x + (to.x - from.x) * t);
        const y = Math.round(from.y + (to.y - from.y) * t);
        if (!out.some((item) => item.x === x && item.y === y)) out.push({ x, y });
      }
      return out;
    };
    const approachFor = (origin, targetLocation) => {
      const samples = lineSamples(origin, targetLocation);
      const waterSamples = samples.map(plotWater).filter(Boolean);
      const waterValues = waterSamples.map(probeBoolean).filter((value) => value !== null);
      const waterSampleCount = waterValues.filter(Boolean).length;
      const landSampleCount = waterValues.filter((value) => value === false).length;
      const originWater = plotWater(origin);
      const targetWater = plotWater(targetLocation);
      const originIsWater = probeBoolean(originWater);
      const targetIsWater = probeBoolean(targetWater);
      const routeKind = (() => {
        if (!origin || !targetLocation) return "unknown";
        if (originIsWater === true && targetIsWater === true) return "sea";
        if (originIsWater === false && targetIsWater === false && waterSampleCount === 0) return "land";
        if (originIsWater === false && targetIsWater === false && waterSampleCount > 0) return "mixed-or-coastal";
        if (originIsWater === true || targetIsWater === true) return "coastal-amphibious";
        return "unknown";
      })();
      return {
        targetLocation: targetLocation ?? null,
        directGridDistance: distance(origin, targetLocation),
        routeKind,
        originWater,
        targetWater,
        waterSampleCount,
        landSampleCount,
      };
    };
    const unitStrength = (unit) => {
      const definition = (() => {
        try {
          return unit?.type == null ? null : GameInfo?.Units?.lookup?.(unit.type);
        } catch {
          return null;
        }
      })();
      const values = [
        Number(definition?.Combat),
        Number(definition?.RangedCombat),
        Number(definition?.Bombard),
        Number(definition?.AntiAirCombat),
        Number(definition?.BaseMoves),
      ].filter(Number.isFinite);
      const best = values.length > 0 ? Math.max(...values) : 1;
      const damage = Number(unit?.damage ?? 0);
      return Math.max(0, best * Math.max(0.1, (100 - damage) / 100));
    };
    const summarizeUnit = (unitId) => {
      const unit = Units.get(unitId);
      if (!unit) return null;
      const location = toLocation(unit.location ?? unit.getLocation?.());
      return {
        id: toComponentId(unit.id ?? unitId) ?? unitId,
        owner: Number(unit.owner ?? unit.player ?? unit.getOwner?.()),
        type: unit.type ?? unit.getType?.(),
        typeName: (() => {
          try {
            return GameInfo?.Units?.lookup?.(unit.type)?.UnitType ?? null;
          } catch {
            return null;
          }
        })(),
        location,
        damage: unit.damage ?? null,
        strength: unitStrength(unit),
      };
    };
    const summarizeCity = (cityId) => {
      const city = Cities.get(cityId);
      if (!city) return null;
      const location = toLocation(city.location ?? city.getLocation?.());
      const normalizedCityId = toComponentId(cityId);
      return {
        id: normalizedCityId,
        observedCityId: toComponentId(city.id),
        owner: Number(city.owner ?? city.player ?? city.getOwner?.()),
        name: typeof city.getName === "function" ? city.getName() : city.name ?? null,
        location,
        population: city.population ?? null,
        isTown: city.isTown ?? null,
      };
    };
    const collectLocalOrigins = (playerId) => {
      const out = [];
      try {
        for (const unit of Players.get(playerId)?.Units?.getUnits?.() ?? []) {
          const location = toLocation(unit.location);
          if (!location) continue;
          const definition = GameInfo?.Units?.lookup?.(unit.type);
          const unitType = String(definition?.UnitType ?? "").toUpperCase();
          if (unitType.includes("BALLISTA") || unitType.includes("ARCHER") || unitType.includes("SLINGER") || unitType.includes("COMMANDER") || unitType.includes("WARRIOR") || unitType.includes("SPEARMAN")) out.push(location);
        }
      } catch {}
      try {
        for (const city of Players.get(playerId)?.Cities?.getCities?.() ?? []) {
          const location = toLocation(city.location);
          if (location) out.push(location);
        }
      } catch {}
      return out.slice(0, 12);
    };
    const ownerUnits = (owner) => {
      try {
        return (Players.Units.get(owner).getUnitIds() ?? []).map(summarizeUnit).filter(Boolean);
      } catch {
        return [];
      }
    };
    const ownerCities = (owner) => {
      try {
        return (Players.Cities.get(owner).getCityIds() ?? []).map(summarizeCity).filter(Boolean);
      } catch {
        return [];
      }
    };
    const routeHint = (distanceValue, unitCount, cityCount) => {
      if (distanceValue == null) return "unknown";
      if (distanceValue <= 6 && unitCount <= 6) return "near-low-density";
      if (distanceValue <= 10) return "near";
      if (cityCount > 2 && unitCount > 8) return "major-front";
      return "longer-approach";
    };
    const candidateFor = (owner, input, origins) => {
      const player = Players.get(owner);
      const cities = ownerCities(owner);
      const units = ownerUnits(owner);
      if (cities.length === 0 && units.length === 0) return null;
      const cityTargets = cities.map((city) => ({ city, ...bestDistance(city.location, origins) }))
        .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
      const nearest = cityTargets[0] ? { city: cityTargets[0].city, distance: cityTargets[0].distance, nearestOrigin: cityTargets[0].nearestOrigin } : null;
      const fallback = !nearest && units.length > 0
        ? units.reduce((best, unit) => {
          const score = bestDistance(unit.location, origins);
          if (!best || (score.distance != null && (best.distance == null || score.distance < best.distance))) return { city: null, unit, ...score };
          return best;
        }, null)
        : null;
      const target = nearest ?? fallback;
      const targetLocation = target?.city?.location ?? target?.unit?.location ?? null;
      const approach = approachFor(target?.nearestOrigin ?? null, targetLocation);
      const nearbyUnits = targetLocation
        ? units.filter((unit) => {
          const value = distance(unit.location, targetLocation);
          return value != null && value <= input.unitRadius;
        })
        : [];
      const apparentStrength = nearbyUnits.reduce((sum, unit) => sum + (Number(unit.strength) || 0), 0);
      const reasons = [];
      if (target?.distance != null) reasons.push("nearest target distance " + target.distance);
      if (cities.length === 1) reasons.push("single known city target");
      if (nearbyUnits.length <= 4) reasons.push("low nearby unit density");
      if (nearbyUnits.length > 8) reasons.push("high nearby unit density");
      return {
        owner,
        leaderName: probe(() => readValue(player, ["leaderName", "name"], ["getLeaderName", "getName"])),
        civilizationName: probe(() => readValue(player, ["civilizationName", "civilizationType"], ["getCivilizationName", "getCivilizationType"])),
        isHuman: probe(() => readValue(player, ["isHuman"], ["isHuman"])),
        cityCount: cities.length,
        unitCount: units.length,
        cities: cityTargets.slice(0, 12).map((target) => ({
          ...target.city,
          distance: target.distance,
          nearestOrigin: target.nearestOrigin,
          water: plotWater(target.city.location),
        })),
        nearestCity: target?.city ?? null,
        nearestDistance: target?.distance ?? null,
        nearbyUnits: nearbyUnits.slice(0, 12),
        nearbyUnitCount: nearbyUnits.length,
        apparentStrength: Math.round(apparentStrength * 10) / 10,
        approach: {
          nearestOrigin: target?.nearestOrigin ?? null,
          ...approach,
          routeHint: routeHint(target?.distance ?? null, nearbyUnits.length, cities.length),
          notes: [
            "Distance is a cheap grid heuristic for target ranking, not a pathfinder result.",
            "Route kind is sampled from endpoints and a straight grid line; it is not Civ pathfinding.",
            "Use map/visibility and unit-target validation before moving or attacking.",
          ],
        },
        reasons,
      };
    };
    const readTargetCandidates = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = Number.isInteger(input.playerId) ? input.playerId : localPlayerId;
      const requestedOrigins = Array.isArray(input.origins) ? input.origins.map(toLocation).filter(Boolean) : [];
      const origins = requestedOrigins.length > 0 ? requestedOrigins : collectLocalOrigins(playerId);
      const aliveIds = (() => {
        try {
          return Players.getAliveIds();
        } catch {
          return [];
        }
      })();
      const candidates = aliveIds
        .filter((owner) => owner !== playerId)
        .slice(0, input.maxPlayers)
        .map((owner) => candidateFor(owner, input, origins))
        .filter(Boolean)
        .sort((a, b) => {
          const da = a.nearestDistance ?? 9999;
          const db = b.nearestDistance ?? 9999;
          if (da !== db) return da - db;
          if (a.nearbyUnitCount !== b.nearbyUnitCount) return a.nearbyUnitCount - b.nearbyUnitCount;
          return a.apparentStrength - b.apparentStrength;
        })
        .slice(0, input.maxCandidates);
      return {
        localPlayerId,
        playerId,
        origins,
        unitRadius: input.unitRadius,
        hiddenInfoPolicy: "runtime-debug-summary; may include non-visible cities or units until paired with visibility reads",
        relationshipLabelPolicy,
        candidates,
        notes: [
          "Read-only strategic target shortlist. It ranks other-owner contacts; it does not choose or send war, movement, or attack operations.",
          "Relationship labels are not classified here. Treat other-owner candidates as relationship-unproven until an official relationship or operation validator proves more.",
          "Treat candidate ranking as planning support. Re-read map/visibility, ready-unit, and unit-target before any tactical send.",
          "Use --x/--y from the current siege stack or intended formation when you want the distance ranking to reflect a specific front.",
        ],
      };
    };`;
}

const defaultTargetCandidatesDependencies: TargetCandidatesDependencies = {
  validatePlayerId,
  boundedInteger,
  executeAppUiCommand: executeCiv7AppUiCommand,
  parseTargetCandidates: (result, label) =>
    jsonPayloadFromCommandResult<Civ7TargetCandidatesResult>(result, label),
};
