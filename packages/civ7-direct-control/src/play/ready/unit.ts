import { type Static, Type } from "typebox";

import { Civ7ComponentIdSchema } from "../../civ7-component-id.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import type { Civ7CommandResult, Civ7DirectControlOptions } from "../../session/types.js";
import { boundedInteger } from "../../validation.js";

const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);

export const Civ7ReadyUnitViewInputSchema = Type.Object(
  {
    unitId: Type.Optional(Civ7ComponentIdSchema),
    radius: Type.Optional(Type.Integer({ minimum: 0, maximum: 5 })),
    maxOperations: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
  },
  { additionalProperties: false }
);
export type Civ7ReadyUnitViewInput = Static<typeof Civ7ReadyUnitViewInputSchema>;

export const Civ7ReadyUnitOperationCandidateSchema = Type.Object(
  {
    family: Type.Union([Type.Literal("unit-operation"), Type.Literal("unit-command")]),
    operationType: Type.String(),
    enumValue: Type.Unknown(),
    valid: Type.Boolean(),
    result: Type.Unknown(),
  },
  { additionalProperties: false }
);
export type Civ7ReadyUnitOperationCandidate = Static<typeof Civ7ReadyUnitOperationCandidateSchema>;

export const Civ7ReadyUnitNearbyPlotSchema = Type.Object(
  {
    x: Type.Number(),
    y: Type.Number(),
    units: Type.Unknown(),
  },
  { additionalProperties: false }
);
export type Civ7ReadyUnitNearbyPlot = Static<typeof Civ7ReadyUnitNearbyPlotSchema>;

export const Civ7ReadyUnitPromotionReadinessSchema = Type.Object(
  {
    hasExperience: Type.Boolean(),
    canPromote: Type.Unknown(),
    promotionClass: Type.Union([Type.String(), Type.Null()]),
    level: Type.Unknown(),
    experiencePoints: Type.Unknown(),
    experienceToNextLevel: Type.Unknown(),
    totalPromotionsEarned: Type.Unknown(),
    storedPromotionPoints: Type.Unknown(),
    storedCommendations: Type.Unknown(),
    canPurchase: Type.Boolean(),
    availablePromotions: Type.Array(
      Type.Object(
        {
          disciplineType: Type.String(),
          promotionType: Type.String(),
          name: Type.Union([Type.String(), Type.Null()]),
          description: Type.Union([Type.String(), Type.Null()]),
          commendation: Type.Boolean(),
          args: Type.Unknown(),
          validation: Type.Unknown(),
        },
        { additionalProperties: false }
      )
    ),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);
export type Civ7ReadyUnitPromotionReadiness = Static<typeof Civ7ReadyUnitPromotionReadinessSchema>;

export const Civ7ReadyUnitViewResultSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    state: Type.Object(
      {
        id: Type.String(),
        name: Type.String(),
      },
      { additionalProperties: false }
    ),
    localPlayerId: Type.Number(),
    requestedUnitId: nullableComponentIdSchema,
    selectedUnitId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
    firstReadyUnitId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
    unitId: nullableComponentIdSchema,
    unit: Civ7RuntimeProbeSchema(Type.Unknown()),
    legalOperations: Type.Array(Civ7ReadyUnitOperationCandidateSchema),
    promotionReadiness: Civ7RuntimeProbeSchema(
      Type.Union([Civ7ReadyUnitPromotionReadinessSchema, Type.Null()])
    ),
    nearby: Civ7RuntimeProbeSchema(Type.Array(Civ7ReadyUnitNearbyPlotSchema)),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);
export type Civ7ReadyUnitViewResult = Static<typeof Civ7ReadyUnitViewResultSchema>;

export type ReadyUnitViewDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
  parseReadyUnitView: (result: Civ7CommandResult, label: string) => Civ7ReadyUnitViewResult;
}>;

export async function getCiv7ReadyUnitView(
  input: Civ7ReadyUnitViewInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: ReadyUnitViewDependencies = defaultReadyUnitViewDependencies
): Promise<Civ7ReadyUnitViewResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildReadyUnitViewCommand({
      ...input,
      radius: dependencies.boundedInteger(input.radius ?? 2, 0, 5, "radius"),
      maxOperations: dependencies.boundedInteger(
        input.maxOperations ?? 96,
        1,
        256,
        "maxOperations"
      ),
    }),
  });
  return dependencies.parseReadyUnitView(result, "Civ7 ready unit view");
}

function buildReadyUnitViewCommand(
  input: Civ7ReadyUnitViewInput & { radius: number; maxOperations: number }
): string {
  return `(() => {
    ${readyUnitViewSource()}
    return JSON.stringify(readReadyUnitView(${jsLiteral(input)}));
  })()`;
}

function readyUnitViewSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
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
    const safeResult = (result) => {
      try {
        const json = JSON.stringify(result);
        if (json.length > 4000) return { truncatedJson: json.slice(0, 4000), originalLength: json.length };
        return JSON.parse(json);
      } catch {
        return String(result);
      }
    };
    const summarizeUnit = (unitId) => {
      const unit = Units.get(unitId);
      if (!unit) return null;
      const movement = unit.Movement;
      const combat = unit.Combat;
      const health = unit.Health;
      const type = unit.type ?? null;
      const typeDef = (() => {
        try {
          return type == null ? null : GameInfo.Units.lookup(type);
        } catch {
          return null;
        }
      })();
      return {
        id: toComponentId(unit.id ?? unitId),
        owner: unit.owner ?? unitId.owner,
        type,
        typeName: typeDef?.UnitType ?? null,
        name: typeof unit.getName === "function" ? unit.getName() : unit.name ?? typeDef?.Name ?? null,
        location: unit.location ?? null,
        movementMovesRemaining: movement?.movementMovesRemaining ?? null,
        movementTurnsRemaining: movement?.movementTurnsRemaining ?? null,
        attacksRemaining: combat?.attacksRemaining ?? null,
        rangedStrength: combat?.rangedStrength ?? null,
        bombardStrength: combat?.bombardStrength ?? null,
        meleeStrength: typeof combat?.getMeleeStrength === "function" ? combat.getMeleeStrength(false) : null,
        damage: health?.damage ?? null,
        hitPoints: health?.hitPoints ?? null,
        activity: unit.Activity?.activityType ?? unit.activityType ?? null,
      };
    };
    const operationCandidates = (unitId, maxOperations, notes) => {
      const families = [
        { family: "unit-operation", router: Game.UnitOperations, table: GameInfo.UnitOperations, typeKey: "OperationType", enums: typeof UnitOperationTypes !== "undefined" ? UnitOperationTypes : {} },
        { family: "unit-command", router: Game.UnitCommands, table: GameInfo.UnitCommands, typeKey: "CommandType", enums: typeof UnitCommandTypes !== "undefined" ? UnitCommandTypes : {} },
      ];
      const abilities = [];
      const abilityTable = GameInfo.UnitAbilities;
      if (!abilityTable || typeof abilityTable[Symbol.iterator] !== "function") {
        notes.push("Stock unit-action candidates are unavailable: GameInfo.UnitAbilities is not iterable; an empty legalOperations list does not prove no legal action.");
        return [];
      }
      for (const ability of abilityTable) abilities.push(ability);
      const out = [];
      for (const entry of families) {
        if (!entry.table || typeof entry.table.forEach !== "function" || typeof entry.router?.canStart !== "function") {
          notes.push("Stock " + entry.family + " candidates are unavailable; an empty legalOperations list does not prove no legal action.");
          continue;
        }
        let attempted = 0;
        let truncated = false;
        entry.table.forEach((definition) => {
          if (!definition.VisibleInUI) return;
          const operationType = definition[entry.typeKey];
          if (typeof operationType !== "string") return;
          const enumValue = enumValueFor(entry.enums, operationType);
          const matches = abilities.filter((ability) => ability.CommandType === operationType || ability.OperationType === operationType);
          for (const ability of matches.length > 0 ? matches : [null]) {
            if (attempted >= maxOperations) {
              if (!truncated) notes.push("Stock " + entry.family + " candidate coverage reached maxOperations; unqueried actions remain unknown.");
              truncated = true;
              return;
            }
            attempted += 1;
            const args = { X: -9999, Y: -9999, UnitAbilityType: ability ? ability.$index : -1 };
            if (operationType === "UNITOPERATION_WMD_STRIKE") {
              if (typeof Database === "undefined" || typeof Database.makeHash !== "function") {
                notes.push("WMD candidate is unavailable: Database.makeHash is unavailable.");
                continue;
              }
              args.Type = Database.makeHash("WMD_NUCLEAR_DEVICE");
            }
            try {
              // Match stock unit-actions visibility and parameter admission, never probe enum identities.
              const exclusion = entry.router.canStart(unitId, operationType, args, true);
              if (exclusion?.Success !== true) continue;
              const result = entry.router.canStart(unitId, operationType, args, false);
              if (result?.Success !== true) continue;
              out.push({ family: entry.family, operationType: operationType.replace(/^UNITOPERATION_|^UNITCOMMAND_/, ""), enumValue, valid: true, result: safeResult(result) });
            } catch (err) {
              notes.push("Stock " + operationType + " query failed: " + String(err) + "; availability remains unknown.");
            }
          }
        });
      }
      return out;
    };
    const nearbyPlots = (unit, radius, notes) => {
      const location = unit?.location;
      if (!unit) return [];
      if (!location || !Number.isSafeInteger(location.x) || !Number.isSafeInteger(location.y)
        || location.x < 0 || location.y < 0) {
        notes.push("The live unit has no valid plot coordinates; nearby coverage remains unknown and no plot query was made.");
        return [];
      }
      if (typeof MapUnits === "undefined" || typeof MapUnits.getUnits !== "function") {
        notes.push("MapUnits.getUnits is unavailable; nearby coverage remains unknown.");
        return [];
      }
      let minX = location.x;
      let maxX = location.x;
      let minY = location.y;
      let maxY = location.y;
      if (radius > 0) {
        const width = probe(() => typeof GameplayMap !== "undefined" && typeof GameplayMap.getGridWidth === "function" ? GameplayMap.getGridWidth() : null);
        const height = probe(() => typeof GameplayMap !== "undefined" && typeof GameplayMap.getGridHeight === "function" ? GameplayMap.getGridHeight() : null);
        const validWidth = width.ok && Number.isSafeInteger(width.value) && width.value > 0;
        const validHeight = height.ok && Number.isSafeInteger(height.value) && height.value > 0;
        if ((validWidth && location.x >= width.value) || (validHeight && location.y >= height.value)) {
          notes.push("The live unit location is outside the admitted map bounds; nearby coverage remains unknown and no plot query was made.");
          return [];
        }
        if (!validWidth || !validHeight) {
          notes.push("Map dimensions are unavailable or invalid; nearby coverage is limited to the live unit's own plot and the broader neighborhood remains unknown.");
        } else {
          minX = Math.max(0, location.x - radius);
          maxX = Math.min(width.value - 1, location.x + radius);
          minY = Math.max(0, location.y - radius);
          maxY = Math.min(height.value - 1, location.y + radius);
          if (minX !== location.x - radius || maxX !== location.x + radius
            || minY !== location.y - radius || maxY !== location.y + radius) {
            notes.push("Nearby coverage is clipped to admitted map bounds; across-wrap neighbors are not queried and coverage beyond the clipped edges remains unknown.");
          }
        }
      }
      const plots = [];
      let queryFailed = false;
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          let units = [];
          try {
            units = MapUnits.getUnits(x, y);
          } catch { queryFailed = true; }
          if (Array.isArray(units) && units.length > 0) {
            plots.push({
              x,
              y,
              units: units.map((id) => summarizeUnit(id) ?? toComponentId(id) ?? id),
            });
          }
        }
      }
      if (queryFailed) notes.push("One or more in-bounds nearby plot reads failed; nearby coverage remains unknown.");
      return plots;
    };
    const promotionReadiness = (unitId) => {
      const unit = Units.get(unitId);
      if (!unit) return null;
      const experience = unit.Experience;
      if (!experience) {
        return {
          hasExperience: false,
          canPromote: null,
          promotionClass: null,
          level: null,
          experiencePoints: null,
          experienceToNextLevel: null,
          totalPromotionsEarned: null,
          storedPromotionPoints: null,
          storedCommendations: null,
          canPurchase: false,
          availablePromotions: [],
          notes: ["This unit has no Experience component, so promotion UI proof is not available."],
        };
      }
      const unitDef = GameInfo.Units.lookup(unit.type);
      const promotionClass = unitDef?.PromotionClass ?? null;
      const storedPromotionPoints = experience.getStoredPromotionPoints ?? 0;
      const storedCommendations = experience.getStoredCommendations ?? 0;
      const availablePromotions = [];
      if (promotionClass) {
        GameInfo.UnitPromotionClassSets.forEach((classSet) => {
          if (classSet.PromotionClassType !== promotionClass) return;
          const disciplineType = classSet.UnitPromotionDisciplineType;
          GameInfo.UnitPromotionDisciplineDetails.filter((detail) => detail.UnitPromotionDisciplineType === disciplineType)
            .forEach((detail) => {
              const promotion = GameInfo.UnitPromotions.lookup(detail.UnitPromotionType);
              if (!promotion) return;
              const alreadyEarned = !!experience.hasPromotion?.(disciplineType, promotion.UnitPromotionType);
              if (alreadyEarned) return;
              const canEarn = !!experience.canEarnPromotion?.(disciplineType, promotion.UnitPromotionType, false);
              if (!experience.canPromote || !canEarn) return;
              const args = {
                PromotionType: Database.makeHash(promotion.UnitPromotionType),
                PromotionDisciplineType: Database.makeHash(disciplineType),
              };
              let validation = null;
              try {
                validation = Game.UnitCommands.canStart(unit.id, UnitCommandTypes.PROMOTE, args, false);
              } catch (err) {
                validation = { error: String(err) };
              }
              availablePromotions.push({
                disciplineType,
                promotionType: promotion.UnitPromotionType,
                name: promotion.Name ?? null,
                description: promotion.Description ?? null,
                commendation: !!promotion.Commendation,
                args,
                validation: safeResult(validation),
              });
            });
        });
      }
      return {
        hasExperience: true,
        canPromote: experience.canPromote ?? null,
        promotionClass,
        level: experience.getLevel ?? null,
        experiencePoints: experience.experiencePoints ?? null,
        experienceToNextLevel: experience.experienceToNextLevel ?? null,
        totalPromotionsEarned: experience.getTotalPromotionsEarned ?? null,
        storedPromotionPoints,
        storedCommendations,
        canPurchase: storedPromotionPoints > 0 || storedCommendations > 0,
        availablePromotions,
        notes: [
          "PROMOTE can open the commander promotion UI even when no points are spendable.",
          "Spend only when stored promotion or commendation points are positive and an available promotion has validator-backed args.",
        ],
      };
    };
    const readReadyUnitView = (input) => {
      const selectedUnitId = probe(() => toComponentId(UI?.Player?.getHeadSelectedUnit?.()));
      const firstReadyUnitId = probe(() => toComponentId(UI?.Player?.getFirstReadyUnit?.()));
      const requestedUnitId = toComponentId(input.unitId);
      const unitId = requestedUnitId
        ?? (selectedUnitId.ok ? selectedUnitId.value : null)
        ?? (firstReadyUnitId.ok ? firstReadyUnitId.value : null);
      const unit = probe(() => unitId ? summarizeUnit(unitId) : null);
      const unitValue = unit.ok ? unit.value : null;
      const candidateNotes = [];
      const legalOperations = unitValue
        ? operationCandidates(unitId, input.maxOperations, candidateNotes)
        : [];
      if (unitId && !unitValue) candidateNotes.push("The requested/ready unit did not resolve to a live unit; no native action query was made and action availability remains unknown.");
      return {
        localPlayerId: GameContext.localPlayerID,
        requestedUnitId,
        selectedUnitId,
        firstReadyUnitId,
        unitId,
        unit,
        legalOperations,
        promotionReadiness: probe(() => unitValue ? promotionReadiness(unitId) : null),
        nearby: probe(() => nearbyPlots(unitValue, input.radius, candidateNotes)),
        notes: [
          "Read-only ready-unit view. Use operation validation before mutation.",
          "legalOperations covers stock VisibleInUI action candidates only, not arbitrary operation enums; absence is not proof that every possible action is disabled.",
          ...candidateNotes,
          "For plot-target moves or attacks, use the unit-target action path so the official right-click action order decides the operation.",
          "For commanders, a legal PROMOTE/open action is not proof that a spendable promotion exists; inspect commander points before choosing promotion args."
        ],
      };
    };`;
}

const defaultReadyUnitViewDependencies: ReadyUnitViewDependencies = {
  boundedInteger,
  executeAppUiCommand: executeCiv7AppUiCommand,
  parseReadyUnitView: (result, label) =>
    jsonPayloadFromCommandResult<Civ7ReadyUnitViewResult>(result, label),
};
