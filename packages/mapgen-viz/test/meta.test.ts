import { describe, expect, test } from "bun:test";
import { defineVizMeta } from "../src/meta.js";

describe("defineVizMeta", () => {
  test("derives stable presentation defaults and preserves explicit metadata", () => {
    expect(defineVizMeta("foundation.plateMotion.motionField")).toMatchObject({
      label: "Motion Field",
      group: "Foundation / Plate Motion",
      visibility: "default",
    });

    expect(
      defineVizMeta("foundation.plateMotion.motionField", {
        label: "Velocity",
        group: "Dynamics",
        visibility: "debug",
        role: "arrows",
      })
    ).toMatchObject({
      label: "Velocity",
      group: "Dynamics",
      visibility: "debug",
      role: "arrows",
    });
  });
});
