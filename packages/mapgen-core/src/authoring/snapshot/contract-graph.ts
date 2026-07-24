type SnapshotState = Readonly<{
  active: WeakSet<object>;
  snapshots: WeakMap<object, object>;
}>;

type SnapshotOptions = Readonly<{
  preserve?: (value: object) => boolean;
}>;

/**
 * Detaches plain contract/schema data while borrowing executable callback identity.
 * Caller-owned graphs remain mutable; admitted authority can be frozen independently.
 */
export function snapshotContractGraph(
  value: unknown,
  location: string,
  options: SnapshotOptions = {},
  state: SnapshotState = {
    active: new WeakSet<object>(),
    snapshots: new WeakMap<object, object>(),
  }
): unknown {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) return value;
  if (typeof value === "function") return value;
  if (options.preserve?.(value)) return value;
  if (state.active.has(value)) {
    throw new TypeError(`${location} must not contain cyclic schema metadata`);
  }
  const existing = state.snapshots.get(value);
  if (existing) return existing;

  const isArray = Array.isArray(value);
  const prototype = Object.getPrototypeOf(value);
  const expectedPrototype = isArray ? Array.prototype : Object.prototype;
  if (prototype !== expectedPrototype && prototype !== null) {
    throw new TypeError(
      `${location} must contain only plain schema data; mutable object instances are unsupported`
    );
  }

  const snapshot: object = isArray ? [] : Object.create(prototype);
  state.active.add(value);
  state.snapshots.set(value, snapshot);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new TypeError(`${location} must contain data properties only`);
    }
    const child = `${location}${typeof key === "symbol" ? `[${String(key)}]` : `.${key}`}`;
    Object.defineProperty(snapshot, key, {
      ...descriptor,
      value: snapshotContractGraph(descriptor.value, child, options, state),
    });
  }
  state.active.delete(value);
  return snapshot;
}

/** Deep-freezes one admitted contract graph without invoking accessors. */
export function freezeContractGraph(value: unknown, seen = new WeakSet<object>()): void {
  if (value === null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new TypeError("contract graphs must contain data properties only");
    }
    freezeContractGraph(descriptor.value, seen);
  }
  Object.freeze(value);
}
