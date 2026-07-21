import type { FieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BrowserConfigFieldTemplate,
  type BrowserConfigFormContext,
  Input,
} from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * BrowserConfigFieldTemplate is the per-field row of the config form: a humanized
 * label (min-w 96) + control split (via FieldRow), with description / live error
 * region / help stacked below. Adapted from
 * `.design-sync/previews/BrowserConfigFieldTemplate.tsx`. RJSF FieldTemplateProps
 * are read for a small subset at render, so each story builds a narrow object and
 * casts once to the full rjsf prop type; `children` is the already-rendered control.
 */
// `args` is cast to the full FieldTemplateProps so Storybook's CSF3 type
// inference treats every (otherwise-required) rjsf prop as optional — letting
// these render-only stories omit an `args` block. The value is never read: each
// story drives the component entirely through its own `render` body.
const meta = {
  title: "forms/BrowserConfigFieldTemplate",
  component: BrowserConfigFieldTemplate,
  args: {} as unknown as FieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>,
} satisfies Meta<typeof BrowserConfigFieldTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only `bg-card` panel so the field row reads on its real surface tier.
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-card border border-border text-foreground"
      style={{ width: 340, padding: 14, borderRadius: 8 }}
    >
      {children}
    </div>
  );
}

export const ScalarField: Story = {
  render: () => (
    <Demo>
      <BrowserConfigFieldTemplate
        {...({
          id: "cfg_seaLevel",
          label: "seaLevel",
          displayLabel: true,
          required: false,
          description: "Fraction of the map surface below sea level.",
          schema: { type: "number" },
          rawErrors: [],
          classNames: "",
          fieldPathId: { path: ["elevation", "seaLevel"], $id: "cfg_seaLevel" },
          registry: { formContext: { transparentPaths: new Set<string>() } },
          children: <Input className="w-28 font-mono" defaultValue="0.6" aria-label="seaLevel" />,
        } as unknown as FieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>)}
      />
    </Demo>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Demo>
      <BrowserConfigFieldTemplate
        {...({
          id: "cfg_mountainDensity",
          label: "mountainDensity",
          displayLabel: true,
          required: true,
          schema: { type: "number" },
          rawErrors: ["must be ≤ 1"],
          errors: <span>must be ≤ 1</span>,
          classNames: "",
          fieldPathId: { path: ["elevation", "mountainDensity"], $id: "cfg_mountainDensity" },
          registry: { formContext: { transparentPaths: new Set<string>() } },
          children: (
            <Input
              className="w-28 font-mono"
              defaultValue="1.4"
              aria-invalid
              aria-label="mountainDensity"
            />
          ),
        } as unknown as FieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>)}
      />
    </Demo>
  ),
};
