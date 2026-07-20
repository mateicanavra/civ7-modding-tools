<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="mental-model" title="Mental model (knobs vs step config)"/>
  <item id="checklist" title="Checklist"/>
  <item id="verification" title="Verification"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: tune realism knobs

## Purpose

Tune the “realism” posture of the standard recipe by changing **stage knobs** (high-level semantic tuning inputs) without editing deep step config trees.

This is the intended **author surface** for “make the world more X” tuning.

Routes to:

- Recipe schema: [`docs/system/libs/mapgen/reference/RECIPE-SCHEMA.md`](/system/libs/mapgen/reference/RECIPE-SCHEMA.md)
- Config compilation: [`docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`](/system/libs/mapgen/reference/CONFIG-COMPILATION.md)
- Standard recipe reference: [`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`](/system/libs/mapgen/reference/STANDARD-RECIPE.md)

## Audience

- Authors who want to tune outcomes without extending SDK internals.
- Developers who need to keep knobs stable while changing implementations.

## Mental model (complete config and recipe translation)

The selected map config is one complete JSON value. A stage may expose small
semantic knobs or direct author-facing values, but every declared property is
present. Recipe-owned stage translation turns that complete public value into
internal step inputs before execution.

Studio never merges a sparse realism profile, reconstructs omitted values, or
defaults a config during admission.

## Checklist

### 1) Start from an existing complete config

Select one canonical config under
`mods/mod-swooper-maps/src/maps/configs/` and use its complete JSON value as
the baseline.

### 2) Edit stage knob values (not step config)

In your config object, change only stage `knobs` values (unless you have a specific reason to go deeper).

Examples of common “realism” knob sets (see anchors for exact ranges and mapping):

- `foundation.knobs.plateCount`: integer baseline (e.g., `20`–`36`)
- `foundation.knobs.plateActivity`: scalar `0..1` (e.g., `0.25` calmer, `0.5` baseline, `0.75` more active)
- `morphology-coasts.knobs.seaLevel`: `low | earthlike | high`
- `morphology-coasts.knobs.coastRuggedness`: `smooth | normal | rugged`
- `morphology-coasts.knobs.shelfWidth`: `narrow | normal | wide`
- `morphology-erosion.knobs.erosion`: `low | normal | high`
- `hydrology-*.knobs.dryness`: `wet | mix | dry`
- `hydrology-*.knobs.temperature`: `cold | temperate | hot`

### 3) Run in Studio to validate quickly

Use Studio as the canonical “author feedback loop”:

- `nx run mapgen-studio:dev`

Then:

- select `mod-swooper-maps/standard`,
- apply your changes through the complete config editor,
- run with a fixed seed,
- compare before/after via trace/viz.

## Verification

- With a fixed seed, your knob changes produce a deterministic, explainable shift in outcomes (not random noise).
- The run still compiles and validates (no schema errors).
- You can identify where each knob is applied (normalize-time multipliers/transforms), using the anchors below.

## Ground truth anchors

- Complete map configs: `mods/mod-swooper-maps/src/maps/configs/`
- Standard recipe schema and default artifact: `mods/mod-swooper-maps/src/recipes/standard/artifacts.ts`
- Standard recipe stage translation: `mods/mod-swooper-maps/src/recipes/standard/stages/`
- Studio complete config editor: `packages/mapgen-studio-ui/src/components/panels/RecipePanel.tsx`
