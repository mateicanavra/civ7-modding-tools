/** Typed-array constructors admitted by MapGen artifact schemas and runtime guards. */
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
  // Typed array constructors support multiple overloads; we only need `new (length)` for typing.
  new (length: number): T;
  readonly BYTES_PER_ELEMENT: number;
}>;

/** Narrows a value to an exact typed-array constructor and, when supplied, cardinality. */
export function isTypedArrayOf<T extends SupportedTypedArray>(
  value: unknown,
  ctor: TypedArrayConstructor<T>,
  expectedLength?: number
): value is T {
  if (!ArrayBuffer.isView(value) || value instanceof DataView) return false;
  const prototype = (ctor as unknown as Readonly<{ prototype: object }>).prototype;
  if (Object.getPrototypeOf(value) !== prototype) return false;
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
      `[typed-arrays] Invalid "${name}" (expected ${ctorAnyName(ctor)}${expectedLen})`
    );
  }
  return value;
}

function ctorAnyName(ctor: TypedArrayConstructor<SupportedTypedArray>): string {
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
