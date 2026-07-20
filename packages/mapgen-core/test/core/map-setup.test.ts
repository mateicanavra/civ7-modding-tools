import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@mapgen/core/map-setup.js";

const validSetup = () => ({
  mapSeed: 0,
  dimensions: { width: 8, height: 6 },
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
});

describe("map setup admission", () => {
  it("preserves the exact identity of an already-admitted setup", () => {
    const admitted = admitMapSetup(validSetup());

    expect(admitMapSetup(admitted)).toBe(admitted);
  });

  it("trusts only registered identities and exposes no runtime brand", () => {
    const admitted = admitMapSetup(validSetup());
    const cast = { ...validSetup(), mapSeed: 1.5 } as unknown as typeof admitted;
    const clone = { ...admitted, extra: true } as unknown as typeof admitted;
    const proxy = new Proxy(admitted, {}) as typeof admitted;
    const readmittedProxy = admitMapSetup(proxy);

    expect(Object.getOwnPropertySymbols(admitted)).toEqual([]);
    expect(() => admitMapSetup(cast)).toThrow();
    expect(() => admitMapSetup(clone)).toThrow();
    expect(readmittedProxy).not.toBe(admitted);
    expect(readmittedProxy).not.toBe(proxy);
  });

  it("snapshots mutable input into one deeply frozen setup", () => {
    const input = validSetup();
    const admitted = admitMapSetup(input);

    input.mapSeed = 99;
    input.dimensions.width = 20;
    input.latitudeBounds.topLatitude = 80;

    expect(admitted.mapSeed).toBe(0);
    expect(admitted.dimensions).toEqual({ width: 8, height: 6 });
    expect(admitted.latitudeBounds).toEqual({ topLatitude: 60, bottomLatitude: -60 });
    expect(Object.isFrozen(admitted)).toBe(true);
    expect(Object.isFrozen(admitted.dimensions)).toBe(true);
    expect(Object.isFrozen(admitted.latitudeBounds)).toBe(true);
  });

  it("rejects accessor-bearing setup inputs without evaluating them", () => {
    let reads = 0;
    const input = {
      get mapSeed() {
        reads += 1;
        return reads === 1 ? 0 : 1.5;
      },
      dimensions: { width: 8, height: 6 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    expect(() => admitMapSetup(input)).toThrow("must be an own enumerable data property");
    expect(reads).toBe(0);
  });

  it("rejects class instances before inherited accessors can cross setup admission", () => {
    let reads = 0;
    class SetupInput {
      readonly dimensions = { width: 8, height: 6 };
      readonly latitudeBounds = { topLatitude: 60, bottomLatitude: -60 };

      get mapSeed(): number {
        reads += 1;
        return reads === 1 ? 0 : 1.5;
      }
    }

    expect(() => admitMapSetup(new SetupInput())).toThrow("Map setup must be a plain data object");
    expect(reads).toBe(0);
  });

  it.each([
    ["zero width", { dimensions: { width: 0, height: 6 } }],
    ["negative height", { dimensions: { width: 8, height: -1 } }],
    ["fractional width", { dimensions: { width: 8.5, height: 6 } }],
  ])("rejects %s", (_label, replacement) => {
    expect(() => admitMapSetup({ ...validSetup(), ...replacement })).toThrow();
  });

  it("rejects dimensions whose tile count overflows signed grid indexing", () => {
    expect(() =>
      admitMapSetup({
        ...validSetup(),
        dimensions: { width: 46_341, height: 46_341 },
      })
    ).toThrow("Map setup tile count must fit a signed 32-bit grid index");
  });

  it.each([1.5, -2_147_483_649, 2_147_483_648])("rejects invalid map seed %p", (seed) => {
    expect(() => admitMapSetup({ ...validSetup(), mapSeed: seed })).toThrow();
  });

  it.each([
    { topLatitude: 0, bottomLatitude: 0 },
    { topLatitude: -10, bottomLatitude: 10 },
  ])("rejects unordered latitude bounds %p", (latitudeBounds) => {
    expect(() => admitMapSetup({ ...validSetup(), latitudeBounds })).toThrow(
      "Map setup topLatitude must be greater than bottomLatitude."
    );
  });

  it.each([-2_147_483_648, -1, 0, 1, 2_147_483_647])("accepts signed map seed %p", (seed) => {
    expect(admitMapSetup({ ...validSetup(), mapSeed: seed }).mapSeed).toBe(seed);
  });
});
