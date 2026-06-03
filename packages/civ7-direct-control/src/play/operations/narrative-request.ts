import { narrativeChoicePostcondition, waitForCiv7NarrativeChoiceAfter } from "./narrative-postconditions";

import type {
  Civ7ActionApproval,
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7NarrativeChoiceCommandPayload,
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
  Civ7OperationValidationResult,
  Civ7PlayNotificationViewResult,
} from "../../index";

type NarrativeChoiceRequestDependencies = Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  validatePlayerId: (playerId: number) => void;
  assertComponentId: (value: unknown, name: string) => void;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  buildNarrativeChoiceRequestCommand: (input: Civ7NarrativeChoiceInput) => string;
  getPlayNotificationView: (options: Civ7DirectControlOptions) => Promise<Civ7PlayNotificationViewResult>;
  canStartPlayerOperation: (
    input: Readonly<{
      playerId: number;
      operationType: string;
      args: { TargetType: string; Target: Civ7NarrativeChoiceInput["target"]; Action: number };
    }>,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7OperationValidationResult>;
  parseNarrativePayload: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7NarrativeChoiceCommandPayload;
  invalidTargetTypeError: () => never;
  invalidActionError: () => never;
}>;

export async function requestCiv7NarrativeChoice(
  input: Civ7NarrativeChoiceInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: NarrativeChoiceRequestDependencies,
): Promise<Civ7NarrativeChoiceResult> {
  dependencies.assertApproved(approval, "choosing a narrative story direction");
  dependencies.validatePlayerId(input.playerId);
  if (!input.targetType) dependencies.invalidTargetTypeError();
  dependencies.assertComponentId(input.target, "target");
  if (!Number.isInteger(input.action)) dependencies.invalidActionError();

  const before = await dependencies.getPlayNotificationView(options);
  const operationInput = {
    playerId: input.playerId,
    operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    args: {
      TargetType: input.targetType,
      Target: input.target,
      Action: input.action,
    },
  } as const;
  const beforeValidation = await dependencies.canStartPlayerOperation(operationInput, options);
  if (!beforeValidation.valid) {
    return {
      before,
      beforeValidation,
      after: before,
      afterValidation: beforeValidation,
      sent: false,
      verified: false,
      postcondition: {
        classification: "not-sent",
        reason: "CHOOSE_NARRATIVE_STORY_DIRECTION did not validate, so no narrative choice was sent.",
      },
    };
  }

  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: dependencies.buildNarrativeChoiceRequestCommand(input),
  });
  const payload = dependencies.parseNarrativePayload(command, "Civ7 narrative choice request");
  const after = await waitForCiv7NarrativeChoiceAfter(
    input,
    options,
    before,
    beforeValidation,
    dependencies.getPlayNotificationView,
  );
  const afterValidation = await dependencies.canStartPlayerOperation(operationInput, options);
  const postcondition = narrativeChoicePostcondition(
    input,
    payload.sent === true,
    before,
    after,
    beforeValidation,
    afterValidation,
    payload,
  );
  return {
    before,
    beforeValidation,
    command,
    payload,
    after,
    afterValidation,
    sent: payload.sent === true,
    verified: postcondition.classification !== "not-sent" && postcondition.classification !== "no-state-change",
    postcondition,
  };
}
