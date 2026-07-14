import { ORPCError } from "@orpc/server";
import { Layer, ManagedRuntime, Match, Option } from "effect";
import {
  type EffectImplementer,
  type EffectImplementerInternal,
  implementEffect,
} from "effect-orpc";
import type { Civ7ControlOrpcContext } from "./context";
import { Civ7ControlOrpcContract } from "./contract";
import { civ7ControllerAdmissionMiddleware } from "./middleware/controller-admission";
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

const civ7ControlOrpcSafeErrorMiddleware = civ7ControlOrpcBaseImplementer.middleware(({ next }) =>
  Promise.resolve(next()).catch((err: unknown) => Promise.reject(civ7ControlOrpcPublicError(err)))
);

const civ7ControlOrpcCorrelationMiddleware = civ7ControlOrpcBaseImplementer.middleware(
  ({ context, errors, next }) =>
    Option.match(Option.fromNullable(context.correlation?.correlationId), {
      onNone: () => next(),
      onSome: (correlationId) =>
        Match.value(isCiv7ControlOrpcCorrelationId(correlationId)).pipe(
          Match.when(true, () => next({ context: { correlation: { correlationId } } })),
          Match.orElse(() =>
            Promise.reject(
              errors.CORRELATION_ID_INVALID({
                data: {
                  source: "context.correlation",
                  reason: "correlation-id-invalid",
                },
              })
            )
          )
        ),
    })
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
  .use(civ7ControllerAdmissionMiddleware)
  .use(civ7ControlOrpcSafeErrorMiddleware);

function civ7ControlOrpcPublicError(err: unknown): ORPCError<any, any> {
  if (err instanceof ORPCError) return err;
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Civ7 control-oRPC procedure failed.",
  });
}
