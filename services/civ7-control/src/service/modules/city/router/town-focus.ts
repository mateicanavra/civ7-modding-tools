import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcTownFocusChangeCheckResult,
  Civ7ControlOrpcTownFocusChangeSendResult,
  Civ7ControlOrpcTownFocusReviewCheckResult,
  Civ7ControlOrpcTownFocusReviewSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7CityTownFocusChangeCheckResult,
  Civ7CityTownFocusChangeInput,
  Civ7CityTownFocusChangeResult,
  Civ7CityTownFocusReviewCheckResult,
  Civ7CityTownFocusReviewInput,
  Civ7CityTownFocusReviewResult,
} from "../contract";
import {
  pollTownFocusChangePostcondition,
  pollTownFocusReviewPostcondition,
} from "../model/policy/town-focus-polling";
import {
  type Civ7TownFocusPostcondition,
  civ7TownFocusChangePostcondition,
  civ7TownFocusReviewPostcondition,
  townFocusChangeCheckStatus,
  townFocusReviewCheckStatus,
} from "../model/policy/town-focus-postcondition";
import { module } from "../module";

const DEFAULT_TOWN_FOCUS_WAIT_MS = 3_000;
const MIN_TOWN_FOCUS_WAIT_MS = 1_000;
const MAX_TOWN_FOCUS_WAIT_MS = 6_000;

export const townFocus = {
  change: {
    check: module.townFocus.change.check.effect(function* ({ context, errors, input }) {
      const check = yield* Effect.tryPromise({
        try: () => context.directControl.checkCiv7TownFocusChange(input, context.endpointDefaults),
        catch: (cause) =>
          errors.TOWN_FOCUS_UNAVAILABLE({
            data: townFocusUnavailableData("city.townFocus.change.check", cause, context),
          }),
      });
      return townFocusChangeCheckResult(input, check);
    }),
    request: civ7ControlOrpcMutationProcedure(module.townFocus.change.request).effect(function* ({
      context,
      errors,
      input,
    }) {
      return yield* townFocusChangeRequest({
        input,
        waitMs: townFocusWaitMs(context.endpointDefaults?.timeoutMs),
        check: (timeoutMs) =>
          context.directControl.checkCiv7TownFocusChange(
            input,
            timeoutMs === undefined
              ? context.endpointDefaults
              : { ...context.endpointDefaults, timeoutMs }
          ),
        send: () => context.directControl.sendCiv7TownFocusChange(input, context.endpointDefaults),
        onPrecheckFailure: (cause) =>
          errors.TOWN_FOCUS_UNAVAILABLE({
            data: townFocusUnavailableData("city.townFocus.change.request", cause, context),
          }),
      });
    }),
  },
  review: {
    check: module.townFocus.review.check.effect(function* ({ context, errors, input }) {
      const check = yield* Effect.tryPromise({
        try: () => context.directControl.checkCiv7TownFocusReview(input, context.endpointDefaults),
        catch: (cause) =>
          errors.TOWN_FOCUS_UNAVAILABLE({
            data: townFocusUnavailableData("city.townFocus.review.check", cause, context),
          }),
      });
      return townFocusReviewCheckResult(input, check);
    }),
    request: civ7ControlOrpcMutationProcedure(module.townFocus.review.request).effect(function* ({
      context,
      errors,
      input,
    }) {
      return yield* townFocusReviewRequest({
        input,
        waitMs: townFocusWaitMs(context.endpointDefaults?.timeoutMs),
        check: (timeoutMs) =>
          context.directControl.checkCiv7TownFocusReview(
            input,
            timeoutMs === undefined
              ? context.endpointDefaults
              : { ...context.endpointDefaults, timeoutMs }
          ),
        send: () => context.directControl.sendCiv7TownFocusReview(input, context.endpointDefaults),
        onPrecheckFailure: (cause) =>
          errors.TOWN_FOCUS_UNAVAILABLE({
            data: townFocusUnavailableData("city.townFocus.review.request", cause, context),
          }),
      });
    }),
  },
};

function townFocusChangeRequest<E>(
  options: Readonly<{
    input: Civ7CityTownFocusChangeInput;
    waitMs: number;
    check: (timeoutMs?: number) => Promise<Civ7ControlOrpcTownFocusChangeCheckResult>;
    send: () => Promise<Civ7ControlOrpcTownFocusChangeSendResult>;
    onPrecheckFailure: (cause: unknown) => E;
  }>
): Effect.Effect<Civ7CityTownFocusChangeResult, E> {
  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => options.check(),
      catch: options.onPrecheckFailure,
    });
    const precheckStatus = townFocusChangeCheckStatus(options.input, precheck);
    if (precheckStatus === "selected") {
      return townFocusAlreadySelectedResult(
        options.input,
        civ7TownFocusChangePostcondition({ kind: "selected" })
      );
    }
    if (precheckStatus === "unavailable") {
      return townFocusChangeNotSentResult(
        options.input,
        civ7TownFocusChangePostcondition({ kind: "not-sent" })
      );
    }

    const sendAttempt = yield* attemptTownFocusSend(options.send).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok) {
      return sendAttempt.dispatchStatus === "not-dispatched"
        ? townFocusChangeNotSentResult(
            options.input,
            civ7TownFocusChangePostcondition({ kind: "not-sent" })
          )
        : townFocusChangeDispatchUnknownResult(
            options.input,
            civ7TownFocusChangePostcondition({ kind: "postcheck-unavailable" })
          );
    }
    if (!sendAttempt.value.sent) {
      return townFocusChangeNotSentResult(
        options.input,
        civ7TownFocusChangePostcondition({ kind: "not-sent" })
      );
    }

    const evidence = yield* pollTownFocusChangePostcondition({
      input: options.input,
      send: sendAttempt.value,
      check: options.check,
      waitMs: options.waitMs,
    });
    const postcondition = civ7TownFocusChangePostcondition(evidence);
    return townFocusChangeSentResult(options.input, postcondition);
  });
}

function townFocusReviewRequest<E>(
  options: Readonly<{
    input: Civ7CityTownFocusReviewInput;
    waitMs: number;
    check: (timeoutMs?: number) => Promise<Civ7ControlOrpcTownFocusReviewCheckResult>;
    send: () => Promise<Civ7ControlOrpcTownFocusReviewSendResult>;
    onPrecheckFailure: (cause: unknown) => E;
  }>
): Effect.Effect<Civ7CityTownFocusReviewResult, E> {
  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => options.check(),
      catch: options.onPrecheckFailure,
    });
    const precheckStatus = townFocusReviewCheckStatus(options.input, precheck.snapshot);
    if (precheckStatus === "complete") {
      return townFocusReviewAlreadyCompleteResult(
        options.input,
        civ7TownFocusReviewPostcondition({ kind: "complete" })
      );
    }
    if (precheckStatus === "unavailable") {
      return townFocusReviewNotSentResult(
        options.input,
        civ7TownFocusReviewPostcondition({ kind: "not-sent" })
      );
    }

    const sendAttempt = yield* attemptTownFocusSend(options.send).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok) {
      return sendAttempt.dispatchStatus === "not-dispatched"
        ? townFocusReviewNotSentResult(
            options.input,
            civ7TownFocusReviewPostcondition({ kind: "not-sent" })
          )
        : townFocusReviewDispatchUnknownResult(
            options.input,
            civ7TownFocusReviewPostcondition({ kind: "postcheck-unavailable" })
          );
    }

    const evidence = yield* pollTownFocusReviewPostcondition({
      input: options.input,
      send: sendAttempt.value,
      check: options.check,
      waitMs: options.waitMs,
    });
    const postcondition = civ7TownFocusReviewPostcondition(evidence);
    return townFocusReviewSentResult(options.input, postcondition);
  });
}

function townFocusChangeCheckResult(
  input: Civ7CityTownFocusChangeInput,
  check: Civ7ControlOrpcTownFocusChangeCheckResult
): Civ7CityTownFocusChangeCheckResult {
  return {
    cityId: input.cityId,
    growthType: input.growthType,
    projectType: input.projectType,
    status: townFocusChangeCheckStatus(input, check),
  };
}

function townFocusReviewCheckResult(
  input: Civ7CityTownFocusReviewInput,
  check: Civ7ControlOrpcTownFocusReviewCheckResult
): Civ7CityTownFocusReviewCheckResult {
  return {
    cityId: input.cityId,
    status: townFocusReviewCheckStatus(input, check.snapshot),
  };
}

type SelectedPostcondition = Extract<
  Civ7TownFocusPostcondition,
  { classification: "town-focus-selected" }
>;
type ReviewClearedPostcondition = Extract<
  Civ7TownFocusPostcondition,
  { classification: "town-focus-review-cleared" }
>;
type NotSentPostcondition = Extract<Civ7TownFocusPostcondition, { classification: "not-sent" }>;
type MissingPostcondition = Extract<
  Civ7TownFocusPostcondition,
  { classification: "missing-postcondition" }
>;
type ChangeSentPostcondition = Extract<
  Civ7TownFocusPostcondition,
  { classification: "town-focus-selected" | "no-state-change" | "missing-postcondition" }
>;
type ReviewSentPostcondition = Extract<
  Civ7TownFocusPostcondition,
  { classification: "town-focus-review-cleared" | "no-state-change" | "missing-postcondition" }
>;

function townFocusAlreadySelectedResult(
  input: Civ7CityTownFocusChangeInput,
  postcondition: SelectedPostcondition
): Extract<Civ7CityTownFocusChangeResult, { status: "already-selected" }> {
  return {
    cityId: input.cityId,
    growthType: input.growthType,
    projectType: input.projectType,
    status: "already-selected",
    postcondition,
    nextSteps: townFocusChangeRefreshNextSteps(),
  };
}

function townFocusChangeNotSentResult(
  input: Civ7CityTownFocusChangeInput,
  postcondition: NotSentPostcondition
): Extract<Civ7CityTownFocusChangeResult, { status: "not-sent" }> {
  return {
    cityId: input.cityId,
    growthType: input.growthType,
    projectType: input.projectType,
    status: "not-sent",
    postcondition,
    nextSteps: townFocusChangeInspectNextSteps(),
  };
}

function townFocusChangeDispatchUnknownResult(
  input: Civ7CityTownFocusChangeInput,
  postcondition: MissingPostcondition
): Extract<Civ7CityTownFocusChangeResult, { status: "dispatch-unknown" }> {
  return {
    cityId: input.cityId,
    growthType: input.growthType,
    projectType: input.projectType,
    status: "dispatch-unknown",
    postcondition,
    nextSteps: townFocusChangeNoRepeatNextSteps(),
  };
}

function townFocusChangeSentResult(
  input: Civ7CityTownFocusChangeInput,
  postcondition: ChangeSentPostcondition
): Extract<Civ7CityTownFocusChangeResult, { status: "sent-confirmed" | "sent-unverified" }> {
  const base = {
    cityId: input.cityId,
    growthType: input.growthType,
    projectType: input.projectType,
  };
  switch (postcondition.classification) {
    case "town-focus-selected":
      return {
        ...base,
        status: "sent-confirmed",
        postcondition,
        nextSteps: townFocusChangeRefreshNextSteps(),
      };
    case "no-state-change":
    case "missing-postcondition":
      return {
        ...base,
        status: "sent-unverified",
        postcondition,
        nextSteps: townFocusChangeNoRepeatNextSteps(),
      };
  }
}

function townFocusReviewAlreadyCompleteResult(
  input: Civ7CityTownFocusReviewInput,
  postcondition: ReviewClearedPostcondition
): Extract<Civ7CityTownFocusReviewResult, { status: "already-complete" }> {
  return {
    cityId: input.cityId,
    status: "already-complete",
    postcondition,
    nextSteps: townFocusReviewRefreshNextSteps(),
  };
}

function townFocusReviewNotSentResult(
  input: Civ7CityTownFocusReviewInput,
  postcondition: NotSentPostcondition
): Extract<Civ7CityTownFocusReviewResult, { status: "not-sent" }> {
  return {
    cityId: input.cityId,
    status: "not-sent",
    postcondition,
    nextSteps: townFocusReviewInspectNextSteps(),
  };
}

function townFocusReviewDispatchUnknownResult(
  input: Civ7CityTownFocusReviewInput,
  postcondition: MissingPostcondition
): Extract<Civ7CityTownFocusReviewResult, { status: "dispatch-unknown" }> {
  return {
    cityId: input.cityId,
    status: "dispatch-unknown",
    postcondition,
    nextSteps: townFocusReviewNoRepeatNextSteps(),
  };
}

function townFocusReviewSentResult(
  input: Civ7CityTownFocusReviewInput,
  postcondition: ReviewSentPostcondition
): Extract<Civ7CityTownFocusReviewResult, { status: "sent-confirmed" | "sent-unverified" }> {
  switch (postcondition.classification) {
    case "town-focus-review-cleared":
      return {
        cityId: input.cityId,
        status: "sent-confirmed",
        postcondition,
        nextSteps: townFocusReviewRefreshNextSteps(),
      };
    case "no-state-change":
    case "missing-postcondition":
      return {
        cityId: input.cityId,
        status: "sent-unverified",
        postcondition,
        nextSteps: townFocusReviewNoRepeatNextSteps(),
      };
  }
}

function townFocusChangeRefreshNextSteps(): Extract<
  Civ7CityTownFocusChangeResult,
  { status: "already-selected" }
>["nextSteps"] {
  return [
    {
      kind: "refresh-attention",
      source: "city.townFocus.change.request",
      label: "Refresh current attention before choosing the next player action.",
    },
  ];
}

function townFocusChangeInspectNextSteps(): Extract<
  Civ7CityTownFocusChangeResult,
  { status: "not-sent" }
>["nextSteps"] {
  return [
    {
      kind: "inspect-town-focus",
      source: "city.townFocus.change.request",
      label: "Inspect the current town focus before attempting another change.",
    },
  ];
}

function townFocusChangeNoRepeatNextSteps(): Extract<
  Civ7CityTownFocusChangeResult,
  { status: "dispatch-unknown" }
>["nextSteps"] {
  return [
    {
      kind: "do-not-repeat",
      source: "city.townFocus.change.request",
      label: "Do not repeat this town focus change until fresh town state is available.",
    },
  ];
}

function townFocusReviewRefreshNextSteps(): Extract<
  Civ7CityTownFocusReviewResult,
  { status: "already-complete" }
>["nextSteps"] {
  return [
    {
      kind: "refresh-attention",
      source: "city.townFocus.review.request",
      label: "Refresh current attention before choosing the next player action.",
    },
  ];
}

function townFocusReviewInspectNextSteps(): Extract<
  Civ7CityTownFocusReviewResult,
  { status: "not-sent" }
>["nextSteps"] {
  return [
    {
      kind: "inspect-town-focus",
      source: "city.townFocus.review.request",
      label: "Inspect the current town project review before attempting another closeout.",
    },
  ];
}

function townFocusReviewNoRepeatNextSteps(): Extract<
  Civ7CityTownFocusReviewResult,
  { status: "dispatch-unknown" }
>["nextSteps"] {
  return [
    {
      kind: "do-not-repeat",
      source: "city.townFocus.review.request",
      label: "Do not repeat this town project review until fresh blocker evidence is available.",
    },
  ];
}

type TownFocusSendAttempt<Value> =
  | Readonly<{ ok: true; value: Value }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptTownFocusSend<Value>(
  send: () => Promise<Value>
): Effect.Effect<TownFocusSendAttempt<Value>> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return {
        ok: false,
        dispatchStatus: civ7DirectControlDispatchStatus(cause),
      };
    }
  });
}

function townFocusUnavailableData(
  procedureKey:
    | "city.townFocus.change.check"
    | "city.townFocus.change.request"
    | "city.townFocus.review.check"
    | "city.townFocus.review.request",
  cause: unknown,
  context: Parameters<typeof civ7ControlOrpcErrorCorrelationData>[0]
) {
  return {
    detail: civ7ControlOrpcFailureDetail(cause),
    procedureKey,
    source: "direct-control-facade" as const,
    ...civ7ControlOrpcErrorCorrelationData(context),
  };
}

function townFocusWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_TOWN_FOCUS_WAIT_MS,
    Math.max(MIN_TOWN_FOCUS_WAIT_MS, timeoutMs ?? DEFAULT_TOWN_FOCUS_WAIT_MS)
  );
}
