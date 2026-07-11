type PortableJson = null | boolean | number | string | readonly PortableJson[] | PortableJsonObject;
type PortableJsonObject = { [key: string]: PortableJson };

export type PortableJsonSnapshotResult =
  | Readonly<{ ok: true; value: PortableJson }>
  | Readonly<{ ok: false; path: string; message: string }>;

const UNSAFE_PROPERTY_KEYS = new Set(["__proto__", "constructor", "prototype"]);

class PortableJsonSnapshotError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(message);
    this.path = path;
  }
}

function escapeJsonPointerSegment(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function childPath(path: string, key: string): string {
  return `${path}/${escapeJsonPointerSegment(key)}`;
}

function sameKeys(left: readonly PropertyKey[], right: readonly PropertyKey[]): boolean {
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

function sameDescriptor(left: PropertyDescriptor, right: PropertyDescriptor | undefined): boolean {
  if (right === undefined) return false;
  const leftIsData = Object.prototype.hasOwnProperty.call(left, "value");
  const rightIsData = Object.prototype.hasOwnProperty.call(right, "value");
  if (leftIsData !== rightIsData) return false;
  return (
    left.configurable === right.configurable &&
    left.enumerable === right.enumerable &&
    left.writable === right.writable &&
    left.get === right.get &&
    left.set === right.set &&
    (!leftIsData || Object.is(left.value, right.value))
  );
}

function readDataDescriptor(
  value: object,
  key: PropertyKey,
  path: string,
  enumerable: boolean
): PropertyDescriptor {
  const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined) {
    throw new PortableJsonSnapshotError(path, "Value changed while its snapshot was being created");
  }
  if (!Object.prototype.hasOwnProperty.call(descriptor, "value")) {
    throw new PortableJsonSnapshotError(path, "Accessors are not portable JSON properties");
  }
  if (descriptor.enumerable !== enumerable) {
    throw new PortableJsonSnapshotError(path, "Non-enumerable properties are not portable JSON");
  }
  return descriptor;
}

function assertStableObject(
  input: object,
  prototype: object | null,
  keys: readonly PropertyKey[],
  descriptors: ReadonlyMap<PropertyKey, PropertyDescriptor>,
  path: string
): void {
  if (Object.getPrototypeOf(input) !== prototype || !sameKeys(Reflect.ownKeys(input), keys)) {
    throw new PortableJsonSnapshotError(path, "Value changed while its snapshot was being created");
  }
  for (const [key, descriptor] of descriptors) {
    if (!sameDescriptor(descriptor, Reflect.getOwnPropertyDescriptor(input, key))) {
      const propertyPath = typeof key === "string" ? childPath(path, key) : path;
      throw new PortableJsonSnapshotError(
        propertyPath,
        "Value changed while its snapshot was being created"
      );
    }
  }
}

function snapshotArray(
  input: object,
  path: string,
  active: WeakSet<object>
): readonly PortableJson[] {
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Array.prototype) {
    throw new PortableJsonSnapshotError(path, "Arrays must use the standard Array prototype");
  }

  const keys = Reflect.ownKeys(input);
  if (keys.some((key) => typeof key === "symbol")) {
    throw new PortableJsonSnapshotError(path, "Symbol properties are not portable JSON");
  }

  const lengthDescriptor = readDataDescriptor(input, "length", childPath(path, "length"), false);
  const length = lengthDescriptor.value;
  if (!Number.isSafeInteger(length) || length < 0 || length > 0xffff_ffff) {
    throw new PortableJsonSnapshotError(path, "Array length is invalid");
  }

  const indexKeys = keys.filter((key) => key !== "length") as string[];
  if (indexKeys.length !== length) {
    throw new PortableJsonSnapshotError(path, "Sparse arrays are not portable JSON");
  }
  for (let index = 0; index < indexKeys.length; index += 1) {
    if (indexKeys[index] !== String(index)) {
      throw new PortableJsonSnapshotError(
        childPath(path, indexKeys[index] ?? String(index)),
        "Arrays may only contain contiguous index properties"
      );
    }
  }

  const descriptors = new Map<PropertyKey, PropertyDescriptor>([["length", lengthDescriptor]]);
  for (const key of indexKeys) {
    const propertyPath = childPath(path, key);
    const descriptor = readDataDescriptor(input, key, propertyPath, true);
    descriptors.set(key, descriptor);
  }

  const snapshot: PortableJson[] = [];
  for (const key of indexKeys) {
    const descriptor = descriptors.get(key);
    if (descriptor === undefined) {
      throw new PortableJsonSnapshotError(path, "Array descriptor collection failed");
    }
    snapshot.push(snapshotValue(descriptor.value, childPath(path, key), active));
  }
  assertStableObject(input, prototype, keys, descriptors, path);
  return Object.freeze(snapshot);
}

function snapshotObject(input: object, path: string, active: WeakSet<object>): PortableJsonObject {
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype) {
    throw new PortableJsonSnapshotError(path, "Objects must use the standard Object prototype");
  }

  const keys = Reflect.ownKeys(input);
  if (keys.some((key) => typeof key === "symbol")) {
    throw new PortableJsonSnapshotError(path, "Symbol properties are not portable JSON");
  }

  const descriptors = new Map<PropertyKey, PropertyDescriptor>();
  for (const key of keys as string[]) {
    const propertyPath = childPath(path, key);
    if (UNSAFE_PROPERTY_KEYS.has(key)) {
      throw new PortableJsonSnapshotError(propertyPath, `Property key "${key}" is unsafe`);
    }
    const descriptor = readDataDescriptor(input, key, propertyPath, true);
    descriptors.set(key, descriptor);
  }

  const snapshot: PortableJsonObject = {};
  for (const key of keys as string[]) {
    const descriptor = descriptors.get(key);
    if (descriptor === undefined) {
      throw new PortableJsonSnapshotError(path, "Object descriptor collection failed");
    }
    snapshot[key] = snapshotValue(descriptor.value, childPath(path, key), active);
  }
  assertStableObject(input, prototype, keys, descriptors, path);
  return Object.freeze(snapshot);
}

function snapshotValue(input: unknown, path: string, active: WeakSet<object>): PortableJson {
  try {
    if (input === null) return null;
    if (typeof input === "string" || typeof input === "boolean") return input;
    if (typeof input === "number") {
      if (!Number.isFinite(input)) {
        throw new PortableJsonSnapshotError(path, "Numbers must be finite");
      }
      return input;
    }
    if (typeof input !== "object") {
      throw new PortableJsonSnapshotError(path, `Values of type "${typeof input}" are not JSON`);
    }
    if (active.has(input)) {
      throw new PortableJsonSnapshotError(path, "Cyclic values are not portable JSON");
    }

    active.add(input);
    try {
      return Array.isArray(input)
        ? snapshotArray(input, path, active)
        : snapshotObject(input, path, active);
    } finally {
      active.delete(input);
    }
  } catch (error) {
    if (error instanceof PortableJsonSnapshotError) throw error;
    throw new PortableJsonSnapshotError(path, "Value could not be read as stable portable JSON");
  }
}

/** Creates the single owned, immutable value used by exact config admission. */
export function createPortableJsonSnapshot(
  input: unknown,
  path: string
): PortableJsonSnapshotResult {
  try {
    return { ok: true, value: snapshotValue(input, path, new WeakSet()) };
  } catch (error) {
    if (error instanceof PortableJsonSnapshotError) {
      return { ok: false, path: error.path, message: error.message };
    }
    return { ok: false, path, message: "Value could not be read as stable portable JSON" };
  }
}
