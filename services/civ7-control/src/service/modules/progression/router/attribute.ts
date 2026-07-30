import { Clock, Effect, Option } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcAttributeNodeSnapshot,
  Civ7ControlOrpcAttributePurchaseCheckResult,
  Civ7ControlOrpcAttributePurchaseSendResult,
  Civ7ControlOrpcAttributeReviewCheckResult,
  Civ7ControlOrpcCommandDispatchStatus,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7ProgressionAttributePurchaseCheckResult,
  Civ7ProgressionAttributePurchaseInput,
  Civ7ProgressionAttributePurchaseResult,
  Civ7ProgressionAttributeReviewCheckResult,
  Civ7ProgressionAttributeReviewResult,
} from "../contract";
import { module } from "../module";

type AttributeResult =
  | Civ7ProgressionAttributePurchaseResult
  | Civ7ProgressionAttributeReviewResult;
type AttributeSource =
  | "progression.attribute.purchase.request"
  | "progression.attribute.review.request";

export const attribute = {
  purchase: {
    check: module.attribute.purchase.check.effect(function* ({ context, errors, input }) {
      const checked = yield* Effect.tryPromise({
        try: () => checkPurchase(context, input),
        catch: (cause) =>
          errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.attribute.purchase.check", cause, context),
          }),
      });
      return purchaseCheckResult(input, checked);
    }),
    request: civ7ControlOrpcMutationProcedure(module.attribute.purchase.request).effect(function* ({
      context,
      errors,
      input,
    }) {
      const precheck = yield* Effect.tryPromise({
        try: () => checkPurchase(context, input),
        catch: (cause) =>
          errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.attribute.purchase.request", cause, context),
          }),
      });
      if (!precheck.valid) {
        return attributeNodeAlreadyPurchased(precheck.snapshot)
          ? purchaseResult(input, "already-purchased", "purchased")
          : purchaseResult(input, "not-sent", "not-sent");
      }

      const sent = yield* attempt(() =>
        context.directControl.sendCiv7AttributePurchase(
          { node: input.node, expected: precheck.snapshot },
          context.endpointDefaults
        )
      ).pipe(Effect.uninterruptible);
      if (!sent.ok) {
        return purchaseResult(
          input,
          sent.dispatchStatus === "not-dispatched" ? "not-sent" : "dispatch-unknown",
          sent.dispatchStatus === "not-dispatched" ? "not-sent" : "unknown"
        );
      }
      if (!sent.value.sent) return purchaseResult(input, "not-sent", "not-sent");

      const purchased = yield* pollAttributeTransition(context, input, sent.value);
      if (!purchased) return purchaseResult(input, "sent-unverified", "unchanged");
      if (input.closeReview !== true) {
        return purchaseResult(input, "sent-confirmed", "purchased");
      }

      const closeout = yield* Effect.promise(() => closeAttributeReview(context));
      if (closeout === "closed") {
        return purchaseResult(input, "sent-confirmed", "purchased-review-closed");
      }
      if (closeout === "dispatch-unknown") {
        return purchaseResult(input, "dispatch-unknown", "purchased-review-unverified");
      }
      return purchaseResult(input, "sent-unverified", "purchased-review-unverified");
    }),
  },
  review: {
    check: module.attribute.review.check.effect(function* ({ context, errors }) {
      const checked = yield* Effect.tryPromise({
        try: () => context.directControl.checkCiv7AttributeReview({}, context.endpointDefaults),
        catch: (cause) =>
          errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.attribute.review.check", cause, context),
          }),
      });
      return reviewCheckResult(checked);
    }),
    request: civ7ControlOrpcMutationProcedure(module.attribute.review.request).effect(function* ({
      context,
      errors,
    }) {
      const checked = yield* Effect.tryPromise({
        try: () => context.directControl.checkCiv7AttributeReview({}, context.endpointDefaults),
        catch: (cause) =>
          errors.PROGRESSION_PLAYER_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.attribute.review.request", cause, context),
          }),
      });
      if (!checked.valid) {
        return attributeReviewState(checked.snapshot) === "clear"
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

function purchaseCheckResult(
  input: Civ7ProgressionAttributePurchaseInput,
  checked: Civ7ControlOrpcAttributePurchaseCheckResult
): Civ7ProgressionAttributePurchaseCheckResult {
  return {
    node: input.node,
    status: checked.valid
      ? "available"
      : attributeNodeAlreadyPurchased(checked.snapshot)
        ? "already-purchased"
        : "unavailable",
  };
}

function reviewCheckResult(
  checked: Civ7ControlOrpcAttributeReviewCheckResult
): Civ7ProgressionAttributeReviewCheckResult {
  return {
    status: checked.valid
      ? "available"
      : attributeReviewState(checked.snapshot) === "clear"
        ? "already-reviewed"
        : "unavailable",
  };
}

function purchaseResult(
  input: Civ7ProgressionAttributePurchaseInput,
  status: Civ7ProgressionAttributePurchaseResult["status"],
  evidence:
    | "not-sent"
    | "unknown"
    | "unchanged"
    | "purchased"
    | "purchased-review-closed"
    | "purchased-review-unverified"
): Civ7ProgressionAttributePurchaseResult {
  const base = { node: input.node };
  switch (status) {
    case "not-sent":
      return {
        ...base,
        status,
        postcondition: attributePostcondition("not-sent"),
        nextSteps: attributeInspectSteps("progression.attribute.purchase.request"),
      };
    case "already-purchased":
      return {
        ...base,
        status,
        postcondition: attributePostcondition("purchased"),
        nextSteps: attributeRefreshSteps("progression.attribute.purchase.request"),
      };
    case "dispatch-unknown":
      return {
        ...base,
        status,
        postcondition:
          evidence === "purchased-review-unverified"
            ? attributePostcondition("purchased-review-unverified")
            : attributePostcondition("unknown"),
        nextSteps: attributeNoRepeatSteps("progression.attribute.purchase.request"),
      };
    case "sent-confirmed":
      return {
        ...base,
        status,
        postcondition:
          evidence === "purchased-review-closed"
            ? attributePostcondition("purchased-review-closed")
            : attributePostcondition("purchased"),
        nextSteps: attributeRefreshSteps("progression.attribute.purchase.request"),
      };
    case "sent-unverified":
      return {
        ...base,
        status,
        postcondition:
          evidence === "purchased-review-unverified"
            ? attributePostcondition("purchased-review-unverified")
            : attributePostcondition("purchase-unchanged"),
        nextSteps: attributeNoRepeatSteps("progression.attribute.purchase.request"),
      };
  }
}

function reviewResult(
  status: Civ7ProgressionAttributeReviewResult["status"],
  evidence: "not-sent" | "unknown" | "unchanged" | "review-closed"
): Civ7ProgressionAttributeReviewResult {
  switch (status) {
    case "not-sent":
      return {
        status,
        postcondition: attributePostcondition("not-sent"),
        nextSteps: attributeInspectSteps("progression.attribute.review.request"),
      };
    case "already-reviewed":
      return {
        status,
        postcondition: attributePostcondition("review-closed"),
        nextSteps: attributeRefreshSteps("progression.attribute.review.request"),
      };
    case "sent-confirmed":
      return {
        status,
        postcondition: attributePostcondition("review-closed"),
        nextSteps: attributeRefreshSteps("progression.attribute.review.request"),
      };
    case "dispatch-unknown":
      return {
        status,
        postcondition: attributePostcondition("unknown"),
        nextSteps: attributeNoRepeatSteps("progression.attribute.review.request"),
      };
    case "sent-unverified":
      return {
        status,
        postcondition: attributePostcondition("review-unchanged"),
        nextSteps: attributeNoRepeatSteps("progression.attribute.review.request"),
      };
  }
}

function attributePostcondition(
  evidence: "purchased"
): Extract<AttributeResult["postcondition"], { classification: "attribute-purchased" }>;
function attributePostcondition(
  evidence: "purchased-review-closed"
): Extract<
  AttributeResult["postcondition"],
  { classification: "attribute-purchased-review-closed" }
>;
function attributePostcondition(
  evidence: "purchased-review-unverified"
): Extract<
  AttributeResult["postcondition"],
  { classification: "attribute-purchased-review-unverified" }
>;
function attributePostcondition(
  evidence: "purchase-unchanged" | "review-unchanged"
): Extract<AttributeResult["postcondition"], { classification: "no-state-change" }>;
function attributePostcondition(
  evidence: "review-closed"
): Extract<
  Civ7ProgressionAttributeReviewResult,
  { status: "sent-confirmed" | "already-reviewed" }
>["postcondition"];
function attributePostcondition(
  evidence: "not-sent"
): Extract<AttributeResult, { status: "not-sent" }>["postcondition"];
function attributePostcondition(
  evidence: "unknown"
): Extract<AttributeResult["postcondition"], { classification: "missing-postcondition" }>;
function attributePostcondition(
  evidence:
    | "not-sent"
    | "unknown"
    | "unchanged"
    | "purchase-unchanged"
    | "review-unchanged"
    | "purchased"
    | "review-closed"
    | "purchased-review-closed"
    | "purchased-review-unverified"
): AttributeResult["postcondition"] {
  switch (evidence) {
    case "purchased":
      return confirmed("attribute-purchased", "purchased", "The focused attribute node changed.");
    case "review-closed":
      return confirmed("review-closed", "review-closed", "Fresh review admission is closed.");
    case "purchased-review-closed":
      return confirmed(
        "attribute-purchased-review-closed",
        "purchased",
        "The focused node changed and fresh review closeout completed."
      );
    case "purchased-review-unverified":
      return unverified(
        "attribute-purchased-review-unverified",
        "purchased-partial",
        "The attribute purchase is confirmed, but optional review closeout is unverified."
      );
    case "not-sent":
      return unverified("not-sent", "not-sent", "Fresh admission did not dispatch the request.");
    case "unchanged":
    case "purchase-unchanged":
    case "review-unchanged":
      return unverified(
        "no-state-change",
        "no-state-change",
        "Fresh focused evidence did not confirm a state transition."
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
    | "attribute-purchased"
    | "attribute-purchased-review-closed"
    | "review-closed",
  const Outcome extends "purchased" | "review-closed",
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
    | "attribute-purchased-review-unverified"
    | "no-state-change"
    | "missing-postcondition",
  const Outcome extends "not-sent" | "purchased-partial" | "no-state-change" | "unknown",
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

function attributeRefreshSteps<const Source extends AttributeSource>(source: Source) {
  return [
    {
      kind: "refresh-attention" as const,
      source,
      label: "Refresh current attention before choosing the next player action.",
    },
  ];
}
function attributeInspectSteps<const Source extends AttributeSource>(source: Source) {
  return [
    {
      kind: "inspect-progression-attribute" as const,
      source,
      label: "Inspect fresh attribute state before another request.",
    },
  ];
}
function attributeNoRepeatSteps<const Source extends AttributeSource>(source: Source) {
  return [
    {
      kind: "do-not-repeat" as const,
      source,
      label: "Do not repeat until fresh focused attribute evidence is readable.",
    },
  ];
}

function checkPurchase(
  context: Civ7ControlOrpcContext,
  input: Civ7ProgressionAttributePurchaseInput
) {
  return context.directControl.checkCiv7AttributePurchase(
    { node: input.node },
    context.endpointDefaults
  );
}

function pollAttributeTransition(
  context: Civ7ControlOrpcContext,
  input: Civ7ProgressionAttributePurchaseInput,
  sent: Extract<Civ7ControlOrpcAttributePurchaseSendResult, { sent: true }>
): Effect.Effect<boolean> {
  if (attributeNodeTransitioned(sent.before, sent.after)) return Effect.succeed(true);
  return Effect.gen(function* () {
    const deadline = (yield* Clock.currentTimeMillis) + waitMs(context);
    while (true) {
      const now = yield* Clock.currentTimeMillis;
      if (now >= deadline) return false;
      yield* Effect.sleep(Math.min(250, deadline - now));
      const remaining = Math.max(1, deadline - (yield* Clock.currentTimeMillis));
      const observed = yield* Effect.tryPromise(() =>
        context.directControl.observeCiv7AttributeNode(
          { node: input.node },
          { ...context.endpointDefaults, timeoutMs: remaining }
        )
      ).pipe(Effect.option, Effect.timeoutOption(remaining));
      if (
        Option.isSome(observed) &&
        Option.isSome(observed.value) &&
        attributeNodeTransitioned(sent.before, observed.value.value)
      ) {
        return true;
      }
    }
  });
}

async function closeAttributeReview(
  context: Civ7ControlOrpcContext
): Promise<"closed" | "not-sent" | "unverified" | "dispatch-unknown"> {
  try {
    const checked = await context.directControl.checkCiv7AttributeReview(
      {},
      context.endpointDefaults
    );
    if (!checked.valid) {
      return attributeReviewState(checked.snapshot) === "clear" ? "closed" : "unverified";
    }
    return await Effect.runPromise(sendAndConfirmReview(context, checked));
  } catch {
    return "unverified";
  }
}

function sendAndConfirmReview(
  context: Civ7ControlOrpcContext,
  checked: Civ7ControlOrpcAttributeReviewCheckResult
): Effect.Effect<"closed" | "not-sent" | "unverified" | "dispatch-unknown"> {
  return Effect.gen(function* () {
    const sent = yield* attempt(() =>
      context.directControl.sendCiv7AttributeReview(
        { expected: checked.snapshot },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!sent.ok) {
      return sent.dispatchStatus === "not-dispatched" ? "not-sent" : "dispatch-unknown";
    }
    if (!sent.value.sent) return "not-sent";
    return (yield* pollAttributeReviewClearance(context)) ? "closed" : "unverified";
  });
}

function pollAttributeReviewClearance(context: Civ7ControlOrpcContext): Effect.Effect<boolean> {
  return Effect.gen(function* () {
    const deadline = (yield* Clock.currentTimeMillis) + waitMs(context);
    while (true) {
      const now = yield* Clock.currentTimeMillis;
      if (now >= deadline) return false;
      yield* Effect.sleep(Math.min(250, deadline - now));
      const remaining = Math.max(1, deadline - (yield* Clock.currentTimeMillis));
      const fresh = yield* Effect.tryPromise(() =>
        context.directControl.checkCiv7AttributeReview(
          {},
          { ...context.endpointDefaults, timeoutMs: remaining }
        )
      ).pipe(Effect.option, Effect.timeoutOption(remaining));
      if (
        Option.isSome(fresh) &&
        Option.isSome(fresh.value) &&
        !fresh.value.value.valid &&
        attributeReviewState(fresh.value.value.snapshot) === "clear"
      ) {
        return true;
      }
    }
  });
}

function attributeNodeTransitioned(
  left: Civ7ControlOrpcAttributeNodeSnapshot,
  right: Civ7ControlOrpcAttributeNodeSnapshot
) {
  return (
    left.nodeState !== right.nodeState ||
    increased(left.depthUnlocked, right.depthUnlocked) ||
    increased(left.repeatedDepth, right.repeatedDepth)
  );
}

function attributeNodeAlreadyPurchased(snapshot: Civ7ControlOrpcAttributeNodeSnapshot) {
  return (
    snapshot.depthUnlocked !== null &&
    snapshot.depthUnlocked > 0 &&
    (snapshot.repeatedDepth ?? 0) === 0
  );
}

function increased(before: number | null, after: number | null) {
  return before !== null && after !== null && after > before;
}

function attributeReviewState(
  snapshot: Civ7ControlOrpcAttributeReviewCheckResult["snapshot"]
): "present" | "clear" | "unknown" {
  return reviewBlockerState(snapshot, "ATTRIBUTE");
}

function reviewBlockerState(
  snapshot: Civ7ControlOrpcAttributeReviewCheckResult["snapshot"],
  token: string
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
  const typeName = notification.typeName.toUpperCase();
  if (typeName.includes(token)) return "present";
  return "clear";
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
    | "progression.attribute.purchase.check"
    | "progression.attribute.purchase.request"
    | "progression.attribute.review.check"
    | "progression.attribute.review.request",
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
