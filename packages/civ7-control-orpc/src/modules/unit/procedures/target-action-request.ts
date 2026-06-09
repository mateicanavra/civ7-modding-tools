import { unitTargetProofPostcondition } from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcUnitTargetActionResult } from "../../../dependencies/direct-control";
import { civ7MutationApprovalMiddleware } from "../../../middleware/mutation-approval";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7UnitTargetActionResult } from "../contract";

const unitTargetActionRequestWithApproval =
  civ7ControlOrpcImplementer.unit.target.action.request.use(
    civ7MutationApprovalMiddleware,
  );

export const unitTargetActionRequestProcedure =
  unitTargetActionRequestWithApproval.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7UnitTargetAction(
          input,
          context.endpointDefaults,
          context.approval,
        );
        return unitTargetActionResult(result);
      },
      catch: () =>
        errors.UNIT_TARGET_ACTION_UNAVAILABLE({
          data: {
            procedureKey: "unit.target.action.request",
            source: "direct-control-facade",
          },
        }),
    });
  });

function unitTargetActionResult(
  result: Civ7ControlOrpcUnitTargetActionResult,
): Civ7UnitTargetActionResult {
  const postcondition = unitTargetActionPostconditionSummary(result);
  const status = unitTargetActionStatus(result, postcondition);

  return {
    unitId: result.unitId,
    target: { x: result.target.x, y: result.target.y },
    sent: result.sent,
    status,
    validation: {
      candidateCount: result.candidates.length,
      acceptedCandidateCount: result.candidates.filter(acceptedCandidate).length,
      selected: result.selected == null
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
    nextSteps: unitTargetActionNextSteps(status, postcondition),
  };
}

function acceptedCandidate(
  candidate: Civ7ControlOrpcUnitTargetActionResult["candidates"][number],
): boolean {
  return candidate.valid === true && candidate.targetInReturnedPlots !== false;
}

function unitTargetActionPostconditionSummary(
  result: Civ7ControlOrpcUnitTargetActionResult,
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
      reason: "The unit target action was not sent because no acceptable target action candidate was selected.",
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

  const confidence = postcondition.confidence === "pending-runtime-proof"
    ? "unverified"
    : postcondition.confidence;

  return {
    classification: postcondition.classification as
      Civ7UnitTargetActionResult["postcondition"]["classification"],
    reason: postcondition.reason,
    outcome: postcondition.outcome as
      Civ7UnitTargetActionResult["postcondition"]["outcome"],
    confidence,
    confirmed: confidence === "confirmed",
    noRepeatAfterUnverified: postcondition.noRepeatAfterUnverified,
    destinationReached: verification?.destinationReached ?? null,
    requestedLocation,
    landedLocation,
    source: verification?.source ?? null,
  };
}

function unitTargetActionStatus(
  result: Civ7ControlOrpcUnitTargetActionResult,
  postcondition: Civ7UnitTargetActionResult["postcondition"],
): Civ7UnitTargetActionResult["status"] {
  if (!result.sent) return "not-sent";
  if (postcondition.confidence !== "confirmed") return "sent-unverified";
  if (postcondition.noRepeatAfterUnverified) return "sent-guarded";
  return "sent-confirmed";
}

function unitTargetActionNextSteps(
  status: Civ7UnitTargetActionResult["status"],
  postcondition: Civ7UnitTargetActionResult["postcondition"],
): Civ7UnitTargetActionResult["nextSteps"] {
  if (status === "not-sent") {
    return [{
      kind: "inspect-unit-action",
      source: "unit.target.action.request",
      label: "Inspect unit target candidates before attempting another unit action request.",
    }];
  }
  if (postcondition.noRepeatAfterUnverified) {
    return [{
      kind: "do-not-repeat",
      source: "unit.target.action.request",
      label: "Do not repeat this unit target action until fresh unit and target evidence is read.",
    }];
  }
  return [{
    kind: "refresh-attention",
    source: "unit.target.action.request",
    label: "Refresh current attention before choosing the next player action.",
  }];
}
