<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="contracts" title="Contracts + artifacts"/>
  <item id="code-sources" title="Code sources"/>
  <item id="doc-sources" title="Doc/spec sources"/>
  <item id="drift" title="Drift + risks"/>
</toc>

# Scratch: MapGen domain — Narrative

## Questions
- Domain contract surface (inputs/outputs)?
- What stage/step(s) does Narrative own in the standard recipe?
- What cross-domain dependencies exist (and are they intended)?

## Local plan (this pass)
1. Confirm whether Narrative is intentionally *not wired* into the standard recipe (and if so, what the intended insertion point is).
2. Identify any existing narrative “signals” that are currently modeled as overlays or ad-hoc tags and whether they match the target “story entries” posture.
3. Cross-check target narrative contract docs:
   - `docs/system/libs/mapgen/narrative.md`
   - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-008-narrative-playability-contract-is-story-entry-artifacts-by-motif-views-derived-no-storytags-no-narrative-globals.md`
4. Decide what the docs should say *today* (target model vs current omission) to avoid misleading readers.

## Docs found

## Code touchpoints
- Domain implementation (mod-owned): `mods/mod-swooper-maps/src/domain/narrative/*`
- Domain ops (compile/runtime): `mods/mod-swooper-maps/src/domain/narrative/ops.ts`
- Standard recipe reference point: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`

## Notes
- **Observed gap (confirmed in code):**
  - The standard recipe does **not** import or register narrative ops:
    - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` `collectCompileOps(...)` includes `foundation/morphology/hydrology/ecology/placement` only.
  - There is no narrative stage under `mods/mod-swooper-maps/src/recipes/standard/stages/**`:
    - `find .../stages -iname '*narrative*'` returns no results.
  - There are no `artifact:narrative.*` artifact contracts in the standard recipe stages:
    - `rg -n "artifact:narrative" mods/mod-swooper-maps/src/recipes/standard/stages` returns no results.
- There is a “storyEnabled” runtime flag in standard runtime state:
  - `mods/mod-swooper-maps/src/recipes/standard/runtime.ts`
  - This looks like a future integration seam (or a legacy compat seam), but it is not currently backed by a narrative pipeline stage.

## What docs should say today (to avoid misleading readers)

- Treat Narrative as **target-canonical but currently not wired into the standard recipe pipeline**.
- In canonical docs:
  - Keep the target model (`docs/system/libs/mapgen/narrative.md` + ADR-ER1-008/025) as authority for “what Narrative is”.
  - Add an explicit “current integration status” section that says: “not in standard recipe yet” and points to the intended insertion point (to be decided).

## Doc/spec sources (authority)

- Narrative conceptual doc: `docs/system/libs/mapgen/narrative.md`
- Narrative/playability contract (locked): ADR-ER1-008:
  - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-008-narrative-playability-contract-is-story-entry-artifacts-by-motif-views-derived-no-storytags-no-narrative-globals.md`
- Overlays are non-canonical derived debug views: ADR-ER1-025:
  - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-025-ctx-overlays-remains-a-non-canonical-derived-debug-view-story-entry-artifacts-are-canonical.md`
