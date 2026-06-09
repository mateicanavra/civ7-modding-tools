import type {
  Civ7CitySummaryInput,
  Civ7CitySummaryResult,
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7PlayerSummaryInput,
  Civ7PlayerSummaryResult,
  Civ7UnitSummaryInput,
  Civ7UnitSummaryResult,
} from "../index";

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

export async function getCiv7PlayerSummary(
  input: Civ7PlayerSummaryInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: SummaryReadDependencies,
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
  dependencies: SummaryReadDependencies,
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
  dependencies: SummaryReadDependencies,
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
  dependencies: SummaryReadDependencies,
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
