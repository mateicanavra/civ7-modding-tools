import { Civ7DirectControlError } from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7TunerCommand } from "../../session/execute.js";
import {
  populationPlacementPostcondition,
  type Civ7PopulationPlacementPostcondition,
  type Civ7PopulationPlacementPostconditionSnapshot,
} from "./population-postconditions.js";
import { populationPlacementRequestVerified } from "./population-placement-proof.js";
import {
  productionPostconditionFor,
  type Civ7ProductionPostcondition,
  type Civ7ProductionPostconditionSnapshot,
} from "./production-postconditions.js";
import { operationRouterSource } from "./router.js";
import {
  unitOperationPostcondition,
  type Civ7UnitOperationPostcondition,
  type Civ7UnitOperationPostconditionSnapshot,
} from "./unit-postconditions.js";
import type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationValidationResult,
} from "./types.js";

import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
} from "../../session/types.js";

export type Civ7OperationRequestResult = Readonly<{
  before: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  after: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
  postcondition?: Civ7UnitOperationPostcondition;
  populationPostcondition?: Civ7PopulationPlacementPostcondition;
  productionPostcondition?: Civ7ProductionPostcondition;
}>;

type OperationRequestDependencies = Readonly<{
  executeTunerCommand: (options: Civ7DirectControlOptions & { command: string }) => Promise<Civ7CommandResult>;
  jsonPayloadFromCommandResult: <T extends object>(result: Civ7CommandResult, label: string) => T;
  jsLiteral: (value: unknown) => string;
}>;

export async function canStartCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("unit-operation", input, options, dependencies);
}

export async function requestCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("unit-operation", input, options, dependencies);
}

export async function canStartCiv7UnitCommand(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("unit-command", input, options, dependencies);
}

export async function requestCiv7UnitCommand(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("unit-command", input, options, dependencies);
}

export async function canStartCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("city-operation", input, options, dependencies);
}

export async function requestCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("city-operation", input, options, dependencies);
}

export async function canStartCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("city-command", input, options, dependencies);
}

export async function requestCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("city-command", input, options, dependencies);
}

export async function canStartCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("player-operation", input, options, dependencies);
}

export async function requestCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  dependencies: OperationRequestDependencies = defaultOperationRequestDependencies,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("player-operation", input, options, dependencies);
}

export function buildOperationValidationCommand(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  dependencies: Pick<OperationRequestDependencies, "jsLiteral">,
): string {
  return `(() => {
    ${operationRouterSource()}
    return JSON.stringify(validateOperation(${dependencies.jsLiteral(family)}, ${dependencies.jsLiteral(input)}));
  })()`;
}

export function buildOperationRequestCommand(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  dependencies: Pick<OperationRequestDependencies, "jsLiteral">,
): string {
  return `(() => {
    ${operationRouterSource()}
    return JSON.stringify(sendOperation(${dependencies.jsLiteral(family)}, ${dependencies.jsLiteral(input)}));
  })()`;
}

async function validateCiv7Operation(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions,
  dependencies: OperationRequestDependencies,
): Promise<Civ7OperationValidationResult> {
  validateOperationInput(family, input);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildOperationValidationCommand(family, input, dependencies),
  });
  return dependencies.jsonPayloadFromCommandResult<Civ7OperationValidationResult>(result, "Civ7 operation validation");
}

async function requestCiv7Operation(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions,
  dependencies: OperationRequestDependencies,
): Promise<Civ7OperationRequestResult> {
  validateOperationInput(family, input);
  const before = await validateCiv7Operation(family, input, options, dependencies);
  if (!before.valid) {
    return {
      before,
      after: before,
      sent: false,
      verified: false,
      postcondition: unitOperationPostcondition(family, input, false, before, before, undefined, undefined),
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
    beforePopulationPostcondition?: Civ7PopulationPlacementPostconditionSnapshot;
    afterPopulationPostcondition?: Civ7PopulationPlacementPostconditionSnapshot;
    beforeProductionPostcondition?: Civ7ProductionPostconditionSnapshot;
    afterProductionPostcondition?: Civ7ProductionPostconditionSnapshot;
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
    sentPayload.afterPostcondition,
  );
  const populationPostcondition = populationPlacementPostcondition(
    family,
    input,
    sent,
    before,
    after,
    sentPayload.beforePopulationPostcondition,
    sentPayload.afterPopulationPostcondition,
  );
  const productionPostcondition = productionPostconditionFor(
    family,
    input,
    sent,
    before,
    after,
    sentPayload.beforeProductionPostcondition,
    sentPayload.afterProductionPostcondition,
  );
  const operationVerified =
    postcondition
      ? postcondition.classification !== "not-sent" && postcondition.classification !== "no-state-change"
      : populationPostcondition
        ? populationPlacementRequestVerified(populationPostcondition.classification)
        : productionPostcondition
          ? productionPostcondition.classification !== "not-sent"
            && productionPostcondition.classification !== "no-state-change"
            && productionPostcondition.classification !== "production-state-changed-blocker-still-live"
          : command.output.length > 0 && sent;
  return {
    before,
    command,
    after,
    sent,
    verified: operationVerified,
    postcondition,
    populationPostcondition,
    productionPostcondition,
  };
}

function validateOperationInput(family: Civ7OperationFamily, input: Civ7OperationInput): void {
  validateIdentifier(input.operationType, "operationType");
  if ((family === "unit-operation" || family === "unit-command") && !("unitId" in input)) {
    throw new Civ7DirectControlError("command-failed", `${family} requires unitId`);
  }
  if ((family === "city-operation" || family === "city-command") && !("cityId" in input)) {
    throw new Civ7DirectControlError("command-failed", `${family} requires cityId`);
  }
  if (family === "player-operation" && !("playerId" in input)) {
    throw new Civ7DirectControlError("command-failed", "player-operation requires playerId");
  }
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
