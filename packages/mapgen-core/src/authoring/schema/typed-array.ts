import { type TSchemaOptions, type TUnsafe, Type } from "typebox";

declare const typedArraySchemaMetadata: unique symbol;

/** Typed-array values admitted by MapGen schemas and exact runtime guards. */
export type SupportedTypedArray =
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Int32Array
  | Uint32Array
  | Float32Array;

/** Constructor surface needed to allocate and identify a supported typed array. */
export type TypedArrayConstructor<T extends SupportedTypedArray> = Readonly<{
  new (length: number): T;
  readonly BYTES_PER_ELEMENT: number;
}>;

const typedArrayConstructors = Object.freeze({
  Uint8Array,
  Int8Array,
  Uint16Array,
  Uint32Array,
  Int16Array,
  Int32Array,
  Float32Array,
});

const typedArrayTagGetter = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Uint8Array.prototype) as object,
  Symbol.toStringTag
)?.get;

/** Exact runtime constructor names encoded by MapGen typed-array schema metadata. */
export type SupportedTypedArrayName = keyof typeof typedArrayConstructors;

/** @internal Narrows schema metadata to one constructor name owned by MapGen. */
export function isSupportedTypedArrayName(value: unknown): value is SupportedTypedArrayName {
  return (
    typeof value === "string" && Object.prototype.hasOwnProperty.call(typedArrayConstructors, value)
  );
}

/** @internal Resolves one admitted constructor name through MapGen's sole constructor registry. */
export function typedArrayConstructorFor(
  name: SupportedTypedArrayName
): TypedArrayConstructor<SupportedTypedArray> {
  return typedArrayConstructors[name];
}

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

type TypedArraySchemaOptions = TSchemaOptions &
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
  ctor: SupportedTypedArrayName,
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

/** Narrows a value to an exact typed-array constructor and, when supplied, cardinality. */
export function isTypedArrayOf<T extends SupportedTypedArray>(
  value: unknown,
  ctor: TypedArrayConstructor<T>,
  expectedLength?: number
): value is T {
  if (!ArrayBuffer.isView(value) || value instanceof DataView) return false;
  const prototype = (ctor as unknown as Readonly<{ prototype: object }>).prototype;
  if (Object.getPrototypeOf(value) !== prototype) return false;
  if (typedArrayTagGetter?.call(value) !== constructorName(ctor)) return false;
  if (expectedLength == null) return true;
  return (value as T).length === expectedLength;
}

/** Returns an exactly typed array or throws with its violated constructor/cardinality contract. */
export function assertTypedArrayOf<T extends SupportedTypedArray>(
  name: string,
  value: unknown,
  ctor: TypedArrayConstructor<T>,
  expectedLength?: number
): T {
  if (!isTypedArrayOf(value, ctor, expectedLength)) {
    const expectedLen = expectedLength == null ? "" : ` (len=${expectedLength})`;
    throw new Error(
      `[typed-arrays] Invalid "${name}" (expected ${constructorName(ctor)}${expectedLen})`
    );
  }
  return value;
}

function constructorName(ctor: TypedArrayConstructor<SupportedTypedArray>): string {
  return ((ctor as unknown as { name?: string }).name as string | undefined) ?? "TypedArray";
}

/** Narrows a value to a `Uint8Array` with optional exact cardinality. */
export function isUint8Array(value: unknown, expectedLength?: number): value is Uint8Array {
  return isTypedArrayOf(value, Uint8Array, expectedLength);
}

/** Returns a `Uint8Array` with optional exact cardinality or throws. */
export function assertUint8Array(
  name: string,
  value: unknown,
  expectedLength?: number
): Uint8Array {
  return assertTypedArrayOf(name, value, Uint8Array, expectedLength);
}

/** Narrows a value to an `Int8Array` with optional exact cardinality. */
export function isInt8Array(value: unknown, expectedLength?: number): value is Int8Array {
  return isTypedArrayOf(value, Int8Array, expectedLength);
}

/** Returns an `Int8Array` with optional exact cardinality or throws. */
export function assertInt8Array(name: string, value: unknown, expectedLength?: number): Int8Array {
  return assertTypedArrayOf(name, value, Int8Array, expectedLength);
}

/** Narrows a value to a `Uint16Array` with optional exact cardinality. */
export function isUint16Array(value: unknown, expectedLength?: number): value is Uint16Array {
  return isTypedArrayOf(value, Uint16Array, expectedLength);
}

/** Returns a `Uint16Array` with optional exact cardinality or throws. */
export function assertUint16Array(
  name: string,
  value: unknown,
  expectedLength?: number
): Uint16Array {
  return assertTypedArrayOf(name, value, Uint16Array, expectedLength);
}

/** Narrows a value to an `Int16Array` with optional exact cardinality. */
export function isInt16Array(value: unknown, expectedLength?: number): value is Int16Array {
  return isTypedArrayOf(value, Int16Array, expectedLength);
}

/** Returns an `Int16Array` with optional exact cardinality or throws. */
export function assertInt16Array(
  name: string,
  value: unknown,
  expectedLength?: number
): Int16Array {
  return assertTypedArrayOf(name, value, Int16Array, expectedLength);
}

/** Narrows a value to an `Int32Array` with optional exact cardinality. */
export function isInt32Array(value: unknown, expectedLength?: number): value is Int32Array {
  return isTypedArrayOf(value, Int32Array, expectedLength);
}

/** Returns an `Int32Array` with optional exact cardinality or throws. */
export function assertInt32Array(
  name: string,
  value: unknown,
  expectedLength?: number
): Int32Array {
  return assertTypedArrayOf(name, value, Int32Array, expectedLength);
}

/** Narrows a value to a `Uint32Array` with optional exact cardinality. */
export function isUint32Array(value: unknown, expectedLength?: number): value is Uint32Array {
  return isTypedArrayOf(value, Uint32Array, expectedLength);
}

/** Returns a `Uint32Array` with optional exact cardinality or throws. */
export function assertUint32Array(
  name: string,
  value: unknown,
  expectedLength?: number
): Uint32Array {
  return assertTypedArrayOf(name, value, Uint32Array, expectedLength);
}

/** Narrows a value to a `Float32Array` with optional exact cardinality. */
export function isFloat32Array(value: unknown, expectedLength?: number): value is Float32Array {
  return isTypedArrayOf(value, Float32Array, expectedLength);
}

/** Returns a `Float32Array` with optional exact cardinality or throws. */
export function assertFloat32Array(
  name: string,
  value: unknown,
  expectedLength?: number
): Float32Array {
  return assertTypedArrayOf(name, value, Float32Array, expectedLength);
}
