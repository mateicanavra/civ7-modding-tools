import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "mapgen-studio";
import { Dices } from "lucide-react";

// Tooltip is a Radix floating hint resting on the popover tier (10px label type).
// Rendered `open` so the card captures the hint; `cardMode: single` + viewport
// keeps the portalled content inside the card.
export const ReRoll = () => (
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
);
