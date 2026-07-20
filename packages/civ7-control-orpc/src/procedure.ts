import { ORPCError } from "@orpc/server";
import { Effect, Layer, ManagedRuntime, Match, Option } from "effect";
import {
  type EffectImplementer,
  type EffectImplementerInternal,
  type EffectOrORPCMiddleware,
  implementEffect,
} from "effect-orpc";
import { Civ7ControlOrpcAdmissionRefusal, type Civ7ControlOrpcContext } from "./context";
import { Civ7ControlOrpcContract } from "./contract";
import type { Civ7ControlOrpcErrorMap } from "./errors";
import type { Civ7ControlOrpcProcedureMeta } from "./metadata";
import { civ7ControllerAdmissionMiddleware } from "./middleware/controller-admission";
import {
  civ7ControlOrpcErrorCorrelationData,
  isCiv7ControlOrpcCorrelationId,
} from "./model/correlation";

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

const civ7ControlOrpcCommonImplementer = civ7ControlOrpcBaseImplementer
  .use(civ7ControlOrpcCorrelationMiddleware)
  .use(civ7ControllerAdmissionMiddleware)
  .use(civ7ControlOrpcSafeErrorMiddleware);

type Civ7ControlOrpcProcedureAdmissionMiddleware = EffectOrORPCMiddleware<
  Civ7ControlOrpcContext,
  Record<never, never>,
  unknown,
  unknown,
  Pick<Civ7ControlOrpcErrorMap, "CONTROL_ADMISSION_UNAVAILABLE">,
  never,
  Civ7ControlOrpcProcedureMeta
>;

/** Host admission is the outermost Effect boundary around every control procedure. */
export const civ7ControlOrpcProcedureAdmissionMiddleware: Civ7ControlOrpcProcedureAdmissionMiddleware =
  function* ({ context, errors, next, path, procedure }) {
    const procedureKey = procedure["~orpc"].meta.procedureKey ?? path.join(".");
    return yield* Option.match(Option.fromNullable(context.procedureAdmission), {
      onNone: () => next(),
      onSome: (admission) =>
        admission(next()).pipe(
          Effect.catchIf(
            (cause): cause is Civ7ControlOrpcAdmissionRefusal =>
              cause instanceof Civ7ControlOrpcAdmissionRefusal,
            (cause) =>
              Effect.fail(
                errors.CONTROL_ADMISSION_UNAVAILABLE({
                  data: {
                    procedureKey,
                    source: "host-procedure-admission",
                    reason: "temporarily-unavailable",
                    ...Option.match(Option.fromNullable(cause.retryAtMs), {
                      onNone: () => ({}),
                      onSome: (retryAtMs) => ({ retryAtMs }),
                    }),
                    ...civ7ControlOrpcErrorCorrelationData(context),
                  },
                })
              )
          )
        ),
    });
  };

export const civ7ControlOrpcImplementer: Civ7ControlOrpcImplementer =
  civ7ControlOrpcCommonImplementer.use(civ7ControlOrpcProcedureAdmissionMiddleware);

function civ7ControlOrpcPublicError(err: unknown): ORPCError<any, any> {
  if (err instanceof ORPCError) return err;
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Civ7 control-oRPC procedure failed.",
  });
}
