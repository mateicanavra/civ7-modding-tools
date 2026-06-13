import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7ExploreFailedError,
  Civ7ExploreSuspensionUnverifiedError,
  type Civ7ControlOrpcContext,
} from "../src/index";
import type {
  Civ7ControlOrpcCloseDisplaysResult,
  Civ7ControlOrpcVisibilitySummaryResult,
} from "../src/dependencies/direct-control";

// Fast drain settings: the procedure sleeps for real (Effect.sleep), so the
// tests pin pollMs to the schema minimum and settleMs to zero.
const fastDrain = { settleMs: 0, pollMs: 250, quiescePolls: 2 } as const;

describe("display.explore.request control-oRPC procedure", () => {
  test("runs the verified state machine, drains until quiesce, and holds the grant by default", async () => {
    const fake = fakeContext();
    const result = await call(
      Civ7ControlOrpcRouter.display.explore.request,
      { playerId: 0, ...fastDrain },
      { context: fake.context }
    );

    // suspend is verified BEFORE the grant; the drain purges each poll and
    // exits only after quiescePolls consecutive empty purges. By default the
    // grant is NOT released — fog never re-covers the explored map.
    expect(fake.calls).toEqual([
      "summary",
      "suspend",
      "grant",
      "close",
      "close",
      "close",
      "resume",
      "summary",
    ]);
    expect(result).toMatchObject({
      playerId: 0,
      before: { revealed: 29, visible: 7 },
      after: { revealed: 6996, visible: 7 },
      grantId: 1,
      grantedPlots: 6996,
      grantReleased: false,
      settleMs: 0,
      drainPolls: 3,
      quiesced: true,
      suspendVerified: true,
      resumeVerified: true,
      suppressedDisplays: [
        { category: "Cinematic", closed: 7 },
        { category: "UnlockPopup", closed: 1 },
      ],
      mutation: "Visibility.setTrackedVisibilityGrant",
      discoveryPosture: "ui-suppressed-gameplay-discovers",
      classification: "explored",
    });
    expectSafeExploreOutput(result);
  });

  test("releases the grant after resume when restoreFog is set", async () => {
    const fake = fakeContext();
    const result = await call(
      Civ7ControlOrpcRouter.display.explore.request,
      { playerId: 0, restoreFog: true, ...fastDrain },
      { context: fake.context }
    );

    // Resume precedes the grant release so late displays cannot re-queue
    // mid-flight; release reverts plots VISIBLE -> REVEALED (fogged).
    expect(fake.calls).toEqual([
      "summary",
      "suspend",
      "grant",
      "close",
      "close",
      "close",
      "resume",
      "release",
      "summary",
    ]);
    expect(result).toMatchObject({
      grantReleased: true,
      classification: "explored",
    });
  });

  test("hits the hard cap when the queue never quiesces", async () => {
    const fake = fakeContext({
      closeDisplays: () => closeDisplaysResult([{ category: "Cinematic", closed: 1 }]),
    });
    const result = await call(
      Civ7ControlOrpcRouter.display.explore.request,
      { playerId: 0, settleMs: 0, pollMs: 250, quiescePolls: 2, maxExtraWaitMs: 500 },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      quiesced: false,
      drainPolls: 2,
      suppressedDisplays: [{ category: "Cinematic", closed: 2 }],
    });
  });

  test("fails with EXPLORE_SUSPENSION_UNVERIFIED when suspension readback fails", async () => {
    const fake = fakeContext({ suspendIsSuspended: false });

    await expect(
      call(
        Civ7ControlOrpcRouter.display.explore.request,
        { playerId: 0, ...fastDrain },
        { context: fake.context }
      )
    ).rejects.toMatchObject({
      code: "EXPLORE_SUSPENSION_UNVERIFIED",
      data: {
        procedureKey: "display.explore.request",
        source: "direct-control-facade",
      },
    });
    expect(fake.calls).not.toContain("grant");
  });

  test("resumes the display queue even when the grant fails", async () => {
    const fake = fakeContext({
      applyGrantError: new Error("tuner down"),
    });

    await expect(
      call(
        Civ7ControlOrpcRouter.display.explore.request,
        { playerId: 0, ...fastDrain },
        { context: fake.context }
      )
    ).rejects.toMatchObject({
      code: "EXPLORE_FAILED",
      data: {
        procedureKey: "display.explore.request",
        source: "direct-control-facade",
        step: "apply-explore-grant",
        detail: "Error",
      },
    });
    expect(fake.calls).toEqual(["summary", "suspend", "grant", "resume"]);
  });

  test("short-circuits to a skipped already-explored result when every plot is revealed and visible", async () => {
    // Fully revealed AND fully visible: a prior explore grant is still held.
    // The procedure must NOT suspend/grant/drain — re-granting against a
    // held full-map grant is the second-call failure mode.
    const fake = fakeContext({
      summaries: [visibilitySummary(6996, 6996)],
    });
    const result = await call(
      Civ7ControlOrpcRouter.display.explore.request,
      { playerId: 0, ...fastDrain },
      { context: fake.context }
    );
    expect(fake.calls).toEqual(["summary"]);
    expect(result).toEqual({
      playerId: 0,
      skipped: true,
      before: { revealed: 6996, visible: 6996 },
      after: { revealed: 6996, visible: 6996 },
      mapPlotCount: 6996,
      classification: "already-explored",
    });
    expectSafeExploreOutput(result);
  });

  test("runs the full machine despite full visibility when restoreFog is set", async () => {
    // restoreFog callers want the release path — the short-circuit would
    // silently skip it, so it must not engage.
    const fake = fakeContext({
      summaries: [visibilitySummary(6996, 6996), visibilitySummary(6996, 7)],
    });
    const result = await call(
      Civ7ControlOrpcRouter.display.explore.request,
      { playerId: 0, restoreFog: true, ...fastDrain },
      { context: fake.context }
    );
    expect(fake.calls).toContain("grant");
    expect(fake.calls).toContain("release");
    expect(result).toMatchObject({ skipped: false, grantReleased: true });
  });

  test("classifies an unchanged revealed count as already-explored", async () => {
    const fake = fakeContext({
      summaries: [visibilitySummary(6996), visibilitySummary(6996)],
    });
    const result = await call(
      Civ7ControlOrpcRouter.display.explore.request,
      { playerId: 0, ...fastDrain },
      { context: fake.context }
    );
    expect(result.classification).toBe("already-explored");
  });

  test("classifies missing visibility probes as unverified", async () => {
    const fake = fakeContext({
      summaries: [
        visibilitySummary(29),
        {
          ...visibilitySummary(6996),
          numPlotsRevealed: { ok: false, error: "Visibility unavailable" },
        },
      ],
    });
    const result = await call(
      Civ7ControlOrpcRouter.display.explore.request,
      { playerId: 0, ...fastDrain },
      { context: fake.context }
    );
    expect(result.classification).toBe("unverified");
    expect(result.after).toEqual({ revealed: null, visible: 7 });
  });

  test("rejects raw endpoint/session/command input before facade reads", async () => {
    const invalidInputs = [
      { playerId: 0, host: "127.0.0.1" },
      { playerId: 0, rawCommand: "Visibility.setTrackedVisibilityGrant" },
      { playerId: -1 },
      { playerId: 0, pollMs: 100 },
      { playerId: 0, quiescePolls: 0 },
      { playerId: 0, settleMs: 600_001 },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext();
      await expect(
        call(Civ7ControlOrpcRouter.display.explore.request, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual([]);
    }
  });

  test("publishes the contract-first explore leaf with typed errors", () => {
    expect(Civ7ControlOrpcContract.display.explore.request["~orpc"]).toMatchObject({
      meta: {
        family: "display",
        procedureKey: "display.explore.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(Civ7ControlOrpcContract.display.explore.request["~orpc"].errorMap).toHaveProperty(
      "EXPLORE_SUSPENSION_UNVERIFIED"
    );
    expect(Civ7ControlOrpcContract.display.explore.request["~orpc"].errorMap).toHaveProperty(
      "EXPLORE_FAILED"
    );
    expect(Civ7ExploreSuspensionUnverifiedError.code).toBe("EXPLORE_SUSPENSION_UNVERIFIED");
    expect(Civ7ExploreFailedError.code).toBe("EXPLORE_FAILED");
  });
});

function fakeContext(
  options: {
    summaries?: Civ7ControlOrpcVisibilitySummaryResult[];
    suspendIsSuspended?: boolean;
    applyGrantError?: Error;
    closeDisplays?: () => Civ7ControlOrpcCloseDisplaysResult;
  } = {}
): {
  context: Civ7ControlOrpcContext;
  calls: string[];
} {
  const calls: string[] = [];
  const summaries = options.summaries ?? [visibilitySummary(29), visibilitySummary(6996)];
  // First purge finds the suppressed discovery displays; later purges are empty.
  const purges = [
    closeDisplaysResult([
      { category: "Cinematic", closed: 7 },
      { category: "UnlockPopup", closed: 1 },
    ]),
  ];

  return {
    calls,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7VisibilitySummary: async () => {
          calls.push("summary");
          return summaries.shift() ?? visibilitySummary(6996);
        },
        suspendCiv7DisplayQueue: async () => {
          calls.push("suspend");
          return {
            ...appUiEnvelope(),
            isSuspended: options.suspendIsSuspended ?? true,
          };
        },
        resumeCiv7DisplayQueue: async () => {
          calls.push("resume");
          return { ...appUiEnvelope(), isSuspended: false };
        },
        applyCiv7ExploreGrant: async () => {
          calls.push("grant");
          if (options.applyGrantError) throw options.applyGrantError;
          return {
            host: "127.0.0.1",
            port: 4318,
            state: { id: "1", name: "Tuner" },
            grantId: 1,
            grantedPlots: 6996,
            plotCount: 6996,
          };
        },
        releaseCiv7ExploreGrant: async () => {
          calls.push("release");
          return {
            host: "127.0.0.1",
            port: 4318,
            state: { id: "1", name: "Tuner" },
            released: true,
          };
        },
        closeCiv7Displays: async () => {
          calls.push("close");
          if (options.closeDisplays) return options.closeDisplays();
          return purges.shift() ?? closeDisplaysResult([]);
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function visibilitySummary(revealed: number, visible = 7): Civ7ControlOrpcVisibilitySummaryResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    playerId: 0,
    numPlotsRevealed: { ok: true, value: revealed },
    numPlotsVisible: { ok: true, value: visible },
    mapPlotCount: { ok: true, value: 6996 },
    counts: {},
  };
}

function closeDisplaysResult(
  closed: Array<{ category: string; closed: number }>
): Civ7ControlOrpcCloseDisplaysResult {
  return {
    ...appUiEnvelope(),
    closed,
    closedTotal: closed.reduce((total, row) => total + row.closed, 0),
    remainingActive: [],
    remainingSuspended: [],
  };
}

function appUiEnvelope(): Readonly<{
  host: string;
  port: number;
  state: { id: string; name: string };
}> {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
  };
}

function expectSafeExploreOutput(output: unknown): void {
  const serialized = JSON.stringify(output);
  expect(serialized).not.toContain("127.0.0.1");
  expect(serialized).not.toContain("65535");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain("rawCommand");
}
