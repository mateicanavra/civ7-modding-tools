import {
  type AdmittedBuffer,
  createOp,
  createStrategy,
  defineOp,
  type GridBuffer,
  Type,
  TypedArraySchemas,
} from "@mapgen/authoring/index.js";

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
      explicitDefaultCardinality: TypedArraySchemas.u8({
        cardinality: undefined,
      }),
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
  output: Type.Integer(),
  strategies: { admitted: Type.Object({}, { additionalProperties: false }) },
});

const strategy = createStrategy(InputAdmissionContract, "admitted", {
  run: (input) => {
    const grid: GridBuffer<Uint8Array> = input.grid;
    const row: AdmittedBuffer<Float32Array> = input.latitudeByRow;
    const planned: AdmittedBuffer<Uint8Array> = input.planned;
    const offsets: AdmittedBuffer<Int32Array> = input.offsets;
    const constructorOnly: AdmittedBuffer<Int16Array> = input.constructorOnly;
    const widenedCardinality: AdmittedBuffer<Uint8Array> = input.widenedCardinality;
    const explicitDefaultCardinality: GridBuffer<Uint8Array> = input.explicitDefaultCardinality;
    const nestedValue = input.nested?.rows[0]?.value;
    if (nestedValue) {
      const admittedUnion: AdmittedBuffer<Float32Array> | AdmittedBuffer<Int16Array> = nestedValue;
      void admittedUnion;
    }
    return (
      grid.length +
      row.length +
      planned.length +
      offsets.length +
      constructorOnly.length +
      widenedCardinality.length +
      explicitDefaultCardinality.length
    );
  },
});

// @ts-expect-error Executable strategy behavior is opaque outside Core's operation factory.
strategy.run;

const op = createOp(InputAdmissionContract, { strategies: { admitted: strategy } });

const OtherInputAdmissionContract = defineOp({
  kind: "compute",
  id: "test/input-admission-types-other",
  input: InputAdmissionContract.input,
  output: InputAdmissionContract.output,
  strategies: InputAdmissionContract.strategies,
});
const otherStrategy = createStrategy(OtherInputAdmissionContract, "admitted", {
  run: () => 0,
});

// @ts-expect-error A strategy descriptor is nominally bound to its contract identity.
createOp(InputAdmissionContract, { strategies: { admitted: otherStrategy } });

op.run(
  {
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
  },
  op.defaultConfig
);

// @ts-expect-error Raw typed arrays have not crossed the operation-input admission boundary.
const inadmissibleGrid: GridBuffer<Uint8Array> = new Uint8Array(4);
void inadmissibleGrid;
