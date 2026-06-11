import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { FieldTemplateProps, RJSFSchema } from "@rjsf/utils";

import {
  BrowserConfigFieldTemplate,
  type BrowserConfigFormContext,
} from "../../src/features/configOverrides/rjsfTemplates";

type TemplateProps = FieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>;

// rjsf's `errors` prop is a ReactElement (always truthy, even with no errors);
// the template must gate the `role="alert"` live region on `rawErrors` so a
// pristine form mounts zero phantom alert regions (Pass-2 form-hierarchy spec).
function renderField(overrides: Partial<TemplateProps>): string {
  const base = {
    id: "root_test_field",
    label: "plateActivity",
    required: false,
    hidden: false,
    displayLabel: true,
    classNames: "",
    description: <span>Plate activity scalar.</span>,
    errors: <span />, // always-truthy element, like rjsf passes
    help: null,
    rawErrors: [] as string[],
    schema: { type: "number" } as RJSFSchema,
    children: <input id="root_test_field" />,
  };
  return renderToStaticMarkup(
    <BrowserConfigFieldTemplate {...({ ...base, ...overrides } as unknown as TemplateProps)} />
  );
}

describe("BrowserConfigFieldTemplate error live regions", () => {
  it("mounts no alert region when the field has no raw errors", () => {
    const html = renderField({ rawErrors: [] });
    expect(html).not.toContain('role="alert"');
  });

  it("renders the associated alert region when raw errors exist", () => {
    const html = renderField({
      rawErrors: ["must be <= 1"],
      errors: <span>must be &lt;= 1</span>,
    });
    expect(html).toContain('role="alert"');
    expect(html).toContain('id="root_test_field__error"');
    expect(html).toContain("must be &lt;= 1");
  });

  it("keeps the label on the foreground tier and the description muted", () => {
    const html = renderField({ rawErrors: [] });
    // Label anchor: foreground tier; description prose: muted tier.
    expect(html).toMatch(/<label[^>]*class="[^"]*text-foreground/);
    expect(html).toMatch(/Plate activity scalar/);
    expect(html).toMatch(/text-muted-foreground/);
  });
});
