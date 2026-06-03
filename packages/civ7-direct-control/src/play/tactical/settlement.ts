import { Civ7DirectControlError } from "../../direct-control-error.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import { boundedInteger } from "../../validation.js";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";

export type Civ7SettlementRecommendationInput = Readonly<{
  playerId?: number;
  locations?: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  count?: number;
  includeSettlers?: boolean;
  includeCities?: boolean;
}>;

export type Civ7SettlementRecommendationFactor = Readonly<{
  positive: boolean;
  title: string | null;
  description: string | null;
}>;

export type Civ7SettlementRecommendationOrigin = Readonly<{
  kind: "requested" | "settler" | "city";
  location: Readonly<{ x: number; y: number }>;
  plotIndex: Civ7RuntimeProbe<number>;
  unitId?: Civ7ComponentId;
  cityId?: Civ7ComponentId;
  name?: string | null;
}>;

export type Civ7SettlementRecommendation = Readonly<{
  origin: Civ7SettlementRecommendationOrigin;
  suggestions: Civ7RuntimeProbe<ReadonlyArray<Readonly<{
    location: Readonly<{ x: number; y: number }> | null;
    plotIndex: Civ7RuntimeProbe<number>;
    factors: ReadonlyArray<Civ7SettlementRecommendationFactor>;
  }>>>;
}>;

export type Civ7SettlementRecommendationResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  count: number;
  requestedLocations: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  origins: ReadonlyArray<Civ7SettlementRecommendationOrigin>;
  recommendations: ReadonlyArray<Civ7SettlementRecommendation>;
  notes: ReadonlyArray<string>;
}>;

type SettlementRecommendationDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseSettlementRecommendations: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7SettlementRecommendationResult;
}>;

export async function getCiv7SettlementRecommendations(
  input: Civ7SettlementRecommendationInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: SettlementRecommendationDependencies = defaultSettlementRecommendationDependencies,
): Promise<Civ7SettlementRecommendationResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildSettlementRecommendationsCommand({
      ...input,
      count: dependencies.boundedInteger(input.count ?? 5, 1, 12, "count"),
    }),
  });
  return dependencies.parseSettlementRecommendations(result, "Civ7 settlement recommendations");
}

function buildSettlementRecommendationsCommand(input: Civ7SettlementRecommendationInput & { count: number }): string {
  return `(() => {
    ${settlementRecommendationsSource()}
    return JSON.stringify(readSettlementRecommendations(${jsLiteral(input)}));
  })()`;
}

function jsLiteral(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input");
  }
  return json;
}

function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}

export function settlementRecommendationsSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value) return null;
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
    const plotIndexFor = (location) => probe(() => GameplayMap.getIndexFromLocation(location));
    const factorSummary = (factor) => ({
      positive: !!factor?.positive,
      title: factor?.title ?? null,
      description: factor?.description ?? null,
    });
    const suggestionSummary = (suggestion) => {
      const location = toLocation(suggestion?.location);
      return {
        location,
        plotIndex: location ? plotIndexFor(location) : { ok: false, error: "missing suggestion location" },
        factors: Array.isArray(suggestion?.factors)
          ? suggestion.factors.map(factorSummary).sort((a, b) => a.positive && !b.positive ? -1 : 1)
          : [],
      };
    };
    const requestedOrigins = (locations) => Array.isArray(locations)
      ? locations.map(toLocation).filter(Boolean).map((location) => ({
        kind: "requested",
        location,
        plotIndex: plotIndexFor(location),
      }))
      : [];
    const settlerOrigins = (player, includeSettlers) => {
      if (includeSettlers === false) return [];
      const units = player?.Units?.getUnits?.() ?? [];
      return units.filter((unit) => GameInfo.Units.lookup(unit.type)?.FoundCity).map((unit) => ({
        kind: "settler",
        location: unit.location,
        plotIndex: plotIndexFor(unit.location),
        unitId: toComponentId(unit.id),
        name: GameInfo.Units.lookup(unit.type)?.UnitType ?? null,
      }));
    };
    const cityOrigins = (player, includeCities) => {
      if (includeCities === false) return [];
      const cities = player?.Cities?.getCities?.() ?? [];
      return cities.map((city) => ({
        kind: "city",
        location: city.location,
        plotIndex: plotIndexFor(city.location),
        cityId: toComponentId(city.id),
        name: city.name ?? null,
      }));
    };
    const readSettlementRecommendations = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = Number.isInteger(input.playerId) ? input.playerId : localPlayerId;
      const player = Players.get(playerId);
      const count = Number.isInteger(input.count) ? input.count : 5;
      const requested = requestedOrigins(input.locations);
      const origins = requested.length > 0
        ? requested
        : [...settlerOrigins(player, input.includeSettlers), ...cityOrigins(player, input.includeCities)];
      const recommendations = origins.map((origin) => ({
        origin,
        suggestions: probe(() => (player?.AI?.getBestSettleLocationsForSettler?.(count, origin.location) ?? []).map(suggestionSummary)),
      }));
      return {
        localPlayerId,
        playerId,
        count,
        requestedLocations: Array.isArray(input.locations) ? input.locations.map(toLocation).filter(Boolean) : [],
        origins,
        recommendations,
        notes: [
          "Read-only settlement recommendation view. It wraps the official settlement lens API, not a city-founding operation.",
          "Recommendations are local-player AI advice for ranking candidate plots; use unit-target/ready-unit validation before moving a Settler.",
          "Official settlement lens seeds recommendations from Settler and city origins; pass --x/--y to focus one live Settler or formation."
        ],
      };
    };`;
}

const defaultSettlementRecommendationDependencies: SettlementRecommendationDependencies = {
  boundedInteger,
  executeAppUiCommand: executeCiv7AppUiCommand,
  parseSettlementRecommendations: (result, label) =>
    jsonPayloadFromCommandResult<Civ7SettlementRecommendationResult>(result, label),
};
