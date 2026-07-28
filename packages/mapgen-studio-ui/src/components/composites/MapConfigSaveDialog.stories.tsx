import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { MapConfigSaveDialog } from "./MapConfigSaveDialog.js";

/** Keeps the save dialog open with realistic current-config defaults for interaction tests. */
const meta = {
  title: "Composites/MapConfigSaveDialog",
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
