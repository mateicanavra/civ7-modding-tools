import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@swooper/mapgen-studio-ui";
import { Dices } from "lucide-react";

/**
 * Foundation proof that a Radix tooltip renders visible (not silently blank).
 * Mirrors `.design-sync/previews/Tooltip.tsx`, which self-provides its own
 * `TooltipProvider` and renders `open` so the portalled hint is captured — the
 * global decorator's `TooltipProvider` is exercised separately by the six
 * tooltip-consuming composites in Tier 1.
 */
const meta = {
  title: "primitives/Tooltip",
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReRoll: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Re-roll seed">
            <Dices />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Re-roll: new seed and run</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
