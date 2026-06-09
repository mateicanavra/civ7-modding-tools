import { diplomacyResponsePostcondition, waitForCiv7DiplomacyResponseAfter } from "./diplomacy-postconditions";

import type {
  Civ7ActionApproval,
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7DiplomacyResponseCommandPayload,
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseResult,
  Civ7OperationValidationResult,
  Civ7PlayNotificationViewResult,
} from "../../index";

type DiplomacyResponseRequestDependencies = Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  validatePlayerId: (playerId: number) => void;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  buildDiplomacyResponseCloseoutCommand: (input: Civ7DiplomacyResponseInput) => string;
  getPlayNotificationView: (options: Civ7DirectControlOptions) => Promise<Civ7PlayNotificationViewResult>;
  canStartPlayerOperation: (
    input: Readonly<{ playerId: number; operationType: string; args: { ID: number; Type: number } }>,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7OperationValidationResult>;
  parseDiplomacyPayload: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7DiplomacyResponseCommandPayload;
  invalidActionIdError: () => never;
  invalidResponseTypeError: () => never;
}>;

export async function requestCiv7DiplomacyResponse(
  input: Civ7DiplomacyResponseInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: DiplomacyResponseRequestDependencies,
): Promise<Civ7DiplomacyResponseResult> {
  dependencies.assertApproved(approval, "responding to diplomatic action");
  dependencies.validatePlayerId(input.playerId);
  if (!Number.isInteger(input.actionId)) dependencies.invalidActionIdError();
  if (!Number.isInteger(input.responseType)) dependencies.invalidResponseTypeError();

  const before = await dependencies.getPlayNotificationView(options);
  const playerId = before.localPlayerId;
  const operationInput = {
    playerId,
    operationType: "RESPOND_DIPLOMATIC_ACTION",
    args: { ID: input.actionId, Type: input.responseType },
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
        reason: "RESPOND_DIPLOMATIC_ACTION did not validate, so no diplomatic response was sent.",
      },
    };
  }

  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: dependencies.buildDiplomacyResponseCloseoutCommand({ ...input, playerId }),
  });
  const payload = dependencies.parseDiplomacyPayload(command, "Civ7 diplomacy response closeout");
  const after = await waitForCiv7DiplomacyResponseAfter(
    input,
    options,
    before,
    beforeValidation,
    dependencies.getPlayNotificationView,
  );
  const afterValidation = await dependencies.canStartPlayerOperation(operationInput, options);
  const postcondition = diplomacyResponsePostcondition(
    input,
    payload.sent === true,
    before,
    after,
    beforeValidation,
    afterValidation,
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
