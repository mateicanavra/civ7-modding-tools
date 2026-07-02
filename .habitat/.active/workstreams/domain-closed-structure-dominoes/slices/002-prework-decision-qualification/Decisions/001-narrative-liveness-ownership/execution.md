# Narrative Burn-Down Execution Plan

Status: execution-ready draft for the narrative liveness and ownership prework
decision.

This plan carries the four-slice cleanup sequence for the current
`mods/mod-swooper-maps/src/domain/narrative/**` network. It does not implement
the generic domain blueprint assertion, `structure.toml`, or Grit packets.

## Execution Frame

The objective is to remove the legacy MapGen story network from the source tree
through source-backed slices, leaving the generic domain blueprint work to
operate over the remaining domain roots.

The current production finding is stable:

- the standard recipe binds ecology, foundation, hydrology, morphology,
  placement, and resources ops;
- the standard recipe does not bind narrative ops;
- current `domain/narrative/**` behavior is reached by story tests and public
  barrels, not by the production recipe;
- Civ7 runtime/control narrative-choice code is a separate runtime-control
  surface and remains outside this cleanup.

Execution principle:

```text
consumer proof -> sealed row disposition -> exact delete/edit rows -> compatibility cleanup -> predeclared checks
```

No slice selects tests after editing. Each slice starts with its listed checks,
executes only its write set, and closes with the same checks plus `git diff
--check`.

## Global Preflight

Run at the start of any implementation turn:

```bash
git status --short
bun habitat classify mods/mod-swooper-maps/src/domain/narrative
bun habitat classify packages/mapgen-core/src/core/types.ts
find mods/mod-swooper-maps/src/domain/narrative -type f | sort
rg -n "storyEnabled|StoryOverlaySnapshot|StoryOverlayRegistry|@mapgen/domain/narrative|domain/narrative|narrative/config|storyTag|CorridorsConfigSchema|zonalWindStep" mods packages -g '*.ts'
```

Preflight passes when the implementation worktree contains no unrelated
uncommitted source changes and the query output still matches this packet's
source inventory. If the query output changes, update this packet before editing
source.

## Slice 1: Mechanical Shell Deletion

### Objective

Delete the narrative domain registration shell and unused wind helper while
leaving the behavior-bearing story exports in place for Slice 2.

### Write Set

Delete:

- `mods/mod-swooper-maps/src/domain/narrative/ops.ts`
- `mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/narrative/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/narrative/orogeny/wind.ts`

Edit:

- `mods/mod-swooper-maps/src/domain/narrative/index.ts`
- `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts`

Protected in this slice:

- `mods/mod-swooper-maps/src/domain/index.ts`
- `mods/mod-swooper-maps/src/domain/config.ts`
- `mods/mod-swooper-maps/test/story/**`
- `packages/mapgen-core/src/core/types.ts`
- `mods/mod-swooper-maps/src/recipes/standard/runtime.ts`

### Tasks

- Remove the `ops` import, `defineDomain({ id: "narrative", ops })` value, and
  default export from `domain/narrative/index.ts`.
- Keep the current story exports from `domain/narrative/index.ts` intact.
- Remove the wildcard export from
  `domain/narrative/orogeny/wind.ts` in `domain/narrative/orogeny/index.ts`.
- Delete the three empty ops-shell files and `orogeny/wind.ts`.

### Acceptance Criteria

- No file exists at any deleted path.
- `domain/narrative/index.ts` no longer creates or exports a domain object.
- `domain/narrative/orogeny/index.ts` exports only story network material that
  still exists.
- Source imports do not reference narrative ops shell files or
  `orogeny/wind.ts`.
- Story tests remain present and continue to define the behavior-bearing network
  for Slice 2.

### Tests

```bash
test ! -e mods/mod-swooper-maps/src/domain/narrative/ops.ts
test ! -e mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts
test ! -e mods/mod-swooper-maps/src/domain/narrative/ops/index.ts
test ! -e mods/mod-swooper-maps/src/domain/narrative/orogeny/wind.ts
! rg -n "defineDomain\\(|id: \"narrative\"|@mapgen/domain/narrative/ops|domain/narrative/ops|orogeny/wind|zonalWindStep|from [\"']\\./ops" mods/mod-swooper-maps/src mods/mod-swooper-maps/test packages -g '*.ts'
bun --cwd mods/mod-swooper-maps test test/story
nx run mod-swooper-maps:check
git diff --check
```

## Slice 2: Story Network Disposition

### Objective

Seal the story network as `delete-current-implementation` before source
deletion. This slice updates the decision packet; it does not change production
source.

This is the authority gate between liveness evidence and deletion. The current
implementation is removed as legacy MapGen story code. No behavior is ported,
aliased, or preserved through a Gameplay bucket in this cleanup.

### Write Set

Edit:

- `synthesis/disposition-table.md`
- `corpus/narrative-source-inventory.md` only if preflight source inventory
  changed
- `evidence/narsil-graph.md` or `evidence/knip-dead-code.md` only if rerun
  evidence changes the cited proof
- `reviews/review-findings.md` if fresh review findings are added

Protected in this slice:

- `mods/**`
- `packages/**`
- `tools/**`

### Row Disposition To Seal

| Row class | Action | Required collateral | Survivors |
| --- | --- | --- | --- |
| Story config and model files | Delete, no replacement | root config barrel removed in Slice 3 | none |
| Corridors source files | Delete, no replacement | story corridor tests removed in Slice 3 | none |
| Orogeny source files after Slice 1 | Delete, no replacement | story orogeny tests removed in Slice 3 | none |
| Overlay registry/source files | Delete, no replacement | story overlay tests removed in Slice 3; overlay compatibility types removed in Slice 4 | none |
| Tagging source files | Delete, no replacement | no collateral beyond directory deletion | none |
| Narrative utils | Delete, no replacement | no collateral beyond directory deletion | none |
| `domain/narrative/index.ts` story exports | Delete with root narrative tree | root domain barrel removed in Slice 3 | none |
| `mods/mod-swooper-maps/test/story/**` | Delete as compatibility tests for removed implementation | none | none |
| Root domain/config narrative collars | Remove exports | narrative tree deletion in Slice 3 | other domain exports |
| Direct-control/control-oRPC/CLI narrative-choice code | No action in this cleanup | none | all current runtime-control files |
| Placement/hydrology narrative wording | No action in this cleanup | none | current placement/hydrology source wording |

### Tasks

- Re-run consumer proof for story exports, narrative config, and story tests.
- Confirm production source has no caller outside root public collars and
  `domain/narrative/**`.
- Confirm test callers are limited to `mods/mod-swooper-maps/test/story/**`.
- Confirm direct-control, control-oRPC, and CLI narrative-choice code does not
  import MapGen `domain/narrative/**`.
- Update `synthesis/disposition-table.md` so behavior-bearing story rows say
  `Delete current implementation, no replacement in this cleanup`.
- Preserve the separate future concept as architecture context only: future
  Gameplay/story-artifact design can reintroduce a new implementation from its
  own law; it does not retain this source network.

### Acceptance Criteria

- Every current story-network row is assigned to Slice 3 deletion or Slice 4
  compatibility cleanup.
- The disposition table contains no instruction to move story code into a fake
  Gameplay bucket.
- Public barrels are classified as collars, not production callers.
- Tests are classified as compatibility evidence for the removed
  implementation, not production liveness.
- Runtime-control narrative-choice files and placement/hydrology wording are
  explicitly out of the write set.

### Tests

```bash
find mods/mod-swooper-maps/src/domain/narrative -type f | sort
find mods/mod-swooper-maps/test/story -type f | sort
rg -n "@mapgen/domain/narrative|@mapgen/domain/narrative/config\\.js|domain/narrative|storyTag|StoryOverlay|NarrativeConfig|CorridorsConfigSchema" mods/mod-swooper-maps/src packages --glob '!mods/mod-swooper-maps/src/domain/narrative/**' --glob '!**/dist/**' --glob '!**/mod/**'
rg -n "@mapgen/domain/narrative|storyTag|StoryOverlay|CorridorsConfigSchema" mods/mod-swooper-maps/test --glob '!mods/mod-swooper-maps/test/story/**'
rg -n "CHOOSE_NARRATIVE_STORY_DIRECTION|narrative-choice|choose-narrative|narrative-request" packages/civ7-direct-control packages/civ7-control-orpc packages/cli -g '*.ts'
bunx knip --workspace mods/mod-swooper-maps --include files,exports,types --reporter compact --no-progress --no-exit-code --max-show-issues 500
bun habitat classify .habitat/.active
git diff --check -- .habitat/.active
```

Expected grep result: non-story production source shows root collars or no
MapGen narrative-domain consumers; non-story tests show no consumers of the
story network; runtime-control narrative-choice code remains present and
separate.

## Slice 3: Story Network Deletion

### Objective

Delete the remaining MapGen narrative source network and story-specific tests,
then remove the public barrels that exposed them.

Slice 3 starts only after Slice 2 has sealed `delete-current-implementation` in
the disposition table.

### Write Set

Delete:

- `mods/mod-swooper-maps/src/domain/narrative/config.ts`
- `mods/mod-swooper-maps/src/domain/narrative/models.ts`
- `mods/mod-swooper-maps/src/domain/narrative/corridors/**`
- `mods/mod-swooper-maps/src/domain/narrative/orogeny/**`
- `mods/mod-swooper-maps/src/domain/narrative/overlays/**`
- `mods/mod-swooper-maps/src/domain/narrative/tagging/**`
- `mods/mod-swooper-maps/src/domain/narrative/utils/**`
- `mods/mod-swooper-maps/src/domain/narrative/index.ts`
- `mods/mod-swooper-maps/test/story/**`

Edit:

- `mods/mod-swooper-maps/src/domain/index.ts`
- `mods/mod-swooper-maps/src/domain/config.ts`

Protected in this slice:

- `packages/mapgen-core/src/core/types.ts`
- `mods/mod-swooper-maps/src/recipes/standard/runtime.ts`
- direct-control/control-oRPC/CLI narrative-choice files
- placement/hydrology narrative wording

### Tasks

- Delete the remaining `domain/narrative` directory.
- Delete the story test directory.
- Remove the `narrative` export from `mods/mod-swooper-maps/src/domain/index.ts`.
- Remove the narrative config export from
  `mods/mod-swooper-maps/src/domain/config.ts`.

### Acceptance Criteria

- No `mods/mod-swooper-maps/src/domain/narrative` directory remains.
- No `mods/mod-swooper-maps/test/story` directory remains.
- TypeScript source does not import or export `@mapgen/domain/narrative`,
  `domain/narrative/**`, or `./narrative/config.js`.
- Public domain/config barrels expose only remaining live domain roots.
- Runtime-control narrative-choice code remains present and unmodified.

### Tests

```bash
test ! -e mods/mod-swooper-maps/src/domain/narrative
test ! -e mods/mod-swooper-maps/test/story
! rg -n "@mapgen/domain/narrative|domain/narrative|\\.\\/narrative\\/config\\.js|storyTagStrategicCorridors|storyTagOrogenyBelts|STORY_OVERLAY_KEYS|CorridorsConfigSchema|NarrativeConfigSchema" mods/mod-swooper-maps/src mods/mod-swooper-maps/test packages --glob '!**/dist/**' --glob '!**/mod/**' -g '*.ts'
rg -n "CHOOSE_NARRATIVE_STORY_DIRECTION|narrative-choice|choose-narrative|narrative-request" packages/civ7-direct-control packages/civ7-control-orpc packages/cli -g '*.ts'
bun habitat classify mods/mod-swooper-maps/src/domain
nx run mod-swooper-maps:check
nx run mod-swooper-maps:test -- --runInBand
git diff --check
```

## Slice 4: Connected Compatibility Cleanup

### Objective

Remove compatibility state that existed to support the deleted MapGen story
overlay network.

This is a cross-package slice. It removes the compatibility surface outright:
there is no `storyEnabled` option, no `runtime.storyEnabled`, no `ctx.overlays`,
no story overlay types, and no compatibility aliases.

### Write Set

Edit:

- `packages/mapgen-core/src/core/types.ts`
- `mods/mod-swooper-maps/src/recipes/standard/runtime.ts`
- current callers that initialize `storyEnabled`

Current `storyEnabled` caller set from source inspection:

- `mods/mod-swooper-maps/src/dev/diagnostics/placement-metrics.ts`
- `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts`
- `mods/mod-swooper-maps/src/dev/diagnostics/run-standard-dump.ts`
- `mods/mod-swooper-maps/src/dev/viz/standard-run.ts`
- `mods/mod-swooper-maps/test/placement/resources-landmass-region-restamp.test.ts`
- `mods/mod-swooper-maps/test/placement/landmass-region-id-projection.test.ts`
- `mods/mod-swooper-maps/test/hydrology-seasonality-modes.test.ts`
- `mods/mod-swooper-maps/test/support/world-balance-stats.ts`
- `mods/mod-swooper-maps/test/placement/placement-does-not-call-generate-snow.test.ts`
- `mods/mod-swooper-maps/test/standard-run.test.ts`
- `mods/mod-swooper-maps/test/hydrology-knobs.test.ts`
- `mods/mod-swooper-maps/test/pipeline/seed-matrix-stats.test.ts`
- `mods/mod-swooper-maps/test/hydrology-dryness-effects.test.ts`
- `mods/mod-swooper-maps/test/support/ecology-fixtures.ts`
- `mods/mod-swooper-maps/test/pipeline/mountains-nonzero-probe.test.ts`
- `mods/mod-swooper-maps/test/pipeline/standard-rng-authority.test.ts`
- `mods/mod-swooper-maps/test/placement/viz-coverage.test.ts`
- `mods/mod-swooper-maps/test/pipeline/circulation-v2.integration.test.ts`
- `mods/mod-swooper-maps/test/ecology/biomes-latcutoff-regression.test.ts`
- `mods/mod-swooper-maps/test/pipeline/hydrology-river-network-metrics.test.ts`
- `mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts`
- `mods/mod-swooper-maps/test/pipeline/earth-metrics.test.ts`
- `mods/mod-swooper-maps/test/pipeline/validation-harness.test.ts`
- `mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts`
- `mods/mod-swooper-maps/test/map-hydrology/lakes-area-recalc-resources.test.ts`
- `mods/mod-swooper-maps/test/morphology/m11-volcanoes-truth-contract.test.ts`
- `mods/mod-swooper-maps/test/morphology/earthlike-coasts-smoke.test.ts`
- `mods/mod-swooper-maps/test/morphology/tracing-observability-smoke.test.ts`
- `mods/mod-swooper-maps/test/ecology/biomes-stripes-regression.test.ts`

Protected in this slice:

- direct-control/control-oRPC/CLI narrative-choice files
- placement/hydrology narrative wording

### Tasks

- Remove `StoryOverlaySnapshot` and `StoryOverlayRegistry` from
  `packages/mapgen-core/src/core/types.ts`.
- Remove `ExtendedMapContext.overlays` and its default initialization from
  `createExtendedMapContext`.
- Remove `storyEnabled` from the standard runtime state/init types,
  default runtime value, and runtime initializer assignment.
- Remove every `storyEnabled` initializer argument from dev diagnostics, viz,
  support fixtures, and tests.

### Acceptance Criteria

- `ExtendedMapContext` exposes no story overlay registry state.
- `createExtendedMapContext` initializes no story overlay state.
- Standard runtime stores and accepts no `storyEnabled` value.
- TypeScript source references none of `StoryOverlaySnapshot`,
  `StoryOverlayRegistry`, `ExtendedMapContext.overlays`, `.overlays`, or
  `storyEnabled`.
- Direct-control/control-oRPC/CLI narrative-choice surfaces remain intact.

### Tests

```bash
! rg -n "StoryOverlaySnapshot|StoryOverlayRegistry|storyEnabled\\b|ctx\\.overlays|\\.overlays|overlays: StoryOverlayRegistry|overlays\\?: StoryOverlayRegistry|overlays:" packages/mapgen-core/src packages/mapgen-core/test mods/mod-swooper-maps/src mods/mod-swooper-maps/test --glob '!**/dist/**' --glob '!**/mod/**' -g '*.ts'
rg -n "CHOOSE_NARRATIVE_STORY_DIRECTION|narrative-choice|choose-narrative|narrative-request" packages/civ7-direct-control packages/civ7-control-orpc packages/cli -g '*.ts'
bun habitat classify packages/mapgen-core/src/core/types.ts
bun habitat classify mods/mod-swooper-maps/src/recipes/standard/runtime.ts
nx run mapgen-core:check
nx run mapgen-core:test
nx run mod-swooper-maps:check
nx run mod-swooper-maps:test -- --runInBand
git diff --check
```

## Closure

The narrative burn-down closes when all four slices pass their acceptance
criteria and tests, and these final checks hold:

```bash
test ! -e mods/mod-swooper-maps/src/domain/narrative
test ! -e mods/mod-swooper-maps/test/story
! rg -n "@mapgen/domain/narrative|domain/narrative|StoryOverlaySnapshot|StoryOverlayRegistry|storyEnabled\\b|storyTag|NarrativeConfigSchema|CorridorsConfigSchema" mods packages --glob '!**/dist/**' --glob '!**/mod/**' -g '*.ts'
rg -n "CHOOSE_NARRATIVE_STORY_DIRECTION|narrative-choice|choose-narrative|narrative-request" packages/civ7-direct-control packages/civ7-control-orpc packages/cli -g '*.ts'
nx run mapgen-core:check
nx run mapgen-core:test
nx run mod-swooper-maps:check
nx run mod-swooper-maps:test -- --runInBand
bun habitat classify .habitat/.active
git diff --check
```

At closure, narrative contributes no special instance rule to the domain
blueprint. The closed-structure work resumes through the generic domain scope
assertion over the remaining domain roots.
