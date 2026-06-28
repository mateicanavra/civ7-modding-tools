import { Button } from "mapgen-studio";
import { Dices, Play } from "lucide-react";

// The studio is a dark "cartographer's instrument" — render the borders-only
// button set on its real graphite substrate so contours and the one filled
// primary read correctly. `Demo` is a preview-only dark backdrop, not a DS export.
function Demo({ children }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{ padding: 20, borderRadius: 6, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}
    >
      {children}
    </div>
  );
}

export const Variants = () => (
  <Demo>
    <Button>
      <Play /> Generate map
    </Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Delete preset</Button>
    <Button variant="link">View docs</Button>
  </Demo>
);

export const Sizes = () => (
  <Demo>
    <Button size="lg">Large</Button>
    <Button size="default">Default</Button>
    <Button size="sm">Small</Button>
    <Button size="icon" variant="outline" aria-label="Re-roll seed">
      <Dices />
    </Button>
  </Demo>
);

export const States = () => (
  <Demo>
    <Button>Run</Button>
    <Button disabled>Disabled</Button>
    <Button variant="outline" disabled>
      Disabled outline
    </Button>
  </Demo>
);
