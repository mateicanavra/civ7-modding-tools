import { describe, expect, it } from "vitest";

import {
  buildLiveRuntimeSnapshotQuery,
  buildLiveRuntimeSnapshotRequest,
  buildLiveRuntimeSnapshotState,
  buildLiveRuntimeStatusState,
  buildLiveRuntimeSuggestionRecords,
  shouldCommitLiveRuntimeSnapshot,
} from "../../src/features/liveRuntime/model";

describe("live runtime model", () => {
  it("keys runtime status by turn and stable hash", () => {
    const first = buildLiveRuntimeStatusState({
      observedAtFallback: "2026-06-06T00:00:00.000Z",
      body: {
        ok: true,
        observedAt: "2026-06-06T00:00:01.000Z",
        status: { readiness: "ready" },
        mapSummary: {
          game: { turn: { ok: true, value: 12 }, hash: { ok: true, value: 987654 } },
          map: {
            randomSeed: { ok: true, value: 123 },
            width: { ok: true, value: 96 },
            height: { ok: true, value: 60 },
          },
        },
        autoplay: { autoplay: { isActive: false, isPaused: false } },
      },
    });
    const second = buildLiveRuntimeStatusState({
      observedAtFallback: "2026-06-06T00:00:02.000Z",
      body: {
        ok: true,
        status: { readiness: "ready" },
        mapSummary: {
          game: { hash: { ok: true, value: 987654 }, turn: { ok: true, value: 12 } },
          map: {
            height: { ok: true, value: 60 },
            width: { ok: true, value: 96 },
            randomSeed: { ok: true, value: 123 },
          },
        },
        autoplay: { autoplay: { isPaused: false, isActive: false } },
      },
    });

    expect(first.snapshotId).toBe(second.snapshotId);
    expect(first.turn).toBe(12);
    expect(first.gameHash).toBe(987654);
    expect(first.seed).toBe(123);
    expect(first.bindingStatus).toBe("unbound-runtime");
  });

  it("keys same-turn runtime status by Civ game hash", () => {
    const baseBody = {
      ok: true,
      observedAt: "2026-06-06T00:00:01.000Z",
      status: { readiness: "ready" },
      mapSummary: {
        game: { turn: { ok: true, value: 12 } },
        map: {
          randomSeed: { ok: true, value: 123 },
          width: { ok: true, value: 96 },
          height: { ok: true, value: 60 },
        },
      },
      autoplay: { autoplay: { isActive: false, isPaused: false } },
    };
    const first = buildLiveRuntimeStatusState({
      observedAtFallback: "2026-06-06T00:00:00.000Z",
      body: {
        ...baseBody,
        mapSummary: {
          ...baseBody.mapSummary,
          game: { ...baseBody.mapSummary.game, hash: { ok: true, value: 111 } },
        },
      },
    });
    const second = buildLiveRuntimeStatusState({
      observedAtFallback: "2026-06-06T00:00:02.000Z",
      body: {
        ...baseBody,
        mapSummary: {
          ...baseBody.mapSummary,
          game: { ...baseBody.mapSummary.game, hash: { ok: true, value: 222 } },
        },
      },
    });

    expect(first.turn).toBe(second.turn);
    expect(first.gameHash).toBe(111);
    expect(second.gameHash).toBe(222);
    expect(first.snapshotId).not.toBe(second.snapshotId);
    expect(buildLiveRuntimeSnapshotRequest({ status: first })?.key).not.toBe(
      buildLiveRuntimeSnapshotRequest({ status: second })?.key,
    );
  });

  it("creates bounded snapshot requests and rejects stale commits", () => {
    const status = buildLiveRuntimeStatusState({
      observedAtFallback: "2026-06-06T00:00:00.000Z",
      body: {
        ok: true,
        mapSummary: {
          game: { turn: { ok: true, value: 7 } },
          map: { randomSeed: { ok: true, value: 44 } },
        },
      },
    });
    const request = buildLiveRuntimeSnapshotRequest({ status });

    expect(request?.maxPlots).toBe(64);
    expect(buildLiveRuntimeSnapshotQuery(request!)).toContain("maxPlots=64");
    expect(shouldCommitLiveRuntimeSnapshot({
      activeRequestKey: request!.key,
      resultRequestKey: request!.key,
    })).toBe(true);
    expect(shouldCommitLiveRuntimeSnapshot({
      activeRequestKey: "newer-request",
      resultRequestKey: request!.key,
    })).toBe(false);
    expect(shouldCommitLiveRuntimeSnapshot({
      activeRequestKey: request!.key,
      resultRequestKey: request!.key,
      aborted: true,
    })).toBe(false);
  });

  it("hashes snapshot payloads and keeps request identity in the state", () => {
    const status = buildLiveRuntimeStatusState({
      observedAtFallback: "2026-06-06T00:00:00.000Z",
      body: {
        ok: true,
        mapSummary: {
          game: { turn: { ok: true, value: 8 } },
          map: { randomSeed: { ok: true, value: 77 } },
        },
      },
    });
    const request = buildLiveRuntimeSnapshotRequest({ status })!;
    const snapshot = buildLiveRuntimeSnapshotState({
      request,
      observedAtFallback: "2026-06-06T00:00:02.000Z",
      body: {
        ok: true,
        observedAt: "2026-06-06T00:00:03.000Z",
        grid: { plots: [{ x: 0, y: 0, terrain: "TERRAIN_GRASS" }] },
      },
    });

    expect(snapshot.status).toBe("ok");
    expect(snapshot.requestKey).toBe(request.key);
    expect(snapshot.snapshotId).toMatch(/^snapshot:8:/);
  });

  it("emits explicit suggestion records for live-to-Studio translation", () => {
    const records = buildLiveRuntimeSuggestionRecords({
      sourceSnapshotId: "snapshot:1:abc",
      seed: 123,
      setupConfig: { gameOptions: { Difficulty: "DIFFICULTY_PRINCE" } },
      now: () => new Date("2026-06-06T00:00:00.000Z"),
    });

    expect(records).toHaveLength(2);
    expect(records.map((record) => record.affectedConfigPath)).toEqual(["recipeSettings.seed", "setupConfig"]);
    expect(records.every((record) => record.applyPath === "visible-studio-control")).toBe(true);
  });
});
