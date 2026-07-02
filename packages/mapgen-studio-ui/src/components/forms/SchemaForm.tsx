// Import Form from its component subpath, NOT the "@rjsf/core" barrel. The
// barrel (index.ts) statically imports `getTestRegistry`, which imports
// `@rjsf/validator-ajv8` (ajv) at top level. Because neither package sets
// `sideEffects: false`, bundlers cannot tree-shake that unused test helper, so
// the barrel drags ajv's `new Function` compiler into the bundle — the exact
// CSP violation this migration removes. `Form.js` itself is ajv-free.
import Form from "@rjsf/core/lib/components/Form.js";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useMemo } from "react";
import {
  BrowserConfigArrayFieldTemplate,
  BrowserConfigFieldTemplate,
  type BrowserConfigFormContext,
  BrowserConfigObjectFieldTemplate,
} from "./rjsfTemplates.js";
import { configWidgets } from "./rjsfWidgets.js";
import { createTypeboxValidator } from "./typeboxRjsfValidator.js";

export type SchemaFormProps<TConfig> = {
  schema: RJSFSchema;
  uiSchema: UiSchema<TConfig, RJSFSchema, BrowserConfigFormContext>;
  formContext: BrowserConfigFormContext;
  value: TConfig;
  onChange(next: TConfig): void;
  disabled: boolean;
};

export function SchemaForm<TConfig>(props: SchemaFormProps<TConfig>) {
  const { schema, uiSchema, formContext, value, onChange, disabled } = props;
  // TypeBox-backed validator: CSP-safe (no `new Function`), unlike ajv. See
  // typeboxRjsfValidator.ts for the parity rationale.
  const validator = useMemo(
    () => createTypeboxValidator<TConfig, RJSFSchema, BrowserConfigFormContext>(),
    []
  );

  return (
    <div
      style={{
        padding: 0,
        borderRadius: 0,
        border: "none",
        background: "transparent",
      }}
    >
      <Form<TConfig, RJSFSchema, BrowserConfigFormContext>
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        formContext={formContext}
        formData={value}
        templates={{
          FieldTemplate: BrowserConfigFieldTemplate,
          ObjectFieldTemplate: BrowserConfigObjectFieldTemplate,
          ArrayFieldTemplate: BrowserConfigArrayFieldTemplate,
        }}
        widgets={configWidgets as any}
        showErrorList={false}
        disabled={disabled}
        onChange={(e) => {
          onChange((e.formData ?? value) as TConfig);
        }}
      >
        <div />
      </Form>
    </div>
  );
}
