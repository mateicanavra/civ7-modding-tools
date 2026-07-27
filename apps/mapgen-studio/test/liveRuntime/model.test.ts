import { describe, expect, it } from "vitest";

import {
  buildLiveRuntimeSetupRequestKey,
  buildLiveRuntimeSnapshotQuery,
  buildLiveRuntimeSnapshotRequest,
  buildLiveRuntimeSnapshotState,
  buildLiveRuntimeStatusState,
  buildLiveRuntimeSuggestionRecords,
  selectLiveRuntimeGameSeed,
  shouldCommitLiveRuntimeSetup,
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
      buildLiveRuntimeSnapshotRequest({ status: second })?.key
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
    expect(
      shouldCommitLiveRuntimeSnapshot({
        activeRequestKey: request!.key,
        resultRequestKey: request!.key,
      })
    ).toBe(true);
    expect(
      shouldCommitLiveRuntimeSnapshot({
        activeRequestKey: "newer-request",
        resultRequestKey: request!.key,
      })
    ).toBe(false);
    expect(
      shouldCommitLiveRuntimeSnapshot({
        activeRequestKey: request!.key,
        resultRequestKey: request!.key,
        aborted: true,
      })
    ).toBe(false);
  });

  it("keys setup follow-up commits from pushed live-game state", () => {
    const first = buildLiveRuntimeStatusState({
      observedAtFallback: "2026-06-06T00:00:00.000Z",
      body: {
        ok: true,
        mapSummary: {
          game: { turn: { ok: true, value: 7 }, hash: { ok: true, value: 111 } },
          map: { randomSeed: { ok: true, value: 44 } },
        },
      },
    });
    const second = buildLiveRuntimeStatusState({
      observedAtFallback: "2026-06-06T00:00:01.000Z",
      body: {
        ok: true,
        mapSummary: {
          game: { turn: { ok: true, value: 8 }, hash: { ok: true, value: 222 } },
          map: { randomSeed: { ok: true, value: 55 } },
        },
      },
    });
    const firstKey = buildLiveRuntimeSetupRequestKey(first);
    const secondKey = buildLiveRuntimeSetupRequestKey(second);

    expect(firstKey).not.toBe(secondKey);
    expect(
      shouldCommitLiveRuntimeSetup({
        activeRequestKey: secondKey,
        resultRequestKey: firstKey,
      })
    ).toBe(false);
    expect(
      shouldCommitLiveRuntimeSetup({
        activeRequestKey: firstKey,
        resultRequestKey: firstKey,
        aborted: true,
      })
    ).toBe(false);
    expect(
      shouldCommitLiveRuntimeSetup({
        activeRequestKey: firstKey,
        resultRequestKey: firstKey,
      })
    ).toBe(true);
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
      gameSeed: -456,
      setupConfig: { gameOptions: { Difficulty: "DIFFICULTY_PRINCE" } },
      now: () => new Date("2026-06-06T00:00:00.000Z"),
    });

    expect(records).toHaveLength(3);
    expect(records.map((record) => record.affectedConfigPath)).toEqual([
      "seed",
      "gameSeed",
      "setupConfig",
    ]);
    expect(records.find((record) => record.affectedConfigPath === "seed")?.value).toBe("123");
    expect(records.find((record) => record.affectedConfigPath === "gameSeed")?.value).toBe("-456");
    expect(records.every((record) => record.applyPath === "visible-studio-control")).toBe(true);
  });

  it.each([
    ["observed integer", { id: "GameRandomSeed", exists: true, value: -456 }, -456],
    [
      "read-only observation",
      { id: "GameRandomSeed", exists: true, readOnly: true, value: "456" },
      456,
    ],
    ["missing parameter", undefined, undefined],
    ["unavailable parameter", { id: "GameRandomSeed", exists: false, value: 456 }, undefined],
    [
      "destroyed parameter",
      { id: "GameRandomSeed", exists: true, destroyed: true, value: 456 },
      undefined,
    ],
    ["refused parameter", { id: "GameRandomSeed", exists: true, invalidReason: 4 }, undefined],
    ["malformed value", { id: "GameRandomSeed", exists: true, value: "seed-456" }, undefined],
  ] as const)("selects %s game-seed evidence", (_label, parameter, expected) => {
    expect(
      selectLiveRuntimeGameSeed({
        parameters: parameter ? [parameter] : [],
        players: [],
      })
    ).toBe(expected);
  });
});
