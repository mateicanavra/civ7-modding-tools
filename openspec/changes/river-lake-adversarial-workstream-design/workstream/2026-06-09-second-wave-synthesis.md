# Second-Wave Adversarial Synthesis

Date: 2026-06-09
Owner: Codex
Scope: six-agent follow-on wave framed with `framing-design`,
`investigation-design`, and the local `create-goal` skill

## Why This Exists

The first adversarial synthesis rebuilt the river/lake workstream at a high
level. This second wave was narrower and more prosecutorial:

- ground representative Earthlike thresholds in external Earth data;
- re-audit the actual Civ/runtime materialization surfaces;
- re-test the Morphology/Hydrology owner split against live code and stale
  authority;
- perform failure archaeology against the current and branch-local trees;
- redesign proof closure so "done" cannot be overclaimed again;
- tighten the knob/contract model around real product intent.

The six notes added in this wave are control inputs for the remaining execution
train, not optional commentary.

## Durable Note Set

- `agent-notes/2026-06-09-agent-1-earth-benchmarks-second-wave.md`
- `agent-notes/2026-06-09-agent-2-civ-materialization-second-wave.md`
- `agent-notes/2026-06-09-agent-3-upstream-ownership-second-wave.md`
- `agent-notes/2026-06-09-agent-4-failure-archaeology-second-wave.md`
- `agent-notes/2026-06-09-agent-5-verification-second-wave.md`
- `agent-notes/2026-06-09-agent-6-knob-contract-second-wave.md`

## Cross-Wave Reconciliation

One operational wrinkle matters:

- the second-wave subagents executed against the primary checkout at
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`;
- the active river stack lives in the dedicated worktree at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-mapgen-physical-rivers`.

That surfaced a real contradiction, not noise:

- the primary checkout still exposed stale authority around Morphology-owned
  routing truth;
- the river worktree already carries the newer branch-local authority,
  including `ADR-008`, that assigns canonical drainage routing to Hydrology.

Execution rule from this point forward:

- use the river worktree and its stacked branch state as the controlling
  implementation context;
- treat primary-checkout contradictions as stale-authority evidence that still
  needs cleanup or merge, not as a reason to backslide architecturally.

## Consolidated Findings

### 1. Earthlike acceptance must use benchmark families, not one scalar target

The Earth benchmark lane produced a usable family of constraints:

- resolved channel density should be treated as a scale-normalized band, not a
  single constant;
- non-perennial channels should remain globally common, not a niche edge case;
- endorheic drainage is globally material and should appear on large-interior
  worlds;
- lake area should stay in the low single digits of land area for normal
  Earthlike worlds, with definition-aware bands;
- major mouths and navigable trunks should be sparse and hierarchical, not
  evenly sprayed.

Working execution anchors from the sourced note:

- resolved-network density should be calibrated to a coarse world-equivalent
  band around `0.25-0.6 km/km^2`, with regime-aware interpretation;
- visibly resolved lake share should center around `1-4%` of land, with
  `1-6%` as a broad Earthlike band and `>8%` treated as exceptional;
- large-interior Earthlike ensembles should retain roughly `10-25%` internally
  drained land, while coast-dominated maps may legitimately sit lower;
- non-perennial/weak channels should dominate total routed network length even
  while major visible trunks remain a minority.

These are benchmark-family anchors for verification design, not one-step tuning
targets.

### 2. We directly stamp navigable-river terrain; we do not yet have proven minor-river Civ authoring

The runtime/materialization lane and the local code trace agree:

- `map-rivers/plotRivers.ts` directly stamps selected tiles to
  `TERRAIN_NAVIGABLE_RIVER`;
- Civ still owns validation, naming, area recalculation, and water-cache side
  effects after that stamping;
- official resources still show vanilla scripts using
  `TerrainBuilder.modelRivers(...)`, `defineNamedRivers()`, and
  `storeWaterData()`;
- minor-river Civ-facing materialization remains unproven;
- terrain readback, river metadata readback, and rendered visibility remain
  separate proof classes.

Practical implication:

- "we directly stamp rivers" is only true for the navigable-river terrain
  subset;
- it is false as a blanket statement for all Civ river semantics.

### 3. The deeper upstream boundary is now clear

Hydrology should own:

- pit handling;
- depression conditioning and spill routing;
- canonical `flowDir`;
- basin ids;
- terminal typing;
- contributing area/discharge;
- river-network classification;
- lake intent.

Morphology should own:

- topography and land/water form;
- bathymetry/substrate/coastline metrics;
- terrain depressions and basin precursors;
- any cheap routing-like helpers needed only by terrain-shaping consumers.

The old `artifact:morphology.routing` surface is therefore a proxy/helper
surface, not canonical water truth.

### 4. The break was not one bug; it was a failure chain

The archaeology lane identified the core chain:

1. Hydrology truth became tile-based and discharge-driven.
2. Visible-river repair was reframed around projection parity.
3. The repo inverted ownership from runtime river realization toward direct
   `TERRAIN_NAVIGABLE_RIVER` stamping.
4. Minor-vs-major semantics drifted from Civ metadata (`-1/0/1`) to repo-local
   tile intent (`0/1/2`).
5. Mocks and harness defaults masked the drift by treating navigable terrain as
   if it were equivalent to runtime river metadata.

This explains why terrain-readback improvements could coexist with user-visible
river failure.

### 5. Proof closure must be same-run and multi-class

The verification lane tightened the real closure ladder:

`hydrology-truth` -> `projection-plan` -> `terrain-readback` ->
`metadata-readback` -> `studio-visible` -> `civ-rendered` ->
`product-acceptance`

Critical rule:

- no lower proof class may be summarized as satisfying a higher one;
- a screenshot is not closure unless it is bound to the exact same authored run
  as the logs, readback, and witness rows;
- `@civ7/direct-control` is the required live-proof boundary.

### 6. Knobs must encode intent, not helper mechanics

The contract lane supports the direction already started in this stack:

- keep Hydrology truth-side density/classification separate from Civ projection
  density;
- delete or internalize `map-rivers` length-threshold surfaces;
- keep readback/debug as operational proof surfaces, not map personality knobs;
- route reusable Civ facts into `packages/civ7-map-policy`.

Strong rename direction from the note:

- `hydrology-hydrography.knobs.riverDensity` -> `riverNetworkDensity`
- `hydrology-hydrography.knobs.lakeiness` -> `lakeBasinDensity`
- `hydrology-hydrography.lakes` -> `terminalBasins`

This is design authority, not yet adopted source of truth.

## Execution Consequences

### Already strengthened by this branch stack

- shared `@civ7/map-policy` river-type values are the correct direction;
- Hydrology-owned canonical drainage routing is the correct direction;
- retired `map-rivers.knobs.riverDensity` is the correct direction;
- visible-proof closure must be stricter than a manual screenshot + green tests.

### Still open and now clearer

1. Minor-river product behavior is still open.
2. A categorical ban on `modelRivers(...)` is not yet justified as final
   product authority while no alternative minor-river writer is proven.
3. The proof rail still needs stronger same-run camera/readback/render binding.
4. Knob renames and truth-side terminology need a deliberate migration slice,
   not piecemeal drift.

## Immediate Dominoes

1. Keep Hydrology as the canonical drainage owner and continue narrowing any
   Morphology routing surface to proxy/helper meaning only.
2. Continue with the direct-control proof rail, but upgrade it around same-run
   witness-row identity and richer river/lake readback surfaces.
3. Re-open the runtime materialization question for minor rivers explicitly:
   either find a proven writer, or revisit the categorical `modelRivers(...)`
   ban as a product/interop decision.
4. Carry the Earth benchmark families into the acceptance and seed-matrix
   tests, instead of anchoring thresholds to current output.
5. Plan a dedicated terminology/contract slice for truth-side Hydrology renames
   (`riverNetworkDensity`, `lakeBasinDensity`, `terminalBasins`) only after the
   underlying behavior/proof surfaces are stable.

## Bottom Line

The second-wave adversarial pass did not overturn the current upstream
direction. It made it sharper:

- Hydrology truth must stay upstream and physically coherent.
- Navigable-river terrain stamping is real but partial.
- Minor-river Civ materialization remains the most dangerous unproven gap.
- Earthlike acceptance must be benchmark-family based.
- Closure must remain same-run, proof-class separated, and product-first.
