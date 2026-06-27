import { TextareaWidget } from "mapgen-studio";

// TextareaWidget is the RJSF multiline control re-skinned onto the DS `Textarea`.
// RJSF props are runtime-only mocks (esbuild, not typechecked).
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
  id: "cfg_notes",
  name: "notes",
  onChange: () => {},
  options: { emptyValue: "" },
  rawErrors: [],
};

export const Filled = () => (
  <Demo>
    <div style={{ width: 300 }}>
      <TextareaWidget
        {...base}
        value={"Cool, wet archipelago.\nHigh sea level, frequent island chains."}
      />
    </div>
  </Demo>
);

export const Empty = () => (
  <Demo>
    <div style={{ width: 300 }}>
      <TextareaWidget {...base} value="" placeholder="Describe this preset…" />
    </div>
  </Demo>
);
