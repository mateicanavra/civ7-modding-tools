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
  Civ7ControlOrpcNarrativeChoiceSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7NarrativeChoiceCheckResult,
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
} from "../contract";
import { pollNarrativeChoicePostcondition } from "../model/policy/choice-polling";
import {
  type Civ7NarrativeChoicePostconditionEvidence,
  civ7NarrativeChoicePostcondition,
  narrativeChoiceAvailable,
} from "../model/policy/choice-postcondition";
import { module } from "../module";

const DEFAULT_NARRATIVE_CHOICE_WAIT_MS = 3_000;
const MIN_NARRATIVE_CHOICE_WAIT_MS = 1_000;
const MAX_NARRATIVE_CHOICE_WAIT_MS = 6_000;

/** Service-owned narrative availability, guarded dispatch, and blocker-clearance observation. */
export const choice = {
  check: module.choice.check.effect(function* ({ context, errors, input }) {
    const check = yield* Effect.tryPromise({
      try: () => context.directControl.checkCiv7NarrativeChoice(input, context.endpointDefaults),
      catch: (cause) =>
        errors.NARRATIVE_CHOICE_UNAVAILABLE({
          data: narrativeChoiceUnavailableData("narrative.choice.check", cause, context),
        }),
    });
    return {
      targetType: input.targetType,
      target: input.target,
      available: narrativeChoiceAvailable(check),
    } satisfies Civ7NarrativeChoiceCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.choice.request).effect(function* ({
    context,
    errors,
    input,
  }) {
    const check = (timeoutMs?: number) =>
      context.directControl.checkCiv7NarrativeChoice(
        input,
        directControlOptions(context, timeoutMs)
      );
    const precheck = yield* Effect.tryPromise({
      try: () => check(),
      catch: (cause) =>
        errors.NARRATIVE_CHOICE_UNAVAILABLE({
          data: narrativeChoiceUnavailableData("narrative.choice.request", cause, context),
        }),
    });
    if (!narrativeChoiceAvailable(precheck)) {
      return narrativeChoiceResult(input, "not-sent", { kind: "not-sent" });
    }

    const sendAttempt = yield* attemptNarrativeChoiceSend(() =>
      context.directControl.sendCiv7NarrativeChoice(
        { ...input, expected: precheck.snapshot },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok) {
      const dispatchState = narrativeChoiceDispatchState(sendAttempt.dispatchStatus);
      return narrativeChoiceResult(
        input,
        dispatchState,
        dispatchState === "not-sent" ? { kind: "not-sent" } : { kind: "send-result-unavailable" }
      );
    }
    if (!sendAttempt.value.sent) {
      return narrativeChoiceResult(input, "not-sent", { kind: "not-sent" });
    }

    const evidence = yield* pollNarrativeChoicePostcondition({
      input,
      send: sendAttempt.value,
      check: (timeoutMs) => check(timeoutMs),
      waitMs: narrativeChoiceWaitMs(context.endpointDefaults?.timeoutMs),
    });
    return narrativeChoiceResult(input, "sent", evidence);
  }),
};

type NarrativeChoiceDispatchState = "not-sent" | "sent" | "unknown";

function narrativeChoiceResult(
  input: Civ7NarrativeChoiceInput,
  dispatchState: NarrativeChoiceDispatchState,
  evidence: Civ7NarrativeChoicePostconditionEvidence
): Civ7NarrativeChoiceResult {
  const postcondition = civ7NarrativeChoicePostcondition(evidence);
  if (dispatchState === "not-sent") {
    if (postcondition.classification !== "not-sent") {
      throw new Error("A narrative choice that was not sent must report not-sent.");
    }
    return {
      targetType: input.targetType,
      target: input.target,
      status: "not-sent",
      postcondition,
      nextSteps: [
        {
          kind: "inspect-narrative-choice",
          source: "narrative.choice.request",
          label: `Inspect native availability for ${narrativeTargetLabel(input)} before attempting another request.`,
        },
      ],
    };
  }
  if (dispatchState === "unknown") {
    if (postcondition.classification !== "missing-postcondition") {
      throw new Error("Unknown narrative dispatch must report missing postcondition evidence.");
    }
    return {
      targetType: input.targetType,
      target: input.target,
      status: "dispatch-unknown",
      postcondition,
      nextSteps: narrativeNoRepeatNextSteps(input),
    };
  }
  if (postcondition.classification === "not-sent") {
    throw new Error("A sent narrative choice cannot report not-sent.");
  }
  if (postcondition.confidence === "confirmed") {
    return {
      targetType: input.targetType,
      target: input.target,
      status: "sent-confirmed",
      postcondition,
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "narrative.choice.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    };
  }
  return {
    targetType: input.targetType,
    target: input.target,
    status: "sent-unverified",
    postcondition,
    nextSteps: narrativeNoRepeatNextSteps(input),
  };
}

function narrativeNoRepeatNextSteps(
  input: Civ7NarrativeChoiceInput
): Extract<
  Civ7NarrativeChoiceResult,
  { status: "dispatch-unknown" | "sent-unverified" }
>["nextSteps"] {
  return [
    {
      kind: "do-not-repeat",
      source: "narrative.choice.request",
      label: `Do not repeat ${narrativeTargetLabel(input)} until fresh native validation and blocker evidence is read.`,
    },
  ];
}

function narrativeTargetLabel(input: Civ7NarrativeChoiceInput): string {
  const componentType = input.target.type === undefined ? "" : `:${input.target.type}`;
  return `narrative direction ${input.targetType} for story ${input.target.owner}:${input.target.id}${componentType}`;
}

type NarrativeChoiceSendAttempt =
  | Readonly<{ ok: true; value: Civ7ControlOrpcNarrativeChoiceSendResult }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptNarrativeChoiceSend(
  send: () => Promise<Civ7ControlOrpcNarrativeChoiceSendResult>
): Effect.Effect<NarrativeChoiceSendAttempt> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function narrativeChoiceDispatchState(
  status: Civ7ControlOrpcCommandDispatchStatus
): Exclude<NarrativeChoiceDispatchState, "sent"> {
  return status === "not-dispatched" ? "not-sent" : "unknown";
}

function narrativeChoiceWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_NARRATIVE_CHOICE_WAIT_MS,
    Math.max(MIN_NARRATIVE_CHOICE_WAIT_MS, timeoutMs ?? DEFAULT_NARRATIVE_CHOICE_WAIT_MS)
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

function narrativeChoiceUnavailableData(
  procedureKey: "narrative.choice.check" | "narrative.choice.request",
  cause: unknown,
  context: Civ7ControlOrpcContext
) {
  const source: "direct-control-facade" = "direct-control-facade";

  return {
    detail: civ7ControlOrpcFailureDetail(cause),
    procedureKey,
    source,
    ...civ7ControlOrpcErrorCorrelationData(context),
  };
}
