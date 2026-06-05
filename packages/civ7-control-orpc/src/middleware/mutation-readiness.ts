import type { Civ7ControlOrpcProcedureMeta } from "../metadata";
import { civ7ControlOrpcErrorCorrelationData } from "../model/correlation";
import { civ7ControlOrpcImplementer } from "../procedure";

export const civ7MutationReadinessMiddleware =
  civ7ControlOrpcImplementer.middleware(async (
    { context, errors, next, path, procedure },
  ) => {
    const procedureKey = mutationProcedureKey(procedure["~orpc"].meta, path);
    const status = await context.directControl.getCiv7PlayableStatus(
      context.endpointDefaults,
    ).catch(() => {
      throw errors.MUTATION_READINESS_UNAVAILABLE({
        data: {
          procedureKey,
          source: "direct-control-facade",
          risk: "mutation",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      });
    });

    if (!status.playable) {
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
  });

function mutationProcedureKey(
  meta: Civ7ControlOrpcProcedureMeta,
  path: readonly string[],
): string {
  if (typeof meta.procedureKey === "string" && meta.procedureKey.trim()) {
    return meta.procedureKey;
  }
  if (path.length > 0) return path.join(".");
  return "unknown-procedure";
}
