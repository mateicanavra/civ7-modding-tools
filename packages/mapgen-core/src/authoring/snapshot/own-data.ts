/** One own enumerable data entry captured without invoking caller accessors. */
export type OwnDataEntry<Value = unknown> = Readonly<{ key: string; value: Value }>;

/** An immutable descriptor snapshot of one string-keyed authoring map. */
export type OwnDataRecord<Value = unknown> = readonly OwnDataEntry<Value>[];

/**
 * Captures a dense array through own data descriptors without invoking indexed accessors.
 * The returned snapshot excludes caller-owned array metadata so tuple cardinality and order
 * cannot change while an authoring factory establishes canonical authority.
 */
export function captureOwnDataArray<Value = unknown>(
  input: unknown,
  label: string
): readonly Value[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array`);
  }

  const lengthDescriptor = Object.getOwnPropertyDescriptor(input, "length");
  if (
    !lengthDescriptor ||
    !("value" in lengthDescriptor) ||
    !Number.isSafeInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < 0
  ) {
    throw new TypeError(`${label} must own a non-negative safe integer length data property`);
  }
  const length = lengthDescriptor.value;
  if (Reflect.ownKeys(input).length !== length + 1) {
    throw new TypeError(`${label} must be a dense array without extra keys`);
  }

  const values: Value[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      throw new TypeError(`${label} at index ${index} must be an enumerable data property`);
    }
    values.push(descriptor.value as Value);
  }
  return Object.freeze(values);
}

/** Captures one string-keyed map through exactly one descriptor read per property. */
export function captureOwnDataRecord<Value = unknown>(
  input: unknown,
  label: string
): OwnDataRecord<Value> {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError(`${label} must be an object`);
  }
  const entries: OwnDataEntry<Value>[] = [];
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== "string") throw new TypeError(`${label} keys must be strings`);
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      throw new TypeError(`${label} key "${key}" must be an own enumerable data property`);
    }
    entries.push(Object.freeze({ key, value: descriptor.value as Value }));
  }
  return Object.freeze(entries);
}

/** Materializes a captured map without restoring object-prototype infrastructure. */
export function materializeOwnDataRecord<Value>(
  entries: OwnDataRecord<Value>
): Readonly<Record<string, Value>> {
  const result = Object.create(null) as Record<string, Value>;
  for (const { key, value } of entries) result[key] = value;
  return Object.freeze(result);
}

/** Aligns a candidate map to canonical authority order while refusing missing or extra keys. */
export function alignOwnDataRecords<Authority, Candidate>(
  authority: OwnDataRecord<Authority>,
  candidate: OwnDataRecord<Candidate>,
  label: string
): readonly Readonly<{ key: string; authority: Authority; candidate: Candidate }>[] {
  const remaining = new Map(candidate.map((entry) => [entry.key, entry.value]));
  const aligned = authority.map(({ key, value }) => {
    if (!remaining.has(key)) throw new Error(`${label} is missing "${key}"`);
    const entry = Object.freeze({ key, authority: value, candidate: remaining.get(key)! });
    remaining.delete(key);
    return entry;
  });
  const [extra] = remaining.keys();
  if (extra !== undefined) throw new Error(`${label} has unknown "${extra}"`);
  return Object.freeze(aligned);
}
