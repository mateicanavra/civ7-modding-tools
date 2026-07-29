import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import { civ7MutationRequestStatusWithoutGuarded } from "#civ7-control-service/model/policy/mutation-result";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcProductionChoiceCheckResult,
  Civ7ControlOrpcProductionChoiceSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7CityProductionChoiceCheckResult,
  Civ7CityProductionChoiceInput,
  Civ7CityProductionChoiceResult,
} from "../contract";
import { pollProductionChoicePostcondition } from "../model/policy/production-choice-polling";
import {
  type Civ7ProductionChoicePostconditionEvidence,
  civ7ProductionChoicePostcondition,
} from "../model/policy/production-choice-postcondition";
import { module } from "../module";

const DEFAULT_PRODUCTION_CHOICE_WAIT_MS = 3_000;
const MIN_PRODUCTION_CHOICE_WAIT_MS = 1_000;
const MAX_PRODUCTION_CHOICE_WAIT_MS = 6_000;

export const productionChoice = {
  check: module.production.choice.check.effect(function* ({ context, errors, input }) {
    const validation = yield* Effect.tryPromise({
      try: () => context.directControl.checkCiv7ProductionChoice(input, context.endpointDefaults),
      catch: (cause) =>
        errors.PRODUCTION_CHOICE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "city.production.choice.check",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
    return {
      cityId: input.cityId,
      args: { ...input.args },
      available: validation.valid,
    } satisfies Civ7CityProductionChoiceCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.production.choice.request).effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* productionChoiceRequest({
      input,
      waitMs: productionChoiceWaitMs(context.endpointDefaults?.timeoutMs),
      check: (timeoutMs) =>
        context.directControl.checkCiv7ProductionChoice(
          input,
          timeoutMs === undefined
            ? context.endpointDefaults
            : {
                ...context.endpointDefaults,
                timeoutMs,
              }
        ),
      send: () => context.directControl.sendCiv7ProductionChoice(input, context.endpointDefaults),
      onPrecheckFailure: (cause) =>
        errors.PRODUCTION_CHOICE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "city.production.choice.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }),
};

function productionChoiceRequest<E>(
  options: Readonly<{
    input: Civ7CityProductionChoiceInput;
    waitMs: number;
    check: (timeoutMs?: number) => Promise<Civ7ControlOrpcProductionChoiceCheckResult>;
    send: () => Promise<Civ7ControlOrpcProductionChoiceSendResult>;
    onPrecheckFailure: (cause: unknown) => E;
  }>
): Effect.Effect<Civ7CityProductionChoiceResult, E> {
  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => options.check(),
      catch: options.onPrecheckFailure,
    });
    if (!precheck.valid) {
      return productionChoiceResult({
        input: options.input,
        dispatchState: "not-sent",
        evidence: { kind: "not-sent" },
      });
    }

    const sendAttempt = yield* attemptProductionChoiceSend(options.send).pipe(
      Effect.uninterruptible
    );
    if (!sendAttempt.ok) {
      const dispatchState = productionChoiceDispatchState(sendAttempt.dispatchStatus);
      return productionChoiceResult({
        input: options.input,
        dispatchState,
        evidence:
          dispatchState === "not-sent" ? { kind: "not-sent" } : { kind: "send-result-unavailable" },
      });
    }

    const send = sendAttempt.value;
    if (!send.sent) {
      return productionChoiceResult({
        input: options.input,
        dispatchState: "not-sent",
        evidence: { kind: "not-sent" },
      });
    }

    const evidence = yield* pollProductionChoicePostcondition({
      input: options.input,
      send,
      check: options.check,
      waitMs: options.waitMs,
    });
    return productionChoiceResult({
      input: options.input,
      dispatchState: "sent",
      evidence,
    });
  });
}

function productionChoiceResult(
  input: Readonly<{
    input: Civ7CityProductionChoiceInput;
    dispatchState: ProductionChoiceDispatchState;
    evidence: Civ7ProductionChoicePostconditionEvidence;
  }>
): Civ7CityProductionChoiceResult {
  const postcondition = civ7ProductionChoicePostcondition(input.evidence);
  const base = {
    cityId: input.input.cityId,
    args: { ...input.input.args },
  };

  if (input.dispatchState === "not-sent") {
    if (postcondition.classification !== "not-sent") {
      throw new Error(
        "A production choice that was not sent must report the not-sent postcondition."
      );
    }
    const status = "not-sent" as const;
    return {
      ...base,
      status,
      postcondition,
      nextSteps: productionChoiceNextSteps(status),
    };
  }

  if (input.dispatchState === "unknown") {
    if (postcondition.classification !== "missing-postcondition") {
      throw new Error("Unknown production dispatch must report missing postcondition evidence.");
    }
    const status = "dispatch-unknown" as const;
    return {
      ...base,
      status,
      postcondition,
      nextSteps: productionChoiceNextSteps(status),
    };
  }

  if (postcondition.classification === "not-sent") {
    throw new Error("A sent production choice cannot report the not-sent postcondition.");
  }
  const status = civ7MutationRequestStatusWithoutGuarded({
    sent: true,
    postcondition,
  });
  if (postcondition.confidence === "confirmed") {
    if (status !== "sent-confirmed") {
      throw new Error("Confirmed production evidence must produce sent-confirmed status.");
    }
    return {
      ...base,
      status,
      postcondition,
      nextSteps: productionChoiceNextSteps(status),
    };
  }
  if (status !== "sent-unverified") {
    throw new Error("Unverified production evidence must produce sent-unverified status.");
  }
  return {
    ...base,
    status,
    postcondition,
    nextSteps: productionChoiceNextSteps(status),
  };
}

function productionChoiceNextSteps(
  status: "not-sent"
): Extract<Civ7CityProductionChoiceResult, { status: "not-sent" }>["nextSteps"];
function productionChoiceNextSteps(
  status: "dispatch-unknown"
): Extract<Civ7CityProductionChoiceResult, { status: "dispatch-unknown" }>["nextSteps"];
function productionChoiceNextSteps(
  status: "sent-confirmed"
): Extract<Civ7CityProductionChoiceResult, { status: "sent-confirmed" }>["nextSteps"];
function productionChoiceNextSteps(
  status: "sent-unverified"
): Extract<Civ7CityProductionChoiceResult, { status: "sent-unverified" }>["nextSteps"];
function productionChoiceNextSteps(
  status: "dispatch-unknown" | "not-sent" | "sent-confirmed" | "sent-unverified"
): Civ7CityProductionChoiceResult["nextSteps"] {
  if (status === "not-sent") {
    return [
      {
        kind: "inspect-production",
        source: "city.production.choice.request",
        label:
          "Inspect production availability and blocker evidence before attempting another production choice.",
      },
    ];
  }
  if (status === "sent-confirmed") {
    return [
      {
        kind: "refresh-attention",
        source: "city.production.choice.request",
        label: "Refresh current attention before choosing the next player action.",
      },
    ];
  }
  return [
    {
      kind: "do-not-repeat",
      source: "city.production.choice.request",
      label:
        "Do not repeat this production choice until fresh production and blocker evidence is read.",
    },
  ];
}

type ProductionChoiceSendAttempt =
  | Readonly<{
      ok: true;
      value: Civ7ControlOrpcProductionChoiceSendResult;
    }>
  | Readonly<{
      ok: false;
      dispatchStatus: Civ7ControlOrpcCommandDispatchStatus;
    }>;

function attemptProductionChoiceSend(
  send: () => Promise<Civ7ControlOrpcProductionChoiceSendResult>
): Effect.Effect<ProductionChoiceSendAttempt> {
  return Effect.promise(async () => {
    try {
      return {
        ok: true,
        value: await send(),
      };
    } catch (cause) {
      return {
        ok: false,
        dispatchStatus: civ7DirectControlDispatchStatus(cause),
      };
    }
  });
}

type ProductionChoiceDispatchState = "not-sent" | "sent" | "unknown";

function productionChoiceDispatchState(
  status: Civ7ControlOrpcCommandDispatchStatus
): ProductionChoiceDispatchState {
  return status === "not-dispatched" ? "not-sent" : "unknown";
}

function productionChoiceWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_PRODUCTION_CHOICE_WAIT_MS,
    Math.max(MIN_PRODUCTION_CHOICE_WAIT_MS, timeoutMs ?? DEFAULT_PRODUCTION_CHOICE_WAIT_MS)
  );
}
