import { CheckboxWidget } from "mapgen-studio";

// CheckboxWidget is the RJSF boolean control on the DS `Checkbox`. Shown beside a
// label for context (the label is preview chrome — the widget is just the box).
// Runtime-only mocks.
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

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {children}
      <span className="text-data text-muted-foreground">{label}</span>
    </div>
  );
}

const base = { id: "cfg_flag", name: "flag", onChange: () => {}, options: { emptyValue: false }, rawErrors: [] };

export const Checked = () => (
  <Demo>
    <Row label="Wrap east–west">
      <CheckboxWidget {...base} id="cfg_wrapX" value={true} />
    </Row>
  </Demo>
);

export const Unchecked = () => (
  <Demo>
    <Row label="Polar ice caps">
      <CheckboxWidget {...base} id="cfg_iceCaps" value={false} />
    </Row>
  </Demo>
);
