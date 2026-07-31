import { beforeEach, describe, expect, test, vi } from "vitest";
import type { createCiv7GameControlClient } from "../../../../src/adapters/control/service-client";

const { createControlClient, requestExplore } = vi.hoisted(() => ({
  createControlClient: vi.fn(),
  requestExplore: vi.fn(),
}));

vi.mock("../../../../src/adapters/control/service-client", () => ({
  createCiv7GameControlClient: createControlClient,
}));

import GameMapVisibility from "../../../../src/commands/game/map/visibility";

type GameControlClient = ReturnType<typeof createCiv7GameControlClient>;
type ExploreResult = Awaited<ReturnType<GameControlClient["display"]["explore"]["request"]>>;

const exploredResult = {
  playerId: 0,
  skipped: false,
  before: { revealed: 29, visible: 7 },
  after: { revealed: 6_996, visible: 7 },
  grantId: 11,
  grantedPlots: 6_996,
  grantReleased: false,
  settleMs: 15_000,
  drainPolls: 4,
  quiesced: true,
  suspendVerified: true,
  resumeVerified: true,
  suppressedDisplays: [{ category: "Cinematic", closed: 3 }],
  mutation: "Visibility.setTrackedVisibilityGrant",
  discoveryPosture: "ui-suppressed-gameplay-discovers",
  classification: "explored",
} satisfies ExploreResult;

const alreadyExploredResult = {
  playerId: 0,
  skipped: true,
  before: { revealed: 6_996, visible: 6_996 },
  after: { revealed: 6_996, visible: 6_996 },
  mapPlotCount: 6_996,
  classification: "already-explored",
} satisfies ExploreResult;

const unverifiedResult = {
  ...exploredResult,
  after: { revealed: null, visible: 7 },
  classification: "unverified",
} satisfies ExploreResult;

describe("game map visibility explore projection", () => {
  beforeEach(() => {
    requestExplore.mockReset();
    createControlClient.mockReset();
    createControlClient.mockReturnValue({
      display: {
        explore: {
          request: requestExplore,
        },
      },
    });
  });

  test("keeps the explored owner result and reports success", async () => {
    requestExplore.mockResolvedValue(exploredResult);

    const payload = await runCommand();

    expect(createControlClient).toHaveBeenCalledWith({
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4_318,
        timeoutMs: 1_234,
      },
    });
    expect(requestExplore).toHaveBeenCalledWith({ playerId: 0 });
    expect(payload).toEqual({ ok: true, result: exploredResult });
  });

  test("keeps the already-explored owner result and reports success", async () => {
    requestExplore.mockResolvedValue(alreadyExploredResult);

    const payload = await runCommand();

    expect(payload).toEqual({ ok: true, result: alreadyExploredResult });
  });

  test("keeps the unverified owner result without reporting success", async () => {
    requestExplore.mockResolvedValue(unverifiedResult);

    const payload = await runCommand();

    expect(payload).toEqual({
      ok: false,
      result: unverifiedResult,
      guidance:
        "Inspect the live map before retrying; the previous explore request may have changed engine state.",
    });
  });

  test("preserves an explore owner error", async () => {
    const ownerError = Object.assign(new Error("Map explore request failed."), {
      code: "EXPLORE_FAILED",
      data: {
        procedureKey: "display.explore.request",
        source: "direct-control-facade",
        step: "apply-explore-grant",
        detail: "Error",
      },
    });
    requestExplore.mockRejectedValue(ownerError);

    await expect(runCommand()).rejects.toBe(ownerError);
  });
});

async function runCommand(): Promise<{
  ok: boolean;
  result: ExploreResult;
  guidance?: string;
}> {
  const writes: string[] = [];
  const log = vi
    .spyOn(GameMapVisibility.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    await GameMapVisibility.run([
      "--host",
      "127.0.0.1",
      "--port",
      "4318",
      "--timeout-ms",
      "1234",
      "--player-id",
      "0",
      "--explore",
      "--disposable",
      "--json",
    ]);
    return JSON.parse(writes.join("")) as {
      ok: boolean;
      result: ExploreResult;
      guidance?: string;
    };
  } finally {
    log.mockRestore();
  }
}
