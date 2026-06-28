import { Checkbox, Label } from "mapgen-studio";

// Checkbox is a dense 14px box on the studio's inset control substrate; checked
// fills with the one primary slate. `Demo` is a preview-only dark backdrop so the
// contour border and filled state read on the real graphite surface.
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
    <Checkbox />
  </Demo>
);

export const Checked = () => (
  <Demo>
    <Checkbox defaultChecked />
  </Demo>
);

export const Disabled = () => (
  <Demo>
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Checkbox disabled />
      <Checkbox defaultChecked disabled />
    </div>
  </Demo>
);

export const WithLabel = () => (
  <Demo>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Checkbox id="auto-run" defaultChecked />
      <Label htmlFor="auto-run">Auto-run on config change</Label>
    </div>
  </Demo>
);
