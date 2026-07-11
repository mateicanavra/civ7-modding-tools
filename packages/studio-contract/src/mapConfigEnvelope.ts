import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

/**
 * The portable JSON boundary owned by `studio-contract`. TypeBox defines the
 * structural shape; this guard rejects runtime values that JSON Schema cannot
 * distinguish from JSON objects. Swooper owns Standard config admission and
 * defaults after this boundary has admitted a portable envelope.
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
    logPrefix: Type.Optional(Type.String({ minLength: 1 })),
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
  return isPortableJsonValue(value) && Value.Check(mapConfigEnvelopeSchema, value);
}

/**
 * Clones an admitted immutable envelope into the exact TypeBox-derived DTO the
 * oRPC transport consumes. `Value.Clone` establishes new ownership; TypeBox
 * 1.3 `Value.Parse` returns that clone unchanged when it is already valid.
 */
export function serializeMapConfigEnvelope(value: MapConfigEnvelope): MapConfigEnvelopeWire {
  return Value.Parse(mapConfigEnvelopeSchema, Value.Clone(value));
}

/**
 * Checks the runtime half of the portable JSON contract. TypeBox's recursive
 * `Type.Record` supplies only the structural half and accepts exotic objects.
 */
export function isPortableJsonValue(
  value: unknown,
  ancestors = new Set<object>()
): value is JsonWireValue {
  try {
    if (value === null || typeof value === "string" || typeof value === "boolean") return true;
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value !== "object") return false;
    if (ancestors.has(value)) return false;

    ancestors.add(value);
    try {
      return Array.isArray(value)
        ? isPortableJsonArray(value, ancestors)
        : isPortableJsonObject(value, ancestors);
    } finally {
      ancestors.delete(value);
    }
  } catch {
    return false;
  }
}

/** Admits, clones, and recursively freezes a portable JSON envelope. */
export function snapshotMapConfigEnvelope(value: unknown): MapConfigEnvelope | undefined {
  if (!isMapConfigEnvelope(value)) return undefined;

  return freezeSnapshot(serializeMapConfigEnvelope(value));
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

function isPortableJsonArray(value: readonly unknown[], ancestors: Set<object>): boolean {
  if (Object.getPrototypeOf(value) !== Array.prototype) return false;

  const keys = Reflect.ownKeys(value);
  for (const key of keys) {
    if (typeof key === "symbol") return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !("value" in descriptor)) return false;
    if (key === "length") continue;
    if (!isArrayIndex(key, value.length) || !descriptor.enumerable) return false;
  }

  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (descriptor === undefined || !("value" in descriptor) || !descriptor.enumerable)
      return false;
    if (!isPortableJsonValue(descriptor.value, ancestors)) return false;
  }
  return true;
}

function isPortableJsonObject(value: object, ancestors: Set<object>): boolean {
  if (!isPlainJsonObject(value)) return false;

  for (const key of Reflect.ownKeys(value)) {
    if (typeof key === "symbol") return false;
    if (isUnsafeJsonKey(key)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !("value" in descriptor) || !descriptor.enumerable)
      return false;
    if (!isPortableJsonValue(descriptor.value, ancestors)) return false;
  }
  return true;
}

/** Keys with prototype semantics are rejected before TypeBox inspects the value. */
function isUnsafeJsonKey(key: string): boolean {
  return key === "__proto__" || key === "prototype" || key === "constructor";
}

function isPlainJsonObject(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isArrayIndex(key: string, length: number): boolean {
  if (!/^(?:0|[1-9]\d*)$/.test(key)) return false;
  const index = Number(key);
  return Number.isSafeInteger(index) && index < length;
}
