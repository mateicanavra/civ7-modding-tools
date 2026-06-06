import type { Civ7ComponentId } from "../../civ7-component-id";
import { Civ7DirectControlError } from "../../direct-control-error";
import type { Civ7DirectControlOptions } from "../../session/types";
import {
  requestCiv7CityCommand,
  requestCiv7CityOperation,
  type Civ7OperationRequestResult,
} from "../operations/validate-request";

export type Civ7TownFocusRequestKind =
  | "town-focus-change"
  | "town-focus-review";

export type Civ7TownFocusChangeInput = Readonly<{
  kind: "town-focus-change";
  cityId: Civ7ComponentId;
  growthType: number;
  projectType: number;
  city?: number;
}>;

export type Civ7TownFocusReviewInput = Readonly<{
  kind: "town-focus-review";
  cityId: Civ7ComponentId;
}>;

export type Civ7TownFocusRequestInput =
  | Civ7TownFocusChangeInput
  | Civ7TownFocusReviewInput;

export type Civ7TownFocusPostconditionClassification =
  | "not-sent"
  | "pending-runtime-proof";

export type Civ7TownFocusPostcondition = Readonly<{
  classification: Civ7TownFocusPostconditionClassification;
  reason: string;
}>;

type Civ7TownFocusRequestResultBase = Readonly<{
  cityId: Civ7ComponentId;
  operation: Civ7OperationRequestResult;
  beforeValidation: Civ7OperationRequestResult["before"];
  afterValidation: Civ7OperationRequestResult["after"];
  sent: boolean;
  verified: boolean;
  postcondition: Civ7TownFocusPostcondition;
}>;

export type Civ7TownFocusRequestResult =
  | Civ7TownFocusRequestResultBase & Readonly<{
    kind: "town-focus-change";
    growthType: number;
    projectType: number;
    city: number;
  }>
  | Civ7TownFocusRequestResultBase & Readonly<{
    kind: "town-focus-review";
  }>;

type TownFocusDependencies = Readonly<{
  requestCityCommand: (
    input: Readonly<{
      cityId: Civ7ComponentId;
      operationType: string;
      args: Readonly<Record<string, number>>;
    }>,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7OperationRequestResult>;
  requestCityOperation: (
    input: Readonly<{
      cityId: Civ7ComponentId;
      operationType: string;
      args: Readonly<Record<string, number>>;
    }>,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7OperationRequestResult>;
  invalidIntegerError: (field: string) => never;
}>;

export async function requestCiv7TownFocus(
  input: Civ7TownFocusRequestInput,
  options: Civ7DirectControlOptions = {},
  dependencies: TownFocusDependencies = defaultTownFocusDependencies,
): Promise<Civ7TownFocusRequestResult> {
  const request = townFocusOperation(input, dependencies);
  const operation = input.kind === "town-focus-change"
    ? await dependencies.requestCityCommand({
      cityId: input.cityId,
      operationType: request.operationType,
      args: request.args,
    }, options)
    : await dependencies.requestCityOperation({
      cityId: input.cityId,
      operationType: request.operationType,
      args: request.args,
    }, options);
  const sent = operation.sent === true;
  const common = {
    cityId: input.cityId,
    operation,
    beforeValidation: operation.before,
    afterValidation: operation.after,
    sent,
    verified: false,
    postcondition: townFocusPostcondition(sent, input.kind),
  };

  if (input.kind === "town-focus-change") {
    return {
      ...common,
      kind: "town-focus-change",
      growthType: input.growthType,
      projectType: input.projectType,
      city: input.city ?? input.cityId.id,
    };
  }

  return {
    ...common,
    kind: "town-focus-review",
  };
}

export async function requestCiv7TownFocusChange(
  input: Omit<Civ7TownFocusChangeInput, "kind">,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TownFocusRequestResult> {
  return await requestCiv7TownFocus({
    ...input,
    kind: "town-focus-change",
  }, options);
}

export async function requestCiv7TownFocusReviewCloseout(
  input: Omit<Civ7TownFocusReviewInput, "kind">,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TownFocusRequestResult> {
  return await requestCiv7TownFocus({
    ...input,
    kind: "town-focus-review",
  }, options);
}

function townFocusOperation(
  input: Civ7TownFocusRequestInput,
  dependencies: Pick<TownFocusDependencies, "invalidIntegerError">,
): Readonly<{
  operationType: string;
  args: Readonly<Record<string, number>>;
}> {
  if (input.kind === "town-focus-change") {
    if (!Number.isInteger(input.growthType)) {
      dependencies.invalidIntegerError("growthType");
    }
    if (!Number.isInteger(input.projectType)) {
      dependencies.invalidIntegerError("projectType");
    }
    const city = input.city ?? input.cityId.id;
    if (!Number.isInteger(city)) dependencies.invalidIntegerError("city");
    return {
      operationType: "CHANGE_GROWTH_MODE",
      args: {
        Type: input.growthType,
        ProjectType: input.projectType,
        City: city,
      },
    };
  }

  return {
    operationType: "CONSIDER_TOWN_PROJECT",
    args: {},
  };
}

function townFocusPostcondition(
  sent: boolean,
  kind: Civ7TownFocusRequestKind,
): Civ7TownFocusPostcondition {
  if (!sent) {
    return {
      classification: "not-sent",
      reason: `The ${kind} request did not validate, so no town focus operation was sent.`,
    };
  }

  return {
    classification: "pending-runtime-proof",
    reason: `The ${kind} request was sent, but local tests do not prove the live town project review state changed; read fresh city readiness before another request.`,
  };
}

const defaultTownFocusDependencies: TownFocusDependencies = {
  requestCityCommand: requestCiv7CityCommand,
  requestCityOperation: requestCiv7CityOperation,
  invalidIntegerError: (field) => {
    throw new Civ7DirectControlError("command-failed", `${field} must be an integer`);
  },
};
