import { narrativeChoiceProofPostcondition } from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcNarrativeChoiceResult } from "../../../dependencies/direct-control";
import { civ7MutationApprovalMiddleware } from "../../../middleware/mutation-approval";
import { civ7MutationReadinessMiddleware } from "../../../middleware/mutation-readiness";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7CloseoutMutationProjection,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7DecisionsNarrativeChoiceInput,
  Civ7DecisionsNarrativeChoiceResult,
} from "../contract";

const decisionsNarrativeChoiceRequestWithApproval =
  civ7ControlOrpcImplementer.decisions.narrative.choice.request.use(
    civ7MutationApprovalMiddleware,
  );
const decisionsNarrativeChoiceRequestReady =
  decisionsNarrativeChoiceRequestWithApproval.use(
    civ7MutationReadinessMiddleware,
  );

export const decisionsNarrativeChoiceRequestProcedure =
  decisionsNarrativeChoiceRequestReady.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7NarrativeChoice(
          input,
          context.endpointDefaults,
          context.approval,
        );
        return narrativeChoiceResult(input, result);
      },
      catch: () =>
        errors.NARRATIVE_CHOICE_UNAVAILABLE({
          data: {
            procedureKey: "decisions.narrative.choice.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function narrativeChoiceResult(
  input: Civ7DecisionsNarrativeChoiceInput,
  result: Civ7ControlOrpcNarrativeChoiceResult,
): Civ7DecisionsNarrativeChoiceResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: narrativeChoiceProofPostcondition(result, undefined),
    missing: {
      classification: "missing-postcondition",
      reason: "The narrative choice result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source: "decisions.narrative.choice.request",
    inspectKind: "inspect-narrative-choice",
    inspectLabel: "Inspect current attention and narrative choice state before attempting another narrative request.",
    doNotRepeatLabel: "Do not repeat this narrative choice request until fresh attention and narrative evidence is read.",
  });

  return {
    playerId: input.playerId,
    targetType: input.targetType,
    target: input.target,
    action: input.action,
    sent: result.sent,
    status: projection.status,
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition: projection.postcondition as Civ7DecisionsNarrativeChoiceResult["postcondition"],
    nextSteps: projection.nextSteps,
  };
}
