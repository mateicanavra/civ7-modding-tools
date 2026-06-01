import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "../src/mock-adapter.js";

/**
 * Adapter outcome tests live at the adapter boundary by design.
 *
 * Recipes should exercise placement through recipe execution, but the adapter
 * package still needs direct unit coverage for the typed reconciliation contract
 * it exposes to every map type.
 */
describe("typed placement outcomes", () => {
  it("returns placed resource outcomes with readback evidence", () => {
    const adapter = createMockAdapter({ width: 4, height: 3 });

    const outcome = adapter.placeResourceIntent(4, 3, {
      plotIndex: 5,
      resourceType: 7,
    });

    expect(outcome).toEqual({
      status: "placed",
      plotIndex: 5,
      x: 1,
      y: 1,
      resourceType: 7,
      observedResourceType: 7,
    });
    expect(adapter.getResourceType(1, 1)).toBe(7);
  });

  it("returns typed resource rejections without mutating the tile", () => {
    const adapter = createMockAdapter({
      width: 4,
      height: 3,
      canHaveResource: () => false,
    });

    const outcome = adapter.placeResourceIntent(4, 3, {
      plotIndex: 5,
      resourceType: 7,
    });

    expect(outcome).toEqual({
      status: "rejected",
      plotIndex: 5,
      x: 1,
      y: 1,
      resourceType: 7,
      reason: "cannot-have-resource",
      observedResourceType: adapter.NO_RESOURCE,
    });
    expect(adapter.calls.setResourceType.length).toBe(0);
  });

  it("returns typed discovery outcomes and structural rejections", () => {
    const adapter = createMockAdapter({ width: 4, height: 3 });

    const placed = adapter.placeDiscoveryIntent(4, 3, {
      plotIndex: 6,
      discoveryVisualType: 2687284451,
      discoveryActivationType: 2398750021,
    });
    const rejected = adapter.placeDiscoveryIntent(4, 3, {
      plotIndex: -1,
      discoveryVisualType: 2687284451,
      discoveryActivationType: 2398750021,
    });

    expect(placed).toEqual({
      status: "placed",
      plotIndex: 6,
      x: 2,
      y: 1,
      discoveryVisualType: 2687284451,
      discoveryActivationType: 2398750021,
    });
    expect(rejected).toMatchObject({
      status: "rejected",
      reason: "out-of-bounds",
    });
  });
});
