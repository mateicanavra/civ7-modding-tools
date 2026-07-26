/** One own enumerable data entry captured without invoking caller accessors. */
export type OwnDataEntry<Value = unknown> = Readonly<{ key: string; value: Value }>;

/** An immutable descriptor snapshot of one string-keyed authoring map. */
export type OwnDataRecord<Value = unknown> = readonly OwnDataEntry<Value>[];

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
