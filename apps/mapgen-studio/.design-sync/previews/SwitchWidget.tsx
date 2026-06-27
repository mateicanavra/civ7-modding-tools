import { SwitchWidget } from "mapgen-studio";

// SwitchWidget is the RJSF boolean control rendered as the DS `Switch` (the toggle
// idiom, vs CheckboxWidget's box). Shown beside a label for context. Runtime-only mocks.
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
    <div
      style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", width: 220 }}
    >
      <span className="text-data text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

const base = { id: "cfg_flag", name: "flag", onChange: () => {}, options: { emptyValue: false }, rawErrors: [] };

export const On = () => (
  <Demo>
    <Row label="Continental drift">
      <SwitchWidget {...base} id="cfg_drift" value={true} />
    </Row>
  </Demo>
);

export const Off = () => (
  <Demo>
    <Row label="Mirror hemispheres">
      <SwitchWidget {...base} id="cfg_mirror" value={false} />
    </Row>
  </Demo>
);
