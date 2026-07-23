import { describe, expect, it } from "bun:test";
import { implementArtifacts } from "@mapgen/authoring/artifact/runtime.js";
import {
  type ArtifactValidationContext,
  defineArtifact,
  defineArtifactCatalog,
  defineStep,
  Type,
} from "@mapgen/authoring/index.js";

function defineTestArtifact() {
  return defineArtifact({
    name: "validatedArtifact",
    id: "artifact:test.admission",
    schema: Type.Object(
      {
        first: Type.Number(),
        second: Type.String(),
      },
      { additionalProperties: false }
    ),
  });
}

describe("artifact admission", () => {
  it("creates one complete authority with a portable frozen shape", () => {
    const artifact = defineTestArtifact();

    expect(Reflect.ownKeys(artifact)).toEqual(["name", "id", "schema", "validate"]);
    expect(Object.isFrozen(artifact)).toBe(true);
    expect(Object.isFrozen(artifact.validate)).toBe(true);
    expect(Object.isFrozen(artifact.schema)).toBe(true);
    expect(Object.isFrozen(artifact.schema.properties)).toBe(true);
    expect(Object.getOwnPropertySymbols(artifact.validate)).toEqual([]);

    const portable = Object.freeze({
      name: artifact.name,
      id: artifact.id,
      schema: artifact.schema,
      validate: artifact.validate,
    });
    expect(defineArtifactCatalog({ portable })).toEqual({ portable });
    expect(() => implementArtifacts([portable])).not.toThrow();

    const mutable = {
      name: artifact.name,
      id: artifact.id,
      schema: artifact.schema,
      validate: artifact.validate,
    };
    expect(() =>
      defineStep({
        id: "mutable-artifact-provider",
        requires: [],
        provides: [],
        schema: Type.Object({}, { additionalProperties: false }),
        artifacts: { provides: [mutable] },
      } as never)
    ).toThrow("must be a canonical artifact");
  });

  it("runs structural schema admission before the optional refinement", () => {
    const context = { dimensions: { width: 2, height: 3 } } as const;
    const calls: Array<readonly [unknown, ArtifactValidationContext | undefined]> = [];
    const artifact = defineArtifact({
      name: "refinedArtifact",
      id: "artifact:test.admission.refined",
      schema: Type.Object(
        { first: Type.Number(), second: Type.String() },
        { additionalProperties: false }
      ),
      refine: (value, receivedContext) => {
        calls.push([value, receivedContext]);
        return [{ message: "semantic failure" }];
      },
    });

    const structural = artifact.validate({ first: "invalid", second: 2 }, context);
    expect(structural).toEqual([
      { message: "/first must be number" },
      { message: "/second must be string" },
    ]);
    expect(calls).toEqual([]);

    const valid = { first: 1, second: "two" };
    expect(artifact.validate(valid, context)).toEqual([{ message: "semantic failure" }]);
    expect(calls).toEqual([[valid, context]]);
  });

  it("contains asynchronous refinements and rejects them at the synchronous boundary", async () => {
    const artifact = defineArtifact({
      name: "asyncRefinement",
      id: "artifact:test.admission.async",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
      refine: (async () => {
        throw new Error("late refinement failure");
      }) as unknown as () => readonly { message: string }[],
    });

    expect(() => artifact.validate({ value: 1 })).toThrow(
      "Artifact refinements must return issues synchronously"
    );
    await Promise.resolve();
  });

  it("copies and freezes structural and refinement issues in stable order", () => {
    const source = [{ message: "first" }, { message: "second" }];
    const firstSourceIssue = source[0]!;
    const artifact = defineArtifact({
      name: "stableIssues",
      id: "artifact:test.admission.stable-issues",
      schema: Type.Object(
        { first: Type.Number(), second: Type.String() },
        { additionalProperties: false }
      ),
      refine: () => source,
    });

    const structural = artifact.validate({ extra: true, first: "one", second: 2 });
    expect(structural).toEqual([
      { message: "/ must not have additional properties" },
      { message: "/first must be number" },
      { message: "/second must be string" },
    ]);
    expect(Object.isFrozen(structural)).toBe(true);
    expect(structural.every(Object.isFrozen)).toBe(true);

    const refined = artifact.validate({ first: 1, second: "two" });
    firstSourceIssue.message = "mutated";
    source.reverse();
    expect(refined).toEqual([{ message: "first" }, { message: "second" }]);
    expect(refined).not.toBe(source);
    expect(refined[0]).not.toBe(firstSourceIssue);
    expect(Object.isFrozen(refined)).toBe(true);
    expect(refined.every(Object.isFrozen)).toBe(true);
  });

  it("rejects hostile artifact definitions before consuming their schema", () => {
    let schemaReads = 0;
    const accessorDefinition = Object.defineProperties(
      {},
      {
        name: { enumerable: true, value: "accessorArtifact" },
        id: { enumerable: true, value: "artifact:test.admission.accessor" },
        schema: {
          enumerable: true,
          get: () => {
            schemaReads += 1;
            return Type.Object({});
          },
        },
      }
    );

    expect(() => defineArtifact(accessorDefinition as never)).toThrow(
      "artifact definition schema must be an own enumerable data property"
    );
    expect(schemaReads).toBe(0);

    const invalidNameSchema = Type.Object({ value: Type.Number() });
    expect(() =>
      defineArtifact({
        name: "invalid-name",
        id: "artifact:test.admission.invalid-name",
        schema: invalidNameSchema,
      })
    ).toThrow("must be camelCase");
    expect(Object.isFrozen(invalidNameSchema)).toBe(false);
  });

  it("copies a direct catalog and rejects duplicate semantic identities", () => {
    const first = defineTestArtifact();
    const second = defineArtifact({
      name: "secondArtifact",
      id: "artifact:test.admission.second",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const source = { consumerFirst: first, consumerSecond: second };
    const catalog = defineArtifactCatalog(source);

    Reflect.set(source, "consumerFirst", second);
    expect(catalog).toEqual({ consumerFirst: first, consumerSecond: second });
    expect(catalog.consumerFirst).toBe(first);
    expect(catalog.consumerSecond).toBe(second);
    expect(Object.isFrozen(catalog)).toBe(true);

    const duplicateName = defineArtifact({
      name: first.name,
      id: "artifact:test.admission.duplicate-name",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const duplicateId = defineArtifact({
      name: "duplicateId",
      id: first.id,
      schema: Type.Object({}, { additionalProperties: false }),
    });
    expect(() => defineArtifactCatalog({ first, duplicateName })).toThrow(
      `duplicate artifact name "${first.name}"`
    );
    expect(() => defineArtifactCatalog({ first, duplicateId })).toThrow(
      `duplicate artifact id "${first.id}"`
    );
    expect(() => implementArtifacts([first, duplicateName])).toThrow(
      `duplicate artifact name "${first.name}"`
    );
    expect(() => implementArtifacts([first, duplicateId])).toThrow(
      `duplicate artifact id "${first.id}"`
    );
  });

  it("rejects accessor catalog entries and malformed runtime collections without executing them", () => {
    const artifact = defineTestArtifact();
    let reads = 0;
    const accessorCatalog = Object.defineProperty({}, "artifact", {
      enumerable: true,
      get: () => {
        reads += 1;
        return artifact;
      },
    });
    expect(() => defineArtifactCatalog(accessorCatalog as never)).toThrow(
      'artifact catalog key "artifact" must be an enumerable data property'
    );
    expect(reads).toBe(0);

    const accessorArray = [artifact];
    Object.defineProperty(accessorArray, "0", {
      enumerable: true,
      get: () => {
        reads += 1;
        return artifact;
      },
    });
    expect(() => implementArtifacts(accessorArray as never)).toThrow(
      "artifact at index 0 must be an enumerable data property"
    );
    expect(reads).toBe(0);
    expect(() => implementArtifacts({ 0: artifact, length: 1 } as never)).toThrow(
      "artifacts must be an array"
    );
  });
});
