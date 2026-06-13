import { ORPCError } from "@orpc/server";
import { Layer, ManagedRuntime } from "effect";
import {
  implementEffect,
  type EffectImplementer,
  type EffectImplementerInternal,
} from "effect-orpc";

import { Civ7ControlOrpcContract } from "./contract";
import type { Civ7ControlOrpcContext } from "./context";
import { isCiv7ControlOrpcCorrelationId } from "./model/correlation";

export const civ7ControlOrpcEffectRuntime = ManagedRuntime.make(Layer.empty);

const civ7ControlOrpcBaseImplementer = implementEffect(
  Civ7ControlOrpcContract,
  civ7ControlOrpcEffectRuntime
).$context<Civ7ControlOrpcContext>() satisfies EffectImplementer<
  typeof Civ7ControlOrpcContract,
  Civ7ControlOrpcContext & Record<never, never>,
  Civ7ControlOrpcContext,
  never,
  never
>;

const civ7ControlOrpcSafeErrorMiddleware = civ7ControlOrpcBaseImplementer.middleware(
  async ({ next }) => {
    try {
      return await next();
    } catch (err) {
      throw civ7ControlOrpcPublicError(err);
    }
  }
);

const civ7ControlOrpcCorrelationMiddleware = civ7ControlOrpcBaseImplementer.middleware(
  ({ context, errors, next }) => {
    const correlationId = context.correlation?.correlationId;
    if (correlationId == null) return next();
    if (!isCiv7ControlOrpcCorrelationId(correlationId)) {
      throw errors.CORRELATION_ID_INVALID({
        data: {
          source: "context.correlation",
          reason: "correlation-id-invalid",
        },
      });
    }

    return next({ context: { correlation: { correlationId } } });
  }
);

export type Civ7ControlOrpcImplementer = EffectImplementerInternal<
  typeof Civ7ControlOrpcContract,
  Civ7ControlOrpcContext & Record<never, never>,
  Civ7ControlOrpcContext,
  never,
  never
>;

export const civ7ControlOrpcImplementer: Civ7ControlOrpcImplementer = civ7ControlOrpcBaseImplementer
  .use(civ7ControlOrpcCorrelationMiddleware)
  .use(civ7ControlOrpcSafeErrorMiddleware);

function civ7ControlOrpcPublicError(err: unknown): ORPCError<any, any> {
  if (err instanceof ORPCError) return err;
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Civ7 control-oRPC procedure failed.",
  });
}
