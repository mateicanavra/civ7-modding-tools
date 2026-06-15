import { unitTargetProofPostcondition } from "@civ7/direct-control/proof/unit-target-proof-policy";
import { Effect } from "effect";

import type { Civ7ControlOrpcUnitTargetActionResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7MutationNextSteps, civ7MutationRequestStatus } from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7UnitTargetActionResult } from "../contract";

export const unitTargetActionRequestProcedure = civ7ControlOrpcMutationProcedure(
  civ7ControlOrpcImplementer.unit.target.action.request
).effect(function* ({ context, errors, input }) {
  return yield* Effect.tryPromise({
    try: async () => {
      const result = await context.directControl.requestCiv7UnitTargetAction(
        input,
        context.endpointDefaults
      );
      return unitTargetActionResult(result);
    },
    catch: (cause) =>
      errors.UNIT_TARGET_ACTION_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: "unit.target.action.request",
          source: "direct-control-facade",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });
});

function unitTargetActionResult(
  result: Civ7ControlOrpcUnitTargetActionResult
): Civ7UnitTargetActionResult {
  const postcondition = unitTargetActionPostconditionSummary(result);
  const status = civ7MutationRequestStatus({
    sent: result.sent,
    postcondition,
  });

  return {
    unitId: result.unitId,
    target: { x: result.target.x, y: result.target.y },
    sent: result.sent,
    status,
    validation: {
      candidateCount: result.candidates.length,
      acceptedCandidateCount: result.candidates.filter(acceptedCandidate).length,
      selected:
        result.selected == null
          ? null
          : {
              family: result.selected.family,
              operationType: result.selected.operationType,
              valid: result.selected.valid,
              targetInReturnedPlots: result.selected.targetInReturnedPlots,
              rejectedReason: result.selected.rejectedReason ?? null,
            },
    },
    postcondition,
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: "unit.target.action.request",
      inspectKind: "inspect-unit-action",
      inspectLabel: "Inspect unit target candidates before attempting another unit action request.",
      doNotRepeatLabel:
        "Do not repeat this unit target action until fresh unit and target evidence is read.",
    }),
  };
}

function acceptedCandidate(
  candidate: Civ7ControlOrpcUnitTargetActionResult["candidates"][number]
): boolean {
  return candidate.valid === true && candidate.targetInReturnedPlots !== false;
}

function unitTargetActionPostconditionSummary(
  result: Civ7ControlOrpcUnitTargetActionResult
): Civ7UnitTargetActionResult["postcondition"] {
  const verification = result.verification;
  const requestedLocation = {
    x: verification?.requestedLocation.x ?? result.target.x,
    y: verification?.requestedLocation.y ?? result.target.y,
  };
  const landedLocation = verification?.landedLocation ?? null;
  const postcondition = unitTargetProofPostcondition(result, undefined);

  if (postcondition == null) {
    return {
      classification: "not-sent",
      reason:
        "The unit target action was not sent because no acceptable target action candidate was selected.",
      outcome: "not-sent",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
      destinationReached: verification?.destinationReached ?? null,
      requestedLocation,
      landedLocation,
      source: verification?.source ?? null,
    };
  }

  const confidence =
    postcondition.confidence === "pending-runtime-proof" ? "unverified" : postcondition.confidence;

  return {
    classification:
      postcondition.classification as Civ7UnitTargetActionResult["postcondition"]["classification"],
    reason: postcondition.reason,
    outcome: postcondition.outcome as Civ7UnitTargetActionResult["postcondition"]["outcome"],
    confidence,
    confirmed: confidence === "confirmed",
    noRepeatAfterUnverified: postcondition.noRepeatAfterUnverified,
    destinationReached: verification?.destinationReached ?? null,
    requestedLocation,
    landedLocation,
    source: verification?.source ?? null,
  };
}
