<toc>
  <item id="purpose" title="Purpose"/>
  <item id="what-youll-learn" title="What you’ll learn"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="walkthrough" title="Walkthrough"/>
  <item id="verification" title="Verification"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Tutorial: tune a preset and knobs

## Purpose

Learn the “author workflow” for changing map realism posture safely:

1) start from a known preset config,
2) adjust only **knobs** first (semantic, stable),
3) validate quickly in Studio with deterministic runs,
4) only then reach for advanced step config overrides.

## What you’ll learn

- Where presets live (today) and how they relate to the standard recipe config.
- How to use Studio as the feedback loop for knob tuning.
- How to “prove” a knob change by correlating to code anchors (no guessing).

## Prereqs

- You can run Studio locally: `bun run dev:mapgen-studio`
- You understand the schema split:
  - [`docs/system/libs/mapgen/reference/RECIPE-SCHEMA.md`](/system/libs/mapgen/reference/RECIPE-SCHEMA.md)
  - [`docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`](/system/libs/mapgen/reference/CONFIG-COMPILATION.md)

## Walkthrough

### 1) Establish your baseline (“preset”)

In Studio today, the pipeline config UI starts from **schema defaults** (not from a curated preset dropdown).

This means “baseline preset” is effectively:
- “whatever defaults the recipe config schema defines” (plus any schema defaulted enums)

If you want a curated baseline that can be shared as code, authors can still write and maintain a “preset config object”
alongside a recipe (example below). Today you apply it by copying values into Studio’s JSON view.

Example curated preset object (realism/earthlike):

```ts
export const realismEarthlikeConfig = {
  foundation: {
    knobs: { plateCount: 28, plateActivity: 0.5 },
  },
  "morphology-coasts": { knobs: { seaLevel: "water-heavy", coastRuggedness: "normal", shelfWidth: "narrow" } },
  "morphology-erosion": { knobs: { erosion: "normal" } },
  "morphology-features": { knobs: { volcanism: "normal" } },
  "hydrology-climate-baseline": {
    knobs: { dryness: "dry", temperature: "temperate", seasonality: "normal", oceanCoupling: "earthlike" },
  },
  "hydrology-hydrography": { knobs: { riverDensity: "normal" } },
  "hydrology-climate-refine": { knobs: { dryness: "dry", temperature: "temperate", cryosphere: "on" } },
  "map-morphology": { knobs: { orogeny: "normal" } },
};
```

Source: `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts`

### 2) Enable overrides and pick one knob to change

Pick one knob and change it by one step (avoid multiple simultaneous changes initially).

Example targets:
- more plates → increase `foundation.knobs.plateCount`
- rougher coasts → increase `morphology-coasts.knobs.coastRuggedness`
- wetter world → change `hydrology-*.knobs.dryness`

In Studio:
- ensure Mode is `Browser` (live run)
- in the left panel, open **Config** and keep it switched **On** (overrides enabled)
- use Form view for enums, or switch to JSON view to paste an entire “preset object”

### 3) Run and compare in Studio (fixed seed)

In Studio:
- select recipe: `mod-swooper-maps/standard`
- set a fixed seed
- apply your knob changes (via the config UI)
- run and inspect differences via trace/viz (deck.gl)

Repeat until you’re satisfied with the semantic tuning.

### 4) Escalate to advanced overrides only when necessary

If knob tuning can’t express what you need:
- identify the specific step you need to override (in the standard recipe stage you care about),
- override only that step config subtree (stage-dependent; see below),
- re-run with the same seed to validate the change.

Concrete stage schema posture (Foundation, current standard recipe):

```ts
export default createStage({
  id: "foundation",
  knobsSchema: Type.Object({
    plateCount: Type.Optional(FoundationPlateCountKnobSchema),
    plateActivity: Type.Optional(FoundationPlateActivityKnobSchema),
  }),
  steps: [/* per-step contracts */],
});
```

Interpretation:
- `foundation.knobs.*` expresses semantic, stable tuning.
- Foundation does **not** wrap step overrides under `advanced`; per-step overrides (when required) live directly under `foundation.<stepId>`.
- Many other stages expose a single `advanced` object specifically for step-level override baselines (e.g. `morphology-coasts.advanced.<stepId>`).
- Knobs apply as deterministic transforms (typically in `normalize`) over the defaulted baseline + any overrides.

## Verification

- Your change is reproducible with the same seed.
- You can point to exactly where the knob is applied (normalize-time transform or mapping).
- You didn’t introduce schema drift (config compilation remains strict-valid).

## Ground truth anchors

- Preset config example: `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts`
- Studio knob option enums (UI): `apps/mapgen-studio/src/ui/constants/options.ts`
- Studio config defaulting from schema defaults: `apps/mapgen-studio/src/App.tsx`
- Studio config overrides UI (On/Off + Form/JSON): `apps/mapgen-studio/src/ui/components/RecipePanel.tsx`
- Stage schema examples:
  - knobs-only (Foundation): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
  - advanced step overrides (Morphology-coasts): `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/index.ts`
  - advanced step overrides (Map-hydrology): `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts`
- Example knob application at normalize-time (reads `ctx.knobs`): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- Example knob multiplier tables (Foundation): `mods/mod-swooper-maps/src/domain/foundation/shared/knob-multipliers.ts`
- Standard recipe config types: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
