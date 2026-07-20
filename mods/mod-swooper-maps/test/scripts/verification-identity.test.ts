import { describe, expect, it } from "bun:test";

import type { Civ7MapSummaryResult, Civ7RuntimeProbe } from "@civ7/direct-control";
import {
  compareVerificationRuntimeIdentity,
  resolveVerificationRequestIdentity,
} from "../../scripts/live/verification-identity.js";

const SYNTHETIC_LIVE_SNAPSHOT_DIMENSIONS = { width: 40, height: 30 } as const;
const SYNTHETIC_INITIAL_GRID_DIMENSIONS = { width: 50, height: 38 } as const;

describe("live verification identity", () => {
  it("blocks a request with no identity witness", () => {
    expect(resolveVerificationRequestIdentity({ live: {} })).toEqual({
      requestId: undefined,
      status: "blocked",
      blockedBy: ["request-identity.missing"],
      sources: {
        exactAuthorshipSummary: undefined,
        exactAuthorshipEvidence: undefined,
        log: undefined,
      },
    });
  });

  it("admits one request identity witness", () => {
    expect(
      resolveVerificationRequestIdentity({
        exactAuthorshipEvidence: { requestId: "request-17" },
        live: {},
      })
    ).toEqual({
      requestId: "request-17",
      status: "matched",
      blockedBy: [],
      sources: {
        exactAuthorshipSummary: undefined,
        exactAuthorshipEvidence: "request-17",
        log: undefined,
      },
    });
  });

  it("collapses repeated witnesses into one matched request identity", () => {
    const result = resolveVerificationRequestIdentity({
      exactAuthorshipSummary: { requestId: "request-42" },
      exactAuthorshipEvidence: {
        requestId: "request-42",
        log: { requestId: "request-42" },
      },
      live: {},
    });

    expect(result).toEqual({
      requestId: "request-42",
      status: "matched",
      blockedBy: [],
      sources: {
        exactAuthorshipSummary: "request-42",
        exactAuthorshipEvidence: "request-42",
        log: "request-42",
      },
    });
  });

  it("blocks conflicting request witnesses deterministically", () => {
    const result = resolveVerificationRequestIdentity({
      exactAuthorshipSummary: { requestId: "request-z" },
      exactAuthorshipEvidence: {
        requestId: "request-a",
        log: { requestId: "request-z" },
      },
      live: {},
    });

    expect(result.requestId).toBeUndefined();
    expect(result.status).toBe("blocked");
    expect(result.blockedBy).toEqual(["request-identity.conflict"]);
  });

  it("uses runtime, initial-grid, then live-snapshot precedence for a complete match", () => {
    const current = mapSummary({ seed: 7 });
    const result = compareVerificationRuntimeIdentity(
      {
        live: {
          ...SYNTHETIC_LIVE_SNAPSHOT_DIMENSIONS,
          seed: 7,
          evidence: {
            runtime: { width: 60 },
            fullGrid: {
              initialSummary: {
                ...SYNTHETIC_INITIAL_GRID_DIMENSIONS,
                plotCount: 2_280,
                turn: 1,
                gameHash: 9,
              },
            },
          },
        },
      },
      current
    );

    expect(result.status).toBe("matched");
    expect(result.blockedBy).toEqual([]);
    expect(result.saved).toEqual({
      width: 60,
      height: 38,
      plotCount: 2_280,
      seed: 7,
      turn: 1,
      gameHash: 9,
    });
    expect(result.observed).toEqual({
      host: "127.0.0.1",
      port: 4318,
      state: { id: "tuner", name: "Tuner" },
      width: 60,
      height: 38,
      plotCount: 2_280,
      seed: 7,
      turn: 1,
      gameHash: 9,
    });
    expect(Object.values(result.comparisons).map(({ status }) => status)).toEqual([
      "matched",
      "matched",
      "matched",
      "matched",
      "matched",
      "matched",
    ]);
  });

  it("keeps every failed field disposition closed and orders blockers", () => {
    const result = compareVerificationRuntimeIdentity(
      {
        live: {
          evidence: {
            runtime: { width: 60, plotCount: 2_280, seed: 42, gameHash: 9 },
          },
        },
      },
      mapSummary({
        height: 38,
        plotCount: Number.NaN,
        seed: 43,
        turn: undefined,
      })
    );

    expect(result.status).toBe("blocked");
    expect(result.comparisons).toEqual({
      width: { status: "matched", saved: 60, observed: 60 },
      height: { status: "missing-saved", saved: undefined, observed: 38 },
      plotCount: { status: "missing-observed", saved: 2_280, observed: undefined },
      seed: { status: "mismatch", saved: 42, observed: 43 },
      turn: { status: "missing-saved", saved: undefined, observed: undefined },
      gameHash: { status: "matched", saved: 9, observed: 9 },
    });
    expect(result.blockedBy).toEqual([
      "runtime-identity.height.missing-saved",
      "runtime-identity.plotCount.missing-observed",
      "runtime-identity.seed.mismatch",
      "runtime-identity.turn.missing-saved",
    ]);
  });
});

function mapSummary(
  overrides: Readonly<{
    width?: number;
    height?: number;
    plotCount?: number;
    seed?: number;
    turn?: number | undefined;
    gameHash?: number;
  }> = {}
): Civ7MapSummaryResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "tuner", name: "Tuner" },
    map: {
      width: probe(overrides.width ?? 60),
      height: probe(overrides.height ?? 38),
      plotCount: probe(overrides.plotCount ?? 2_280),
      mapSize: probe(0),
      mapSizeType: probe("MAPSIZE_TINY"),
      randomSeed: probe(overrides.seed ?? 42),
    },
    game: {
      turn:
        "turn" in overrides && overrides.turn === undefined
          ? unavailable()
          : probe(overrides.turn ?? 1),
      age: probe(0),
      maxTurns: probe(500),
      turnDate: probe("4000 BCE"),
      hash: probe(overrides.gameHash ?? 9),
    },
  };
}

function probe<T>(value: T): Civ7RuntimeProbe<T> {
  return { ok: true, value };
}

function unavailable<T>(): Civ7RuntimeProbe<T> {
  return { ok: false, error: "unavailable" };
}
