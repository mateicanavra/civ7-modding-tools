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
