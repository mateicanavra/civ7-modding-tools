import { type TSchemaOptions, type TUnsafe, Type } from "typebox";

declare const typedArraySchemaMetadata: unique symbol;

/** Input-relative numeric paths whose product is the admitted typed-array cardinality. */
export type TypedArrayCardinalityPaths = readonly [string, ...string[]];

/**
 * TypeBox unsafe schema carrying the runtime typed-array law that Core compiles at operation
 * construction. The phantom metadata lets strategy-input types distinguish grid-coupled values
 * from constructor-only typed arrays without changing the raw public operation input type.
 */
export interface TTypedArraySchema<Value, Cardinality extends TypedArrayCardinalityPaths | null>
  extends TUnsafe<Value> {
  readonly [typedArraySchemaMetadata]: Readonly<{
    value: Value;
    cardinality: Cardinality;
  }>;
}

export type TypedArraySchemaOptions = TSchemaOptions &
  Readonly<{
    description?: string;
    /**
     * Input-relative numeric paths whose product must equal the typed-array length.
     *
     * Defaults to `width` × `height`. Use a single path for row or column vectors, nested paths
     * such as `plan.width` for embedded plans, and `null` for constructor-only values.
     */
    cardinality?: TypedArrayCardinalityPaths | null;
    /** @deprecated Use `cardinality: null`; retained while artifact schemas migrate. */
    shape?: null;
  }>;

type DefaultGridCardinality = readonly ["width", "height"];

type CardinalityFromValue<Value> =
  Exclude<
    Extract<Value, TypedArrayCardinalityPaths | null | undefined>,
    undefined
  > extends infer Explicit
    ? [Explicit] extends [never]
      ? DefaultGridCardinality
      : Explicit | (undefined extends Value ? DefaultGridCardinality : never)
    : never;

type CardinalityOfOptions<Options extends TypedArraySchemaOptions | undefined> =
  Options extends undefined
    ? DefaultGridCardinality
    : "cardinality" extends keyof Options
      ? CardinalityFromValue<Options["cardinality"]>
      : Options extends Readonly<{ shape: null }>
        ? null
        : DefaultGridCardinality;

function unsafe<T, const Options extends TypedArraySchemaOptions | undefined>(
  ctor: string,
  options?: Options
): TTypedArraySchema<T, CardinalityOfOptions<Options>> {
  // NOTE: TypeBox does not expose first-class typed-array schema builders.
  // We treat typed arrays as POJO-ish runtime values and use `Type.Unsafe<T>` purely for Static typing.
  const { cardinality, shape, ...rest } = options ?? {};
  const hasCardinality =
    options !== undefined && Object.prototype.hasOwnProperty.call(options, "cardinality");
  const runtimeCardinality = hasCardinality
    ? cardinality === undefined
      ? ["width", "height"]
      : cardinality
    : shape === null
      ? null
      : ["width", "height"];

  return Type.Unsafe<T>(
    Type.Any({
      ...rest,
      "x-runtime": {
        kind: "typed-array",
        ctor,
        cardinality: runtimeCardinality,
      },
    })
  ) as TTypedArraySchema<T, CardinalityOfOptions<Options>>;
}

/** Exact typed-array schemas with operation-input cardinality metadata owned by MapGen Core. */
export const TypedArraySchemas = Object.freeze({
  u8: <const Options extends TypedArraySchemaOptions | undefined = undefined>(options?: Options) =>
    unsafe<Uint8Array, Options>("Uint8Array", options),
  i8: <const Options extends TypedArraySchemaOptions | undefined = undefined>(options?: Options) =>
    unsafe<Int8Array, Options>("Int8Array", options),
  u16: <const Options extends TypedArraySchemaOptions | undefined = undefined>(options?: Options) =>
    unsafe<Uint16Array, Options>("Uint16Array", options),
  u32: <const Options extends TypedArraySchemaOptions | undefined = undefined>(options?: Options) =>
    unsafe<Uint32Array, Options>("Uint32Array", options),
  i16: <const Options extends TypedArraySchemaOptions | undefined = undefined>(options?: Options) =>
    unsafe<Int16Array, Options>("Int16Array", options),
  i32: <const Options extends TypedArraySchemaOptions | undefined = undefined>(options?: Options) =>
    unsafe<Int32Array, Options>("Int32Array", options),
  f32: <const Options extends TypedArraySchemaOptions | undefined = undefined>(options?: Options) =>
    unsafe<Float32Array, Options>("Float32Array", options),
});
