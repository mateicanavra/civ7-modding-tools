import { Cause, Effect } from "effect";
import { Value } from "typebox/value";

import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcUnitTargetActionCheckResult,
  Civ7ControlOrpcUnitTargetActionSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7UnitTargetAction,
  Civ7UnitTargetActionInput,
  Civ7UnitTargetActionResult,
} from "../../contract";
import {
  type Civ7UnitTargetActionAdmission,
  unitTargetActionAdmission,
  unitTargetCheckMatchesInput,
  unitTargetDecisionStateMatches,
  unitTargetIsCurrentTile,
} from "./target-action-admission";
import { pollUnitTargetPostcondition } from "./target-action-polling";
import {
  type Civ7UnitTargetDispatchState,
  type Civ7UnitTargetPostconditionEvidence,
  unitTargetActionResult,
} from "./target-action-result";

const DEFAULT_UNIT_TARGET_WAIT_MS = 3_000;
const MIN_UNIT_TARGET_WAIT_MS = 1_000;
const MAX_UNIT_TARGET_WAIT_MS = 6_000;

type UnitTargetRuntime = Pick<Civ7ControlOrpcContext, "directControl" | "endpointDefaults">;

/** Resolves the first action admitted by Civ7's exact right-click decision order. */
export function resolveCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  context: UnitTargetRuntime
): Effect.Effect<Civ7UnitTargetActionAdmission, unknown> {
  const check = (action: Civ7UnitTargetAction) =>
    Effect.tryPromise({
      try: () =>
        context.directControl.checkCiv7UnitTargetAction(
          { ...input, actionId: action },
          context.endpointDefaults
        ),
      catch: (cause) => new Cause.UnknownException(cause),
    });

  return Effect.gen(function* () {
    const naval = yield* check("naval-attack");
    if (!unitTargetCheckMatchesInput(input, "naval-attack", naval)) {
      return { kind: "not-admitted" };
    }
    const baseline = naval.snapshot;
    const navalResolution = terminalCandidate(input, "naval-attack", naval, baseline);
    if (naval.valid || navalResolution.kind !== "not-admitted") return navalResolution;

    const air = yield* check("air-attack");
    if (
      !unitTargetCheckMatchesInput(input, "air-attack", air) ||
      !sameDecisionState(air, baseline)
    ) {
      return { kind: "not-admitted" };
    }
    const airResolution = terminalCandidate(input, "air-attack", air, baseline);
    if (air.valid || airResolution.kind !== "not-admitted") return airResolution;

    const ranged = yield* check("ranged-attack");
    if (
      !unitTargetCheckMatchesInput(input, "ranged-attack", ranged) ||
      !sameDecisionState(ranged, baseline) ||
      ranged.prerequisite.kind !== "ranged-combat"
    ) {
      return { kind: "not-admitted" };
    }
    if (ranged.prerequisite.satisfied) {
      return terminalCandidate(input, "ranged-attack", ranged, baseline);
    }
    if (ranged.valid) return { kind: "not-admitted" };

    const overrun = yield* check("army-overrun");
    if (
      !unitTargetCheckMatchesInput(input, "army-overrun", overrun) ||
      !sameDecisionState(overrun, baseline)
    ) {
      return { kind: "not-admitted" };
    }
    const overrunResolution = terminalCandidate(input, "army-overrun", overrun, baseline);
    if (overrun.valid || overrunResolution.kind !== "not-admitted") return overrunResolution;

    if (unitTargetIsCurrentTile(baseline)) return { kind: "not-admitted" };

    const swap = yield* check("swap-units");
    if (
      !unitTargetCheckMatchesInput(input, "swap-units", swap) ||
      !sameDecisionState(swap, baseline)
    ) {
      return { kind: "not-admitted" };
    }
    const swapResolution = terminalCandidate(input, "swap-units", swap, baseline);
    if (swap.valid || swapResolution.kind !== "not-admitted") return swapResolution;

    const move = yield* check("move-to");
    if (
      !unitTargetCheckMatchesInput(input, "move-to", move) ||
      !sameDecisionState(move, baseline)
    ) {
      return { kind: "not-admitted" };
    }
    return terminalCandidate(input, "move-to", move, baseline);
  });
}

/** Executes service admission, one guarded native send, and bounded focused observation. */
export function executeCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  context: UnitTargetRuntime
): Effect.Effect<Civ7UnitTargetActionResult, unknown> {
  return Effect.gen(function* () {
    const resolution = yield* resolveCiv7UnitTargetAction(input, context);
    if (resolution.kind === "dedicated-war-workflow-required") {
      return unitTargetActionResult(input, resolution.action, "not-sent", {
        kind: "dedicated-war-workflow-required",
        action: resolution.action,
      });
    }
    if (resolution.kind !== "admitted") {
      return unitTargetActionResult(input, null, "not-sent", {
        kind: "not-admitted",
      });
    }

    const sendAttempt = yield* attemptUnitTargetSend(() =>
      context.directControl.sendCiv7UnitTargetAction(
        {
          ...input,
          actionId: resolution.action,
          expected: resolution.check,
        },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);

    if (!sendAttempt.ok) {
      if (sendAttempt.dispatchStatus === "not-dispatched") {
        return unitTargetActionResult(input, null, "not-sent", {
          kind: "not-dispatched",
        });
      }
      const evidence = yield* pollAfterUnitTargetDispatch({
        input,
        action: resolution.action,
        before: resolution.check.snapshot,
        after: resolution.check.snapshot,
        context,
      });
      return unitTargetActionResult(
        input,
        resolution.action,
        dispatchStateFromFailure(sendAttempt.dispatchStatus),
        evidence
      );
    }

    if (!unitTargetSendMatchesAdmission(sendAttempt.value, resolution.check)) {
      return unitTargetActionResult(
        input,
        resolution.action,
        sendAttempt.value.sent ? "sent" : "unknown",
        { kind: "provider-evidence-mismatch" }
      );
    }

    if (!sendAttempt.value.sent) {
      return unitTargetActionResult(input, null, "not-sent", {
        kind: "validation-rejected",
      });
    }

    const evidence = yield* pollAfterUnitTargetDispatch({
      input,
      action: resolution.action,
      before: sendAttempt.value.before,
      after: sendAttempt.value.after,
      context,
    });
    return unitTargetActionResult(input, resolution.action, "sent", evidence);
  });
}

function terminalCandidate(
  input: Civ7UnitTargetActionInput,
  action: Civ7UnitTargetAction,
  check: Civ7ControlOrpcUnitTargetActionCheckResult,
  baseline: Civ7ControlOrpcUnitTargetActionCheckResult["snapshot"]
): Civ7UnitTargetActionAdmission {
  if (!sameDecisionState(check, baseline)) return { kind: "not-admitted" };
  return unitTargetActionAdmission(input, action, check);
}

function sameDecisionState(
  check: Civ7ControlOrpcUnitTargetActionCheckResult,
  baseline: Civ7ControlOrpcUnitTargetActionCheckResult["snapshot"]
): boolean {
  return unitTargetDecisionStateMatches(baseline, check.snapshot);
}

function unitTargetSendMatchesAdmission(
  result: Civ7ControlOrpcUnitTargetActionSendResult,
  admitted: Civ7ControlOrpcUnitTargetActionCheckResult
): boolean {
  return (
    result.actionId === admitted.actionId &&
    Value.Equal(result.validation, admitted) &&
    Value.Equal(result.before, admitted.snapshot)
  );
}

function pollAfterUnitTargetDispatch(
  options: Readonly<{
    input: Civ7UnitTargetActionInput;
    action: Civ7UnitTargetAction;
    before: Civ7ControlOrpcUnitTargetActionSendResult["before"];
    after: Civ7ControlOrpcUnitTargetActionSendResult["after"];
    context: UnitTargetRuntime;
  }>
): Effect.Effect<Civ7UnitTargetPostconditionEvidence> {
  return pollUnitTargetPostcondition({
    input: options.input,
    action: options.action,
    initial: {
      kind: "observed",
      input: options.input,
      action: options.action,
      before: options.before,
      after: options.after,
    },
    observe: (timeoutMs) =>
      options.context.directControl.observeCiv7UnitTarget(
        {
          ...options.input,
          trackedUnitIds: options.before.targetUnits.map((unit) => unit.id),
        },
        directControlOptions(options.context, timeoutMs)
      ),
    waitMs: unitTargetWaitMs(options.context.endpointDefaults?.timeoutMs),
  });
}

type UnitTargetSendAttempt =
  | Readonly<{ ok: true; value: Civ7ControlOrpcUnitTargetActionSendResult }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptUnitTargetSend(
  send: () => Promise<Civ7ControlOrpcUnitTargetActionSendResult>
): Effect.Effect<UnitTargetSendAttempt> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function dispatchStateFromFailure(
  status: Civ7ControlOrpcCommandDispatchStatus
): Civ7UnitTargetDispatchState {
  return status === "dispatched" ? "sent" : "unknown";
}

function unitTargetWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_UNIT_TARGET_WAIT_MS,
    Math.max(MIN_UNIT_TARGET_WAIT_MS, timeoutMs ?? DEFAULT_UNIT_TARGET_WAIT_MS)
  );
}

function directControlOptions(context: UnitTargetRuntime, timeoutMs: number | undefined) {
  return timeoutMs === undefined
    ? context.endpointDefaults
    : {
        ...context.endpointDefaults,
        timeoutMs,
      };
}
