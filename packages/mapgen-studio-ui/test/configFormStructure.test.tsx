// @vitest-environment jsdom
// Full-form DOM-structure pins for the config explorer. The wrapper-shell
// class these guard against was invisible to every visual review: rjsf runs
// its FieldTemplate around EVERY field including containers, and a template
// without a container branch wraps each object/array section in a dead
// `div.rjsf-field` + text-tier shell at every depth — zero pixels, real DOM
// (bloat, phantom rhythm, and an unnamed-landmark tree for assistive tech).
import type { RJSFSchema } from "@rjsf/utils";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SchemaForm } from "../src/components/forms/SchemaForm.js";

afterEach(cleanup);

const schema: RJSFSchema = {
  type: "object",
  properties: {
    "foundation-mantle": {
      type: "object",
      title: "Foundation Mantle",
      properties: {
        knobs: {
          type: "object",
          title: "Knobs",
          properties: {
            plateActivity: { type: "number" },
          },
        },
        sources: {
          type: "array",
          title: "Mantle Sources",
          items: { type: "number" },
        },
      },
    },
    climate: {
      type: "object",
      title: "Climate",
      properties: {
        rainfall: { type: "number" },
      },
    },
  },
};

function renderForm() {
  return render(
    <SchemaForm
      schema={schema}
      uiSchema={{}}
      formContext={{ transparentPaths: new Set<string>() }}
      value={{ "foundation-mantle": { knobs: { plateActivity: 1 }, sources: [2] } }}
      onChange={() => {}}
      disabled={false}
    />
  );
}

describe("config form DOM structure", () => {
  it("renders no field-template shell around any container (object/array)", () => {
    const { container } = renderForm();
    // The rjsf-field-{object,array} classes only reach the DOM when the
    // FieldTemplate wraps a container in the scalar field shell — the exact
    // dead-wrapper chain observed live (div.rjsf-field-object >
    // div.text-foreground > section) at every config depth.
    expect(container.querySelector(".rjsf-field-object")).toBeNull();
    expect(container.querySelector(".rjsf-field-array")).toBeNull();
    // Scalar fields keep their field-row shell.
    expect(container.querySelector(".rjsf-field")).not.toBeNull();
  });

  it("stage sections sit directly in the stage accordion, not in wrapper shells", () => {
    const { container } = renderForm();
    const sections = container.querySelectorAll("section[data-config-section]");
    expect(sections.length).toBeGreaterThanOrEqual(3);
    const stage = container.querySelector(
      'section[data-config-pointer="/foundation-mantle"]'
    ) as HTMLElement;
    expect(stage).not.toBeNull();
    expect(stage.parentElement?.className).toContain("divide-y");
  });

  it("every config section is a NAMED landmark whose label element exists", () => {
    const { container } = renderForm();
    for (const section of container.querySelectorAll("section[data-config-section]")) {
      const labelledBy = section.getAttribute("aria-labelledby");
      expect(labelledBy, `${section.getAttribute("data-config-pointer")} has no name`).toBeTruthy();
      const label = container.querySelector(`[id="${labelledBy}"]`);
      expect(label, `label element ${labelledBy} missing`).not.toBeNull();
      expect(label?.textContent?.trim()).not.toBe("");
    }
  });

  it("section ids are instance-scoped: two forms on one page share no ids", () => {
    const a = renderForm();
    const b = renderForm();
    const ids = (root: HTMLElement) =>
      [...root.querySelectorAll("[id]")].map((el) => el.id).filter(Boolean);
    const setA = new Set(ids(a.container));
    const overlap = ids(b.container).filter((id) => setA.has(id));
    expect(overlap).toEqual([]);
  });
});
