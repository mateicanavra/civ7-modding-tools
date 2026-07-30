import { describe, expect, it } from "vitest";
import { expectNormalPlayPayloadToOmitDebugInternals } from "../support/normal-output-boundary.js";

const FORBIDDEN_MARKERS = [
  "CMD:",
  "LSQ:",
  "GameContext.",
  "sendRequest",
  "selectedState",
  "socket",
  "requestId",
  "correlationId",
  "closeoutTrace",
  "rawProbe",
] as const;

describe("normal play output boundary", () => {
  it.each(FORBIDDEN_MARKERS)("rejects the debug marker %s", (marker) => {
    expect(() => expectNormalPlayPayloadToOmitDebugInternals({ leaked: marker })).toThrow();
  });

  it("accepts a semantic payload without transport internals", () => {
    expect(() =>
      expectNormalPlayPayloadToOmitDebugInternals({
        state: { summary: "unit requires orders" },
        actions: [{ kind: "inspect-ready-unit", readOnly: true }],
      })
    ).not.toThrow();
  });
});
