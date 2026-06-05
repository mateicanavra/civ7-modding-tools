import {
  productionChoicePostconditionConfirmed,
  productionChoicePostconditionOutcome,
} from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcProductionChoiceResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7MutationNextSteps,
  civ7MutationRequestStatusWithoutGuarded,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7CityProductionChoiceResult } from "../contract";

export const cityProductionChoiceRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.city.production.choice.request,
  ).effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7ProductionChoice(
          input,
          context.endpointDefaults,
          context.approval!,
        );
        return cityProductionChoiceResult(input, result);
      },
      catch: () =>
        errors.PRODUCTION_CHOICE_UNAVAILABLE({
          data: {
            procedureKey: "city.production.choice.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function cityProductionChoiceResult(
  input: Readonly<{
    cityId: Civ7CityProductionChoiceResult["cityId"];
    args: Readonly<Record<string, number>>;
  }>,
  result: Civ7ControlOrpcProductionChoiceResult,
): Civ7CityProductionChoiceResult {
  const postcondition = productionPostconditionSummary(result);
  const status = civ7MutationRequestStatusWithoutGuarded({
    sent: result.sent,
    postcondition,
  });

  return {
    cityId: input.cityId,
    args: { ...input.args },
    sent: result.sent,
    status,
    validation: {
      beforeValid: result.before.valid,
      afterValid: result.after.valid,
    },
    postcondition,
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: "city.production.choice.request",
      inspectKind: "inspect-production",
      inspectLabel: "Inspect production options before attempting another production request.",
      doNotRepeatLabel: "Do not repeat this production request until fresh attention and production evidence is read.",
    }),
  };
}

function productionPostconditionSummary(
  result: Civ7ControlOrpcProductionChoiceResult,
): Civ7CityProductionChoiceResult["postcondition"] {
  const postcondition = result.productionPostcondition;
  if (postcondition == null) {
    return {
      classification: "missing-postcondition",
      reason: "The production choice result did not include explicit postcondition evidence.",
      outcome: "no-state-change",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
      productionStateChanged: null,
      blockerStillLive: null,
    };
  }

  const confirmed = productionChoicePostconditionConfirmed(
    postcondition.classification,
  );
  return {
    classification: postcondition.classification,
    reason: postcondition.reason,
    outcome: productionChoicePostconditionOutcome(postcondition.classification),
    confidence: confirmed ? "confirmed" : "unverified",
    confirmed,
    noRepeatAfterUnverified: !confirmed,
    productionStateChanged: postcondition.productionStateChanged,
    blockerStillLive: postcondition.blockerStillLive,
  };
}
