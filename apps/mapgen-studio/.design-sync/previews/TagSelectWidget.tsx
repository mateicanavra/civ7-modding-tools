import { TagSelectWidget } from "mapgen-studio";

// TagSelectWidget is the multi-select pill row — the RJSF registry's Checkboxes/
// tagSelect target. Each enum option is a toggle pill: muted inset at rest, the one
// primary fill when active, luminance contour ring on focus. The novel reusable
// control of this cluster (no raw DS primitive equivalent). Runtime-only mocks.
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
  id: "cfg_biomes",
  name: "biomes",
  onChange: () => {},
  options: {
    emptyValue: [],
    enumOptions: [
      { value: "temperate", label: "Temperate" },
      { value: "arid", label: "Arid" },
      { value: "wet", label: "Wet" },
      { value: "tropical", label: "Tropical" },
      { value: "tundra", label: "Tundra" },
      { value: "alpine", label: "Alpine" },
    ],
  },
};

export const Selection = () => (
  <Demo>
    <div style={{ width: 320 }}>
      <TagSelectWidget {...base} value={["temperate", "wet", "alpine"]} />
    </div>
  </Demo>
);

export const Disabled = () => (
  <Demo>
    <div style={{ width: 320 }}>
      <TagSelectWidget {...base} value={["arid", "tundra"]} disabled />
    </div>
  </Demo>
);
