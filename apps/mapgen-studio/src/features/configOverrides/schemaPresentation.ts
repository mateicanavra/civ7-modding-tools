import type { RJSFSchema } from "@rjsf/utils";

export type BrowserConfigSchemaDef = RJSFSchema | boolean;

export function schemaIsGroup(schema: BrowserConfigSchemaDef | undefined): boolean {
  if (!schema || typeof schema === "boolean") return false;
  if (schema.type === "object" || schema.type === "array") return true;
  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function assertIsRjsfSchema(schema: unknown): asserts schema is RJSFSchema {
  if (!isPlainObject(schema)) throw new Error("Invalid config schema: expected object");
  const type = schema.type;
  if (type !== "object") throw new Error(`Invalid config schema: expected type "object", got ${String(type)}`);
}

function normalizeScalarAnyOfEnumLike(schema: Record<string, unknown>): Record<string, unknown> | null {
  const anyOf = schema.anyOf;
  if (!Array.isArray(anyOf) || anyOf.length === 0) return null;

  const constValues: unknown[] = [];
  let detectedType: string | null = null;

  for (const option of anyOf) {
    if (!isPlainObject(option)) return null;
    if (!("const" in option)) return null;
    constValues.push((option as Record<string, unknown>).const);

    const optionType = (option as Record<string, unknown>).type;
    if (typeof optionType === "string") {
      if (detectedType == null) detectedType = optionType;
      if (detectedType !== optionType) return null;
    }
  }

  const unique = [...new Set(constValues.map((v) => JSON.stringify(v)))].map((s) => JSON.parse(s) as unknown);
  if (unique.length !== constValues.length) return null;

  const inferred = detectedType
    ? detectedType
    : unique.every((v) => typeof v === "string")
      ? "string"
      : unique.every((v) => typeof v === "number" && Number.isFinite(v))
        ? "number"
        : unique.every((v) => typeof v === "boolean")
          ? "boolean"
          : null;
  if (!inferred) return null;

  const normalized: Record<string, unknown> = { ...schema, type: inferred, enum: unique };
  delete normalized.anyOf;
  return normalized;
}

function normalizeScalarOneOfEnumLike(schema: Record<string, unknown>): Record<string, unknown> | null {
  const oneOf = schema.oneOf;
  if (!Array.isArray(oneOf) || oneOf.length === 0) return null;

  const constValues: unknown[] = [];
  let detectedType: string | null = null;

  for (const option of oneOf) {
    if (!isPlainObject(option)) return null;
    if (!("const" in option)) return null;
    constValues.push((option as Record<string, unknown>).const);

    const optionType = (option as Record<string, unknown>).type;
    if (typeof optionType === "string") {
      if (detectedType == null) detectedType = optionType;
      if (detectedType !== optionType) return null;
    }
  }

  const unique = [...new Set(constValues.map((v) => JSON.stringify(v)))].map((s) => JSON.parse(s) as unknown);
  if (unique.length !== constValues.length) return null;

  const inferred = detectedType
    ? detectedType
    : unique.every((v) => typeof v === "string")
      ? "string"
      : unique.every((v) => typeof v === "number" && Number.isFinite(v))
        ? "number"
        : unique.every((v) => typeof v === "boolean")
          ? "boolean"
          : null;
  if (!inferred) return null;

  const normalized: Record<string, unknown> = { ...schema, type: inferred, enum: unique };
  delete normalized.oneOf;
  return normalized;
}

function normalizeScalarConstEnumLike(schema: Record<string, unknown>): Record<string, unknown> | null {
  if (!("const" in schema)) return null;
  const value = schema.const;
  const t = schema.type;
  const inferred =
    typeof t === "string"
      ? t
      : typeof value === "string"
        ? "string"
        : typeof value === "number" && Number.isFinite(value)
          ? "number"
          : typeof value === "boolean"
            ? "boolean"
            : null;
  if (!inferred) return null;
  const normalized: Record<string, unknown> = { ...schema, type: inferred, enum: [value], default: schema.default ?? value };
  // Keep the value visible but prevent confusing free-text editing.
  normalized.readOnly = true;
  delete normalized.const;
  return normalized;
}

function normalizeSingleVariantUnion(schema: Record<string, unknown>): Record<string, unknown> | null {
  const anyOf = schema.anyOf;
  if (Array.isArray(anyOf) && anyOf.length === 1 && isPlainObject(anyOf[0])) {
    const base: Record<string, unknown> = { ...schema };
    delete base.anyOf;
    const option = anyOf[0] as Record<string, unknown>;
    // Preserve top-level titles/descriptions while removing the pointless “Option 1” selector.
    return { ...option, ...base };
  }
  const oneOf = schema.oneOf;
  if (Array.isArray(oneOf) && oneOf.length === 1 && isPlainObject(oneOf[0])) {
    const base: Record<string, unknown> = { ...schema };
    delete base.oneOf;
    const option = oneOf[0] as Record<string, unknown>;
    return { ...option, ...base };
  }
  return null;
}

export function normalizeSchemaForRjsf(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(normalizeSchemaForRjsf);
  if (!isPlainObject(schema)) return schema;

  const normalizedAnyOf = normalizeScalarAnyOfEnumLike(schema);
  const normalizedOneOf = normalizedAnyOf ? null : normalizeScalarOneOfEnumLike(schema);
  const normalizedConst = normalizedAnyOf || normalizedOneOf ? null : normalizeScalarConstEnumLike(schema);
  const normalizedSingle = normalizedAnyOf || normalizedOneOf || normalizedConst ? null : normalizeSingleVariantUnion(schema);
  const base = normalizedAnyOf ?? normalizedOneOf ?? normalizedConst ?? normalizedSingle ?? schema;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(base)) {
    out[k] = normalizeSchemaForRjsf(v);
  }
  return out;
}

export function toRjsfSchema(schema: unknown): RJSFSchema {
  assertIsRjsfSchema(schema);
  return schema;
}

export function pathToPointer(path: Array<string | number>): string {
  if (!path.length) return "";
  const parts = path.map((p) => String(p).replace(/~/g, "~0").replace(/\//g, "~1"));
  return `/${parts.join("/")}`;
}

export function collectTransparentPaths(schema: RJSFSchema): ReadonlySet<string> {
  const out = new Set<string>();

  const visit = (node: BrowserConfigSchemaDef | undefined, path: Array<string | number>): void => {
    if (!node || typeof node === "boolean") return;

    const nodeAnyOf = node.anyOf;
    if (Array.isArray(nodeAnyOf)) {
      for (const opt of nodeAnyOf) visit(opt as BrowserConfigSchemaDef, path);
    }
    const nodeOneOf = node.oneOf;
    if (Array.isArray(nodeOneOf)) {
      for (const opt of nodeOneOf) visit(opt as BrowserConfigSchemaDef, path);
    }
    const nodeAllOf = node.allOf;
    if (Array.isArray(nodeAllOf)) {
      for (const opt of nodeAllOf) visit(opt as BrowserConfigSchemaDef, path);
    }

    if (node.type === "array") {
      const items = node.items;
      if (Array.isArray(items)) {
        for (const opt of items) visit(opt as BrowserConfigSchemaDef, path);
      } else {
        visit(items as BrowserConfigSchemaDef, path);
      }
      return;
    }

    if (node.type !== "object") return;
    const props = node.properties;
    if (!props) return;

    const propKeys = Object.keys(props);
    // Never collapse the very top-level wrapper: we want the stage container visible.
    // to remain visible even when there's only one stage in the schema.
    if (path.length > 0 && propKeys.length === 1 && node.description == null) {
      const onlyKey = propKeys[0]!;
      const child = (props as Record<string, BrowserConfigSchemaDef>)[onlyKey];
      if (schemaIsGroup(child) && typeof child !== "boolean" && child.description == null) {
        // Collapse a single-child wrapper by hiding the only child object header. This keeps
        // the parent title (e.g. “Mesh”) while removing redundant middle layers (e.g. “Compute Mesh”).
        out.add(pathToPointer([...path, onlyKey]));
      }
    }

    for (const key of propKeys) {
      visit((props as Record<string, BrowserConfigSchemaDef>)[key], [...path, key]);
    }
  };

  visit(schema, []);
  return out;
}
