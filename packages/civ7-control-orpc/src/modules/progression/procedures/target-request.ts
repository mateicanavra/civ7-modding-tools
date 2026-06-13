import { progressionTargetProofPostcondition } from "@civ7/direct-control/proof/progression-target-proof-policy";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type { Civ7ControlOrpcProgressionTargetResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7CloseoutMutationProjection } from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7ProgressionCultureTargetResult,
  Civ7ProgressionTargetInput,
  Civ7ProgressionTechnologyTargetResult,
} from "../contract";

type ProgressionTargetKind = "technology" | "culture";
type ProgressionTargetSource =
  | "progression.technology.target.request"
  | "progression.culture.target.request";
type ProgressionTargetResult =
  | Civ7ProgressionTechnologyTargetResult
  | Civ7ProgressionCultureTargetResult;
type ProgressionTargetRuntimeInput = Civ7ProgressionTargetInput & Readonly<{ playerId: number }>;

export const progressionTechnologyTargetRequestProcedure = civ7ControlOrpcMutationProcedure(
  civ7ControlOrpcImplementer.progression.technology.target.request
).effect(function* ({ context, errors, input }) {
  const kind = "technology";
  const source = "progression.technology.target.request";
  return yield* Effect.tryPromise({
    try: async () => {
      const localPlayerId = await readLocalPlayerId(context);
      const requestInput = progressionTargetRuntimeInput(input, localPlayerId);
      const result = await requestProgressionTarget(kind, requestInput, context);
      return progressionTargetResult(source, requestInput, result);
    },
    catch: (cause) =>
      errors.PROGRESSION_TARGET_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: source,
          source: "direct-control-facade",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });
});

export const progressionCultureTargetRequestProcedure = civ7ControlOrpcMutationProcedure(
  civ7ControlOrpcImplementer.progression.culture.target.request
).effect(function* ({ context, errors, input }) {
  const kind = "culture";
  const source = "progression.culture.target.request";
  return yield* Effect.tryPromise({
    try: async () => {
      const localPlayerId = await readLocalPlayerId(context);
      const requestInput = progressionTargetRuntimeInput(input, localPlayerId);
      const result = await requestProgressionTarget(kind, requestInput, context);
      return progressionTargetResult(source, requestInput, result);
    },
    catch: (cause) =>
      errors.PROGRESSION_TARGET_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: source,
          source: "direct-control-facade",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });
});

async function readLocalPlayerId(context: Civ7ControlOrpcContext): Promise<number> {
  const view = await context.directControl.getCiv7PlayNotificationView(context.endpointDefaults);
  return view.localPlayerId;
}

function progressionTargetRuntimeInput(
  input: Civ7ProgressionTargetInput,
  localPlayerId: number
): ProgressionTargetRuntimeInput {
  return {
    playerId: localPlayerId,
    node: input.node,
  };
}

async function requestProgressionTarget(
  kind: ProgressionTargetKind,
  input: ProgressionTargetRuntimeInput,
  context: Civ7ControlOrpcContext
): Promise<Civ7ControlOrpcProgressionTargetResult> {
  if (kind === "technology") {
    return context.directControl.requestCiv7TechnologyTarget(input, context.endpointDefaults);
  }

  return context.directControl.requestCiv7CultureTarget(input, context.endpointDefaults);
}

function progressionTargetResult(
  source: "progression.technology.target.request",
  input: ProgressionTargetRuntimeInput,
  result: Civ7ControlOrpcProgressionTargetResult
): Civ7ProgressionTechnologyTargetResult;
function progressionTargetResult(
  source: "progression.culture.target.request",
  input: ProgressionTargetRuntimeInput,
  result: Civ7ControlOrpcProgressionTargetResult
): Civ7ProgressionCultureTargetResult;
function progressionTargetResult(
  source: ProgressionTargetSource,
  input: ProgressionTargetRuntimeInput,
  result: Civ7ControlOrpcProgressionTargetResult
): ProgressionTargetResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: progressionTargetProofPostcondition(result),
    missing: {
      classification: "missing-postcondition",
      reason:
        "The progression target request result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source,
    inspectKind: "inspect-progression-target",
    inspectLabel:
      "Inspect current progression target state before attempting another target request.",
    doNotRepeatLabel:
      "Do not repeat this progression target request until fresh progression target evidence is read.",
  });

  return {
    playerId: result.playerId,
    node: input.node,
    sent: result.sent,
    status: projection.status as ProgressionTargetResult["status"],
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition: projection.postcondition as ProgressionTargetResult["postcondition"],
    nextSteps: projection.nextSteps as ProgressionTargetResult["nextSteps"],
  } as ProgressionTargetResult;
}
