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
 * popover floating tier. Rendered `open` so the config actions are
 * captured on first paint.
 */
const meta = {
  title: "primitives/DropdownMenu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfigActions: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Config <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Config</DropdownMenuLabel>
        <DropdownMenuItem>Save to current</DropdownMenuItem>
        <DropdownMenuItem>Save as new</DropdownMenuItem>
        <DropdownMenuItem>Import config</DropdownMenuItem>
        <DropdownMenuItem>Export config</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Reset to default</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
