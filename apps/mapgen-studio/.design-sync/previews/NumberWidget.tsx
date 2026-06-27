import { NumberWidget } from "mapgen-studio";

// NumberWidget is the RJSF numeric control (type=number, inputMode=decimal) on the
// DS `Input` — empties normalize to `emptyValue`, NaN is rejected. Also the registry
// target for RJSF's UpDown/Range widgets. Runtime-only mocks.
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

const base = {
  id: "cfg_seaLevel",
  name: "seaLevel",
  onChange: () => {},
  options: { emptyValue: undefined },
  rawErrors: [],
};

export const Filled = () => (
  <Demo>
    <div style={{ width: 160 }}>
      <NumberWidget {...base} value={0.6} />
    </div>
  </Demo>
);

export const Disabled = () => (
  <Demo>
    <div style={{ width: 160 }}>
      <NumberWidget {...base} value={0.3} disabled />
    </div>
  </Demo>
);
