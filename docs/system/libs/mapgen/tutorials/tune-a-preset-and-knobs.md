<toc>
  <item id="purpose" title="Purpose"/>
  <item id="what-youll-learn" title="What you’ll learn"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="walkthrough" title="Walkthrough"/>
  <item id="verification" title="Verification"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Tutorial: tune a complete recipe config

## Purpose

Learn the author workflow for changing map realism posture safely:

1. select a known complete config,
2. adjust author-facing values or **knobs**,
3. validate quickly in Studio with deterministic runs,
4. save or export the resulting complete config.

## What you’ll learn

- Where canonical configs live and how Studio selects them.
- How to use Studio as the feedback loop for knob tuning.
- How to correlate a knob change to its recipe-owned implementation.

## Prereqs

- You can run Studio locally: `nx run mapgen-studio:dev`
- You understand the schema split:
  - [`docs/system/libs/mapgen/reference/RECIPE-SCHEMA.md`](/system/libs/mapgen/reference/RECIPE-SCHEMA.md)
  - [`docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`](/system/libs/mapgen/reference/CONFIG-COMPILATION.md)

## Walkthrough

### 1) Select a complete baseline config

Select one of the canonical map configs in Studio. Selection replaces the
editor value with the complete config carried by that catalog entry. It does
not merge a sparse profile into schema defaults.

The recipe also publishes one complete default config generated from its
executable TypeBox schema. Default generation is recipe-owned; Studio admission
only validates complete JSON.

### 2) Pick one value to change

Pick one knob and change it by one step (avoid multiple simultaneous changes initially).

Example targets:

- change a high-level stage knob when the recipe exposes one,
- otherwise change the specific author-facing stage value that owns the
  behavior.

In Studio:

- ensure Mode is `Browser` (live run),
- select the baseline config,
- enable config editing,
- use Form view for ordinary edits or JSON view to inspect the complete value.

### 3) Run and compare in Studio (fixed seed)

In Studio:

- select recipe: `mod-swooper-maps/standard`
- set a fixed seed
- apply your config changes in the editor
- run and inspect differences via trace/viz (deck.gl)

Repeat until you’re satisfied with the semantic tuning.

### 4) Save or export the complete result

Save, Save As, import, export, browser execution, Deploy, and Run in Game all
operate on a complete config or its canonical envelope. No boundary applies
defaults or overlays after selection.

## Verification

- Your change is reproducible with the same seed.
- You can point to the recipe-owned translation or operation that applies the
  changed value.
- You didn’t introduce schema drift (config compilation remains strict-valid).
- Exported JSON is complete and can be admitted unchanged.

## Ground truth anchors

- Canonical map configs: `mods/mod-swooper-maps/src/maps/configs/`
- Recipe-owned schema and complete default artifact: `mods/mod-swooper-maps/src/recipes/standard/artifacts.ts`
- Standard recipe definition: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Studio catalog: `apps/mapgen-studio/src/recipes/catalog.ts`
- Studio config editor: `packages/mapgen-studio-ui/src/components/panels/RecipePanel.tsx`
- Exact Studio admission: `apps/mapgen-studio/src/features/configAuthoring/canonicalConfig.ts`
