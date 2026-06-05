import { narrativeChoiceProofPostcondition } from "@civ7/direct-control/proof/narrative-choice-proof-policy";
import { Effect } from "effect";

import type { Civ7ControlOrpcNarrativeChoiceResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7CloseoutMutationProjection,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
} from "../contract";

export const narrativeChoiceRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.narrative.choice.request,
  ).effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7NarrativeChoice(
          input,
          context.endpointDefaults,
        );
        return narrativeChoiceResult(input, result);
      },
      catch: () =>
        errors.NARRATIVE_CHOICE_UNAVAILABLE({
          data: {
            procedureKey: "narrative.choice.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function narrativeChoiceResult(
  input: Civ7NarrativeChoiceInput,
  result: Civ7ControlOrpcNarrativeChoiceResult,
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
    inspectLabel: "Inspect current attention and narrative choice state before attempting another narrative request.",
    doNotRepeatLabel: "Do not repeat this narrative choice request until fresh attention and narrative evidence is read.",
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
