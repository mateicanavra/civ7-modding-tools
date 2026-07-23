import { describe, expect, it } from "bun:test";
import {
  alignOwnDataRecords,
  captureOwnDataRecord,
  materializeOwnDataRecord,
} from "../../src/authoring/own-data-record.js";

describe("own-data record authority", () => {
  it("captures each own descriptor once without invoking property reads", () => {
    let descriptorReads = 0;
    let valueReads = 0;
    const input = new Proxy(
      {},
      {
        ownKeys: () => ["sample"],
        getOwnPropertyDescriptor: () => {
          descriptorReads += 1;
          return {
            configurable: true,
            enumerable: true,
            value: "admitted",
            writable: true,
          };
        },
        get: () => {
          valueReads += 1;
          return "divergent";
        },
      }
    );

    expect(captureOwnDataRecord(input, "samples")).toEqual([{ key: "sample", value: "admitted" }]);
    expect(descriptorReads).toBe(1);
    expect(valueReads).toBe(0);
  });

  it("refuses symbols, non-enumerable properties, and accessors", () => {
    expect(() => captureOwnDataRecord({ [Symbol("hidden")]: true }, "samples")).toThrow(
      "keys must be strings"
    );

    const hidden = {};
    Object.defineProperty(hidden, "sample", { value: true });
    expect(() => captureOwnDataRecord(hidden, "samples")).toThrow(
      "must be an own enumerable data property"
    );

    const accessor = {
      get sample() {
        throw new Error("must not run");
      },
    };
    expect(() => captureOwnDataRecord(accessor, "samples")).toThrow(
      "must be an own enumerable data property"
    );
  });

  it("aligns candidates to authority order and refuses missing or extra keys", () => {
    const authority = captureOwnDataRecord({ first: 1, second: 2 }, "authority");
    const reversed = captureOwnDataRecord({ second: "two", first: "one" }, "candidate");

    expect(alignOwnDataRecords(authority, reversed, "candidate")).toEqual([
      { key: "first", authority: 1, candidate: "one" },
      { key: "second", authority: 2, candidate: "two" },
    ]);
    expect(() =>
      alignOwnDataRecords(
        authority,
        captureOwnDataRecord({ first: "one" }, "candidate"),
        "candidate"
      )
    ).toThrow('is missing "second"');
    expect(() =>
      alignOwnDataRecords(
        authority,
        captureOwnDataRecord({ first: "one", second: "two", third: "three" }, "candidate"),
        "candidate"
      )
    ).toThrow('has unknown "third"');
  });

  it("materializes infrastructure-like keys on a frozen null-prototype record", () => {
    const record = materializeOwnDataRecord([
      { key: "__proto__", value: "data" },
      { key: "constructor", value: "also-data" },
    ]);

    expect(Object.getPrototypeOf(record)).toBeNull();
    expect(Reflect.get(record, "__proto__")).toBe("data");
    expect(Reflect.get(record, "constructor")).toBe("also-data");
    expect(Object.isFrozen(record)).toBe(true);
  });
});
