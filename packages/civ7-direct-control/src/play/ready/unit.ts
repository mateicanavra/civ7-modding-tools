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
} from "../../session/types.js";

const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);

export const Civ7ReadyUnitViewInputSchema = Type.Object({
  unitId: Type.Optional(Civ7ComponentIdSchema),
  radius: Type.Optional(Type.Integer({ minimum: 0, maximum: 5 })),
  maxOperations: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
}, { additionalProperties: false });
export type Civ7ReadyUnitViewInput = Static<typeof Civ7ReadyUnitViewInputSchema>;

export const Civ7ReadyUnitOperationCandidateSchema = Type.Object({
  family: Type.Union([Type.Literal("unit-operation"), Type.Literal("unit-command")]),
  operationType: Type.String(),
  enumValue: Type.Unknown(),
  valid: Type.Boolean(),
  result: Type.Unknown(),
}, { additionalProperties: false });
export type Civ7ReadyUnitOperationCandidate = Static<typeof Civ7ReadyUnitOperationCandidateSchema>;

export const Civ7ReadyUnitNearbyPlotSchema = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  units: Type.Unknown(),
}, { additionalProperties: false });
export type Civ7ReadyUnitNearbyPlot = Static<typeof Civ7ReadyUnitNearbyPlotSchema>;

export const Civ7ReadyUnitPromotionReadinessSchema = Type.Object({
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
  availablePromotions: Type.Array(Type.Object({
    disciplineType: Type.String(),
    promotionType: Type.String(),
    name: Type.Union([Type.String(), Type.Null()]),
    description: Type.Union([Type.String(), Type.Null()]),
    commendation: Type.Boolean(),
    args: Type.Unknown(),
    validation: Type.Unknown(),
  }, { additionalProperties: false })),
  notes: Type.Array(Type.String()),
}, { additionalProperties: false });
export type Civ7ReadyUnitPromotionReadiness = Static<typeof Civ7ReadyUnitPromotionReadinessSchema>;

export const Civ7ReadyUnitViewResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: Type.Object({
    id: Type.String(),
    name: Type.String(),
  }, { additionalProperties: false }),
  localPlayerId: Type.Number(),
  requestedUnitId: nullableComponentIdSchema,
  selectedUnitId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
  firstReadyUnitId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
  unitId: nullableComponentIdSchema,
  unit: Civ7RuntimeProbeSchema(Type.Unknown()),
  legalOperations: Type.Array(Civ7ReadyUnitOperationCandidateSchema),
  promotionReadiness: Civ7RuntimeProbeSchema(Type.Union([Civ7ReadyUnitPromotionReadinessSchema, Type.Null()])),
  nearby: Civ7RuntimeProbeSchema(Type.Array(Civ7ReadyUnitNearbyPlotSchema)),
  notes: Type.Array(Type.String()),
}, { additionalProperties: false });
export type Civ7ReadyUnitViewResult = Static<typeof Civ7ReadyUnitViewResultSchema>;

export type ReadyUnitViewDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseReadyUnitView: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7ReadyUnitViewResult;
}>;

export async function getCiv7ReadyUnitView(
  input: Civ7ReadyUnitViewInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: ReadyUnitViewDependencies = defaultReadyUnitViewDependencies,
): Promise<Civ7ReadyUnitViewResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildReadyUnitViewCommand({
      ...input,
      radius: dependencies.boundedInteger(input.radius ?? 2, 0, 5, "radius"),
      maxOperations: dependencies.boundedInteger(input.maxOperations ?? 96, 1, 256, "maxOperations"),
    }),
  });
  return dependencies.parseReadyUnitView(result, "Civ7 ready unit view");
}

function buildReadyUnitViewCommand(input: Civ7ReadyUnitViewInput & { radius: number; maxOperations: number }): string {
  return `(() => {
    ${readyUnitViewSource()}
    return JSON.stringify(readReadyUnitView(${jsLiteral(input)}));
  })()`;
}

export function readyUnitViewSource(): string {
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
    const operationCandidates = (unitId, maxOperations) => {
      const families = [
        { family: "unit-operation", router: Game.UnitOperations, enums: typeof UnitOperationTypes !== "undefined" ? UnitOperationTypes : {} },
        { family: "unit-command", router: Game.UnitCommands, enums: typeof UnitCommandTypes !== "undefined" ? UnitCommandTypes : {} },
      ];
      const out = [];
      for (const entry of families) {
        const keys = Object.keys(entry.enums ?? {}).sort().slice(0, maxOperations);
        for (const operationType of keys) {
          const enumValue = enumValueFor(entry.enums, operationType);
          let result;
          try {
            result = callCanStart(entry.router, unitId, enumValue);
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
    const nearbyPlots = (unit, radius) => {
      const location = unit?.location;
      if (!location || typeof location.x !== "number" || typeof location.y !== "number") return [];
      const plots = [];
      for (let y = location.y - radius; y <= location.y + radius; y += 1) {
        for (let x = location.x - radius; x <= location.x + radius; x += 1) {
          let units = [];
          try {
            units = typeof MapUnits !== "undefined" && typeof MapUnits.getUnits === "function"
              ? MapUnits.getUnits(x, y)
              : [];
          } catch {}
          if (Array.isArray(units) && units.length > 0) {
            plots.push({
              x,
              y,
              units: units.map((id) => summarizeUnit(id) ?? toComponentId(id) ?? id),
            });
          }
        }
      }
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
      return {
        localPlayerId: GameContext.localPlayerID,
        requestedUnitId,
        selectedUnitId,
        firstReadyUnitId,
        unitId,
        unit,
        legalOperations: unitId ? operationCandidates(unitId, input.maxOperations) : [],
        promotionReadiness: probe(() => unitId ? promotionReadiness(unitId) : null),
        nearby: probe(() => nearbyPlots(unitValue, input.radius)),
        notes: [
          "Read-only ready-unit view. Use operation validation before any send.",
          "For plot-target moves or attacks, use game play unit-target so the official right-click action order decides the operation.",
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
