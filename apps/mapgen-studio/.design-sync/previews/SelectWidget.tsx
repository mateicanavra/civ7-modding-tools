import { SelectWidget } from "mapgen-studio";

// SelectWidget maps an RJSF enum onto the DS `Select` — the schema's "no selection"
// placeholder round-trips through a reserved sentinel. Shown at rest (trigger with
// the selected label); opening the list is a runtime interaction. Runtime-only mocks.
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
  id: "cfg_rainfall",
  name: "rainfall",
  onChange: () => {},
  options: {
    emptyValue: "",
    enumOptions: [
      { value: "arid", label: "Arid" },
      { value: "temperate", label: "Temperate" },
      { value: "wet", label: "Wet" },
    ],
  },
  rawErrors: [],
};

export const Selected = () => (
  <Demo>
    <div style={{ width: 220 }}>
      <SelectWidget {...base} value="temperate" placeholder="Choose rainfall" />
    </div>
  </Demo>
);

export const Disabled = () => (
  <Demo>
    <div style={{ width: 220 }}>
      <SelectWidget {...base} value="wet" disabled />
    </div>
  </Demo>
);
