import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "mapgen-studio";
import { ChevronDown } from "lucide-react";

// DropdownMenu is a Radix menu on the popover floating tier. Rendered `open` so
// the card captures the menu items (preset actions); the `cardMode: single` +
// viewport override keeps the portalled content inside the card.
export const PresetActions = () => (
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
);
