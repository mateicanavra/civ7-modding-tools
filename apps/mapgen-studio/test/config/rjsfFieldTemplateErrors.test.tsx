import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { FieldTemplateProps, RJSFSchema } from "@rjsf/utils";

import type { ObjectFieldTemplateProps } from "@rjsf/utils";

import {
  BrowserConfigFieldTemplate,
  BrowserConfigObjectFieldTemplate,
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

describe("BrowserConfigObjectFieldTemplate nesting surfaces", () => {
  type ObjectProps = ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>;

  function renderGroup(path: (string | number)[]): string {
    const props = {
      title: "Mesh Resolution",
      description: undefined,
      properties: [{ hidden: false, content: <div>field</div>, name: "x" }],
      fieldPathId: { path, id: path.join("_") },
      schema: { type: "object" } as RJSFSchema,
      registry: { formContext: { transparentPaths: new Set<string>() } },
    };
    return renderToStaticMarkup(
      <BrowserConfigObjectFieldTemplate {...(props as unknown as ObjectProps)} />
    );
  }

  it("renders a depth-2 group as a recessed well, not an indent rule", () => {
    const html = renderGroup(["foundation", "meshResolution"]);
    // Pass-3 config-surface spec: surface tier (page-tint well), no border-l ladder.
    expect(html).toContain("bg-background/40");
    expect(html).not.toContain("border-l");
  });

  it("adds no third surface tier at depth 3", () => {
    const html = renderGroup(["foundation", "meshResolution", "advanced"]);
    expect(html).not.toContain("bg-background/40");
    expect(html).not.toContain("border-l");
  });
});
