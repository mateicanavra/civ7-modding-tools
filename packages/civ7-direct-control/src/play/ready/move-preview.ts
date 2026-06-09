import { Civ7DirectControlError } from "../../direct-control-error.js";
import { validateMapLocation } from "../map/validation.js";
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
import type { Civ7MapLocation } from "../map/types.js";

export type Civ7UnitMovePreviewInput = Readonly<{
  unitId?: Civ7ComponentId;
  destination?: Civ7MapLocation;
  maxPlots?: number;
  maxPathPlots?: number;
}>;

export type Civ7UnitMovePreviewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  requestedUnitId: Civ7ComponentId | null;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  unitId: Civ7ComponentId | null;
  unit: Civ7RuntimeProbe<unknown>;
  reachableMovement: Civ7RuntimeProbe<unknown>;
  reachableZonesOfControl: Civ7RuntimeProbe<unknown>;
  reachableTargets: Civ7RuntimeProbe<unknown>;
  queuedDestination: Civ7RuntimeProbe<Civ7MapLocation | null>;
  queuedPath: Civ7RuntimeProbe<unknown>;
  requestedDestination: Civ7MapLocation | null;
  requestedPath: Civ7RuntimeProbe<unknown>;
  relationshipPolicy: Readonly<{
    relationshipSource: "not-classified";
    relationshipProof: "none";
    unprovenLabel: "relationship-unproven";
    guidance: string;
  }>;
  notes: ReadonlyArray<string>;
}>;

type UnitMovePreviewDependencies = Readonly<{
  validateMapLocation: (location: Civ7MapLocation) => void;
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseUnitMovePreview: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7UnitMovePreviewResult;
}>;

export async function getCiv7UnitMovePreview(
  input: Civ7UnitMovePreviewInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: UnitMovePreviewDependencies = defaultUnitMovePreviewDependencies,
): Promise<Civ7UnitMovePreviewResult> {
  if (input.destination !== undefined) dependencies.validateMapLocation(input.destination);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildUnitMovePreviewCommand({
      ...input,
      maxPlots: dependencies.boundedInteger(input.maxPlots ?? 80, 1, 512, "maxPlots"),
      maxPathPlots: dependencies.boundedInteger(input.maxPathPlots ?? 32, 1, 256, "maxPathPlots"),
    }),
  });
  return dependencies.parseUnitMovePreview(result, "Civ7 unit move preview");
}

function buildUnitMovePreviewCommand(input: Civ7UnitMovePreviewInput & { maxPlots: number; maxPathPlots: number }): string {
  return `(() => {
    ${unitMovePreviewSource()}
    return JSON.stringify(readUnitMovePreview(${jsLiteral(input)}));
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

export function unitMovePreviewSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const normalizeLocation = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.x !== "number" || typeof value.y !== "number") return null;
      return { x: value.x, y: value.y };
    };
    const plotFromIndex = (index) => {
      try {
        const location = GameplayMap.getLocationFromIndex(index);
        return { index, x: location?.x ?? null, y: location?.y ?? null };
      } catch (err) {
        return { index, error: String(err) };
      }
    };
    const normalizePlotCollection = (value, maxPlots) => {
      const items = Array.isArray(value) ? value : [];
      let count = 0;
      const normalize = (entry) => {
        if (typeof entry === "number") {
          count += 1;
          return plotFromIndex(entry);
        }
        if (Array.isArray(entry)) {
          const out = [];
          for (const item of entry) {
            if (count >= maxPlots) break;
            out.push(normalize(item));
          }
          return out;
        }
        return entry;
      };
      const out = [];
      for (const item of items) {
        if (count >= maxPlots) break;
        out.push(normalize(item));
      }
      return out;
    };
    const summarizePath = (result, maxPathPlots) => {
      if (!result || typeof result !== "object") return result ?? null;
      const plots = Array.isArray(result.plots)
        ? result.plots
        : Array.isArray(result.Plots)
          ? result.Plots
          : [];
      return {
        plots: normalizePlotCollection(plots, maxPathPlots),
        plotCount: plots.length,
        turns: result.turns ?? result.Turns ?? null,
        obstacles: result.obstacles ?? result.Obstacles ?? null,
        rawKeys: Object.keys(result).sort(),
      };
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
    const safeReachableMovement = (unitId, maxPlots) => normalizePlotCollection(Units.getReachableMovement(unitId) ?? [], maxPlots);
    const safeReachableZoc = (unitId, maxPlots) => normalizePlotCollection(Units.getReachableZonesOfControl(unitId, true) ?? [], maxPlots);
    const safeReachableTargets = (unitId, maxPlots) => normalizePlotCollection(Units.getReachableTargets(unitId) ?? [], maxPlots);
    const readUnitMovePreview = (input) => {
      const selectedUnitId = probe(() => toComponentId(UI?.Player?.getHeadSelectedUnit?.()));
      const firstReadyUnitId = probe(() => toComponentId(UI?.Player?.getFirstReadyUnit?.()));
      const requestedUnitId = toComponentId(input.unitId);
      const unitId = requestedUnitId
        ?? (selectedUnitId.ok ? selectedUnitId.value : null)
        ?? (firstReadyUnitId.ok ? firstReadyUnitId.value : null);
      const requestedDestination = normalizeLocation(input.destination);
      return {
        localPlayerId: GameContext.localPlayerID,
        requestedUnitId,
        selectedUnitId,
        firstReadyUnitId,
        unitId,
        unit: probe(() => unitId ? summarizeUnit(unitId) : null),
        reachableMovement: probe(() => unitId ? safeReachableMovement(unitId, input.maxPlots) : []),
        reachableZonesOfControl: probe(() => unitId ? safeReachableZoc(unitId, input.maxPlots) : []),
        reachableTargets: probe(() => unitId ? safeReachableTargets(unitId, input.maxPlots) : []),
        queuedDestination: probe(() => unitId ? normalizeLocation(Units.getQueuedOperationDestination(unitId)) : null),
        queuedPath: probe(() => {
          if (!unitId) return null;
          const destination = normalizeLocation(Units.getQueuedOperationDestination(unitId));
          return destination ? summarizePath(Units.getPathTo(unitId, destination), input.maxPathPlots) : null;
        }),
        requestedDestination,
        requestedPath: probe(() => unitId && requestedDestination ? summarizePath(Units.getPathTo(unitId, requestedDestination), input.maxPathPlots) : null),
        relationshipPolicy: {
          relationshipSource: "not-classified",
          relationshipProof: "none",
          unprovenLabel: "relationship-unproven",
          guidance: "This movement preview does not classify other-owner relationships. Use neutral labels unless an official relationship, team, diplomacy, independent-power, or war-state API supplies that proof.",
        },
        notes: [
          "Read-only official movement preview. It does not send MOVE_TO, reserve a path, or prove tactical safety.",
          "Reachable movement, targets, zones of control, queued destination, and path data come from the same Units preview APIs used by the Civ7 UI when available.",
          "Operation validators and postconditions remain authoritative before and after any send.",
          "Relationship labels are intentionally conservative: owner mismatch is contact evidence, not relationship proof."
        ],
      };
    };`;
}

const defaultUnitMovePreviewDependencies: UnitMovePreviewDependencies = {
  validateMapLocation,
  boundedInteger,
  executeAppUiCommand: executeCiv7AppUiCommand,
  parseUnitMovePreview: (result, label) =>
    jsonPayloadFromCommandResult<Civ7UnitMovePreviewResult>(result, label),
};
