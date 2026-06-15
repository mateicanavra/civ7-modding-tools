import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7MutationNextSteps, civ7MutationRequestStatus } from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7UnitCommandResult,
  Civ7UnitResettleInput,
  Civ7UnitUpgradeInput,
} from "../contract";

type Civ7UnitCommandRuntimeResult = Awaited<
  ReturnType<Civ7ControlOrpcContext["directControl"]["requestCiv7UnitCommand"]>
>;

export const unitUpgradeRequestProcedure = civ7ControlOrpcMutationProcedure(
  civ7ControlOrpcImplementer.unit.upgrade.request
).effect(function* ({ context, errors, input }) {
  return yield* Effect.tryPromise({
    try: async () => {
      const procedureInput = {
        mode: "upgrade" as const,
        ...input,
      };
      const result = await context.directControl.requestCiv7UnitCommand(
        unitCommandRuntimeRequest(procedureInput),
        context.endpointDefaults
      );
      return unitCommandResult(procedureInput, result, "unit.upgrade.request");
    },
    catch: (cause) =>
      errors.UNIT_REQUEST_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: "unit.upgrade.request",
          source: "direct-control-facade",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });
});

export const unitResettleRequestProcedure = civ7ControlOrpcMutationProcedure(
  civ7ControlOrpcImplementer.unit.resettle.request
).effect(function* ({ context, errors, input }) {
  return yield* Effect.tryPromise({
    try: async () => {
      const procedureInput = {
        mode: "resettle" as const,
        ...input,
      };
      const result = await context.directControl.requestCiv7UnitCommand(
        unitCommandRuntimeRequest(procedureInput),
        context.endpointDefaults
      );
      return unitCommandResult(procedureInput, result, "unit.resettle.request");
    },
    catch: (cause) =>
      errors.UNIT_REQUEST_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: "unit.resettle.request",
          source: "direct-control-facade",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });
});

type UnitCommandProcedureInput =
  | (Civ7UnitUpgradeInput & Readonly<{ mode: "upgrade" }>)
  | (Civ7UnitResettleInput & Readonly<{ mode: "resettle" }>);

type UnitCommandProcedureKey = "unit.upgrade.request" | "unit.resettle.request";

function unitCommandRuntimeRequest(
  input: UnitCommandProcedureInput
): Parameters<Civ7ControlOrpcContext["directControl"]["requestCiv7UnitCommand"]>[0] {
  if (input.mode === "upgrade") {
    return {
      unitId: input.unitId,
      operationType: "UNITCOMMAND_UPGRADE",
      args: {},
    };
  }

  return {
    unitId: input.unitId,
    operationType: "UNITCOMMAND_RESETTLE",
    args: {
      X: input.destination.x,
      Y: input.destination.y,
    },
  };
}

function unitCommandResult(
  input: UnitCommandProcedureInput,
  result: Civ7UnitCommandRuntimeResult,
  procedureKey: UnitCommandProcedureKey
): Civ7UnitCommandResult {
  const postcondition = unitCommandPostconditionSummary(result);
  const status = civ7MutationRequestStatus({
    sent: result.sent,
    postcondition,
  });

  return {
    action: unitCommandSummary(input),
    sent: result.sent,
    status,
    validation: {
      beforeValid: result.before.valid,
      afterValid: result.after.valid,
    },
    postcondition,
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: procedureKey,
      inspectKind: "inspect-unit-command",
      inspectLabel:
        "Inspect ready-unit and unit command evidence before attempting another unit command request.",
      doNotRepeatLabel:
        "Do not repeat this unit command until fresh unit readiness and postcondition evidence is read.",
    }),
  };
}

function unitCommandSummary(input: UnitCommandProcedureInput): Civ7UnitCommandResult["action"] {
  if (input.mode === "upgrade") {
    return {
      kind: "upgrade",
      unitId: input.unitId,
    };
  }

  return {
    kind: "resettle",
    unitId: input.unitId,
    destination: {
      x: input.destination.x,
      y: input.destination.y,
    },
  };
}

function unitCommandPostconditionSummary(
  result: Civ7UnitCommandRuntimeResult
): Civ7UnitCommandResult["postcondition"] {
  const source = result.postcondition;
  if (source == null) {
    return {
      classification: "missing-postcondition",
      reason: "The unit command request did not include source-owned unit postcondition evidence.",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }

  const guarded =
    source.classification === "not-sent" ||
    source.classification === "no-state-change" ||
    source.classification === "validation-changed";
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
