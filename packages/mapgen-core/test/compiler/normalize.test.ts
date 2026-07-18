import { describe, expect, it } from "bun:test";
import { createOp, createStrategy, defineOp } from "@mapgen/authoring/index.js";
import { normalizeOpsTopLevel, validateStrict } from "@mapgen/compiler/normalize.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { Type } from "typebox";

const TEST_SETUP = admitMapSetup({
  mapSeed: 1,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
});

describe("compiler normalize helpers", () => {
  it("reports unknown keys with stable paths", () => {
    const schema = Type.Object(
      {
        foo: Type.String(),
      },
      { additionalProperties: false }
    );

    const result = validateStrict(schema, { foo: "ok", extra: 1 }, "/config");
    expect(
      result.errors.some((err) => err.path === "/config/extra" && err.message === "Unknown key")
    ).toBe(true);
  });

  it("expands additional-property diagnostics to escaped child pointers", () => {
    const schema = Type.Object(
      {
        nested: Type.Object({}, { additionalProperties: false }),
      },
      { additionalProperties: false }
    );

    const result = validateStrict(
      schema,
      { nested: { "slash/key": true, "tilde~key": true } },
      "/config"
    );

    expect(result.errors).toContainEqual({
      code: "config.invalid",
      path: "/config/nested/slash~1key",
      message: "Unknown key",
    });
    expect(result.errors).toContainEqual({
      code: "config.invalid",
      path: "/config/nested/tilde~0key",
      message: "Unknown key",
    });
  });

  it("handles null input with deterministic error paths", () => {
    const schema = Type.Object(
      {
        foo: Type.String(),
      },
      { additionalProperties: false }
    );

    const result = validateStrict(schema, null, "/config");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]?.path).toBe("/config");
  });

  it("does not admit missing values through schema defaults", () => {
    const schema = Type.Object(
      {
        foo: Type.String({ default: "bar" }),
      },
      { additionalProperties: false }
    );

    const result = validateStrict(schema, {}, "/config");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.value).toEqual({});
  });

  it("clones valid input without changing its values", () => {
    const schema = Type.Object(
      {
        nested: Type.Object({ enabled: Type.Boolean() }, { additionalProperties: false }),
      },
      { additionalProperties: false }
    );
    const input = { nested: { enabled: false } };

    const result = validateStrict(schema, input, "/config");

    expect(result.errors).toEqual([]);
    expect(result.value).toEqual(input);
    expect(result.value).not.toBe(input);
    expect((result.value as typeof input).nested).not.toBe(input.nested);
    expect(Object.isFrozen(result.value)).toBe(true);
    expect(Object.isFrozen((result.value as typeof input).nested)).toBe(true);
  });

  it("rejects non-portable values without leaking snapshot exceptions", () => {
    const accessor = {};
    Object.defineProperty(accessor, "value", { enumerable: true, get: () => 1 });

    const symbolKey = { value: 1 };
    Object.defineProperty(symbolKey, Symbol("hidden"), { enumerable: true, value: 2 });

    const unsafeKey = { value: 1 };
    Object.defineProperty(unsafeKey, "__proto__", { enumerable: true, value: {} });

    const nonIndexArray = [1];
    Object.defineProperty(nonIndexArray, "extra", { enumerable: true, value: 2 });

    const sparseArray = [1, 2, 3];
    Reflect.deleteProperty(sparseArray, "1");

    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;

    const throwingProxy = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new RangeError("trap escaped");
        },
      }
    );

    const statefulTarget = { value: 1 };
    const statefulProxy = new Proxy(statefulTarget, {
      getOwnPropertyDescriptor: (target, key) => {
        target.value += 1;
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
    });

    const exotic = Object.create({ inherited: true });
    exotic.value = 1;

    const cases: unknown[] = [
      exotic,
      accessor,
      symbolKey,
      { value: Symbol("value") },
      unsafeKey,
      sparseArray,
      nonIndexArray,
      { value: Number.POSITIVE_INFINITY },
      cyclic,
      statefulProxy,
      throwingProxy,
    ];

    for (const input of cases) {
      const result = validateStrict(Type.Unknown(), input, "/config");
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe("config.invalid");
    }
  });

  it("validates union values without filling a selected branch", () => {
    const schema = Type.Union([
      Type.Object(
        { mode: Type.Literal("first"), amount: Type.Number({ default: 1 }) },
        { additionalProperties: false }
      ),
      Type.Object(
        { mode: Type.Literal("second"), amount: Type.Number({ default: 2 }) },
        { additionalProperties: false }
      ),
    ]);

    const input = { mode: "second" };
    const result = validateStrict(schema, input, "/config");

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.value).toEqual(input);
  });

  it("reports op.missing when a contract op has no implementation", () => {
    const op = defineOp({
      kind: "plan",
      id: "test/plan",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      strategies: {
        default: Type.Object({}, { additionalProperties: false }),
      },
    } as const);

    const step = {
      contract: {
        ops: {
          trees: op,
        },
      },
    };

    const result = normalizeOpsTopLevel(step, {}, {}, "/config/ops");
    expect(result.errors).toEqual([
      {
        code: "op.missing",
        path: "/config/ops/trees",
        message: 'Missing op implementation for key "trees"',
        opKey: "trees",
        opId: "test/plan",
      },
    ]);
  });

  it("reports op.normalize.failed when op.normalize throws", () => {
    const contract = defineOp({
      kind: "plan",
      id: "test/plan",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      strategies: {
        default: Type.Object({}, { additionalProperties: false }),
      },
    } as const);
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          normalize: () => {
            throw new Error("normalize exploded");
          },
          run: () => ({}),
        }),
      },
    });

    const step = {
      contract: {
        ops: {
          trees: contract,
        },
      },
    };

    const result = normalizeOpsTopLevel(
      step,
      { trees: { strategy: "default", config: {} } },
      {
        [op.id]: op,
      },
      "/config/ops"
    );

    expect(result.errors).toEqual([
      {
        code: "op.normalize.failed",
        path: "/config/ops/trees",
        message: "normalize exploded",
        opKey: "trees",
        opId: "test/plan",
      },
    ]);
  });
});
