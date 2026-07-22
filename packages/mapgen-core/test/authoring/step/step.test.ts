import { describe, expect, it } from "bun:test";
import { createStep, defineOp, defineStep, Type } from "@mapgen/authoring/index.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { Value } from "typebox/value";

describe("step authoring", () => {
  const makeContract = (id: string) =>
    defineStep({
      id,
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
    });

  it("createStep rejects structural contracts before retaining an implementation", () => {
    let implementationReads = 0;
    const structuralContract = {
      id: "alpha",
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
    } as unknown as Parameters<typeof createStep>[0];
    const implementation = {
      get run() {
        implementationReads += 1;
        return () => undefined;
      },
    };

    expect(() => createStep(structuralContract, implementation)).toThrow(
      "step contract must be created by defineStep"
    );
    expect(implementationReads).toBe(0);
  });

  it("createStep accepts explicit empty schema", () => {
    expect(() => createStep(makeContract("alpha"), { run: () => {} })).not.toThrow();
  });

  it("createStep keeps the supplied contract authoritative over implementation object extras", () => {
    const alpha = makeContract("alpha");
    const implementation = { contract: makeContract("beta"), debugAlias: true, run: () => {} };
    const step = createStep(alpha, implementation);

    expect(step.contract).toBe(alpha);
    expect(Object.hasOwn(step, "debugAlias")).toBe(false);
  });

  it("captures implementation functions once from own data properties without invoking accessors", () => {
    let accessorReads = 0;
    const accessorImplementation = {
      get run() {
        accessorReads += 1;
        return () => undefined;
      },
    };

    expect(() => createStep(makeContract("accessor-run"), accessorImplementation)).toThrow(
      "implementation run must be an own enumerable data property"
    );
    expect(accessorReads).toBe(0);

    const run = () => "captured";
    const normalize = (config: object) => config;
    const metrics = () => ({ count: 1 });
    const viz = () => [];
    const descriptorReads = new Map<PropertyKey, number>();
    const values = { run, normalize, metrics, viz } as const;
    const implementation = new Proxy(
      {},
      {
        getOwnPropertyDescriptor: (_target, key) => {
          if (!(key in values)) return undefined;
          descriptorReads.set(key, (descriptorReads.get(key) ?? 0) + 1);
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value: descriptorReads.get(key) === 1 ? values[key as keyof typeof values] : undefined,
          };
        },
      }
    ) as typeof values;

    const step = createStep(makeContract("captured-implementation"), implementation);
    expect(step.run).toBe(run);
    expect(step.normalize as unknown).toBe(normalize);
    expect(step.metrics).toBe(metrics);
    expect(step.viz).toBe(viz);
    expect(descriptorReads).toEqual(
      new Map<PropertyKey, number>([
        ["run", 1],
        ["normalize", 1],
        ["metrics", 1],
        ["viz", 1],
      ])
    );
  });

  it("rejects spread stage-identity aliases at both step authoring boundaries", () => {
    const contractInput = {
      id: "aliased-contract",
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
    };

    expect(() => defineStep({ ...contractInput, ...{ phase: "foundation" } } as never)).toThrow(
      "recipe composition owns stage identity"
    );
    expect(() =>
      createStep(makeContract("aliased-implementation"), {
        run: () => {},
        ...{ stageId: "foundation" },
      } as never)
    ).toThrow("recipe composition owns stage identity");
  });

  it("materializes an explicit step default without mutating the operation contract", () => {
    const operation = defineOp({
      kind: "compute",
      id: "test/step-default-authority",
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
    const step = defineStep({
      id: "fast-step",
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
      ops: { calculation: { contract: operation, defaultStrategy: "fast" } },
    });

    expect(step.ops?.calculation.defaultStrategy).toBe("fast");
    expect(step.ops?.calculation.defaultConfig).toEqual({
      strategy: "fast",
      config: { turbo: true },
    });
    expect(Value.Create(step.schema)).toEqual({
      calculation: { strategy: "fast", config: { turbo: true } },
    });
    expect(operation.defaultStrategy).toBe("balanced");
    expect(operation.defaultConfig).toEqual({
      strategy: "balanced",
      config: { plateauCount: 3 },
    });

    expect(() =>
      defineStep({
        id: "invalid-empty-default-step",
        requires: [],
        provides: [],
        schema: EmptyStepConfigSchema,
        ops: {
          calculation: {
            contract: operation,
            defaultStrategy: "" as "fast",
          },
        },
      })
    ).toThrow("requires an explicit default strategy");

    expect(() =>
      defineStep({
        id: "missing-default-override-step",
        requires: [],
        provides: [],
        schema: EmptyStepConfigSchema,
        ops: {
          calculation: { contract: operation } as never,
        },
      })
    ).toThrow("requires an explicit default strategy");
  });

  it("freezes detached schema authority without freezing reusable authoring schemas", () => {
    const decode = Object.assign((value: string) => `decoded:${value}`, {
      marker: { mutable: true },
    });
    const encode = (value: string) => value.replace(/^decoded:/, "");
    const strategySchema = Type.Object(
      { count: Type.Integer({ default: 2 }) },
      { additionalProperties: false }
    );
    const operation = defineOp({
      kind: "compute",
      id: "test/detached-step-schema",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: { balanced: strategySchema },
    });
    const stepSchema = Type.Object(
      {
        enabled: Type.Boolean({ default: true }),
        label: Type.Codec(Type.String()).Decode(decode).Encode(encode),
      },
      { additionalProperties: false }
    );
    const contract = defineStep({
      id: "detached-schema",
      requires: [],
      provides: [],
      schema: stepSchema,
      ops: { calculation: operation },
    });

    expect(contract.schema).not.toBe(stepSchema);
    expect(contract.ops?.calculation.strategies.balanced).not.toBe(strategySchema);
    expect(Object.isFrozen(contract.schema)).toBe(true);
    expect(Object.isFrozen(contract.ops?.calculation.strategies.balanced)).toBe(true);
    expect(() => Type.With(stepSchema, { description: "Reusable step schema." })).not.toThrow();
    expect(() =>
      Type.With(strategySchema, { description: "Reusable operation strategy schema." })
    ).not.toThrow();
    expect(Object.isFrozen(decode)).toBe(false);
    expect(Object.isFrozen(decode.marker)).toBe(false);
    expect(Value.Decode(contract.schema.properties.label, "value")).toBe("decoded:value");
    expect(Value.Encode(contract.schema.properties.label, "decoded:value")).toBe("value");

    expect(Reflect.set(stepSchema.properties.enabled, "description", "Caller-owned mutation")).toBe(
      true
    );
    expect(Reflect.set(strategySchema.properties.count, "minimum", 1)).toBe(true);
    decode.marker.mutable = false;
    expect(Reflect.get(contract.schema.properties.enabled, "description")).toBeUndefined();
    expect(
      Reflect.get(contract.ops?.calculation.strategies.balanced.properties.count ?? {}, "minimum")
    ).toBeUndefined();
    expect(decode.marker.mutable).toBe(false);
  });

  it("preserves root annotations, aliases, and defaults when composing operation config", () => {
    const operation = defineOp({
      kind: "compute",
      id: "test/root-codec-options",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: {
        balanced: Type.Object(
          { count: Type.Integer({ default: 2 }) },
          { additionalProperties: false }
        ),
      },
    });
    const shared = { owner: "root-and-property" };
    const symbolAnnotation = Symbol("step annotation");
    const enabled = Type.Boolean({ default: true });
    Reflect.set(enabled, symbolAnnotation, shared);
    const schema = Type.Object(
      { enabled },
      {
        additionalProperties: false,
        $id: "AnnotatedStep",
        description: "Step configuration whose root annotations survive operation composition.",
        default: { enabled: true },
      }
    );
    Reflect.set(schema, symbolAnnotation, shared);
    const contract = defineStep({
      id: "root-annotation-options",
      requires: [],
      provides: [],
      schema,
      ops: { calculation: operation },
    });
    expect(Reflect.get(contract.schema, "$id")).toBe("AnnotatedStep");
    expect(Reflect.get(contract.schema, "description")).toBe(
      "Step configuration whose root annotations survive operation composition."
    );
    expect(Reflect.get(contract.schema, symbolAnnotation)).toBe(
      Reflect.get(contract.schema.properties.enabled, symbolAnnotation)
    );
    expect(Reflect.get(contract.schema, "default")).toEqual({
      enabled: true,
      calculation: { strategy: "balanced", config: { count: 2 } },
    });
  });

  it("keeps root codecs typed for standalone schemas and refuses ambiguous op composition", () => {
    const rootCodec = Type.Codec(
      Type.Object({ enabled: Type.Boolean() }, { additionalProperties: false })
    )
      .Decode((value) => ({ ...value, decoded: true as const }))
      .Encode(({ decoded: _decoded, ...value }) => value);
    const standalone = defineStep({
      id: "root-codec-standalone",
      requires: [],
      provides: [],
      schema: rootCodec,
    });
    const decoded = Value.Decode(standalone.schema, { enabled: true });

    expect(decoded.decoded).toBe(true);
    expect(Value.Encode(standalone.schema, decoded)).toEqual({ enabled: true });

    const explicitEmptyOps = defineStep({
      id: "root-codec-explicit-empty-ops",
      requires: [],
      provides: [],
      schema: rootCodec,
      ops: {},
    });
    const explicitlyDecoded = Value.Decode(explicitEmptyOps.schema, { enabled: false });

    expect(explicitlyDecoded.decoded).toBe(true);
    expect(Value.Encode(explicitEmptyOps.schema, explicitlyDecoded)).toEqual({ enabled: false });

    const operation = defineOp({
      kind: "compute",
      id: "test/root-codec-op-refusal",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: {
        balanced: Type.Object({}, { additionalProperties: false }),
      },
    });
    expect(() =>
      defineStep({
        id: "root-codec-with-op",
        requires: [],
        provides: [],
        schema: rootCodec,
        ops: { calculation: operation },
      })
    ).toThrow('step "root-codec-with-op" cannot compose operation config into a root codec schema');
  });

  it("refuses root validation options whose meaning changes when op keys are injected", () => {
    const operation = defineOp({
      kind: "compute",
      id: "test/root-option-refusal",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: {
        balanced: Type.Object({}, { additionalProperties: false }),
      },
    });
    const schema = Type.Object(
      { enabled: Type.Boolean() },
      { additionalProperties: false, maxProperties: 1 }
    );

    expect(() =>
      defineStep({
        id: "root-validation-option-with-op",
        requires: [],
        provides: [],
        schema,
        ops: { calculation: operation },
      })
    ).toThrow(
      'step "root-validation-option-with-op" schema option "maxProperties" cannot be composed with operation config'
    );
  });

  it("refuses mutable or accessor-backed schema metadata before cloning caller state", () => {
    class MutableAnnotation {
      value = 1;
    }

    const annotation = new MutableAnnotation();
    const annotatedSchema = Type.Object({}, { additionalProperties: false });
    Reflect.set(annotatedSchema, "annotation", annotation);
    expect(() =>
      defineStep({
        id: "class-annotated-schema",
        requires: [],
        provides: [],
        schema: annotatedSchema,
      })
    ).toThrow("must contain only plain schema data");
    expect(Object.isFrozen(annotation)).toBe(false);

    let accessorReads = 0;
    const metadata = {};
    Object.defineProperty(metadata, "value", {
      enumerable: true,
      get: () => {
        accessorReads += 1;
        return 1;
      },
    });
    const accessorSchema = Type.Object({}, { additionalProperties: false });
    Reflect.set(accessorSchema, "metadata", metadata);
    expect(() =>
      defineStep({
        id: "accessor-annotated-schema",
        requires: [],
        provides: [],
        schema: accessorSchema,
      })
    ).toThrow("must contain data properties only");
    expect(accessorReads).toBe(0);

    for (const [id, extension] of [
      ["map-annotated-schema", new Map([["key", "value"]])],
      ["set-annotated-schema", new Set(["value"])],
      ["typed-array-annotated-schema", new Uint8Array([1])],
    ] as const) {
      const schema = Type.Object({}, { additionalProperties: false });
      Reflect.set(schema, "extension", extension);
      expect(() => defineStep({ id, requires: [], provides: [], schema })).toThrow(
        "must contain only plain schema data"
      );
      expect(Object.isFrozen(extension)).toBe(false);
    }

    const cyclicMetadata: { self?: unknown } = {};
    cyclicMetadata.self = cyclicMetadata;
    const cyclicSchema = Type.Object({}, { additionalProperties: false });
    Reflect.set(cyclicSchema, "metadata", cyclicMetadata);
    expect(() =>
      defineStep({
        id: "cyclic-annotated-schema",
        requires: [],
        provides: [],
        schema: cyclicSchema,
      })
    ).toThrow("must not contain cyclic schema metadata");
    expect(Object.isFrozen(cyclicMetadata)).toBe(false);
  });

  it("snapshots descriptor values once without invoking hostile proxy property reads", () => {
    class CallerOwnedState {
      mutable = true;
    }

    const callerOwned = new CallerOwnedState();
    const shared = { value: "captured" };
    let propertyReads = 0;
    const metadata = new Proxy(
      { first: shared, second: shared },
      {
        get: () => {
          propertyReads += 1;
          return callerOwned;
        },
      }
    );
    const schema = Type.Object({}, { additionalProperties: false });
    Reflect.set(schema, "metadata", metadata);

    const contract = defineStep({
      id: "descriptor-snapshot",
      requires: [],
      provides: [],
      schema,
    });
    const captured = Reflect.get(contract.schema, "metadata") as {
      first: { value: string };
      second: { value: string };
    };

    expect(propertyReads).toBe(0);
    expect(Object.isFrozen(callerOwned)).toBe(false);
    expect(captured.first).toBe(captured.second);
    expect(captured.first).not.toBe(shared);
    expect(captured.first.value).toBe("captured");
    expect(Object.isFrozen(captured.first)).toBe(true);
  });

  it("defineStep rejects non-kebab step ids", () => {
    expect(() =>
      defineStep({
        id: "BadId",
        requires: [],
        provides: [],
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/BadId/);
  });

  it("snapshots step authority once from own data properties without evaluating accessors", () => {
    let accessorReads = 0;
    const accessorDefinition = {
      id: "accessor-step",
      get requires() {
        accessorReads += 1;
        return [];
      },
      provides: [],
      schema: EmptyStepConfigSchema,
    };

    expect(() => defineStep(accessorDefinition)).toThrow(
      "step contract requires must be an own enumerable data property"
    );
    expect(accessorReads).toBe(0);

    const requires = ["effect:test.initial"] as string[];
    const provides = ["effect:test.complete"] as string[];
    const descriptorReads = new Map<PropertyKey, number>();
    const values = {
      id: "single-read-step",
      requires,
      provides,
      artifacts: undefined,
      schema: EmptyStepConfigSchema,
      ops: undefined,
    } as const;
    const definition = new Proxy(
      {},
      {
        getOwnPropertyDescriptor: (_target, key) => {
          if (!(key in values)) return undefined;
          descriptorReads.set(key, (descriptorReads.get(key) ?? 0) + 1);
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value:
              descriptorReads.get(key) === 1
                ? values[key as keyof typeof values]
                : key === "requires" || key === "provides"
                  ? ["effect:test.changed"]
                  : "changed-between-reads",
          };
        },
      }
    ) as typeof values;

    const contract = defineStep(definition);
    requires[0] = "effect:test.mutated";
    provides.length = 0;

    expect(contract.id).toBe("single-read-step");
    expect(contract.requires).toEqual(["effect:test.initial"]);
    expect(contract.provides).toEqual(["effect:test.complete"]);
    expect(descriptorReads).toEqual(
      new Map<PropertyKey, number>([
        ["artifacts", 1],
        ["ops", 1],
        ["id", 1],
        ["requires", 1],
        ["provides", 1],
        ["schema", 1],
      ])
    );
  });

  it("refuses sparse, symbol-extended, and accessor-backed dependency arrays", () => {
    const sparse = new Array<string>(1);
    const symbolExtended: string[] = [];
    Object.defineProperty(symbolExtended, Symbol("hidden"), { value: "effect:test.hidden" });
    let entryReads = 0;
    const accessorBacked = ["effect:test.initial"];
    Object.defineProperty(accessorBacked, "0", {
      configurable: true,
      enumerable: true,
      get: () => {
        entryReads += 1;
        return "effect:test.accessor";
      },
    });

    const definition = (requires: readonly string[]) => ({
      id: "hostile-dependencies",
      requires,
      provides: [],
      schema: EmptyStepConfigSchema,
    });

    expect(() => defineStep(definition(sparse))).toThrow("dense array without extra keys");
    expect(() => defineStep(definition(symbolExtended))).toThrow("dense array without extra keys");
    expect(() => defineStep(definition(accessorBacked))).toThrow(
      "must be an enumerable data property"
    );
    expect(entryReads).toBe(0);
  });
});
