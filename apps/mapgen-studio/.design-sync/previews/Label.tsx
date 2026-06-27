import { Checkbox, Input, Label, Switch } from "mapgen-studio";

// Label is the field eyebrow — meaningless alone, so every story pairs it with
// the control it names. Default is 11px data type; `text-label` is the 10px
// uppercase eyebrow. `Demo` is a preview-only dark backdrop matching the studio.
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

export const WithInput = () => (
  <Demo>
    <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 4 }}>
      <Label htmlFor="seed">Seed</Label>
      <Input id="seed" className="font-mono" defaultValue="1474829" />
    </div>
  </Demo>
);

export const WithSwitch = () => (
  <Demo>
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", width: 220 }}>
      <Label htmlFor="show-grid">Show grid</Label>
      <Switch id="show-grid" defaultChecked />
    </div>
  </Demo>
);

export const WithCheckbox = () => (
  <Demo>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Checkbox id="place-resources" defaultChecked />
      <Label htmlFor="place-resources">Resources</Label>
    </div>
  </Demo>
);

export const Eyebrow = () => (
  <Demo>
    <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 4 }}>
      <Label htmlFor="players" className="text-label text-muted-foreground">
        Players
      </Label>
      <Input id="players" className="font-mono" defaultValue="6" />
    </div>
  </Demo>
);
