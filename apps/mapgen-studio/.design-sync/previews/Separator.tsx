import { Separator } from "mapgen-studio";

// Separator is the studio's intra-surface hairline (border-subtle tier) — quieter
// than a panel edge. `Demo` is a preview-only dark backdrop, not a DS export.
// Both stories give the rule visible content on either side so the hairline reads.
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

// Horizontal: a labeled settings group split into two stacked sections.
export const Horizontal = () => (
  <Demo>
    <div
      className="bg-card border border-border"
      style={{ width: 320, borderRadius: 6, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>
          World
        </span>
        <span className="text-muted-foreground" style={{ fontSize: 12 }}>
          Standard · 6 players · balanced resources
        </span>
      </div>
      <Separator />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>
          Recipe
        </span>
        <span className="text-muted-foreground" style={{ fontSize: 12 }}>
          mod-swooper-maps/standard · seed 1474829
        </span>
      </div>
    </div>
  </Demo>
);

// Vertical: hairlines dividing inline items in a toolbar row.
export const Vertical = () => (
  <Demo>
    <div
      className="bg-card border border-border text-muted-foreground"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 32,
        padding: "0 12px",
        borderRadius: 6,
        fontSize: 12,
      }}
    >
      <span className="text-foreground" style={{ fontFamily: "var(--font-mono, monospace)" }}>
        96 × 60
      </span>
      <Separator orientation="vertical" />
      <span>Continents</span>
      <Separator orientation="vertical" />
      <span style={{ fontFamily: "var(--font-mono, monospace)" }}>seed 1474829</span>
    </div>
  </Demo>
);
