import type { MiddlewareOptions, MiddlewareResult, ORPCErrorConstructorMap } from "@orpc/server";

import type { Civ7ControlOrpcContext } from "../context";
import type { Civ7ControlOrpcErrorMap } from "../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../metadata";
import { isCiv7ControllerMutationProof } from "../model/controller-proof";
import { civ7ControlOrpcErrorCorrelationData } from "../model/correlation";

type Civ7ControllerAdmissionErrorConstructors = ORPCErrorConstructorMap<
  Pick<Civ7ControlOrpcErrorMap, "CONTROLLER_CAPABILITY_UNAVAILABLE">
>;

type Civ7ControllerAdmissionMiddleware = <TOutput>(
  options: MiddlewareOptions<
    Civ7ControlOrpcContext,
    TOutput,
    Civ7ControllerAdmissionErrorConstructors,
    Civ7ControlOrpcProcedureMeta
  >
) => Promise<MiddlewareResult<Record<never, never>, TOutput>>;

export const civ7ControllerAdmissionMiddleware: Civ7ControllerAdmissionMiddleware = async ({
  context,
  errors,
  next,
  path,
  procedure,
}) => {
  if (context.controller == null) return next();

  const meta = procedure["~orpc"].meta;
  const procedureKey = meta.procedureKey ?? path.join(".");
  if (procedureKey === "readiness.current") return next();

  const risk = meta.risk ?? "runtime-support";
  const supported =
    risk === "mutation"
      ? context.controller.supportedMutationProcedures?.includes(procedureKey) === true
      : risk === "read-only" &&
        context.controller.supportedReadProcedures?.includes(procedureKey) === true;

  if (!supported) {
    throw errors.CONTROLLER_CAPABILITY_UNAVAILABLE({
      data: {
        procedureKey,
        risk,
        source: "controller-context",
        reason: "procedure-not-supported",
        ...civ7ControlOrpcErrorCorrelationData(context),
      },
    });
  }

  if (risk === "mutation" && !isCiv7ControllerMutationProof(context.controllerProof)) {
    throw errors.CONTROLLER_CAPABILITY_UNAVAILABLE({
      data: {
        procedureKey,
        risk,
        source: "controller-context",
        reason: "proof-required",
        ...civ7ControlOrpcErrorCorrelationData(context),
      },
    });
  }

  return next();
};
