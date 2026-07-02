import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@swooper/mapgen-studio-ui";
import { ChevronDown } from "lucide-react";

/**
 * Adapted from `.design-sync/previews/DropdownMenu.tsx`: a Radix menu on the
 * popover floating tier. Rendered `open` so the menu items (preset actions) are
 * captured on first paint.
 */
const meta = {
  title: "primitives/DropdownMenu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PresetActions: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Preset <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Preset</DropdownMenuLabel>
        <DropdownMenuItem>Save to current</DropdownMenuItem>
        <DropdownMenuItem>Save as new</DropdownMenuItem>
        <DropdownMenuItem>Import preset</DropdownMenuItem>
        <DropdownMenuItem>Export preset</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">Delete preset</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
