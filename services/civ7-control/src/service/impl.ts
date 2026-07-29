import { Effect, Layer, ManagedRuntime, Match, Option } from "effect";
import {
  type EffectImplementerInternal,
  type EffectOrORPCMiddleware,
  implementEffect,
} from "effect-orpc";
import type { Context } from "./context";
import { contract } from "./contract";
import { civ7ControllerAdmissionMiddleware } from "./middleware/controller-admission";
import {
  civ7ControlOrpcErrorCorrelationData,
  isCiv7ControlOrpcCorrelationId,
} from "./model/dto/correlation";
import type { Civ7ControlOrpcErrorMap } from "./model/errors/control";
import type { Civ7ControlOrpcProcedureMeta } from "./model/policy/metadata";
import { Civ7ControlOrpcAdmissionRefusal } from "./model/ports/context";

const runtime = ManagedRuntime.make(Layer.empty);
const impl = implementEffect(contract, runtime).$context<Context>();

type Service = EffectImplementerInternal<typeof contract, Context, Context, never, never>;
export type ServiceModule<K extends keyof typeof contract> = Service[K];

const correlation = impl.middleware(({ context, errors, next }) =>
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

type ProcedureAdmissionMiddleware = EffectOrORPCMiddleware<
  Context,
  Record<never, never>,
  unknown,
  unknown,
  Pick<Civ7ControlOrpcErrorMap, "CONTROL_ADMISSION_UNAVAILABLE">,
  never,
  Civ7ControlOrpcProcedureMeta
>;

const procedureAdmission: ProcedureAdmissionMiddleware = function* ({
  context,
  errors,
  next,
  path,
  procedure,
}) {
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

export const service: Service = impl
  .use(correlation)
  .use(civ7ControllerAdmissionMiddleware)
  .use(procedureAdmission);
