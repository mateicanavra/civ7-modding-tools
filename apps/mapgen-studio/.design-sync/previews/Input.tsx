import { Input, Label } from "mapgen-studio";

// Input is the dense inset field (h-7, 11px data type) on the `input-background`
// substrate with the control border. `Demo` is a preview-only dark backdrop so
// the inset field and placeholder/value type read on the real graphite surface.
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

export const Default = () => (
  <Demo>
    <div style={{ width: 240 }}>
      <Input placeholder="Search layers…" />
    </div>
  </Demo>
);

export const WithValue = () => (
  <Demo>
    <div style={{ width: 240 }}>
      <Input className="font-mono" defaultValue="1474829" aria-label="Seed" />
    </div>
  </Demo>
);

export const Disabled = () => (
  <Demo>
    <div style={{ width: 240 }}>
      <Input disabled defaultValue="mod-swooper-maps/standard" />
    </div>
  </Demo>
);

export const Field = () => (
  <Demo>
    <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 4 }}>
      <Label htmlFor="seed">Seed</Label>
      <Input id="seed" className="font-mono" defaultValue="1474829" />
    </div>
    <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 4 }}>
      <Label htmlFor="map-name">Map name</Label>
      <Input id="map-name" placeholder="Untitled continents" />
    </div>
  </Demo>
);
