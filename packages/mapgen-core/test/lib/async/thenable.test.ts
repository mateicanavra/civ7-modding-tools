import { describe, expect, it } from "bun:test";
import { classifyThenable, containThenable } from "@mapgen/lib/async/thenable.js";

describe("thenable classification", () => {
  it("captures a callable hidden from descriptor preflight with one property read", () => {
    let propertyReads = 0;
    let calls = 0;
    const candidate = new Proxy(Object.create(null) as object, {
      get: (_target, key) => {
        if (key !== "then") return undefined;
        propertyReads += 1;
        return (_onFulfilled: undefined, onRejected: () => undefined) => {
          calls += 1;
          onRejected();
        };
      },
      getOwnPropertyDescriptor: () => undefined,
      getPrototypeOf: () => null,
    });

    const classification = classifyThenable(candidate);
    expect(classification.kind).toBe("callable");
    expect(propertyReads).toBe(1);
    containThenable(classification);
    expect(propertyReads).toBe(1);
    expect(calls).toBe(1);
  });

  it("trusts the single captured property value rather than a proxy's data descriptor", () => {
    let callableReads = 0;
    let calls = 0;
    const callableCandidate = new Proxy(Object.create(null) as object, {
      get: (_target, key) => {
        if (key !== "then") return undefined;
        callableReads += 1;
        return () => {
          calls += 1;
        };
      },
      getOwnPropertyDescriptor: (_target, key) =>
        key === "then"
          ? { configurable: true, enumerable: true, writable: true, value: 0 }
          : undefined,
      getPrototypeOf: () => null,
    });
    const noncallableCandidate = new Proxy(Object.create(null) as object, {
      get: (_target, key) => (key === "then" ? 0 : undefined),
      getOwnPropertyDescriptor: (_target, key) =>
        key === "then"
          ? { configurable: true, enumerable: true, writable: true, value: () => undefined }
          : undefined,
      getPrototypeOf: () => null,
    });

    const callable = classifyThenable(callableCandidate);
    expect(callable.kind).toBe("callable");
    expect(callableReads).toBe(1);
    containThenable(callable);
    expect(callableReads).toBe(1);
    expect(calls).toBe(1);
    expect(classifyThenable(noncallableCandidate)).toEqual({ kind: "none" });
  });

  it("does not invoke known accessors during descriptor preflight", () => {
    let getterCalls = 0;
    const candidate = Object.defineProperty({}, "then", {
      get: () => {
        getterCalls += 1;
        return () => undefined;
      },
    });

    expect(classifyThenable(candidate)).toEqual({ kind: "ambiguous" });
    expect(getterCalls).toBe(0);
  });
});
