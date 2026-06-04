import { Type } from "typebox";

import { Civ7ComponentIdSchema } from "../civ7-component-id.js";
import { jsLiteral } from "../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../session/command-result.js";
import { executeCiv7TunerCommand } from "../session/execute.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../session/types.js";
import type { Civ7ComponentId } from "../civ7-component-id.js";
import type { Civ7MapLocation } from "./map/types.js";
import { Civ7MapLocationSchema } from "./map/types.js";
import type { Civ7RuntimeProbe } from "../runtime/probe.js";
import { boundedInteger, validatePlayerId } from "../validation.js";

export type Civ7PlayerSummaryInput = Readonly<{
  playerIds?: ReadonlyArray<number>;
  includeUnits?: boolean;
  includeCities?: boolean;
  maxItems?: number;
}>;

export type Civ7PlayerSummary = Readonly<{
  id: number;
  leaderName: Civ7RuntimeProbe<string>;
  civilizationName: Civ7RuntimeProbe<string>;
  isHuman: Civ7RuntimeProbe<boolean>;
  isAlive: Civ7RuntimeProbe<boolean>;
  isTurnActive: Civ7RuntimeProbe<boolean>;
  unitIds: Civ7RuntimeProbe<ReadonlyArray<Civ7ComponentId>>;
  cityIds: Civ7RuntimeProbe<ReadonlyArray<Civ7ComponentId>>;
}>;

export type Civ7PlayerSummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  players: ReadonlyArray<Civ7PlayerSummary>;
  omitted: number;
}>;

export type Civ7UnitSummaryInput = Readonly<{
  playerIds?: ReadonlyArray<number>;
  unitIds?: ReadonlyArray<Civ7ComponentId>;
  playerId?: number;
  maxItems?: number;
  includeHidden?: boolean;
}>;

const civ7TunerStateSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
}, { additionalProperties: false });

export const Civ7UnitSummaryInputSchema = Type.Object({
  playerIds: Type.Optional(Type.Array(Type.Integer({ minimum: 0, maximum: 1024 }))),
  unitIds: Type.Optional(Type.Array(Civ7ComponentIdSchema)),
  playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
  maxItems: Type.Optional(Type.Integer({ minimum: 1, maximum: 1_000 })),
  includeHidden: Type.Optional(Type.Boolean()),
}, { additionalProperties: false });

export const Civ7UnitSummarySchema = Type.Object({
  id: Civ7ComponentIdSchema,
  owner: Civ7RuntimeProbeSchema(Type.Number()),
  name: Civ7RuntimeProbeSchema(Type.String()),
  type: Civ7RuntimeProbeSchema(Type.Union([Type.Number(), Type.String()])),
  location: Civ7RuntimeProbeSchema(Civ7MapLocationSchema),
  health: Civ7RuntimeProbeSchema(Type.Number()),
  damage: Civ7RuntimeProbeSchema(Type.Number()),
  movement: Civ7RuntimeProbeSchema(Type.Number()),
  activity: Civ7RuntimeProbeSchema(Type.Union([Type.Number(), Type.String()])),
}, { additionalProperties: false });

export type Civ7UnitSummary = Readonly<{
  id: Civ7ComponentId;
  owner: Civ7RuntimeProbe<number>;
  name: Civ7RuntimeProbe<string>;
  type: Civ7RuntimeProbe<number | string>;
  location: Civ7RuntimeProbe<Civ7MapLocation>;
  health: Civ7RuntimeProbe<number>;
  damage: Civ7RuntimeProbe<number>;
  movement: Civ7RuntimeProbe<number>;
  activity: Civ7RuntimeProbe<number | string>;
}>;

export const Civ7UnitSummaryResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: civ7TunerStateSchema,
  units: Type.Array(Civ7UnitSummarySchema),
  omitted: Type.Integer({ minimum: 0 }),
}, { additionalProperties: false });

export type Civ7UnitSummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  units: ReadonlyArray<Civ7UnitSummary>;
  omitted: number;
}>;

export type Civ7CitySummaryInput = Readonly<{
  playerIds?: ReadonlyArray<number>;
  cityIds?: ReadonlyArray<Civ7ComponentId>;
  playerId?: number;
  maxItems?: number;
  includeHidden?: boolean;
}>;

export type Civ7CitySummary = Readonly<{
  id: Civ7ComponentId;
  owner: Civ7RuntimeProbe<number>;
  name: Civ7RuntimeProbe<string>;
  location: Civ7RuntimeProbe<Civ7MapLocation>;
  population: Civ7RuntimeProbe<number>;
  growth: Civ7RuntimeProbe<unknown>;
  production: Civ7RuntimeProbe<unknown>;
}>;

export type Civ7CitySummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  cities: ReadonlyArray<Civ7CitySummary>;
  omitted: number;
}>;

type SummaryReadDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeTunerCommand: (options: Civ7DirectControlOptions & Readonly<{ command: string }>) => Promise<Civ7CommandResult>;
  jsLiteral: (value: unknown) => string;
  parseCitySummary: (result: Civ7CommandResult, label: string) => Civ7CitySummaryResult;
  parsePlayerSummary: (result: Civ7CommandResult, label: string) => Civ7PlayerSummaryResult;
  parseUnitSummary: (result: Civ7CommandResult, label: string) => Civ7UnitSummaryResult;
  probeHelperSource: () => string;
  validatePlayerId: (playerId: number) => number;
}>;

export type Civ7UnitSummaryDependencies = Pick<
  SummaryReadDependencies,
  | "boundedInteger"
  | "executeTunerCommand"
  | "jsLiteral"
  | "parseUnitSummary"
  | "probeHelperSource"
  | "validatePlayerId"
>;

export async function getCiv7PlayerSummary(
  input: Civ7PlayerSummaryInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: SummaryReadDependencies = defaultSummaryReadDependencies,
): Promise<Civ7PlayerSummaryResult> {
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildPlayerSummaryCommand(
      {
        ...input,
        playerIds: input.playerIds?.map(dependencies.validatePlayerId),
        maxItems: dependencies.boundedInteger(input.maxItems ?? 64, 1, 512, "maxItems"),
      },
      dependencies,
    ),
  });
  return dependencies.parsePlayerSummary(result, "Civ7 player summary");
}

export async function getCiv7UnitSummary(
  input: Civ7UnitSummaryInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: Civ7UnitSummaryDependencies = defaultSummaryReadDependencies,
): Promise<Civ7UnitSummaryResult> {
  if (input.playerId !== undefined) dependencies.validatePlayerId(input.playerId);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildUnitSummaryCommand(
      {
        ...input,
        playerIds: input.playerIds?.map(dependencies.validatePlayerId),
        maxItems: dependencies.boundedInteger(input.maxItems ?? 128, 1, 1_000, "maxItems"),
      },
      dependencies,
    ),
  });
  return dependencies.parseUnitSummary(result, "Civ7 unit summary");
}

export async function getCiv7CitySummary(
  input: Civ7CitySummaryInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: SummaryReadDependencies = defaultSummaryReadDependencies,
): Promise<Civ7CitySummaryResult> {
  if (input.playerId !== undefined) dependencies.validatePlayerId(input.playerId);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildCitySummaryCommand(
      {
        ...input,
        playerIds: input.playerIds?.map(dependencies.validatePlayerId),
        maxItems: dependencies.boundedInteger(input.maxItems ?? 128, 1, 1_000, "maxItems"),
      },
      dependencies,
    ),
  });
  return dependencies.parseCitySummary(result, "Civ7 city summary");
}

function buildPlayerSummaryCommand(
  input: Civ7PlayerSummaryInput & { maxItems: number },
  dependencies: SummaryReadDependencies,
): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    ${runtimeObjectReaderSource()}
    const input = ${dependencies.jsLiteral(input)};
    const ids = (input.playerIds ?? probe(() => Players.getAliveIds()).value ?? []).slice(0, input.maxItems);
    const summarize = (id) => {
      const player = probe(() => Players.get(id));
      const value = player.ok ? player.value : undefined;
      return {
        id,
        leaderName: probe(() => readValue(value, ["leaderName", "name"], ["getLeaderName", "getName"])),
        civilizationName: probe(() => readValue(value, ["civilizationName", "civilizationType"], ["getCivilizationName", "getCivilizationType"])),
        isHuman: probe(() => readValue(value, ["isHuman"], ["isHuman"])),
        isAlive: probe(() => readValue(value, ["isAlive"], ["isAlive"])),
        isTurnActive: probe(() => readValue(value, ["isTurnActive", "turnActive"], ["isTurnActive"])),
        unitIds: probe(() => Players.Units.get(id).getUnitIds().slice(0, input.maxItems)),
        cityIds: probe(() => Players.Cities.get(id).getCityIds().slice(0, input.maxItems)),
      };
    };
    return JSON.stringify({
      players: ids.map(summarize),
      omitted: Math.max(0, (input.playerIds?.length ?? ids.length) - ids.length),
    });
  })()`;
}

function buildUnitSummaryCommand(
  input: Civ7UnitSummaryInput & { maxItems: number },
  dependencies: Civ7UnitSummaryDependencies,
): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    ${runtimeObjectReaderSource()}
    const input = ${dependencies.jsLiteral(input)};
    const collectIds = () => {
      if (input.unitIds) return input.unitIds;
      const playerIds = input.playerIds ?? (input.playerId !== undefined ? [input.playerId] : Players.getAliveIds());
      const ids = [];
      for (const playerId of playerIds) {
        try {
          ids.push(...Players.Units.get(playerId).getUnitIds());
        } catch {}
      }
      return ids;
    };
    const ids = collectIds();
    const selected = ids.slice(0, input.maxItems);
    const summarize = (id) => {
      const unit = probe(() => Units.get(id));
      const value = unit.ok ? unit.value : undefined;
      return {
        id,
        owner: probe(() => readValue(value, ["owner", "player", "playerId"], ["getOwner", "getPlayer"])),
        name: probe(() => readValue(value, ["name"], ["getName"])),
        type: probe(() => readValue(value, ["type", "unitType"], ["getType", "getUnitType"])),
        location: probe(() => readValue(value, ["location"], ["getLocation"])),
        health: probe(() => readValue(value, ["health"], ["getHealth"])),
        damage: probe(() => readValue(value, ["damage"], ["getDamage"])),
        movement: probe(() => readValue(value, ["movement", "movesRemaining"], ["getMovement", "getMovesRemaining"])),
        activity: probe(() => readValue(value, ["activity", "activityType"], ["getActivityType"])),
      };
    };
    return JSON.stringify({ units: selected.map(summarize), omitted: Math.max(0, ids.length - selected.length) });
  })()`;
}

function buildCitySummaryCommand(
  input: Civ7CitySummaryInput & { maxItems: number },
  dependencies: SummaryReadDependencies,
): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    ${runtimeObjectReaderSource()}
    const input = ${dependencies.jsLiteral(input)};
    const collectIds = () => {
      if (input.cityIds) return input.cityIds;
      const playerIds = input.playerIds ?? (input.playerId !== undefined ? [input.playerId] : Players.getAliveIds());
      const ids = [];
      for (const playerId of playerIds) {
        try {
          ids.push(...Players.Cities.get(playerId).getCityIds());
        } catch {}
      }
      return ids;
    };
    const ids = collectIds();
    const selected = ids.slice(0, input.maxItems);
    const summarize = (id) => {
      const city = probe(() => Cities.get(id));
      const value = city.ok ? city.value : undefined;
      return {
        id,
        owner: probe(() => readValue(value, ["owner", "player", "playerId"], ["getOwner", "getPlayer"])),
        name: probe(() => readValue(value, ["name"], ["getName"])),
        location: probe(() => readValue(value, ["location"], ["getLocation"])),
        population: probe(() => readValue(value, ["population"], ["getPopulation"])),
        growth: probe(() => readValue(value, ["growth"], ["getGrowth"])),
        production: probe(() => readValue(value, ["production"], ["getProduction", "getBuildQueue"])),
      };
    };
    return JSON.stringify({ cities: selected.map(summarize), omitted: Math.max(0, ids.length - selected.length) });
  })()`;
}

function runtimeObjectReaderSource(): string {
  return `const callMaybe = (value, key) => {
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
}

const defaultSummaryReadDependencies: SummaryReadDependencies = {
  boundedInteger,
  executeTunerCommand: executeCiv7TunerCommand,
  jsLiteral,
  parseCitySummary: (result, label) =>
    jsonPayloadFromCommandResult<Civ7CitySummaryResult>(result, label),
  parsePlayerSummary: (result, label) =>
    jsonPayloadFromCommandResult<Civ7PlayerSummaryResult>(result, label),
  parseUnitSummary: (result, label) =>
    jsonPayloadFromCommandResult<Civ7UnitSummaryResult>(result, label),
  probeHelperSource,
  validatePlayerId,
};
