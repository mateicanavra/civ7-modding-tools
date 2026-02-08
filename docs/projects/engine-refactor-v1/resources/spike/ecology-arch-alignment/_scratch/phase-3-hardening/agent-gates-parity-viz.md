# Agent C: Gates, Parity, Determinism, DeckGL/Viz Compatibility

## Objective

Define the “must-not-break” surfaces and the concrete gates we will enforce per slice for the Ecology refactor:
- behavior-preserving parity posture
- determinism / RNG labeling invariants
- DeckGL / Studio viz key compatibility (`dataTypeKey`, `spaceId`, kinds)
- import-ban guardrails (no step deep imports of domain ops)

This is plan hardening, not implementation.

## Deliverable (write here)

1. **Baseline commands** (known-good build+test order) and expected outcomes.
2. **Parity strategy**: what to diff (and what not to diff), including artifact-level and viz-key-level checks.
3. **Determinism invariants**:
   - step seed labels that must remain unchanged
   - any per-op label RNG usage to preserve (e.g., `createLabelRng` label keys)
4. **Viz compatibility surface**:
   - current ecology/map-ecology `dataTypeKey` list
   - any group/meta taxonomies used by Studio
5. **Per-slice gate table** (Prepare/Cutover/Cleanup).

For each non-obvious claim: include a file pointer.

## Starting Pointers

Feasibility + contract matrix:
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CONTRACT-MATRIX.md`
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/DECKGL-VIZ.md`

DeckGL posture:
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

Existing test baselines:
- `mods/mod-swooper-maps/test/ecology/*`

## Constraints

- Do not reindex Narsil MCP.
- Avoid ADRs as primary references.

## Findings (Draft, Evidence-Backed)

### 1) Baseline commands (known-good order)

These are the baseline gates recorded in `$SPIKE/FEASIBILITY.md`:

```bash
bun run --cwd packages/civ7-adapter build
bun run --cwd packages/mapgen-viz build
bun run --cwd packages/mapgen-core build
bun --cwd mods/mod-swooper-maps test test/ecology
```

Expected:
- all builds succeed
- ecology tests pass

### 2) Parity strategy (no behavior change)

Primary parity harness (deterministic dumps):
- `mods/mod-swooper-maps/src/dev/diagnostics/run-standard-dump.ts` (`bun run diag:dump`)
- `mods/mod-swooper-maps/src/dev/diagnostics/diff-layers.ts` (`bun run diag:diff`)

What we diff:
- all ecology truth stage layer emissions (see `DECKGL-VIZ.md`)
- all map-ecology emissions (see `DECKGL-VIZ.md`)

What we do *not* rely on for parity:
- internal module paths, op ids, or strategy wiring (these can change during refactor)

### 3) Determinism invariants (RNG labels)

Step-seed labels (must remain unchanged):
- `deriveStepSeed(context.env.seed, "ecology:planFeatureIntents")`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
- `deriveStepSeed(..., "ecology:planPlotEffects")`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/inputs.ts`

Label RNG behavior (critical mental model):
- `createLabelRng(seed)` maintains *independent* LCG state per label; order matters within each label.
  - `packages/mapgen-core/src/lib/rng/label.ts`

Op-level label keys (must remain unchanged; and per-label call order must be preserved):
- vegetated placement:
  - label: ``features:plan:vegetated:${featureKey}``
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/strategies/default.ts`
- wet placement:
  - labels: ``features:plan:wet:${featureKey}`` and `features:plan:wet:mangrove`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/strategies/default.ts`
- merged placement consolidation (map-ecology):
  - label: ``feature:${placement.feature}:${placement.x},${placement.y}``
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/strategies/default.ts`

### 4) Viz compatibility surface (keys + spaces)

Authoritative inventory: `$SPIKE/DECKGL-VIZ.md`.

Ecology truth stage keys (spaceId `tile.hexOddR`):
- `ecology.biome.*`:
  - `vegetationDensity`, `effectiveMoisture`, `surfaceTemperature`, `aridityIndex`, `freezeIndex`
  - `groundIce01`, `permafrost01`, `meltPotential01`, `treeLine01`
- `ecology.biome.biomeIndex`
- `ecology.pedology.soilType`, `ecology.pedology.fertility`
- `ecology.resourceBasins.resourceBasinId`
- `ecology.featureIntents.featureType` (points)

Map-ecology keys (spaceId `tile.hexOddR`):
- `map.ecology.biomeId`, `map.ecology.temperature`
- `map.ecology.featureType`
- `map.ecology.plotEffects.plotEffect`
- debug keys (treated as compatibility surface for this milestone):
  - `debug.heightfield.terrain`
  - `debug.heightfield.landMask`

### 5) Per-slice gate table (Prepare/Cutover/Cleanup)

Prepare:
- Gate G0 always green
- establish baseline dump + stable `dataTypeKey` inventory

Cutover:
- Gate G1/G2 enforce “no step deep imports”
- Gate G3/G4 prove behavior preservation and viz continuity

Cleanup:
- rerun all gates after deletion of shims/legacy paths
