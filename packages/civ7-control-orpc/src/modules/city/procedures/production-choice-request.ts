import {
  productionChoicePostconditionConfirmed,
  productionChoicePostconditionOutcome,
} from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcProductionChoiceResult } from "../../../dependencies/direct-control";
import { civ7MutationApprovalMiddleware } from "../../../middleware/mutation-approval";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7CityProductionChoiceResult } from "../contract";

const cityProductionChoiceRequestWithApproval =
  civ7ControlOrpcImplementer.city.production.choice.request.use(
    civ7MutationApprovalMiddleware,
  );

export const cityProductionChoiceRequestProcedure =
  cityProductionChoiceRequestWithApproval.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7ProductionChoice(
          input,
          context.endpointDefaults,
          context.approval,
        );
        return cityProductionChoiceResult(input, result);
      },
      catch: () =>
        errors.PRODUCTION_CHOICE_UNAVAILABLE({
          data: {
            procedureKey: "city.production.choice.request",
            source: "direct-control-facade",
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
  const status = productionChoiceStatus(result, postcondition);

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
    nextSteps: productionChoiceNextSteps(status, postcondition),
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

function productionChoiceStatus(
  result: Civ7ControlOrpcProductionChoiceResult,
  postcondition: Civ7CityProductionChoiceResult["postcondition"],
): Civ7CityProductionChoiceResult["status"] {
  if (!result.sent) return "not-sent";
  return postcondition.confirmed ? "sent-confirmed" : "sent-unverified";
}

function productionChoiceNextSteps(
  status: Civ7CityProductionChoiceResult["status"],
  postcondition: Civ7CityProductionChoiceResult["postcondition"],
): Civ7CityProductionChoiceResult["nextSteps"] {
  if (status === "not-sent") {
    return [{
      kind: "inspect-production",
      source: "city.production.choice.request",
      label: "Inspect production options before attempting another production request.",
    }];
  }
  if (postcondition.noRepeatAfterUnverified) {
    return [{
      kind: "do-not-repeat",
      source: "city.production.choice.request",
      label: "Do not repeat this production request until fresh attention and production evidence is read.",
    }];
  }
  return [{
    kind: "refresh-attention",
    source: "city.production.choice.request",
    label: "Refresh current attention before choosing the next player action.",
  }];
}
