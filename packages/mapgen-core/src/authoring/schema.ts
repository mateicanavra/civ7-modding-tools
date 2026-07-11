import { type TSchema, Type } from "typebox";

import type { DomainOpSchema } from "./op/schema.js";

type SchemaNode = TSchema & {
  type?: string;
  properties?: Record<string, TSchema>;
  items?: TSchema | TSchema[];
  anyOf?: TSchema[];
  oneOf?: TSchema[];
  allOf?: TSchema[];
  not?: TSchema;
  additionalProperties?: boolean | TSchema;
};

function enforceSchemaConventions(schema: TSchema, path: string): void {
  const typed = schema as SchemaNode;
  if (typed.type === "object") {
    const props = typed.properties ?? {};
    if (typed.additionalProperties === undefined) {
      typed.additionalProperties = false;
    }
    for (const [key, propSchema] of Object.entries(props)) {
      enforceSchemaConventions(propSchema, `${path}.${key}`);
    }
  }

  if (typed.items) {
    const items = Array.isArray(typed.items) ? typed.items : [typed.items];
    items.forEach((item, index) => enforceSchemaConventions(item, `${path}[${index}]`));
  }
  if (Array.isArray(typed.anyOf)) {
    typed.anyOf.forEach((item, index) => enforceSchemaConventions(item, `${path}.anyOf[${index}]`));
  }
  if (Array.isArray(typed.oneOf)) {
    typed.oneOf.forEach((item, index) => enforceSchemaConventions(item, `${path}.oneOf[${index}]`));
  }
  if (Array.isArray(typed.allOf)) {
    typed.allOf.forEach((item, index) => enforceSchemaConventions(item, `${path}.allOf[${index}]`));
  }
  if (typed.not) {
    enforceSchemaConventions(typed.not, `${path}.not`);
  }
}

export function applySchemaConventions(schema: TSchema, path: string): TSchema {
  enforceSchemaConventions(schema, path);
  return schema;
}

/**
 * Helper to define the canonical op schema bundle shape: `Type.Object({ input, config, output })`.
 *
 * TypeBox object inference can be lossy across package boundaries. This helper pins the schema's
 * TypeScript type so callers can reuse `schema.properties.*` without re-exporting per-sub-schema
 * types.
 */
export function defineOpSchema<
  const InputSchema extends TSchema,
  const ConfigSchema extends TSchema,
  const OutputSchema extends TSchema,
>(
  schemas: Readonly<{ input: InputSchema; config: ConfigSchema; output: OutputSchema }>,
  options?: Record<string, unknown>
): DomainOpSchema<InputSchema, ConfigSchema, OutputSchema> {
  return Type.Object(schemas as any, options as any) as any;
}
