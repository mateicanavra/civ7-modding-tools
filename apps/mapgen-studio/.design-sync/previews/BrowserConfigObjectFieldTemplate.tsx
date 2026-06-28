import { BrowserConfigObjectFieldTemplate, FieldRow, Input } from "mapgen-studio";

// BrowserConfigObjectFieldTemplate is the config explorer's stage section: a
// full-bleed disclosure header (chevron when collapse plumbing is present) that
// opens a recessed slab. Scalar children render as one padded field run; object/
// array children render flush as their own rows (hairline-divided). RJSF
// ObjectFieldTemplateProps are runtime-only mocks — each property's `content` is
// pre-rendered; the set-likes force "always expanded / nothing transparent".
const noop = () => {};
const alwaysExpanded = { expandedPointers: { has: () => true }, toggle: noop };
const noTransparent = { has: () => false };

// A rendered scalar field that mirrors the real field-template output closely
// enough to read as authentic form content inside the slab.
function fieldContent(label, value) {
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

// An object/array child renders flush as its own group-eyebrow row.
function sectionContent(title) {
  return (
    <div className="px-2.5 py-2 text-label font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </div>
  );
}

const stageProps = {
  title: "Elevation",
  description: "Sea level, mountain density, and range placement.",
  fieldPathId: { path: ["elevation"] },
  schema: {
    type: "object",
    properties: {
      seaLevel: { type: "number" },
      mountainDensity: { type: "number" },
      ranges: { type: "array" },
    },
  },
  properties: [
    { name: "seaLevel", hidden: false, content: fieldContent("Sea Level", "0.6") },
    { name: "mountainDensity", hidden: false, content: fieldContent("Mountain Density", "0.3") },
    { name: "ranges", hidden: false, content: sectionContent("Ranges") },
  ],
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

export const ExpandedStage = () => (
  <Demo>
    <BrowserConfigObjectFieldTemplate
      {...stageProps}
      registry={{ formContext: { transparentPaths: noTransparent, collapse: alwaysExpanded } }}
    />
  </Demo>
);

export const WithoutCollapse = () => (
  <Demo>
    <BrowserConfigObjectFieldTemplate
      {...stageProps}
      registry={{ formContext: { transparentPaths: noTransparent } }}
    />
  </Demo>
);
