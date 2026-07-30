import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcCelebrationChoiceCheckResult,
  Civ7ControlOrpcCelebrationChoiceSendResult,
  Civ7ControlOrpcCommandDispatchStatus,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7GovernmentCelebrationChoiceCheckResult,
  Civ7GovernmentCelebrationChoiceInput,
  Civ7GovernmentCelebrationChoiceResult,
} from "../contract";
import { pollCelebrationChoicePostcondition } from "../model/policy/choice-polling";
import {
  type Civ7CelebrationChoicePostconditionEvidence,
  celebrationChoiceAvailable,
  civ7CelebrationChoicePostcondition,
} from "../model/policy/choice-postcondition";
import { module } from "../module";

const DEFAULT_CELEBRATION_CHOICE_WAIT_MS = 3_000;
const MIN_CELEBRATION_CHOICE_WAIT_MS = 1_000;
const MAX_CELEBRATION_CHOICE_WAIT_MS = 6_000;

/** Service-owned celebration availability, guarded dispatch, and target observation. */
export const celebrationChoice = {
  check: module.celebration.choice.check.effect(function* ({ context, errors, input }) {
    const check = yield* Effect.tryPromise({
      try: () => context.directControl.checkCiv7CelebrationChoice(input, context.endpointDefaults),
      catch: (cause) =>
        errors.GOVERNMENT_CHOICE_UNAVAILABLE({
          data: celebrationChoiceUnavailableData(
            "government.celebration.choice.check",
            cause,
            context
          ),
        }),
    });
    return {
      goldenAgeType: input.goldenAgeType,
      available: celebrationChoiceAvailable(input, check),
    } satisfies Civ7GovernmentCelebrationChoiceCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.celebration.choice.request).effect(function* ({
    context,
    errors,
    input,
  }) {
    const check = (timeoutMs?: number) =>
      context.directControl.checkCiv7CelebrationChoice(
        input,
        directControlOptions(context, timeoutMs)
      );
    const precheck = yield* Effect.tryPromise({
      try: () => check(),
      catch: (cause) =>
        errors.GOVERNMENT_CHOICE_UNAVAILABLE({
          data: celebrationChoiceUnavailableData(
            "government.celebration.choice.request",
            cause,
            context
          ),
        }),
    });
    if (!celebrationChoiceAvailable(input, precheck)) {
      return celebrationChoiceResult(input, "not-sent", { kind: "not-sent" });
    }

    const sendAttempt = yield* attemptCelebrationChoiceSend(() =>
      context.directControl.sendCiv7CelebrationChoice(
        { ...input, expected: precheck.snapshot },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok) {
      const dispatchState = celebrationChoiceDispatchState(sendAttempt.dispatchStatus);
      return celebrationChoiceResult(
        input,
        dispatchState,
        dispatchState === "not-sent" ? { kind: "not-sent" } : { kind: "send-result-unavailable" }
      );
    }
    if (!sendAttempt.value.sent) {
      return celebrationChoiceResult(input, "not-sent", { kind: "not-sent" });
    }

    const evidence = yield* pollCelebrationChoicePostcondition({
      input,
      send: sendAttempt.value,
      check: (timeoutMs) => check(timeoutMs),
      waitMs: celebrationChoiceWaitMs(context.endpointDefaults?.timeoutMs),
    });
    return celebrationChoiceResult(input, "sent", evidence);
  }),
};

type CelebrationChoiceDispatchState = "not-sent" | "sent" | "unknown";

function celebrationChoiceResult(
  input: Civ7GovernmentCelebrationChoiceInput,
  dispatchState: CelebrationChoiceDispatchState,
  evidence: Civ7CelebrationChoicePostconditionEvidence
): Civ7GovernmentCelebrationChoiceResult {
  const postcondition = civ7CelebrationChoicePostcondition(evidence);
  if (dispatchState === "not-sent") {
    if (postcondition.classification !== "not-sent") {
      throw new Error("A celebration choice that was not sent must report not-sent.");
    }
    return {
      goldenAgeType: input.goldenAgeType,
      status: "not-sent",
      postcondition,
      nextSteps: [
        {
          kind: "inspect-celebration-choice",
          source: "government.celebration.choice.request",
          label: "Inspect exact celebration choice availability before attempting another request.",
        },
      ],
    };
  }
  if (dispatchState === "unknown") {
    if (postcondition.classification !== "missing-postcondition") {
      throw new Error("Unknown celebration dispatch must report missing postcondition evidence.");
    }
    return {
      goldenAgeType: input.goldenAgeType,
      status: "dispatch-unknown",
      postcondition,
      nextSteps: celebrationNoRepeatNextSteps(),
    };
  }
  if (postcondition.classification === "not-sent") {
    throw new Error("A sent celebration choice cannot report not-sent.");
  }
  if (postcondition.confidence === "confirmed") {
    return {
      goldenAgeType: input.goldenAgeType,
      status: "sent-confirmed",
      postcondition,
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "government.celebration.choice.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    };
  }
  return {
    goldenAgeType: input.goldenAgeType,
    status: "sent-unverified",
    postcondition,
    nextSteps: celebrationNoRepeatNextSteps(),
  };
}

function celebrationNoRepeatNextSteps(): Extract<
  Civ7GovernmentCelebrationChoiceResult,
  { status: "dispatch-unknown" | "sent-unverified" }
>["nextSteps"] {
  return [
    {
      kind: "do-not-repeat",
      source: "government.celebration.choice.request",
      label:
        "Do not repeat this celebration choice until fresh target-specific golden-age and blocker evidence is read.",
    },
  ];
}

type CelebrationChoiceSendAttempt =
  | Readonly<{ ok: true; value: Civ7ControlOrpcCelebrationChoiceSendResult }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptCelebrationChoiceSend(
  send: () => Promise<Civ7ControlOrpcCelebrationChoiceSendResult>
): Effect.Effect<CelebrationChoiceSendAttempt> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function celebrationChoiceDispatchState(
  status: Civ7ControlOrpcCommandDispatchStatus
): Exclude<CelebrationChoiceDispatchState, "sent"> {
  return status === "not-dispatched" ? "not-sent" : "unknown";
}

function celebrationChoiceWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_CELEBRATION_CHOICE_WAIT_MS,
    Math.max(MIN_CELEBRATION_CHOICE_WAIT_MS, timeoutMs ?? DEFAULT_CELEBRATION_CHOICE_WAIT_MS)
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

function celebrationChoiceUnavailableData(
  procedureKey: "government.celebration.choice.check" | "government.celebration.choice.request",
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
