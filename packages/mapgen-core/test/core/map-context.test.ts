import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createMapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup, type MapSetup } from "@mapgen/core/map-setup.js";
import { createNoopTraceScope } from "@mapgen/trace/index.js";

describe("MapContext setup authority", () => {
  it("retains the admitted setup snapshot as the context's sole physical identity", () => {
    const setupInput = {
      mapSeed: 17,
      dimensions: { width: 8, height: 6 },
      latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
    };
    const setup = admitMapSetup(setupInput);
    const adapter = createMockAdapter({ width: 8, height: 6 });

    const context = createMapContext({ setup, adapter });
    setupInput.mapSeed = 19;
    setupInput.dimensions.width = 12;
    setupInput.latitudeBounds.topLatitude = 80;

    expect(context.setup.mapSeed).toBe(17);
    expect(context.setup.dimensions).toEqual({ width: 8, height: 6 });
    expect(context.setup.latitudeBounds).toEqual({ topLatitude: 70, bottomLatitude: -70 });
    expect(context.setup).toBe(setup);
    expect(context.setup.dimensions).not.toBe(setupInput.dimensions);
    expect(context.setup.latitudeBounds).not.toBe(setupInput.latitudeBounds);
    expect(Object.isFrozen(context.setup)).toBe(true);
    expect(Object.isFrozen(context.setup.dimensions)).toBe(true);
    expect(Object.isFrozen(context.setup.latitudeBounds)).toBe(true);
  });

  it("retains one already-admitted setup identity and refuses unknown setup state", () => {
    const admitted = admitMapSetup({
      mapSeed: 23,
      dimensions: { width: 8, height: 6 },
      latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
    });
    const adapter = createMockAdapter({ width: 8, height: 6 });

    expect(createMapContext({ setup: admitted, adapter }).setup).toBe(admitted);
    expect(() =>
      createMapContext({
        setup: {
          mapSeed: 23,
          dimensions: { width: 8, height: 6 },
          latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
        } as MapSetup,
        adapter,
      })
    ).toThrow("MapContext setup must be returned by admitMapSetup");
    expect(() =>
      createMapContext({
        setup: {
          ...admitted,
          trace: { enabled: true },
        } as unknown as MapSetup,
        adapter,
      })
    ).toThrow();
  });

  it("prevents authored runtime mutation of context-owned authorities", () => {
    const setup = admitMapSetup({
      mapSeed: 29,
      dimensions: { width: 8, height: 6 },
      latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
    });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 8, height: 6 }),
    });
    const initialTrace = context.trace;

    expect(Reflect.set(context, "setup", admitMapSetup({ ...setup, mapSeed: 30 }))).toBe(false);
    expect(Reflect.set(context, "trace", createNoopTraceScope())).toBe(false);
    expect(Reflect.set(context, "sharedState", { value: 1 })).toBe(false);
    expect(context.setup).toBe(setup);
    expect(context.trace).toBe(initialTrace);
    expect(Reflect.get(context, "rng")).toBeUndefined();
    expect(Object.isFrozen(context.artifacts)).toBe(true);
    expect(Reflect.get(context.artifacts, "set")).toBeUndefined();
    expect(Reflect.get(context.artifacts, "delete")).toBeUndefined();
    expect(Reflect.get(context.artifacts, "clear")).toBeUndefined();
    expect(() =>
      Reflect.apply(Map.prototype.set, context.artifacts as unknown as Map<string, unknown>, [
        "artifact:test.forbidden",
        true,
      ])
    ).toThrow(TypeError);
    expect(context.artifacts.has("artifact:test.forbidden")).toBe(false);
    expect(Object.getOwnPropertyDescriptor(context, "setup")).toMatchObject({
      writable: false,
      configurable: false,
    });
    expect(Object.getOwnPropertyDescriptor(context, "trace")).toMatchObject({
      set: undefined,
      configurable: false,
    });
    expect(Object.isFrozen(context)).toBe(true);
  });

  it("refuses an adapter whose tile grid differs from the setup", () => {
    const adapter = createMockAdapter({ width: 7, height: 6 });

    expect(() =>
      createMapContext({
        setup: admitMapSetup({
          mapSeed: 17,
          dimensions: { width: 8, height: 6 },
          latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
        }),
        adapter,
      })
    ).toThrow("Map adapter dimensions 7x6 do not match setup dimensions 8x6");
  });
});
