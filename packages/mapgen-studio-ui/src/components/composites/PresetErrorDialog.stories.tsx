import type { Meta, StoryObj } from "@storybook/react-vite";
import { PresetErrorDialog } from "@swooper/mapgen-studio-ui";

/**
 * PresetErrorDialog surfaces a failed preset import/save on the token-driven
 * shadcn Dialog. Adapted from `.design-sync/previews/PresetErrorDialog.tsx`;
 * rendered open (it portals its own popover surface).
 */
const meta = {
  title: "composites/PresetErrorDialog",
  component: PresetErrorDialog,
} satisfies Meta<typeof PresetErrorDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const ImportFailed: Story = {
  args: {
    open: true,
    title: "Couldn’t import preset",
    message: "The preset file is missing required recipe fields and can’t be loaded.",
    details: [
      "config.layers.climate: required",
      "config.recipe: unknown key ‘placement.discoveries’",
    ],
    onOpenChange: noop,
  },
  render: (args) => <PresetErrorDialog {...args} />,
};
