import { Label, Switch } from "mapgen-studio";

// Switch is the 36x20 toggle — checked fills with the one primary slate, unchecked
// rests on the muted surface. `Demo` is a preview-only dark backdrop so the track
// fill and thumb read on the real graphite surface.
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

export const Off = () => (
  <Demo>
    <Switch />
  </Demo>
);

export const On = () => (
  <Demo>
    <Switch defaultChecked />
  </Demo>
);

export const Disabled = () => (
  <Demo>
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Switch disabled />
      <Switch defaultChecked disabled />
    </div>
  </Demo>
);

export const WithLabel = () => (
  <Demo>
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", width: 200 }}>
      <Label htmlFor="show-grid">Show grid</Label>
      <Switch id="show-grid" defaultChecked />
    </div>
  </Demo>
);
