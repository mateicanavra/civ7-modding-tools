import { describe, expect, it } from "vitest";

import { parsePresetKey } from "../../src/features/presets/types";

describe("preset keys", () => {
  it("rejects retired live-run config keys", () => {
    expect(parsePresetKey("live:live-game")).toEqual({ kind: "none" });
  });

  it("keeps unknown preset keys on the safe none path", () => {
    expect(parsePresetKey("live")).toEqual({ kind: "none" });
    expect(parsePresetKey("")).toEqual({ kind: "none" });
  });
});
