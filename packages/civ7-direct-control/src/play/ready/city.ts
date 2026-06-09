import { Type, type Static } from "typebox";

import { Civ7ComponentIdSchema } from "../../civ7-component-id.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../../runtime/probe.js";
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

const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);

export const Civ7ReadyCityViewInputSchema = Type.Object({
  cityId: Type.Optional(Civ7ComponentIdSchema),
  maxOperations: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
}, { additionalProperties: false });
export type Civ7ReadyCityViewInput = Static<typeof Civ7ReadyCityViewInputSchema>;

export const Civ7ReadyCityOperationCandidateSchema = Type.Object({
  family: Type.Union([Type.Literal("city-operation"), Type.Literal("city-command")]),
  operationType: Type.String(),
  enumValue: Type.Unknown(),
  valid: Type.Boolean(),
  result: Type.Unknown(),
}, { additionalProperties: false });
export type Civ7ReadyCityOperationCandidate = Static<typeof Civ7ReadyCityOperationCandidateSchema>;

export const Civ7ReadyCityProductionCandidateSchema = Type.Object({
  kind: Type.Union([Type.Literal("unit"), Type.Literal("constructible"), Type.Literal("project")]),
  type: Type.Unknown(),
  typeName: Type.Union([Type.String(), Type.Null()]),
  name: Type.Union([Type.String(), Type.Null()]),
  args: Type.Unknown(),
  cost: Type.Optional(Type.Unknown()),
  turns: Type.Optional(Type.Unknown()),
  productionBasis: Type.Optional(Type.Unknown()),
  baseYieldSummary: Type.Optional(Type.Unknown()),
  valid: Type.Boolean(),
  result: Type.Unknown(),
  placementPlots: Type.Optional(Type.Array(Type.Unknown())),
}, { additionalProperties: false });
export type Civ7ReadyCityProductionCandidate = Static<typeof Civ7ReadyCityProductionCandidateSchema>;

export const Civ7ReadyCityTownFocusOptionSchema = Type.Object({
  name: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]),
  args: Type.Unknown(),
  valid: Type.Boolean(),
  result: Type.Unknown(),
}, { additionalProperties: false });
export type Civ7ReadyCityTownFocusOption = Static<typeof Civ7ReadyCityTownFocusOptionSchema>;

export const Civ7ReadyCityPopulationPlacementSchema = Type.Object({
  isReadyToPlacePopulation: Civ7RuntimeProbeSchema(Type.Unknown()),
  cityWorkerCap: Civ7RuntimeProbeSchema(Type.Unknown()),
  yieldTypeOrder: Type.Array(Type.String()),
  allPlacementInfo: Civ7RuntimeProbeSchema(Type.Unknown()),
  workablePlotIndexes: Civ7RuntimeProbeSchema(Type.Array(Type.Unknown())),
  blockedPlotIndexes: Civ7RuntimeProbeSchema(Type.Array(Type.Unknown())),
  workablePlots: Civ7RuntimeProbeSchema(Type.Array(Type.Unknown())),
  expansionCandidates: Civ7RuntimeProbeSchema(Type.Array(Type.Unknown())),
  expansionResult: Civ7RuntimeProbeSchema(Type.Unknown()),
  notes: Type.Array(Type.String()),
}, { additionalProperties: false });
export type Civ7ReadyCityPopulationPlacement = Static<typeof Civ7ReadyCityPopulationPlacementSchema>;

export const Civ7ReadyCityViewResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: Type.Object({
    id: Type.String(),
    name: Type.String(),
  }, { additionalProperties: false }),
  localPlayerId: Type.Number(),
  requestedCityId: nullableComponentIdSchema,
  selectedCityId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
  blockingCityId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
  cityId: nullableComponentIdSchema,
  city: Civ7RuntimeProbeSchema(Type.Unknown()),
  legalOperations: Type.Array(Civ7ReadyCityOperationCandidateSchema),
  productionCandidates: Civ7RuntimeProbeSchema(Type.Array(Civ7ReadyCityProductionCandidateSchema)),
  townFocusOptions: Civ7RuntimeProbeSchema(Type.Array(Civ7ReadyCityTownFocusOptionSchema)),
  populationPlacement: Civ7RuntimeProbeSchema(Type.Union([Civ7ReadyCityPopulationPlacementSchema, Type.Null()])),
  notes: Type.Array(Type.String()),
}, { additionalProperties: false });
export type Civ7ReadyCityViewResult = Static<typeof Civ7ReadyCityViewResultSchema>;

export type ReadyCityViewDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseReadyCityView: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7ReadyCityViewResult;
}>;

export async function getCiv7ReadyCityView(
  input: Civ7ReadyCityViewInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: ReadyCityViewDependencies = defaultReadyCityViewDependencies,
): Promise<Civ7ReadyCityViewResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildReadyCityViewCommand({
      ...input,
      maxOperations: dependencies.boundedInteger(input.maxOperations ?? 96, 1, 256, "maxOperations"),
    }),
  });
  return dependencies.parseReadyCityView(result, "Civ7 ready city view");
}

function buildReadyCityViewCommand(input: Civ7ReadyCityViewInput & { maxOperations: number }): string {
  return `(() => {
    ${readyCityViewSource()}
    return JSON.stringify(readReadyCityView(${jsLiteral(input)}));
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

export function readyCityViewSource(): string {
  return `${probeHelperSource()}
    ${runtimeObjectReaderSource()}
    const readNumericField = (value, lowerKey, upperKey) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value[lowerKey] === "number") return value[lowerKey];
      if (typeof value[upperKey] === "number") return value[upperKey];
      return null;
    };
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      const owner = readNumericField(value, "owner", "Owner");
      const id = readNumericField(value, "id", "ID");
      if (owner == null || id == null) return null;
      const out = { owner, id };
      const type = readNumericField(value, "type", "Type");
      if (type != null) out.type = type;
      return out;
    };
    const enumValueFor = (enums, operationType) => {
      if (enums && Object.prototype.hasOwnProperty.call(enums, operationType)) return enums[operationType];
      if (enums && typeof operationType === "string") {
        const normalizedKeys = [
          operationType.replace(/^UNITOPERATION_/, ""),
          operationType.replace(/^UNITCOMMAND_/, ""),
          operationType.replace(/^CITYOPERATION_/, ""),
          operationType.replace(/^CITYCOMMAND_/, ""),
          operationType.replace(/^PLAYEROPERATION_/, ""),
        ];
        for (const key of normalizedKeys) {
          if (Object.prototype.hasOwnProperty.call(enums, key)) return enums[key];
        }
      }
      return operationType;
    };
    const successFromCanStart = (result) => {
      if (result === true) return true;
      if (result === false || result == null) return false;
      if (typeof result === "object") {
        if (result.Success !== undefined) return result.Success === true;
        if (result.success !== undefined) return result.success === true;
        if (result.canStart !== undefined) return result.canStart === true;
      }
      return Boolean(result);
    };
    const safeResult = (result) => {
      try {
        const json = JSON.stringify(result);
        if (json.length > 4000) return { truncatedJson: json.slice(0, 4000), originalLength: json.length };
        return JSON.parse(json);
      } catch {
        return String(result);
      }
    };
    const callCanStart = (router, target, operationType) => {
      try {
        return router.canStart(target, operationType, {}, false);
      } catch (first) {
        try {
          return router.canStart(target, operationType, {});
        } catch {
          try {
            return router.canStart(target, operationType);
          } catch {
            throw first;
          }
        }
      }
    };
    const summarizeBuildQueue = (city) => {
      const buildQueue = city?.BuildQueue;
      if (!buildQueue) return null;
      return {
        currentProductionTypeHash: readValue(buildQueue, ["currentProductionTypeHash", "productionTypeHash"], ["getCurrentProductionTypeHash"]),
        previousProductionTypeHash: readValue(buildQueue, ["previousProductionTypeHash"], ["getPreviousProductionTypeHash"]),
        productionProgress: readValue(buildQueue, ["productionProgress", "progress"], ["getProductionProgress"]),
        turnsLeft: readValue(buildQueue, ["turnsLeft", "turnsRemaining"], ["getTurnsLeft", "getTurnsRemaining"]),
      };
    };
    const summarizeCity = (cityId) => {
      const city = Cities.get(cityId);
      if (!city) return null;
      const normalizedCityId = toComponentId(cityId);
      const observedCityId = toComponentId(city.id);
      const growth = city.Growth;
      const yields = city.Yields;
      const happiness = city.Happiness;
      const workers = city.Workers;
      return {
        id: normalizedCityId,
        owner: city.owner ?? normalizedCityId?.owner ?? null,
        identity: {
          source: "Players.Cities.getCityIds",
          ok: normalizedCityId != null,
          observedCityId,
          reason: normalizedCityId == null
            ? "City id from Players.Cities.getCityIds did not normalize to a ComponentID."
            : null,
        },
        name: typeof city.getName === "function" ? city.getName() : city.name ?? null,
        location: city.location ?? null,
        population: city.population ?? null,
        isTown: city.isTown ?? null,
        growth: growth
          ? {
              growthType: growth.growthType ?? null,
              turnsUntilGrowth: growth.turnsUntilGrowth ?? null,
              nextGrowthFoodThreshold: typeof growth.getNextGrowthFoodThreshold === "function" ? growth.getNextGrowthFoodThreshold() : null,
            }
          : null,
        yields: yields
          ? {
              foodPerTurn: typeof yields.getNetYield === "function" && typeof YieldTypes !== "undefined" ? yields.getNetYield(YieldTypes.YIELD_FOOD) : null,
              productionPerTurn: typeof yields.getNetYield === "function" && typeof YieldTypes !== "undefined" ? yields.getNetYield(YieldTypes.YIELD_PRODUCTION) : null,
              goldPerTurn: typeof yields.getNetYield === "function" && typeof YieldTypes !== "undefined" ? yields.getNetYield(YieldTypes.YIELD_GOLD) : null,
            }
          : null,
        happiness: happiness
          ? {
              netHappinessPerTurn: happiness.netHappinessPerTurn ?? null,
              hasUnrest: happiness.hasUnrest ?? null,
            }
          : null,
        workers: workers
          ? {
              cityWorkerCap: typeof workers.getCityWorkerCap === "function" ? workers.getCityWorkerCap() : null,
            }
          : null,
        buildQueue: summarizeBuildQueue(city),
      };
    };
    const plotFromIndex = (index) => {
      try {
        const location = GameplayMap.getLocationFromIndex(index);
        return { index, x: location?.x ?? null, y: location?.y ?? null };
      } catch (err) {
        return { index, error: String(err) };
      }
    };
    const loc = (key) => {
      if (key == null || key === "") return null;
      try {
        return typeof Locale !== "undefined" && Locale.compose ? Locale.compose(key) : String(key);
      } catch {
        return String(key);
      }
    };
    const lookupRow = (table, value) => {
      try {
        return value == null ? null : table?.lookup?.(value) ?? null;
      } catch {
        return null;
      }
    };
    const readYieldTypeOrder = () => {
      const order = [];
      try {
        const yieldsTable = GameInfo?.Yields;
        if (!yieldsTable) return order;
        if (typeof yieldsTable.length === "number") {
          for (let index = 0; index < yieldsTable.length; index++) {
            const definition = yieldsTable[index];
            order.push(definition?.YieldType ?? ("YIELD_INDEX_" + index));
          }
          return order;
        }
        if (typeof yieldsTable[Symbol.iterator] === "function") {
          let index = 0;
          for (const definition of yieldsTable) {
            order.push(definition?.YieldType ?? ("YIELD_INDEX_" + index));
            index++;
          }
        }
      } catch {}
      return order;
    };
    const yieldTypeOrder = readYieldTypeOrder();
    const yieldTypeAtIndex = (index) => yieldTypeOrder[index] ?? ("YIELD_INDEX_" + index);
    const namedYields = (values) => {
      if (!Array.isArray(values)) return null;
      const out = {};
      values.forEach((value, index) => {
        out[yieldTypeAtIndex(index)] = value;
      });
      return out;
    };
    const yieldDelta = (current, next) => {
      if (!Array.isArray(current) || !Array.isArray(next)) return null;
      return namedYields(next.map((value, index) => value - (current[index] ?? 0)));
    };
    const namedYieldPairs = (values) => {
      if (!Array.isArray(values)) return null;
      const out = {};
      for (const pair of values) {
        if (!Array.isArray(pair)) continue;
        const yieldHash = pair[0];
        const yieldRow = lookupRow(GameInfo?.Yields, yieldHash);
        out[yieldRow?.YieldType ?? String(yieldHash)] = pair[1];
      }
      return out;
    };
    const plotFacts = (plot, cityId) => {
      if (plot.x == null || plot.y == null) return null;
      const terrain = probe(() => GameplayMap.getTerrainType(plot.x, plot.y));
      const feature = probe(() => GameplayMap.getFeatureType(plot.x, plot.y));
      const resource = probe(() => GameplayMap.getResourceType(plot.x, plot.y));
      const yieldSource = typeof GameplayMap?.getYieldsWithCity === "function" && cityId
        ? "GameplayMap.getYieldsWithCity(plotIndex, cityId)"
        : "GameplayMap.getYields(plotIndex, playerId)";
      const yields = probe(() => {
        if (plot.index == null) return [];
        if (typeof GameplayMap?.getYieldsWithCity === "function" && cityId) {
          return GameplayMap.getYieldsWithCity(plot.index, cityId);
        }
        const playerId = cityId?.owner ?? (typeof GameContext !== "undefined" ? GameContext.localPlayerID : null);
        return GameplayMap.getYields(plot.index, playerId);
      });
      const terrainRow = terrain.ok ? lookupRow(GameInfo.Terrains, terrain.value) : null;
      const featureRow = feature.ok ? lookupRow(GameInfo.Features, feature.value) : null;
      const resourceRow = resource.ok ? lookupRow(GameInfo.Resources, resource.value) : null;
      return {
        terrain,
        terrainType: terrainRow?.TerrainType ?? null,
        terrainName: loc(terrainRow?.Name ?? terrainRow?.TerrainType ?? null),
        feature,
        featureType: featureRow?.FeatureType ?? null,
        featureName: loc(featureRow?.Name ?? featureRow?.FeatureType ?? null),
        resource,
        resourceType: resourceRow?.ResourceType ?? null,
        resourceName: loc(resourceRow?.Name ?? resourceRow?.ResourceType ?? null),
        water: probe(() => GameplayMap.isWater(plot.x, plot.y)),
        yields,
        yieldSource,
        yieldSummary: yields.ok ? namedYieldPairs(yields.value) : null,
      };
    };
    const constructibleSummary = (constructibleType) => {
      try {
        const definition = constructibleType == null ? null : GameInfo?.Constructibles?.lookup?.(constructibleType);
        return {
          constructibleType: constructibleType ?? null,
          constructibleTypeName: definition?.ConstructibleType ?? null,
          constructibleName: loc(definition?.Name ?? null),
          constructibleClass: definition?.ConstructibleClass ?? null,
          constructibleDistrictType: definition?.DistrictType ?? null,
        };
      } catch {
        return {
          constructibleType: constructibleType ?? null,
          constructibleTypeName: null,
          constructibleName: null,
          constructibleClass: null,
          constructibleDistrictType: null,
        };
      }
    };
    const constructibleBaseYieldSummary = (constructibleType) => {
      const out = {};
      try {
        if (!GameInfo?.Constructible_YieldChanges) return out;
        for (const yieldChange of GameInfo.Constructible_YieldChanges) {
          if (yieldChange?.ConstructibleType !== constructibleType) continue;
          out[yieldChange.YieldType ?? "YIELD_UNKNOWN"] = yieldChange.YieldChange ?? 0;
        }
      } catch {}
      return out;
    };
    const productionBasis = (city, kind, definition, args, result) => {
      const buildQueue = city?.BuildQueue;
      const production = city?.Production;
      const type = args?.UnitType ?? args?.ConstructibleType ?? args?.ProjectType ?? null;
      const turns = (() => {
        try {
          return type == null || typeof buildQueue?.getTurnsLeft !== "function" ? null : buildQueue.getTurnsLeft(type);
        } catch {
          return null;
        }
      })();
      if (kind === "constructible") {
        const productionCost = (() => {
          try {
            return typeof production?.getConstructibleProductionCost === "function" ? production.getConstructibleProductionCost(args.ConstructibleType) : null;
          } catch {
            return null;
          }
        })();
        const cost = productionCost ?? result?.Cost ?? definition?.Cost ?? null;
        return {
          cost,
          turns,
          showTurns: turns != null && turns > -1,
          showCost: cost != null && cost > 0,
          costSource: productionCost != null ? "city.Production.getConstructibleProductionCost(ConstructibleType)" : result?.Cost != null ? "CityOperations.canStart(...).Cost" : "GameInfo.Constructibles.Cost",
          turnsSource: "city.BuildQueue.getTurnsLeft(type)",
        };
      }
      if (kind === "unit") {
        const cost = (() => {
          try {
            return typeof production?.getUnitProductionCost === "function" ? production.getUnitProductionCost(args.UnitType) : null;
          } catch {
            return null;
          }
        })();
        return {
          cost,
          turns,
          showTurns: turns != null && turns > -1,
          showCost: cost != null && cost > 0,
          costSource: "city.Production.getUnitProductionCost(UnitType)",
          turnsSource: "city.BuildQueue.getTurnsLeft(type)",
        };
      }
      const cost = (() => {
        try {
          return typeof production?.getProjectProductionCost === "function" ? production.getProjectProductionCost(args.ProjectType) : null;
        } catch {
          return null;
        }
      })();
      return {
        cost,
        turns,
        showTurns: turns != null && turns > -1,
        showCost: cost != null && cost > 0,
        costSource: "city.Production.getProjectProductionCost(ProjectType)",
        turnsSource: "city.BuildQueue.getTurnsLeft(type)",
      };
    };
    const productionCandidate = (city, kind, type, definition, args, result) => {
      const basis = productionBasis(city, kind, definition, args, result);
      return {
        kind,
        type,
        typeName: definition?.UnitType ?? definition?.ConstructibleType ?? definition?.ProjectType ?? null,
        name: definition?.Name ?? null,
        args,
        cost: basis.cost,
        turns: basis.turns,
        productionBasis: basis,
        ...(kind === "constructible" ? { baseYieldSummary: constructibleBaseYieldSummary(definition?.ConstructibleType) } : {}),
        valid: successFromCanStart(result),
        result: safeResult(result),
        ...(Array.isArray(result?.Plots) ? { placementPlots: result.Plots.map(plotFromIndex) } : {}),
      };
    };
    const isActionableProductionResult = (result) => {
      if (!result || typeof result !== "object") return false;
      return successFromCanStart(result)
        || result.InQueue === true
        || result.InProgress === true;
    };
    const readConstructibleCandidates = (city) => {
      if (typeof Game?.CityOperations?.canStartQuery !== "function") return [];
      const results = Game.CityOperations.canStartQuery(city.id, CityOperationTypes.BUILD, CityQueryType.Constructible) ?? [];
      return results
        .filter(({ result }) => isActionableProductionResult(result))
        .map(({ index, result }) => productionCandidate(
          city,
          "constructible",
          index,
          GameInfo.Constructibles.lookup(index),
          { ConstructibleType: index },
          result,
        ));
    };
    const readUnitCandidates = (city) => {
      if (typeof Game?.CityOperations?.canStartQuery !== "function") return [];
      const results = Game.CityOperations.canStartQuery(city.id, CityOperationTypes.BUILD, CityQueryType.Unit) ?? [];
      return results
        .filter(({ result }) => isActionableProductionResult(result))
        .map(({ index, result }) => productionCandidate(
          city,
          "unit",
          index,
          GameInfo.Units.lookup(index),
          { UnitType: index },
          result,
        ));
    };
    const readProjectCandidates = (city, maxOperations) => {
      const out = [];
      if (!GameInfo?.Projects || typeof GameInfo.Projects.forEach !== "function") return out;
      GameInfo.Projects.forEach((project) => {
        if (out.length >= maxOperations) return;
        try {
          if (project.CityOnly && city.isTown) return;
          const args = { ProjectType: project.$index };
          const result = Game.CityOperations.canStart(city.id, CityOperationTypes.BUILD, args, false);
          if (result?.Requirements && result.Requirements?.FullFailure === true) return;
          if (!isActionableProductionResult(result)) return;
          out.push(productionCandidate(city, "project", project.$index, project, args, result));
        } catch {}
      });
      return out;
    };
    const readProductionCandidates = (cityId, maxOperations) => {
      const city = Cities.get(cityId);
      if (!city) return [];
      return [
        ...readConstructibleCandidates(city),
        ...readUnitCandidates(city),
        ...readProjectCandidates(city, maxOperations),
      ].slice(0, maxOperations);
    };
    const townFocusOption = (name, description, args, result) => ({
      name,
      description,
      args,
      valid: successFromCanStart(result),
      result: safeResult(result),
    });
    const readTownFocusOptions = (cityId) => {
      const out = [];
      const city = Cities.get(cityId);
      if (!city?.isTown) return out;
      const expandArgs = { Type: GrowthTypes.EXPAND, ProjectType: ProjectTypes.NO_PROJECT, City: cityId.id };
      out.push(townFocusOption("LOC_UI_FOOD_CHOOSER_FOCUS_GROWTH", "LOC_PROJECT_TOWN_FOOD_INCREASE_DESCRIPTION", expandArgs, { Success: true }));
      const result = Game.CityCommands.canStart(cityId, CityCommandTypes.CHANGE_GROWTH_MODE, { Type: GrowthTypes.PROJECT }, false);
      for (const projectType of result?.Projects ?? []) {
        const projectInfo = GameInfo.Projects.lookup(projectType);
        const args = { Type: GrowthTypes.PROJECT, ProjectType: projectInfo?.$hash ?? projectType, City: cityId.id };
        const validation = Game.CityCommands.canStart(cityId, CityCommandTypes.CHANGE_GROWTH_MODE, args, false);
        out.push(townFocusOption(projectInfo?.Name ?? null, projectInfo?.Description ?? null, args, validation));
      }
      return out;
    };
    const readPopulationPlacement = (cityId) => {
      const city = Cities.get(cityId);
      const allPlacementInfo = probe(() => city?.Workers?.GetAllPlacementInfo?.() ?? []);
      const placementValue = allPlacementInfo.ok && Array.isArray(allPlacementInfo.value) ? allPlacementInfo.value : [];
      const expansionResult = probe(() => {
        if (typeof Game?.CityCommands?.canStart !== "function") return null;
        if (typeof CityCommandTypes === "undefined") return null;
        return Game.CityCommands.canStart(cityId, CityCommandTypes.EXPAND, {}, false);
      });
      const summarizeWorkerPlot = (info) => {
        const plotIndex = info?.PlotIndex;
        return {
          ...plotFromIndex(plotIndex),
          isBlocked: info?.IsBlocked ?? null,
          currentYields: info?.CurrentYields ?? null,
          nextYields: info?.NextYields ?? null,
          currentYieldSummary: namedYields(info?.CurrentYields),
          nextYieldSummary: namedYields(info?.NextYields),
          yieldDelta: yieldDelta(info?.CurrentYields, info?.NextYields),
          maintenance: info?.Maintenance ?? null,
          placementInfo: safeResult(info),
        };
      };
      const expansionValue = expansionResult.ok && expansionResult.value && typeof expansionResult.value === "object"
        ? expansionResult.value
        : {};
      const expansionPlots = Array.isArray(expansionValue?.Plots) ? expansionValue.Plots : [];
      const expansionConstructibleTypes = Array.isArray(expansionValue?.ConstructibleTypes) ? expansionValue.ConstructibleTypes : [];
      const expansionCandidatesValue = expansionPlots.map((plotIndex, index) => {
        const plot = plotFromIndex(plotIndex);
        return {
          ...plot,
          ...constructibleSummary(expansionConstructibleTypes[index]),
          plotFacts: plotFacts(plot, cityId),
        };
      });
      return {
        isReadyToPlacePopulation: probe(() => city?.Growth?.isReadyToPlacePopulation ?? null),
        cityWorkerCap: probe(() => city?.Workers?.getCityWorkerCap?.() ?? null),
        yieldTypeOrder,
        allPlacementInfo,
        workablePlotIndexes: probe(() => placementValue.filter((info) => !info?.IsBlocked).map((info) => info?.PlotIndex)),
        blockedPlotIndexes: probe(() => placementValue.filter((info) => info?.IsBlocked).map((info) => info?.PlotIndex)),
        workablePlots: probe(() => placementValue.filter((info) => !info?.IsBlocked).map(summarizeWorkerPlot)),
        expansionCandidates: probe(() => expansionCandidatesValue),
        expansionResult,
        notes: [
          "For NEW_POPULATION, compare workablePlots against expansionCandidates; assign-worker and expand-city are different acquire-tile branches.",
        ],
      };
    };
    const operationCandidates = (cityId, maxOperations) => {
      const families = [
        { family: "city-operation", router: Game.CityOperations, enums: typeof CityOperationTypes !== "undefined" ? CityOperationTypes : {} },
        { family: "city-command", router: Game.CityCommands, enums: typeof CityCommandTypes !== "undefined" ? CityCommandTypes : {} },
      ];
      const out = [];
      for (const entry of families) {
        const keys = Object.keys(entry.enums ?? {}).sort().slice(0, maxOperations);
        for (const operationType of keys) {
          const enumValue = enumValueFor(entry.enums, operationType);
          let result;
          try {
            result = callCanStart(entry.router, cityId, enumValue);
          } catch {
            continue;
          }
          const valid = successFromCanStart(result);
          if (valid) {
            out.push({
              family: entry.family,
              operationType,
              enumValue,
              valid,
              result: safeResult(result),
            });
          }
        }
      }
      return out;
    };
    const readyPopulationCityId = () => {
      const player = Players.get(GameContext.localPlayerID);
      const cityIds = player?.Cities?.getCityIds?.() ?? [];
      for (const cityId of cityIds) {
        const city = Cities.get(cityId);
        if (city?.Growth?.isReadyToPlacePopulation) return toComponentId(cityId);
      }
      return null;
    };
    const blockingCityId = () => {
      const blockerType = typeof Game?.Notifications?.getEndTurnBlockingType === "function"
        ? Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID)
        : null;
      const notificationId = typeof Game?.Notifications?.findEndTurnBlocking === "function"
        ? Game.Notifications.findEndTurnBlocking(GameContext.localPlayerID, blockerType)
        : null;
      const notification = notificationId ? Game.Notifications.find(notificationId) : null;
      const target = toComponentId(notification?.Target);
      if (target && Cities.get(target)) return target;
      const notificationType = (() => {
        try {
          return notificationId && typeof Game?.Notifications?.getType === "function"
            ? Game.Notifications.getType(notificationId)
            : notification?.Type ?? blockerType;
        } catch {
          return notification?.Type ?? blockerType;
        }
      })();
      const typeName = (() => {
        try {
          return typeof Game?.Notifications?.getTypeName === "function"
            ? Game.Notifications.getTypeName(notificationType)
            : null;
        } catch {
          return null;
        }
      })();
      if (String(typeName ?? "").toUpperCase().includes("NEW_POPULATION")) {
        const populationCityId = readyPopulationCityId();
        if (populationCityId && Cities.get(populationCityId)) return populationCityId;
      }
      const selected = toComponentId(UI?.Player?.getHeadSelectedCity?.());
      return selected && Cities.get(selected) ? selected : null;
    };
    const readReadyCityView = (input) => {
      const requestedCityId = toComponentId(input.cityId);
      const selectedCityId = probe(() => toComponentId(UI?.Player?.getHeadSelectedCity?.()));
      const blockerCityId = probe(() => blockingCityId());
      const cityId = requestedCityId
        ?? (selectedCityId.ok ? selectedCityId.value : null)
        ?? (blockerCityId.ok ? blockerCityId.value : null);
      return {
        localPlayerId: GameContext.localPlayerID,
        requestedCityId,
        selectedCityId,
        blockingCityId: blockerCityId,
        cityId,
        city: probe(() => cityId ? summarizeCity(cityId) : null),
        legalOperations: cityId ? operationCandidates(cityId, input.maxOperations) : [],
        productionCandidates: probe(() => cityId ? readProductionCandidates(cityId, input.maxOperations) : []),
        townFocusOptions: probe(() => cityId ? readTownFocusOptions(cityId) : []),
        populationPlacement: probe(() => cityId ? readPopulationPlacement(cityId) : null),
        notes: [
          "Read-only ready-city view. Use operation validation before any production, growth, or expansion send.",
          "This view intentionally does not choose production. Use live production chooser data, then choose exactly one production item kind through the semantic production request.",
          "For NEW_POPULATION, acquire-tile mode decides worker assignment versus expansion purchase; do not infer that branch from static city data.",
          "No-argument legal city operations are only closeout candidates; BUILD and CHANGE_GROWTH_MODE still need live item or focus args."
        ],
      };
    };`;
}

const defaultReadyCityViewDependencies: ReadyCityViewDependencies = {
  boundedInteger,
  executeAppUiCommand: executeCiv7AppUiCommand,
  parseReadyCityView: (result, label) =>
    jsonPayloadFromCommandResult<Civ7ReadyCityViewResult>(result, label),
};
