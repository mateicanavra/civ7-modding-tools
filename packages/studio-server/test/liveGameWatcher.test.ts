import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Effect, ManagedRuntime } from "effect";
import { describe, expect, test } from "vitest";

import {
  type LiveGameStatusBody,
  type StudioEvent,
  StudioEventHub,
  StudioEventHubLive,
  type StudioHelloEvent,
  type StudioLiveGameEvent,
  studioEventSubscriptionIterator,
} from "../src/index";
import { makeLiveGameWatcherLayer, StudioLiveGameWatcher } from "../src/liveGame/watcher";

describe("live-game watcher", () => {
  test("production watcher stays behind the tuner client boundary", () => {
    const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
    const watcherSource = readFileSync(
      join(repoRoot, "packages/studio-server/src/liveGame/watcher.ts"),
      "utf8"
    );

    expect(watcherSource).toContain("readLiveGameStatusBody");
    expect(watcherSource).not.toMatch(
      /@civ7\/direct-control|Civ7DirectControlSession|Civ7TunerSessionLive|Runtime\.runPromise|Effect\.runtime|setTimeout|setInterval/
    );
  });

  test("publishes first and changed live-game states, and stays quiet when unchanged", async () => {
    const events: StudioEvent[] = [];
    const bodies = [
      liveStatusBody({ observedAt: "2026-06-13T00:00:00.000Z", turn: 12, gameHash: 111 }),
      liveStatusBody({ observedAt: "2026-06-13T00:00:03.000Z", turn: 12, gameHash: 111 }),
      liveStatusBody({ observedAt: "2026-06-13T00:00:06.000Z", turn: 12, gameHash: 222 }),
    ];
    const layer = makeLiveGameWatcherLayer({
      eventHub: {
        publish: (event) =>
          Effect.sync(() => {
            events.push(event);
          }),
      },
      readLiveStatus: Effect.sync(() => {
        const body = bodies.shift();
        if (!body) throw new Error("unexpected extra read");
        return body;
      }),
      options: {
        initialDelayMs: 60_000,
        now: () => new Date("2026-06-13T00:00:00.000Z"),
      },
    });

    await Effect.runPromise(
      Effect.gen(function* () {
        const watcher = yield* StudioLiveGameWatcher;
        yield* watcher.tick;
        yield* watcher.tick;
        yield* watcher.tick;
      }).pipe(Effect.provide(layer))
    );

    const liveGameEvents = events.filter(
      (event): event is StudioLiveGameEvent => event.type === "live-game"
    );
    expect(liveGameEvents).toHaveLength(2);
    expect(liveGameEvents[0]?.state.gameHash).toBe(111);
    expect(liveGameEvents[1]?.state.gameHash).toBe(222);
    expect(liveGameEvents[0]?.state.snapshotId).not.toBe(liveGameEvents[1]?.state.snapshotId);
  });

  test("keeps clock-only changes quiet", async () => {
    const events: StudioEvent[] = [];
    const bodies = [
      liveStatusBody({ observedAt: "2026-06-13T00:00:00.000Z", turn: 12, gameHash: 111 }),
      liveStatusBody({ observedAt: "2026-06-13T00:00:03.000Z", turn: 12, gameHash: 111 }),
    ];
    const layer = makeLiveGameWatcherLayer({
      eventHub: {
        publish: (event) =>
          Effect.sync(() => {
            events.push(event);
          }),
      },
      readLiveStatus: Effect.sync(() => {
        const body = bodies.shift();
        if (!body) throw new Error("unexpected extra read");
        return body;
      }),
      options: {
        initialDelayMs: 60_000,
        now: () => new Date("2026-06-13T00:00:00.000Z"),
      },
    });

    await Effect.runPromise(
      Effect.gen(function* () {
        const watcher = yield* StudioLiveGameWatcher;
        yield* watcher.tick;
        yield* watcher.tick;
      }).pipe(Effect.provide(layer))
    );

    expect(events.filter((event) => event.type === "live-game")).toHaveLength(1);
  });

  test("publish failure is diagnostics-only and does not poison the live-game key", async () => {
    const events: StudioEvent[] = [];
    const body = liveStatusBody({
      observedAt: "2026-06-13T00:00:00.000Z",
      turn: 12,
      gameHash: 111,
    });
    let publishAttempts = 0;
    const layer = makeLiveGameWatcherLayer({
      eventHub: {
        publish: (event) =>
          Effect.sync(() => (publishAttempts += 1)).pipe(
            Effect.filterOrFail(
              (attempt) => attempt !== 1,
              () => new Error("event sink failed")
            ),
            Effect.tap(() =>
              Effect.sync(() => {
                events.push(event);
              })
            ),
            Effect.asVoid
          ),
      },
      readLiveStatus: Effect.succeed(body),
      options: {
        initialDelayMs: 60_000,
        now: () => new Date("2026-06-13T00:00:00.000Z"),
      },
    });

    await Effect.runPromise(
      Effect.gen(function* () {
        const watcher = yield* StudioLiveGameWatcher;
        yield* watcher.tick;
        yield* watcher.tick;
      }).pipe(Effect.provide(layer))
    );

    const liveGameEvents = events.filter(
      (event): event is StudioLiveGameEvent => event.type === "live-game"
    );
    expect(publishAttempts).toBe(2);
    expect(liveGameEvents).toHaveLength(1);
    expect(liveGameEvents[0]?.state.status).toBe("ok");
    expect(liveGameEvents[0]?.state.error).toBeUndefined();
  });

  test("non-throwing live-status failures increment failure count", async () => {
    const events: StudioEvent[] = [];
    const layer = makeLiveGameWatcherLayer({
      eventHub: {
        publish: (event) =>
          Effect.sync(() => {
            events.push(event);
          }),
      },
      readLiveStatus: Effect.succeed({
        ok: false,
        observedAt: "2026-06-13T00:00:00.000Z",
        status: { readiness: "unavailable" },
        mapSummary: { error: "map read unavailable" },
      }),
      options: {
        initialDelayMs: 60_000,
        now: () => new Date("2026-06-13T00:00:00.000Z"),
      },
    });

    await Effect.runPromise(
      Effect.gen(function* () {
        const watcher = yield* StudioLiveGameWatcher;
        yield* watcher.tick;
      }).pipe(Effect.provide(layer))
    );

    const liveGameEvents = events.filter(
      (event): event is StudioLiveGameEvent => event.type === "live-game"
    );
    expect(liveGameEvents).toHaveLength(1);
    expect(liveGameEvents[0]?.state.status).toBe("error");
    expect(liveGameEvents[0]?.state.failureCount).toBe(1);
  });

  test("new subscribers replay the latest live-game state after hello", async () => {
    const eventHubRuntime = ManagedRuntime.make(StudioEventHubLive);
    try {
      const eventHub = await eventHubRuntime.runPromise(StudioEventHub);
      const layer = makeLiveGameWatcherLayer({
        eventHub,
        readLiveStatus: Effect.succeed(
          liveStatusBody({
            observedAt: "2026-06-13T00:00:00.000Z",
            turn: 12,
            gameHash: 111,
          })
        ),
        options: {
          initialDelayMs: 60_000,
          now: () => new Date("2026-06-13T00:00:00.000Z"),
        },
      });

      await Effect.runPromise(
        Effect.gen(function* () {
          const watcher = yield* StudioLiveGameWatcher;
          yield* watcher.tick;
        }).pipe(Effect.provide(layer))
      );

      const hello: StudioHelloEvent = {
        type: "hello",
        serverInstanceId: "studio-server-test",
        serverStartedAt: "2026-06-13T00:00:00.000Z",
        observedAt: "2026-06-13T00:00:01.000Z",
      };
      const subscription = await Effect.runPromise(eventHub.subscribe({ initialEvents: [hello] }));
      const iterator = studioEventSubscriptionIterator(subscription);

      const first = await iterator.next();
      const second = await iterator.next();
      await iterator.return?.();

      expect(first).toEqual({ done: false, value: hello });
      if (second.done) throw new Error("Expected replayed live-game event");
      if (second.value.type !== "live-game") throw new Error("Expected live-game event");
      expect(second.value.state.turn).toBe(12);
    } finally {
      await eventHubRuntime.dispose();
    }
  });

  test("runtime scope disposal stops automatic watcher publication", async () => {
    const events: StudioEvent[] = [];
    const runtime = ManagedRuntime.make(
      makeLiveGameWatcherLayer({
        eventHub: {
          publish: (event) =>
            Effect.sync(() => {
              events.push(event);
            }),
        },
        readLiveStatus: Effect.succeed(
          liveStatusBody({
            observedAt: "2026-06-13T00:00:00.000Z",
            turn: 12,
            gameHash: 111,
          })
        ),
        options: {
          initialDelayMs: 0,
          intervalMs: 10,
          now: () => new Date("2026-06-13T00:00:00.000Z"),
        },
      })
    );

    await runtime.runPromise(StudioLiveGameWatcher);
    await eventually(() => events.length >= 1);
    await runtime.dispose();
    const countAfterDispose = events.length;
    await delay(40);

    expect(events).toHaveLength(countAfterDispose);
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

async function eventually(predicate: () => boolean): Promise<void> {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt > 1_000) throw new Error("condition timed out");
    await delay(5);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
