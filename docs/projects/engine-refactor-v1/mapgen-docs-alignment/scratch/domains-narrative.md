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
- **Observed gap:** the *standard recipe* does **not** currently include `narrativeDomain` in `collectCompileOps(...)`, and there are no `artifact:narrative.*` contracts in `mods/mod-swooper-maps/src/recipes/standard/stages/**` (at least by direct `defineArtifact({ id: "artifact:narrative..." })` scan).
- Hypothesis: narrative is either (a) currently unused by the standard recipe, (b) integrated indirectly (not via the op system), or (c) planned/target-doc-only (needs doc alignment either way).
