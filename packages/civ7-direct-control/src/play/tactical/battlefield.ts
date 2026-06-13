import { Type } from "typebox";

import { jsLiteral } from "../../runtime/command-serialization.js";
import { probeHelperSource } from "../../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import { boundedInteger, validatePlayerId } from "../../validation.js";
import { Civ7MapLocationSchema } from "../map/types.js";

const civ7TunerStateSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false }
);

export const Civ7BattlefieldScanInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
    origins: Type.Optional(Type.Array(Civ7MapLocationSchema)),
    radius: Type.Optional(Type.Integer({ minimum: 1, maximum: 32 })),
    maxPlayers: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
    maxUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
    maxCities: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
  },
  { additionalProperties: false }
);

export type Civ7BattlefieldScanInput = Readonly<{
  playerId?: number;
  origins?: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  radius?: number;
  maxPlayers?: number;
  maxUnits?: number;
  maxCities?: number;
}>;

export const Civ7BattlefieldRelationshipLabelPolicySchema = Type.Object(
  {
    relationshipSource: Type.Literal("not-classified"),
    relationshipProof: Type.Literal("none"),
    unprovenLabel: Type.Literal("relationship-unproven"),
    guidance: Type.String(),
  },
  { additionalProperties: false }
);

const battlefieldRelationshipProofSchema = Type.Union([Type.Literal("self"), Type.Literal("none")]);

const battlefieldRelationshipLabelSchema = Type.Union([
  Type.Literal("friendly"),
  Type.Literal("relationship-unproven"),
]);

const battlefieldStanceSchema = Type.Union([Type.Literal("friendly"), Type.Literal("other")]);

export const Civ7BattlefieldScanUnitSchema = Type.Object(
  {
    id: Type.Unknown(),
    owner: Type.Number(),
    stance: battlefieldStanceSchema,
    relationshipProof: battlefieldRelationshipProofSchema,
    relationshipLabel: battlefieldRelationshipLabelSchema,
    type: Type.Unknown(),
    typeName: Type.Union([Type.String(), Type.Null()]),
    role: Type.String(),
    location: Civ7MapLocationSchema,
    distance: Type.Number(),
    nearestOrigin: Type.Union([Civ7MapLocationSchema, Type.Null()]),
    damage: Type.Number(),
    wounded: Type.Boolean(),
    strength: Type.Number(),
    movementMovesRemaining: Type.Union([Type.Number(), Type.Null()]),
    attacksRemaining: Type.Union([Type.Number(), Type.Null()]),
  },
  { additionalProperties: false }
);

export const Civ7BattlefieldScanCitySchema = Type.Object(
  {
    id: Type.Unknown(),
    owner: Type.Number(),
    stance: battlefieldStanceSchema,
    relationshipProof: battlefieldRelationshipProofSchema,
    relationshipLabel: battlefieldRelationshipLabelSchema,
    name: Type.Union([Type.String(), Type.Null()]),
    location: Civ7MapLocationSchema,
    distance: Type.Number(),
    nearestOrigin: Type.Union([Civ7MapLocationSchema, Type.Null()]),
    population: Type.Unknown(),
    isTown: Type.Unknown(),
  },
  { additionalProperties: false }
);

export const Civ7BattlefieldScanOwnerSchema = Type.Object(
  {
    owner: Type.Number(),
    stance: battlefieldStanceSchema,
    relationshipProof: battlefieldRelationshipProofSchema,
    relationshipLabel: battlefieldRelationshipLabelSchema,
    unitCount: Type.Number(),
    cityCount: Type.Number(),
    roles: Type.Unknown(),
    apparentStrength: Type.Number(),
    nearestUnit: Type.Unknown(),
    nearestCity: Type.Unknown(),
  },
  { additionalProperties: false }
);

export const Civ7BattlefieldScanPointOfInterestSchema = Type.Object(
  {
    kind: Type.String(),
    severity: Type.String(),
    location: Type.Union([Civ7MapLocationSchema, Type.Null()]),
    summary: Type.String(),
    units: Type.Optional(Type.Array(Civ7BattlefieldScanUnitSchema)),
    cities: Type.Optional(Type.Array(Civ7BattlefieldScanCitySchema)),
  },
  { additionalProperties: false }
);

export const Civ7BattlefieldScanResultSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    state: civ7TunerStateSchema,
    localPlayerId: Type.Number(),
    playerId: Type.Number(),
    origins: Type.Array(Civ7MapLocationSchema),
    radius: Type.Number(),
    hiddenInfoPolicy: Type.String(),
    relationshipLabelPolicy: Civ7BattlefieldRelationshipLabelPolicySchema,
    units: Type.Array(Civ7BattlefieldScanUnitSchema),
    cities: Type.Array(Civ7BattlefieldScanCitySchema),
    owners: Type.Array(Civ7BattlefieldScanOwnerSchema),
    pointsOfInterest: Type.Array(Civ7BattlefieldScanPointOfInterestSchema),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

export type Civ7BattlefieldScanResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  origins: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  radius: number;
  hiddenInfoPolicy: string;
  relationshipLabelPolicy: unknown;
  units: unknown;
  cities: unknown;
  owners: unknown;
  pointsOfInterest: unknown;
  notes: ReadonlyArray<string>;
}>;

export type BattlefieldScanDependencies = Readonly<{
  validatePlayerId: (playerId: number) => void;
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
  parseBattlefieldScan: (result: Civ7CommandResult, label: string) => Civ7BattlefieldScanResult;
}>;

export async function getCiv7BattlefieldScan(
  input: Civ7BattlefieldScanInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: BattlefieldScanDependencies = defaultBattlefieldScanDependencies
): Promise<Civ7BattlefieldScanResult> {
  if (input.playerId !== undefined) dependencies.validatePlayerId(input.playerId);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildBattlefieldScanCommand({
      ...input,
      radius: dependencies.boundedInteger(input.radius ?? 8, 1, 32, "radius"),
      maxPlayers: dependencies.boundedInteger(input.maxPlayers ?? 32, 1, 128, "maxPlayers"),
      maxUnits: dependencies.boundedInteger(input.maxUnits ?? 80, 1, 256, "maxUnits"),
      maxCities: dependencies.boundedInteger(input.maxCities ?? 32, 1, 128, "maxCities"),
    }),
  });
  return dependencies.parseBattlefieldScan(result, "Civ7 battlefield scan");
}

function buildBattlefieldScanCommand(
  input: Civ7BattlefieldScanInput & {
    radius: number;
    maxPlayers: number;
    maxUnits: number;
    maxCities: number;
  }
): string {
  return `(() => {
    ${battlefieldScanSource()}
    return JSON.stringify(readBattlefieldScan(${jsLiteral(input)}));
  })()`;
}

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

export function battlefieldScanSource(): string {
  return `${probeHelperSource()}
    ${runtimeObjectReaderSource()}
    const relationshipLabelPolicy = {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "Battlefield scan can prove owner ids, proximity, role heuristics, and validator-independent pressure. It cannot classify relationship, alliance, neutrality, suzerain, or war-target status without official relationship, team, diplomacy, independent-power, or war-state evidence.",
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
    const nearestOrigin = (location, origins) => {
      let best = null;
      let origin = null;
      for (const candidate of origins) {
        const value = distance(location, candidate);
        if (value == null) continue;
        if (best == null || value < best) {
          best = value;
          origin = candidate;
        }
      }
      return { distance: best, origin };
    };
    const roleForUnit = (unitType, definition) => {
      const name = String(unitType ?? "").toUpperCase();
      if (name.includes("SETTLER") || name.includes("MIGRANT") || name.includes("MERCHANT")) return "civilian";
      if (name.includes("COMMANDER") || name.includes("TURTANU")) return "commander";
      if (name.includes("BALLISTA") || name.includes("CATAPULT") || name.includes("SIEGE")) return "siege";
      if (Number(definition?.Bombard) > 0) return "siege";
      if (name.includes("ARCHER") || name.includes("SLINGER") || name.includes("CROSSBOW")) return "ranged";
      if (Number(definition?.RangedCombat) > 0) return "ranged";
      if (name.includes("SHIP") || name.includes("GALLEY") || name.includes("NAVAL")) return "naval";
      if (name.includes("AIR") || name.includes("BOMBER") || name.includes("FIGHTER")) return "air";
      if (name.includes("WARRIOR") || name.includes("SPEARMAN") || name.includes("INFANTRY") || name.includes("CAVALRY")) return "melee";
      if (Number(definition?.Combat) > 0) return "melee";
      return "unknown";
    };
    const unitStrength = (unit, definition) => {
      const values = [
        Number(definition?.Combat),
        Number(definition?.RangedCombat),
        Number(definition?.Bombard),
        Number(definition?.AntiAirCombat),
      ].filter((value) => Number.isFinite(value) && value > 0);
      const best = values.length > 0 ? Math.max(...values) : 1;
      const damage = Number(unit?.damage ?? 0);
      return Math.max(0, best * Math.max(0.1, (100 - damage) / 100));
    };
    const summarizeUnit = (unitId, playerId, origins, radius) => {
      const unit = Units.get(unitId);
      if (!unit) return null;
      const location = toLocation(unit.location ?? unit.getLocation?.());
      if (!location) return null;
      const proximity = nearestOrigin(location, origins);
      if (proximity.distance == null || proximity.distance > radius) return null;
      const owner = Number(unit.owner ?? unit.player ?? unit.getOwner?.());
      const type = unit.type ?? unit.getType?.();
      const definition = (() => {
        try {
          return type == null ? null : GameInfo?.Units?.lookup?.(type);
        } catch {
          return null;
        }
      })();
      const typeName = definition?.UnitType ?? null;
      const damage = Number(unit.damage ?? 0);
      return {
        id: toComponentId(unit.id ?? unitId) ?? unitId,
        owner,
        stance: owner === playerId ? "friendly" : "other",
        relationshipProof: owner === playerId ? "self" : "none",
        relationshipLabel: owner === playerId ? "friendly" : relationshipLabelPolicy.unprovenLabel,
        type,
        typeName,
        role: roleForUnit(typeName, definition),
        location,
        distance: proximity.distance,
        nearestOrigin: proximity.origin,
        damage,
        wounded: damage > 0,
        strength: Math.round(unitStrength(unit, definition) * 10) / 10,
        movementMovesRemaining: unit.movementMovesRemaining ?? unit.MovementMovesRemaining ?? null,
        attacksRemaining: unit.attacksRemaining ?? unit.AttacksRemaining ?? null,
      };
    };
    const summarizeCity = (cityId, playerId, origins, radius) => {
      const city = Cities.get(cityId);
      if (!city) return null;
      const location = toLocation(city.location ?? city.getLocation?.());
      if (!location) return null;
      const proximity = nearestOrigin(location, origins);
      if (proximity.distance == null || proximity.distance > radius) return null;
      const owner = Number(city.owner ?? city.player ?? city.getOwner?.());
      const normalizedCityId = toComponentId(cityId);
      return {
        id: normalizedCityId,
        observedCityId: toComponentId(city.id),
        owner,
        stance: owner === playerId ? "friendly" : "other",
        relationshipProof: owner === playerId ? "self" : "none",
        relationshipLabel: owner === playerId ? "friendly" : relationshipLabelPolicy.unprovenLabel,
        name: typeof city.getName === "function" ? city.getName() : city.name ?? null,
        location,
        distance: proximity.distance,
        nearestOrigin: proximity.origin,
        population: city.population ?? null,
        isTown: city.isTown ?? null,
      };
    };
    const collectOrigins = (input, playerId) => {
      const requested = Array.isArray(input.origins) ? input.origins.map(toLocation).filter(Boolean) : [];
      if (requested.length > 0) return requested;
      const out = [];
      try {
        const ready = UI?.Player?.getFirstReadyUnit?.();
        const unit = ready ? Units.get(ready) : null;
        const location = toLocation(unit?.location ?? unit?.getLocation?.());
        if (location) out.push(location);
      } catch {}
      try {
        const selected = UI?.Player?.getHeadSelectedUnit?.();
        const unit = selected ? Units.get(selected) : null;
        const location = toLocation(unit?.location ?? unit?.getLocation?.());
        if (location) out.push(location);
      } catch {}
      try {
        for (const city of Players.get(playerId)?.Cities?.getCities?.() ?? []) {
          const location = toLocation(city.location ?? city.getLocation?.());
          if (location) out.push(location);
          if (out.length >= 3) break;
        }
      } catch {}
      return out.slice(0, 6);
    };
    const collectOwnerUnits = (owner, playerId, origins, radius) => {
      try {
        return (Players.Units.get(owner).getUnitIds() ?? [])
          .map((id) => summarizeUnit(id, playerId, origins, radius))
          .filter(Boolean);
      } catch {
        return [];
      }
    };
    const collectOwnerCities = (owner, playerId, origins, radius) => {
      try {
        return (Players.Cities.get(owner).getCityIds() ?? [])
          .map((id) => summarizeCity(id, playerId, origins, radius))
          .filter(Boolean);
      } catch {
        return [];
      }
    };
    const ownerSummary = (owner, playerId, units, cities) => {
      const roles = {};
      for (const unit of units) roles[unit.role] = (roles[unit.role] ?? 0) + 1;
      const strength = units.reduce((sum, unit) => sum + (Number(unit.strength) || 0), 0);
      const nearestUnit = units.reduce((best, unit) => !best || unit.distance < best.distance ? unit : best, null);
      const nearestCity = cities.reduce((best, city) => !best || city.distance < best.distance ? city : best, null);
      return {
        owner,
        stance: owner === playerId ? "friendly" : "other",
        relationshipProof: owner === playerId ? "self" : "none",
        relationshipLabel: owner === playerId ? "friendly" : relationshipLabelPolicy.unprovenLabel,
        leaderName: probe(() => readValue(Players.get(owner), ["leaderName", "name"], ["getLeaderName", "getName"])),
        civilizationName: probe(() => readValue(Players.get(owner), ["civilizationName", "civilizationType"], ["getCivilizationName", "getCivilizationType"])),
        unitCount: units.length,
        cityCount: cities.length,
        roles,
        apparentStrength: Math.round(strength * 10) / 10,
        nearestUnit,
        nearestCity,
      };
    };
    const makePointsOfInterest = (playerId, units, cities, owners) => {
      const points = [];
      const otherUnits = units.filter((unit) => unit.owner !== playerId);
      const friendlyUnits = units.filter((unit) => unit.owner === playerId);
      const closeOther = otherUnits.filter((unit) => unit.distance <= 3);
      if (closeOther.length > 0) points.push({
        kind: "nearby-other-owners",
        severity: closeOther.length >= 4 ? "high" : "medium",
        location: closeOther[0].location,
        summary: closeOther.length + " other-owner units within 3 tiles of an origin",
        units: closeOther.slice(0, 8),
      });
      const woundedFriendly = friendlyUnits.filter((unit) => unit.wounded).sort((a, b) => b.damage - a.damage);
      if (woundedFriendly.length > 0) points.push({
        kind: "wounded-friendly",
        severity: woundedFriendly[0].damage >= 50 ? "high" : "medium",
        location: woundedFriendly[0].location,
        summary: "friendly wounded unit near scan origin",
        units: woundedFriendly.slice(0, 6),
      });
      const exposedCivilian = friendlyUnits.filter((unit) => unit.role === "civilian" && otherUnits.some((contact) => distance(unit.location, contact.location) <= 4));
      if (exposedCivilian.length > 0) points.push({
        kind: "civilian-risk",
        severity: "high",
        location: exposedCivilian[0].location,
        summary: "friendly civilian has other-owner contact within 4 tiles",
        units: exposedCivilian.slice(0, 4),
      });
      const otherCities = cities.filter((city) => city.owner !== playerId).sort((a, b) => a.distance - b.distance);
      if (otherCities.length > 0) points.push({
        kind: "city-front",
        severity: otherCities[0].distance <= 6 ? "medium" : "low",
        location: otherCities[0].location,
        summary: "nearest relationship-unproven city in scan radius",
        cities: otherCities.slice(0, 4),
      });
      const strongestOther = owners.filter((owner) => owner.owner !== playerId).sort((a, b) => b.apparentStrength - a.apparentStrength)[0];
      if (strongestOther && strongestOther.apparentStrength > 0) points.push({
        kind: "owner-pressure",
        severity: strongestOther.apparentStrength >= 60 ? "high" : "medium",
        location: strongestOther.nearestUnit?.location ?? strongestOther.nearestCity?.location ?? null,
        summary: "strongest other-owner pressure in scan radius",
        owner: strongestOther,
      });
      return points;
    };
    const readBattlefieldScan = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = Number.isInteger(input.playerId) ? input.playerId : localPlayerId;
      const radius = Number.isInteger(input.radius) ? input.radius : 8;
      const origins = collectOrigins(input, playerId);
      const aliveIds = (() => {
        try {
          return Players.getAliveIds();
        } catch {
          return [];
        }
      })().slice(0, input.maxPlayers);
      const allUnits = [];
      const allCities = [];
      const owners = [];
      for (const owner of aliveIds) {
        const units = collectOwnerUnits(owner, playerId, origins, radius);
        const cities = collectOwnerCities(owner, playerId, origins, radius);
        if (units.length === 0 && cities.length === 0) continue;
        allUnits.push(...units);
        allCities.push(...cities);
        owners.push(ownerSummary(owner, playerId, units, cities));
      }
      allUnits.sort((a, b) => a.distance - b.distance || b.strength - a.strength);
      allCities.sort((a, b) => a.distance - b.distance);
      owners.sort((a, b) => {
        if (a.stance !== b.stance) return a.stance === "friendly" ? -1 : 1;
        return b.apparentStrength - a.apparentStrength;
      });
      const limitedUnits = allUnits.slice(0, input.maxUnits);
      const limitedCities = allCities.slice(0, input.maxCities);
      const pointsOfInterest = makePointsOfInterest(playerId, limitedUnits, limitedCities, owners);
      return {
        localPlayerId,
        playerId,
        origins,
        radius,
        hiddenInfoPolicy: "runtime-debug-summary; may include non-visible units or cities until paired with visibility/map reads",
        relationshipLabelPolicy,
        units: limitedUnits,
        cities: limitedCities,
        owners,
        pointsOfInterest,
        notes: [
          "Read-only battlefield lens for tactical orientation. It does not path, move, attack, declare war, or validate operations.",
          "Distances are cheap grid-radius heuristics, not terrain pathfinding. Use unit-target and movement validators before sends.",
          "Owner mismatch is contact evidence, not relationship proof. Use neutral relationship-unproven language unless official relationship APIs prove more.",
          "Use explicit --x/--y origins for the current front, formation, city, or intended destination so POIs are scoped to the decision at hand.",
        ],
      };
    };`;
}

const defaultBattlefieldScanDependencies: BattlefieldScanDependencies = {
  validatePlayerId,
  boundedInteger,
  executeAppUiCommand: executeCiv7AppUiCommand,
  parseBattlefieldScan: (result, label) =>
    jsonPayloadFromCommandResult<Civ7BattlefieldScanResult>(result, label),
};
