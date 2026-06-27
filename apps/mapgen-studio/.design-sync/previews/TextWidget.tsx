import { TextWidget } from "mapgen-studio";

// TextWidget is the RJSF text control re-skinned onto the DS `Input` — the form's
// string field, wired with empty-value normalization + error a11y. RJSF props are
// runtime-only mocks (esbuild, not typechecked): pass just what render reads.
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
  id: "cfg_recipe",
  name: "recipe",
  onChange: () => {},
  options: { emptyValue: "" },
  rawErrors: [],
};

export const Filled = () => (
  <Demo>
    <div style={{ width: 260 }}>
      <TextWidget {...base} value="mod-swooper-maps/standard" placeholder="recipe id" />
    </div>
  </Demo>
);

export const Disabled = () => (
  <Demo>
    <div style={{ width: 260 }}>
      <TextWidget {...base} value="mod-swooper-maps/standard" disabled />
    </div>
  </Demo>
);
