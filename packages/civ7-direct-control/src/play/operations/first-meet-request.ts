import type { Civ7OperationRequestResult } from "./validate-request";
import { requestCiv7PlayerOperation } from "./validate-request";
import {
  firstMeetResponsePostcondition,
  type Civ7FirstMeetResponsePostcondition,
  waitForCiv7FirstMeetResponseAfter,
} from "./first-meet-postconditions";

import { Civ7DirectControlError } from "../../direct-control-error";
import type { Civ7DirectControlOptions } from "../../session/types";
import { validatePlayerId } from "../../validation";
import type { Civ7PlayNotificationViewResult } from "../notifications/view";
import { getCiv7PlayNotificationView } from "../notifications/view";

const RESPOND_DIPLOMATIC_FIRST_MEET = "RESPOND_DIPLOMATIC_FIRST_MEET";

export type Civ7FirstMeetResponseInput = Readonly<{
  playerId: number;
  metPlayerId: number;
  responseType: number;
}>;

export type Civ7FirstMeetResponseResult = Readonly<{
  playerId: number;
  metPlayerId: number;
  responseType: number;
  before: Civ7PlayNotificationViewResult;
  operation: Civ7OperationRequestResult;
  after: Civ7PlayNotificationViewResult;
  beforeValidation: Civ7OperationRequestResult["before"];
  afterValidation: Civ7OperationRequestResult["after"];
  sent: boolean;
  verified: boolean;
  postcondition: Civ7FirstMeetResponsePostcondition;
}>;

type FirstMeetResponseRequestDependencies = Readonly<{
  validatePlayerId: (playerId: number) => void;
  getPlayNotificationView: (
    options: Civ7DirectControlOptions
  ) => Promise<Civ7PlayNotificationViewResult>;
  requestPlayerOperation: (
    input: Readonly<{
      playerId: number;
      operationType: string;
      args: Readonly<{ Player1: number; Player2: number; Type: number }>;
    }>,
    options: Civ7DirectControlOptions
  ) => Promise<Civ7OperationRequestResult>;
  invalidResponseTypeError: () => never;
}>;

export async function requestCiv7FirstMeetResponse(
  input: Civ7FirstMeetResponseInput,
  options: Civ7DirectControlOptions = {},
  dependencies: FirstMeetResponseRequestDependencies = defaultFirstMeetResponseRequestDependencies
): Promise<Civ7FirstMeetResponseResult> {
  dependencies.validatePlayerId(input.playerId);
  dependencies.validatePlayerId(input.metPlayerId);
  if (!Number.isInteger(input.responseType)) dependencies.invalidResponseTypeError();

  const operationInput = {
    playerId: input.playerId,
    operationType: RESPOND_DIPLOMATIC_FIRST_MEET,
    args: {
      Player1: input.playerId,
      Player2: input.metPlayerId,
      Type: input.responseType,
    },
  } as const;

  const before = await dependencies.getPlayNotificationView(options);
  const operation = await dependencies.requestPlayerOperation(operationInput, options);
  const sent = operation.sent === true;
  const after = sent
    ? await waitForCiv7FirstMeetResponseAfter(
        input.metPlayerId,
        options,
        before,
        dependencies.getPlayNotificationView
      )
    : before;
  const postcondition = firstMeetResponsePostcondition(sent, before, after, input.metPlayerId);

  return {
    playerId: input.playerId,
    metPlayerId: input.metPlayerId,
    responseType: input.responseType,
    before,
    operation,
    after,
    beforeValidation: operation.before,
    afterValidation: operation.after,
    sent,
    verified: firstMeetResponseVerified(postcondition),
    postcondition,
  };
}

function firstMeetResponseVerified(postcondition: Civ7FirstMeetResponsePostcondition): boolean {
  return (
    postcondition.classification === "turn-unblocked" ||
    postcondition.classification === "first-meet-cleared"
  );
}

const defaultFirstMeetResponseRequestDependencies: FirstMeetResponseRequestDependencies = {
  validatePlayerId,
  getPlayNotificationView: getCiv7PlayNotificationView,
  requestPlayerOperation: requestCiv7PlayerOperation,
  invalidResponseTypeError: () => {
    throw new Civ7DirectControlError("command-failed", "responseType must be an integer");
  },
};
