import { describe, expect, it } from "bun:test";
import {
  createOp,
  createRecipe,
  createStage,
  createStep,
  createStrategy,
  defineOp,
  defineStep,
  defineStrategy,
  OperationInputAdmissionError,
  runtimeOp,
  TypedArraySchemas,
} from "@mapgen/authoring/index.js";
import { Type } from "typebox";
import { bindCompileOps, bindRuntimeOps } from "../../../src/authoring/operation/bindings.js";

const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

describe("operation authoring", () => {
  it("composes canonical strategy leaves and derives tuple implementation identities", () => {
    const measuredSchema = Type.Object(
      { sampleCount: Type.Integer({ default: 3 }) },
      { additionalProperties: false }
    );
    const measured = defineStrategy({ id: "measured", config: measuredSchema });
    const estimated = defineStrategy({
      id: "estimated",
      config: Type.Object({ bias: Type.Integer({ default: 1 }) }, { additionalProperties: false }),
    });
    const contract = defineOp({
      kind: "compute",
      id: "test/canonical-strategy-definitions",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      defaultStrategy: "measured",
      strategies: [measured, estimated],
    });
    const measuredImpl = createStrategy(contract, measured, {
      run: (_input, config) => `measured:${config.sampleCount}`,
    });
    const estimatedImpl = createStrategy(contract, estimated, {
      run: (_input, config) => `estimated:${config.bias}`,
    });
    const operation = createOp(contract, { strategies: [estimatedImpl, measuredImpl] });

    expect(contract.strategies.measured).toBe(measured);
    expect(contract.strategies.measured.config).not.toBe(measuredSchema);
    expect(Object.isFrozen(measuredSchema)).toBe(false);
    expect(() =>
      Type.With(measured.config, { description: "Composable strategy configuration." })
    ).not.toThrow();
    expect(operation.run({}, operation.defaultConfig)).toBe("measured:3");
    expect(() =>
      createOp(contract, { strategies: [measuredImpl, measuredImpl, estimatedImpl] } as never)
    ).toThrow('duplicate strategy implementation "measured"');
    expect(() => defineOp({ ...contract, strategies: [measured, measured] } as never)).toThrow(
      'duplicate strategy "measured"'
    );
  });

  it("captures canonical contract and implementation tuples once without property reads", () => {
    const measured = defineStrategy({
      id: "measured",
      config: Type.Object({ samples: Type.Integer({ default: 2 }) }),
    });
    const estimated = defineStrategy({
      id: "estimated",
      config: Type.Object({ bias: Type.Integer({ default: 1 }) }),
    });
    let contractLengthReads = 0;
    const contractStrategies = new Proxy([measured, estimated] as const, {
      get(target, key, receiver) {
        if (key === "length") {
          contractLengthReads += 1;
          return contractLengthReads === 1 ? 2 : 1;
        }
        return Reflect.get(target, key, receiver);
      },
    });
    const contract = defineOp({
      kind: "compute",
      id: "test/descriptor-captured-strategy-definitions",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      defaultStrategy: "estimated",
      strategies: contractStrategies,
    });

    expect(contractLengthReads).toBe(0);
    expect(Object.keys(contract.strategies)).toEqual(["measured", "estimated"]);
    expect(contract.defaultStrategy).toBe("estimated");

    const measuredImpl = createStrategy(contract, measured, {
      run: (_input, config) => `measured:${config.samples}`,
    });
    const estimatedImpl = createStrategy(contract, estimated, {
      run: (_input, config) => `estimated:${config.bias}`,
    });
    let implementationLengthReads = 0;
    const implementations = new Proxy([measuredImpl, estimatedImpl] as const, {
      get(target, key, receiver) {
        if (key === "length") {
          implementationLengthReads += 1;
          return implementationLengthReads === 1 ? 2 : 1;
        }
        return Reflect.get(target, key, receiver);
      },
    });
    const operation = createOp(contract, { strategies: implementations });

    expect(implementationLengthReads).toBe(0);
    expect(operation.run({}, operation.defaultConfig)).toBe("estimated:1");
  });

  it("refuses extra tuple keys and indexed accessors without invoking them", () => {
    const measured = defineStrategy({
      id: "measured",
      config: Type.Object({}, { additionalProperties: false }),
    });
    const contractTuple = [measured];
    Object.defineProperty(contractTuple, "shadow", {
      enumerable: true,
      value: measured,
    });
    expect(() =>
      defineOp({
        kind: "compute",
        id: "test/extra-contract-tuple-key",
        input: Type.Object({}, { additionalProperties: false }),
        output: Type.String(),
        strategies: contractTuple,
      } as never)
    ).toThrow("dense array without extra keys");

    const contract = defineOp({
      kind: "compute",
      id: "test/exact-implementation-tuple-shape",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: [measured],
    });
    const descriptor = createStrategy(contract, measured, { run: () => "measured" });
    const implementationTuple = [descriptor];
    Object.defineProperty(implementationTuple, "shadow", {
      enumerable: true,
      value: descriptor,
    });
    expect(() => createOp(contract, { strategies: implementationTuple as never })).toThrow(
      "dense array without extra keys"
    );

    let accessorReads = 0;
    const accessorTuple = [measured];
    Object.defineProperty(accessorTuple, "0", {
      enumerable: true,
      get() {
        accessorReads += 1;
        return measured;
      },
    });
    expect(() =>
      defineOp({
        kind: "compute",
        id: "test/accessor-contract-tuple-entry",
        input: Type.Object({}, { additionalProperties: false }),
        output: Type.String(),
        strategies: accessorTuple,
      } as never)
    ).toThrow("must be an enumerable data property");
    expect(accessorReads).toBe(0);
  });

  it("refuses malformed, reserved, and structurally forged strategy definitions", () => {
    const config = Type.Object({}, { additionalProperties: false });
    expect(() => defineStrategy({ id: "default", config })).toThrow(
      'strategy id "default" must be replaced by a semantic identity'
    );
    expect(() => defineStrategy({ id: "measured", config, extra: true } as never)).toThrow(
      "strategy definition must own only id and config"
    );
    expect(() =>
      defineOp({
        kind: "compute",
        id: "test/forged-strategy-definition",
        input: Type.Object({}, { additionalProperties: false }),
        output: Type.Number(),
        strategies: [{ id: "measured", config }],
      } as never)
    ).toThrow("strategy definition must be created by defineStrategy");
  });

  it("binds implementations to the exact strategy leaf composed into the operation", () => {
    const selected = defineStrategy({
      id: "measured",
      config: Type.Object({}, { additionalProperties: false }),
    });
    const lookalike = defineStrategy({
      id: "measured",
      config: Type.Object({}, { additionalProperties: false }),
    });
    const contract = defineOp({
      kind: "compute",
      id: "test/exact-strategy-leaf",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Number(),
      strategies: [selected],
    });

    expect(() => createStrategy(contract, lookalike as never, { run: () => 0 })).toThrow(
      "is not the exact leaf composed into operation test/exact-strategy-leaf"
    );
  });

  it("infers a sole semantic strategy and materializes its TypeBox defaults", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/sole-strategy-authority",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: [
        defineStrategy({
          id: "measured",
          config: Type.Object(
            { sampleCount: Type.Integer({ default: 3 }) },
            { additionalProperties: false }
          ),
        }),
      ],
    });
    const operation = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.measured, {
          run: (_input, config) => `samples:${config.sampleCount}`,
        }),
      ],
    });

    expect(contract.defaultStrategy).toBe("measured");
    expect(contract.defaultConfig).toEqual({ strategy: "measured", config: { sampleCount: 3 } });
    expect(operation.run({}, operation.defaultConfig)).toBe("samples:3");
  });

  it("refuses empty, generic, redundant, and unresolved default authority at runtime", () => {
    const base = {
      kind: "compute",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
    } as const;

    expect(
      defineOp({
        ...base,
        id: "test/undefined-sole-default",
        defaultStrategy: undefined,
        strategies: [
          defineStrategy({
            id: "measured",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        ],
      }).defaultStrategy
    ).toBe("measured");

    expect(() =>
      defineOp({ ...base, id: "test/empty-strategies", strategies: [] } as never)
    ).toThrow("requires at least one semantic strategy");
    expect(() =>
      defineOp({
        ...base,
        id: "__proto__",
        strategies: [
          defineStrategy({
            id: "measured",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        ],
      } as never)
    ).toThrow('operation definition id "__proto__" is reserved');
    expect(() =>
      defineOp({
        ...base,
        id: "test/generic-strategy",
        strategies: [
          defineStrategy({
            id: "default",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        ],
      } as never)
    ).toThrow('strategy id "default" must be replaced by a semantic identity');
    expect(() =>
      defineOp({
        ...base,
        id: "test/redundant-default",
        defaultStrategy: "measured",
        strategies: [
          defineStrategy({
            id: "measured",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        ],
      } as never)
    ).toThrow('infers its sole strategy "measured"; remove defaultStrategy');
    expect(() =>
      defineOp({
        ...base,
        id: "test/missing-multi-default",
        strategies: [
          defineStrategy({
            id: "measured",
            config: Type.Object({}, { additionalProperties: false }),
          }),
          defineStrategy({
            id: "estimated",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        ],
      } as never)
    ).toThrow("requires an explicit declared default strategy");
  });

  it("copies explicit default authority and refuses forged contracts", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/explicit-default-authority",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      defaultStrategy: "balanced",
      strategies: [
        defineStrategy({
          id: "balanced",
          config: Type.Object(
            { plateauCount: Type.Integer({ default: 3 }) },
            { additionalProperties: false }
          ),
        }),
        defineStrategy({
          id: "fast",
          config: Type.Object(
            { turbo: Type.Boolean({ default: true }) },
            { additionalProperties: false }
          ),
        }),
      ],
    });
    const strategies = [
      createStrategy(contract, contract.strategies.balanced, { run: () => "balanced" }),
      createStrategy(contract, contract.strategies.fast, { run: () => "fast" }),
    ] as const;
    const op = createOp(contract, { strategies });

    expect(op.defaultStrategy).toBe("balanced");
    expect(op.defaultConfig).toEqual({ strategy: "balanced", config: { plateauCount: 3 } });
    expect(op.run({}, op.defaultConfig)).toBe("balanced");

    const forged = {
      ...contract,
      defaultConfig: { strategy: "fast", config: { turbo: true } },
    } as unknown as typeof contract;
    expect(() => createOp(forged, { strategies })).toThrow("must be created by defineOp");

    const malformedSameStrategy = {
      ...contract,
      defaultConfig: { strategy: "balanced", config: { plateauCount: "three" } },
    } as unknown as typeof contract;
    expect(() => createOp(malformedSameStrategy, { strategies })).toThrow(
      "must be created by defineOp"
    );

    const forgedPair = {
      ...contract,
      defaultStrategy: "fast",
      defaultConfig: { strategy: "fast", config: { turbo: true } },
    } as unknown as typeof contract;
    expect(() => createOp(forgedPair, { strategies })).toThrow("must be created by defineOp");

    const forgedStrategyOnly = {
      ...contract,
      defaultStrategy: "fast",
    } as unknown as typeof contract;
    expect(() => createOp(forgedStrategyOnly, { strategies })).toThrow(
      "must be created by defineOp"
    );
    expect(() =>
      createStrategy(forged, forged.strategies.balanced, {
        run: () => "forged",
      })
    ).toThrow("must be created by defineOp");
  });

  it("detaches admitted schemas while retaining native TypeBox composability", () => {
    const shared = Type.Integer({ default: 2 });
    const input = Type.Object({ first: shared, second: shared }, { additionalProperties: false });
    const output = Type.Object({ value: Type.Number() }, { additionalProperties: false });
    const strategy = Type.Object(
      {
        nested: Type.Object(
          { count: Type.Integer({ default: 1 }) },
          { additionalProperties: false }
        ),
      },
      { additionalProperties: false, description: "Original strategy schema." }
    );
    const contract = defineOp({
      kind: "compute",
      id: "test/detached-operation-authority",
      input,
      output,
      strategies: [defineStrategy({ id: "measured", config: strategy })],
    });

    expect(contract.input).not.toBe(input);
    expect(contract.output).not.toBe(output);
    expect(contract.strategies.measured.config).not.toBe(strategy);
    expect(contract.input.properties.first).toBe(contract.input.properties.second);
    expect(Object.isFrozen(contract)).toBe(true);
    expect(Object.isFrozen(contract.input.properties.first)).toBe(false);
    expect(Object.isFrozen(contract.defaultConfig.config.nested)).toBe(true);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(output)).toBe(false);
    expect(Object.isFrozen(strategy)).toBe(false);

    const annotated = Type.With(contract.strategies.measured.config, {
      description: "A consumer-owned view over the canonical strategy schema.",
    });
    expect(annotated.description).toBe("A consumer-owned view over the canonical strategy schema.");
    expect(Reflect.get(contract.strategies.measured.config, "description")).toBe(
      "Original strategy schema."
    );

    expect(Reflect.set(shared, "minimum", 1)).toBe(true);
    expect(Reflect.get(contract.input.properties.first, "minimum")).toBeUndefined();
  });

  it("seals strategy behavior behind factory provenance without freezing caller state", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/sealed-strategy-authority",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: [
        defineStrategy({
          id: "measured",
          config: Type.Object({}, { additionalProperties: false }),
        }),
      ],
    });
    const implementation = { run: () => "captured" };
    const descriptor = createStrategy(contract, contract.strategies.measured, implementation);
    implementation.run = () => "mutated";
    const operation = createOp(contract, { strategies: [descriptor] });

    expect(operation.run({}, operation.defaultConfig)).toBe("captured");
    expect(Object.isFrozen(implementation)).toBe(false);
    expect(() =>
      createOp(contract, {
        strategies: [{ ...descriptor }] as never,
      })
    ).toThrow("Invalid MapGen strategy descriptor");
  });

  it("binds compile/runtime ops by contract ids", () => {
    const contract = defineOp({
      kind: "plan",
      id: "ecology/trees",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const compileOp = createOp(contract, {
      strategies: [createStrategy(contract, contract.strategies.single, { run: () => "ok" })],
    });
    const declarations = { trees: contract } as const;

    const compileOps = bindCompileOps(declarations, { [compileOp.id]: compileOp });
    expect(compileOps.trees).toBe(compileOp);
    expect(Object.isFrozen(compileOps)).toBe(true);
    expect(() => Object.defineProperty(compileOps, "trees", { value: undefined })).toThrow();

    const runtimeOps = bindRuntimeOps(declarations, { [compileOp.id]: runtimeOp(compileOp) });
    expect(runtimeOps.trees.id).toBe(compileOp.id);
    expect(Object.isFrozen(runtimeOps)).toBe(true);
    expect(() => Object.defineProperty(runtimeOps, "trees", { value: undefined })).toThrow();
    expect(runtimeOp(compileOp)).toBe(runtimeOp(compileOp));
    expect(Object.isFrozen(runtimeOp(compileOp))).toBe(true);
  });

  it("bindCompileOps throws when registry is missing an op id", () => {
    const contract = defineOp({
      kind: "plan",
      id: "test/ops/missing",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    expect(() => bindCompileOps({ trees: contract }, {})).toThrow(/missing/i);
  });

  it("refuses registry keys and values that do not retain exact contract authority", () => {
    const contract = defineOp({
      kind: "plan",
      id: "test/ops/exact-binding",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const alternateContract = defineOp({
      kind: "plan",
      id: "test/ops/exact-binding",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const implementation = createOp(contract, {
      strategies: [createStrategy(contract, contract.strategies.single, { run: () => "exact" })],
    });
    const alternate = createOp(alternateContract, {
      strategies: [
        createStrategy(alternateContract, alternateContract.strategies.single, {
          run: () => "alternate",
        }),
      ],
    });
    const runtime = runtimeOp(implementation);

    expect(() => bindCompileOps({ exact: contract }, { wrong: implementation })).toThrow(
      'registry key "wrong" must equal "test/ops/exact-binding"'
    );
    expect(() => bindRuntimeOps({ exact: contract }, { wrong: runtime })).toThrow(
      'registry key "wrong" must equal "test/ops/exact-binding"'
    );
    expect(() => bindCompileOps({ exact: contract }, { [alternate.id]: alternate })).toThrow(
      "must implement its exact operation contract"
    );
    expect(() =>
      bindRuntimeOps({ exact: contract }, { [alternate.id]: runtimeOp(alternate) })
    ).toThrow("must implement its exact operation contract");
  });

  it("createRecipe rejects missing runtime op implementations for step-declared ops", () => {
    const contract = defineOp({
      kind: "plan",
      id: "test/ops/missing-runtime",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, {
          run: () => ({}),
        }),
      ],
    });
    const step = createStep(
      defineStep({
        id: "alpha",
        requires: [],
        provides: [],
        ops: { trees: contract },
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
          offsets: TypedArraySchemas.i32({
            cardinality: { factors: ["plan.width", "plan.height"], addend: 1 },
          }),
          constructorOnly: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
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
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    let runs = 0;
    let observedInput: unknown;
    const strategy = createStrategy(contract, contract.strategies.single, {
      run: (input) => {
        runs += 1;
        observedInput = input;
        return input.grid.length;
      },
    });
    const op = createOp(contract, { strategies: [strategy] });
    const input = {
      width: 3,
      height: 2,
      plan: { width: 2, height: 2 },
      grid: new Uint8Array(6),
      latitudeByRow: new Float32Array(2),
      offsets: new Int32Array(5),
      constructorOnly: new Int16Array(1),
      rows: [{ mask: new Uint8Array(4) }, { mask: new Uint8Array(4) }],
    };

    expect(strategy).not.toHaveProperty("run");
    expect(op.strategies.single.config).toBe(contract.strategies.single.config);
    expect(op.run(input, op.defaultConfig)).toBe(6);
    expect(runs).toBe(1);
    expect(observedInput).toBe(input);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(input.plan)).toBe(false);
    expect(Object.isFrozen(input.rows)).toBe(false);
  });

  it("admits the complete TypeBox input shape once before strategy execution", () => {
    let strategyRuns = 0;
    const contract = defineOp({
      kind: "compute",
      id: "test/structural-operation-input",
      input: Type.Object(
        {
          samples: Type.Array(Type.Integer({ minimum: 1 }), { minItems: 1 }),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      strategies: [
        defineStrategy({
          id: "measured",
          config: Type.Object({}, { additionalProperties: false }),
        }),
      ],
    });
    const operation = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.measured, {
          run: (input) => {
            strategyRuns += 1;
            return input.samples.length;
          },
        }),
      ],
    });

    expect(operation.run({ samples: [1] }, operation.defaultConfig)).toBe(1);
    expect(strategyRuns).toBe(1);
    expect(() => operation.run({ samples: [] }, operation.defaultConfig)).toThrow(
      OperationInputAdmissionError
    );
    expect(() =>
      operation.run({ samples: [1], shadow: true } as never, operation.defaultConfig)
    ).toThrow(OperationInputAdmissionError);
    expect(strategyRuns).toBe(1);

    try {
      operation.run({ samples: [] }, operation.defaultConfig);
    } catch (error) {
      expect(error).toBeInstanceOf(OperationInputAdmissionError);
      expect(error).toMatchObject({
        issues: [
          expect.objectContaining({ code: "schema", keyword: "minItems", path: "/samples" }),
        ],
      });
    }
  });

  it("owns input admission independently of authored and composable public schemas", () => {
    const authoredInput = Type.Object(
      { value: Type.Integer({ minimum: 1 }) },
      { additionalProperties: false }
    );
    const contract = defineOp({
      kind: "compute",
      id: "test/private-operation-input-authority",
      input: authoredInput,
      output: Type.Integer(),
      strategies: [
        defineStrategy({
          id: "identity",
          config: Type.Object({}, { additionalProperties: false }),
        }),
      ],
    });

    expect(contract.input).not.toBe(authoredInput);
    (authoredInput.properties.value as unknown as Record<string, unknown>).minimum = 0;
    (authoredInput as unknown as Record<string, unknown>).additionalProperties = true;
    (contract.input.properties.value as unknown as Record<string, unknown>).minimum = 0;
    (contract.input as unknown as Record<string, unknown>).additionalProperties = true;
    const operation = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.identity, {
          run: (input) => input.value,
        }),
      ],
    });

    expect(Object.isFrozen(authoredInput)).toBe(false);
    expect(Object.isFrozen(contract.input)).toBe(false);
    expect(operation.run({ value: 1 }, operation.defaultConfig)).toBe(1);
    expect(() => operation.run({ value: 0 }, operation.defaultConfig)).toThrow(
      OperationInputAdmissionError
    );
    expect(() =>
      operation.run({ value: 1, shadow: true } as never, operation.defaultConfig)
    ).toThrow(OperationInputAdmissionError);
  });

  it("uses grid cardinality when cardinality is explicitly undefined", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/explicit-undefined-cardinality",
      input: Type.Object(
        {
          width: Type.Integer({ minimum: 1 }),
          height: Type.Integer({ minimum: 1 }),
          grid: TypedArraySchemas.u8({ cardinality: undefined }),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, { run: (input) => input.grid.length }),
      ],
    });

    expect(op.run({ width: 2, height: 2, grid: new Uint8Array(4) }, op.defaultConfig)).toBe(4);
    expect(() =>
      op.run({ width: 2, height: 2, grid: new Uint8Array(1) }, op.defaultConfig)
    ).toThrow(
      expect.objectContaining({ issues: [expect.objectContaining({ expectedLength: 4 })] })
    );
  });

  it("refuses context-relative map-grid cardinality at operation construction", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/contextual-cardinality-operation-input",
      input: Type.Object(
        {
          grid: TypedArraySchemas.u8({ cardinality: "map-grid" }),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });

    expect(() =>
      createOp(contract, {
        strategies: [
          createStrategy(contract, contract.strategies.single, {
            run: (input) => input.grid.length,
          }),
        ],
      })
    ).toThrow(
      'Operation typed-array cardinality "map-grid" requires an admitted validation context'
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
          offsets: TypedArraySchemas.i32({
            cardinality: { factors: ["plan.width", "plan.height"], addend: 1 },
          }),
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
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    let runs = 0;
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, {
          run: () => {
            runs += 1;
            return 0;
          },
        }),
      ],
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
          offsets: new Int32Array(4),
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
        addend: 0,
        expectedLength: 2,
        observedLength: 3,
      },
      {
        code: "typed-array-cardinality",
        path: "$.offsets",
        cardinalityPaths: ["plan.width", "plan.height"],
        addend: 1,
        expectedLength: 5,
        observedLength: 4,
      },
      {
        code: "typed-array-cardinality",
        path: "$.rows[0].mask",
        cardinalityPaths: ["plan.width", "plan.height"],
        addend: 0,
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
          value: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    let runs = 0;
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, {
          run: () => {
            runs += 1;
            return 0;
          },
        }),
      ],
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
                requiredValue: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
              },
              { additionalProperties: false }
            )
          ),
          required: Type.Object(
            {
              rows: Type.Array(
                Type.Object(
                  {
                    value: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
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
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    let runs = 0;
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, {
          run: () => {
            runs += 1;
            return 0;
          },
        }),
      ],
    });

    expect(op.run({ required: { rows: [] } }, op.defaultConfig)).toBe(0);
    expect(() =>
      op.run({ optional: {} as never, required: { rows: [] } }, op.defaultConfig)
    ).toThrow(
      expect.objectContaining({
        issues: [
          expect.objectContaining({ code: "schema", keyword: "required", path: "/optional" }),
        ],
      })
    );
    expect(() => op.run({ required: {} as never }, op.defaultConfig)).toThrow(
      expect.objectContaining({
        issues: [
          expect.objectContaining({ code: "schema", keyword: "required", path: "/required" }),
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
              TypedArraySchemas.f32({ cardinality: "constructor-only" }),
              TypedArraySchemas.i16({ cardinality: "constructor-only" }),
              Type.Undefined(),
            ])
          ),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, {
          run: (input) => input.value?.length ?? 0,
        }),
      ],
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
          value: Type.Union([
            TypedArraySchemas.u8({ cardinality: "constructor-only" }),
            Type.Undefined(),
          ]),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });

    expect(() =>
      createOp(contract, {
        strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
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
          value: Type.Optional(TypedArraySchemas.u8({ cardinality: "constructor-only" })),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, {
          run: (input) => input.value?.length ?? 0,
        }),
      ],
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
      ["tuple", Type.Tuple([TypedArraySchemas.u8({ cardinality: "constructor-only" })])],
      [
        "record",
        Type.Record(Type.String(), TypedArraySchemas.u8({ cardinality: "constructor-only" })),
      ],
      [
        "cyclic",
        Type.Cyclic(
          {
            Node: Type.Object({
              value: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
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
        strategies: [
          defineStrategy({
            id: "single",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        ],
      });

      expect(() =>
        createOp(contract, {
          strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
        })
      ).toThrow('Operation typed-array metadata at "$" uses an unsupported schema container');
    }
  });

  it("fails closed for direct and nested typed-array references", () => {
    const referenced = TypedArraySchemas.u8({
      cardinality: "constructor-only",
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
        strategies: [
          defineStrategy({
            id: "single",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        ],
      });

      expect(() =>
        createOp(contract, {
          strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
        })
      ).toThrow(`Operation typed-array metadata at "${path}" uses an unsupported schema container`);
    }
  });

  it("rejects inherited typed-array constructor metadata at contract construction", () => {
    const runtimeMetadata = Object.assign(Object.create({ ctor: "Uint8Array" }), {
      kind: "typed-array",
      cardinality: "constructor-only",
    });
    const inheritedConstructorSchema = Type.Unsafe<Uint8Array>(
      Type.Any({ "x-runtime": runtimeMetadata })
    );
    const contract = defineOp({
      kind: "compute",
      id: "test/inherited-operation-input-constructor",
      input: Type.Object({ value: inheritedConstructorSchema }, { additionalProperties: false }),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });

    expect(() =>
      createOp(contract, {
        strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
      })
    ).toThrow("Unsupported operation typed-array constructor");
  });

  it("rejects inherited typed-array kind metadata at contract construction", () => {
    const runtimeMetadata = Object.assign(Object.create({ kind: "typed-array" }), {
      ctor: "Uint8Array",
      cardinality: "constructor-only",
    });
    const inheritedKindSchema = Type.Unsafe<Uint8Array>(Type.Any({ "x-runtime": runtimeMetadata }));
    const contract = defineOp({
      kind: "compute",
      id: "test/inherited-operation-input-kind",
      input: Type.Object({ value: inheritedKindSchema }, { additionalProperties: false }),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });

    expect(() =>
      createOp(contract, {
        strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
      })
    ).toThrow("Operation typed-array metadata kind must be an own property");
  });

  it("fails closed for malformed union and intersection containers with typed-array members", () => {
    for (const key of ["anyOf", "allOf"] as const) {
      const valueSchema = Type.Any();
      (valueSchema as unknown as Record<string, unknown>)[key] = [
        TypedArraySchemas.u8({ cardinality: "constructor-only" }),
        0,
      ];
      const contract = defineOp({
        kind: "compute",
        id: `test/malformed-${key}-operation-input`,
        input: Type.Object({ value: valueSchema }, { additionalProperties: false }),
        output: Type.Integer(),
        strategies: [
          defineStrategy({
            id: "single",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        ],
      });

      expect(() =>
        createOp(contract, {
          strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
        })
      ).toThrow('Operation typed-array metadata at "$.value" uses an unsupported schema container');
    }
  });

  it("rejects legacy null typed-array cardinality metadata", () => {
    const legacyConstructorOnlySchema = Type.Unsafe<Uint8Array>(
      Type.Any({
        "x-runtime": {
          kind: "typed-array",
          ctor: "Uint8Array",
          cardinality: null,
        },
      })
    );
    const contract = defineOp({
      kind: "compute",
      id: "test/legacy-null-operation-input-cardinality",
      input: Type.Object({ value: legacyConstructorOnlySchema }, { additionalProperties: false }),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });

    expect(() =>
      createOp(contract, {
        strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
      })
    ).toThrow("Invalid typed-array cardinality metadata for Uint8Array");
  });

  it("rejects malformed product-plus-addend typed-array cardinality metadata", () => {
    for (const [id, cardinality] of [
      ["missing-addend", { factors: ["width"] }],
      ["missing-factors", { addend: 1 }],
      ["empty-factors", { factors: [], addend: 1 }],
      ["negative-addend", { factors: ["width"], addend: -1 }],
      ["fractional-addend", { factors: ["width"], addend: 0.5 }],
      ["unsafe-addend", { factors: ["width"], addend: Number.MAX_SAFE_INTEGER + 1 }],
      ["extra-key", { factors: ["width"], addend: 1, unit: "cells" }],
    ] as const) {
      const malformedSchema = Type.Unsafe<Uint8Array>(
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
        id: `test/${id}-product-plus-addend-operation-input-cardinality`,
        input: Type.Object(
          { width: Type.Integer({ minimum: 1 }), value: malformedSchema },
          { additionalProperties: false }
        ),
        output: Type.Integer(),
        strategies: [
          defineStrategy({
            id: "single",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        ],
      });

      expect(() =>
        createOp(contract, {
          strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
        })
      ).toThrow("Invalid typed-array cardinality metadata for Uint8Array");
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
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });

    expect(() =>
      createOp(contract, {
        strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
      })
    ).toThrow("Invalid typed-array cardinality metadata for Uint8Array");
  });

  it("refuses a strategy descriptor sealed for another contract", () => {
    const firstContract = defineOp({
      kind: "compute",
      id: "test/strategy-descriptor-first",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const secondContract = defineOp({
      kind: "compute",
      id: "test/strategy-descriptor-second",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const secondStrategy = createStrategy(secondContract, secondContract.strategies.single, {
      run: () => 2,
    });

    expect(() =>
      createOp(firstContract, {
        strategies: [secondStrategy] as never,
      })
    ).toThrow(
      "Strategy descriptor test/strategy-descriptor-second#single cannot implement test/strategy-descriptor-first#single"
    );
  });

  it("refuses a strategy descriptor sealed for a different contract with the same id", () => {
    const expectedContract = defineOp({
      kind: "compute",
      id: "test/same-id-strategy-descriptor",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const otherContract = defineOp({
      kind: "compute",
      id: "test/same-id-strategy-descriptor",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const otherStrategy = createStrategy(otherContract, otherContract.strategies.single, {
      run: () => "wrong",
    });

    expect(() =>
      createOp(expectedContract, {
        strategies: [otherStrategy] as never,
      })
    ).toThrow(
      "Strategy descriptor test/same-id-strategy-descriptor#single cannot implement test/same-id-strategy-descriptor#single"
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
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });

    expect(() =>
      createOp(contract, {
        strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
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
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, { run: (input) => input.grid.length }),
      ],
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
            addend: 0,
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
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, { run: (input) => input.grid.length }),
      ],
    });

    expect(op.run({ width: 2, height: 3, grid: new Uint8Array(6) }, op.defaultConfig)).toBe(6);
  });

  it("retains requiredness declared by another input intersection member", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/intersected-operation-input-requiredness",
      input: Type.Intersect([
        Type.Object({
          value: Type.Optional(TypedArraySchemas.u8({ cardinality: "constructor-only" })),
        }),
        Type.Object({ value: Type.Any() }),
      ]),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, {
          run: (input) => input.value?.length ?? 0,
        }),
      ],
    });

    expect(() => op.run({} as never, op.defaultConfig)).toThrow(
      expect.objectContaining({
        issues: [expect.objectContaining({ code: "schema", keyword: "required", path: "/" })],
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
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    let runs = 0;
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, {
          run: () => {
            runs += 1;
            return 0;
          },
        }),
      ],
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
        issues: [expect.objectContaining({ code: "schema", keyword: "type", path: "/rows" })],
      })
    );
    expect(runs).toBe(0);
  });

  it("refuses sparse and caller-overridden array traversal", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/closed-operation-input-array-traversal",
      input: Type.Array(TypedArraySchemas.u8({ cardinality: "constructor-only" })),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.single, {
          run: (input) => input.reduce((total, value) => total + value.length, 0),
        }),
      ],
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
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
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
            addend: 0,
          },
        ],
      })
    );
  });

  it("fails closed when a product-plus-addend cardinality exceeds safe integer length", () => {
    const contract = defineOp({
      kind: "compute",
      id: "test/overflowing-product-plus-addend-operation-cardinality",
      input: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          offsets: TypedArraySchemas.i32({
            cardinality: { factors: ["cellCount"], addend: 1 },
          }),
        },
        { additionalProperties: false }
      ),
      output: Type.Integer(),
      strategies: [
        defineStrategy({ id: "single", config: Type.Object({}, { additionalProperties: false }) }),
      ],
    });
    const op = createOp(contract, {
      strategies: [createStrategy(contract, contract.strategies.single, { run: () => 0 })],
    });

    expect(() =>
      op.run(
        {
          cellCount: Number.MAX_SAFE_INTEGER,
          offsets: new Int32Array(),
        },
        op.defaultConfig
      )
    ).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "typed-array-cardinality-overflow",
            path: "$.offsets",
            cardinalityPaths: ["cellCount"],
            factors: [Number.MAX_SAFE_INTEGER],
            addend: 1,
          },
        ],
      })
    );
  });
});
