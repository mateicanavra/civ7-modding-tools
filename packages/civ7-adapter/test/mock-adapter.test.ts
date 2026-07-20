import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "../src/mock-adapter.js";

describe("MockAdapter", () => {
  it("uses the default map dimensions", () => {
    const adapter = createMockAdapter();

    expect(adapter.width).toBe(128);
    expect(adapter.height).toBe(80);
  });

  it("accepts custom map dimensions", () => {
    const adapter = createMockAdapter({ width: 64, height: 40 });

    expect(adapter.width).toBe(64);
    expect(adapter.height).toBe(40);
  });

  it("stores water and terrain state", () => {
    const adapter = createMockAdapter({ width: 10, height: 10 });

    expect(adapter.isWater(5, 5)).toBe(false);
    expect(adapter.getTerrainType(5, 5)).toBe(0);

    adapter.setWater(5, 5, true);
    expect(adapter.isWater(5, 5)).toBe(true);

    adapter.setTerrainType(5, 5, 3);
    expect(adapter.getTerrainType(5, 5)).toBe(3);
  });
});
