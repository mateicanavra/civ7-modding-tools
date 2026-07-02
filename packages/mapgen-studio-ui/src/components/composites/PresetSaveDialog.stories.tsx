import type { Meta, StoryObj } from "@storybook/react-vite";
import { PresetSaveDialog } from "@swooper/mapgen-studio-ui";

/**
 * PresetSaveDialog captures the current config as a named preset (Save disabled
 * until a label is entered). Adapted from `.design-sync/previews/PresetSaveDialog.tsx`;
 * rendered open (it portals its own popover surface).
 */
const meta = {
  title: "composites/PresetSaveDialog",
  component: PresetSaveDialog,
} satisfies Meta<typeof PresetSaveDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const SaveConfig: Story = {
  args: {
    open: true,
    initialLabel: "Tropical Archipelago",
    initialDescription: "High sea level, hotspot island chains",
    onCancel: noop,
    onConfirm: noop,
  },
  render: (args) => <PresetSaveDialog {...args} />,
};
