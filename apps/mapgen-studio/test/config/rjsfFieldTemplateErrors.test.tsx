import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { FieldTemplateProps, RJSFSchema } from "@rjsf/utils";

import type { ObjectFieldTemplateProps } from "@rjsf/utils";

import type { ArrayFieldTemplateProps } from "@rjsf/utils";

import {
  BrowserConfigArrayFieldTemplate,
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

  function renderGroup(
    path: (string | number)[],
    formContext: BrowserConfigFormContext = { transparentPaths: new Set<string>() }
  ): string {
    const props = {
      title: "Mesh Resolution",
      description: undefined,
      properties: [{ hidden: false, content: <div>field</div>, name: "x" }],
      fieldPathId: { path, id: path.join("_") },
      schema: { type: "object" } as RJSFSchema,
      registry: { formContext },
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

describe("BrowserConfigObjectFieldTemplate collapse (Pass-4 config-collapse spec)", () => {
  type ObjectProps = ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>;

  function renderWithCollapse(path: (string | number)[], expandedPointers: string[]): string {
    const formContext: BrowserConfigFormContext = {
      transparentPaths: new Set<string>(),
      collapse: {
        expandedPointers: new Set(expandedPointers),
        toggle: () => {},
      },
    };
    const props = {
      title: "Mesh Resolution",
      description: undefined,
      properties: [{ hidden: false, content: <div>field-content-marker</div>, name: "x" }],
      fieldPathId: { path, id: path.join("_") },
      schema: { type: "object" } as RJSFSchema,
      registry: { formContext },
    };
    return renderToStaticMarkup(
      <BrowserConfigObjectFieldTemplate {...(props as unknown as ObjectProps)} />
    );
  }

  it("renders a collapsed object as an accessible disclosure header with hidden content", () => {
    const html = renderWithCollapse(["foundation"], []);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-config-pointer="/foundation"');
    expect(html).not.toContain("field-content-marker");
  });

  it("reveals content when the pointer is expanded", () => {
    const html = renderWithCollapse(["foundation"], ["/foundation"]);
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("field-content-marker");
  });

  it("renders nested groups collapsed independently of the stage", () => {
    const html = renderWithCollapse(["foundation", "meshResolution"], ["/foundation"]);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("field-content-marker");
  });

  it("keeps array actions in the header action zone while collapsed", () => {
    type ArrayProps = ArrayFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>;
    const html = renderToStaticMarkup(
      <BrowserConfigArrayFieldTemplate
        {...({
          title: "Range Seeds",
          items: [{ key: "0", children: <div>array-item-marker</div> }],
          canAdd: true,
          onAddClick: () => {},
          disabled: false,
          readonly: false,
          schema: { type: "array" } as RJSFSchema,
          fieldPathId: { path: ["foundation", "rangeSeeds"], id: "foundation_rangeSeeds" },
          registry: {
            formContext: {
              transparentPaths: new Set<string>(),
              collapse: { expandedPointers: new Set<string>(), toggle: () => {} },
            },
          },
        } as unknown as ArrayProps)}
      />
    );
    // Collapsed: the Add action stays reachable on the header, items hidden.
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain(">Add<");
    expect(html).not.toContain("array-item-marker");
  });

  it("renders no disclosure chrome without a collapse context (unit mounts, bare reuse)", () => {
    const expandedDefault = renderToStaticMarkup(
      <BrowserConfigObjectFieldTemplate
        {...({
          title: "Mesh Resolution",
          description: undefined,
          properties: [{ hidden: false, content: <div>field-content-marker</div>, name: "x" }],
          fieldPathId: { path: ["foundation"], id: "foundation" },
          schema: { type: "object" } as RJSFSchema,
          registry: { formContext: { transparentPaths: new Set<string>() } },
        } as unknown as ObjectProps)}
      />
    );
    expect(expandedDefault).toContain("field-content-marker");
    expect(expandedDefault).not.toContain("aria-expanded");
  });
});
