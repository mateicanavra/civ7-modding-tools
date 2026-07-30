import { type Static, Type } from "typebox";

import {
  assertCiv7ComponentId,
  type Civ7ComponentId,
  Civ7ComponentIdSchema,
} from "../../civ7-component-id.js";
import { directControlErrorWithDispatchStatus } from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema } from "../../runtime/probe.js";
import { schemaBodyFromCommandResult } from "../../session/command-result.js";
import { executeCiv7TunerCommand } from "../../session/execute.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import type { Civ7MapLocation } from "../map/types.js";
import { validateMapLocation } from "../map/validation.js";
import { operationRouterSource } from "../operations/router.js";

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
    ${operationRouterSource()}
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
