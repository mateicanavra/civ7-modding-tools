import { Civ7DirectControlError } from "../../direct-control-error";
import type { Civ7DirectControlOptions } from "../../session/types";
import { validatePlayerId } from "../../validation";
import {
  type Civ7OperationRequestResult,
  requestCiv7PlayerOperation,
} from "../operations/validate-request";

export type Civ7ProgressionPlayerChoiceKind =
  | "attribute-purchase"
  | "attribute-review"
  | "tradition-change"
  | "tradition-review";

export type Civ7AttributePurchaseInput = Readonly<{
  kind: "attribute-purchase";
  playerId: number;
  node: number;
}>;

export type Civ7AttributeReviewInput = Readonly<{
  kind: "attribute-review";
  playerId: number;
}>;

export type Civ7TraditionChangeInput = Readonly<{
  kind: "tradition-change";
  playerId: number;
  traditionType: number;
  action: number;
}>;

export type Civ7TraditionReviewInput = Readonly<{
  kind: "tradition-review";
  playerId: number;
}>;

export type Civ7ProgressionPlayerChoiceInput =
  | Civ7AttributePurchaseInput
  | Civ7AttributeReviewInput
  | Civ7TraditionChangeInput
  | Civ7TraditionReviewInput;

export type Civ7ProgressionPlayerChoicePostconditionClassification =
  | "not-sent"
  | "pending-runtime-proof";

export type Civ7ProgressionPlayerChoicePostcondition = Readonly<{
  classification: Civ7ProgressionPlayerChoicePostconditionClassification;
  reason: string;
}>;

type Civ7ProgressionPlayerChoiceResultBase = Readonly<{
  playerId: number;
  operation: Civ7OperationRequestResult;
  beforeValidation: Civ7OperationRequestResult["before"];
  afterValidation: Civ7OperationRequestResult["after"];
  sent: boolean;
  verified: boolean;
  postcondition: Civ7ProgressionPlayerChoicePostcondition;
}>;

export type Civ7ProgressionPlayerChoiceResult =
  | (Civ7ProgressionPlayerChoiceResultBase &
      Readonly<{
        kind: "attribute-purchase";
        node: number;
      }>)
  | (Civ7ProgressionPlayerChoiceResultBase &
      Readonly<{
        kind: "attribute-review";
      }>)
  | (Civ7ProgressionPlayerChoiceResultBase &
      Readonly<{
        kind: "tradition-change";
        traditionType: number;
        action: number;
      }>)
  | (Civ7ProgressionPlayerChoiceResultBase &
      Readonly<{
        kind: "tradition-review";
      }>);

type ProgressionPlayerChoiceDependencies = Readonly<{
  validatePlayerId: (playerId: number) => void;
  requestPlayerOperation: (
    input: Readonly<{
      playerId: number;
      operationType: string;
      args: Readonly<Record<string, number>>;
    }>,
    options: Civ7DirectControlOptions
  ) => Promise<Civ7OperationRequestResult>;
  invalidIntegerError: (field: string) => never;
}>;

export async function requestCiv7ProgressionPlayerChoice(
  input: Civ7ProgressionPlayerChoiceInput,
  options: Civ7DirectControlOptions = {},
  dependencies: ProgressionPlayerChoiceDependencies = defaultProgressionPlayerChoiceDependencies
): Promise<Civ7ProgressionPlayerChoiceResult> {
  dependencies.validatePlayerId(input.playerId);
  const request = progressionPlayerChoiceOperation(input, dependencies);
  const operation = await dependencies.requestPlayerOperation(
    {
      playerId: input.playerId,
      operationType: request.operationType,
      args: request.args,
    },
    options
  );
  const sent = operation.sent === true;
  const common = {
    playerId: input.playerId,
    operation,
    beforeValidation: operation.before,
    afterValidation: operation.after,
    sent,
    verified: false,
    postcondition: progressionPlayerChoicePostcondition(sent, input.kind),
  };

  if (input.kind === "attribute-purchase") {
    return {
      ...common,
      kind: "attribute-purchase",
      node: input.node,
    };
  }
  if (input.kind === "attribute-review") {
    return {
      ...common,
      kind: "attribute-review",
    };
  }
  if (input.kind === "tradition-change") {
    return {
      ...common,
      kind: "tradition-change",
      traditionType: input.traditionType,
      action: input.action,
    };
  }

  return {
    ...common,
    kind: "tradition-review",
  };
}

export async function requestCiv7AttributePurchase(
  input: Omit<Civ7AttributePurchaseInput, "kind">,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionPlayerChoiceResult> {
  return await requestCiv7ProgressionPlayerChoice(
    {
      ...input,
      kind: "attribute-purchase",
    },
    options
  );
}

export async function requestCiv7AttributeReviewCloseout(
  input: Omit<Civ7AttributeReviewInput, "kind">,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionPlayerChoiceResult> {
  return await requestCiv7ProgressionPlayerChoice(
    {
      ...input,
      kind: "attribute-review",
    },
    options
  );
}

export async function requestCiv7TraditionChange(
  input: Omit<Civ7TraditionChangeInput, "kind">,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionPlayerChoiceResult> {
  return await requestCiv7ProgressionPlayerChoice(
    {
      ...input,
      kind: "tradition-change",
    },
    options
  );
}

export async function requestCiv7TraditionReviewCloseout(
  input: Omit<Civ7TraditionReviewInput, "kind">,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionPlayerChoiceResult> {
  return await requestCiv7ProgressionPlayerChoice(
    {
      ...input,
      kind: "tradition-review",
    },
    options
  );
}

function progressionPlayerChoiceOperation(
  input: Civ7ProgressionPlayerChoiceInput,
  dependencies: Pick<ProgressionPlayerChoiceDependencies, "invalidIntegerError">
): Readonly<{
  operationType: string;
  args: Readonly<Record<string, number>>;
}> {
  if (input.kind === "attribute-purchase") {
    if (!Number.isInteger(input.node)) dependencies.invalidIntegerError("node");
    return {
      operationType: "BUY_ATTRIBUTE_TREE_NODE",
      args: { ProgressionTreeNodeType: input.node },
    };
  }
  if (input.kind === "attribute-review") {
    return {
      operationType: "CONSIDER_ASSIGN_ATTRIBUTE",
      args: {},
    };
  }
  if (input.kind === "tradition-change") {
    if (!Number.isInteger(input.traditionType)) {
      dependencies.invalidIntegerError("traditionType");
    }
    if (!Number.isInteger(input.action)) dependencies.invalidIntegerError("action");
    return {
      operationType: "CHANGE_TRADITION",
      args: {
        TraditionType: input.traditionType,
        Action: input.action,
      },
    };
  }

  return {
    operationType: "CONSIDER_ASSIGN_TRADITIONS",
    args: {},
  };
}

function progressionPlayerChoicePostcondition(
  sent: boolean,
  kind: Civ7ProgressionPlayerChoiceKind
): Civ7ProgressionPlayerChoicePostcondition {
  if (!sent) {
    return {
      classification: "not-sent",
      reason: `The ${kind} request did not validate, so no progression player choice was sent.`,
    };
  }

  return {
    classification: "pending-runtime-proof",
    reason: `The ${kind} request was sent, but local tests do not prove the live progression review state changed; read fresh attention before another request.`,
  };
}

const defaultProgressionPlayerChoiceDependencies: ProgressionPlayerChoiceDependencies = {
  validatePlayerId,
  requestPlayerOperation: requestCiv7PlayerOperation,
  invalidIntegerError: (field) => {
    throw new Civ7DirectControlError("command-failed", `${field} must be an integer`);
  },
};
