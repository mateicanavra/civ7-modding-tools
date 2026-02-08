# Mental Map (Ecology Arch Alignment Spike)

## Explored

- BREADCRUMB: `docs/system/libs/mapgen/explanation/ARCHITECTURE.md` -> canonical layers model (domains/steps/stages/recipe/compile/execute/consumers) -> baseline for drift analysis.
- BREADCRUMB: `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md` -> “ops vs steps” separation + domain ownership rules -> baseline for “no orchestration in ops”.
- BREADCRUMB: `docs/system/libs/mapgen/reference/domains/ECOLOGY.md` -> expected ecology contract + anchors -> starting “target” for ecology.
- BREADCRUMB: `mods/mod-swooper-maps/src/domain/ecology/**` -> ecology op-module shape exists broadly (contract/types/rules/strategies/index) -> inventory needed to confirm compliance.
- BREADCRUMB: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/**` -> ecology truth stage steps exist: pedology, resource-basins, biomes, biome-edge-refine, features-plan -> likely drift in op bindings.
- BREADCRUMB: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**` -> projection stage applies engine-facing fields/effects and reifies from adapter -> viz compatibility surface lives here.
- BREADCRUMB: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` -> deck.gl viewer consumes emitted `dataTypeKey`/`spaceId`/kind; keys are a hard compatibility surface -> must be preserved by refactor.

## Partial

- `mods/mod-swooper-maps/src/recipes/standard/tags.ts` -> effect/tag registry likely used by ecology steps; need inventory.
- Stage/step contract correctness: some steps appear to import domain implementations directly (bypassing injected `ops` surface). Need full audit.

## Untouched

- Full artifact schema inventory for ecology truth artifacts (`artifacts.ts` + validation files).
- Full step contract inventory for both `ecology` and `map-ecology` (requires/provides + artifacts).
- Full op contract inventory (ids/kinds/strategies) and compliance against SPEC.
- Upstream/downstream dependency surface (what ecology requires from hydrology/morphology and what consumes ecology outputs).
- Parity/hardening harness evidence (what we can diff reliably without behavior change).

## Threads To Pull (Initial)

- Step <-> op binding correctness (no step should call an op it did not declare in its contract; steps should not import op implementations directly).
- Feature planning vs applying boundaries (plan in ops, orchestration in steps; projection-only adapter writes in map-ecology steps).
- Truth vs projection boundary (ecology vs map-ecology; no adapter calls in truth steps).
- Deck.gl/viz compatibility surface (`dataTypeKey`, `spaceId`, render kinds, layer grouping) and how ecology emission maps into Studio.
