import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

/**
 * Adapted from `.design-sync/previews/Select.tsx`. Select is a Radix listbox
 * floating on the popover tier; rendered `defaultOpen` so the open map-size list
 * is captured. Controlled `value="standard"` mirrors how the app supplies the
 * current choice.
 */
const meta = {
  title: "primitives/Select",
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MapSize: Story = {
  render: () => (
    <Select defaultOpen value="standard">
      <SelectTrigger style={{ width: 200 }}>
        <SelectValue placeholder="Map size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="tiny">Tiny</SelectItem>
        <SelectItem value="small">Small</SelectItem>
        <SelectItem value="standard">Standard</SelectItem>
        <SelectItem value="large">Large</SelectItem>
        <SelectItem value="huge">Huge</SelectItem>
      </SelectContent>
    </Select>
  ),
};
