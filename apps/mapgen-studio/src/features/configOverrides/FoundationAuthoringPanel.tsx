import { useMemo } from "react";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { SchemaForm } from "./SchemaForm";
import { collectTransparentPaths, normalizeSchemaForRjsf, toRjsfSchema } from "./schemaPresentation";

type FoundationAuthoringPanelProps = Readonly<{
  schema: unknown;
  value: unknown;
  onChange(next: unknown): void;
  disabled: boolean;
}>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function tryGetSchemaAtPath(schema: unknown, path: readonly string[]): unknown | null {
  let current: unknown = schema;
  for (const segment of path) {
    if (!current || typeof current !== "object") return null;
    const node = current as Record<string, unknown>;
    const properties = node.properties;
    if (properties && typeof properties === "object" && segment in (properties as Record<string, unknown>)) {
      current = (properties as Record<string, unknown>)[segment];
      continue;
    }

    const anyOf = node.anyOf;
    const oneOf = node.oneOf;
    const variants = (Array.isArray(anyOf) ? anyOf : Array.isArray(oneOf) ? oneOf : null) as unknown[] | null;
    if (variants) {
      const match = variants.find((variant) => {
        if (!variant || typeof variant !== "object") return false;
        const vProps = (variant as Record<string, unknown>).properties;
        return Boolean(vProps && typeof vProps === "object" && segment in (vProps as Record<string, unknown>));
      });
      if (match) {
        const vProps = (match as Record<string, unknown>).properties as Record<string, unknown>;
        current = vProps[segment];
        continue;
      }
    }

    return null;
  }
  return current;
}

const FOUNDATION_PATH = ["foundation"] as const;

export function FoundationAuthoringPanel(props: FoundationAuthoringPanelProps) {
  const { schema, value, onChange, disabled } = props;
  const resolved = useMemo(() => {
    try {
      const normalized = normalizeSchemaForRjsf(schema);
      const root = toRjsfSchema(normalized);
      const foundationSchema = tryGetSchemaAtPath(root, FOUNDATION_PATH);
      if (!foundationSchema || typeof foundationSchema !== "object") return null;
      const rjsfSchema = foundationSchema as RJSFSchema;
      return {
        schema: rjsfSchema,
        formContext: { transparentPaths: collectTransparentPaths(rjsfSchema) },
      };
    } catch (error) {
      console.error("[mapgen-studio] failed to resolve foundation authoring schema", error);
      return null;
    }
  }, [schema]);

  const uiSchema = useMemo<UiSchema<unknown, RJSFSchema, { transparentPaths: ReadonlySet<string> }>>(
    () => ({
      "ui:options": { label: false },
    }),
    []
  );

  if (!resolved) {
    return (
      <div className="text-[11px] text-[#a1a1aa]">
        Foundation authoring schema unavailable. Run the pipeline build to regenerate studio artifacts.
      </div>
    );
  }

  const formValue = isPlainObject(value) ? value : {};

  return (
    <SchemaForm
      schema={resolved.schema}
      uiSchema={uiSchema}
      formContext={resolved.formContext}
      value={formValue}
      disabled={disabled}
      onChange={(next) => {
        onChange(isPlainObject(next) ? next : {});
      }}
    />
  );
}
