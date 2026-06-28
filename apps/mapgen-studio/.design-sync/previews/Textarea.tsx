import { Label, Textarea } from "mapgen-studio";

// Textarea is the multi-line sibling of Input — same inset substrate, control
// border, and 11px data type. `Demo` is a preview-only dark backdrop so the inset
// field and placeholder/value type read on the real graphite surface.
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

const overrides = `{
  "landmass": { "waterPercent": 0.62 },
  "climate": { "rainfall": "wet" }
}`;

export const Default = () => (
  <Demo>
    <div style={{ width: 320 }}>
      <Textarea placeholder="Notes for this preset…" />
    </div>
  </Demo>
);

export const WithValue = () => (
  <Demo>
    <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 4 }}>
      <Label htmlFor="overrides">Config overrides</Label>
      <Textarea id="overrides" className="font-mono" defaultValue={overrides} rows={4} />
    </div>
  </Demo>
);

export const Disabled = () => (
  <Demo>
    <div style={{ width: 320 }}>
      <Textarea disabled defaultValue={overrides} className="font-mono" rows={4} />
    </div>
  </Demo>
);
