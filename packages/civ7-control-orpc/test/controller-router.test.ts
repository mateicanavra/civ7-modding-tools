import { isProcedure } from "@orpc/server";
import { describe, expect, test } from "vitest";

import type { Civ7ControlOrpcDirectControlFacade } from "../src/dependencies/direct-control";
import {
  type Civ7ControllerContext,
  Civ7ControllerOrpcRouter,
  createCiv7IntelligenceBridge,
} from "../src/index";
import { directControlFacadeFixture } from "./support/direct-control-facade";
import { playableStatusResult } from "./support/playable-status";

const controllerProcedureKeys = [
  "attention.current",
  "city.population.place.request",
  "city.production.choice.request",
  "city.townFocus.change.request",
  "city.townFocus.review.request",
  "diplomacy.firstMeet.response.request",
  "diplomacy.response.request",
  "government.celebration.choice.request",
  "government.choice.request",
  "narrative.choice.request",
  "notifications.dismiss.request",
  "progression.attribute.purchase.request",
  "progression.attribute.review.request",
  "progression.culture.choice.request",
  "progression.culture.target.request",
  "progression.technology.choice.request",
  "progression.technology.target.request",
  "progression.tradition.change.request",
  "progression.tradition.review.request",
  "readiness.current",
  "strategy.frontSummary",
  "turn.complete.request",
  "unit.resettle.request",
  "unit.target.action.request",
  "unit.upgrade.request",
  "world.current",
  "world.grid.read",
  "world.plot.read",
];

describe("native controller router", () => {
  test("selects exactly the 28 canonical procedure objects by authored metadata", () => {
    expect(collectProcedureKeys(Civ7ControllerOrpcRouter).sort()).toEqual(controllerProcedureKeys);
  });

  test("keeps readiness callable as the controller capability discovery exception", async () => {
    const context = controllerContext();
    const bridge = createCiv7IntelligenceBridge({ createContext: () => context });

    await expect(bridge.readiness.current({})).resolves.toMatchObject({
      playable: true,
      readiness: "tuner-ready",
    });
  });

  test("fails unsupported reads and mutations with one typed controller refusal", async () => {
    const bridge = createCiv7IntelligenceBridge({
      createContext: () => controllerContext(),
    });

    await expect(
      bridge.world.current({}, { context: { correlationId: "unsupported-read-1" } })
    ).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "world.current",
        reason: "procedure-not-supported",
        correlationId: "unsupported-read-1",
      },
    });
    await expect(
      bridge.notifications.dismiss.request({
        notificationId: { owner: 0, id: 113, type: 20 },
      })
    ).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "notifications.dismiss.request",
        reason: "procedure-not-supported",
      },
    });
  });

  test("validates correlation before reporting controller admission failures", async () => {
    const bridge = createCiv7IntelligenceBridge({
      createContext: () => controllerContext(),
    });

    await expect(
      bridge.world.current({}, { context: { correlationId: "!invalid" } })
    ).rejects.toMatchObject({
      code: "CORRELATION_ID_INVALID",
      data: {
        source: "context.correlation",
        reason: "correlation-id-invalid",
      },
    });
  });

  test("fails closed when a malformed controller factory omits its capability catalog", async () => {
    const calls: unknown[] = [];
    const context = controllerContext({
      mutationProcedures: ["notifications.dismiss.request"],
      proof: true,
      calls,
    });
    const bridge = createCiv7IntelligenceBridge({
      createContext: () => ({ ...context, controller: undefined }) as never,
    });

    await expect(
      bridge.notifications.dismiss.request({
        notificationId: { owner: 0, id: 113, type: 20 },
      })
    ).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "notifications.dismiss.request",
        reason: "procedure-not-supported",
      },
    });
    expect(calls).toEqual([]);
  });

  test("requires proof after mutation admission and before dispatch", async () => {
    const calls: unknown[] = [];
    const context = controllerContext({
      mutationProcedures: ["notifications.dismiss.request"],
      calls,
    });
    const bridge = createCiv7IntelligenceBridge({ createContext: () => context });

    await expect(
      bridge.notifications.dismiss.request({
        notificationId: { owner: 0, id: 113, type: 20 },
      })
    ).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "notifications.dismiss.request",
        reason: "proof-required",
      },
    });
    expect(calls).toEqual([]);
  });

  test("dispatches admitted reads and proofed mutations into canonical handlers", async () => {
    const calls: unknown[] = [];
    let playableStatusCalls = 0;
    const context = controllerContext({
      readProcedures: ["world.current"],
      mutationProcedures: ["notifications.dismiss.request"],
      proof: true,
      getPlayableStatus: async () => {
        playableStatusCalls += 1;
        if (playableStatusCalls === 1) throw new Error("world status sentinel");
        return playableStatusResult();
      },
      calls,
    });
    const bridge = createCiv7IntelligenceBridge({ createContext: () => context });

    await expect(bridge.world.current({})).rejects.toMatchObject({
      code: "WORLD_CURRENT_UNAVAILABLE",
    });
    await expect(
      bridge.notifications.dismiss.request({
        notificationId: { owner: 0, id: 113, type: 20 },
      })
    ).rejects.toMatchObject({ code: "NOTIFICATION_DISMISSAL_UNAVAILABLE" });
    expect(calls).toEqual(["notifications.dismiss.request"]);
  });
});

function collectProcedureKeys(router: object): string[] {
  const keys: string[] = [];
  for (const value of Object.values(router)) {
    if (isProcedure(value)) {
      const key = value["~orpc"].meta.procedureKey;
      if (typeof key !== "string") throw new Error("Controller procedure metadata is incomplete.");
      keys.push(key);
      continue;
    }
    if (value != null && typeof value === "object") {
      keys.push(...collectProcedureKeys(value));
    }
  }
  return keys;
}

function controllerContext(
  options: Readonly<{
    readProcedures?: readonly string[];
    mutationProcedures?: readonly string[];
    proof?: boolean;
    getPlayableStatus?: Civ7ControlOrpcDirectControlFacade["getCiv7PlayableStatus"];
    calls?: unknown[];
  }> = {}
): Civ7ControllerContext {
  const calls = options.calls ?? [];
  return {
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: options.getPlayableStatus ?? (async () => playableStatusResult()),
      requestCiv7NotificationDismissal: async () => {
        calls.push("notifications.dismiss.request");
        throw new Error("notification sentinel");
      },
    }),
    controller: {
      supportedReadProcedures: options.readProcedures ?? [],
      supportedMutationProcedures: options.mutationProcedures ?? [],
    },
    controllerProof:
      options.proof === true
        ? {
            lifecycle: {
              source: "controller-runtime",
              status: "game-controller-ready",
            },
            localPlayer: {
              source: "GameContext.localPlayerID",
              playerId: 0,
            },
            hotseat: {
              source: "controller-runtime",
              status: "single-local-player",
            },
          }
        : undefined,
  };
}
