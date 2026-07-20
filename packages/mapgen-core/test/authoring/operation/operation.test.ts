import { describe, expect, it } from "bun:test";
import {
  bindCompileOps,
  bindRuntimeOps,
  createOp,
  createRecipe,
  createStage,
  createStep,
  createStrategy,
  defineOp,
  defineStep,
  OperationInputAdmissionError,
  runtimeOp,
  TypedArraySchemas,
} from "@mapgen/authoring/index.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { Type } from "typebox";

const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

describe("operation authoring", () => {
  it("copies explicit default authority and refuses forged defaults", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/explicit-default-authority",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      defaultStrategy: "balanced",
      strategies: {
        balanced: Type.Object(
          { plateauCount: Type.Integer({ default: 3 }) },
          { additionalProperties: false }
        ),
        fast: Type.Object(
          { turbo: Type.Boolean({ default: true }) },
          { additionalProperties: false }
        ),
      },
    });
    const strategies = {
      balanced: createStrategy(contract, "balanced", { run: () => "balanced" }),
      fast: createStrategy(contract, "fast", { run: () => "fast" }),
    };
    const op = createOp(contract, { strategies });

    expect(op.defaultStrategy).toBe("balanced");
    expect(op.defaultConfig).toEqual({ strategy: "balanced", config: { plateauCount: 3 } });
    expect(op.run({}, op.defaultConfig)).toBe("balanced");

    const forged = {
      ...contract,
      defaultConfig: { strategy: "fast", config: { turbo: true } },
    } as unknown as typeof contract;
    expect(() => createOp(forged, { strategies })).toThrow(
      "createOp(test/explicit-default-authority) requires contract.defaultConfig"
    );

    const malformedSameStrategy = {
      ...contract,
      defaultConfig: { strategy: "balanced", config: { plateauCount: "three" } },
    } as unknown as typeof contract;
    expect(() => createOp(malformedSameStrategy, { strategies })).toThrow(
      "createOp(test/explicit-default-authority) requires contract.defaultConfig"
    );

    const forgedPair = {
      ...contract,
      defaultStrategy: "fast",
      defaultConfig: { strategy: "fast", config: { turbo: true } },
    } as unknown as typeof contract;
    expect(() => createOp(forgedPair, { strategies })).toThrow(
      "createOp(test/explicit-default-authority) requires contract.defaultConfig"
    );

    const forgedStrategyOnly = {
      ...contract,
      defaultStrategy: "fast",
    } as unknown as typeof contract;
    expect(() => createOp(forgedStrategyOnly, { strategies })).toThrow(
      "createOp(test/explicit-default-authority) requires contract.defaultConfig"
    );
  });

  it("binds compile/runtime ops by contract ids", () => {
    const declarations = { trees: { id: "ecology/trees" } } as const;
    const contract = defineOp({
      kind: "plan",
      id: "ecology/trees",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const compileOp = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", { run: () => "ok" }),
      },
    });

    const compileOps = bindCompileOps(declarations, { [compileOp.id]: compileOp });
    expect(compileOps.trees).toBe(compileOp);

    const runtimeOps = bindRuntimeOps(declarations, { [compileOp.id]: runtimeOp(compileOp) });
    expect(runtimeOps.trees.id).toBe(compileOp.id);
  });

  it("bindCompileOps throws when registry is missing an op id", () => {
    const declarations = { trees: { id: "missing" } } as const;
    expect(() => bindCompileOps(declarations, {})).toThrow(/missing/i);
  });

  it("createRecipe rejects missing runtime op implementations for step-declared ops", () => {
    const contract = defineOp({
      kind: "plan",
      id: "test/ops/missing-runtime",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: () => ({}),
        }),
      },
    });
    const step = createStep(
      defineStep({
        id: "alpha",
        phase: "foundation",
        requires: [],
        provides: [],
        ops: { trees: contract },
        schema: Type.Object({}, { additionalProperties: false }),
      }),
      { run: () => {} }
    );
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: { [op.id]: op },
        runtimeOpsById: {},
      })
    ).toThrow(/Missing op implementation/i);
  });

  it("admits exact typed-array constructors and declared cardinalities before one strategy run", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/admitted-operation-input",
      input: Type.Object(
        {
          width: Type.Integer({ minimum: 1 }),
          height: Type.Integer({ minimum: 1 }),
          plan: Type.Object(
            {
              width: Type.Integer({ minimum: 1 }),
              height: Type.Integer({ minimum: 1 }),
            },
            { additionalProperties: false }
          ),
          grid: TypedArraySchemas.u8(),
          latitudeByRow: TypedArraySchemas.f32({ cardinality: ["height"] }),
          constructorOnly: TypedArraySchemas.i16({ cardinality: null }),
          rows: Type.Array(
            Type.Object(
              {
                mask: TypedArraySchemas.u8({ cardinality: ["plan.width", "plan.height"] }),
              },
              { additionalProperties: false }
            )
          ),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    let runs = 0;
    const strategy = createStrategy(contract, "default", {
      run: (input) => {
        runs += 1;
        return input.grid.length;
      },
    });
    const op = createOp(contract, { strategies: { default: strategy } });

    expect(strategy).not.toHaveProperty("run");
    expect(op.strategies.default.config).toBe(contract.strategies.default);
    expect(
      op.run(
        {
          width: 3,
          height: 2,
          plan: { width: 2, height: 2 },
          grid: new Uint8Array(6),
          latitudeByRow: new Float32Array(2),
          constructorOnly: new Int16Array(1),
          rows: [{ mask: new Uint8Array(4) }, { mask: new Uint8Array(4) }],
        },
        op.defaultConfig
      )
    ).toBe(6);
    expect(runs).toBe(1);
  });

  it("gives an explicit cardinality property precedence over the deprecated shape option", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/explicit-cardinality-precedence",
      input: Type.Object(
        {
          width: Type.Integer({ minimum: 1 }),
          height: Type.Integer({ minimum: 1 }),
          grid: TypedArraySchemas.u8({ cardinality: undefined, shape: null }),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", { run: (input) => input.grid.length }),
      },
    });

    expect(op.run({ width: 2, height: 2, grid: new Uint8Array(4) }, op.defaultConfig)).toBe(4);
    expect(() =>
      op.run({ width: 2, height: 2, grid: new Uint8Array(1) }, op.defaultConfig)
    ).toThrow(
      expect.objectContaining({ issues: [expect.objectContaining({ expectedLength: 4 })] })
    );
  });

  it("refuses all typed-array admission issues deterministically before strategy execution", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/refused-operation-input",
      input: Type.Object(
        {
          width: Type.Integer({ minimum: 1 }),
          height: Type.Integer({ minimum: 1 }),
          plan: Type.Object(
            {
              width: Type.Integer({ minimum: 1 }),
              height: Type.Integer({ minimum: 1 }),
            },
            { additionalProperties: false }
          ),
          grid: TypedArraySchemas.u8(),
          latitudeByRow: TypedArraySchemas.f32({ cardinality: ["height"] }),
          rows: Type.Array(
            Type.Object(
              {
                mask: TypedArraySchemas.u8({ cardinality: ["plan.width", "plan.height"] }),
              },
              { additionalProperties: false }
            )
          ),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    let runs = 0;
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: () => {
            runs += 1;
            return 0;
          },
        }),
      },
    });

    let refusal: unknown;
    try {
      op.run(
        {
          width: 3,
          height: 2,
          plan: { width: 2, height: 2 },
          grid: new Int8Array(6) as unknown as Uint8Array,
          latitudeByRow: new Float32Array(3),
          rows: [{ mask: new Uint8Array(3) }, { mask: new Uint8Array(4) }],
        },
        op.defaultConfig
      );
    } catch (error) {
      refusal = error;
    }

    expect(refusal).toBeInstanceOf(OperationInputAdmissionError);
    const error = refusal as OperationInputAdmissionError;
    expect(error.opId).toBe(contract.id);
    expect(error.issues).toEqual([
      {
        code: "typed-array-constructor",
        path: "$.grid",
        expectedConstructors: ["Uint8Array"],
        observedConstructor: "Int8Array",
      },
      {
        code: "typed-array-cardinality",
        path: "$.latitudeByRow",
        cardinalityPaths: ["height"],
        expectedLength: 2,
        observedLength: 3,
      },
      {
        code: "typed-array-cardinality",
        path: "$.rows[0].mask",
        cardinalityPaths: ["plan.width", "plan.height"],
        expectedLength: 4,
        observedLength: 3,
      },
    ]);
    expect(Object.isFrozen(error)).toBe(true);
    expect(Object.isFrozen(error.issues)).toBe(true);
    expect(error.issues.every(Object.isFrozen)).toBe(true);
    expect(runs).toBe(0);
  });

  it("rejects spoof objects, wrong views, and typed-array subclasses", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/exact-operation-input-constructor",
      input: Type.Object(
        {
          value: TypedArraySchemas.u8({ cardinality: null }),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    let runs = 0;
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: () => {
            runs += 1;
            return 0;
          },
        }),
      },
    });
    class DerivedUint8Array extends Uint8Array {}

    for (const [value, observedConstructor] of [
      [{ constructor: Uint8Array, length: 1 }, "Object"],
      [new DataView(new ArrayBuffer(1)), "DataView"],
      [new DerivedUint8Array(1), "DerivedUint8Array"],
    ] as const) {
      expect(() => op.run({ value: value as unknown as Uint8Array }, op.defaultConfig)).toThrow(
        expect.objectContaining({
          issues: [
            {
              code: "typed-array-constructor",
              path: "$.value",
              expectedConstructors: ["Uint8Array"],
              observedConstructor,
            },
          ],
        })
      );
    }
    expect(runs).toBe(0);
  });

  it("applies optionality at each property segment and refuses missing required parents", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/optional-operation-input-paths",
      input: Type.Object(
        {
          optional: Type.Optional(
            Type.Object(
              {
                requiredValue: TypedArraySchemas.u8({ cardinality: null }),
              },
              { additionalProperties: false }
            )
          ),
          required: Type.Object(
            {
              rows: Type.Array(
                Type.Object(
                  {
                    value: TypedArraySchemas.u8({ cardinality: null }),
                  },
                  { additionalProperties: false }
                )
              ),
            },
            { additionalProperties: false }
          ),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    let runs = 0;
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: () => {
            runs += 1;
            return 0;
          },
        }),
      },
    });

    expect(op.run({ required: { rows: [] } }, op.defaultConfig)).toBe(0);
    expect(() =>
      op.run({ optional: {} as never, required: { rows: [] } }, op.defaultConfig)
    ).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "typed-array-constructor",
            path: "$.optional.requiredValue",
            expectedConstructors: ["Uint8Array"],
            observedConstructor: "undefined",
          },
        ],
      })
    );
    expect(() => op.run({ required: {} as never }, op.defaultConfig)).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "typed-array-container",
            path: "$.required.rows",
            expectedContainer: "array",
            observedContainer: "undefined",
          },
        ],
      })
    );
    expect(runs).toBe(1);
  });

  it("admits closed typed-array alternatives without treating a union as an intersection", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/union-operation-input",
      input: Type.Object(
        {
          value: Type.Optional(
            Type.Union([
              TypedArraySchemas.f32({ cardinality: null }),
              TypedArraySchemas.i16({ cardinality: null }),
              Type.Undefined(),
            ])
          ),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: (input) => input.value?.length ?? 0,
        }),
      },
    });

    expect(op.run({}, op.defaultConfig)).toBe(0);
    expect(op.run({ value: new Float32Array(2) }, op.defaultConfig)).toBe(2);
    expect(op.run({ value: new Int16Array(3) }, op.defaultConfig)).toBe(3);
    expect(() => op.run({ value: new Uint8Array(1) as never }, op.defaultConfig)).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "typed-array-constructor",
            path: "$.value",
            expectedConstructors: ["Float32Array", "Int16Array"],
            observedConstructor: "Uint8Array",
          },
        ],
      })
    );
  });

  it("admits undefined in a typed-array union only at an optional property", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/required-undefined-operation-input",
      input: Type.Object(
        {
          value: Type.Union([TypedArraySchemas.u8({ cardinality: null }), Type.Undefined()]),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });

    expect(() =>
      createOp(contract, {
        strategies: {
          default: createStrategy(contract, "default", { run: () => 0 }),
        },
      })
    ).toThrow(
      'Operation typed-array union at "$.value" admits undefined only for an optional property'
    );
  });

  it("refuses inherited values for optional admitted properties", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/inherited-optional-operation-input",
      input: Type.Object(
        {
          value: Type.Optional(TypedArraySchemas.u8({ cardinality: null })),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: (input) => input.value?.length ?? 0,
        }),
      },
    });
    const inherited = Object.create({ value: new Uint8Array(1) }) as {
      value?: Uint8Array;
    };

    expect(() => op.run(inherited, op.defaultConfig)).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "typed-array-constructor",
            path: "$.value",
            expectedConstructors: ["Uint8Array"],
            observedConstructor: "undefined",
          },
        ],
      })
    );
  });

  it("fails closed for typed arrays nested under unsupported schema containers", () => {
    for (const [id, input] of [
      ["tuple", Type.Tuple([TypedArraySchemas.u8({ cardinality: null })])],
      ["record", Type.Record(Type.String(), TypedArraySchemas.u8({ cardinality: null }))],
      [
        "cyclic",
        Type.Cyclic(
          {
            Node: Type.Object({
              value: TypedArraySchemas.u8({ cardinality: null }),
              next: Type.Optional(Type.Ref("Node")),
            }),
          },
          "Node"
        ),
      ],
    ] as const) {
      const contract = defineOp({
        kind: "compute",
        id: `test/unsupported-${id}-operation-input`,
        input,
        output: Type.Integer(),
        defaultStrategy: "default",
        strategies: { default: Type.Object({}, { additionalProperties: false }) },
      });

      expect(() =>
        createOp(contract, {
          strategies: {
            default: createStrategy(contract, "default", { run: () => 0 }),
          },
        })
      ).toThrow('Operation typed-array metadata at "$" uses an unsupported schema container');
    }
  });

  it("fails closed for direct and nested typed-array references", () => {
    const referenced = TypedArraySchemas.u8({
      cardinality: null,
      $id: "test/referenced-operation-input-buffer",
    });
    const reference = () =>
      Object.assign(Type.Ref("test/referenced-operation-input-buffer"), { $ref: referenced });
    for (const [id, input, path] of [
      ["direct", reference(), "$"],
      ["nested", Type.Object({ value: reference() }), "$.value"],
    ] as const) {
      const contract = defineOp({
        kind: "compute",
        id: `test/${id}-referenced-operation-input`,
        input,
        output: Type.Integer(),
        defaultStrategy: "default",
        strategies: { default: Type.Object({}, { additionalProperties: false }) },
      });

      expect(() =>
        createOp(contract, {
          strategies: {
            default: createStrategy(contract, "default", { run: () => 0 }),
          },
        })
      ).toThrow(`Operation typed-array metadata at "${path}" uses an unsupported schema container`);
    }
  });

  it("rejects inherited typed-array constructor metadata at contract construction", () => {
    const runtimeMetadata = Object.assign(Object.create({ ctor: "Uint8Array" }), {
      kind: "typed-array",
      cardinality: null,
    });
    const inheritedConstructorSchema = Type.Unsafe<Uint8Array>(
      Type.Any({ "x-runtime": runtimeMetadata })
    );
    const contract = defineOp({
      kind: "compute",
      id: "test/inherited-operation-input-constructor",
      input: Type.Object({ value: inheritedConstructorSchema }, { additionalProperties: false }),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });

    expect(() =>
      createOp(contract, {
        strategies: {
          default: createStrategy(contract, "default", { run: () => 0 }),
        },
      })
    ).toThrow("Unsupported operation typed-array constructor");
  });

  it("rejects inherited typed-array kind metadata at contract construction", () => {
    const runtimeMetadata = Object.assign(Object.create({ kind: "typed-array" }), {
      ctor: "Uint8Array",
      cardinality: null,
    });
    const inheritedKindSchema = Type.Unsafe<Uint8Array>(Type.Any({ "x-runtime": runtimeMetadata }));
    const contract = defineOp({
      kind: "compute",
      id: "test/inherited-operation-input-kind",
      input: Type.Object({ value: inheritedKindSchema }, { additionalProperties: false }),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });

    expect(() =>
      createOp(contract, {
        strategies: {
          default: createStrategy(contract, "default", { run: () => 0 }),
        },
      })
    ).toThrow("Operation typed-array metadata kind must be an own property");
  });

  it("fails closed for malformed union and intersection containers with typed-array members", () => {
    for (const key of ["anyOf", "allOf"] as const) {
      const contract = defineOp({
        kind: "compute",
        id: `test/malformed-${key}-operation-input`,
        input: Type.Object({ value: Type.Any() }, { additionalProperties: false }),
        output: Type.Integer(),
        defaultStrategy: "default",
        strategies: { default: Type.Object({}, { additionalProperties: false }) },
      });
      const valueSchema = (
        contract.input as unknown as {
          properties: { value: Record<PropertyKey, unknown> };
        }
      ).properties.value;
      valueSchema[key] = [TypedArraySchemas.u8({ cardinality: null }), null];

      expect(() =>
        createOp(contract, {
          strategies: {
            default: createStrategy(contract, "default", { run: () => 0 }),
          },
        })
      ).toThrow('Operation typed-array metadata at "$.value" uses an unsupported schema container');
    }
  });

  it("rejects sparse typed-array cardinality metadata at contract construction", () => {
    const cardinality = new Array<string>(1);
    const sparseCardinalitySchema = Type.Unsafe<Uint8Array>(
      Type.Any({
        "x-runtime": {
          kind: "typed-array",
          ctor: "Uint8Array",
          cardinality,
        },
      })
    );
    const contract = defineOp({
      kind: "compute",
      id: "test/sparse-operation-input-cardinality",
      input: Type.Object({ value: sparseCardinalitySchema }, { additionalProperties: false }),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });

    expect(() =>
      createOp(contract, {
        strategies: {
          default: createStrategy(contract, "default", { run: () => 0 }),
        },
      })
    ).toThrow("Invalid typed-array cardinality metadata for Uint8Array");
  });

  it("refuses a strategy descriptor sealed for another contract", () => {
    const firstContract = defineOp({
      kind: "compute",
      id: "test/strategy-descriptor-first",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const secondContract = defineOp({
      kind: "compute",
      id: "test/strategy-descriptor-second",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const secondStrategy = createStrategy(secondContract, "default", { run: () => 2 });

    expect(() =>
      createOp(firstContract, {
        strategies: { default: secondStrategy as never },
      })
    ).toThrow(
      "Strategy descriptor test/strategy-descriptor-second#default cannot implement test/strategy-descriptor-first#default"
    );
  });

  it("refuses a strategy descriptor sealed for a different contract with the same id", () => {
    const expectedContract = defineOp({
      kind: "compute",
      id: "test/same-id-strategy-descriptor",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const otherContract = defineOp({
      kind: "compute",
      id: "test/same-id-strategy-descriptor",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const otherStrategy = createStrategy(otherContract, "default", { run: () => "wrong" });

    expect(() =>
      createOp(expectedContract, {
        strategies: { default: otherStrategy as never },
      })
    ).toThrow(
      "Strategy descriptor test/same-id-strategy-descriptor#default cannot implement test/same-id-strategy-descriptor#default"
    );
  });

  it("rejects unresolved typed-array cardinality sources when the operation is constructed", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/unresolved-operation-cardinality",
      input: Type.Object(
        {
          values: TypedArraySchemas.u8({ cardinality: ["missing"] }),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });

    expect(() =>
      createOp(contract, {
        strategies: {
          default: createStrategy(contract, "default", { run: () => 0 }),
        },
      })
    ).toThrow('Operation typed-array cardinality source "missing" is not a numeric input');
  });

  it("resolves typed-array cardinality sources across input intersections", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/intersected-operation-input",
      input: Type.Intersect([
        Type.Object({
          width: Type.Integer({ minimum: 1 }),
          height: Type.Integer({ minimum: 1 }),
        }),
        Type.Object({ grid: TypedArraySchemas.u8() }),
      ]),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", { run: (input) => input.grid.length }),
      },
    });

    expect(op.run({ width: 3, height: 2, grid: new Uint8Array(6) }, op.defaultConfig)).toBe(6);
    expect(() =>
      op.run({ width: 3, height: 2, grid: new Uint8Array(5) }, op.defaultConfig)
    ).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "typed-array-cardinality",
            path: "$.grid",
            cardinalityPaths: ["width", "height"],
            expectedLength: 6,
            observedLength: 5,
          },
        ],
      })
    );
  });

  it("admits numeric cardinality sources expressed as intersections", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/intersected-operation-cardinality-source",
      input: Type.Object(
        {
          width: Type.Intersect([Type.Integer({ minimum: 1 }), Type.Number({ maximum: 4 })]),
          height: Type.Integer({ minimum: 1 }),
          grid: TypedArraySchemas.u8(),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", { run: (input) => input.grid.length }),
      },
    });

    expect(op.run({ width: 2, height: 3, grid: new Uint8Array(6) }, op.defaultConfig)).toBe(6);
  });

  it("retains requiredness declared by another input intersection member", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/intersected-operation-input-requiredness",
      input: Type.Intersect([
        Type.Object({
          value: Type.Optional(TypedArraySchemas.u8({ cardinality: null })),
        }),
        Type.Object({ value: Type.Any() }),
      ]),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: (input) => input.value?.length ?? 0,
        }),
      },
    });

    expect(() => op.run({} as never, op.defaultConfig)).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "typed-array-constructor",
            path: "$.value",
            expectedConstructors: ["Uint8Array"],
            observedConstructor: "undefined",
          },
        ],
      })
    );
  });

  it("fails closed when a typed-array wildcard container is not an array", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/non-array-operation-container",
      input: Type.Object(
        {
          width: Type.Integer({ minimum: 1 }),
          height: Type.Integer({ minimum: 1 }),
          rows: Type.Array(
            Type.Object(
              {
                first: TypedArraySchemas.u8(),
                second: TypedArraySchemas.f32(),
              },
              { additionalProperties: false }
            )
          ),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    let runs = 0;
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: () => {
            runs += 1;
            return 0;
          },
        }),
      },
    });

    expect(() =>
      op.run(
        {
          width: 1,
          height: 1,
          rows: {} as never,
        },
        op.defaultConfig
      )
    ).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "typed-array-container",
            path: "$.rows",
            expectedContainer: "array",
            observedContainer: "Object",
          },
        ],
      })
    );
    expect(runs).toBe(0);
  });

  it("refuses sparse and caller-overridden array traversal", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/closed-operation-input-array-traversal",
      input: Type.Array(TypedArraySchemas.u8({ cardinality: null })),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: (input) => input.reduce((total, value) => total + value.length, 0),
        }),
      },
    });
    const sparse = new Array<Uint8Array>(1);
    const overridden = [new Int8Array(1) as unknown as Uint8Array];
    overridden.flatMap = () => [];

    for (const input of [sparse, overridden]) {
      expect(() => op.run(input, op.defaultConfig)).toThrow(
        expect.objectContaining({
          issues: [expect.objectContaining({ path: "$[0]", code: "typed-array-constructor" })],
        })
      );
    }
  });

  it("fails closed when declared cardinality multiplication exceeds safe integers", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/overflowing-operation-cardinality",
      input: Type.Object(
        {
          width: Type.Integer({ minimum: 1 }),
          height: Type.Integer({ minimum: 1 }),
          grid: TypedArraySchemas.u8(),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      defaultStrategy: "default",
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", { run: () => 0 }),
      },
    });

    expect(() =>
      op.run(
        {
          width: Number.MAX_SAFE_INTEGER,
          height: 2,
          grid: new Uint8Array(),
        },
        op.defaultConfig
      )
    ).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "typed-array-cardinality-overflow",
            path: "$.grid",
            cardinalityPaths: ["width", "height"],
            factors: [Number.MAX_SAFE_INTEGER, 2],
          },
        ],
      })
    );
  });
});
