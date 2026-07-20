import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

/**
 * The portable JSON boundary owned by `studio-contract`. TypeBox defines the
 * structural shape; this guard rejects runtime values that JSON Schema cannot
 * distinguish from JSON objects. Swooper owns Standard config admission after
 * this boundary has admitted a portable envelope.
 */
export type DeepReadonly<Value> = Value extends (...args: never[]) => unknown
  ? Value
  : Value extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : Value extends object
      ? { readonly [Key in keyof Value]: DeepReadonly<Value[Key]> }
      : Value;

export const jsonWireValueSchema = Type.Cyclic(
  {
    JsonWireValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("JsonWireValue")),
      Type.Record(Type.String(), Type.Ref("JsonWireValue")),
    ]),
  },
  "JsonWireValue"
);

export const jsonWireObjectSchema = Type.Record(Type.String(), jsonWireValueSchema);

/** Mutable JSON values at a TypeBox transport boundary. */
export type JsonWireValue = Static<typeof jsonWireValueSchema>;
export type JsonWireObject = Static<typeof jsonWireObjectSchema>;

/**
 * Canonical config ids are stable filename/localization identities, not paths.
 * Lowercase kebab-case keeps the same value safe in `<id>.config.json` and
 * localization keys without normalization or platform-specific separators.
 */
export const MAP_CONFIG_ID_PATTERN = "^[a-z0-9]+(?:-[a-z0-9]+)*$" as const;
export const MAP_CONFIG_ID_MAX_LENGTH = 96;
export const mapConfigIdSchema = Type.String({
  minLength: 1,
  maxLength: MAP_CONFIG_ID_MAX_LENGTH,
  pattern: MAP_CONFIG_ID_PATTERN,
});
export type MapConfigId = Static<typeof mapConfigIdSchema>;

export function isMapConfigId(value: unknown): value is MapConfigId {
  return Value.Check(mapConfigIdSchema, value);
}

export const mapConfigEnvelopeSchema = Type.Object(
  {
    id: mapConfigIdSchema,
    name: Type.String({ minLength: 1 }),
    description: Type.String({ minLength: 1 }),
    recipe: Type.String({ minLength: 1 }),
    sortIndex: Type.Integer(),
    latitudeBounds: Type.Object(
      {
        topLatitude: Type.Number(),
        bottomLatitude: Type.Number(),
      },
      { additionalProperties: false }
    ),
    config: jsonWireObjectSchema,
  },
  { additionalProperties: false }
);

/** The mutable JSON DTO TypeBox derives for oRPC and other transport consumers. */
export type MapConfigEnvelopeWire = Static<typeof mapConfigEnvelopeSchema>;

/** The immutable envelope snapshot retained by Studio and the runtime. */
export type MapConfigEnvelope = DeepReadonly<MapConfigEnvelopeWire>;

/**
 * Structural admission for mutable wire input. Call `snapshotMapConfigEnvelope`
 * before retaining a value across an asynchronous or domain boundary.
 */
export function isMapConfigEnvelope(value: unknown): value is MapConfigEnvelopeWire {
  const snapshot = clonePortableJsonValueSafely(value);
  return snapshot !== undefined && Value.Check(mapConfigEnvelopeSchema, snapshot);
}

/**
 * Clones an admitted immutable envelope into the exact TypeBox-derived DTO the
 * oRPC transport consumes. Cloning establishes new ownership; assertion only
 * validates the clone and cannot default, clean, repair, or otherwise rewrite it.
 */
export function serializeMapConfigEnvelope(value: MapConfigEnvelope): MapConfigEnvelopeWire {
  const clone = Value.Clone(value);
  Value.Assert(mapConfigEnvelopeSchema, clone);
  return clone;
}

/**
 * Checks the runtime half of the portable JSON contract. TypeBox's recursive
 * `Type.Record` supplies only the structural half and accepts exotic objects.
 */
export function isPortableJsonValue(value: unknown): value is JsonWireValue {
  return clonePortableJsonValueSafely(value) !== undefined;
}

/** Admits an exact portable JSON value into an independently owned immutable snapshot. */
export function snapshotPortableJsonValue<Value extends JsonWireValue>(
  value: Value
): DeepReadonly<Value> | undefined;
export function snapshotPortableJsonValue(value: unknown): DeepReadonly<JsonWireValue> | undefined;
export function snapshotPortableJsonValue(value: unknown): DeepReadonly<JsonWireValue> | undefined {
  const snapshot = clonePortableJsonValueSafely(value);

  return snapshot === undefined ? undefined : freezeSnapshot(snapshot);
}

/** Admits, clones, and recursively freezes a portable JSON envelope. */
export function snapshotMapConfigEnvelope(value: unknown): MapConfigEnvelope | undefined {
  const snapshot = clonePortableJsonValueSafely(value);

  return snapshot !== undefined && Value.Check(mapConfigEnvelopeSchema, snapshot)
    ? freezeSnapshot(snapshot)
    : undefined;
}

/** Recursively freezes a newly-created snapshot. It intentionally does not clone. */
export function freezeSnapshot<Value>(value: Value): DeepReadonly<Value> {
  if (value === null || typeof value !== "object") return value as DeepReadonly<Value>;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor !== undefined && "value" in descriptor) freezeSnapshot(descriptor.value);
  }
  return Object.freeze(value) as DeepReadonly<Value>;
}

function clonePortableJsonValueSafely(value: unknown): JsonWireValue | undefined {
  try {
    return clonePortableJsonValue(
      value,
      new Set<object>(),
      new WeakMap<object, JsonWireObject | JsonWireValue[]>()
    );
  } catch {
    return undefined;
  }
}

function clonePortableJsonValue(
  value: unknown,
  ancestors: Set<object>,
  snapshots: WeakMap<object, JsonWireObject | JsonWireValue[]>
): JsonWireValue | undefined {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "object" || ancestors.has(value)) return undefined;
  const existingSnapshot = snapshots.get(value);
  if (existingSnapshot !== undefined) return existingSnapshot;

  ancestors.add(value);
  try {
    const snapshot = Array.isArray(value)
      ? clonePortableJsonArray(value, ancestors, snapshots)
      : clonePortableJsonObject(value, ancestors, snapshots);
    if (snapshot !== undefined) snapshots.set(value, snapshot);
    return snapshot;
  } finally {
    ancestors.delete(value);
  }
}

function clonePortableJsonArray(
  value: readonly unknown[],
  ancestors: Set<object>,
  snapshots: WeakMap<object, JsonWireObject | JsonWireValue[]>
): JsonWireValue[] | undefined {
  if (Object.getPrototypeOf(value) !== Array.prototype) return undefined;

  const keys = Reflect.ownKeys(value);
  const indexedValues = new Map<number, unknown>();
  let length: number | undefined;

  for (const key of keys) {
    if (typeof key === "symbol") return undefined;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !("value" in descriptor)) return undefined;

    const propertyValue: unknown = descriptor.value;
    if (key === "length") {
      if (
        length !== undefined ||
        descriptor.enumerable ||
        typeof propertyValue !== "number" ||
        !Number.isInteger(propertyValue) ||
        propertyValue < 0 ||
        propertyValue > 0xffff_ffff
      ) {
        return undefined;
      }
      length = propertyValue;
      continue;
    }

    if (!descriptor.enumerable || !isArrayIndex(key)) return undefined;
    const index = Number(key);
    if (indexedValues.has(index)) return undefined;
    indexedValues.set(index, propertyValue);
  }

  if (length === undefined || indexedValues.size !== length) return undefined;

  const snapshot: JsonWireValue[] = [];
  for (let index = 0; index < length; index += 1) {
    if (!indexedValues.has(index)) return undefined;
    const itemSnapshot = clonePortableJsonValue(indexedValues.get(index), ancestors, snapshots);
    if (itemSnapshot === undefined) return undefined;
    snapshot.push(itemSnapshot);
  }
  return snapshot;
}

function clonePortableJsonObject(
  value: object,
  ancestors: Set<object>,
  snapshots: WeakMap<object, JsonWireObject | JsonWireValue[]>
): JsonWireObject | undefined {
  if (!isPlainJsonObject(value)) return undefined;

  const properties: { key: string; value: unknown }[] = [];

  for (const key of Reflect.ownKeys(value)) {
    if (typeof key === "symbol" || isUnsafeJsonKey(key)) return undefined;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !("value" in descriptor) || !descriptor.enumerable)
      return undefined;
    const propertyValue: unknown = descriptor.value;
    properties.push({ key, value: propertyValue });
  }

  const snapshot: JsonWireObject = {};
  for (const property of properties) {
    const propertySnapshot = clonePortableJsonValue(property.value, ancestors, snapshots);
    if (propertySnapshot === undefined) return undefined;
    Object.defineProperty(snapshot, property.key, {
      configurable: true,
      enumerable: true,
      value: propertySnapshot,
      writable: true,
    });
  }
  return snapshot;
}

/** Keys with prototype semantics are rejected before TypeBox inspects the value. */
function isUnsafeJsonKey(key: string): boolean {
  return key === "__proto__" || key === "prototype" || key === "constructor";
}

function isPlainJsonObject(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isArrayIndex(key: string): boolean {
  if (!/^(?:0|[1-9]\d*)$/.test(key)) return false;
  const index = Number(key);
  return Number.isSafeInteger(index) && index < 0xffff_ffff;
}
