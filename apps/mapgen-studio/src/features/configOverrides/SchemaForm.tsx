import Form from "@rjsf/core";
import { customizeValidator } from "@rjsf/validator-ajv8";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useMemo } from "react";
import {
  BrowserConfigArrayFieldTemplate,
  BrowserConfigFieldTemplate,
  BrowserConfigObjectFieldTemplate,
  type BrowserConfigFormContext,
} from "./rjsfTemplates";
import { configWidgets } from "./rjsfWidgets";

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
  const validator = useMemo(
    () => customizeValidator<TConfig, RJSFSchema, BrowserConfigFormContext>(),
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
