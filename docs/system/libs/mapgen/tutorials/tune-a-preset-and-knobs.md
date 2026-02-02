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
  - `docs/system/libs/mapgen/reference/RECIPE-SCHEMA.md`
  - `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`

## Walkthrough

### 1) Pick a starting preset

Open an existing preset config:
- `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts`

Read the header comment: it describes the intended posture and constraints.

### 2) Choose a tuning target and edit knobs

Pick one knob and change it by one step (avoid multiple simultaneous changes initially).

Example targets:
- more plates → increase `foundation.knobs.plateCount`
- rougher coasts → increase `morphology-mid.knobs.coastRuggedness`
- wetter world → change `hydrology-*.knobs.dryness`

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
- override only that step config subtree under `advanced`,
- re-run with the same seed to validate the change.

## Verification

- Your change is reproducible with the same seed.
- You can point to exactly where the knob is applied (normalize-time transform or mapping).
- You didn’t introduce schema drift (config compilation remains strict-valid).

## Ground truth anchors

- Preset config example: `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts`
- Studio knob option enums (UI): `apps/mapgen-studio/src/ui/constants/options.ts`
- Stage knob schema examples: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- Standard recipe config types: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
