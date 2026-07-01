import type { Meta, StoryObj } from "@storybook/react-vite";
import { PresetConfirmDialog } from "@/features/presets/PresetDialogs";

/**
 * PresetConfirmDialog is the destructive-confirm flow (outline Cancel + filled
 * confirm). Adapted from `.design-sync/previews/PresetConfirmDialog.tsx`;
 * rendered open (it portals its own popover surface).
 */
const meta = {
  title: "composites/PresetConfirmDialog",
  component: PresetConfirmDialog,
} satisfies Meta<typeof PresetConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const DeletePreset: Story = {
  args: {
    open: true,
    title: "Delete preset?",
    message: "‘Tropical Archipelago’ will be permanently removed. This can’t be undone.",
    confirmLabel: "Delete",
    onCancel: noop,
    onConfirm: noop,
  },
  render: (args) => <PresetConfirmDialog {...args} />,
};
