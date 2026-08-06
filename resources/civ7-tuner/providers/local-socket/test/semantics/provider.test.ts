import { Civ7TunerFailure } from "@civ7/tuner";
import { describe, expect, test } from "vitest";
import { resolveLocalSocketCiv7TunerConfig } from "../../config.js";
import {
  allocateListenerId,
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
  selectState,
  statesFromFrame,
} from "../../protocol.js";

describe("local-socket Civ7 Tuner semantics", () => {
  test("normalizes explicit and environment endpoints once", () => {
    expect(
      resolveLocalSocketCiv7TunerConfig({
        host: "127.0.0.1",
        hosts: [" 127.0.0.2 ", "127.0.0.1"],
        env: {
          CIV7_TUNER_HOSTS: "127.0.0.3, 127.0.0.2",
          CIV7_TUNER_PORT: "65535",
        },
        timeoutMs: 1_234,
      })
    ).toEqual({
      hosts: ["127.0.0.2", "127.0.0.1", "127.0.0.3"],
      port: 65_535,
      timeoutMs: 1_234,
    });
  });

  test("refuses an invalid provider port as a typed acquisition failure", () => {
    expect(() => resolveLocalSocketCiv7TunerConfig({ env: { CIV7_TUNER_PORT: "0" } })).toThrow(
      Civ7TunerFailure
    );
    try {
      resolveLocalSocketCiv7TunerConfig({ env: { CIV7_TUNER_PORT: "0" } });
    } catch (cause) {
      expect(cause).toMatchObject({
        _tag: "Civ7TunerFailure",
        operation: "acquire",
        reason: "invalid-configuration",
      });
    }
  });

  test("refuses invalid explicit transport bounds before acquisition", () => {
    for (const options of [
      { port: 0, env: {} },
      { port: 65_536, env: {} },
      { timeoutMs: 0, env: {} },
      { timeoutMs: Number.NaN, env: {} },
    ]) {
      expect(() => resolveLocalSocketCiv7TunerConfig(options)).toThrow(Civ7TunerFailure);
    }
  });

  test("frames fragmented and concatenated protocol messages", () => {
    const first = encodeCiv7TunerRequest(1, "LSQ:");
    const second = encodeCiv7TunerRequest(2, "CMD:65535:1 + 1");
    expect(parseCiv7TunerFrame(first.subarray(0, 3))).toBeUndefined();

    const combined = Buffer.concat([first, second]);
    const parsedFirst = parseCiv7TunerFrame(combined);
    expect(parsedFirst?.frame).toEqual({ listenerId: 1, parts: ["LSQ:"] });
    expect(parseCiv7TunerFrame(combined.subarray(parsedFirst?.bytesRead))).toMatchObject({
      frame: { listenerId: 2, parts: ["CMD:65535:1 + 1"] },
    });
  });

  test("interprets named states and selects them by semantic role", () => {
    const states = statesFromFrame(["65535", "App UI", "1", "Tuner", "dangling"]);
    expect(states).toEqual([
      { id: "65535", name: "App UI" },
      { id: "1", name: "Tuner" },
    ]);
    expect(selectState(states, { role: "app-ui" })).toEqual(states[0]);
    expect(selectState(states, { role: "tuner" })).toEqual(states[1]);
    expect(selectState(states, { id: "65535" })).toEqual(states[0]);
  });

  test("allocates positive monotonic listener identities", () => {
    const first = allocateListenerId();
    const second = allocateListenerId();
    expect(first).toBeGreaterThan(0);
    expect(second).toBe(first + 1);
  });
});
