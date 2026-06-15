import { Civ7DirectControlError } from "../../direct-control-error";
import type { Civ7DirectControlOptions } from "../../session/types";
import { validatePlayerId } from "../../validation";
import {
  type Civ7OperationRequestResult,
  requestCiv7PlayerOperation,
} from "../operations/validate-request";

export type Civ7ProgressionTargetKind = "technology" | "culture";

export type Civ7ProgressionTargetInput = Readonly<{
  kind: Civ7ProgressionTargetKind;
  playerId: number;
  node: number;
}>;

export type Civ7ProgressionTargetPostconditionClassification = "not-sent" | "pending-runtime-proof";

export type Civ7ProgressionTargetPostcondition = Readonly<{
  classification: Civ7ProgressionTargetPostconditionClassification;
  reason: string;
}>;

export type Civ7ProgressionTargetResult = Readonly<{
  kind: Civ7ProgressionTargetKind;
  playerId: number;
  node: number;
  operation: Civ7OperationRequestResult;
  beforeValidation: Civ7OperationRequestResult["before"];
  afterValidation: Civ7OperationRequestResult["after"];
  sent: boolean;
  verified: boolean;
  postcondition: Civ7ProgressionTargetPostcondition;
}>;

type ProgressionTargetRequestDependencies = Readonly<{
  validatePlayerId: (playerId: number) => void;
  requestPlayerOperation: (
    input: Readonly<{
      playerId: number;
      operationType: string;
      args: Readonly<{ ProgressionTreeNodeType: number }>;
    }>,
    options: Civ7DirectControlOptions
  ) => Promise<Civ7OperationRequestResult>;
  invalidNodeError: () => never;
}>;

export async function requestCiv7ProgressionTarget(
  input: Civ7ProgressionTargetInput,
  options: Civ7DirectControlOptions = {},
  dependencies: ProgressionTargetRequestDependencies = defaultProgressionTargetRequestDependencies
): Promise<Civ7ProgressionTargetResult> {
  dependencies.validatePlayerId(input.playerId);
  if (!Number.isInteger(input.node)) dependencies.invalidNodeError();

  const operation = await dependencies.requestPlayerOperation(
    {
      playerId: input.playerId,
      operationType: progressionTargetOperationType(input.kind),
      args: { ProgressionTreeNodeType: input.node },
    },
    options
  );
  const sent = operation.sent === true;

  return {
    kind: input.kind,
    playerId: input.playerId,
    node: input.node,
    operation,
    beforeValidation: operation.before,
    afterValidation: operation.after,
    sent,
    verified: false,
    postcondition: progressionTargetPostcondition(sent, input.kind),
  };
}

export async function requestCiv7TechnologyTarget(
  input: Omit<Civ7ProgressionTargetInput, "kind">,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionTargetResult> {
  return await requestCiv7ProgressionTarget({ ...input, kind: "technology" }, options);
}

export async function requestCiv7CultureTarget(
  input: Omit<Civ7ProgressionTargetInput, "kind">,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionTargetResult> {
  return await requestCiv7ProgressionTarget({ ...input, kind: "culture" }, options);
}

function progressionTargetOperationType(kind: Civ7ProgressionTargetKind): string {
  return kind === "technology" ? "SET_TECH_TREE_TARGET_NODE" : "SET_CULTURE_TREE_TARGET_NODE";
}

function progressionTargetPostcondition(
  sent: boolean,
  kind: Civ7ProgressionTargetKind
): Civ7ProgressionTargetPostcondition {
  if (!sent) {
    return {
      classification: "not-sent",
      reason: `The ${kind} target request did not validate, so no progression target was sent.`,
    };
  }

  return {
    classification: "pending-runtime-proof",
    reason: `The ${kind} target request was sent, but local tests do not prove the live progression target changed; read fresh progression state before another target request.`,
  };
}

const defaultProgressionTargetRequestDependencies: ProgressionTargetRequestDependencies = {
  validatePlayerId,
  requestPlayerOperation: requestCiv7PlayerOperation,
  invalidNodeError: () => {
    throw new Civ7DirectControlError("command-failed", "node must be an integer");
  },
};
