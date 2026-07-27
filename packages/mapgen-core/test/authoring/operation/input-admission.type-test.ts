import {
  type AdmittedBuffer,
  type ArtifactReadValueOf,
  createOp,
  createStrategy,
  defineArtifact,
  defineOp,
  defineStrategy,
  type GridBuffer,
  type OperationInput,
  Type,
  TypedArraySchemas,
} from "@mapgen/authoring/index.js";
import type { ReadonlyTypedArray } from "../../../src/authoring/data/readonly-data.js";

// @ts-expect-error BorrowedValue is intentionally absent from the public authoring API.
type RemovedBorrowedValue = import("@mapgen/authoring/index.js").BorrowedValue;
void (0 as unknown as RemovedBorrowedValue);

type Es2023Uint8Array = Uint8Array & {
  findLast(
    predicate: (value: number, index: number, array: Uint8Array) => boolean,
    thisArg?: unknown
  ): number | undefined;
  findLastIndex(
    predicate: (value: number, index: number, array: Uint8Array) => boolean,
    thisArg?: unknown
  ): number;
};

declare const es2023Values: ReadonlyTypedArray<Es2023Uint8Array>;
es2023Values.findLast((_value, _index, array) => {
  // @ts-expect-error ES2023 typed-array callbacks cannot recover an in-place mutator.
  array.fill(1);
  return true;
});
es2023Values.findLastIndex((_value, _index, array) => {
  // @ts-expect-error ES2023 typed-array callbacks cannot recover an in-place mutator.
  array.fill(1);
  return true;
});

const widenedCardinalityOptions: Parameters<typeof TypedArraySchemas.u8>[0] = {
  cardinality: ["height"],
};

// @ts-expect-error Legacy null cardinality is not a public constructor-only mode.
TypedArraySchemas.u8({ cardinality: null });

// @ts-expect-error Product-plus-addend cardinality requires both factors and a fixed addend.
TypedArraySchemas.u8({ cardinality: { factors: ["height"] } });

// @ts-expect-error Product-plus-addend cardinality accepts only factors and addend.
TypedArraySchemas.u8({ cardinality: { factors: ["height"], addend: 1, unit: "cells" } });

const InputAdmissionContract = defineOp({
  kind: "compute",
  id: "test/input-admission-types",
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
      planned: TypedArraySchemas.u8({ cardinality: ["plan.width", "plan.height"] }),
      offsets: TypedArraySchemas.i32({
        cardinality: { factors: ["plan.width", "plan.height"], addend: 1 },
      }),
      constructorOnly: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
      widenedCardinality: TypedArraySchemas.u8(widenedCardinalityOptions),
      explicitDefaultCardinality: TypedArraySchemas.u8({ cardinality: undefined }),
      opaque: Type.Unsafe<{
        nested: { value: number };
        samples: Uint8Array;
      }>(Type.Any()),
      nested: Type.Optional(
        Type.Object(
          {
            rows: Type.Array(
              Type.Object(
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
              )
            ),
          },
          { additionalProperties: false }
        )
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      count: Type.Integer(),
      samples: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    },
    { additionalProperties: false }
  ),
  strategies: [
    defineStrategy({ id: "admitted", config: Type.Object({}, { additionalProperties: false }) }),
  ],
});

const strategy = createStrategy(
  InputAdmissionContract,
  InputAdmissionContract.strategies.admitted,
  {
    run: (input) => {
      if (false) {
        // @ts-expect-error Operation input objects are deeply readonly.
        input.plan.width = 2;
        // @ts-expect-error Admitted typed-array indexes are readonly.
        input.grid[0] = 1;
        // @ts-expect-error Admitted typed arrays omit in-place setters.
        input.grid.set([1]);
        // @ts-expect-error Admitted typed arrays omit in-place filling.
        input.grid.fill(1);
        // @ts-expect-error Aliasing subarrays retain the readonly surface.
        input.grid.subarray().set([1]);
        input.grid.every((_value, _index, array) => {
          // @ts-expect-error Typed-array callbacks cannot recover an in-place mutator.
          array.fill(1);
          return true;
        });
        input.grid.filter((_value, _index, array) => {
          // @ts-expect-error Typed-array callbacks cannot recover an in-place mutator.
          array.fill(1);
          return true;
        });
        input.grid.find((_value, _index, array) => {
          // @ts-expect-error Typed-array callbacks cannot recover an in-place mutator.
          array.fill(1);
          return true;
        });
        input.grid.findIndex((_value, _index, array) => {
          // @ts-expect-error Typed-array callbacks cannot recover an in-place mutator.
          array.fill(1);
          return true;
        });
        input.grid.forEach((_value, _index, array) => {
          // @ts-expect-error Typed-array callbacks cannot recover an in-place mutator.
          array.fill(1);
        });
        input.grid.map((value, _index, array) => {
          // @ts-expect-error Typed-array callbacks cannot recover an in-place mutator.
          array.fill(1);
          return value;
        });
        input.grid.reduce((total, value, _index, array) => {
          // @ts-expect-error Typed-array callbacks cannot recover an in-place mutator.
          array.fill(1);
          return total + value;
        });
        input.grid.reduceRight((total, value, _index, array) => {
          // @ts-expect-error Typed-array callbacks cannot recover an in-place mutator.
          array.fill(1);
          return total + value;
        });
        input.grid.some((_value, _index, array) => {
          // @ts-expect-error Typed-array callbacks cannot recover an in-place mutator.
          array.fill(1);
          return true;
        });
        // @ts-expect-error Typed arrays nested beneath unsafe schemas remain readonly.
        input.opaque.samples.fill(1);
        // @ts-expect-error Operation input arrays cannot grow.
        input.nested!.rows.push({});
      }

      const grid: GridBuffer<Uint8Array> = input.grid;
      const row: AdmittedBuffer<Float32Array> = input.latitudeByRow;
      const planned: AdmittedBuffer<Uint8Array> = input.planned;
      const offsets: AdmittedBuffer<Int32Array> = input.offsets;
      const constructorOnly: AdmittedBuffer<Int16Array> = input.constructorOnly;
      const widenedCardinality: AdmittedBuffer<Uint8Array> = input.widenedCardinality;
      const explicitDefaultCardinality: GridBuffer<Uint8Array> = input.explicitDefaultCardinality;
      const nestedValue = input.nested?.rows[0]?.value;
      if (nestedValue) {
        const admittedUnion: AdmittedBuffer<Float32Array> | AdmittedBuffer<Int16Array> =
          nestedValue;
        void admittedUnion;
      }

      const mutableCopy = input.grid.slice();
      mutableCopy.fill(1);
      return {
        count:
          grid.length +
          row.length +
          planned.length +
          offsets.length +
          constructorOnly.length +
          widenedCardinality.length +
          explicitDefaultCardinality.length,
        samples: mutableCopy,
      };
    },
  }
);

// @ts-expect-error Executable strategy behavior is opaque outside Core's operation factory.
strategy.run;

const op = createOp(InputAdmissionContract, { strategies: [strategy] });

const OtherInputAdmissionContract = defineOp({
  kind: "compute",
  id: "test/input-admission-types-other",
  input: InputAdmissionContract.input,
  output: InputAdmissionContract.output,
  strategies: [InputAdmissionContract.strategies.admitted],
});
const otherStrategy = createStrategy(
  OtherInputAdmissionContract,
  OtherInputAdmissionContract.strategies.admitted,
  { run: () => ({ count: 0, samples: new Uint8Array() }) }
);

// @ts-expect-error A strategy descriptor is nominally bound to its contract identity.
createOp(InputAdmissionContract, { strategies: [otherStrategy] });

const rawInput = {
  width: 2,
  height: 2,
  plan: { width: 1, height: 2 },
  grid: new Uint8Array(4),
  latitudeByRow: new Float32Array(2),
  planned: new Uint8Array(2),
  offsets: new Int32Array(3),
  constructorOnly: new Int16Array(1),
  widenedCardinality: new Uint8Array(2),
  explicitDefaultCardinality: new Uint8Array(4),
  opaque: {
    nested: { value: 1 },
    samples: new Uint8Array(1),
  },
};

const readonlyInput: OperationInput<typeof InputAdmissionContract.input> = rawInput;
const inputArtifact = defineArtifact({
  name: "inputAdmissionFixture",
  id: "artifact:test.input-admission-fixture",
  schema: InputAdmissionContract.input,
});
declare const artifactInput: ArtifactReadValueOf<typeof inputArtifact>;

op.run(rawInput, op.defaultConfig);
op.run(readonlyInput, op.defaultConfig);
op.run(artifactInput, op.defaultConfig);

const output = op.run(rawInput, op.defaultConfig);
output.count += 1;
output.samples.fill(1);

// @ts-expect-error Raw typed arrays have not crossed the operation-input admission boundary.
const inadmissibleGrid: GridBuffer<Uint8Array> = new Uint8Array(4);
void inadmissibleGrid;
