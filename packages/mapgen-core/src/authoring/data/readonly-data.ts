import type { IsAny, Primitive, TypedArray } from "type-fest";

type TypedArrayElement<Value extends TypedArray> = Value[number];
type TypedArrayMutator = "copyWithin" | "fill" | "reverse" | "set" | "sort";
type TypedArrayAliasingCallback =
  | "every"
  | "filter"
  | "find"
  | "findIndex"
  | "findLast"
  | "findLastIndex"
  | "forEach"
  | "map"
  | "reduce"
  | "reduceRight"
  | "some";

type ReadonlyTypedArrayCallback<Value extends TypedArray, Result> = (
  value: TypedArrayElement<Value>,
  index: number,
  array: ReadonlyTypedArray<Value>
) => Result;

type ReadonlyTypedArrayReducer<Value extends TypedArray, Accumulator> = (
  previousValue: Accumulator,
  currentValue: TypedArrayElement<Value>,
  currentIndex: number,
  array: ReadonlyTypedArray<Value>
) => Accumulator;

type ReadonlyTypedArrayEs2023Callbacks<Value extends TypedArray> = "findLast" extends keyof Value
  ? {
      findLast(
        predicate: ReadonlyTypedArrayCallback<Value, boolean>,
        thisArg?: unknown
      ): TypedArrayElement<Value> | undefined;
      findLastIndex(
        predicate: ReadonlyTypedArrayCallback<Value, boolean>,
        thisArg?: unknown
      ): number;
    }
  : unknown;

/** Observation-only typed-array surface used inside MapGen input projections. */
export type ReadonlyTypedArray<Value extends TypedArray> = Readonly<
  Omit<Value, TypedArrayMutator | TypedArrayAliasingCallback | "buffer" | "subarray" | "valueOf">
> & {
  readonly [index: number]: TypedArrayElement<Value>;
  every(predicate: ReadonlyTypedArrayCallback<Value, unknown>, thisArg?: unknown): boolean;
  filter(predicate: ReadonlyTypedArrayCallback<Value, unknown>, thisArg?: unknown): Value;
  find(
    predicate: ReadonlyTypedArrayCallback<Value, boolean>,
    thisArg?: unknown
  ): TypedArrayElement<Value> | undefined;
  findIndex(predicate: ReadonlyTypedArrayCallback<Value, boolean>, thisArg?: unknown): number;
  forEach(callback: ReadonlyTypedArrayCallback<Value, void>, thisArg?: unknown): void;
  map(
    callback: ReadonlyTypedArrayCallback<Value, TypedArrayElement<Value>>,
    thisArg?: unknown
  ): Value;
  reduce(
    callback: ReadonlyTypedArrayReducer<Value, TypedArrayElement<Value>>
  ): TypedArrayElement<Value>;
  reduce(
    callback: ReadonlyTypedArrayReducer<Value, TypedArrayElement<Value>>,
    initialValue: TypedArrayElement<Value>
  ): TypedArrayElement<Value>;
  reduce<Accumulator>(
    callback: ReadonlyTypedArrayReducer<Value, Accumulator>,
    initialValue: Accumulator
  ): Accumulator;
  reduceRight(
    callback: ReadonlyTypedArrayReducer<Value, TypedArrayElement<Value>>
  ): TypedArrayElement<Value>;
  reduceRight(
    callback: ReadonlyTypedArrayReducer<Value, TypedArrayElement<Value>>,
    initialValue: TypedArrayElement<Value>
  ): TypedArrayElement<Value>;
  reduceRight<Accumulator>(
    callback: ReadonlyTypedArrayReducer<Value, Accumulator>,
    initialValue: Accumulator
  ): Accumulator;
  some(predicate: ReadonlyTypedArrayCallback<Value, unknown>, thisArg?: unknown): boolean;
  subarray(begin?: number, end?: number): ReadonlyTypedArray<Value>;
  valueOf(): ReadonlyTypedArray<Value>;
} & ReadonlyTypedArrayEs2023Callbacks<Value>;

/** Readonly array surface used by schema-aware admission mappers. */
export type ReadonlyDataArray<Item> = readonly Item[];

type ReadonlyDataShape<Value> =
  IsAny<Value> extends true
    ? unknown
    : Value extends TypedArray
      ? ReadonlyTypedArray<Value>
      : Value extends ReadonlyTypedArray<TypedArray>
        ? Value
        : Value extends Primitive
          ? Value
          : Value extends (...args: never[]) => unknown
            ? never
            : Value extends ReadonlyMap<infer Key, infer Entry>
              ? ReadonlyMap<ReadonlyDataShape<Key>, ReadonlyDataShape<Entry>>
              : Value extends ReadonlySet<infer Item>
                ? ReadonlySet<ReadonlyDataShape<Item>>
                : Value extends readonly []
                  ? readonly []
                  : Value extends readonly [unknown, ...unknown[]]
                    ? { readonly [Key in keyof Value]: ReadonlyDataShape<Value[Key]> }
                    : Value extends readonly (infer Item)[]
                      ? readonly ReadonlyDataShape<Item>[]
                      : Value extends object
                        ? { readonly [Key in keyof Value]: ReadonlyDataShape<Value[Key]> }
                        : Value;

/**
 * Deep readonly projection for MapGen data observed without copying or wrapping.
 *
 * This is an authoring constraint, not runtime isolation. Structural widening and explicit casts
 * can bypass it; hard immutability requires a deliberate storage or snapshot boundary.
 */
export type ReadonlyData<Value> = ReadonlyDataShape<Value>;
