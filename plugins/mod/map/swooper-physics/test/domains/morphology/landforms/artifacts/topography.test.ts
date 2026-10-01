import { describe, expect, it } from "bun:test";

import { artifacts } from "../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 3, height: 2 };

function fixture() {
  return {
    elevation: new Int16Array([5, -2, -3, -4, 5, 5]),
    seaLevel: 0,
    landMask: new Uint8Array([1, 0, 0, 0, 1, 1]),
    bathymetry: new Int16Array([0, -2, -3, -4, 0, 0]),
    externalWaterMask: new Uint8Array([0, 1, 1, 0, 0, 0]),
  };
}

function issues(value: unknown) {
  return artifacts.topography.validate(value, { dimensions: SYNTHETIC_DIMENSIONS });
}

describe("landforms topography external-water admission", () => {
  it("admits an independent binary prescription including wet ground at its fixed head", () => {
    const value = fixture();
    value.elevation[1] = value.seaLevel;
    expect(issues(value)).toEqual([]);
    value.externalWaterMask.fill(0);
    expect(issues(value)).toEqual([]);
  });

  it("refuses nonbinary declaration and initial wetness, land prescription, and above-head ground", () => {
    const value = fixture();
    value.externalWaterMask[0] = 1;
    value.externalWaterMask[1] = 2;
    value.elevation[2] = 1;
    value.landMask[3] = 2;
    const messages = issues(value).map(({ message }) => message);
    expect(messages.some((message) => message.includes("externalWaterMask[1] must be binary"))).toBe(true);
    expect(messages.some((message) => message.includes("landMask[3] must be binary"))).toBe(true);
    expect(messages.some((message) => message.includes("subset of initial water"))).toBe(true);
    expect(messages.some((message) => message.includes("prescribed seaLevel datum"))).toBe(true);
  });

  it("requires the declaration and a finite existing sea datum", () => {
    const { externalWaterMask: _, ...withoutDeclaration } = fixture();
    expect(issues(withoutDeclaration).length).toBeGreaterThan(0);
    for (const seaLevel of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(issues({ ...fixture(), seaLevel }).length).toBeGreaterThan(0);
    }
  });
});
