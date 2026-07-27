import { describe, expect, it } from "bun:test";
import {
  defineArtifact,
  defineArtifactCatalog,
  defineStep,
  Type,
  TypedArraySchemas,
} from "@mapgen/authoring/index.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";

const admittedSetup = admitMapSetup({
  mapSeed: 42,
  dimensions: { width: 2, height: 3 },
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
});
const validationContext = { dimensions: admittedSetup.dimensions } as const;

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
    expect(defineArtifactCatalog({ validatedArtifact: portable })).toEqual({
      validatedArtifact: portable,
    });

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

  it("runs structural, exact typed-array, and semantic admission as ordered phases", () => {
    const calls: unknown[] = [];
    const artifact = defineArtifact({
      name: "phasedArtifact",
      id: "artifact:test.admission.phased",
      schema: Type.Object(
        {
          count: Type.Number(),
          grid: TypedArraySchemas.u8({ cardinality: "map-grid" }),
        },
        { additionalProperties: false }
      ),
      refine: (value, facilities) => {
        calls.push({ value, facilities });
        facilities.issues.add("semantic failure");
        return undefined;
      },
    });

    expect(
      artifact.validate({ count: "invalid", grid: new Int8Array(6) }, validationContext)
    ).toEqual([{ message: "/count must be number" }]);
    expect(calls).toEqual([]);

    expect(artifact.validate({ count: 1, grid: new Int8Array(6) }, validationContext)).toEqual([
      { message: "Expected $.grid to be Uint8Array." },
    ]);
    expect(calls).toEqual([]);

    expect(artifact.validate({ count: 1, grid: new Uint8Array(5) }, validationContext)).toEqual([
      { message: "Expected $.grid length 6 (received 5)." },
    ]);
    expect(calls).toEqual([]);

    const value = { count: 1, grid: new Uint8Array(6) };
    expect(artifact.validate(value, validationContext)).toEqual([{ message: "semantic failure" }]);
    const facilities = (calls[0] as { facilities: Record<string, unknown> }).facilities;
    expect(calls).toHaveLength(1);
    expect((calls[0] as { value: unknown }).value).toBe(value);
    expect(facilities.cellCount).toBe(6);
    expect(facilities.dimensions).toBe(admittedSetup.dimensions);
    expect(Object.isFrozen(facilities)).toBe(true);
    expect(Object.isFrozen(facilities.dimensions)).toBe(true);
    expect(Object.isFrozen(facilities.issues)).toBe(true);
  });

  it("keeps map-grid distinct from default input-relative cardinality", () => {
    const artifact = defineArtifact({
      name: "cardinalityModes",
      id: "artifact:test.admission.cardinality-modes",
      schema: Type.Object(
        {
          width: Type.Integer(),
          height: Type.Integer(),
          inputRelative: TypedArraySchemas.u8(),
          contextual: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          constructorOnly: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
    });

    expect(
      artifact.validate(
        {
          width: 1,
          height: 2,
          inputRelative: new Uint8Array(2),
          contextual: new Uint8Array(6),
          constructorOnly: new Int16Array(17),
        },
        validationContext
      )
    ).toEqual([]);
    expect(
      artifact.validate(
        {
          width: 1,
          height: 2,
          inputRelative: new Uint8Array(6),
          contextual: new Uint8Array(2),
          constructorOnly: new Int16Array(17),
        },
        validationContext
      )
    ).toEqual([
      { message: "Expected $.contextual length 6 (received 2)." },
      { message: "Expected $.inputRelative length 2 (received 6)." },
    ]);
  });

  it("rejects typed-array subclasses and spoofed views through exact constructor admission", () => {
    class ExtendedUint8Array extends Uint8Array {}
    const artifact = defineArtifact({
      name: "exactConstructor",
      id: "artifact:test.admission.exact-constructor",
      schema: Type.Object(
        {
          value: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
    });

    for (const value of [
      new ExtendedUint8Array(1),
      new DataView(new ArrayBuffer(1)),
      { constructor: Uint8Array, length: 1 },
    ]) {
      expect(artifact.validate({ value }, validationContext)).toEqual([
        { message: "Expected $.value to be Uint8Array." },
      ]);
    }
  });

  it("owns semantic issue order, freezing, coordinate checks, and sink closure", () => {
    let retainedSink:
      | Readonly<{
          add: (message: string) => void;
          addGridCoordinates: (
            label: string,
            coordinates: readonly Readonly<{ x: number; y: number }>[]
          ) => void;
        }>
      | undefined;
    const artifact = defineArtifact({
      name: "stableIssues",
      id: "artifact:test.admission.stable-issues",
      schema: Type.Object(
        {
          coordinates: Type.Array(
            Type.Object({ x: Type.Integer(), y: Type.Integer() }, { additionalProperties: false })
          ),
        },
        { additionalProperties: false }
      ),
      refine: (value, { issues }) => {
        retainedSink = issues;
        issues.add("first");
        issues.addGridCoordinates("coordinates", value.coordinates);
        issues.add("last");
        return undefined;
      },
    });

    const admitted = artifact.validate(
      {
        coordinates: [
          { x: 1, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 0 },
        ],
      },
      validationContext
    );
    expect(admitted).toEqual([
      { message: "first" },
      { message: "coordinates[1] duplicates the tile claim at 1,1." },
      { message: "coordinates[2] coordinate 2,0 is outside 2x3." },
      { message: "last" },
    ]);
    expect(Object.isFrozen(admitted)).toBe(true);
    expect(admitted.every(Object.isFrozen)).toBe(true);
    expect(() => retainedSink?.add("late")).toThrow("Artifact refinement issue sink is closed");
    expect(() => retainedSink?.addGridCoordinates("late", [])).toThrow(
      "Artifact refinement issue sink is closed"
    );
  });

  it("contains thenables and rejects every non-undefined refinement result", async () => {
    let asyncSink: { add: (message: string) => void } | undefined;
    const asynchronous = defineArtifact({
      name: "asyncRefinement",
      id: "artifact:test.admission.async",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
      refine: (async (
        _value: unknown,
        facilities: { issues: { add: (message: string) => void } }
      ) => {
        asyncSink = facilities.issues;
        throw new Error("late refinement failure");
      }) as never,
    });
    const nonUndefined = defineArtifact({
      name: "nonUndefinedRefinement",
      id: "artifact:test.admission.non-undefined",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
      refine: (() => []) as never,
    });

    expect(() => asynchronous.validate({ value: 1 }, validationContext)).toThrow(
      "Artifact refinements must return undefined synchronously"
    );
    expect(() => asyncSink?.add("late")).toThrow("Artifact refinement issue sink is closed");
    expect(() => nonUndefined.validate({ value: 1 }, validationContext)).toThrow(
      "Artifact refinements must return undefined"
    );
    await Promise.resolve();
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

  it("copies a direct catalog and requires one lookup identity", () => {
    const first = defineTestArtifact();
    const second = defineArtifact({
      name: "secondArtifact",
      id: "artifact:test.admission.second",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const source = { validatedArtifact: first, secondArtifact: second };
    const catalog = defineArtifactCatalog(source);

    Reflect.set(source, "validatedArtifact", second);
    expect(catalog).toEqual({ validatedArtifact: first, secondArtifact: second });
    expect(catalog.validatedArtifact).toBe(first);
    expect(catalog.secondArtifact).toBe(second);
    expect(Object.isFrozen(catalog)).toBe(true);

    const duplicateId = defineArtifact({
      name: "duplicateId",
      id: first.id,
      schema: Type.Object({}, { additionalProperties: false }),
    });
    expect(() => defineArtifactCatalog({ consumerFirst: first } as never)).toThrow(
      'artifact catalog key "consumerFirst" must match artifact name "validatedArtifact"'
    );
    expect(() => defineArtifactCatalog({ validatedArtifact: first, duplicateId })).toThrow(
      `duplicate artifact id "${first.id}"`
    );
  });

  it("rejects accessor catalog entries without executing them", () => {
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
  });
});
