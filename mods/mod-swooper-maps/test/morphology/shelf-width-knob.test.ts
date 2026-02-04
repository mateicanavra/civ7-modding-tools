import { describe, expect, it } from "bun:test";

import ruggedCoasts from "../../src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.js";
import { standardConfig } from "../support/standard-config.js";

describe("morphology-mid shelfWidth knob", () => {
  it("scales shelfMask distance caps deterministically in rugged-coasts normalize", () => {
    const base = (standardConfig as any)["morphology-mid"]?.advanced?.["rugged-coasts"];
    expect(base).toBeTruthy();

    const shelfMask = {
      strategy: "default",
      config: {
        nearshoreDistance: 3,
        shallowQuantile: 0.7,
        activeClosenessThreshold: 0.45,
        capTilesActive: 2,
        capTilesPassive: 4,
        capTilesMax: 8,
      },
    };

    const wide = (ruggedCoasts as any).normalize({ ...base, shelfMask }, { knobs: { shelfWidth: "wide" } });
    expect(wide.shelfMask.config.capTilesActive).toBe(3);
    expect(wide.shelfMask.config.capTilesPassive).toBe(5);

    const narrow = (ruggedCoasts as any).normalize({ ...base, shelfMask }, { knobs: { shelfWidth: "narrow" } });
    expect(narrow.shelfMask.config.capTilesActive).toBe(2);
    expect(narrow.shelfMask.config.capTilesPassive).toBe(3);
  });
});

