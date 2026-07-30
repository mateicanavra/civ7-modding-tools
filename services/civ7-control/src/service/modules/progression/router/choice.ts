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
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcProgressionTreeCheckResult,
  Civ7ControlOrpcProgressionTreeClearTargetResult,
  Civ7ControlOrpcProgressionTreeSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7ProgressionChoiceCheckResult,
  Civ7ProgressionChoiceInput,
  Civ7ProgressionChoiceOptionsResult,
  Civ7ProgressionCultureChoiceResult,
  Civ7ProgressionTechnologyChoiceResult,
} from "../contract";
import { module } from "../module";

type TreeKind = "technology" | "culture";
type ChoiceSource = "progression.technology.choice.request" | "progression.culture.choice.request";
type ChoiceProcedureKey =
  | ChoiceSource
  | "progression.technology.choice.options"
  | "progression.culture.choice.options"
  | "progression.technology.choice.check"
  | "progression.culture.choice.check";
type ChoiceResult = Civ7ProgressionTechnologyChoiceResult | Civ7ProgressionCultureChoiceResult;
type ChoiceObservation = "confirmed" | "blocker-still-live" | "unverified";
type ChoiceEvidence =
  | "not-sent"
  | "unknown"
  | "selected-clear-unverified"
  | "confirmed"
  | "blocker-still-live"
  | "unchanged";
type ChoiceResultFactory<Result extends ChoiceResult> = (
  input: Civ7ProgressionChoiceInput,
  status: Result["status"],
  evidence: ChoiceEvidence
) => Result;

const POLL_MS = 250;

export const choice = {
  technology: {
    options: module.technology.choice.options.effect(function* ({ context, errors }) {
      const view = yield* Effect.tryPromise({
        try: () => context.directControl.getCiv7PlayNotificationView(context.endpointDefaults),
        catch: (cause) =>
          errors.PROGRESSION_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.technology.choice.options", cause, context),
          }),
      });
      return choiceOptions("technology", view);
    }),
    check: module.technology.choice.check.effect(function* ({ context, errors, input }) {
      const checked = yield* Effect.tryPromise({
        try: () => checkChoice(context, "technology", input),
        catch: (cause) =>
          errors.PROGRESSION_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.technology.choice.check", cause, context),
          }),
      });
      return choiceCheckResult(input, checked);
    }),
    request: civ7ControlOrpcMutationProcedure(module.technology.choice.request).effect(function* ({
      context,
      errors,
      input,
    }) {
      return yield* choiceRequest({
        context,
        input,
        kind: "technology",
        result: technologyChoiceResult,
        onPrecheckFailure: (cause) =>
          errors.PROGRESSION_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.technology.choice.request", cause, context),
          }),
      });
    }),
  },
  culture: {
    options: module.culture.choice.options.effect(function* ({ context, errors }) {
      const view = yield* Effect.tryPromise({
        try: () => context.directControl.getCiv7PlayNotificationView(context.endpointDefaults),
        catch: (cause) =>
          errors.PROGRESSION_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.culture.choice.options", cause, context),
          }),
      });
      return choiceOptions("culture", view);
    }),
    check: module.culture.choice.check.effect(function* ({ context, errors, input }) {
      const checked = yield* Effect.tryPromise({
        try: () => checkChoice(context, "culture", input),
        catch: (cause) =>
          errors.PROGRESSION_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.culture.choice.check", cause, context),
          }),
      });
      return choiceCheckResult(input, checked);
    }),
    request: civ7ControlOrpcMutationProcedure(module.culture.choice.request).effect(function* ({
      context,
      errors,
      input,
    }) {
      return yield* choiceRequest({
        context,
        input,
        kind: "culture",
        result: cultureChoiceResult,
        onPrecheckFailure: (cause) =>
          errors.PROGRESSION_CHOICE_UNAVAILABLE({
            data: unavailableData("progression.culture.choice.request", cause, context),
          }),
      });
    }),
  },
};

function choiceRequest<Result extends ChoiceResult, E>(
  options: Readonly<{
    context: Civ7ControlOrpcContext;
    input: Civ7ProgressionChoiceInput;
    kind: TreeKind;
    result: ChoiceResultFactory<Result>;
    onPrecheckFailure: (cause: unknown) => E;
  }>
): Effect.Effect<Result, E> {
  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => checkChoice(options.context, options.kind, options.input),
      catch: options.onPrecheckFailure,
    });
    const checkStatus = choiceCheckResult(options.input, precheck).status;
    if (checkStatus === "already-selected") {
      const observed = choiceObservation(options.kind, options.input, precheck.snapshot);
      return observed === "confirmed"
        ? options.result(options.input, "already-selected", "confirmed")
        : options.result(
            options.input,
            "already-selected-unverified",
            observed === "blocker-still-live" ? observed : "unchanged"
          );
    }
    if (checkStatus === "unavailable") {
      return options.result(options.input, "not-sent", "not-sent");
    }

    let choiceDispatched = false;
    let clearAdmission = precheck;
    if (checkStatus === "available") {
      const sent = yield* attempt(() =>
        options.context.directControl.sendCiv7ProgressionTreeChoice(
          { kind: options.kind, node: options.input.node, expected: precheck.snapshot },
          options.context.endpointDefaults
        )
      ).pipe(Effect.uninterruptible);
      if (!sent.ok) {
        return options.result(
          options.input,
          sent.dispatchStatus === "not-dispatched" ? "not-sent" : "dispatch-unknown",
          sent.dispatchStatus === "not-dispatched" ? "not-sent" : "unknown"
        );
      }
      if (!sent.value.sent) return options.result(options.input, "not-sent", "not-sent");
      choiceDispatched = true;

      const fresh = yield* Effect.tryPromise(() =>
        checkChoice(options.context, options.kind, options.input)
      ).pipe(Effect.option);
      if (Option.isNone(fresh)) {
        return options.result(options.input, "sent-unverified", "selected-clear-unverified");
      }
      clearAdmission = fresh.value;
    }

    const cleared = yield* attempt(() =>
      options.context.directControl.clearCiv7ProgressionTreeTarget(
        { kind: options.kind, expected: clearAdmission.snapshot },
        options.context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!cleared.ok) {
      if (cleared.dispatchStatus !== "not-dispatched") {
        return options.result(options.input, "dispatch-unknown", "unknown");
      }
      return options.result(
        options.input,
        choiceDispatched ? "sent-unverified" : "already-selected-unverified",
        "selected-clear-unverified"
      );
    }

    const observed = yield* pollChoice({
      context: options.context,
      kind: options.kind,
      input: options.input,
      initial: cleared.value,
    });
    return options.result(
      options.input,
      observed === "confirmed" ? "sent-confirmed" : "sent-unverified",
      observed === "confirmed"
        ? "confirmed"
        : observed === "blocker-still-live"
          ? observed
          : "unchanged"
    );
  });
}

function choiceCheckResult(
  input: Civ7ProgressionChoiceInput,
  checked: Civ7ControlOrpcProgressionTreeCheckResult
): Civ7ProgressionChoiceCheckResult {
  return {
    node: input.node,
    status:
      checked.snapshot.currentNode === input.node
        ? checked.snapshot.targetNode === checked.snapshot.noNode
          ? "already-selected"
          : "selected-target-pending"
        : checked.valid
          ? "available"
          : "unavailable",
  };
}

function technologyChoiceResult(
  input: Civ7ProgressionChoiceInput,
  status: Civ7ProgressionTechnologyChoiceResult["status"],
  evidence: ChoiceEvidence
): Civ7ProgressionTechnologyChoiceResult {
  return choiceResult(
    "progression.technology.choice.request",
    "technology-state-changed-blocker-still-live",
    input,
    status,
    evidence
  );
}

function cultureChoiceResult(
  input: Civ7ProgressionChoiceInput,
  status: Civ7ProgressionCultureChoiceResult["status"],
  evidence: ChoiceEvidence
): Civ7ProgressionCultureChoiceResult {
  return choiceResult(
    "progression.culture.choice.request",
    "culture-state-changed-blocker-still-live",
    input,
    status,
    evidence
  );
}

function choiceResult<
  const Source extends ChoiceSource,
  const BlockerClassification extends
    | "technology-state-changed-blocker-still-live"
    | "culture-state-changed-blocker-still-live",
>(
  source: Source,
  blockerClassification: BlockerClassification,
  input: Civ7ProgressionChoiceInput,
  status: ChoiceResult["status"],
  evidence: ChoiceEvidence
) {
  const notSent = () => ({
    classification: "not-sent" as const,
    reason: "Fresh native admission did not dispatch the progression choice.",
    outcome: "not-sent" as const,
    confidence: "unverified" as const,
    confirmed: false as const,
    noRepeatAfterUnverified: true as const,
  });
  const confirmed = () => ({
    classification: "choice-selected-target-cleared" as const,
    reason: "Fresh progression state confirms the requested choice and the target is cleared.",
    outcome: "selected" as const,
    confidence: "confirmed" as const,
    confirmed: true as const,
    noRepeatAfterUnverified: false as const,
  });
  const partial = () => ({
    classification: "choice-selected-target-clear-unverified" as const,
    reason:
      "The requested choice is selected, but its required target clear could not be confirmed.",
    outcome: "selected-partial" as const,
    confidence: "unverified" as const,
    confirmed: false as const,
    noRepeatAfterUnverified: true as const,
  });
  const blockerStillLive = () => ({
    classification: blockerClassification,
    reason:
      "The requested progression state is observable, but the matching chooser notification still blocks turn flow.",
    outcome: "still-blocked" as const,
    confidence: "unverified" as const,
    confirmed: false as const,
    noRepeatAfterUnverified: true as const,
  });
  const unchanged = () => ({
    classification: "no-state-change" as const,
    reason:
      "The native sends returned, but fresh progression state did not confirm the requested choice and clear.",
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
        nextSteps: choiceInspectSteps(source),
      };
    case "already-selected":
    case "sent-confirmed":
      return {
        node: input.node,
        status,
        postcondition: confirmed(),
        nextSteps: choiceRefreshSteps(source),
      };
    case "already-selected-unverified":
      return {
        node: input.node,
        status,
        postcondition:
          evidence === "selected-clear-unverified"
            ? partial()
            : evidence === "blocker-still-live"
              ? blockerStillLive()
              : unchanged(),
        nextSteps: choiceNoRepeatSteps(
          source,
          "Do not repeat this choice until fresh chooser-blocker evidence can be read."
        ),
      };
    case "dispatch-unknown":
      return {
        node: input.node,
        status,
        postcondition: unknown(),
        nextSteps: choiceNoRepeatSteps(
          source,
          "Do not repeat this choice until fresh choice and target state can be read."
        ),
      };
    case "sent-unverified":
      return {
        node: input.node,
        status,
        postcondition:
          evidence === "selected-clear-unverified"
            ? partial()
            : evidence === "blocker-still-live"
              ? blockerStillLive()
              : unchanged(),
        nextSteps: choiceNoRepeatSteps(
          source,
          "Do not repeat this choice until fresh choice and target state can be read."
        ),
      };
  }
}

function choiceInspectSteps<const Source extends ChoiceSource>(
  source: Source
): Array<{ kind: "inspect-progression-choice"; source: Source; label: string }> {
  return [
    {
      kind: "inspect-progression-choice",
      source,
      label: "Inspect fresh progression choice availability before another request.",
    },
  ];
}

function choiceRefreshSteps<const Source extends ChoiceSource>(
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

function choiceNoRepeatSteps<const Source extends ChoiceSource>(
  source: Source,
  label: string
): Array<{ kind: "do-not-repeat"; source: Source; label: string }> {
  return [{ kind: "do-not-repeat", source, label }];
}

function checkChoice(
  context: Civ7ControlOrpcContext,
  kind: TreeKind,
  input: Civ7ProgressionChoiceInput,
  timeoutMs?: number
) {
  return context.directControl.checkCiv7ProgressionTreeChoice(
    { kind, node: input.node },
    directOptions(context, timeoutMs)
  );
}

function pollChoice(options: {
  context: Civ7ControlOrpcContext;
  kind: TreeKind;
  input: Civ7ProgressionChoiceInput;
  initial: Civ7ControlOrpcProgressionTreeClearTargetResult;
}): Effect.Effect<ChoiceObservation> {
  const initial = choiceObservation(options.kind, options.input, options.initial.after);
  if (initial === "confirmed") return Effect.succeed("confirmed");
  return Effect.gen(function* () {
    let latest: ChoiceObservation = initial;
    const deadline = (yield* Clock.currentTimeMillis) + waitMs(options.context);
    while (true) {
      const now = yield* Clock.currentTimeMillis;
      if (now >= deadline) return latest;
      yield* Effect.sleep(Math.min(POLL_MS, deadline - now));
      const beforeRead = yield* Clock.currentTimeMillis;
      if (beforeRead >= deadline) return latest;
      const remaining = Math.max(1, deadline - beforeRead);
      const checked = yield* Effect.tryPromise(() =>
        checkChoice(options.context, options.kind, options.input, remaining)
      ).pipe(Effect.option, Effect.timeoutOption(remaining));
      if (Option.isSome(checked) && Option.isSome(checked.value)) {
        latest = choiceObservation(options.kind, options.input, checked.value.value.snapshot);
        if (latest === "confirmed") return latest;
      }
    }
  });
}

function choiceObservation(
  kind: TreeKind,
  input: Civ7ProgressionChoiceInput,
  snapshot: Civ7ControlOrpcProgressionTreeCheckResult["snapshot"]
): ChoiceObservation {
  if (snapshot.currentNode !== input.node || snapshot.targetNode !== snapshot.noNode) {
    return "unverified";
  }
  if (!snapshot.blocker.ok || !snapshot.blockingNotification.ok) return "unverified";
  const blocker = snapshot.blocker.value;
  const notification = snapshot.blockingNotification.value;
  if (blocker === null || blocker === 0 || blocker === "0") {
    return notification === null ? "confirmed" : "unverified";
  }
  if (
    notification === null ||
    notification.typeName === null ||
    notification.id.owner !== snapshot.localPlayerId
  ) {
    return "unverified";
  }
  const token = kind === "technology" ? "CHOOSE_TECH" : "CHOOSE_CULTURE";
  return notification.typeName.toUpperCase().includes(token) ? "blocker-still-live" : "confirmed";
}

type SendAttempt<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attempt<T>(send: () => Promise<T>): Effect.Effect<SendAttempt<T>> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function choiceOptions(
  kind: TreeKind,
  view: Civ7ControlOrpcPlayNotificationViewResult
): Civ7ProgressionChoiceOptionsResult {
  const token = kind === "technology" ? "CHOOSE_TECH" : "CHOOSE_CULTURE";
  const notification = view.notifications.find((row) =>
    String(row.typeName ?? "")
      .toUpperCase()
      .includes(token)
  );
  const details = notification && isRecord(notification.details) ? notification.details : null;
  const currentNode = integerOrNull(details ? probeValue(details.currentResearching) : null);
  const options = details
    ? progressionOptions(details.enabledOptions ?? details.options, currentNode)
    : [];
  const [first, ...remaining] = options;
  return first === undefined
    ? { status: "unavailable", currentNode, options: [] }
    : { status: "read", currentNode, options: [first, ...remaining] };
}

function progressionOptions(
  value: unknown,
  currentNode: number | null
): Civ7ProgressionChoiceOptionsResult["options"] {
  if (!Array.isArray(value)) return [];
  const options: Civ7ProgressionChoiceOptionsResult["options"] = [];
  for (const row of value) {
    if (!isRecord(row) || !Number.isInteger(row.nodeType)) continue;
    const node = Number(row.nodeType);
    options.push({
      node,
      name: stringOrNull(row.name),
      treeType: integerStringOrNull(row.treeType),
      treeName: stringOrNull(row.treeName),
      current: node === currentNode,
      cost: numberOrNull(probeValue(row.cost)),
      turns: numberOrNull(probeValue(row.turns)),
    });
  }
  return options;
}

function probeValue(value: unknown): unknown {
  return isRecord(value) && value.ok === true ? value.value : value;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function integerOrNull(value: unknown): number | null {
  return Number.isInteger(value) ? Number(value) : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function integerStringOrNull(value: unknown): number | string | null {
  return Number.isInteger(value) ? Number(value) : stringOrNull(value);
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
  procedureKey: ChoiceProcedureKey,
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
