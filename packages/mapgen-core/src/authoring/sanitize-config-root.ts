function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Preset/authoring files may include JSON Schema metadata like `$schema` at the root for editor support.
 * Mapgen's config normalization is strict about unknown keys, so strip schema metadata before validation.
 *
 * Root-only, non-recursive by design.
 */
export function stripSchemaMetadataRoot(value: unknown): unknown {
  if (!isPlainObject(value)) return value;
  if (!("$schema" in value) && !("$id" in value) && !("$comment" in value)) return value;
  const { $schema: _schema, $id: _id, $comment: _comment, ...rest } = value;
  return rest;
}

