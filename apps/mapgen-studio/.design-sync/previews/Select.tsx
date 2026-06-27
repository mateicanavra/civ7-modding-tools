import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "mapgen-studio";

// Select is a Radix listbox floating on the popover tier. Rendered `defaultOpen`
// so the card captures the real open list (map-size choices); the `cardMode:
// single` + viewport override keeps the portalled content inside the card.
export const MapSize = () => (
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
);
