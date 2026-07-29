import { Effect, Option } from "effect";
import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import {
  civ7MutationNextSteps,
  civ7MutationRequestStatusWithoutGuarded,
} from "#civ7-control-service/model/policy/mutation-result";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcUnitCommandCheckResult,
  Civ7ControlOrpcUnitCommandSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7UnitCommandResult,
  Civ7UnitResettleCheckResult,
  Civ7UnitResettleInput,
  Civ7UnitUpgradeCheckResult,
  Civ7UnitUpgradeInput,
} from "../contract";
import {
  type Civ7UnitCommandPostconditionEvidence,
  civ7UnitCommandPostcondition,
} from "../model/policy/unit-command-postcondition";
import { module } from "../module";

export const command = {
  unitUpgradeCheckProcedure: module.upgrade.check.effect(function* ({ context, errors, input }) {
    const validation = yield* Effect.tryPromise({
      try: () => context.directControl.checkCiv7UnitUpgrade(input, context.endpointDefaults),
      catch: (cause) =>
        errors.UNIT_REQUEST_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "unit.upgrade.check",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
    return {
      action: {
        kind: "upgrade",
        unitId: input.unitId,
      },
      available: validation.valid,
    } satisfies Civ7UnitUpgradeCheckResult;
  }),
  unitUpgradeRequestProcedure: civ7ControlOrpcMutationProcedure(module.upgrade.request).effect(
    function* ({ context, errors, input }) {
      return yield* unitCommandRequest({
        input: {
          kind: "upgrade",
          unitId: input.unitId,
        },
        procedureKey: "unit.upgrade.request",
        check: () => context.directControl.checkCiv7UnitUpgrade(input, context.endpointDefaults),
        send: () => context.directControl.sendCiv7UnitUpgrade(input, context.endpointDefaults),
        onPrecheckFailure: (cause) =>
          errors.UNIT_REQUEST_UNAVAILABLE({
            data: {
              detail: civ7ControlOrpcFailureDetail(cause),
              procedureKey: "unit.upgrade.request",
              source: "direct-control-facade",
              ...civ7ControlOrpcErrorCorrelationData(context),
            },
          }),
      });
    }
  ),
  unitResettleCheckProcedure: module.resettle.check.effect(function* ({ context, errors, input }) {
    const validation = yield* Effect.tryPromise({
      try: () => context.directControl.checkCiv7UnitResettle(input, context.endpointDefaults),
      catch: (cause) =>
        errors.UNIT_REQUEST_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "unit.resettle.check",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
    return {
      action: {
        kind: "resettle",
        unitId: input.unitId,
        destination: input.destination,
      },
      available: validation.valid,
    } satisfies Civ7UnitResettleCheckResult;
  }),
  unitResettleRequestProcedure: civ7ControlOrpcMutationProcedure(module.resettle.request).effect(
    function* ({ context, errors, input }) {
      return yield* unitCommandRequest({
        input: {
          kind: "resettle",
          unitId: input.unitId,
          destination: input.destination,
        },
        procedureKey: "unit.resettle.request",
        check: () => context.directControl.checkCiv7UnitResettle(input, context.endpointDefaults),
        send: () => context.directControl.sendCiv7UnitResettle(input, context.endpointDefaults),
        onPrecheckFailure: (cause) =>
          errors.UNIT_REQUEST_UNAVAILABLE({
            data: {
              detail: civ7ControlOrpcFailureDetail(cause),
              procedureKey: "unit.resettle.request",
              source: "direct-control-facade",
              ...civ7ControlOrpcErrorCorrelationData(context),
            },
          }),
      });
    }
  ),
};

type UnitCommandProcedureInput =
  | Readonly<{
      kind: "upgrade";
      unitId: Civ7UnitUpgradeInput["unitId"];
    }>
  | Readonly<{
      kind: "resettle";
      unitId: Civ7UnitResettleInput["unitId"];
      destination: Civ7UnitResettleInput["destination"];
    }>;
type UnitCommandProcedureKey = "unit.upgrade.request" | "unit.resettle.request";

function unitCommandRequest<E>(
  options: Readonly<{
    input: UnitCommandProcedureInput;
    procedureKey: UnitCommandProcedureKey;
    check: () => Promise<Civ7ControlOrpcUnitCommandCheckResult>;
    send: () => Promise<Civ7ControlOrpcUnitCommandSendResult>;
    onPrecheckFailure: (cause: unknown) => E;
  }>
): Effect.Effect<Civ7UnitCommandResult, E> {
  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: options.check,
      catch: options.onPrecheckFailure,
    });
    if (!precheck.valid) {
      return unitCommandResult({
        input: options.input,
        procedureKey: options.procedureKey,
        dispatchState: "not-sent",
        evidence: { kind: "not-sent" },
      });
    }

    const sendAttempt = yield* attemptUnitCommandSend(options.send).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok) {
      const dispatchState = unitCommandDispatchState(sendAttempt.dispatchStatus);
      return unitCommandResult({
        input: options.input,
        procedureKey: options.procedureKey,
        dispatchState,
        evidence:
          dispatchState === "not-sent" ? { kind: "not-sent" } : { kind: "send-result-unavailable" },
      });
    }

    const send = sendAttempt.value;
    if (!send.sent) {
      return unitCommandResult({
        input: options.input,
        procedureKey: options.procedureKey,
        dispatchState: "not-sent",
        evidence: { kind: "not-sent" },
      });
    }

    const postcheck = yield* Effect.tryPromise(options.check).pipe(
      Effect.uninterruptible,
      Effect.option
    );
    if (Option.isNone(postcheck)) {
      return unitCommandResult({
        input: options.input,
        procedureKey: options.procedureKey,
        dispatchState: "sent",
        evidence: { kind: "postcheck-unavailable" },
      });
    }

    return unitCommandResult({
      input: options.input,
      procedureKey: options.procedureKey,
      dispatchState: "sent",
      evidence: {
        kind: "observed",
        beforeValidation: send.validation,
        afterValidation: postcheck.value,
        before: send.before,
        after: send.after,
      },
    });
  });
}

function unitCommandResult(
  input: Readonly<{
    input: UnitCommandProcedureInput;
    procedureKey: UnitCommandProcedureKey;
    dispatchState: UnitCommandDispatchState;
    evidence: Civ7UnitCommandPostconditionEvidence;
  }>
): Civ7UnitCommandResult {
  const postcondition = unitCommandPostconditionSummary(input.evidence);
  const status =
    input.dispatchState === "unknown"
      ? "dispatch-unknown"
      : civ7MutationRequestStatusWithoutGuarded({
          sent: input.dispatchState === "sent",
          postcondition,
        });
  return {
    action: unitCommandSummary(input.input),
    status,
    postcondition,
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: input.procedureKey,
      inspectKind: "inspect-unit-command",
      inspectLabel:
        "Inspect ready-unit and unit command evidence before attempting another unit command request.",
      doNotRepeatLabel:
        "Do not repeat this unit command until fresh unit readiness and postcondition evidence is read.",
    }),
  };
}

type UnitCommandSendAttempt =
  | Readonly<{
      ok: true;
      value: Civ7ControlOrpcUnitCommandSendResult;
    }>
  | Readonly<{
      ok: false;
      dispatchStatus: Civ7ControlOrpcCommandDispatchStatus;
    }>;

function attemptUnitCommandSend(
  send: () => Promise<Civ7ControlOrpcUnitCommandSendResult>
): Effect.Effect<UnitCommandSendAttempt> {
  return Effect.promise(async () => {
    try {
      return {
        ok: true,
        value: await send(),
      };
    } catch (cause) {
      return {
        ok: false,
        dispatchStatus: civ7DirectControlDispatchStatus(cause),
      };
    }
  });
}

type UnitCommandDispatchState = "not-sent" | "sent" | "unknown";

function unitCommandDispatchState(
  status: Civ7ControlOrpcCommandDispatchStatus
): UnitCommandDispatchState {
  if (status === "not-dispatched") return "not-sent";
  return "unknown";
}

function unitCommandSummary(input: UnitCommandProcedureInput): Civ7UnitCommandResult["action"] {
  if (input.kind === "upgrade") {
    return {
      kind: "upgrade",
      unitId: input.unitId,
    };
  }
  return {
    kind: "resettle",
    unitId: input.unitId,
    destination: input.destination,
  };
}

function unitCommandPostconditionSummary(
  evidence: Civ7UnitCommandPostconditionEvidence
): Civ7UnitCommandResult["postcondition"] {
  const source = civ7UnitCommandPostcondition(evidence);
  const guarded =
    source.classification === "not-sent" ||
    source.classification === "no-state-change" ||
    source.classification === "validation-changed" ||
    source.classification === "missing-postcondition";
  const confidence = guarded ? "unverified" : "confirmed";
  return {
    classification: source.classification,
    reason: source.reason,
    outcome: unitCommandProofOutcome(source.classification),
    confidence,
    confirmed: confidence === "confirmed",
    noRepeatAfterUnverified: guarded,
  };
}

function unitCommandProofOutcome(
  classification: Civ7UnitCommandResult["postcondition"]["classification"]
): Civ7UnitCommandResult["postcondition"]["outcome"] {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "no-state-change":
      return "no-state-change";
    case "missing-postcondition":
      return "unknown";
    case "queue-advanced":
      return "cleared";
    case "selected-unit-changed":
    case "activity-changed":
    case "unit-state-changed":
    case "blocker-changed":
    case "validation-changed":
      return "state-changed";
  }
}
