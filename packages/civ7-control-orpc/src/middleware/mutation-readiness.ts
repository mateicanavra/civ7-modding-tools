import type { MiddlewareOptions, MiddlewareResult, ORPCErrorConstructorMap } from "@orpc/server";

import type { Civ7ControlOrpcContext } from "../context";
import type { Civ7ControlOrpcErrorMap } from "../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../metadata";
import { isCiv7ControllerMutationProof } from "../model/controller-proof";
import { civ7ControlOrpcErrorCorrelationData } from "../model/correlation";

import { civ7MutationProcedureKey } from "./mutation-procedure-key";

type Civ7MutationReadinessErrorConstructors = ORPCErrorConstructorMap<
  Pick<Civ7ControlOrpcErrorMap, "MUTATION_READINESS_REQUIRED" | "MUTATION_READINESS_UNAVAILABLE">
>;

type Civ7MutationReadinessMiddleware = <TOutput>(
  options: MiddlewareOptions<
    Civ7ControlOrpcContext,
    TOutput,
    Civ7MutationReadinessErrorConstructors,
    Civ7ControlOrpcProcedureMeta
  >
) => Promise<MiddlewareResult<Record<never, never>, TOutput>>;

export const civ7MutationReadinessMiddleware: Civ7MutationReadinessMiddleware = async ({
  context,
  errors,
  next,
  path,
  procedure,
}) => {
  const procedureKey = civ7MutationProcedureKey(procedure["~orpc"].meta, path);
  const status = await context.directControl
    .getCiv7PlayableStatus(context.endpointDefaults)
    .catch(() => {
      throw errors.MUTATION_READINESS_UNAVAILABLE({
        data: {
          procedureKey,
          source: "direct-control-facade",
          risk: "mutation",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      });
    });

  if (status.playable !== true && !civ7ControllerMutationReadinessBypass(context, procedureKey)) {
    throw errors.MUTATION_READINESS_REQUIRED({
      data: {
        procedureKey,
        source: "readiness.current",
        risk: "mutation",
        playable: false,
        readiness: status.readiness,
        ...civ7ControlOrpcErrorCorrelationData(context),
      },
    });
  }

  return next();
};

function civ7ControllerMutationReadinessBypass(
  context: Civ7ControlOrpcContext,
  procedureKey: string
): boolean {
  return (
    context.controller?.supportedMutationProcedures?.includes(procedureKey) === true &&
    isCiv7ControllerMutationProof(context.controllerProof)
  );
}
