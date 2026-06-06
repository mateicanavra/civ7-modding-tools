import type { Civ7RuntimeProbe } from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type { Civ7ControlOrpcPlayableStatusResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7ReadinessCurrentResult } from "../contract";

export const readinessCurrentProcedure =
  civ7ControlOrpcImplementer.readiness.current.effect(function* ({
    context,
    errors,
  }) {
    return yield* Effect.tryPromise({
      try: async () =>
        readinessCurrentResult(
          await context.directControl.getCiv7PlayableStatus(
            context.endpointDefaults,
          ),
          context,
        ),
      catch: () =>
        errors.READINESS_CURRENT_UNAVAILABLE({
          data: {
            procedureKey: "readiness.current",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function readinessCurrentResult(
  status: Civ7ControlOrpcPlayableStatusResult,
  context: Civ7ControlOrpcContext,
): Civ7ReadinessCurrentResult {
  return {
    playable: status.playable,
    readiness: status.readiness,
    capability: readinessCapability(status, context),
    sources: {
      gameUi: {
        inGame: probeValue(status.appUi.snapshot.ui.inGame),
        inShell: probeValue(status.appUi.snapshot.ui.inShell),
        inLoading: probeValue(status.appUi.snapshot.ui.inLoading),
        canBeginGame: probeValue(status.appUi.snapshot.ui.canBeginGame),
      },
      runtimeControl: {
        ready: status.tuner?.ready ?? null,
      },
    },
    controller: readinessControllerSummary(context),
    errorCount: status.errors.length,
    nextSteps: readinessNextSteps(status, context),
  };
}

function readinessControllerSummary(
  context: Civ7ControlOrpcContext,
): Civ7ReadinessCurrentResult["controller"] {
  const readProcedures = context.controller?.supportedReadProcedures ?? [];
  const mutationProcedures =
    context.controller?.supportedMutationProcedures ?? [];
  return {
    supportedProcedures: [
      ...readProcedures.map((procedureKey) => ({
        procedureKey,
        risk: "read-only" as const,
      })),
      ...mutationProcedures.map((procedureKey) => ({
        procedureKey,
        risk: "mutation" as const,
      })),
    ],
  };
}

function readinessCapability(
  status: Civ7ControlOrpcPlayableStatusResult,
  context: Civ7ControlOrpcContext,
): Civ7ReadinessCurrentResult["capability"] {
  if (status.playable) {
    return {
      canObserve: true,
      canMutate: true,
      reason: "Runtime control is ready for in-game reads and guarded actions.",
    };
  }

  switch (status.readiness) {
    case "app-ui-game":
      if (supportedReadProcedures(context).length > 0) {
        return {
          canObserve: true,
          canMutate: false,
          reason:
            "The game UI controller can read supported procedure evidence; broad runtime mutation remains unavailable.",
        };
      }
      return {
        canObserve: false,
        canMutate: false,
        reason: "The game is open, but runtime control is not ready.",
      };
    case "begin-ready":
      return {
        canObserve: false,
        canMutate: false,
        reason: "The game can begin before support reads or actions.",
      };
    case "loading":
      return {
        canObserve: false,
        canMutate: false,
        reason: "The game is loading.",
      };
    case "shell":
      return {
        canObserve: false,
        canMutate: false,
        reason: "Civ7 is outside an active game.",
      };
    case "unavailable":
    case "tuner-ready":
      return {
        canObserve: false,
        canMutate: false,
        reason: "Civ7 runtime readiness is unavailable.",
      };
  }
}

function readinessNextSteps(
  status: Civ7ControlOrpcPlayableStatusResult,
  context: Civ7ControlOrpcContext,
): Civ7ReadinessCurrentResult["nextSteps"] {
  if (
    status.playable
    || (status.readiness === "app-ui-game" && supportsAttentionCurrent(context))
  ) {
    return [{
      kind: "read-attention",
      source: "readiness.current",
      label: "Read current attention before choosing support actions.",
    }];
  }
  if (status.readiness === "app-ui-game" && supportsStrategyFront(context)) {
    return [{
      kind: "read-strategy-front",
      source: "readiness.current",
      label: "Read strategy front summary before choosing tactical support actions.",
    }];
  }
  if (status.readiness === "app-ui-game" && supportsWorldCurrent(context)) {
    return [{
      kind: "read-world",
      source: "readiness.current",
      label: "Read current world facts before choosing support actions.",
    }];
  }

  switch (status.readiness) {
    case "app-ui-game":
      return [{
        kind: "restore-tuner",
        source: "readiness.current",
        label: "Restore runtime control readiness before support reads or actions.",
      }];
    case "begin-ready":
      return [{
        kind: "begin-game",
        source: "readiness.current",
        label: "Begin the game before reading in-game attention.",
      }];
    case "loading":
      return [{
        kind: "wait-loading",
        source: "readiness.current",
        label: "Wait for loading to complete before reading attention.",
      }];
    case "shell":
      return [{
        kind: "enter-game",
        source: "readiness.current",
        label: "Enter an active game before support reads or actions.",
      }];
    case "unavailable":
    case "tuner-ready":
      return [{
        kind: "inspect-runtime",
        source: "readiness.current",
        label: "Inspect Civ7 runtime readiness before continuing.",
      }];
  }
}

function supportsAttentionCurrent(context: Civ7ControlOrpcContext): boolean {
  return supportedReadProcedures(context).includes("attention.current");
}

function supportsStrategyFront(context: Civ7ControlOrpcContext): boolean {
  return supportedReadProcedures(context).includes("strategy.frontSummary");
}

function supportsWorldCurrent(context: Civ7ControlOrpcContext): boolean {
  return supportedReadProcedures(context).includes("world.current");
}

function supportedReadProcedures(context: Civ7ControlOrpcContext): readonly string[] {
  return context.controller?.supportedReadProcedures ?? [];
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | null {
  return probe.ok ? probe.value : null;
}
