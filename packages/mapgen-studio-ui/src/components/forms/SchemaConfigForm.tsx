import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useMemo } from "react";
import type { XSchema } from "typebox/schema";
import { getAtPath, setAtPath } from "./pathUtils.js";
import type { BrowserConfigFormContext, ConfigCollapseContext } from "./rjsfTemplates.js";
import { SchemaForm } from "./SchemaForm.js";
import {
  collectTransparentPaths,
  normalizeSchemaForRjsf,
  toRjsfSchema,
  tryGetSchemaAtPath,
} from "./schemaPresentation.js";

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
  schema: XSchema;
  value: TConfig;
  onChange(next: TConfig): void;
  disabled: boolean;
  focusPath?: readonly string[] | null;
  /**
   * Collapse state for config objects (Pass-4 config-collapse spec).
   * Omitted ⇒ the form renders fully expanded with no disclosure chrome.
   */
  collapse?: ConfigCollapseContext;
  /**
   * Scoped stage-reset request (flat-and-flush delta 5). Omitted ⇒ stage
   * headers render no Reset action.
   */
  onStageResetRequest?: (pointer: string, label: string) => void;
}>;

export function SchemaConfigForm<TConfig>(props: SchemaConfigFormProps<TConfig>) {
  const { schema, value, onChange, disabled, focusPath, collapse, onStageResetRequest } = props;

  const buildUiSchema = useMemo(() => {
    const hasEnum = (node: RJSFSchema): boolean => Array.isArray(node.enum) && node.enum.length > 0;

    const hasEnumItems = (node: RJSFSchema): boolean => {
      if (node.type !== "array") return false;
      const items = node.items;
      if (!items || Array.isArray(items) || typeof items !== "object") return false;
      return hasEnum(items as RJSFSchema);
    };

    const visit = (node: RJSFSchema): UiSchema<unknown, RJSFSchema, BrowserConfigFormContext> => {
      const out: UiSchema<unknown, RJSFSchema, BrowserConfigFormContext> = {};

      if (node.type === "boolean") {
        out["ui:widget"] = "switch";
      } else if (hasEnum(node)) {
        out["ui:widget"] = "select";
      } else if (hasEnumItems(node)) {
        out["ui:widget"] = "tagSelect";
      } else if (node.type === "string") {
        const format = typeof node.format === "string" ? node.format : null;
        const maxLength = typeof node.maxLength === "number" ? node.maxLength : null;
        if (format === "textarea" || (maxLength != null && maxLength >= 160)) {
          out["ui:widget"] = "textarea";
        }
      }

      if (node.type === "array") {
        const items = node.items;
        if (items && !Array.isArray(items) && typeof items === "object") {
          out.items = visit(items as RJSFSchema);
        }
      }

      if (node.type === "object" && node.properties && typeof node.properties === "object") {
        for (const [key, child] of Object.entries(node.properties)) {
          if (!child || typeof child !== "object") continue;
          out[key] = visit(child as RJSFSchema);
        }
      }

      return out;
    };

    return (schemaNode: RJSFSchema) => ({
      ...visit(schemaNode),
      "ui:options": { label: false },
    });
  }, []);

  const resolved = useMemo<ResolvedSchema | null>(() => {
    try {
      const normalized = normalizeSchemaForRjsf(schema);
      const root = toRjsfSchema(normalized);
      return {
        schema: root,
        formContext: { transparentPaths: collectTransparentPaths(root) },
      };
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
          const nextObj = isPlainObject(nextFormValue)
            ? (nextFormValue as Record<string, unknown>)
            : {};
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

  // `active` collapses focused/full modes into one view. It is null exactly when
  // the schema failed to resolve (focusView is null whenever `resolved` is null),
  // which the single guard below renders as the "unavailable" message.
  const active =
    focusView ??
    (resolved
      ? {
          resolved,
          formValue: value,
          mergeBack: (nextFormValue: unknown) => nextFormValue as TConfig,
        }
      : null);

  // Hooks must run unconditionally (rules-of-hooks): these memos previously sat
  // after an early `return` on `!resolved`, so they were skipped whenever the
  // schema was unresolvable — changing the hook count between renders and risking
  // React's "rendered more hooks than during the previous render" crash on the
  // null→resolved transition. Derive null-safe inputs first so the memos keep
  // their original schema-identity granularity while tolerating a null view.
  const activeSchema = active?.resolved.schema ?? null;
  const activeFormContext = active?.resolved.formContext ?? null;

  const uiSchema = useMemo<UiSchema<TConfig, RJSFSchema, BrowserConfigFormContext> | null>(
    () =>
      activeSchema
        ? (buildUiSchema(activeSchema) as UiSchema<TConfig, RJSFSchema, BrowserConfigFormContext>)
        : null,
    [activeSchema, buildUiSchema]
  );

  // Pointers are mode-independent (focused mode wraps the stage under its own
  // key), so one collapse context serves both views unchanged.
  const formContext = useMemo<BrowserConfigFormContext | null>(
    () => (activeFormContext ? { ...activeFormContext, collapse, onStageResetRequest } : null),
    [activeFormContext, collapse, onStageResetRequest]
  );

  // Single guard after all hooks. `active`, `uiSchema`, and `formContext` are
  // null together (exactly when `resolved` is null), so this matches the prior
  // early-return condition while narrowing all three to non-null for the render.
  if (!active || !uiSchema || !formContext) {
    return (
      <div className="text-data text-muted-foreground">
        Config schema unavailable. Run the pipeline build to regenerate studio artifacts.
      </div>
    );
  }

  return (
    <SchemaForm
      schema={active.resolved.schema}
      uiSchema={uiSchema}
      formContext={formContext}
      value={active.formValue as TConfig}
      disabled={disabled}
      onChange={(next) => {
        onChange(active.mergeBack(next));
      }}
    />
  );
}
