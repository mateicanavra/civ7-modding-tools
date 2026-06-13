import { describe, expect, test } from "vitest";

import {
  createLiveGameWatcher,
  type LiveGameStatusBody,
  type StudioEvent,
  type StudioLiveGameEvent,
} from "../src/index";

describe("live-game watcher", () => {
  test("publishes first and changed live-game states, and stays quiet when unchanged", async () => {
    const events: StudioEvent[] = [];
    const bodies = [
      liveStatusBody({ observedAt: "2026-06-13T00:00:00.000Z", turn: 12, gameHash: 111 }),
      liveStatusBody({ observedAt: "2026-06-13T00:00:03.000Z", turn: 12, gameHash: 111 }),
      liveStatusBody({ observedAt: "2026-06-13T00:00:06.000Z", turn: 12, gameHash: 222 }),
    ];
    const watcher = createLiveGameWatcher({
      eventHub: {
        publish: async (event) => {
          events.push(event);
        },
      },
      readLiveStatus: async () => {
        const body = bodies.shift();
        if (!body) throw new Error("unexpected extra read");
        return body;
      },
      options: {
        now: () => new Date("2026-06-13T00:00:00.000Z"),
      },
    });

    await watcher.tick();
    await watcher.tick();
    await watcher.tick();

    const liveGameEvents = events.filter(
      (event): event is StudioLiveGameEvent => event.type === "live-game"
    );
    expect(liveGameEvents).toHaveLength(2);
    expect(liveGameEvents[0]?.state.gameHash).toBe(111);
    expect(liveGameEvents[1]?.state.gameHash).toBe(222);
    expect(liveGameEvents[0]?.state.snapshotId).not.toBe(liveGameEvents[1]?.state.snapshotId);
  });
});

function liveStatusBody(args: {
  observedAt: string;
  turn: number;
  gameHash: number;
}): LiveGameStatusBody {
  return {
    ok: true,
    observedAt: args.observedAt,
    status: { readiness: "ready" },
    mapSummary: {
      game: {
        turn: { ok: true, value: args.turn },
        hash: { ok: true, value: args.gameHash },
      },
      map: {
        randomSeed: { ok: true, value: 123 },
        width: { ok: true, value: 96 },
        height: { ok: true, value: 60 },
      },
    },
    autoplay: { autoplay: { isActive: false, isPaused: false } },
  };
}
