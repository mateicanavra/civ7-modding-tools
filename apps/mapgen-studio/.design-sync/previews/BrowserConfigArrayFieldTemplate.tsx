import { BrowserConfigArrayFieldTemplate, FieldRow, Input } from "mapgen-studio";

// BrowserConfigArrayFieldTemplate is the config explorer's array section: the same
// flat disclosure-row anatomy as object groups, with the "Add" button riding the
// header's trailing action zone and hairline-divided item rows (no item boxes).
// RJSF ArrayFieldTemplateProps are runtime-only mocks — each item's `children` is
// the pre-rendered item element; the set-like forces "always expanded".
const noop = () => {};
const alwaysExpanded = { expandedPointers: { has: () => true }, toggle: noop };

function itemRow(label, value) {
  return (
    <FieldRow>
      <label className="text-data min-w-[96px] text-muted-foreground">
        <span className="font-medium">{label}</span>
      </label>
      <div className="flex-1 min-w-[120px]">
        <Input className="w-28 font-mono" defaultValue={value} aria-label={label} />
      </div>
    </FieldRow>
  );
}

const base = {
  title: "Hotspot seeds",
  canAdd: true,
  onAddClick: noop,
  disabled: false,
  readonly: false,
  schema: {},
  fieldPathId: { path: ["hotspots"] },
  registry: { formContext: { collapse: alwaysExpanded } },
};

function Demo({ children }) {
  return (
    <div
      className="bg-card border border-border text-foreground"
      style={{ width: 360, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const WithItems = () => (
  <Demo>
    <BrowserConfigArrayFieldTemplate
      {...base}
      items={[
        { key: "0", children: itemRow("seed 0", "0.42, 0.18") },
        { key: "1", children: itemRow("seed 1", "0.71, 0.66") },
      ]}
    />
  </Demo>
);

export const Empty = () => (
  <Demo>
    <BrowserConfigArrayFieldTemplate {...base} items={[]} />
  </Demo>
);
