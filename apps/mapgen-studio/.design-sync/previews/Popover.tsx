import {
  Button,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "mapgen-studio";
import { SlidersHorizontal } from "lucide-react";

// Popover is a Radix floating surface on the popover tier — a generic container
// for inspector pickers and overflow content. Rendered `defaultOpen` so the card
// captures the open content; `cardMode: single` + viewport keeps it in the card.
export const OverlayOpacity = () => (
  <Popover defaultOpen>
    <PopoverTrigger asChild>
      <Button variant="outline" size="icon" aria-label="Overlay settings">
        <SlidersHorizontal />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label>Overlay opacity</Label>
        <p className="text-muted-foreground" style={{ fontSize: 12, lineHeight: 1.5 }}>
          Blend the elevation overlay against the base terrain. Set to 0% to hide
          the overlay; 100% paints it fully opaque over the surface map.
        </p>
        <div
          className="border border-border bg-input-background text-foreground"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 4, padding: "4px 8px" }}
        >
          <span className="text-muted-foreground" style={{ fontSize: 11 }}>Opacity</span>
          <span style={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)" }}>65%</span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);
