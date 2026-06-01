import { describe, expect, it } from "vitest";

import { parsePresetKey } from "../../src/features/presets/types";

describe("preset keys", () => {
  it("parses live game presets as first-class preset keys", () => {
    expect(parsePresetKey("live:live-game")).toEqual({ kind: "live", id: "live-game" });
  });

  it("keeps unknown preset keys on the safe none path", () => {
    expect(parsePresetKey("live")).toEqual({ kind: "none" });
    expect(parsePresetKey("")).toEqual({ kind: "none" });
  });
});
