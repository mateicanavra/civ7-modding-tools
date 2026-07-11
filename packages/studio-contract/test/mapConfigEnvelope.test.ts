import { describe, expect, it } from "bun:test";

import {
  isMapConfigEnvelope,
  serializeMapConfigEnvelope,
  snapshotMapConfigEnvelope,
  snapshotPortableJsonValue,
} from "../src/mapConfigEnvelope.js";

function completeEnvelope() {
  return {
    id: "test-map",
    name: "Test Map",
    description: "Complete portable envelope fixture.",
    recipe: "standard",
    sortIndex: 1,
    latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
    config: { stage: { enabled: true, weights: [1, 2, 3] } },
  };
}

describe("MapConfigEnvelope portable admission", () => {
  it("accepts, owns, and serializes a complete value without semantic changes", () => {
    const raw = completeEnvelope();
    const inputJson = JSON.stringify(raw);
    const snapshot = snapshotMapConfigEnvelope(raw);

    expect(snapshot).toBeDefined();
    if (snapshot === undefined) return;

    expect(JSON.stringify(snapshot)).toBe(inputJson);
    expect(snapshot).not.toBe(raw);
    expect(snapshot.config).not.toBe(raw.config);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.config)).toBe(true);

    const wire = serializeMapConfigEnvelope(snapshot);
    expect(JSON.stringify(wire)).toBe(inputJson);
    expect(wire).not.toBe(snapshot);
    expect(wire.config).not.toBe(snapshot.config);
  });

  it("rejects missing and unknown envelope properties directly", () => {
    const missing = completeEnvelope() as Record<string, unknown>;
    delete missing.description;
    const unknown = completeEnvelope() as Record<string, unknown>;
    let unknownKey = "test-unknown-property";
    while (Object.hasOwn(unknown, unknownKey)) unknownKey += "-next";
    unknown[unknownKey] = true;

    expect(isMapConfigEnvelope(missing)).toBe(false);
    expect(snapshotMapConfigEnvelope(missing)).toBeUndefined();
    expect(isMapConfigEnvelope(unknown)).toBe(false);
    expect(snapshotMapConfigEnvelope(unknown)).toBeUndefined();
  });

  it("rejects exotic and non-finite data", () => {
    const exotic = {
      ...completeEnvelope(),
      config: { stage: { createdAt: new Date("2026-07-11T00:00:00.000Z") } },
    };
    const nonFinite = completeEnvelope();
    nonFinite.latitudeBounds.topLatitude = Number.POSITIVE_INFINITY;

    expect(isMapConfigEnvelope(exotic)).toBe(false);
    expect(snapshotMapConfigEnvelope(exotic)).toBeUndefined();
    expect(isMapConfigEnvelope(nonFinite)).toBe(false);
    expect(snapshotMapConfigEnvelope(nonFinite)).toBeUndefined();
  });
});

describe("portable JSON snapshots", () => {
  it("clones exact JSON into a deeply frozen independently owned snapshot", () => {
    const input = {
      stage: {
        enabled: true,
        weights: [1, { value: 2 }, null],
      },
    };
    const snapshot = snapshotPortableJsonValue(input);

    expect(snapshot).toStrictEqual(input);
    expect(snapshot).not.toBe(input);
    if (snapshot === undefined || Array.isArray(snapshot) || snapshot === null) return;

    expect(snapshot.stage).not.toBe(input.stage);
    expect(snapshot.stage.weights).not.toBe(input.stage.weights);
    expect(snapshot.stage.weights[1]).not.toBe(input.stage.weights[1]);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.stage)).toBe(true);
    expect(Object.isFrozen(snapshot.stage.weights)).toBe(true);
    expect(Object.isFrozen(snapshot.stage.weights[1])).toBe(true);

    input.stage.enabled = false;
    input.stage.weights[1]!.value = 99;
    expect(snapshot.stage.enabled).toBe(true);
    expect(snapshot.stage.weights[1]).toStrictEqual({ value: 2 });
  });

  it("rejects exotic, non-finite, and cyclic values", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;

    expect(snapshotPortableJsonValue({ createdAt: new Date(0) })).toBeUndefined();
    expect(snapshotPortableJsonValue({ weight: Number.NaN })).toBeUndefined();
    expect(snapshotPortableJsonValue(cyclic)).toBeUndefined();
  });

  it("rejects accessors, symbols, unsafe keys, and non-index or sparse arrays", () => {
    const accessor = {};
    Object.defineProperty(accessor, "value", {
      enumerable: true,
      get: () => 1,
    });

    const symbolKeyed = { value: 1 };
    Object.defineProperty(symbolKeyed, Symbol("hidden"), {
      enumerable: true,
      value: 2,
    });

    const unsafeKeyed = Object.create(null);
    Object.defineProperty(unsafeKeyed, "constructor", {
      enumerable: true,
      value: "unsafe",
    });

    const nonIndexArray = [1, 2];
    Object.defineProperty(nonIndexArray, "extra", {
      enumerable: true,
      value: 3,
    });
    const sparseArray = [1, 2, 3];
    Reflect.deleteProperty(sparseArray, "1");

    expect(snapshotPortableJsonValue(accessor)).toBeUndefined();
    expect(snapshotPortableJsonValue(symbolKeyed)).toBeUndefined();
    expect(snapshotPortableJsonValue(unsafeKeyed)).toBeUndefined();
    expect(snapshotPortableJsonValue(sparseArray)).toBeUndefined();
    expect(snapshotPortableJsonValue(nonIndexArray)).toBeUndefined();
  });

  it("rejects stateful proxy values that change before their nested observation", () => {
    const changingValue = { weight: 1 };
    const target = { changingValue, trigger: true };
    const proxy = new Proxy(target, {
      getOwnPropertyDescriptor(currentTarget, key) {
        const descriptor = Reflect.getOwnPropertyDescriptor(currentTarget, key);
        if (key === "trigger") changingValue.weight = Number.NaN;
        return descriptor;
      },
    });

    expect(snapshotPortableJsonValue(proxy)).toBeUndefined();
  });

  it("rejects proxy trap failures even when they occur after earlier properties", () => {
    let descriptorObservations = 0;
    const proxy = new Proxy(
      { first: 1, second: 2 },
      {
        getOwnPropertyDescriptor(target, key) {
          descriptorObservations += 1;
          if (key === "second") throw new Error("late descriptor failure");
          return Reflect.getOwnPropertyDescriptor(target, key);
        },
      }
    );

    expect(snapshotPortableJsonValue(proxy)).toBeUndefined();
    expect(descriptorObservations).toBe(2);
  });

  it("observes each data property once without invoking stateful property reads", () => {
    let descriptorObservations = 0;
    let propertyReads = 0;
    const proxy = new Proxy(
      { value: "stable" },
      {
        get(target, key, receiver) {
          propertyReads += 1;
          return propertyReads === 1 ? Reflect.get(target, key, receiver) : "changed";
        },
        getOwnPropertyDescriptor(target, key) {
          descriptorObservations += 1;
          return Reflect.getOwnPropertyDescriptor(target, key);
        },
      }
    );

    expect(snapshotPortableJsonValue(proxy)).toStrictEqual({ value: "stable" });
    expect(descriptorObservations).toBe(1);
    expect(propertyReads).toBe(0);
  });

  it("observes a shared input object's properties only once", () => {
    let descriptorObservations = 0;
    const shared = new Proxy(
      { value: "stable" },
      {
        getOwnPropertyDescriptor(target, key) {
          descriptorObservations += 1;
          return Reflect.getOwnPropertyDescriptor(target, key);
        },
      }
    );

    expect(snapshotPortableJsonValue({ first: shared, second: shared })).toStrictEqual({
      first: { value: "stable" },
      second: { value: "stable" },
    });
    expect(descriptorObservations).toBe(1);
  });
});
