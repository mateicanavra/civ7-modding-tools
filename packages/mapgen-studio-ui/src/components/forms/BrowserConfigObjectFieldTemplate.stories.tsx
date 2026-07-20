import type { ObjectFieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type BrowserConfigFormContext,
  BrowserConfigObjectFieldTemplate,
} from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";
import {
  alwaysExpandedCollapse,
  mockFieldContent,
  mockSectionContent,
  noop,
  noTransparentPaths,
} from "../../storybook/mockWidgetProps.js";

/**
 * BrowserConfigObjectFieldTemplate is the config explorer's stage section: a
 * full-bleed disclosure header (chevron when collapse plumbing is present) that
 * opens a recessed slab. Scalar children render as one padded field run; object/
 * array children render flush as their own rows (hairline-divided). Adapted from
 * `.design-sync/previews/BrowserConfigObjectFieldTemplate.tsx`. Each property's
 * `content` is pre-rendered; the registry set-likes force "always expanded /
 * nothing transparent".
 */
// `args` is cast to the full ObjectFieldTemplateProps so Storybook's CSF3 type
// inference treats every (otherwise-required) rjsf prop as optional — letting
// these render-only stories omit an `args` block. The value is never read: each
// story drives the component entirely through its own `render` body.
const meta = {
  title: "forms/BrowserConfigObjectFieldTemplate",
  component: BrowserConfigObjectFieldTemplate,
  args: {} as unknown as ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>,
} satisfies Meta<typeof BrowserConfigObjectFieldTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

// Shared stage fixture (hoisted to module scope so the constant content is stable).
const stageProps = {
  title: "Elevation",
  description: "Sea level, mountain density, and range placement.",
  fieldPathId: { path: ["elevation"] },
  schema: {
    type: "object",
    properties: {
      seaLevel: { type: "number" },
      mountainDensity: { type: "number" },
      ranges: { type: "array" },
    },
  },
  properties: [
    { name: "seaLevel", hidden: false, content: mockFieldContent("Sea Level", "0.6") },
    {
      name: "mountainDensity",
      hidden: false,
      content: mockFieldContent("Mountain Density", "0.3"),
    },
    { name: "ranges", hidden: false, content: mockSectionContent("Ranges") },
  ],
};

// Preview-only `bg-card` frame so the recessed slab reads on the right tier.
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-card border border-border text-foreground"
      style={{ width: 360, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const ExpandedStage: Story = {
  render: () => (
    <Demo>
      <BrowserConfigObjectFieldTemplate
        {...({
          ...stageProps,
          registry: {
            formContext: {
              transparentPaths: noTransparentPaths,
              collapse: alwaysExpandedCollapse,
            },
          },
        } as unknown as ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>)}
      />
    </Demo>
  ),
};

export const WithoutCollapse: Story = {
  render: () => (
    <Demo>
      <BrowserConfigObjectFieldTemplate
        {...({
          ...stageProps,
          registry: { formContext: { transparentPaths: noTransparentPaths } },
        } as unknown as ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>)}
      />
    </Demo>
  ),
};

/**
 * Flat-and-flush deltas 5+8: the stage's formData drifts from its schema
 * defaults, so the header carries BOTH scoped actions — the dirty-gated Reset
 * (present only because seaLevel drifted) and the always-available JSON
 * reveal (click Braces to swap the fields for the stage's raw values).
 */
export const ModifiedStage: Story = {
  render: () => (
    <Demo>
      <BrowserConfigObjectFieldTemplate
        {...({
          ...stageProps,
          schema: {
            type: "object",
            properties: {
              seaLevel: { type: "number", default: 0.6 },
              mountainDensity: { type: "number", default: 0.3 },
            },
          },
          properties: [
            { name: "seaLevel", hidden: false, content: mockFieldContent("Sea Level", "0.85") },
            {
              name: "mountainDensity",
              hidden: false,
              content: mockFieldContent("Mountain Density", "0.3"),
            },
          ],
          formData: { seaLevel: 0.85, mountainDensity: 0.3 },
          registry: {
            formContext: {
              transparentPaths: noTransparentPaths,
              collapse: alwaysExpandedCollapse,
              onStageResetRequest: noop,
            },
          },
        } as unknown as ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>)}
      />
    </Demo>
  ),
};
