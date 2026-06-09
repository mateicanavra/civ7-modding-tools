import { Civ7DirectControlError } from "../../direct-control-error";

import type {
  Civ7ActionApproval,
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7MapLocation,
  Civ7RuntimeProbe,
  Civ7UnitTargetActionInput,
  Civ7UnitTargetActionResult,
} from "../../index";

type UnitTargetActionDependencies = Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  executeTunerCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseUnitTargetAction: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7UnitTargetActionResult;
  verificationWaitMs: number;
  verificationPollIntervalMs: number;
}>;

export async function getCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions = {},
  dependencies: UnitTargetActionDependencies,
): Promise<Civ7UnitTargetActionResult> {
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildUnitTargetActionCommand(input, { send: false }),
  });
  return dependencies.parseUnitTargetAction(result, "Civ7 unit target action");
}

export async function requestCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: UnitTargetActionDependencies,
): Promise<Civ7UnitTargetActionResult> {
  dependencies.assertApproved(approval, "sending Civ7 unit target action");
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildUnitTargetActionCommand(input, { send: true }),
  });
  const immediate = dependencies.parseUnitTargetAction(result, "Civ7 unit target action");
  return await stabilizeCiv7UnitTargetAction(input, options, immediate, dependencies);
}

async function stabilizeCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions,
  immediate: Civ7UnitTargetActionResult,
  dependencies: UnitTargetActionDependencies,
): Promise<Civ7UnitTargetActionResult> {
  if (immediate.sent !== true || immediate.verification?.status !== "no-state-change") {
    return withUnitTargetVerificationSource(immediate, "immediate", 0, 0);
  }

  const startedAt = Date.now();
  let attempts = 0;
  let last = immediate;
  while (Date.now() - startedAt < dependencies.verificationWaitMs) {
    const elapsed = Date.now() - startedAt;
    await sleep(Math.min(
      dependencies.verificationPollIntervalMs,
      Math.max(0, dependencies.verificationWaitMs - elapsed),
    ));
    attempts += 1;
    const observed = await getCiv7UnitTargetAction(input, options, dependencies);
    const reconciled = reconcilePolledUnitTargetAction(immediate, observed, attempts, Date.now() - startedAt);
    last = reconciled;
    if (reconciled.verified === true) return reconciled;
  }

  return {
    ...last,
    verification: last.verification
      ? {
          ...last.verification,
          source: "bounded-poll",
          attempts,
          observedAfterMs: Date.now() - startedAt,
          reason: "Bounded verification polling observed no unit or target-plot change after send; re-read current HUD and ready unit before repeating.",
        }
      : last.verification,
    notes: appendNote(last.notes, `Post-send verification polled ${attempts} time(s) for ${Date.now() - startedAt}ms before returning no-state-change.`),
  };
}

function reconcilePolledUnitTargetAction(
  immediate: Civ7UnitTargetActionResult,
  observed: Civ7UnitTargetActionResult,
  attempts: number,
  observedAfterMs: number,
): Civ7UnitTargetActionResult {
  const unitChanged = stableJson(immediate.beforeUnit) !== stableJson(observed.beforeUnit);
  const targetUnitsChanged = stableJson(immediate.beforeTargetUnits) !== stableJson(observed.beforeTargetUnits);
  if (!unitChanged && !targetUnitsChanged) {
    return withUnitTargetVerificationSource(immediate, "bounded-poll", attempts, observedAfterMs);
  }

  const requestedLocation = { x: immediate.target.x, y: immediate.target.y };
  const beforeLocation = locationFromUnitProbeValue(immediate.beforeUnit);
  const landedLocation = locationFromUnitProbeValue(observed.beforeUnit);
  const destinationReached = landedLocation ? sameMapLocation(landedLocation, requestedLocation) : null;
  const originChanged = beforeLocation && landedLocation ? !sameMapLocation(beforeLocation, landedLocation) : unitChanged;
  const operationType = immediate.selected?.operationType;
  const classification =
    operationType === "MOVE_TO" && destinationReached === true
      ? "target-reached"
      : operationType === "MOVE_TO" && originChanged && destinationReached === false
        ? "path-shortfall"
        : targetUnitsChanged
          ? "target-state-changed"
          : "unit-state-changed";

  return {
    ...immediate,
    afterUnit: observed.beforeUnit,
    afterTargetUnits: observed.beforeTargetUnits,
    verified: true,
    verification: {
      status: "verified",
      classification,
      unitChanged,
      targetUnitsChanged,
      destinationReached,
      requestedLocation,
      landedLocation,
      source: "bounded-poll",
      attempts,
      observedAfterMs,
      reason: unitTargetVerificationReason(classification),
    },
    notes: appendNote(immediate.notes, `Post-send verification stabilized after ${attempts} poll attempt(s) and ${observedAfterMs}ms.`),
  };
}

function withUnitTargetVerificationSource(
  result: Civ7UnitTargetActionResult,
  source: "immediate" | "bounded-poll",
  attempts: number,
  observedAfterMs: number,
): Civ7UnitTargetActionResult {
  if (!result.verification) return result;
  return {
    ...result,
    verification: {
      ...result.verification,
      source,
      attempts,
      observedAfterMs,
    },
  };
}

function unitTargetVerificationReason(classification: NonNullable<Civ7UnitTargetActionResult["verification"]>["classification"]): string {
  switch (classification) {
    case "target-reached":
      return "unit reached the requested target tile after bounded post-send polling";
    case "path-shortfall":
      return "unit moved after bounded post-send polling, but landed short of the requested target tile; re-read before issuing a follow-up move";
    case "target-state-changed":
      return "target-plot unit state changed after bounded post-send polling";
    case "unit-state-changed":
      return "unit state changed after bounded post-send polling";
    case "no-state-change":
      return "bounded post-send polling did not observe a unit or target-plot change";
    case "not-sent":
      return "read-only target resolution; use --send with an approval reason to mutate";
  }
}

function buildUnitTargetActionCommand(input: Civ7UnitTargetActionInput, options: { send: boolean }): string {
  return `(() => {
    ${unitTargetActionSource()}
    return JSON.stringify(readUnitTargetAction(${jsLiteral(input)}, ${jsLiteral(options)}));
  })()`;
}

function unitTargetActionSource(): string {
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
    const callCanStart = (router, target, operationType, args) => {
      try {
        return router.canStart(target, operationType, args ?? {}, false);
      } catch (first) {
        try {
          return router.canStart(target, operationType, args ?? {});
        } catch {
          throw first;
        }
      }
    };
    const targetIndexFor = (x, y) => probe(() => {
      if (typeof GameplayMap.getIndexFromLocation === "function") return GameplayMap.getIndexFromLocation({ x, y });
      return GameplayMap.getIndexFromXY(x, y);
    });
    const resultContainsTarget = (result, targetIndex) => {
      if (!targetIndex.ok || !result || typeof result !== "object" || !Array.isArray(result.Plots)) return null;
      return result.Plots.includes(targetIndex.value);
    };
    const summarizeUnit = (unitId) => {
      const unit = Units.get(unitId);
      if (!unit) return null;
      const movement = unit.Movement;
      const combat = unit.Combat;
      const health = unit.Health;
      return {
        id: toComponentId(unit.id ?? unitId),
        owner: unit.owner ?? unitId.owner,
        type: unit.type ?? null,
        location: unit.location ?? null,
        movementMovesRemaining: movement?.movementMovesRemaining ?? null,
        movementTurnsRemaining: movement?.movementTurnsRemaining ?? null,
        attacksRemaining: combat?.attacksRemaining ?? null,
        rangedStrength: combat?.rangedStrength ?? null,
        bombardStrength: combat?.bombardStrength ?? null,
        meleeStrength: typeof combat?.getMeleeStrength === "function" ? combat.getMeleeStrength(false) : null,
        damage: health?.damage ?? null,
        hitPoints: health?.hitPoints ?? null,
      };
    };
    const targetUnitsAt = (x, y) => {
      const units = typeof MapUnits !== "undefined" && typeof MapUnits.getUnits === "function"
        ? MapUnits.getUnits(x, y)
        : [];
      return Array.isArray(units) ? units.map((id) => toComponentId(id) ?? id) : units;
    };
    const probeValue = (probeResult) => probeResult && probeResult.ok === true ? probeResult.value : null;
    const locationFromUnitProbe = (probeResult) => {
      const unit = probeValue(probeResult);
      const location = unit?.location;
      if (!location || typeof location.x !== "number" || typeof location.y !== "number") return null;
      return { x: location.x, y: location.y };
    };
    const sameLocation = (a, b) => !!(a && b && a.x === b.x && a.y === b.y);
    const moveModifiers = () => {
      const attack = typeof UnitOperationMoveModifiers !== "undefined" ? UnitOperationMoveModifiers.ATTACK ?? 0 : 0;
      const ignore = typeof UnitOperationMoveModifiers !== "undefined" ? UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION ?? 0 : 0;
      return attack + ignore;
    };
    const candidate = (family, operationType, args, target, targetIndex) => {
      const router = family === "unit-command" ? Game.UnitCommands : Game.UnitOperations;
      const enums = family === "unit-command" ? UnitCommandTypes : UnitOperationTypes;
      const enumValue = enumValueFor(enums, operationType);
      let result;
      try {
        result = callCanStart(router, target, enumValue, args);
      } catch (err) {
        return {
          family,
          operationType,
          args,
          valid: false,
          result: { error: String(err) },
          targetInReturnedPlots: null,
          rejectedReason: "canStart threw",
        };
      }
      const valid = successFromCanStart(result);
      const targetInReturnedPlots = resultContainsTarget(result, targetIndex);
      return {
        family,
        operationType,
        args,
        valid,
        result,
        targetInReturnedPlots,
        ...(valid && targetInReturnedPlots === false ? { rejectedReason: "target not present in canStart returned Plots" } : {}),
      };
    };
    const accepted = (entry) => entry.valid === true && entry.targetInReturnedPlots !== false;
    const sendCandidate = (unitId, entry) => {
      const router = entry.family === "unit-command" ? Game.UnitCommands : Game.UnitOperations;
      const enums = entry.family === "unit-command" ? UnitCommandTypes : UnitOperationTypes;
      const enumValue = enumValueFor(enums, entry.operationType);
      return router.sendRequest(unitId, enumValue, entry.args ?? {});
    };
    const readUnitTargetAction = (input, options) => {
      const unitId = input.unitId;
      const targetIndex = targetIndexFor(input.x, input.y);
      const target = { x: input.x, y: input.y, index: targetIndex };
      const baseArgs = { X: input.x, Y: input.y };
      const attackArgs = { ...baseArgs, Modifiers: moveModifiers() };
      const candidates = [
        candidate("unit-operation", "UNITOPERATION_NAVAL_ATTACK", attackArgs, unitId, targetIndex),
        candidate("unit-operation", "UNITOPERATION_AIR_ATTACK", attackArgs, unitId, targetIndex),
        candidate("unit-operation", "UNITOPERATION_RANGE_ATTACK", attackArgs, unitId, targetIndex),
        candidate("unit-command", "UNITCOMMAND_ARMY_OVERRUN", baseArgs, unitId, targetIndex),
        candidate("unit-operation", "UNITOPERATION_SWAP_UNITS", baseArgs, unitId, targetIndex),
        candidate("unit-operation", "MOVE_TO", attackArgs, unitId, targetIndex),
      ];
      const selected = candidates.find(accepted) ?? null;
      const beforeUnit = probe(() => summarizeUnit(unitId));
      const beforeTargetUnits = probe(() => targetUnitsAt(input.x, input.y));
      const out = {
        unitId,
        target,
        beforeUnit,
        beforeTargetUnits,
        candidates,
        selected,
        sent: false,
        notes: [
          "Selection follows the official right-click WorldInput target order: naval, air, ranged, overrun, swap, then MOVE_TO.",
          "Validator success is not enough by itself; compare before/after unit location, movement, attacks, and target units."
        ],
      };
      if (options.send === true && selected) {
        out.sendResult = sendCandidate(unitId, selected);
        out.sent = true;
        out.afterUnit = probe(() => summarizeUnit(unitId));
        out.afterTargetUnits = probe(() => targetUnitsAt(input.x, input.y));
        const unitChanged = JSON.stringify(out.beforeUnit) !== JSON.stringify(out.afterUnit);
        const targetUnitsChanged = JSON.stringify(out.beforeTargetUnits) !== JSON.stringify(out.afterTargetUnits);
        const requestedLocation = { x: input.x, y: input.y };
        const beforeLocation = locationFromUnitProbe(out.beforeUnit);
        const landedLocation = locationFromUnitProbe(out.afterUnit);
        const destinationReached = landedLocation ? sameLocation(landedLocation, requestedLocation) : null;
        const originChanged = beforeLocation && landedLocation ? !sameLocation(beforeLocation, landedLocation) : unitChanged;
        const classification = !unitChanged && !targetUnitsChanged
          ? "no-state-change"
          : selected.operationType === "MOVE_TO" && destinationReached === true
            ? "target-reached"
            : selected.operationType === "MOVE_TO" && originChanged && destinationReached === false
              ? "path-shortfall"
              : targetUnitsChanged
                ? "target-state-changed"
                : "unit-state-changed";
        out.verified = unitChanged || targetUnitsChanged;
        out.verification = {
          status: out.verified ? "verified" : "no-state-change",
          classification,
          unitChanged,
          targetUnitsChanged,
          destinationReached,
          requestedLocation,
          landedLocation,
          reason: out.verified
            ? classification === "target-reached"
              ? "unit reached the requested target tile"
              : classification === "path-shortfall"
                ? "unit moved, but landed short of the requested target tile; re-read before issuing a follow-up move"
                : classification === "target-state-changed"
                  ? "target-plot unit state changed after send"
                  : "unit state changed after send"
            : "send returned but unit and target-plot probes did not change; re-read before repeating",
        };
      } else {
        out.verification = {
          status: "not-sent",
          classification: "not-sent",
          unitChanged: false,
          targetUnitsChanged: false,
          destinationReached: null,
          requestedLocation: { x: input.x, y: input.y },
          landedLocation: locationFromUnitProbe(beforeUnit),
          reason: "read-only target resolution; use --send with an approval reason to mutate",
        };
      }
      return out;
    };`;
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

function jsLiteral(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input");
  }
  return json;
}

function locationFromUnitProbeValue(probe: Civ7RuntimeProbe<unknown> | undefined): Civ7MapLocation | null {
  const value = probe?.ok === true ? probe.value : null;
  if (!value || typeof value !== "object") return null;
  const location = (value as { location?: unknown }).location;
  if (!location || typeof location !== "object") return null;
  const { x, y } = location as { x?: unknown; y?: unknown };
  return typeof x === "number" && typeof y === "number" ? { x, y } : null;
}

function sameMapLocation(left: Civ7MapLocation, right: Civ7MapLocation): boolean {
  return left.x === right.x && left.y === right.y;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, Object.keys(flattenKeys(value)).sort()) ?? String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flattenKeys(value: unknown, keys: Record<string, true> = {}): Record<string, true> {
  if (Array.isArray(value)) {
    for (const item of value) flattenKeys(item, keys);
  } else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      keys[key] = true;
      flattenKeys(child, keys);
    }
  }
  return keys;
}

function appendNote(notes: ReadonlyArray<string>, note: string): ReadonlyArray<string> {
  return notes.includes(note) ? notes : [...notes, note];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
