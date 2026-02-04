<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="mental-model" title="Mental model (knobs vs advanced)"/>
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

## Mental model (knobs vs advanced)

Each stage has a surface schema shaped like:

- `knobs`: small semantic enums (author-friendly)
- `advanced`: deep per-step config overrides (expert-only)

Contract (stage-level posture):
- `advanced` is the baseline (schema-defaulted + authored overrides).
- `knobs` apply **last**, as deterministic transforms over that baseline.
Foundation additionally exposes `profiles` in its public schema; profiles select the baseline defaults that `knobs` then refine.

## Checklist

### 1) Start from an existing realism preset (recommended)

Pick a preset config file and use it as your starting point:
- `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts`
- `mods/mod-swooper-maps/src/maps/presets/realism/young-tectonics.config.ts`
- `mods/mod-swooper-maps/src/maps/presets/realism/old-erosion.config.ts`

### 2) Edit stage knob values (not advanced step config)

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
- `bun run dev:mapgen-studio`

Then:
- select `mod-swooper-maps/standard`,
- apply your knob changes through the config UI (or by routing your preset into Studio in a future feature slice),
- run with a fixed seed,
- compare before/after via trace/viz.

## Verification

- With a fixed seed, your knob changes produce a deterministic, explainable shift in outcomes (not random noise).
- The run still compiles and validates (no schema errors).
- You can identify where each knob is applied (normalize-time multipliers/transforms), using the anchors below.

## Ground truth anchors

- Preset configs (author surface): `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts`
- Foundation stage surface schema (knobs vs advanced, “knobs apply last” statement): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- Morphology erosion knob application (normalize-time multiplier): `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology.ts`
- Morphology erosion knob multipliers: `mods/mod-swooper-maps/src/domain/morphology/shared/knob-multipliers.ts`
- Studio knob option enums (UI): `apps/mapgen-studio/src/ui/constants/options.ts`
