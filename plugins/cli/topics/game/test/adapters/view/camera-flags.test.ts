import { describe, expect, test } from "vitest";
import { parsePlotFlag, parseZoomFlag } from "../../../src/adapters/view/camera-flags";

const fail = (message: string): never => {
  throw new Error(message);
};

describe("camera flags", () => {
  test("parses plot coordinates and normalized zoom values", () => {
    expect(parsePlotFlag(" 32, 17 ", fail)).toEqual({ x: 32, y: 17 });
    expect(parseZoomFlag("0", fail)).toBe(0);
    expect(parseZoomFlag("0.35", fail)).toBe(0.35);
    expect(parseZoomFlag("1", fail)).toBe(1);
  });

  test("rejects malformed plot coordinates", () => {
    expect(() => parsePlotFlag("32;17", fail)).toThrow("--plot must be x,y");
    expect(() => parsePlotFlag("-1,17", fail)).toThrow("--plot must be x,y");
  });

  test("rejects zoom values outside the normalized range", () => {
    expect(() => parseZoomFlag("-0.1", fail)).toThrow("--zoom must be a number between 0");
    expect(() => parseZoomFlag("1.1", fail)).toThrow("--zoom must be a number between 0");
    expect(() => parseZoomFlag("not-a-number", fail)).toThrow("--zoom must be a number between 0");
  });
});
