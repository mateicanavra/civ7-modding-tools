import type { Civ7ComponentId } from "../../civ7-component-id.js";
import { Civ7DirectControlError } from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7TunerCommand } from "../../session/execute.js";
import type { Civ7CommandResult, Civ7DirectControlOptions } from "../../session/types.js";
import { operationRouterSource } from "./router.js";
import type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationValidationResult,
} from "./types.js";
import {
  type Civ7UnitOperationPostcondition,
  type Civ7UnitOperationPostconditionSnapshot,
  unitOperationPostcondition,
} from "./unit-postconditions.js";

export type Civ7OperationRequestResult = Readonly<{
  before: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  after: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
  postcondition?: Civ7UnitOperationPostcondition;
}>;

type OperationRequestDependencies = Readonly<{
  executeTunerCommand: (
    options: Civ7DirectControlOptions & { command: string }
  ) => Promise<Civ7CommandResult>;
  jsonPayloadFromCommandResult: <T extends object>(result: Civ7CommandResult, label: string) => T;
  jsLiteral: (value: unknown) => string;
}>;

type Civ7OperationRequestFamily = Exclude<Civ7OperationFamily, "unit-command">;

export async function canStartCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("unit-operation", input, options, dependencies);
}

export async function requestCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("unit-operation", input, options, dependencies);
}

export async function canStartCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("city-operation", input, options, dependencies);
}

export async function requestCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("city-operation", input, options, dependencies);
}

export async function canStartCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("city-command", input, options, dependencies);
}

export async function requestCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("city-command", input, options, dependencies);
}

export async function canStartCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("player-operation", input, options, dependencies);
}

export async function requestCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("player-operation", input, options, dependencies);
}

function buildOperationValidationCommand(
  family: Civ7OperationRequestFamily,
  input: Civ7OperationInput,
  dependencies: Pick<OperationRequestDependencies, "jsLiteral">
): string {
  return `(() => {
    ${operationRouterSource()}
    return JSON.stringify(validateOperation(${dependencies.jsLiteral(family)}, ${dependencies.jsLiteral(input)}));
  })()`;
}

function buildOperationRequestCommand(
  family: Civ7OperationRequestFamily,
  input: Civ7OperationInput,
  dependencies: Pick<OperationRequestDependencies, "jsLiteral">
): string {
  return `(() => {
    ${operationRouterSource()}
    return JSON.stringify(sendOperation(${dependencies.jsLiteral(family)}, ${dependencies.jsLiteral(input)}));
  })()`;
}

async function validateCiv7Operation(
  family: Civ7OperationRequestFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions,
  dependencies: OperationRequestDependencies
): Promise<Civ7OperationValidationResult> {
  validateOperationInput(family, input);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildOperationValidationCommand(family, input, dependencies),
  });
  return dependencies.jsonPayloadFromCommandResult<Civ7OperationValidationResult>(
    result,
    "Civ7 operation validation"
  );
}

async function requestCiv7Operation(
  family: Civ7OperationRequestFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions,
  dependencies: OperationRequestDependencies
): Promise<Civ7OperationRequestResult> {
  validateOperationInput(family, input);
  const before = await validateCiv7Operation(family, input, options, dependencies);
  if (!before.valid) {
    return {
      before,
      after: before,
      sent: false,
      verified: false,
      postcondition: unitOperationPostcondition(
        family,
        input,
        false,
        before,
        before,
        undefined,
        undefined
      ),
    };
  }
  const command = await dependencies.executeTunerCommand({
    ...options,
    command: buildOperationRequestCommand(family, input, dependencies),
  });
  const sentPayload = dependencies.jsonPayloadFromCommandResult<{
    sent: boolean;
    beforePostcondition?: Civ7UnitOperationPostconditionSnapshot;
    afterPostcondition?: Civ7UnitOperationPostconditionSnapshot;
  }>(command, "Civ7 operation request");
  const after = await validateCiv7Operation(family, input, options, dependencies);
  const sent = sentPayload.sent === true;
  const postcondition = unitOperationPostcondition(
    family,
    input,
    sent,
    before,
    after,
    sentPayload.beforePostcondition,
    sentPayload.afterPostcondition
  );
  const operationVerified = postcondition
    ? postcondition.classification !== "not-sent" &&
      postcondition.classification !== "no-state-change"
    : command.output.length > 0 && sent;
  return {
    before,
    command,
    after,
    sent,
    verified: operationVerified,
    postcondition,
  };
}

function validateOperationInput(
  family: Civ7OperationRequestFamily,
  input: Civ7OperationInput
): void {
  validateIdentifier(input.operationType, "operationType");
  const operationType = canonicalOperationType(input.operationType);
  if (family === "city-operation" && operationType === "BUILD") {
    throw new Civ7DirectControlError(
      "command-failed",
      "city-operation BUILD must use the exact production choice check/send atoms",
      { dispatchStatus: "not-dispatched" }
    );
  }
  if (family === "city-command" && operationType === "CHANGE_GROWTH_MODE") {
    throw new Civ7DirectControlError(
      "command-failed",
      "city-command CHANGE_GROWTH_MODE must use the exact town focus change check/send atoms",
      { dispatchStatus: "not-dispatched" }
    );
  }
  if (family === "city-command" && operationType === "EXPAND") {
    throw new Civ7DirectControlError(
      "command-failed",
      "city-command EXPAND must use the exact city expansion check/send atoms",
      { dispatchStatus: "not-dispatched" }
    );
  }
  if (family === "player-operation" && operationType === "ASSIGN_WORKER") {
    throw new Civ7DirectControlError(
      "command-failed",
      "player-operation ASSIGN_WORKER must use the exact worker assignment check/send atoms",
      { dispatchStatus: "not-dispatched" }
    );
  }
  if (
    family === "player-operation" &&
    (operationType === "CHANGE_GOVERNMENT" || operationType === "CHOOSE_GOLDEN_AGE")
  ) {
    throw new Civ7DirectControlError(
      "command-failed",
      `player-operation ${operationType} must use the exact government-domain choice check/send atoms`,
      { dispatchStatus: "not-dispatched" }
    );
  }
  if (family === "city-operation" && operationType === "CONSIDER_TOWN_PROJECT") {
    throw new Civ7DirectControlError(
      "command-failed",
      "city-operation CONSIDER_TOWN_PROJECT must use the exact town focus review check/send atoms",
      { dispatchStatus: "not-dispatched" }
    );
  }
  if (family === "unit-operation" && !("unitId" in input)) {
    throw new Civ7DirectControlError("command-failed", `${family} requires unitId`);
  }
  if ((family === "city-operation" || family === "city-command") && !("cityId" in input)) {
    throw new Civ7DirectControlError("command-failed", `${family} requires cityId`);
  }
  if (family === "player-operation" && !("playerId" in input)) {
    throw new Civ7DirectControlError("command-failed", "player-operation requires playerId");
  }
}

function canonicalOperationType(operationType: string): string {
  return operationType.replace(
    /^(?:UNITOPERATION_|UNITCOMMAND_|CITYOPERATION_|CITYCOMMAND_|PLAYEROPERATION_)/,
    ""
  );
}

function validateIdentifier(value: string, label: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Civ7DirectControlError("command-failed", `${label} must be a simple identifier`);
  }
  return value;
}

const defaultOperationRequestDependencies: OperationRequestDependencies = {
  executeTunerCommand: executeCiv7TunerCommand,
  jsonPayloadFromCommandResult,
  jsLiteral,
};
