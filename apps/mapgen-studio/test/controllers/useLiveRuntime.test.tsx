// @vitest-environment jsdom
import type { StudioEvent, StudioOperationsCurrent } from "@civ7/studio-contract";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";

const studioClientMocks = vi.hoisted(() => ({
  watch: vi.fn(),
  current: vi.fn(),
  snapshot: vi.fn(),
}));

vi.mock("../../src/lib/orpc", () => ({
  orpcClient: {
    studio: {
      events: { watch: studioClientMocks.watch },
      operations: { current: studioClientMocks.current },
    },
    civ7: { live: { snapshot: studioClientMocks.snapshot } },
  },
}));

// The setup fetch (`fetchCiv7SetupConfig`) runs unconditionally inside
// `applyLiveGameState`. It is a module import (NOT a hook param), so we mock the
// module to a controllable resolution; the SNAPSHOT read is what the LR-2/LR-3/LR-6
// contracts hinge on and that goes through the INJECTED `orpcClient` mock — the whole
// reason `orpcClient` is a hook PARAM. Everything else (the abort/mounted refs, the
// staleness guards, the state machine) runs for real.
vi.mock("../../src/features/civ7Setup/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/features/civ7Setup/api")>();
  return {
    ...actual,
    fetchCiv7SetupConfig: vi.fn(async () => ({
      ok: false as const,
      error: "setup unavailable (test stub)",
      observedAt: "2026-06-29T00:00:00.000Z",
    })),
  };
});

import { type UseLiveRuntimeArgs, useLiveRuntime } from "../../src/app/hooks/useLiveRuntime";
import { useStudioEvents } from "../../src/app/hooks/useStudioEvents";
import { fetchCiv7SetupConfig } from "../../src/features/civ7Setup/api";
import type { LiveRuntimeStatusState } from "../../src/features/liveRuntime/model";
import { orpcClient } from "../../src/lib/orpc";

const setupFetch = vi.mocked(fetchCiv7SetupConfig);

/**
 * A controllable `orpcClient.civ7.live.snapshot` mock. `resolveNext(body)` settles the
 * MOST RECENT in-flight snapshot call; this lets us drive two overlapping reads and
 * resolve them out-of-order (LR-2) or resolve AFTER unmount (LR-3).
 */
function makeSnapshotMock() {
  const deferreds: Array<{
    resolve: (body: unknown) => void;
    reject: (err: unknown) => void;
    signal?: AbortSignal;
  }> = [];
  const snapshot = vi.fn(
    (_params: Record<string, unknown>, opts?: { signal?: AbortSignal }) =>
      new Promise<unknown>((resolve, reject) => {
        deferreds.push({ resolve, reject, signal: opts?.signal });
      })
  );
  return {
    snapshot,
    /** Settle the i-th snapshot call (default: latest) with an ok body. */
    resolveOk(i = deferreds.length - 1, grid: unknown = { tiles: [] }) {
      deferreds[i]?.resolve({ ok: true, observedAt: "2026-06-29T00:00:00.000Z", grid });
    },
    /**
     * Settle the i-th call with an ok body whose `ok`/`grid` are GETTERS that flip
     * `onConsume`. The post-await commit path passes the body to
     * `buildLiveRuntimeSnapshotState` (which reads `.ok`/`.grid`) — so reading those
     * getters proves the body reached the commit path. If the mounted-ref guard fires
     * first (unmount case), the body is never consumed → the getters never run.
     */
    resolveOkTrap(i: number, onConsume: () => void, grid: unknown = { tiles: [] }) {
      deferreds[i]?.resolve({
        observedAt: "2026-06-29T00:00:00.000Z",
        get ok() {
          onConsume();
          return true;
        },
        get grid() {
          return grid;
        },
      });
    },
    deferreds,
  };
}

function makeArgs(snapshot: ReturnType<typeof makeSnapshotMock>["snapshot"]): UseLiveRuntimeArgs {
  return {
    orpcClient: {
      civ7: { live: { snapshot } },
    } as unknown as UseLiveRuntimeArgs["orpcClient"],
  };
}

const okStatus = (over: Partial<LiveRuntimeStatusState> = {}): LiveRuntimeStatusState =>
  ({ status: "ok", snapshotId: "snap-1", ...over }) as LiveRuntimeStatusState;

beforeEach(() => {
  setupFetch.mockClear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("Studio event-driven live-runtime composition", () => {
  it("turns one pushed live event into one bounded setup and snapshot read", async () => {
    vi.useFakeTimers();
    const setRunInGameOperation = vi.fn();
    const setSaveDeployOperation = vi.fn();
    const markRunInGameToastHandled = vi.fn();
    const setLocalError = vi.fn();
    const clearLocalError = vi.fn();
    const liveEventRequested = deferred<void>();
    const releaseLiveEvent = deferred<IteratorResult<StudioEvent, unknown>>();
    const pendingAfterLiveEvent = deferred<IteratorResult<StudioEvent, unknown>>();
    const iteratorReturned = deferred<void>();
    const setupReadStarted = deferred<void>();
    const snapshotReadStarted = deferred<void>();
    const events: StudioEvent[] = [
      {
        type: "hello",
        serverInstanceId: "studio-composed-test",
        serverStartedAt: "2026-06-29T00:00:00.000Z",
        observedAt: "2026-06-29T00:00:01.000Z",
      },
      {
        type: "operation",
        kind: "run-in-game",
        observedAt: "2026-06-29T00:00:02.000Z",
        status: {
          requestId: "run-composed-test",
          status: "running",
          phase: "deploying",
          recoveryActions: ["retry-status"],
        },
      },
    ];
    const liveEvent: StudioEvent = {
      type: "live-game",
      observedAt: "2026-06-29T00:00:03.000Z",
      state: okStatus({
        readiness: "ready",
        snapshotId: "status:3:abcdef01",
        snapshotHash: "abcdef01",
        turn: 3,
        failureCount: 0,
        snapshotStatus: "idle",
        bindingStatus: "unbound-runtime",
      }),
    };
    let eventIndex = 0;
    const iterator = {
      next() {
        const event = events[eventIndex++];
        if (event) return Promise.resolve({ done: false as const, value: event });
        if (eventIndex === events.length + 1) {
          liveEventRequested.resolve();
          return releaseLiveEvent.promise;
        }
        return pendingAfterLiveEvent.promise;
      },
      async return() {
        pendingAfterLiveEvent.resolve({ done: true, value: undefined });
        iteratorReturned.resolve();
        return { done: true as const, value: undefined };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    } as AsyncIteratorObject<StudioEvent, unknown, void>;
    const current: StudioOperationsCurrent = {
      ok: true,
      serverInstanceId: "studio-composed-test",
      serverStartedAt: "2026-06-29T00:00:00.000Z",
      observedAt: "2026-06-29T00:00:01.000Z",
      runInGame: { active: null, recent: [] },
      saveDeploy: { active: null, recent: [] },
    };
    studioClientMocks.watch.mockResolvedValue(iterator);
    studioClientMocks.current.mockResolvedValue(current);
    studioClientMocks.snapshot.mockImplementationOnce(async () => {
      snapshotReadStarted.resolve();
      return {
        ok: true,
        observedAt: "2026-06-29T00:00:03.000Z",
        grid: { tiles: [] },
      };
    });
    setupFetch.mockImplementationOnce(async () => {
      setupReadStarted.resolve();
      return {
        ok: false,
        error: "setup unavailable (composed test)",
        observedAt: "2026-06-29T00:00:03.000Z",
      };
    });

    const { unmount } = renderHook(() => {
      const runtime = useLiveRuntime({ orpcClient });
      useStudioEvents({
        applyLiveGameState: runtime.applyLiveGameState,
        setRunInGameOperation,
        setSaveDeployOperation,
        markRunInGameToastHandled,
        setLocalError,
        clearLocalError,
      });
      return runtime;
    });

    await act(async () => {
      await liveEventRequested.promise;
    });

    expect(studioClientMocks.watch).toHaveBeenCalledTimes(1);
    expect(studioClientMocks.current).toHaveBeenCalledTimes(1);
    expect(setRunInGameOperation).toHaveBeenCalledTimes(2);
    expect(setupFetch).not.toHaveBeenCalled();
    expect(studioClientMocks.snapshot).not.toHaveBeenCalled();

    await act(async () => {
      releaseLiveEvent.resolve({ done: false, value: liveEvent });
      await Promise.all([setupReadStarted.promise, snapshotReadStarted.promise]);
    });

    expect(setupFetch).toHaveBeenCalledTimes(1);
    expect(studioClientMocks.snapshot).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(studioClientMocks.current).toHaveBeenCalledTimes(1);
    expect(setupFetch).toHaveBeenCalledTimes(1);
    expect(studioClientMocks.snapshot).toHaveBeenCalledTimes(1);

    unmount();
    await act(async () => {
      await iteratorReturned.promise;
    });
    expect(studioClientMocks.watch.mock.calls[0]?.[1]?.signal.aborted).toBe(true);
  });
});

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("useLiveRuntime — snapshot abort + staleness (LR-2)", () => {
  it("LR-2: a new snapshot request aborts the prior in-flight controller; the stale (older) response is dropped", async () => {
    // Oracle: applyLiveGameState fires twice (two distinct snapshotIds) → the SECOND
    // read aborts the FIRST's AbortController, and the request-key guard rejects the
    // first response if it arrives later. After resolving BOTH (older last), liveRuntime
    // reflects ONLY the second snapshot (snapshotStatus 'ok'), not a clobber from the
    // stale first. Falsifier: drop `liveSnapshotAbortRef.current?.abort()` in
    // readLiveRuntimeSnapshot → the first controller never aborts and its late ok-body
    // commits over the second (snapshotHash/snapshotId from snap-1, not snap-2).
    const mock = makeSnapshotMock();
    const { result } = renderHook((p: UseLiveRuntimeArgs) => useLiveRuntime(p), {
      initialProps: makeArgs(mock.snapshot),
    });

    await act(async () => {
      result.current.applyLiveGameState(okStatus({ snapshotId: "snap-1", turn: 1 }));
      await Promise.resolve();
    });
    await act(async () => {
      result.current.applyLiveGameState(okStatus({ snapshotId: "snap-2", turn: 2 }));
      await Promise.resolve();
    });

    // Two reads were issued; the FIRST controller must have been aborted by the second.
    expect(mock.snapshot).toHaveBeenCalledTimes(2);
    expect(mock.deferreds[0]?.signal?.aborted).toBe(true);
    expect(mock.deferreds[1]?.signal?.aborted).toBe(false);

    // Resolve the NEWER read first (committed), then the STALE one (must be dropped).
    await act(async () => {
      mock.resolveOk(1);
      await Promise.resolve();
      await Promise.resolve();
    });
    const afterNewer = result.current.liveRuntime;
    expect(afterNewer.snapshotStatus).toBe("ok");
    const hashAfterNewer = afterNewer.snapshotHash;

    await act(async () => {
      mock.resolveOk(0); // older response arrives late — request-key guard drops it
      await Promise.resolve();
      await Promise.resolve();
    });
    // The stale response did NOT overwrite the newer commit.
    expect(result.current.liveRuntime.snapshotHash).toBe(hashAfterNewer);
    expect(result.current.liveRuntime.snapshotStatus).toBe("ok");
  });
});

describe("useLiveRuntime — mounted-ref guard (LR-3)", () => {
  it("LR-3: a snapshot resolving AFTER unmount short-circuits at the mounted-ref guard (body never reaches the commit path)", async () => {
    // Oracle: unmount mid-fetch, THEN resolve the snapshot. The `if (!liveRuntime
    // MountedRef.current) return;` guard sits BEFORE the body is handed to
    // buildLiveRuntimeSnapshotState, so on the unmount path the body's `ok`/`grid`
    // getters are NEVER read. We instrument the resolved body with a consume-trap and
    // assert it stays untouched after unmount+resolve.
    //
    // Falsifier (atomic-constraint / invariant b): if the mounted-ref machinery does
    // NOT travel with the read fns into this hook (the refs get split off, or the
    // mounted guard is dropped), the post-await commit reads the body (trap fires) and
    // setLiveRuntime/setLiveRuntimeSnapshot run on an unmounted component. NOTE: the
    // mounted guard and the abort guard are intentional defense-in-depth — on the
    // unmount path the cleanup also aborts the controller; this test kills the failure
    // where the mounted-ref carry is lost so the commit is no longer guarded.
    const mock = makeSnapshotMock();
    const { result, unmount } = renderHook((p: UseLiveRuntimeArgs) => useLiveRuntime(p), {
      initialProps: makeArgs(mock.snapshot),
    });

    await act(async () => {
      result.current.applyLiveGameState(okStatus({ snapshotId: "snap-1", turn: 1 }));
      await Promise.resolve();
    });
    expect(mock.snapshot).toHaveBeenCalledTimes(1);

    // Control: while still MOUNTED, the body IS consumed (trap fires) — proves the trap
    // is a real signal, not a false negative.
    let consumedWhileMounted = false;
    await act(async () => {
      mock.resolveOkTrap(0, () => {
        consumedWhileMounted = true;
      });
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(consumedWhileMounted).toBe(true);

    // Now drive a SECOND read, unmount mid-flight, then resolve: the mounted-ref guard
    // must short-circuit before the body is consumed.
    await act(async () => {
      result.current.applyLiveGameState(okStatus({ snapshotId: "snap-2", turn: 2 }));
      await Promise.resolve();
    });
    expect(mock.snapshot).toHaveBeenCalledTimes(2);

    let consumedAfterUnmount = false;
    unmount();
    await act(async () => {
      mock.resolveOkTrap(1, () => {
        consumedAfterUnmount = true;
      });
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(consumedAfterUnmount).toBe(false);
  });
});

describe("useLiveRuntime — applyLiveGameState request gating (LR-6)", () => {
  it("LR-6: a non-ok / null-snapshotId status aborts + does NOT call orpcClient.civ7.live.snapshot", async () => {
    // Oracle: status !== 'ok' (or missing snapshotId) → buildLiveRuntimeSnapshotRequest
    // returns null → applyLiveGameState nulls the request key + aborts and SKIPS the
    // read. Falsifier: removing the null-request guard so it always fetches → error
    // events trigger a snapshot fetch storm.
    const mock = makeSnapshotMock();
    const { result } = renderHook((p: UseLiveRuntimeArgs) => useLiveRuntime(p), {
      initialProps: makeArgs(mock.snapshot),
    });

    await act(async () => {
      result.current.applyLiveGameState({ status: "error" } as LiveRuntimeStatusState);
      await Promise.resolve();
    });
    expect(mock.snapshot).not.toHaveBeenCalled();

    // An ok status WITHOUT a snapshotId is also a null request → still no fetch.
    await act(async () => {
      result.current.applyLiveGameState({ status: "ok" } as LiveRuntimeStatusState);
      await Promise.resolve();
    });
    expect(mock.snapshot).not.toHaveBeenCalled();

    // A valid ok+snapshotId status DOES fire the read.
    await act(async () => {
      result.current.applyLiveGameState(okStatus({ snapshotId: "snap-1", turn: 1 }));
      await Promise.resolve();
    });
    expect(mock.snapshot).toHaveBeenCalledTimes(1);
  });
});

describe("useLiveRuntime — snapshotStatus 'loading' transition (LR-7)", () => {
  it("LR-7: applyLiveGameState sets snapshotStatus 'loading' only on a snapshotId change / non-ok prior", async () => {
    // Oracle: first ok+snapshotId → 'loading'; once the snapshot resolves ok → 'ok';
    // re-applying the SAME snapshotId while prior is 'ok' → stays 'ok' (no loading
    // flicker); a NEW snapshotId → 'loading' again. Falsifier: always 'loading' → a
    // flicker on every autoplay tick even when the snapshot is unchanged.
    const mock = makeSnapshotMock();
    const { result } = renderHook((p: UseLiveRuntimeArgs) => useLiveRuntime(p), {
      initialProps: makeArgs(mock.snapshot),
    });

    await act(async () => {
      result.current.applyLiveGameState(okStatus({ snapshotId: "snap-1", turn: 1 }));
      await Promise.resolve();
    });
    expect(result.current.liveRuntime.snapshotStatus).toBe("loading");

    await act(async () => {
      mock.resolveOk(0);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.liveRuntime.snapshotStatus).toBe("ok");

    // Re-apply the SAME snapshotId while prior is 'ok' → must NOT flip back to loading.
    await act(async () => {
      result.current.applyLiveGameState(okStatus({ snapshotId: "snap-1", turn: 1 }));
      await Promise.resolve();
    });
    expect(result.current.liveRuntime.snapshotStatus).toBe("ok");

    // A NEW snapshotId → loading again.
    await act(async () => {
      result.current.applyLiveGameState(okStatus({ snapshotId: "snap-2", turn: 2 }));
      await Promise.resolve();
    });
    expect(result.current.liveRuntime.snapshotStatus).toBe("loading");
  });
});
