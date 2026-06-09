import { Civ7DirectControlError } from "../../direct-control-error";
import type { Civ7DirectControlOptions } from "../../session/types";
import { validatePlayerId } from "../../validation";
import {
  requestCiv7PlayerOperation,
  type Civ7OperationRequestResult,
} from "../operations/validate-request";

export const CIV7_GOVERNMENT_ACTIVATE_ACTION = -1_326_475_004;

export type Civ7GovernmentChoiceKind = "government" | "celebration";

export type Civ7GovernmentChoiceInput = Readonly<{
  kind: "government";
  playerId: number;
  governmentType: number;
  action?: number;
}>;

export type Civ7CelebrationChoiceInput = Readonly<{
  kind: "celebration";
  playerId: number;
  goldenAgeType: number;
}>;

export type Civ7GovernmentDomainChoiceInput =
  | Civ7GovernmentChoiceInput
  | Civ7CelebrationChoiceInput;

export type Civ7GovernmentChoicePostconditionClassification =
  | "not-sent"
  | "pending-runtime-proof";

export type Civ7GovernmentChoicePostcondition = Readonly<{
  classification: Civ7GovernmentChoicePostconditionClassification;
  reason: string;
}>;

type Civ7GovernmentDomainChoiceResultBase = Readonly<{
  playerId: number;
  operation: Civ7OperationRequestResult;
  beforeValidation: Civ7OperationRequestResult["before"];
  afterValidation: Civ7OperationRequestResult["after"];
  sent: boolean;
  verified: boolean;
  postcondition: Civ7GovernmentChoicePostcondition;
}>;

export type Civ7GovernmentDomainChoiceResult =
  | Civ7GovernmentDomainChoiceResultBase & Readonly<{
    kind: "government";
    governmentType: number;
    action: number;
  }>
  | Civ7GovernmentDomainChoiceResultBase & Readonly<{
    kind: "celebration";
    goldenAgeType: number;
  }>;

type GovernmentChoiceRequestDependencies = Readonly<{
  validatePlayerId: (playerId: number) => void;
  requestPlayerOperation: (
    input: Readonly<{
      playerId: number;
      operationType: string;
      args: Readonly<Record<string, number>>;
    }>,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7OperationRequestResult>;
  invalidIntegerError: (field: string) => never;
}>;

export async function requestCiv7GovernmentDomainChoice(
  input: Civ7GovernmentDomainChoiceInput,
  options: Civ7DirectControlOptions = {},
  dependencies: GovernmentChoiceRequestDependencies =
    defaultGovernmentChoiceRequestDependencies,
): Promise<Civ7GovernmentDomainChoiceResult> {
  dependencies.validatePlayerId(input.playerId);
  const request = governmentChoiceOperation(input, dependencies);
  const operation = await dependencies.requestPlayerOperation({
    playerId: input.playerId,
    operationType: request.operationType,
    args: request.args,
  }, options);
  const sent = operation.sent === true;
  const common = {
    playerId: input.playerId,
    operation,
    beforeValidation: operation.before,
    afterValidation: operation.after,
    sent,
    verified: false,
    postcondition: governmentChoicePostcondition(sent, input.kind),
  };

  if (input.kind === "government") {
    return {
      ...common,
      kind: "government",
      governmentType: input.governmentType,
      action: request.output.action ?? CIV7_GOVERNMENT_ACTIVATE_ACTION,
    };
  }

  return {
    ...common,
    kind: "celebration",
    goldenAgeType: input.goldenAgeType,
  };
}

export async function requestCiv7GovernmentChoice(
  input: Omit<Civ7GovernmentChoiceInput, "kind">,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7GovernmentDomainChoiceResult> {
  return await requestCiv7GovernmentDomainChoice({
    ...input,
    kind: "government",
  }, options);
}

export async function requestCiv7CelebrationChoice(
  input: Omit<Civ7CelebrationChoiceInput, "kind">,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7GovernmentDomainChoiceResult> {
  return await requestCiv7GovernmentDomainChoice({
    ...input,
    kind: "celebration",
  }, options);
}

function governmentChoiceOperation(
  input: Civ7GovernmentDomainChoiceInput,
  dependencies: Pick<GovernmentChoiceRequestDependencies, "invalidIntegerError">,
): Readonly<{
  operationType: string;
  args: Readonly<Record<string, number>>;
  output: Readonly<{
    governmentType?: number;
    action?: number;
    goldenAgeType?: number;
  }>;
}> {
  if (input.kind === "government") {
    if (!Number.isInteger(input.governmentType)) {
      dependencies.invalidIntegerError("governmentType");
    }
    const action = input.action ?? CIV7_GOVERNMENT_ACTIVATE_ACTION;
    if (!Number.isInteger(action)) dependencies.invalidIntegerError("action");
    return {
      operationType: "CHANGE_GOVERNMENT",
      args: {
        GovernmentType: input.governmentType,
        Action: action,
      },
      output: {
        governmentType: input.governmentType,
        action,
      },
    };
  }

  if (!Number.isInteger(input.goldenAgeType)) {
    dependencies.invalidIntegerError("goldenAgeType");
  }
  return {
    operationType: "CHOOSE_GOLDEN_AGE",
    args: { GoldenAgeType: input.goldenAgeType },
    output: { goldenAgeType: input.goldenAgeType },
  };
}

function governmentChoicePostcondition(
  sent: boolean,
  kind: Civ7GovernmentChoiceKind,
): Civ7GovernmentChoicePostcondition {
  if (!sent) {
    return {
      classification: "not-sent",
      reason: `The ${kind} choice request did not validate, so no government-domain choice was sent.`,
    };
  }

  return {
    classification: "pending-runtime-proof",
    reason: `The ${kind} choice request was sent, but local tests do not prove the live government-domain blocker cleared; read fresh attention before another choice request.`,
  };
}

const defaultGovernmentChoiceRequestDependencies:
  GovernmentChoiceRequestDependencies = {
    validatePlayerId,
    requestPlayerOperation: requestCiv7PlayerOperation,
    invalidIntegerError: (field) => {
      throw new Civ7DirectControlError("command-failed", `${field} must be an integer`);
    },
  };
