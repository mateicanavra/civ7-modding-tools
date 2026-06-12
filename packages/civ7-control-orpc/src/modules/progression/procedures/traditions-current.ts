import { Effect } from "effect";

import type { Civ7ControlOrpcTraditionsViewResult } from "../../../dependencies/direct-control";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7ProgressionTraditionsInput,
  Civ7ProgressionTraditionsResult,
} from "../contract";

export const progressionTraditionsCurrentProcedure =
  civ7ControlOrpcImplementer.progression.traditions.current.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const traditions = await context.directControl.getCiv7TraditionsView(
          input,
          context.endpointDefaults,
        );
        return progressionTraditionsResult(input, traditions);
      },
      catch: (cause) =>
        errors.PROGRESSION_TRADITIONS_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "progression.traditions.current",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function progressionTraditionsResult(
  _input: Civ7ProgressionTraditionsInput,
  view: Civ7ControlOrpcTraditionsViewResult,
): Civ7ProgressionTraditionsResult {
  const active = view.active.map(traditionRow);
  const available = view.available.map(traditionRow);
  const recentUnlocks = view.recentUnlocks.map(traditionRow);
  const traditions = view.traditions.map(traditionRow);
  const nextSteps = traditionsNextSteps(view, available, active);

  return {
    playerId: view.playerId,
    sourceStatus: {
      traditions: "read",
    },
    hiddenInfoPolicy: view.hiddenInfoPolicy,
    summary: {
      activeCount: active.length,
      availableCount: available.length,
      recentUnlockCount: recentUnlocks.length,
      openSlotCount: view.slots.open,
      enabledAvailableCount: available.filter((tradition) =>
        tradition.actions.some((action) => action.validationSuccess === true),
      ).length,
      disabledAvailableCount: available.filter((tradition) =>
        !tradition.actions.some((action) => action.validationSuccess === true),
      ).length,
      nextStepCount: nextSteps.length,
    },
    turn: view.turn,
    turnDate: view.turnDate,
    governmentType: view.governmentType,
    government: view.government,
    slots: view.slots,
    actions: view.actions,
    active,
    available,
    recentUnlocks,
    traditions,
    omitted: [
      {
        path: "presentation.commandSuggestions",
        reason: "Command-string suggestions are caller presentation, not progression service output.",
      },
      {
        path: "presentation.actionDirections",
        reason: "Action directions are projected as semantic descriptors with parameters.",
      },
      {
        path: "runtime.validationProbe",
        reason: "Validation probe details remain low-level runtime evidence; service rows expose validationSuccess.",
      },
    ],
    notes: [
      ...view.notes,
      "Read-only progression traditions view. It does not send CHANGE_TRADITION or review closeout mutations.",
    ],
    nextSteps,
  };
}

function traditionRow(
  tradition: Civ7ControlOrpcTraditionsViewResult["traditions"][number],
): Civ7ProgressionTraditionsResult["traditions"][number] {
  return {
    id: tradition.id,
    type: tradition.type,
    name: tradition.name,
    description: tradition.description,
    ageType: tradition.ageType,
    cultureSlotType: tradition.cultureSlotType,
    traitType: tradition.traitType,
    isCrisis: tradition.isCrisis,
    active: tradition.active,
    unlocked: tradition.unlocked,
    recentUnlock: tradition.recentUnlock,
    actions: tradition.actionHints.map((action) => ({
      kind: action.kind,
      action: action.action,
      validationSuccess: validationSuccess(action.validation),
      parameters: {
        traditionType: tradition.id,
        action: action.action,
      },
      nextSteps: [
        {
          kind: "validate-tradition-change",
          source: "progression.traditions.current",
          label: `Validate ${action.kind} for ${tradition.name ?? tradition.type ?? tradition.id}.`,
          parameters: {
            traditionType: tradition.id,
            action: action.action,
          },
        },
        {
          kind: "request-tradition-change",
          source: "progression.traditions.current",
          label: `Request ${action.kind} for ${tradition.name ?? tradition.type ?? tradition.id} only after choosing this tradition.`,
          parameters: {
            traditionType: tradition.id,
            action: action.action,
          },
        },
      ],
    })),
  };
}

function traditionsNextSteps(
  view: Civ7ControlOrpcTraditionsViewResult,
  available: Civ7ProgressionTraditionsResult["available"],
  active: Civ7ProgressionTraditionsResult["active"],
): Civ7ProgressionTraditionsResult["nextSteps"] {
  if (available.some((tradition) => tradition.actions.length > 0)) {
    return [{
      kind: "inspect-tradition-change",
      source: "progression.traditions.current",
      label: "Inspect available tradition action descriptors before requesting a tradition change.",
    }];
  }

  if (view.slots.open === 0 && active.some((tradition) => tradition.actions.length > 0)) {
    return [{
      kind: "free-policy-slot",
      source: "progression.traditions.current",
      label: "If a policy slot is full, inspect active traditions before deactivating one.",
    }];
  }

  return [{
    kind: "observe",
    source: "progression.traditions.current",
    label: "Observe current attention before selecting a progression follow-up.",
  }];
}

function validationSuccess(validation: unknown): boolean | null {
  if (!validation || typeof validation !== "object") return null;
  const probe = validation as Readonly<{
    ok?: unknown;
    value?: unknown;
  }>;
  if (probe.ok !== true) return null;
  const value = probe.value;
  return value && typeof value === "object" && "Success" in value
    ? (value as Readonly<{ Success?: unknown }>).Success === true
    : null;
}
