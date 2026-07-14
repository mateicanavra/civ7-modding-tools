import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { MapConfigSaveDialog } from "./MapConfigSaveDialog.js";

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
export const Default: Story = {};
