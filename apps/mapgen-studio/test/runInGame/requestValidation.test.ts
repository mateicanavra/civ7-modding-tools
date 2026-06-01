import { describe, expect, it } from "vitest";

import {
  assertNoRawControlFields,
  parseRunInGameSetupRequest,
} from "../../src/server/runInGame/requestValidation";

describe("Run in Game request validation", () => {
  it("rejects raw control command fields anywhere in the payload", () => {
    expect(() => assertNoRawControlFields({
      config: {
        nested: {
          rawJs: "UI.notifyUIReady()",
        },
      },
    })).toThrow("raw control commands");
    expect(() => assertNoRawControlFields({
      config: {
        operations: [
          {
            rawCommand: "GameplayMap.revealAll()",
          },
        ],
      },
    })).toThrow("raw control commands");
  });

  it("normalizes disposable setup requests to studio-current", () => {
    expect(parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: "123",
      mapSize: "MAPSIZE_STANDARD",
      playerCount: 8,
      materialization: { mode: "disposable" },
      selectedConfig: { id: "swooper-earthlike" },
      config: { ok: true },
    })).toEqual({
      requestedMode: "disposable",
      id: "studio-current",
      seed: 123,
      mapSize: "MAPSIZE_STANDARD",
      playerCount: 8,
    });
  });

  it("keeps durable setup requests on the selected repo-backed config id", () => {
    expect(parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: 123,
      mapSize: "MAPSIZE_HUGE",
      materialization: { mode: "durable" },
      selectedConfig: { id: "swooper-earthlike" },
      config: { ok: true },
    })).toMatchObject({
      requestedMode: "durable",
      id: "swooper-earthlike",
      seed: 123,
      mapSize: "MAPSIZE_HUGE",
    });
  });

  it("rejects malformed setup fields before any mutation can be queued", () => {
    expect(() => parseRunInGameSetupRequest({
      recipeId: "mod-swooper-maps/standard",
      seed: "not a number",
      config: { ok: true },
    })).toThrow("seed must be an integer");
    expect(() => parseRunInGameSetupRequest({
      recipeId: "other",
      seed: 123,
      config: { ok: true },
    })).toThrow("supports only mod-swooper-maps/standard");
  });
});
