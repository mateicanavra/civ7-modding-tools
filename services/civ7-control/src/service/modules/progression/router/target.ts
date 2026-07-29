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
  Civ7ControlOrpcProgressionTreeCheckResult,
  Civ7ControlOrpcProgressionTreeSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7ProgressionCultureTargetResult,
  Civ7ProgressionTargetCheckResult,
  Civ7ProgressionTargetInput,
  Civ7ProgressionTechnologyTargetResult,
} from "../contract";
import { module } from "../module";

type TreeKind = "technology" | "culture";
type TargetSource = "progression.technology.target.request" | "progression.culture.target.request";
type TargetProcedureKey =
  | TargetSource
  | "progression.technology.target.check"
  | "progression.culture.target.check";
type TargetResult = Civ7ProgressionTechnologyTargetResult | Civ7ProgressionCultureTargetResult;
type TargetEvidence =
  | "not-sent"
  | "already-selected"
  | "unknown"
  | "choice-only"
  | "confirmed"
  | "unchanged";
type TargetResultFactory<Result extends TargetResult> = (
  input: Civ7ProgressionTargetInput,
  status: Result["status"],
  evidence: TargetEvidence
) => Result;

export const target = {
  technology: {
    check: module.technology.target.check.effect(function* ({ context, errors, input }) {
      const checked = yield* Effect.tryPromise({
        try: () => checkTarget(context, "technology", input),
        catch: (cause) =>
          errors.PROGRESSION_TARGET_UNAVAILABLE({
            data: unavailableData("progression.technology.target.check", cause, context),
          }),
      });
      return targetCheckResult(input, checked);
    }),
    request: civ7ControlOrpcMutationProcedure(module.technology.target.request).effect(function* ({
      context,
      errors,
      input,
    }) {
      return yield* targetRequest({
        context,
        input,
        kind: "technology",
        result: technologyTargetResult,
        onPrecheckFailure: (cause) =>
          errors.PROGRESSION_TARGET_UNAVAILABLE({
            data: unavailableData("progression.technology.target.request", cause, context),
          }),
      });
    }),
  },
  culture: {
    check: module.culture.target.check.effect(function* ({ context, errors, input }) {
      const checked = yield* Effect.tryPromise({
        try: () => checkTarget(context, "culture", input),
        catch: (cause) =>
          errors.PROGRESSION_TARGET_UNAVAILABLE({
            data: unavailableData("progression.culture.target.check", cause, context),
          }),
      });
      return targetCheckResult(input, checked);
    }),
    request: civ7ControlOrpcMutationProcedure(module.culture.target.request).effect(function* ({
      context,
      errors,
      input,
    }) {
      return yield* targetRequest({
        context,
        input,
        kind: "culture",
        result: cultureTargetResult,
        onPrecheckFailure: (cause) =>
          errors.PROGRESSION_TARGET_UNAVAILABLE({
            data: unavailableData("progression.culture.target.request", cause, context),
          }),
      });
    }),
  },
};

function targetRequest<Result extends TargetResult, E>(
  options: Readonly<{
    context: Civ7ControlOrpcContext;
    input: Civ7ProgressionTargetInput;
    kind: TreeKind;
    result: TargetResultFactory<Result>;
    onPrecheckFailure: (cause: unknown) => E;
  }>
): Effect.Effect<Result, E> {
  return Effect.gen(function* () {
    let targetCheck = yield* Effect.tryPromise({
      try: () => checkTarget(options.context, options.kind, options.input),
      catch: options.onPrecheckFailure,
    });
    if (targetCheck.snapshot.targetNode === options.input.node) {
      return options.result(options.input, "already-selected", "already-selected");
    }
    if (!targetCheck.valid) {
      return options.result(options.input, "not-sent", "not-sent");
    }

    let choiceDispatched = false;
    const choiceCheck = yield* Effect.tryPromise({
      try: () => checkChoice(options.context, options.kind, options.input),
      catch: options.onPrecheckFailure,
    });
    if (choiceCheck.valid) {
      const choiceSend = yield* attempt(() =>
        options.context.directControl.sendCiv7ProgressionTreeChoice(
          {
            kind: options.kind,
            node: options.input.node,
            expected: choiceCheck.snapshot,
          },
          options.context.endpointDefaults
        )
      ).pipe(Effect.uninterruptible);
      if (!choiceSend.ok) {
        return options.result(
          options.input,
          choiceSend.dispatchStatus === "not-dispatched" ? "not-sent" : "dispatch-unknown",
          choiceSend.dispatchStatus === "not-dispatched" ? "not-sent" : "unknown"
        );
      }
      choiceDispatched = choiceSend.value.sent;
    }

    const freshTarget = yield* Effect.tryPromise(() =>
      checkTarget(options.context, options.kind, options.input)
    ).pipe(Effect.option);
    if (Option.isNone(freshTarget) || !freshTarget.value.valid) {
      return options.result(
        options.input,
        choiceDispatched ? "sent-unverified" : "not-sent",
        choiceDispatched ? "choice-only" : "not-sent"
      );
    }
    targetCheck = freshTarget.value;

    const targetSend = yield* attempt(() =>
      options.context.directControl.sendCiv7ProgressionTreeTarget(
        {
          kind: options.kind,
          node: options.input.node,
          expected: targetCheck.snapshot,
        },
        options.context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!targetSend.ok) {
      if (targetSend.dispatchStatus !== "not-dispatched") {
        return options.result(options.input, "dispatch-unknown", "unknown");
      }
      return options.result(
        options.input,
        choiceDispatched ? "sent-unverified" : "not-sent",
        choiceDispatched ? "choice-only" : "not-sent"
      );
    }
    if (!targetSend.value.sent) {
      return options.result(
        options.input,
        choiceDispatched ? "sent-unverified" : "not-sent",
        choiceDispatched ? "choice-only" : "not-sent"
      );
    }

    const confirmed = yield* pollTarget(
      options.context,
      options.kind,
      options.input,
      targetSend.value
    );
    return options.result(
      options.input,
      confirmed ? "sent-confirmed" : "sent-unverified",
      confirmed ? "confirmed" : "unchanged"
    );
  });
}

function targetCheckResult(
  input: Civ7ProgressionTargetInput,
  target: Civ7ControlOrpcProgressionTreeCheckResult
): Civ7ProgressionTargetCheckResult {
  return {
    node: input.node,
    status:
      target.snapshot.targetNode === input.node
        ? "already-selected"
        : target.valid
          ? "available"
          : "unavailable",
  };
}

function technologyTargetResult(
  input: Civ7ProgressionTargetInput,
  status: Civ7ProgressionTechnologyTargetResult["status"],
  evidence: TargetEvidence
): Civ7ProgressionTechnologyTargetResult {
  return targetResult("progression.technology.target.request", input, status, evidence);
}

function cultureTargetResult(
  input: Civ7ProgressionTargetInput,
  status: Civ7ProgressionCultureTargetResult["status"],
  evidence: TargetEvidence
): Civ7ProgressionCultureTargetResult {
  return targetResult("progression.culture.target.request", input, status, evidence);
}

function targetResult<const Source extends TargetSource>(
  source: Source,
  input: Civ7ProgressionTargetInput,
  status: TargetResult["status"],
  evidence: TargetEvidence
) {
  const notSent = () => ({
    classification: "not-sent" as const,
    reason: "Fresh native admission did not dispatch a progression mutation.",
    outcome: "not-sent" as const,
    confidence: "unverified" as const,
    confirmed: false as const,
    noRepeatAfterUnverified: true as const,
  });
  const confirmed = () => ({
    classification: "target-selected" as const,
    reason: "Fresh progression state confirms the requested target.",
    outcome: "selected" as const,
    confidence: "confirmed" as const,
    confirmed: true as const,
    noRepeatAfterUnverified: false as const,
  });
  const partial = () => ({
    classification: "choice-selected-target-not-sent" as const,
    reason:
      "The service dispatched the prerequisite same-node choice, but could not confirm target dispatch.",
    outcome: "selected-partial" as const,
    confidence: "unverified" as const,
    confirmed: false as const,
    noRepeatAfterUnverified: true as const,
  });
  const unchanged = () => ({
    classification: "no-state-change" as const,
    reason: "Fresh progression state did not confirm the requested target.",
    outcome: "no-state-change" as const,
    confidence: "unverified" as const,
    confirmed: false as const,
    noRepeatAfterUnverified: true as const,
  });
  const unknown = () => ({
    classification: "missing-postcondition" as const,
    reason: "Dispatch may have occurred, but no reliable postcondition is available.",
    outcome: "unknown" as const,
    confidence: "unverified" as const,
    confirmed: false as const,
    noRepeatAfterUnverified: true as const,
  });
  switch (status) {
    case "not-sent":
      return {
        node: input.node,
        status,
        postcondition: notSent(),
        nextSteps: targetInspectSteps(source),
      };
    case "already-selected":
      return {
        node: input.node,
        status,
        postcondition: confirmed(),
        nextSteps: targetRefreshSteps(source),
      };
    case "sent-confirmed":
      return {
        node: input.node,
        status,
        postcondition: confirmed(),
        nextSteps: targetRefreshSteps(source),
      };
    case "dispatch-unknown":
      return {
        node: input.node,
        status,
        postcondition: unknown(),
        nextSteps: targetNoRepeatSteps(source),
      };
    case "sent-unverified":
      return {
        node: input.node,
        status,
        postcondition: evidence === "choice-only" ? partial() : unchanged(),
        nextSteps: targetNoRepeatSteps(source),
      };
  }
}

function targetInspectSteps<const Source extends TargetSource>(
  source: Source
): Array<{ kind: "inspect-progression-target"; source: Source; label: string }> {
  return [
    {
      kind: "inspect-progression-target",
      source,
      label: "Inspect fresh target availability before another request.",
    },
  ];
}

function targetRefreshSteps<const Source extends TargetSource>(
  source: Source
): Array<{ kind: "refresh-attention"; source: Source; label: string }> {
  return [
    {
      kind: "refresh-attention",
      source,
      label: "Refresh current attention before choosing the next player action.",
    },
  ];
}

function targetNoRepeatSteps<const Source extends TargetSource>(
  source: Source
): Array<{ kind: "do-not-repeat"; source: Source; label: string }> {
  return [
    {
      kind: "do-not-repeat",
      source,
      label: "Do not repeat this target request until fresh progression state is read.",
    },
  ];
}

function checkTarget(
  context: Civ7ControlOrpcContext,
  kind: TreeKind,
  input: Civ7ProgressionTargetInput,
  timeoutMs?: number
) {
  return context.directControl.checkCiv7ProgressionTreeTarget(
    { kind, node: input.node },
    directOptions(context, timeoutMs)
  );
}

function checkChoice(
  context: Civ7ControlOrpcContext,
  kind: TreeKind,
  input: Civ7ProgressionTargetInput
) {
  return context.directControl.checkCiv7ProgressionTreeChoice(
    { kind, node: input.node },
    context.endpointDefaults
  );
}

function pollTarget(
  context: Civ7ControlOrpcContext,
  kind: TreeKind,
  input: Civ7ProgressionTargetInput,
  sent: Extract<Civ7ControlOrpcProgressionTreeSendResult, { sent: true }>
): Effect.Effect<boolean> {
  if (sent.after.targetNode === input.node) return Effect.succeed(true);
  return Effect.gen(function* () {
    const deadline = (yield* Clock.currentTimeMillis) + waitMs(context);
    while (true) {
      const now = yield* Clock.currentTimeMillis;
      if (now >= deadline) return false;
      yield* Effect.sleep(Math.min(250, deadline - now));
      const beforeRead = yield* Clock.currentTimeMillis;
      if (beforeRead >= deadline) return false;
      const remaining = Math.max(1, deadline - beforeRead);
      const checked = yield* Effect.tryPromise(() =>
        checkTarget(context, kind, input, remaining)
      ).pipe(Effect.option, Effect.timeoutOption(remaining));
      if (
        Option.isSome(checked) &&
        Option.isSome(checked.value) &&
        checked.value.value.snapshot.targetNode === input.node
      ) {
        return true;
      }
    }
  });
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

function directOptions(context: Civ7ControlOrpcContext, timeoutMs: number | undefined) {
  return timeoutMs === undefined
    ? context.endpointDefaults
    : { ...context.endpointDefaults, timeoutMs };
}

function unavailableData(
  procedureKey: TargetProcedureKey,
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
