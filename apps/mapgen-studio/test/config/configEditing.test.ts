import { describe, expect, it } from "vitest";
import { applyConfigPatch } from "../../src/ui/utils/config";

describe("complete config editing", () => {
  const config = {
    stage: {
      knobs: { strength: 1 },
      step: { enabled: true },
    },
  };

  it("returns a complete new value without mutating the prior config", () => {
    const edited = applyConfigPatch(config, {
      path: ["stage", "knobs", "strength"],
      value: 2,
    });

    expect(edited).toEqual({
      stage: {
        knobs: { strength: 2 },
        step: { enabled: true },
      },
    });
    expect(edited).not.toBe(config);
    expect(edited.stage).not.toBe(config.stage);
    expect(config.stage.knobs.strength).toBe(1);
  });

  it("rejects sparse paths instead of synthesizing incomplete config", () => {
    expect(() =>
      applyConfigPatch(config, {
        path: ["stage", "missing", "strength"],
        value: 2,
      })
    ).toThrow("Config path does not exist: stage.missing.strength");
  });
});
