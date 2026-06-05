import { civ7ControlOrpcErrorCorrelationData } from "../model/correlation";
import { civ7ControlOrpcImplementer } from "../procedure";

import { civ7MutationProcedureKey } from "./mutation-procedure-key";

export const civ7MutationReadinessMiddleware =
  civ7ControlOrpcImplementer.middleware(async (
    { context, errors, next, path, procedure },
  ) => {
    const procedureKey = civ7MutationProcedureKey(procedure["~orpc"].meta, path);
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
