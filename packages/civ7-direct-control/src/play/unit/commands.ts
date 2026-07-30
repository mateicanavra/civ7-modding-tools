import { type Static, Type } from "typebox";

import {
  assertCiv7ComponentId,
  type Civ7ComponentId,
  Civ7ComponentIdSchema,
} from "../../civ7-component-id.js";
import { directControlErrorWithDispatchStatus } from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../../runtime/probe.js";
import { schemaBodyFromCommandResult } from "../../session/command-result.js";
import { executeCiv7TunerCommand } from "../../session/execute.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import type { Civ7MapLocation } from "../map/types.js";
import { validateMapLocation } from "../map/validation.js";

export type Civ7UnitUpgradeInput = Readonly<{
  unitId: Civ7ComponentId;
}>;

export type Civ7UnitResettleInput = Readonly<{
  unitId: Civ7ComponentId;
  destination: Civ7MapLocation;
}>;

export const Civ7UnitCommandCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Type.Unknown(),
  },
  { additionalProperties: false }
);
export type Civ7UnitCommandCheckResult = Readonly<Static<typeof Civ7UnitCommandCheckResultSchema>>;

const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);

export const Civ7UnitCommandSnapshotSchema = Type.Object(
  {
    unit: Civ7RuntimeProbeSchema(Type.Unknown()),
    selectedUnitId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
    firstReadyUnitId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
    blocker: Civ7RuntimeProbeSchema(Type.Unknown()),
  },
  { additionalProperties: false }
);
export type Civ7UnitCommandSnapshot = Readonly<Static<typeof Civ7UnitCommandSnapshotSchema>>;

export const Civ7UnitCommandSendResultSchema = Type.Object(
  {
    sent: Type.Boolean(),
    validation: Civ7UnitCommandCheckResultSchema,
    before: Civ7UnitCommandSnapshotSchema,
    after: Civ7UnitCommandSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7UnitCommandSendResult = Readonly<Static<typeof Civ7UnitCommandSendResultSchema>>;

type UnitCommandWireInput = Readonly<{
  unitId: Civ7ComponentId;
  operationType: "UNITCOMMAND_UPGRADE" | "UNITCOMMAND_RESETTLE";
  args: Readonly<Record<string, number>>;
}>;

export async function checkCiv7UnitUpgrade(
  input: Civ7UnitUpgradeInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7UnitCommandCheckResult> {
  return await checkCiv7UnitCommand(
    () => unitUpgradeWireInput(input),
    options,
    "Civ7 unit upgrade check"
  );
}

export async function sendCiv7UnitUpgrade(
  input: Civ7UnitUpgradeInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7UnitCommandSendResult> {
  return await sendCiv7UnitCommand(
    () => unitUpgradeWireInput(input),
    options,
    "Civ7 unit upgrade send"
  );
}

export async function checkCiv7UnitResettle(
  input: Civ7UnitResettleInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7UnitCommandCheckResult> {
  return await checkCiv7UnitCommand(
    () => unitResettleWireInput(input),
    options,
    "Civ7 unit resettle check"
  );
}

export async function sendCiv7UnitResettle(
  input: Civ7UnitResettleInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7UnitCommandSendResult> {
  return await sendCiv7UnitCommand(
    () => unitResettleWireInput(input),
    options,
    "Civ7 unit resettle send"
  );
}

async function checkCiv7UnitCommand(
  input: () => UnitCommandWireInput,
  options: Civ7DirectControlOptions,
  label: string
): Promise<Civ7UnitCommandCheckResult> {
  const command = await executeCiv7TunerCommand({
    ...options,
    command: buildUnitCommandWireCommandWithEvidence("checkUnitCommand", input),
  });
  return schemaBodyFromCommandResult(command, label, Civ7UnitCommandCheckResultSchema);
}

async function sendCiv7UnitCommand(
  input: () => UnitCommandWireInput,
  options: Civ7DirectControlOptions,
  label: string
): Promise<Civ7UnitCommandSendResult> {
  const command = await executeCiv7TunerCommand({
    ...options,
    command: buildUnitCommandWireCommandWithEvidence("sendUnitCommand", input),
  });
  return schemaBodyFromCommandResult(command, label, Civ7UnitCommandSendResultSchema);
}

function buildUnitCommandWireCommandWithEvidence(
  atom: "checkUnitCommand" | "sendUnitCommand",
  input: () => UnitCommandWireInput
): string {
  try {
    return buildUnitCommandWireCommand(atom, input());
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function buildUnitCommandWireCommand(
  atom: "checkUnitCommand" | "sendUnitCommand",
  input: UnitCommandWireInput
): string {
  return `(() => {
    ${unitCommandWireSource()}
    return JSON.stringify(${atom}(${jsLiteral(input)}));
  })()`;
}

function unitUpgradeWireInput(input: Civ7UnitUpgradeInput): UnitCommandWireInput {
  return {
    unitId: assertCiv7ComponentId(input.unitId, "unitId"),
    operationType: "UNITCOMMAND_UPGRADE",
    args: {},
  };
}

function unitResettleWireInput(input: Civ7UnitResettleInput): UnitCommandWireInput {
  const unitId = assertCiv7ComponentId(input.unitId, "unitId");
  validateMapLocation(input.destination);
  return {
    unitId,
    operationType: "UNITCOMMAND_RESETTLE",
    args: {
      X: input.destination.x,
      Y: input.destination.y,
    },
  };
}

/** Exact Civ7-side atoms shared by the unit-command provider tests. */
export function unitCommandWireSource(): string {
  return `${probeHelperSource()}
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
    const summarizeUnit = (unit) => {
      if (!unit) return null;
      return {
        id: toComponentId(unit.id ?? unit.ID ?? unit.UnitId ?? unit.unitId),
        location: unit.location ?? unit.Location ?? null,
        movement: unit.Movement ?? unit.movement ?? unit.movementMovesRemaining ?? null,
        activity: unit.Activity ?? unit.activity ?? unit.currentActivity ?? null,
        damage: unit.Damage ?? unit.damage ?? null,
        attacks: unit.Attacks ?? unit.attacks ?? unit.attackCharges ?? null,
      };
    };
    const readUnitSnapshot = (input) => ({
      unit: probe(() => summarizeUnit(globalThis.Units?.get?.(input.unitId))),
      selectedUnitId: probe(() => toComponentId(globalThis.UI?.Player?.getHeadSelectedUnit?.())),
      firstReadyUnitId: probe(() => toComponentId(globalThis.UI?.Player?.getFirstReadyUnit?.())),
      blocker: probe(() =>
        globalThis.Game?.Notifications?.getEndTurnBlockingType?.(
          globalThis.GameContext?.localPlayerID
        )
      ),
    });
    const unitCommandType = (operationType) => {
      if (UnitCommandTypes && Object.prototype.hasOwnProperty.call(UnitCommandTypes, operationType)) {
        return UnitCommandTypes[operationType];
      }
      const semanticName = operationType.replace(/^UNITCOMMAND_/, "");
      if (UnitCommandTypes && Object.prototype.hasOwnProperty.call(UnitCommandTypes, semanticName)) {
        return UnitCommandTypes[semanticName];
      }
      return operationType;
    };
    const callCanStart = (unitId, commandType, args) => {
      const attempts = [
        () => Game.UnitCommands.canStart(unitId, commandType, args, false),
        () => Game.UnitCommands.canStart(unitId, commandType, args),
        () => Game.UnitCommands.canStart(unitId, commandType),
      ];
      let last;
      for (const attempt of attempts) {
        try {
          return attempt();
        } catch (error) {
          last = error;
        }
      }
      throw last;
    };
    const successFromCanStart = (result) => {
      if (typeof result === "boolean") return result;
      if (result !== null && typeof result === "object" && !Array.isArray(result)) {
        for (const key of ["Success", "success", "canStart"]) {
          if (key in result) {
            if (typeof result[key] === "boolean") return result[key];
            throw new Error("Game unit command canStart returned a non-boolean " + key + " field.");
          }
        }
      }
      throw new Error("Game unit command canStart returned an unrecognized result.");
    };
    const checkUnitCommand = (input) => {
      const result = callCanStart(
        input.unitId,
        unitCommandType(input.operationType),
        input.args ?? {}
      );
      return {
        valid: successFromCanStart(result),
        result,
      };
    };
    const sendUnitCommand = (input) => {
      const before = readUnitSnapshot(input);
      const validation = checkUnitCommand(input);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: before,
        };
      }
      Game.UnitCommands.sendRequest(
        input.unitId,
        unitCommandType(input.operationType),
        input.args ?? {}
      );
      return {
        sent: true,
        validation,
        before,
        after: readUnitSnapshot(input),
      };
    };`;
}
