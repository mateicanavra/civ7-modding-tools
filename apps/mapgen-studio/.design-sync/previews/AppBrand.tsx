import { AppBrand } from "mapgen-studio";

// AppBrand is the identity pill in the header ("MapGen Studio v0.1"), riding the
// popover tier over the deck.gl map. The hover info-card only mounts on
// mouseenter, so a static capture shows the resting pill only — framed here on a
// dark surface so the bordered popover chrome reads against the studio substrate.
function Demo({ children }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{ padding: 24, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {children}
    </div>
  );
}

export const Default = () => (
  <Demo>
    <AppBrand />
  </Demo>
);
