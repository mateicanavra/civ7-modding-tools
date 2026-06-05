import {
  cultureChoicePostcondition,
  findCultureChoiceNotification,
  findTechnologyChoiceNotification,
  technologyChoicePostcondition,
} from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type {
  Civ7ControlOrpcCultureChoiceCloseoutResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcTechnologyChoiceCloseoutResult,
} from "../../../dependencies/direct-control";
import { civ7MutationApprovalMiddleware } from "../../../middleware/mutation-approval";
import { civ7MutationReadinessMiddleware } from "../../../middleware/mutation-readiness";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7MutationNextSteps,
  civ7MutationRequestStatusWithoutGuarded,
  type Civ7MutationProofConfidence,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7DecisionsProgressionChoiceInput,
  Civ7DecisionsProgressionChoiceResult,
} from "../contract";

type ProgressionChoiceCloseoutResult =
  | Civ7ControlOrpcTechnologyChoiceCloseoutResult
  | Civ7ControlOrpcCultureChoiceCloseoutResult;
type ApprovedCiv7ControlOrpcContext = Civ7ControlOrpcContext & Readonly<{
  approval: NonNullable<Civ7ControlOrpcContext["approval"]>;
}>;

const decisionsProgressionChoiceRequestWithApproval =
  civ7ControlOrpcImplementer.decisions.progression.choice.request.use(
    civ7MutationApprovalMiddleware,
  );
const decisionsProgressionChoiceRequestReady =
  decisionsProgressionChoiceRequestWithApproval.use(
    civ7MutationReadinessMiddleware,
  );

export const decisionsProgressionChoiceRequestProcedure =
  decisionsProgressionChoiceRequestReady.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const before = await context.directControl.getCiv7PlayNotificationView(
          context.endpointDefaults,
        );
        const result = await requestProgressionChoice(input, {
          context,
        });
        const after = await context.directControl.getCiv7PlayNotificationView(
          context.endpointDefaults,
        );
        return progressionChoiceResult(input, result, before, after);
      },
      catch: () =>
        errors.PROGRESSION_CHOICE_UNAVAILABLE({
          data: {
            procedureKey: "decisions.progression.choice.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

async function requestProgressionChoice(
  input: Civ7DecisionsProgressionChoiceInput,
  dependencies: Readonly<{
    context: ApprovedCiv7ControlOrpcContext;
  }>,
): Promise<ProgressionChoiceCloseoutResult> {
  const requestInput = {
    playerId: input.playerId,
    node: input.node,
    ...(input.notificationId === undefined
      ? {}
      : { notificationId: input.notificationId }),
  };

  if (input.kind === "technology") {
    return dependencies.context.directControl.requestCiv7TechnologyChoiceCloseout(
      requestInput,
      dependencies.context.endpointDefaults,
      dependencies.context.approval,
    );
  }

  return dependencies.context.directControl.requestCiv7CultureChoiceCloseout(
    requestInput,
    dependencies.context.endpointDefaults,
    dependencies.context.approval,
  );
}

function progressionChoiceResult(
  input: Civ7DecisionsProgressionChoiceInput,
  result: ProgressionChoiceCloseoutResult,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: Civ7ControlOrpcPlayNotificationViewResult,
): Civ7DecisionsProgressionChoiceResult {
  const postcondition = progressionChoicePostconditionSummary(
    input,
    result,
    before,
    after,
  );
  const status = civ7MutationRequestStatusWithoutGuarded({
    sent: result.sent,
    postcondition,
  });

  return {
    kind: input.kind,
    playerId: input.playerId,
    node: input.node,
    ...(input.notificationId === undefined
      ? {}
      : { notificationId: input.notificationId }),
    sent: result.sent,
    status,
    evidence: {
      beforeBlockerPresent: progressionBlockerPresent(input.kind, before),
      afterBlockerPresent: progressionBlockerPresent(input.kind, after),
      canEndTurnAfter: booleanProbeValue(after.canEndTurn),
    },
    postcondition,
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: "decisions.progression.choice.request",
      inspectKind: "inspect-progression-choice",
      inspectLabel: "Inspect current attention and progression choice state before attempting another progression request.",
      doNotRepeatLabel: "Do not repeat this progression choice request until fresh attention and progression evidence is read.",
    }),
  };
}

function progressionChoicePostconditionSummary(
  input: Civ7DecisionsProgressionChoiceInput,
  result: ProgressionChoiceCloseoutResult,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: Civ7ControlOrpcPlayNotificationViewResult,
): Civ7DecisionsProgressionChoiceResult["postcondition"] {
  if (!result.sent) {
    return {
      classification: "not-sent",
      reason: "The progression choice closeout did not send both required App UI progression requests.",
      outcome: "not-sent",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }

  const postcondition = input.kind === "technology"
    ? technologyChoicePostcondition(before, after)
    : cultureChoicePostcondition(before, after);
  const outcome = progressionChoiceOutcome(postcondition.classification);
  const confidence: Civ7MutationProofConfidence = postcondition.verified
    ? "confirmed"
    : "unverified";

  return {
    classification: postcondition.classification,
    reason: postcondition.reason,
    outcome,
    confidence,
    confirmed: postcondition.verified,
    noRepeatAfterUnverified: !postcondition.verified,
  };
}

function progressionChoiceOutcome(
  classification: Civ7DecisionsProgressionChoiceResult["postcondition"]["classification"],
): Civ7DecisionsProgressionChoiceResult["postcondition"]["outcome"] {
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
    case "not-sent":
      return "not-sent";
    case "technology-choice-sticky-blocker":
    case "culture-choice-sticky-blocker":
      return "no-state-change";
  }
}

function progressionBlockerPresent(
  kind: Civ7DecisionsProgressionChoiceInput["kind"],
  view: Civ7ControlOrpcPlayNotificationViewResult,
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
    return probe.ok === true ? probe.value ?? null : null;
  }
  return value ?? null;
}
