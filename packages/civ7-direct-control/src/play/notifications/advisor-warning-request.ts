import { assertCiv7ComponentId, type Civ7ComponentId } from "../../civ7-component-id.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import { validatePlayerId } from "../../validation.js";
import {
  requestCiv7PlayerOperation,
  type Civ7OperationRequestResult,
} from "../operations/validate-request.js";

export type Civ7AdvisorWarningViewedInput = Readonly<{
  playerId: number;
  target: Civ7ComponentId;
}>;

export type Civ7AdvisorWarningViewedPostconditionClassification =
  | "not-sent"
  | "pending-runtime-proof";

export type Civ7AdvisorWarningViewedPostcondition = Readonly<{
  classification: Civ7AdvisorWarningViewedPostconditionClassification;
  reason: string;
}>;

export type Civ7AdvisorWarningViewedResult = Readonly<{
  playerId: number;
  target: Civ7ComponentId;
  operation: Civ7OperationRequestResult;
  beforeValidation: Civ7OperationRequestResult["before"];
  afterValidation: Civ7OperationRequestResult["after"];
  sent: boolean;
  verified: false;
  postcondition: Civ7AdvisorWarningViewedPostcondition;
}>;

type AdvisorWarningViewedDependencies = Readonly<{
  validatePlayerId: (playerId: number) => void;
  assertComponentId: (value: Civ7ComponentId, label: string) => void;
  requestPlayerOperation: (
    input: Readonly<{
      playerId: number;
      operationType: "VIEWED_ADVISOR_WARNING";
      args: Readonly<{ Target: Civ7ComponentId }>;
    }>,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7OperationRequestResult>;
}>;

export async function requestCiv7AdvisorWarningViewed(
  input: Civ7AdvisorWarningViewedInput,
  options: Civ7DirectControlOptions = {},
  dependencies: AdvisorWarningViewedDependencies =
    defaultAdvisorWarningViewedDependencies,
): Promise<Civ7AdvisorWarningViewedResult> {
  dependencies.validatePlayerId(input.playerId);
  dependencies.assertComponentId(input.target, "target");

  const operation = await dependencies.requestPlayerOperation({
    playerId: input.playerId,
    operationType: "VIEWED_ADVISOR_WARNING",
    args: { Target: input.target },
  }, options);
  const sent = operation.sent === true;

  return {
    playerId: input.playerId,
    target: input.target,
    operation,
    beforeValidation: operation.before,
    afterValidation: operation.after,
    sent,
    verified: false,
    postcondition: advisorWarningViewedPostcondition(sent),
  };
}

function advisorWarningViewedPostcondition(
  sent: boolean,
): Civ7AdvisorWarningViewedPostcondition {
  if (!sent) {
    return {
      classification: "not-sent",
      reason: "The advisor warning viewed request did not validate, so no advisor-warning acknowledgement was sent.",
    };
  }

  return {
    classification: "pending-runtime-proof",
    reason: "The advisor warning viewed request was sent, but local tests do not prove the live warning blocker cleared; read fresh attention before another request.",
  };
}

const defaultAdvisorWarningViewedDependencies: AdvisorWarningViewedDependencies =
  {
    validatePlayerId,
    assertComponentId: assertCiv7ComponentId,
    requestPlayerOperation: requestCiv7PlayerOperation,
  };
