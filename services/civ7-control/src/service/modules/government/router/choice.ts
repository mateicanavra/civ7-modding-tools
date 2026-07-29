import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcGovernmentChoiceCheckResult,
  Civ7ControlOrpcGovernmentChoiceSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7GovernmentChoiceCheckResult,
  Civ7GovernmentChoiceInput,
  Civ7GovernmentChoiceResult,
} from "../contract";
import { pollGovernmentChoicePostcondition } from "../model/policy/choice-polling";
import {
  type Civ7GovernmentChoicePostconditionEvidence,
  civ7GovernmentChoicePostcondition,
  governmentChoiceAvailable,
} from "../model/policy/choice-postcondition";
import { module } from "../module";

const DEFAULT_GOVERNMENT_CHOICE_WAIT_MS = 3_000;
const MIN_GOVERNMENT_CHOICE_WAIT_MS = 1_000;
const MAX_GOVERNMENT_CHOICE_WAIT_MS = 6_000;

/** Service-owned government availability, guarded dispatch, and target observation. */
export const choice = {
  check: module.choice.check.effect(function* ({ context, errors, input }) {
    const check = yield* Effect.tryPromise({
      try: () => context.directControl.checkCiv7GovernmentChoice(input, context.endpointDefaults),
      catch: (cause) =>
        errors.GOVERNMENT_CHOICE_UNAVAILABLE({
          data: governmentChoiceUnavailableData("government.choice.check", cause, context),
        }),
    });
    return {
      governmentType: input.governmentType,
      available: governmentChoiceAvailable(input, check),
    } satisfies Civ7GovernmentChoiceCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.choice.request).effect(function* ({
    context,
    errors,
    input,
  }) {
    const check = (timeoutMs?: number) =>
      context.directControl.checkCiv7GovernmentChoice(
        input,
        directControlOptions(context, timeoutMs)
      );
    const precheck = yield* Effect.tryPromise({
      try: () => check(),
      catch: (cause) =>
        errors.GOVERNMENT_CHOICE_UNAVAILABLE({
          data: governmentChoiceUnavailableData("government.choice.request", cause, context),
        }),
    });
    if (!governmentChoiceAvailable(input, precheck)) {
      return governmentChoiceResult(input, "not-sent", { kind: "not-sent" });
    }

    const sendAttempt = yield* attemptGovernmentChoiceSend(() =>
      context.directControl.sendCiv7GovernmentChoice(
        { ...input, expected: precheck.snapshot },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok) {
      const dispatchState = governmentChoiceDispatchState(sendAttempt.dispatchStatus);
      return governmentChoiceResult(
        input,
        dispatchState,
        dispatchState === "not-sent" ? { kind: "not-sent" } : { kind: "send-result-unavailable" }
      );
    }
    if (!sendAttempt.value.sent) {
      return governmentChoiceResult(input, "not-sent", { kind: "not-sent" });
    }

    const evidence = yield* pollGovernmentChoicePostcondition({
      input,
      send: sendAttempt.value,
      check: (timeoutMs) => check(timeoutMs),
      waitMs: governmentChoiceWaitMs(context.endpointDefaults?.timeoutMs),
    });
    return governmentChoiceResult(input, "sent", evidence);
  }),
};

type GovernmentChoiceDispatchState = "not-sent" | "sent" | "unknown";

function governmentChoiceResult(
  input: Civ7GovernmentChoiceInput,
  dispatchState: GovernmentChoiceDispatchState,
  evidence: Civ7GovernmentChoicePostconditionEvidence
): Civ7GovernmentChoiceResult {
  const postcondition = civ7GovernmentChoicePostcondition(evidence);
  if (dispatchState === "not-sent") {
    if (postcondition.classification !== "not-sent") {
      throw new Error("A government choice that was not sent must report not-sent.");
    }
    return {
      governmentType: input.governmentType,
      status: "not-sent",
      postcondition,
      nextSteps: [
        {
          kind: "inspect-government-choice",
          source: "government.choice.request",
          label: "Inspect exact government choice availability before attempting another request.",
        },
      ],
    };
  }
  if (dispatchState === "unknown") {
    if (postcondition.classification !== "missing-postcondition") {
      throw new Error("Unknown government dispatch must report missing postcondition evidence.");
    }
    return {
      governmentType: input.governmentType,
      status: "dispatch-unknown",
      postcondition,
      nextSteps: governmentNoRepeatNextSteps(),
    };
  }
  if (postcondition.classification === "not-sent") {
    throw new Error("A sent government choice cannot report not-sent.");
  }
  if (postcondition.confidence === "confirmed") {
    return {
      governmentType: input.governmentType,
      status: "sent-confirmed",
      postcondition,
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "government.choice.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    };
  }
  return {
    governmentType: input.governmentType,
    status: "sent-unverified",
    postcondition,
    nextSteps: governmentNoRepeatNextSteps(),
  };
}

function governmentNoRepeatNextSteps(): Extract<
  Civ7GovernmentChoiceResult,
  { status: "dispatch-unknown" | "sent-unverified" }
>["nextSteps"] {
  return [
    {
      kind: "do-not-repeat",
      source: "government.choice.request",
      label:
        "Do not repeat this government choice until fresh target-specific government and blocker evidence is read.",
    },
  ];
}

type GovernmentChoiceSendAttempt =
  | Readonly<{ ok: true; value: Civ7ControlOrpcGovernmentChoiceSendResult }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptGovernmentChoiceSend(
  send: () => Promise<Civ7ControlOrpcGovernmentChoiceSendResult>
): Effect.Effect<GovernmentChoiceSendAttempt> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function governmentChoiceDispatchState(
  status: Civ7ControlOrpcCommandDispatchStatus
): Exclude<GovernmentChoiceDispatchState, "sent"> {
  return status === "not-dispatched" ? "not-sent" : "unknown";
}

function governmentChoiceWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_GOVERNMENT_CHOICE_WAIT_MS,
    Math.max(MIN_GOVERNMENT_CHOICE_WAIT_MS, timeoutMs ?? DEFAULT_GOVERNMENT_CHOICE_WAIT_MS)
  );
}

function directControlOptions(context: Civ7ControlOrpcContext, timeoutMs: number | undefined) {
  return timeoutMs === undefined
    ? context.endpointDefaults
    : {
        ...context.endpointDefaults,
        timeoutMs,
      };
}

function governmentChoiceUnavailableData(
  procedureKey: "government.choice.check" | "government.choice.request",
  cause: unknown,
  context: Civ7ControlOrpcContext
) {
  return {
    detail: civ7ControlOrpcFailureDetail(cause),
    procedureKey,
    source: "direct-control-facade" as const,
    ...civ7ControlOrpcErrorCorrelationData(context),
  };
}
