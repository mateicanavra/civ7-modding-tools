import { narrativeChoiceProofPostcondition } from "@civ7/direct-control/proof/narrative-choice-proof-policy";
import { Effect } from "effect";
import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7CloseoutMutationProjection } from "#civ7-control-service/model/policy/mutation-result";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7ControlOrpcNarrativeChoiceResult } from "#civ7-control-service/model/ports/direct-control";
import type { Civ7NarrativeChoiceInput, Civ7NarrativeChoiceResult } from "../contract";
import { module } from "../module";

type NarrativeChoiceRuntimeInput = Civ7NarrativeChoiceInput &
  Readonly<{
    playerId: number;
  }>;
export const choiceRequest = civ7ControlOrpcMutationProcedure(module.choice.request).effect(
  function* ({ context, errors, input }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const localPlayerId = await readLocalPlayerId(context);
        const requestInput = {
          playerId: localPlayerId,
          targetType: input.targetType,
          target: input.target,
          action: input.action,
        };
        const result = await context.directControl.requestCiv7NarrativeChoice(
          requestInput,
          context.endpointDefaults
        );
        return narrativeChoiceResult(requestInput, result);
      },
      catch: (cause) =>
        errors.NARRATIVE_CHOICE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "narrative.choice.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }
);
async function readLocalPlayerId(context: Civ7ControlOrpcContext): Promise<number> {
  const view = await context.directControl.getCiv7PlayNotificationView(context.endpointDefaults);
  return view.localPlayerId;
}
function narrativeChoiceResult(
  input: NarrativeChoiceRuntimeInput,
  result: Civ7ControlOrpcNarrativeChoiceResult
): Civ7NarrativeChoiceResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: narrativeChoiceProofPostcondition(result, undefined),
    missing: {
      classification: "missing-postcondition",
      reason: "The narrative choice result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source: "narrative.choice.request",
    inspectKind: "inspect-narrative-choice",
    inspectLabel:
      "Inspect current attention and narrative choice state before attempting another narrative request.",
    doNotRepeatLabel:
      "Do not repeat this narrative choice request until fresh attention and narrative evidence is read.",
  });
  return {
    playerId: result.playerId,
    targetType: input.targetType,
    target: input.target,
    action: input.action,
    sent: result.sent,
    status: projection.status,
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition: projection.postcondition as Civ7NarrativeChoiceResult["postcondition"],
    nextSteps: projection.nextSteps,
  };
}
