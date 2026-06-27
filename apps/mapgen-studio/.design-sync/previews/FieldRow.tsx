import { FieldRow, Input, Switch } from "mapgen-studio";

// FieldRow is the form-row layout atom: one flex row that pushes a label to the
// left and its control to the right (items-center justify-between gap-3 py-1).
// `Demo` is a preview-only dark panel, not a DS export.
function Demo({ children }) {
  return (
    <div
      className="bg-card border border-border text-foreground"
      style={{ width: 300, padding: 12, borderRadius: 8 }}
    >
      {children}
    </div>
  );
}

// A small config panel: label/control pairs stacked as FieldRows.
export const ConfigRows = () => (
  <Demo>
    <FieldRow>
      <span className="text-data text-muted-foreground">Map size</span>
      <Input className="w-28 font-mono" defaultValue="96 × 60" />
    </FieldRow>
    <FieldRow>
      <span className="text-data text-muted-foreground">Seed</span>
      <Input className="w-28 font-mono" defaultValue="1474829" />
    </FieldRow>
    <FieldRow>
      <span className="text-data text-muted-foreground">Wrap east–west</span>
      <Switch defaultChecked />
    </FieldRow>
  </Demo>
);

// A single row in isolation — the label/control split at its simplest.
export const SingleRow = () => (
  <Demo>
    <FieldRow>
      <span className="text-data text-muted-foreground">Rainfall</span>
      <Input className="w-20 font-mono" defaultValue="1.0" />
    </FieldRow>
  </Demo>
);
