import type { Meta, StoryObj } from "@storybook/react-vite";
import { MapConfigSaveDialog } from "@swooper/mapgen-studio-ui";
import { fn } from "storybook/test";

/** Keeps the save dialog open with realistic current-config defaults for interaction tests. */
const meta = {
  title: "composites/MapConfigSaveDialog",
  component: MapConfigSaveDialog,
  args: {
    open: true,
    initialName: "Studio Current",
    initialDescription: "Current Studio configuration.",
    onCancel: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof MapConfigSaveDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Inherits the open save-dialog state from the story metadata without overriding its callbacks. */
export const Default: Story = {};
