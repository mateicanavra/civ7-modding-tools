import { townFocusProofPostcondition } from "@civ7/direct-control/proof/town-focus-proof-policy";
import { Effect } from "effect";
import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7CloseoutMutationProjection } from "#civ7-control-service/model/policy/mutation-result";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7ControlOrpcDirectControlFacade } from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7CityTownFocusChangeInput,
  Civ7CityTownFocusChangeResult,
  Civ7CityTownFocusReviewInput,
  Civ7CityTownFocusReviewResult,
} from "../contract";
import { module } from "../module";

type TownFocusSource = "city.townFocus.change.request" | "city.townFocus.review.request";
type TownFocusResult = Civ7CityTownFocusChangeResult | Civ7CityTownFocusReviewResult;
type TownFocusRuntimeResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["requestCiv7TownFocusChange"]>
>;
export const townFocusRequest = {
  cityTownFocusChangeRequestProcedure: civ7ControlOrpcMutationProcedure(
    module.townFocus.change.request
  ).effect(function* ({ context, errors, input }) {
    const source = "city.townFocus.change.request";
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7TownFocusChange(
          input,
          context.endpointDefaults
        );
        return townFocusResult(source, input, result);
      },
      catch: (cause) =>
        errors.TOWN_FOCUS_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: source,
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }),
  cityTownFocusReviewRequestProcedure: civ7ControlOrpcMutationProcedure(
    module.townFocus.review.request
  ).effect(function* ({ context, errors, input }) {
    const source = "city.townFocus.review.request";
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7TownFocusReviewCloseout(
          input,
          context.endpointDefaults
        );
        return townFocusResult(source, input, result);
      },
      catch: (cause) =>
        errors.TOWN_FOCUS_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: source,
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }),
};
function townFocusResult(
  source: "city.townFocus.change.request",
  input: Civ7CityTownFocusChangeInput,
  result: TownFocusRuntimeResult
): Civ7CityTownFocusChangeResult;
function townFocusResult(
  source: "city.townFocus.review.request",
  input: Civ7CityTownFocusReviewInput,
  result: TownFocusRuntimeResult
): Civ7CityTownFocusReviewResult;
function townFocusResult(
  source: TownFocusSource,
  input: Civ7CityTownFocusChangeInput | Civ7CityTownFocusReviewInput,
  result: TownFocusRuntimeResult
): TownFocusResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: townFocusProofPostcondition(result),
    missing: {
      classification: "missing-postcondition",
      reason: "The town focus result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source,
    inspectKind: "inspect-town-focus",
    inspectLabel:
      "Inspect current ready-city town focus evidence before attempting another town focus request.",
    doNotRepeatLabel:
      "Do not repeat this town focus request until fresh city readiness evidence is read.",
  });
  const base = {
    cityId: result.cityId,
    sent: result.sent,
    status: projection.status as TownFocusResult["status"],
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition: projection.postcondition as TownFocusResult["postcondition"],
    nextSteps: projection.nextSteps as TownFocusResult["nextSteps"],
  };
  if (
    source === "city.townFocus.change.request" &&
    result.kind === "town-focus-change" &&
    "growthType" in input
  ) {
    return {
      ...base,
      growthType: result.growthType,
      projectType: result.projectType,
      city: result.city,
    } as Civ7CityTownFocusChangeResult;
  }
  if (source === "city.townFocus.review.request") {
    return base as Civ7CityTownFocusReviewResult;
  }
  throw new Error("invalid town focus projection");
}
