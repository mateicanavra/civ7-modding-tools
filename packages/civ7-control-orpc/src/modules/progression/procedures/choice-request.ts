import {
  cultureChoicePostcondition,
  findCultureChoiceNotification,
  findTechnologyChoiceNotification,
  technologyChoicePostcondition,
} from "@civ7/direct-control/play/progression/choice-postconditions";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type {
  Civ7ControlOrpcCultureChoiceCloseoutResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcTechnologyChoiceCloseoutResult,
} from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import {
  type Civ7MutationProofPostcondition,
  civ7CloseoutMutationProjection,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7ProgressionChoiceInput,
  Civ7ProgressionCultureChoiceResult,
  Civ7ProgressionTechnologyChoiceResult,
} from "../contract";

type ProgressionChoiceCloseoutResult =
  | Civ7ControlOrpcTechnologyChoiceCloseoutResult
  | Civ7ControlOrpcCultureChoiceCloseoutResult;
type ProgressionChoiceKind = "technology" | "culture";
type ProgressionChoiceRuntimeInput = Civ7ProgressionChoiceInput &
  Readonly<{
    playerId: number;
  }>;
type ProgressionChoiceResult =
  | Civ7ProgressionTechnologyChoiceResult
  | Civ7ProgressionCultureChoiceResult;
type ProgressionChoicePostcondition = Civ7MutationProofPostcondition<
  ProgressionChoiceResult["postcondition"]["classification"],
  ProgressionChoiceResult["postcondition"]["outcome"]
>;
type ProgressionChoicePostRead =
  | Readonly<{
      status: "read";
      view: Civ7ControlOrpcPlayNotificationViewResult;
    }>
  | Readonly<{
      status: "failed";
      view: null;
    }>
  | Readonly<{
      status: "skipped-not-sent";
      view: null;
    }>;

export const progressionTechnologyChoiceRequestProcedure = civ7ControlOrpcMutationProcedure(
  civ7ControlOrpcImplementer.progression.technology.choice.request
).effect(function* ({ context, errors, input }) {
  const kind = "technology";
  const source = "progression.technology.choice.request";
  return yield* Effect.tryPromise({
    try: async () => {
      const before = await context.directControl.getCiv7PlayNotificationView(
        context.endpointDefaults
      );
      const requestInput = progressionChoiceRuntimeInput(input, before);
      const result = await requestProgressionChoice(kind, requestInput, {
        context,
      });
      const after = await readAfterProgressionChoice(context, result);
      return progressionChoiceResult(kind, source, requestInput, result, before, after);
    },
    catch: (cause) =>
      errors.PROGRESSION_CHOICE_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: source,
          source: "direct-control-facade",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });
});

export const progressionCultureChoiceRequestProcedure = civ7ControlOrpcMutationProcedure(
  civ7ControlOrpcImplementer.progression.culture.choice.request
).effect(function* ({ context, errors, input }) {
  const kind = "culture";
  const source = "progression.culture.choice.request";
  return yield* Effect.tryPromise({
    try: async () => {
      const before = await context.directControl.getCiv7PlayNotificationView(
        context.endpointDefaults
      );
      const requestInput = progressionChoiceRuntimeInput(input, before);
      const result = await requestProgressionChoice(kind, requestInput, {
        context,
      });
      const after = await readAfterProgressionChoice(context, result);
      return progressionChoiceResult(kind, source, requestInput, result, before, after);
    },
    catch: (cause) =>
      errors.PROGRESSION_CHOICE_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: source,
          source: "direct-control-facade",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });
});

async function requestProgressionChoice(
  kind: ProgressionChoiceKind,
  input: ProgressionChoiceRuntimeInput,
  dependencies: Readonly<{
    context: Civ7ControlOrpcContext;
  }>
): Promise<ProgressionChoiceCloseoutResult> {
  const requestInput = {
    playerId: input.playerId,
    node: input.node,
    ...(input.notificationId === undefined ? {} : { notificationId: input.notificationId }),
  };

  if (kind === "technology") {
    return dependencies.context.directControl.requestCiv7TechnologyChoiceCloseout(
      requestInput,
      dependencies.context.endpointDefaults
    );
  }

  return dependencies.context.directControl.requestCiv7CultureChoiceCloseout(
    requestInput,
    dependencies.context.endpointDefaults
  );
}

function progressionChoiceRuntimeInput(
  input: Civ7ProgressionChoiceInput,
  before: Civ7ControlOrpcPlayNotificationViewResult
): ProgressionChoiceRuntimeInput {
  return {
    playerId: before.localPlayerId,
    node: input.node,
    ...(input.notificationId === undefined ? {} : { notificationId: input.notificationId }),
  };
}

function progressionChoiceResult(
  kind: "technology",
  source: "progression.technology.choice.request",
  input: ProgressionChoiceRuntimeInput,
  result: ProgressionChoiceCloseoutResult,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: ProgressionChoicePostRead
): Civ7ProgressionTechnologyChoiceResult;
function progressionChoiceResult(
  kind: "culture",
  source: "progression.culture.choice.request",
  input: ProgressionChoiceRuntimeInput,
  result: ProgressionChoiceCloseoutResult,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: ProgressionChoicePostRead
): Civ7ProgressionCultureChoiceResult;
function progressionChoiceResult(
  kind: ProgressionChoiceKind,
  source: "progression.technology.choice.request" | "progression.culture.choice.request",
  input: ProgressionChoiceRuntimeInput,
  result: ProgressionChoiceCloseoutResult,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: ProgressionChoicePostRead
): ProgressionChoiceResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: progressionChoicePostcondition(kind, result, before, after),
    missing: {
      classification: "pending-runtime-proof",
      reason: "The progression choice result did not include explicit postcondition evidence.",
      outcome: "unknown",
    },
    source,
    inspectKind: "inspect-progression-choice",
    inspectLabel:
      "Inspect current attention and progression choice state before attempting another progression request.",
    doNotRepeatLabel:
      "Do not repeat this progression choice request until fresh attention and progression evidence is read.",
  });

  return {
    playerId: input.playerId,
    node: input.node,
    ...(input.notificationId === undefined ? {} : { notificationId: input.notificationId }),
    sent: result.sent,
    status: projection.status,
    evidence: {
      beforeBlockerPresent: progressionBlockerPresent(kind, before),
      afterReadStatus: after.status,
      afterBlockerPresent: after.view == null ? null : progressionBlockerPresent(kind, after.view),
      canEndTurnAfter: after.view == null ? null : booleanProbeValue(after.view.canEndTurn),
    },
    postcondition: projection.postcondition,
    nextSteps: projection.nextSteps,
  } as ProgressionChoiceResult;
}

function progressionChoicePostcondition(
  kind: ProgressionChoiceKind,
  result: ProgressionChoiceCloseoutResult,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: ProgressionChoicePostRead
): ProgressionChoicePostcondition {
  if (!result.sent) {
    return {
      classification: "not-sent",
      reason:
        "The progression choice closeout did not send both required App UI progression requests.",
      outcome: "not-sent",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    };
  }

  if (after.view == null) {
    return {
      classification: "pending-runtime-proof",
      reason:
        "The progression choice closeout was sent, but the post-send notification read failed; do not repeat until fresh attention evidence is available.",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    };
  }

  const postcondition =
    kind === "technology"
      ? technologyChoicePostcondition(before, after.view)
      : cultureChoicePostcondition(before, after.view);
  const outcome = progressionChoiceOutcome(postcondition.classification);

  return {
    classification: postcondition.classification,
    reason: postcondition.reason,
    outcome,
    confidence: postcondition.verified ? "confirmed" : "unverified",
    noRepeatAfterUnverified: !postcondition.verified,
  };
}

function progressionChoiceOutcome(
  classification: ProgressionChoiceResult["postcondition"]["classification"]
): ProgressionChoiceResult["postcondition"]["outcome"] {
  switch (classification) {
    case "turn-unblocked":
    case "technology-choice-cleared":
    case "culture-choice-cleared":
      return "cleared";
    case "technology-choice-transitioned":
    case "culture-choice-transitioned":
      return "state-changed";
    case "technology-state-changed-blocker-still-live":
    case "culture-state-changed-blocker-still-live":
      return "still-blocked";
    case "pending-runtime-proof":
      return "unknown";
    case "not-sent":
      return "not-sent";
    case "technology-choice-sticky-blocker":
    case "culture-choice-sticky-blocker":
      return "no-state-change";
  }
}

async function readAfterProgressionChoice(
  context: Civ7ControlOrpcContext,
  result: ProgressionChoiceCloseoutResult
): Promise<ProgressionChoicePostRead> {
  if (!result.sent) return { status: "skipped-not-sent", view: null };

  try {
    return {
      status: "read",
      view: await context.directControl.getCiv7PlayNotificationView(context.endpointDefaults),
    };
  } catch {
    return { status: "failed", view: null };
  }
}

function progressionBlockerPresent(
  kind: ProgressionChoiceKind,
  view: Civ7ControlOrpcPlayNotificationViewResult
): boolean {
  return kind === "technology"
    ? findTechnologyChoiceNotification(view) != null
    : findCultureChoiceNotification(view) != null;
}

function booleanProbeValue(value: unknown): boolean | null {
  const unwrapped = probeValue(value);
  return typeof unwrapped === "boolean" ? unwrapped : null;
}

function probeValue(value: unknown): unknown {
  if (value && typeof value === "object" && "ok" in value) {
    const probe = value as { ok?: unknown; value?: unknown };
    return probe.ok === true ? (probe.value ?? null) : null;
  }
  return value ?? null;
}
