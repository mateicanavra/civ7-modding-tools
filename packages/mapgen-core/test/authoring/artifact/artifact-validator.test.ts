import { describe, expect, it } from "bun:test";
import { implementArtifactModules } from "@mapgen/authoring/artifact/runtime.js";
import {
  type ArtifactModule,
  type ArtifactValidationContext,
  defineArtifact,
  defineArtifactCatalog,
  defineArtifactValidator,
  defineStep,
  readValidatedArtifact,
  Type,
} from "@mapgen/authoring/index.js";
import { bindArtifactValidator } from "../../../src/authoring/artifact/authority.js";

function testArtifact() {
  return defineArtifact({
    name: "validatedArtifact",
    id: "artifact:test.validator",
    schema: Type.Object(
      {
        first: Type.Number(),
        second: Type.String(),
      },
      { additionalProperties: false }
    ),
  });
}

describe("artifact validators", () => {
  it("fails closed and contains rejecting asynchronous local validators", async () => {
    const artifact = testArtifact();
    const validate = defineArtifactValidator(artifact, (async () => {
      throw new Error("late local validation failure");
    }) as unknown as () => readonly { message: string }[]);

    expect(() => validate({ first: 1, second: "valid" })).toThrow(
      "Artifact-local validators must return issues synchronously"
    );
    await Promise.resolve();
  });

  it("rejects frozen structural lookalikes that bypass defineArtifact", () => {
    const forged = Object.freeze({
      name: "forgedArtifact",
      id: "artifact:test.validator.forged",
      schema: Type.Object({}, { additionalProperties: false }),
    });

    expect(() => defineArtifactValidator(forged)).toThrow(
      "artifact contract must be created by defineArtifact"
    );
    const canonical = testArtifact();
    expect(() =>
      defineArtifactCatalog({
        forged: {
          Schema: forged.schema,
          artifact: forged,
          validate: defineArtifactValidator(canonical),
        },
      } as never)
    ).toThrow("artifact contract must be created by defineArtifact");
  });

  it("refuses rebinding one validator identity to another artifact contract", () => {
    const first = testArtifact();
    const second = defineArtifact({
      name: "secondValidatedArtifact",
      id: "artifact:test.validator.second",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const validate = defineArtifactValidator(first);

    expect(() => bindArtifactValidator(validate, first)).not.toThrow();
    expect(() => bindArtifactValidator(validate, second)).toThrow(
      "artifact validator authority cannot be rebound"
    );
  });

  it("rejects mutable structural artifact contracts", () => {
    const canonical = testArtifact();
    const artifact = {
      name: "mutableArtifact",
      id: "artifact:test.validator.mutable",
      schema: Type.Object({}, { additionalProperties: false }),
    };
    const module = {
      Schema: artifact.schema,
      artifact,
      validate: defineArtifactValidator(canonical),
    } as unknown as ArtifactModule<typeof canonical>;

    expect(() => defineArtifactValidator(artifact)).toThrow(
      "artifact contract must be a frozen object"
    );
    expect(() => defineArtifactCatalog({ module } as never)).toThrow(
      "artifact contract must be a frozen object"
    );
    expect(() => implementArtifactModules([module])).toThrow(
      "artifact contract must be a frozen object"
    );
    expect(() => readValidatedArtifact({} as never, module)).toThrow(
      "artifact contract must be a frozen object"
    );
  });

  it("admits schema-valid values and reports structural issues in stable order", () => {
    const validate = defineArtifactValidator(testArtifact());
    const admitted = validate({ first: 1, second: "two" });
    const rejected = validate({ extra: true, first: "one", second: 2 });

    expect(admitted).toEqual([]);
    expect(rejected).toEqual([
      { message: "/ must not have additional properties" },
      { message: "/first must be number" },
      { message: "/second must be string" },
    ]);
    expect(Object.isFrozen(admitted)).toBe(true);
    expect(Object.isFrozen(rejected)).toBe(true);
    expect(rejected.every(Object.isFrozen)).toBe(true);
  });

  it("skips artifact-local validation when structural admission fails", () => {
    const artifact = testArtifact();
    const context = { dimensions: { width: 2, height: 3 } } as const;
    const calls: Array<readonly [unknown, ArtifactValidationContext | undefined]> = [];
    const validate = defineArtifactValidator(artifact, (value, receivedContext) => {
      calls.push([value, receivedContext]);
      return [];
    });

    validate({ first: "invalid", second: "two" }, context);
    expect(calls).toEqual([]);

    const valid = { first: 1, second: "two" };
    validate(valid, context);
    expect(calls).toEqual([[valid, context]]);
  });

  it("copies and freezes local issues without changing their order", () => {
    const source: Array<{ message: string }> = [
      { message: "first local issue" },
      { message: "second local issue" },
    ];
    const firstSourceIssue = source[0]!;
    const validate = defineArtifactValidator(testArtifact(), () => source);

    const result = validate({ first: 1, second: "two" });
    firstSourceIssue.message = "mutated issue";
    source.reverse();

    expect(result).toEqual([{ message: "first local issue" }, { message: "second local issue" }]);
    expect(result).not.toBe(source);
    expect(result[0]).not.toBe(firstSourceIssue);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.every(Object.isFrozen)).toBe(true);
  });

  it("makes the canonical artifact schema graph immutable at definition", () => {
    const artifact = testArtifact();
    const validate = defineArtifactValidator(artifact);

    expect(Reflect.set(artifact.schema.properties, "first", Type.String())).toBe(false);
    expect(Object.isFrozen(artifact.schema)).toBe(true);
    expect(Object.isFrozen(artifact.schema.properties)).toBe(true);
    expect(Object.isFrozen(artifact.schema.properties.first)).toBe(true);
    expect(validate({ first: 1, second: "two" })).toEqual([]);
    expect(validate({ first: "one", second: "two" })).toEqual([
      { message: "/first must be number" },
    ]);
  });

  it("rejects invalid artifact identity before mutating the caller's schema", () => {
    const invalidNameSchema = Type.Object({ value: Type.Number() });
    const invalidIdSchema = Type.Object({ value: Type.Number() });

    expect(() =>
      defineArtifact({
        name: "invalid-name",
        id: "artifact:test.invalid-name",
        schema: invalidNameSchema,
      })
    ).toThrow("must be camelCase");
    expect(Object.isFrozen(invalidNameSchema)).toBe(false);
    expect(() =>
      defineArtifact({
        name: "invalidId",
        id: "test.invalid-id",
        schema: invalidIdSchema,
      })
    ).toThrow('must start with "artifact:"');
    expect(Object.isFrozen(invalidIdSchema)).toBe(false);
  });

  it("refuses a validator paired with any artifact except its exact contract", () => {
    const first = testArtifact();
    const second = defineArtifact({
      name: "secondValidatedArtifact",
      id: "artifact:test.validator.second",
      schema: first.schema,
    });
    const mismatched = {
      Schema: first.schema,
      artifact: first,
      validate: defineArtifactValidator(second),
    } as unknown as ArtifactModule<typeof first>;

    expect(() => defineArtifactCatalog({ mismatched } as never)).toThrow(
      "must be bound to exact contract"
    );
    expect(() => implementArtifactModules([mismatched])).toThrow("must be bound to exact contract");
    expect(() => readValidatedArtifact({} as never, mismatched)).toThrow(
      "must be bound to exact contract"
    );
    expect(() =>
      defineStep({
        id: "mismatched-artifact-provider",
        requires: [],
        provides: [],
        schema: Type.Object({}, { additionalProperties: false }),
        artifacts: { provides: [mismatched] },
      })
    ).toThrow("must be bound to exact contract");
  });

  it("keeps validator bindings outside reflectable function metadata", () => {
    const artifact = testArtifact();
    const validate = defineArtifactValidator(artifact);

    expect(Object.getOwnPropertySymbols(validate)).toEqual([]);
  });

  it("snapshots transformed ESM authority once and projects source metadata away", () => {
    const artifact = testArtifact();
    const validate = defineArtifactValidator(artifact);
    let reads = 0;
    let unrelatedReads = 0;
    const accessorModule = Object.defineProperties(
      {},
      {
        Schema: {
          enumerable: true,
          get: () => {
            unrelatedReads += 1;
            return Type.Object({}, { additionalProperties: false });
          },
        },
        artifact: {
          configurable: true,
          enumerable: true,
          get: () => {
            reads += 1;
            return artifact;
          },
        },
        validate: {
          configurable: true,
          enumerable: true,
          get: () => {
            reads += 1;
            return validate;
          },
        },
        __esModule: {
          configurable: true,
          enumerable: false,
          get: () => {
            unrelatedReads += 1;
            return true;
          },
        },
      }
    ) as ArtifactModule<typeof artifact>;

    const catalog = defineArtifactCatalog({ accessorModule } as never);
    const snapshot = Reflect.get(catalog.modules, "accessorModule") as ArtifactModule<
      typeof artifact
    >;
    expect(snapshot.artifact).toBe(artifact);
    expect(snapshot.validate).toBe(validate);
    expect(Reflect.ownKeys(snapshot)).toEqual(["artifact", "validate"]);
    expect(reads).toBe(2);
    expect(unrelatedReads).toBe(0);
    expect(() => implementArtifactModules([accessorModule])).toThrow(
      "must own an artifact data property"
    );
    expect(() => readValidatedArtifact({} as never, accessorModule)).toThrow(
      "must own an artifact data property"
    );
    expect(reads).toBe(2);
  });

  it("rejects plain validators at the runtime catalog boundary", () => {
    const artifact = testArtifact();
    const source = {
      Schema: artifact.schema,
      artifact,
      validate: (_value: unknown) => [],
    };

    expect(() => defineArtifactCatalog({ source } as never)).toThrow(
      "must be bound to exact contract"
    );
  });

  it("rejects array-like module collections before reading their entries", () => {
    const artifact = testArtifact();
    const module = {
      artifact,
      validate: defineArtifactValidator(artifact),
    };
    const arrayLike = { 0: module, length: 1 };

    expect(() => implementArtifactModules(arrayLike as never)).toThrow(
      "artifact modules must be an array"
    );
  });
});
