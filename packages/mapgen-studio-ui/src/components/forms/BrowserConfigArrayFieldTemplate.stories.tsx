import type { ArrayFieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BrowserConfigArrayFieldTemplate,
  type BrowserConfigFormContext,
} from "@swooper/mapgen-studio-ui";
import { Fragment, type ReactNode } from "react";
import { alwaysExpandedCollapse, mockFieldContent, noop } from "../../storybook/mockWidgetProps.js";

/**
 * BrowserConfigArrayFieldTemplate is the config explorer's array section: the same
 * flat disclosure-row anatomy as object groups, with the "Add" button riding the
 * header's trailing action zone and hairline-divided item rows. Adapted from
 * `.design-sync/previews/BrowserConfigArrayFieldTemplate.tsx`. Each item is
 * the pre-rendered element supplied by rjsf v6; the registry set-like forces
 * "always expanded".
 */
// `args` is cast to the full ArrayFieldTemplateProps so Storybook's CSF3 type
// inference treats every (otherwise-required) rjsf prop as optional — letting
// these render-only stories omit an `args` block. The value is never read: each
// story drives the component entirely through its own `render` body.
/** Registers render-driven array-template stories without manufacturing the full rjsf prop set. */
const meta = {
  title: "forms/BrowserConfigArrayFieldTemplate",
  component: BrowserConfigArrayFieldTemplate,
  args: {} as unknown as ArrayFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>,
} satisfies Meta<typeof BrowserConfigArrayFieldTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

// Shared array fixture (hoisted to module scope so the constant props are stable).
const base = {
  title: "Hotspot seeds",
  canAdd: true,
  onAddClick: noop,
  disabled: false,
  readonly: false,
  schema: {},
  fieldPathId: { path: ["hotspots"] },
  registry: { formContext: { collapse: alwaysExpandedCollapse } },
};

// Preview-only `bg-card` frame so the array section reads on the right tier.
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

/** Exercises item separators and the trailing add action with two rendered array entries. */
export const WithItems: Story = {
  render: () => (
    <Demo>
      <BrowserConfigArrayFieldTemplate
        {...({
          ...base,
          items: [
            <Fragment key="0">{mockFieldContent("seed 0", "0.42, 0.18")}</Fragment>,
            <Fragment key="1">{mockFieldContent("seed 1", "0.71, 0.66")}</Fragment>,
          ],
        } as unknown as ArrayFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>)}
      />
    </Demo>
  ),
};

/** Pins the add affordance and disclosure shell when the authored array has no entries. */
export const Empty: Story = {
  render: () => (
    <Demo>
      <BrowserConfigArrayFieldTemplate
        {...({
          ...base,
          items: [],
        } as unknown as ArrayFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>)}
      />
    </Demo>
  ),
};
