import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7UnitTargetActionCheckResult } from "../contract";
import {
  executeCiv7UnitTargetAction,
  resolveCiv7UnitTargetAction,
} from "../model/policy/target-action-execution";
import { module } from "../module";

/** Service-owned native action resolution, guarded dispatch, and focused transition proof. */
export const targetAction = {
  check: module.target.action.check.effect(function* ({ context, errors, input }) {
    const resolution = yield* resolveCiv7UnitTargetAction(input, context).pipe(
      Effect.mapError((cause) =>
        errors.UNIT_TARGET_ACTION_UNAVAILABLE({
          data: unitTargetUnavailableData("unit.target.action.check", cause, context),
        })
      )
    );
    const target = {
      unitId: input.unitId,
      target: { x: input.x, y: input.y },
    };
    if (resolution.kind === "admitted") {
      return {
        ...target,
        available: true,
        classification: "action-available",
        selectedAction: resolution.action,
      } satisfies Civ7UnitTargetActionCheckResult;
    }
    if (resolution.kind === "dedicated-war-workflow-required") {
      return {
        ...target,
        available: false,
        classification: "dedicated-war-workflow-required",
        selectedAction: resolution.action,
      } satisfies Civ7UnitTargetActionCheckResult;
    }
    return {
      ...target,
      available: false,
      classification: "not-admitted",
      selectedAction: null,
    } satisfies Civ7UnitTargetActionCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.target.action.request).effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* executeCiv7UnitTargetAction(input, context).pipe(
      Effect.mapError((cause) =>
        errors.UNIT_TARGET_ACTION_UNAVAILABLE({
          data: unitTargetUnavailableData("unit.target.action.request", cause, context),
        })
      )
    );
  }),
};

function unitTargetUnavailableData(
  procedureKey: "unit.target.action.check" | "unit.target.action.request",
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
