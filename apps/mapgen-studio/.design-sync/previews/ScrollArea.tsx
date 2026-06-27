import { ScrollArea } from "mapgen-studio";

// ScrollArea is Radix's custom scroller; the thumb is a quiet hairline
// (border-strong) that stays findable. `Demo` is a preview-only dark backdrop,
// not a DS export. A fixed height + a tall list forces overflow so the thumb shows.
function Demo({ children }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{ padding: 20, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {children}
    </div>
  );
}

const presets = [
  "continents",
  "pangaea",
  "archipelago",
  "fractal-highlands",
  "inland-sea",
  "shattered-plates",
  "tropical-belt",
  "polar-frontier",
  "rift-valley",
  "sundered-archipelago",
  "drowned-platform",
  "craton-cradle",
  "volcanic-arc",
  "monsoon-coast",
  "great-steppe",
];

// A scrollable preset list (15 entries) inside a fixed 160px viewport.
export const PresetList = () => (
  <Demo>
    <div
      className="bg-card border border-border"
      style={{ width: 300, borderRadius: 6, overflow: "hidden" }}
    >
      <div
        className="text-muted-foreground border-b border-border"
        style={{ padding: "8px 12px", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}
      >
        Presets · 15
      </div>
      <ScrollArea style={{ height: 160 }}>
        <div style={{ padding: 4, display: "flex", flexDirection: "column" }}>
          {presets.map((name, i) => (
            <div
              key={name}
              className="text-foreground"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 10px",
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "var(--font-mono, monospace)",
                backgroundColor: i === 0 ? "var(--muted, transparent)" : "transparent",
              }}
            >
              <span>{name}</span>
              <span className="text-muted-foreground" style={{ fontSize: 11 }}>
                96 × 60
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  </Demo>
);
