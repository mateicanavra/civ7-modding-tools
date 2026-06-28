import { SchemaConfigForm } from "mapgen-studio";

// SchemaConfigForm is the config-authoring ENGINE: it takes a JSON-schema-ish
// `schema` + a matching `value`, derives an rjsf uiSchema (boolean→switch,
// string-enum→select, enum-array→tagSelect, long-string→textarea, …), and
// renders the already-synced BrowserConfig* templates + widgets through
// @rjsf/core with an ajv8 validator. This is the working WHOLE the Batch-2
// parts compose into. The fixture is a representative civ7 mapgen config block
// — every widget + template node is exercised against real data. No server,
// no oRPC: schema + value are plain props (exactly how RecipePanel feeds it).

// A representative published-config-style schema. Each branch targets one
// widget/template path so the card shows the full vocabulary:
//   string-enum → select · enum-array → tagSelect · boolean → switch
//   number → number · long string (maxLength≥160) → textarea
//   object → ObjectFieldTemplate (disclosure group) · array-of-object → ArrayFieldTemplate
const schema = {
  type: "object",
  properties: {
    climate: {
      type: "object",
      title: "Climate",
      properties: {
        model: {
          type: "string",
          title: "Model",
          enum: ["earthlike", "arid", "tropical", "frozen"],
        },
        rainfall: { type: "number", title: "Rainfall" },
        enableRivers: { type: "boolean", title: "Enable Rivers" },
        biomes: {
          type: "array",
          title: "Biomes",
          // uniqueItems marks this as a tag-set: rjsf then surfaces items.enum
          // as enumOptions so the tagSelect widget renders selectable chips
          // (matching how the real config schema expresses multi-selects).
          uniqueItems: true,
          items: {
            type: "string",
            enum: ["tundra", "grassland", "desert", "rainforest", "marsh"],
          },
        },
        notes: {
          type: "string",
          title: "Notes",
          maxLength: 200,
        },
      },
    },
    landmass: {
      type: "object",
      title: "Landmass",
      properties: {
        waterPercent: { type: "number", title: "Water Percent" },
        continents: { type: "number", title: "Continents" },
        islands: {
          type: "array",
          title: "Islands",
          items: {
            type: "object",
            properties: {
              name: { type: "string", title: "Name" },
              size: {
                type: "string",
                title: "Size",
                enum: ["small", "medium", "large"],
              },
            },
          },
        },
      },
    },
  },
};

const value = {
  climate: {
    model: "earthlike",
    rainfall: 0.6,
    enableRivers: true,
    biomes: ["grassland", "rainforest"],
    notes: "Temperate baseline with elevated coastal moisture.",
  },
  landmass: {
    waterPercent: 0.62,
    continents: 3,
    islands: [
      { name: "Aurelia", size: "medium" },
      { name: "Borealis", size: "small" },
    ],
  },
};

// Collapse plumbing present + everything expanded → the form renders its real
// disclosure chrome (group headers with chevrons), exactly as RecipePanel
// mounts it. `expandedPointers` is consumed as a Set-like (`.has(pointer)`);
// `{ has: () => true }` forces "all open" without replicating pointer strings.
const allExpanded = { expandedPointers: { has: () => true }, toggle: () => {} };

// The form lives inside the RecipePanel config section (a popover-surface
// column); frame it the same way so the recessed slabs read on the right tier.
function Panel({ children }) {
  return (
    <div
      className="bg-popover text-foreground border border-border"
      style={{ width: 384, borderRadius: 8, overflow: "hidden" }}
    >
      <div className="px-3 py-3">{children}</div>
    </div>
  );
}

// The whole engine: a multi-group config form driven by schema + value.
export const ConfigForm = () => (
  <Panel>
    <SchemaConfigForm
      schema={schema}
      value={value}
      disabled={false}
      collapse={allExpanded}
      onChange={() => {}}
    />
  </Panel>
);

// focusPath narrows the engine to a single stage — RecipePanel uses this for
// per-step "focus mode" editing. Here it isolates the Climate group.
export const FocusedStage = () => (
  <Panel>
    <SchemaConfigForm
      schema={schema}
      value={value}
      focusPath={["climate"]}
      disabled={false}
      collapse={allExpanded}
      onChange={() => {}}
    />
  </Panel>
);
