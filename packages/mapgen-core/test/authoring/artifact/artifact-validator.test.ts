import { describe, expect, it } from "bun:test";

import {
  type ArtifactModule,
  type ArtifactValidationContext,
  defineArtifact,
  defineArtifactCatalog,
  defineArtifactValidator,
  defineStep,
  implementArtifactModules,
  readValidatedArtifact,
  Type,
} from "@mapgen/authoring/index.js";

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
  it("rejects frozen structural lookalikes that bypass defineArtifact", () => {
    const forged = Object.freeze({
      name: "forgedArtifact",
      id: "artifact:test.validator.forged",
      schema: Type.Object({}, { additionalProperties: false }),
    });

    expect(() => defineArtifactValidator(forged)).toThrow(
      "artifact contract must be created by defineArtifact"
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

  it("snapshots exact ESM-style source exports once but keeps runtime modules data-only", () => {
    const artifact = testArtifact();
    const validate = defineArtifactValidator(artifact);
    let reads = 0;
    const accessorModule = Object.defineProperties(
      {},
      {
        Schema: {
          enumerable: true,
          get: () => {
            reads += 1;
            return artifact.schema;
          },
        },
        artifact: {
          enumerable: true,
          get: () => {
            reads += 1;
            return artifact;
          },
        },
        validate: {
          enumerable: true,
          get: () => {
            reads += 1;
            return validate;
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
    expect(reads).toBe(3);
    expect(() => implementArtifactModules([accessorModule])).toThrow(
      "must own an artifact data property"
    );
    expect(() => readValidatedArtifact({} as never, accessorModule)).toThrow(
      "must own an artifact data property"
    );
    expect(reads).toBe(3);
  });

  it("requires the exported Schema to be the artifact contract's exact schema", () => {
    const artifact = testArtifact();
    const source = {
      Schema: Type.Object({}, { additionalProperties: false }),
      artifact,
      validate: defineArtifactValidator(artifact),
    };

    expect(() => defineArtifactCatalog({ source } as never)).toThrow(
      "Schema must be the exact schema held by its artifact contract"
    );
  });

  it("rejects runtime exports outside the artifact source-module surface", () => {
    const artifact = testArtifact();
    const source = {
      Schema: artifact.schema,
      artifact,
      validate: defineArtifactValidator(artifact),
      runMutation: () => undefined,
    };

    expect(() => defineArtifactCatalog({ source } as never)).toThrow(
      'exposes unsupported runtime export "runMutation"'
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
