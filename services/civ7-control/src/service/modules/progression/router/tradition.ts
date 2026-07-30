import { Clock, Effect, Option } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcTraditionAssignmentsSnapshot,
  Civ7ControlOrpcTraditionChangeCheckResult,
  Civ7ControlOrpcTraditionChangeSendResult,
  Civ7ControlOrpcTraditionReviewCheckResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7ProgressionTraditionChangeCheckResult,
  Civ7ProgressionTraditionChangeInput,
  Civ7ProgressionTraditionChangeResult,
  Civ7ProgressionTraditionReviewCheckResult,
  Civ7ProgressionTraditionReviewResult,
} from "../contract";
import { module } from "../module";

type TraditionResult = Civ7ProgressionTraditionChangeResult | Civ7ProgressionTraditionReviewResult;
type TraditionSource =
  | "progression.tradition.change.request"
  | "progression.tradition.review.request";

export const tradition = {
  change: {
    check: module.tradition.change.check.effect(function* ({ context, errors, input }) {
      const checked = yield* Effect.tryPromise({
        try: () => checkChange(context, input),
        catch: (cause) =>
          errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.tradition.change.check", cause, context),
          }),
      });
      return changeCheckResult(input, checked);
    }),
    request: civ7ControlOrpcMutationProcedure(module.tradition.change.request).effect(function* ({
      context,
      errors,
      input,
    }) {
      const precheck = yield* Effect.tryPromise({
        try: () => checkChange(context, input),
        catch: (cause) =>
          errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.tradition.change.request", cause, context),
          }),
      });
      if (desiredAssignment(input, precheck.snapshot)) {
        return input.action === "activate"
          ? changeResult(input, "already-active", "changed")
          : changeResult(input, "already-inactive", "changed");
      }
      if (!precheck.valid) return changeResult(input, "not-sent", "not-sent");

      const sent = yield* attempt(() =>
        context.directControl.sendCiv7TraditionChange(
          {
            traditionType: input.traditionType,
            action: input.action,
            expected: precheck.snapshot,
          },
          context.endpointDefaults
        )
      ).pipe(Effect.uninterruptible);
      if (!sent.ok) {
        return changeResult(
          input,
          sent.dispatchStatus === "not-dispatched" ? "not-sent" : "dispatch-unknown",
          sent.dispatchStatus === "not-dispatched" ? "not-sent" : "unknown"
        );
      }
      if (!sent.value.sent) return changeResult(input, "not-sent", "not-sent");

      const changed = yield* pollTraditionChange(context, input, sent.value);
      if (!changed) return changeResult(input, "sent-unverified", "unchanged");
      if (input.closeReview !== true) return changeResult(input, "sent-confirmed", "changed");

      const closeout = yield* Effect.promise(() => closeTraditionReview(context));
      if (closeout === "closed") {
        return changeResult(input, "sent-confirmed", "changed-review-closed");
      }
      if (closeout === "dispatch-unknown") {
        return changeResult(input, "dispatch-unknown", "changed-review-unverified");
      }
      return changeResult(input, "sent-unverified", "changed-review-unverified");
    }),
  },
  review: {
    check: module.tradition.review.check.effect(function* ({ context, errors }) {
      const checked = yield* Effect.tryPromise({
        try: () => context.directControl.checkCiv7TraditionReview({}, context.endpointDefaults),
        catch: (cause) =>
          errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.tradition.review.check", cause, context),
          }),
      });
      return reviewCheckResult(checked);
    }),
    request: civ7ControlOrpcMutationProcedure(module.tradition.review.request).effect(function* ({
      context,
      errors,
    }) {
      const checked = yield* Effect.tryPromise({
        try: () => context.directControl.checkCiv7TraditionReview({}, context.endpointDefaults),
        catch: (cause) =>
          errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.tradition.review.request", cause, context),
          }),
      });
      if (!checked.valid) {
        return traditionReviewState(checked.snapshot) === "clear"
          ? reviewResult("already-reviewed", "review-closed")
          : reviewResult("not-sent", "not-sent");
      }
      const closed = yield* sendAndConfirmReview(context, checked);
      return closed === "closed"
        ? reviewResult("sent-confirmed", "review-closed")
        : closed === "not-sent"
          ? reviewResult("not-sent", "not-sent")
          : closed === "dispatch-unknown"
            ? reviewResult("dispatch-unknown", "unknown")
            : reviewResult("sent-unverified", "unchanged");
    }),
  },
};

function changeCheckResult(
  input: Civ7ProgressionTraditionChangeInput,
  checked: Civ7ControlOrpcTraditionChangeCheckResult
): Civ7ProgressionTraditionChangeCheckResult {
  if (desiredAssignment(input, checked.snapshot)) {
    return input.action === "activate"
      ? {
          traditionType: input.traditionType,
          action: "activate",
          status: "already-active",
        }
      : {
          traditionType: input.traditionType,
          action: "deactivate",
          status: "already-inactive",
        };
  }
  return {
    traditionType: input.traditionType,
    action: input.action,
    status: checked.valid ? "available" : "unavailable",
  };
}

function reviewCheckResult(
  checked: Civ7ControlOrpcTraditionReviewCheckResult
): Civ7ProgressionTraditionReviewCheckResult {
  return {
    status: checked.valid
      ? "available"
      : traditionReviewState(checked.snapshot) === "clear"
        ? "already-reviewed"
        : "unavailable",
  };
}

function changeResult(
  input: Civ7ProgressionTraditionChangeInput,
  status: Civ7ProgressionTraditionChangeResult["status"],
  evidence:
    | "not-sent"
    | "unknown"
    | "unchanged"
    | "changed"
    | "changed-review-closed"
    | "changed-review-unverified"
): Civ7ProgressionTraditionChangeResult {
  const base = { traditionType: input.traditionType, action: input.action };
  switch (status) {
    case "not-sent":
      return {
        ...base,
        status,
        postcondition: traditionPostcondition("not-sent"),
        nextSteps: traditionInspectSteps("progression.tradition.change.request"),
      };
    case "already-active":
      return {
        ...base,
        action: "activate",
        status,
        postcondition: traditionPostcondition("changed"),
        nextSteps: traditionRefreshSteps("progression.tradition.change.request"),
      };
    case "already-inactive":
      return {
        ...base,
        action: "deactivate",
        status,
        postcondition: traditionPostcondition("changed"),
        nextSteps: traditionRefreshSteps("progression.tradition.change.request"),
      };
    case "dispatch-unknown":
      return {
        ...base,
        status,
        postcondition:
          evidence === "changed-review-unverified"
            ? traditionPostcondition("changed-review-unverified")
            : traditionPostcondition("unknown"),
        nextSteps: traditionNoRepeatSteps("progression.tradition.change.request"),
      };
    case "sent-confirmed":
      return {
        ...base,
        status,
        postcondition:
          evidence === "changed-review-closed"
            ? traditionPostcondition("changed-review-closed")
            : traditionPostcondition("changed"),
        nextSteps: traditionRefreshSteps("progression.tradition.change.request"),
      };
    case "sent-unverified":
      return {
        ...base,
        status,
        postcondition:
          evidence === "changed-review-unverified"
            ? traditionPostcondition("changed-review-unverified")
            : traditionPostcondition("change-unchanged"),
        nextSteps: traditionNoRepeatSteps("progression.tradition.change.request"),
      };
  }
}

function reviewResult(
  status: Civ7ProgressionTraditionReviewResult["status"],
  evidence: "not-sent" | "unknown" | "unchanged" | "review-closed"
): Civ7ProgressionTraditionReviewResult {
  switch (status) {
    case "not-sent":
      return {
        status,
        postcondition: traditionPostcondition("not-sent"),
        nextSteps: traditionInspectSteps("progression.tradition.review.request"),
      };
    case "already-reviewed":
      return {
        status,
        postcondition: traditionPostcondition("review-closed"),
        nextSteps: traditionRefreshSteps("progression.tradition.review.request"),
      };
    case "sent-confirmed":
      return {
        status,
        postcondition: traditionPostcondition("review-closed"),
        nextSteps: traditionRefreshSteps("progression.tradition.review.request"),
      };
    case "dispatch-unknown":
      return {
        status,
        postcondition: traditionPostcondition("unknown"),
        nextSteps: traditionNoRepeatSteps("progression.tradition.review.request"),
      };
    case "sent-unverified":
      return {
        status,
        postcondition: traditionPostcondition("review-unchanged"),
        nextSteps: traditionNoRepeatSteps("progression.tradition.review.request"),
      };
  }
}

function traditionPostcondition(
  evidence: "changed"
): Extract<TraditionResult["postcondition"], { classification: "tradition-changed" }>;
function traditionPostcondition(
  evidence: "changed-review-closed"
): Extract<TraditionResult["postcondition"], { classification: "tradition-changed-review-closed" }>;
function traditionPostcondition(
  evidence: "changed-review-unverified"
): Extract<
  TraditionResult["postcondition"],
  { classification: "tradition-changed-review-unverified" }
>;
function traditionPostcondition(
  evidence: "change-unchanged" | "review-unchanged"
): Extract<TraditionResult["postcondition"], { classification: "no-state-change" }>;
function traditionPostcondition(
  evidence: "review-closed"
): Extract<
  Civ7ProgressionTraditionReviewResult,
  { status: "sent-confirmed" | "already-reviewed" }
>["postcondition"];
function traditionPostcondition(
  evidence: "not-sent"
): Extract<TraditionResult, { status: "not-sent" }>["postcondition"];
function traditionPostcondition(
  evidence: "unknown"
): Extract<TraditionResult["postcondition"], { classification: "missing-postcondition" }>;
function traditionPostcondition(
  evidence:
    | "not-sent"
    | "unknown"
    | "unchanged"
    | "change-unchanged"
    | "review-unchanged"
    | "changed"
    | "review-closed"
    | "changed-review-closed"
    | "changed-review-unverified"
): TraditionResult["postcondition"] {
  switch (evidence) {
    case "changed":
      return confirmed("tradition-changed", "changed", "The desired active set is observed.");
    case "review-closed":
      return confirmed("review-closed", "review-closed", "Fresh review admission is closed.");
    case "changed-review-closed":
      return confirmed(
        "tradition-changed-review-closed",
        "changed",
        "The desired active set and fresh review closeout are confirmed."
      );
    case "changed-review-unverified":
      return unverified(
        "tradition-changed-review-unverified",
        "changed-partial",
        "The tradition change is confirmed, but optional review closeout is unverified."
      );
    case "not-sent":
      return unverified("not-sent", "not-sent", "Fresh admission did not dispatch the request.");
    case "unchanged":
    case "change-unchanged":
    case "review-unchanged":
      return unverified(
        "no-state-change",
        "no-state-change",
        "Fresh active-set evidence did not confirm the requested change."
      );
    case "unknown":
      return unverified(
        "missing-postcondition",
        "unknown",
        "Dispatch may have occurred, but focused postcondition evidence is unavailable."
      );
  }
}

function confirmed<
  const Classification extends
    | "tradition-changed"
    | "tradition-changed-review-closed"
    | "review-closed",
  const Outcome extends "changed" | "review-closed",
>(classification: Classification, outcome: Outcome, reason: string) {
  return {
    classification,
    reason,
    outcome,
    confidence: "confirmed" as const,
    confirmed: true as const,
    noRepeatAfterUnverified: false as const,
  };
}

function unverified<
  const Classification extends
    | "not-sent"
    | "tradition-changed-review-unverified"
    | "no-state-change"
    | "missing-postcondition",
  const Outcome extends "not-sent" | "changed-partial" | "no-state-change" | "unknown",
>(classification: Classification, outcome: Outcome, reason: string) {
  return {
    classification,
    reason,
    outcome,
    confidence: "unverified" as const,
    confirmed: false as const,
    noRepeatAfterUnverified: true as const,
  };
}

function traditionRefreshSteps<const Source extends TraditionSource>(source: Source) {
  return [
    {
      kind: "refresh-attention" as const,
      source,
      label: "Refresh current attention before choosing the next player action.",
    },
  ];
}
function traditionInspectSteps<const Source extends TraditionSource>(source: Source) {
  return [
    {
      kind: "inspect-progression-tradition" as const,
      source,
      label: "Inspect fresh tradition state before another request.",
    },
  ];
}
function traditionNoRepeatSteps<const Source extends TraditionSource>(source: Source) {
  return [
    {
      kind: "do-not-repeat" as const,
      source,
      label: "Do not repeat until fresh tradition assignment evidence is readable.",
    },
  ];
}

function checkChange(context: Civ7ControlOrpcContext, input: Civ7ProgressionTraditionChangeInput) {
  return context.directControl.checkCiv7TraditionChange(
    { traditionType: input.traditionType, action: input.action },
    context.endpointDefaults
  );
}

function desiredAssignment(
  input: Civ7ProgressionTraditionChangeInput,
  snapshot: Civ7ControlOrpcTraditionAssignmentsSnapshot
) {
  const active = snapshot.activeTraditions.includes(input.traditionType);
  return input.action === "activate" ? active : !active;
}

function pollTraditionChange(
  context: Civ7ControlOrpcContext,
  input: Civ7ProgressionTraditionChangeInput,
  sent: Extract<Civ7ControlOrpcTraditionChangeSendResult, { sent: true }>
): Effect.Effect<boolean> {
  if (desiredAssignment(input, sent.after)) return Effect.succeed(true);
  return Effect.gen(function* () {
    const deadline = (yield* Clock.currentTimeMillis) + waitMs(context);
    while (true) {
      const now = yield* Clock.currentTimeMillis;
      if (now >= deadline) return false;
      yield* Effect.sleep(Math.min(250, deadline - now));
      const remaining = Math.max(1, deadline - (yield* Clock.currentTimeMillis));
      const observed = yield* Effect.tryPromise(() =>
        context.directControl.observeCiv7TraditionAssignments({
          ...context.endpointDefaults,
          timeoutMs: remaining,
        })
      ).pipe(Effect.option, Effect.timeoutOption(remaining));
      if (
        Option.isSome(observed) &&
        Option.isSome(observed.value) &&
        desiredAssignment(input, observed.value.value)
      ) {
        return true;
      }
    }
  });
}

async function closeTraditionReview(
  context: Civ7ControlOrpcContext
): Promise<"closed" | "not-sent" | "unverified" | "dispatch-unknown"> {
  try {
    const checked = await context.directControl.checkCiv7TraditionReview(
      {},
      context.endpointDefaults
    );
    if (!checked.valid) {
      return traditionReviewState(checked.snapshot) === "clear" ? "closed" : "unverified";
    }
    return await Effect.runPromise(sendAndConfirmReview(context, checked));
  } catch {
    return "unverified";
  }
}

function sendAndConfirmReview(
  context: Civ7ControlOrpcContext,
  checked: Civ7ControlOrpcTraditionReviewCheckResult
): Effect.Effect<"closed" | "not-sent" | "unverified" | "dispatch-unknown"> {
  return Effect.gen(function* () {
    const sent = yield* attempt(() =>
      context.directControl.sendCiv7TraditionReview(
        { expected: checked.snapshot },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!sent.ok) {
      return sent.dispatchStatus === "not-dispatched" ? "not-sent" : "dispatch-unknown";
    }
    if (!sent.value.sent) return "not-sent";
    return (yield* pollTraditionReviewClearance(context)) ? "closed" : "unverified";
  });
}

function pollTraditionReviewClearance(context: Civ7ControlOrpcContext): Effect.Effect<boolean> {
  return Effect.gen(function* () {
    const deadline = (yield* Clock.currentTimeMillis) + waitMs(context);
    while (true) {
      const now = yield* Clock.currentTimeMillis;
      if (now >= deadline) return false;
      yield* Effect.sleep(Math.min(250, deadline - now));
      const remaining = Math.max(1, deadline - (yield* Clock.currentTimeMillis));
      const fresh = yield* Effect.tryPromise(() =>
        context.directControl.checkCiv7TraditionReview(
          {},
          { ...context.endpointDefaults, timeoutMs: remaining }
        )
      ).pipe(Effect.option, Effect.timeoutOption(remaining));
      if (
        Option.isSome(fresh) &&
        Option.isSome(fresh.value) &&
        !fresh.value.value.valid &&
        traditionReviewState(fresh.value.value.snapshot) === "clear"
      ) {
        return true;
      }
    }
  });
}

function traditionReviewState(
  snapshot: Civ7ControlOrpcTraditionReviewCheckResult["snapshot"]
): "present" | "clear" | "unknown" {
  if (!snapshot.blocker.ok || !snapshot.blockingNotification.ok) return "unknown";
  const blockerState = blockerReadingState(snapshot.blocker.value);
  if (blockerState === "unknown") return "unknown";
  const notification = snapshot.blockingNotification.value;
  if (blockerState === "clear") return notification === null ? "clear" : "unknown";
  if (
    notification === null ||
    notification.typeName === null ||
    !validNotificationIdentity(snapshot.localPlayerId, notification.id)
  ) {
    return "unknown";
  }
  return notification.typeName.toUpperCase().includes("TRADITION") ? "present" : "clear";
}

function blockerReadingState(value: number | string | null): "clear" | "live" | "unknown" {
  if (value === null || value === 0 || value === "0") return "clear";
  if (
    Number.isInteger(value) ||
    (typeof value === "string" && value.trim().length > 0 && value.trim() !== "0")
  ) {
    return "live";
  }
  return "unknown";
}

function validNotificationIdentity(
  localPlayerId: number,
  id: Readonly<{ owner: number; id: number }>
): boolean {
  return (
    Number.isInteger(localPlayerId) &&
    localPlayerId >= 0 &&
    id.owner === localPlayerId &&
    Number.isInteger(id.id)
  );
}

type Attempt<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attempt<T>(send: () => Promise<T>): Effect.Effect<Attempt<T>> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function waitMs(context: Civ7ControlOrpcContext) {
  return Math.min(6_000, Math.max(1_000, context.endpointDefaults?.timeoutMs ?? 3_000));
}

function unavailableData(
  procedureKey:
    | "progression.tradition.change.check"
    | "progression.tradition.change.request"
    | "progression.tradition.review.check"
    | "progression.tradition.review.request",
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
