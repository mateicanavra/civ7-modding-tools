import { useMemo } from "react";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { SchemaForm } from "./SchemaForm";
import {
  collectTransparentPaths,
  normalizeSchemaForRjsf,
  toRjsfSchema,
  tryGetSchemaAtPath,
} from "./schemaPresentation";
import type { BrowserConfigFormContext } from "./rjsfTemplates";
import { getAtPath, setAtPath } from "./pathUtils";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

type ResolvedSchema = Readonly<{
  schema: RJSFSchema;
  formContext: BrowserConfigFormContext;
}>;

type FocusView<TConfig> = Readonly<{
  resolved: ResolvedSchema;
  formValue: unknown;
  mergeBack(nextFormValue: unknown): TConfig;
}>;

export type SchemaConfigFormProps<TConfig> = Readonly<{
  schema: unknown;
  value: TConfig;
  onChange(next: TConfig): void;
  disabled: boolean;
  focusPath?: readonly string[] | null;
}>;

export function SchemaConfigForm<TConfig>(props: SchemaConfigFormProps<TConfig>) {
  const { schema, value, onChange, disabled, focusPath } = props;

  const resolved = useMemo<ResolvedSchema | null>(() => {
    try {
      const normalized = normalizeSchemaForRjsf(schema);
      const root = toRjsfSchema(normalized);
      return { schema: root, formContext: { transparentPaths: collectTransparentPaths(root) } };
    } catch (error) {
      console.error("[mapgen-studio] failed to resolve config schema", error);
      return null;
    }
  }, [schema]);

  const focusView = useMemo<FocusView<TConfig> | null>(() => {
    if (!resolved || !focusPath || focusPath.length === 0) return null;

    const focusSchema = tryGetSchemaAtPath(resolved.schema, focusPath);
    if (!focusSchema || typeof focusSchema !== "object") return null;

    const focusValue = getAtPath(value, focusPath);
    const focusKey = focusPath[0];
    const isSingleStage = focusPath.length === 1 && typeof focusKey === "string";
    const baseFormValue = isPlainObject(focusValue) ? focusValue : {};

    if (isSingleStage) {
      const wrappedSchema: RJSFSchema = {
        type: "object",
        properties: { [focusKey]: focusSchema as RJSFSchema },
        required: [focusKey],
      };
      const wrappedValue = { [focusKey]: baseFormValue };
      return {
        resolved: {
          schema: wrappedSchema,
          formContext: { transparentPaths: collectTransparentPaths(wrappedSchema) },
        },
        formValue: wrappedValue,
        mergeBack: (nextFormValue: unknown) => {
          const nextObj = isPlainObject(nextFormValue) ? (nextFormValue as Record<string, unknown>) : {};
          const nextStage = isPlainObject(nextObj[focusKey]) ? nextObj[focusKey] : {};
          return setAtPath(value, [focusKey], nextStage) as TConfig;
        },
      };
    }

    return {
      resolved: {
        schema: focusSchema as RJSFSchema,
        formContext: { transparentPaths: collectTransparentPaths(focusSchema as RJSFSchema) },
      },
      formValue: baseFormValue,
      mergeBack: (nextFormValue: unknown) => {
        const nextValue = isPlainObject(nextFormValue) ? nextFormValue : {};
        return setAtPath(value, focusPath, nextValue) as TConfig;
      },
    };
  }, [resolved, focusPath, value]);

  const uiSchema = useMemo<UiSchema<TConfig, RJSFSchema, BrowserConfigFormContext>>(
    () => ({
      "ui:options": { label: false },
    }),
    []
  );

  if (!resolved) {
    return (
      <div className="text-[11px] text-[#a1a1aa]">
        Config schema unavailable. Run the pipeline build to regenerate studio artifacts.
      </div>
    );
  }

  const active = focusView ?? {
    resolved,
    formValue: value,
    mergeBack: (nextFormValue: unknown) => (nextFormValue as TConfig),
  };

  return (
    <SchemaForm
      schema={active.resolved.schema}
      uiSchema={uiSchema}
      formContext={active.resolved.formContext}
      value={active.formValue as TConfig}
      disabled={disabled}
      onChange={(next) => {
        onChange(active.mergeBack(next));
      }}
    />
  );
}
