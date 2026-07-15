import { Effect } from "effect";
import type { EffectMiddlewareOptions } from "effect-orpc";

import type { Civ7ControlOrpcContext } from "../context";
import type { Civ7ControlOrpcErrorMap } from "../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../metadata";
import { isCiv7ControllerMutationProof } from "../model/controller-proof";
import { civ7ControlOrpcErrorCorrelationData } from "../model/correlation";

import { civ7MutationProcedureKey } from "./mutation-procedure-key";

type Civ7MutationReadinessErrorMap = Pick<
  Civ7ControlOrpcErrorMap,
  "MUTATION_READINESS_REQUIRED" | "MUTATION_READINESS_UNAVAILABLE"
>;

type Civ7MutationReadinessMiddlewareOptions<TOutput> = EffectMiddlewareOptions<
  Civ7ControlOrpcContext,
  TOutput,
  Civ7MutationReadinessErrorMap,
  never,
  Civ7ControlOrpcProcedureMeta
>;

export function* civ7MutationReadinessMiddleware<TOutput>({
  context,
  errors,
  next,
  path,
  procedure,
}: Civ7MutationReadinessMiddlewareOptions<TOutput>) {
  const procedureKey = civ7MutationProcedureKey(procedure["~orpc"].meta, path);
  const status = yield* Effect.tryPromise({
    try: () => context.directControl.getCiv7PlayableStatus(context.endpointDefaults),
    catch: () =>
      errors.MUTATION_READINESS_UNAVAILABLE({
        data: {
          procedureKey,
          source: "direct-control-facade",
          risk: "mutation",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });

  const readinessRequired = Effect.fail(
    errors.MUTATION_READINESS_REQUIRED({
      data: {
        procedureKey,
        source: "readiness.current",
        risk: "mutation",
        playable: false,
        readiness: status.readiness,
        ...civ7ControlOrpcErrorCorrelationData(context),
      },
    })
  );
  yield* Effect.when(
    readinessRequired,
    () => status.playable !== true && !civ7ControllerMutationReadinessBypass(context, procedureKey)
  );

  return yield* next();
}

function civ7ControllerMutationReadinessBypass(
  context: Civ7ControlOrpcContext,
  procedureKey: string
): boolean {
  return (
    context.controller?.supportedMutationProcedures?.includes(procedureKey) === true &&
    isCiv7ControllerMutationProof(context.controllerProof)
  );
}
