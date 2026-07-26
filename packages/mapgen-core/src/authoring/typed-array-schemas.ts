import { type TSchemaOptions, type TUnsafe, Type } from "typebox";

declare const typedArraySchemaMetadata: unique symbol;

/** Input-relative numeric paths whose product is the admitted typed-array cardinality. */
export type TypedArrayCardinalityPaths = readonly [string, ...string[]];

/** Input-relative numeric factors plus a fixed nonnegative addend for an admitted length. */
export type TypedArrayProductPlusAddendCardinality = Readonly<{
  factors: TypedArrayCardinalityPaths;
  addend: number;
}>;

/** Constructor-only, product, or product-plus-addend cardinality metadata. */
export type TypedArrayCardinality =
  | TypedArrayCardinalityPaths
  | TypedArrayProductPlusAddendCardinality
  | "constructor-only";

/**
 * TypeBox unsafe schema carrying exact-constructor and cardinality intent. Operation construction
 * compiles that metadata into input admission; artifact and other schema owners retain authority
 * for their own relational validation. The phantom metadata lets strategy-input types distinguish
 * grid-coupled values from other admitted typed arrays without changing the raw caller input.
 */
export interface TTypedArraySchema<Value, Cardinality extends TypedArrayCardinality>
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
     * Input-relative numeric paths whose product describes the typed-array length.
     *
     * Defaults to `width` × `height`. A path tuple is a product with no addend. Use a
     * product-plus-addend object for relations such as CSR offsets (`factors` product plus
     * `addend`), or `"constructor-only"` when this schema declares no length relation. Operation
     * inputs compile the relation into admission; artifacts prove relational laws through their
     * local refinement.
     */
    cardinality?: TypedArrayCardinality;
  }>;

type DefaultGridCardinality = readonly ["width", "height"];

type CardinalityFromValue<Value> =
  Exclude<Extract<Value, TypedArrayCardinality | undefined>, undefined> extends infer Explicit
    ? [Explicit] extends [never]
      ? DefaultGridCardinality
      : Explicit | (undefined extends Value ? DefaultGridCardinality : never)
    : never;

type CardinalityOfOptions<Options extends TypedArraySchemaOptions | undefined> =
  Options extends undefined
    ? DefaultGridCardinality
    : "cardinality" extends keyof Options
      ? CardinalityFromValue<Options["cardinality"]>
      : DefaultGridCardinality;

type ExactTypedArrayCardinality<Cardinality> =
  Cardinality extends TypedArrayProductPlusAddendCardinality
    ? Exclude<keyof Cardinality, keyof TypedArrayProductPlusAddendCardinality> extends never
      ? Cardinality
      : never
    : Cardinality;

type ExactCardinalityOptions<Options extends TypedArraySchemaOptions | undefined> =
  Options extends TypedArraySchemaOptions
    ? Options &
        Readonly<{
          cardinality?: ExactTypedArrayCardinality<Options["cardinality"]>;
        }>
    : Options;

function unsafe<T, const Options extends TypedArraySchemaOptions | undefined>(
  ctor: string,
  options?: Options
): TTypedArraySchema<T, CardinalityOfOptions<Options>> {
  // NOTE: TypeBox does not expose first-class typed-array schema builders.
  // We treat typed arrays as POJO-ish runtime values and use `Type.Unsafe<T>` purely for Static typing.
  const { cardinality, ...rest } = options ?? {};
  const runtimeCardinality = cardinality === undefined ? ["width", "height"] : cardinality;

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

/** Exact typed-array schemas whose metadata is interpreted by the owning admission boundary. */
export const TypedArraySchemas = Object.freeze({
  u8: <const Options extends TypedArraySchemaOptions | undefined = undefined>(
    options?: ExactCardinalityOptions<Options>
  ) => unsafe<Uint8Array, Options>("Uint8Array", options),
  i8: <const Options extends TypedArraySchemaOptions | undefined = undefined>(
    options?: ExactCardinalityOptions<Options>
  ) => unsafe<Int8Array, Options>("Int8Array", options),
  u16: <const Options extends TypedArraySchemaOptions | undefined = undefined>(
    options?: ExactCardinalityOptions<Options>
  ) => unsafe<Uint16Array, Options>("Uint16Array", options),
  u32: <const Options extends TypedArraySchemaOptions | undefined = undefined>(
    options?: ExactCardinalityOptions<Options>
  ) => unsafe<Uint32Array, Options>("Uint32Array", options),
  i16: <const Options extends TypedArraySchemaOptions | undefined = undefined>(
    options?: ExactCardinalityOptions<Options>
  ) => unsafe<Int16Array, Options>("Int16Array", options),
  i32: <const Options extends TypedArraySchemaOptions | undefined = undefined>(
    options?: ExactCardinalityOptions<Options>
  ) => unsafe<Int32Array, Options>("Int32Array", options),
  f32: <const Options extends TypedArraySchemaOptions | undefined = undefined>(
    options?: ExactCardinalityOptions<Options>
  ) => unsafe<Float32Array, Options>("Float32Array", options),
});
