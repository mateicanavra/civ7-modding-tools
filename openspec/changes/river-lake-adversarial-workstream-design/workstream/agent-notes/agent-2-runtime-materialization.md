# Agent 2: Civ Runtime and Materialization Prosecutor

Date: 2026-06-09
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-mapgen-physical-rivers`
Branch: `codex/river-lake-adversarial-synthesis`
Role: adversarial runtime/materialization audit

## 1. Framed Objective

### Frame

The question is not "did MapGen generate rivers?" The question is "what exact
river surfaces does Civ receive, what exact river surfaces does Civ expose back
to us at runtime, and which of those surfaces are required for a player to
actually see rivers in-game?"

### Hard core

- `TERRAIN_NAVIGABLE_RIVER` terrain rows, Civ river metadata, Studio-visible
  overlays, and rendered in-game visibility are different proof classes.
- Major/navigable rivers and minor rivers do not currently share one proven
  authoring path.
- Terrain-row presence is not enough to claim runtime river success.

### Exterior

- Upstream hydrology correctness is not adjudicated here except where it changes
  runtime/materialization interpretation.
- Lake hydrology is only in scope where it helps separate proof classes.
- This note does not design new upstream routing code.

### Structural alternative considered and rejected

Rejected frame: "the whole river problem is upstream hydrology, so runtime is
just a downstream detail."

Why rejected: the current branch can directly stamp navigable-river terrain even
when runtime river metadata remains zero. That means a distinct runtime closure
lane exists and can fail independently of hydrology truth.

### Falsifier

This frame would need revision if either of these are proven:

1. A stable public per-tile Civ river metadata writer exists and is same-run
   proven.
2. Current direct-control already owns camera/screenshot/runtime-visible proof
   primitives and this audit simply missed them.

## 2. Active Goal

Active goal:
Determine the real Civ/runtime/materialization path for major/navigable and
minor rivers on this branch, falsify any overclaim that terrain rows mean
"rivers work," identify the exact unsupported boundary for minor-river
stamping, and define the proof gaps between terrain readback, metadata readback,
Studio visibility, and rendered in-game visibility.

## 3. Investigation Brief

### Type and posture

- Investigation type: doc-vs-code reconciliation + runtime code dive +
  read-only runtime probe
- Frame stability: committed
- Evidence standard: verified where possible, audit-grade for closure claims
- Search geometry: graph-tracing from `map-rivers` step -> adapter ->
  direct-control -> official Civ resources -> existing proof packets
- Rail coupling: rail-neutral first, then direct-control for one read-only
  runtime inventory probe
- Uncertainty posture: falsification

### Primary questions

1. Do we directly stamp rivers ourselves, or are we delegating to
   `TerrainBuilder.modelRivers(...)`?
2. What does the runtime expose as terrain truth versus river metadata truth?
3. Is there any proven minor-river writer?
4. What proof gaps remain between runtime readback and user-visible rivers?

### Secondary questions

1. Are Civ river type constants correctly shared through policy/catalog layers?
2. Does the adapter boundary describe unsupported minor-river stamping honestly?
3. Do current proofs and acceptance rows overclaim closure?

### Exclusions

- No code edits outside this note file.
- No disposable mutation probe of `TerrainBuilder.setRiverValidationValues()`
  in this pass.
- No product-level river acceptance claim.

### Evidence policy

- Official resources and installed-app-synced resources are authority for Civ
  runtime callsites and enum references.
- Branch source is authority for our current authoring path.
- Direct-control read-only probe is authority for current live runtime
  inventory/readback in this session.
- Existing OpenSpec acceptance rows are evidence of current repo claims, not
  authority by themselves.

### Stop conditions

- Stop once the runtime path, unsupported boundaries, and proof gaps are
  concretely evidenced.
- Reframe only if a proven per-tile metadata writer or camera/screenshot wrapper
  is discovered.

## 4. Notes / Evidence Log

### A. Current branch directly stamps navigable-river terrain itself

Evidence:

- `plotRivers` selects navigable terrain from Hydrology truth via
  `ops.selectNavigableRiverTerrain(...)`, not via engine river modeling:
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts:197-207`
- It then directly stamps `NAVIGABLE_RIVER_TERRAIN` tile-by-tile with
  `context.adapter.setTerrainType(...)`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts:297-301`
- After stamping it runs `validateAndFixTerrain()`, `defineNamedRivers()`,
  `recalculateAreas()`, and `storeWaterData()`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts:302-311`
- Superseded 2026-06-10 follow-up: the current branch now calls
  `adapter.modelRivers(...)` after Hydrology-selected terrain stamping as a
  bounded Civ-native metadata/model/cache materialization pass. That does not
  make Civ the truth owner; it replaces the terrain-only path that left
  `MapRivers` and `GameplayMap.getRiverType` empty.

Adversarial conclusion:

- On this branch, "we directly stamp rivers ourselves" is true for the
  navigable/major visible subset.
- Official Civ `TerrainBuilder.modelRivers(...)` is the current bounded
  materialization path after that authored stamp, not the current truth
  generator.

### B. Adapter boundary cleanly separates terrain readback from metadata readback

Evidence:

- Runtime adapter hydrology getters use `GameplayMap.getRiverType`,
  `GameplayMap.isRiver`, and `GameplayMap.isNavigableRiver`:
  `packages/civ7-adapter/src/civ7-adapter.ts:201-235`
- Runtime adapter `readRiverProjection(...)` separately computes:
  - `terrainNavigableRiverMask`
  - `engineRiverType`
  - `engineIsRiverMask`
  - `engineNavigableRiverMask`
  - `engineMinorRiverMask`
  - mismatch masks/counts
  from live runtime readback:
  `packages/civ7-adapter/src/civ7-adapter.ts:544-640`
- The type contract states the intended boundary explicitly: navigable terrain
  parity is testable now; minor-river materialization remains unsupported until
  a capability is discovered:
  `packages/civ7-adapter/src/types.ts:259-279`

Adversarial conclusion:

- The adapter is already modeling the right proof separation.
- Any closure claim that collapses terrain parity into metadata parity is
  contradicting the adapter contract.

### C. Direct-control readback can observe metadata, but it does not author it

Evidence:

- Direct-control full-grid hydrology reads request `riverType`, `river`,
  `navigableRiver`, `water`, and `lake`:
  `packages/civ7-direct-control/src/play/map/reads.ts:269-275`
- `probe-river-writer.ts` inventories runtime objects, summarizes terrain-vs-
  metadata counts, and treats `setRiverValidationValues` as unproven until a
  disposable mutation changes metadata:
  `scripts/civ7-direct-control/probe-river-writer.ts:1-82, 195-318, 336-390`

Observed read-only runtime probe run on 2026-06-09:

Command:

```sh
bun scripts/civ7-direct-control/probe-river-writer.ts --timeout-ms 15000 --read-full-grid
```

Observed output summary:

- `TerrainBuilder.setRiverValidationValues` exists as a native function.
- `MapRivers` exposes read/query methods (`getRiver`, `getRiverPlots`,
  `getRiverTypeByIndex`, `isRiverConnectedToOcean`) but no analogous writer.
- `RiverTypes` live runtime values are:
  - `NO_RIVER = -1`
  - `RIVER_MINOR = 0`
  - `RIVER_NAVIGABLE = 1`
- Full-grid pre-readback for the current live map:
  - `plotCount = 6996`
  - `terrainNavigableRiver = 69`
  - `river = 0`
  - `navigableRiver = 0`
  - `minorRiver = 0`
  - `noRiver = 6996`
  - `missingFacts = []`
  - `failedFacts = []`

Adversarial conclusion:

- We have fresh live-session proof that navigable-river terrain can exist while
  all Civ river metadata remains zero.
- That single fact is enough to break any claim that terrain rows imply
  "rivers work" in the full runtime sense.

### D. Official Civ resources confirm the engine/runtime split but do not prove a per-tile writer

Evidence:

- Official resource audit records that official map scripts call
  `TerrainBuilder.modelRivers(...)`, `TerrainBuilder.defineNamedRivers()`, and
  `TerrainBuilder.storeWaterData()`, while no official JS/XML callsite for
  `TerrainBuilder.setRiverValidationValues` was found:
  `openspec/changes/earthlike-visible-river-acceptance/workstream/resource-evidence.md:36-75`
- Official tooltip helper branches on `GameplayMap.getRiverType(...)` and
  `RiverTypes.RIVER_MINOR` / `RIVER_NAVIGABLE`:
  `.civ7/outputs/resources/Base/modules/base-standard/ui-next/tooltips/plot-tooltip/helpers.js:71-84`
- Official UI code demonstrates that camera APIs exist in the game (`Camera.lookAt(...)`),
  but that does not mean our direct-control layer exposes them yet:
  `.civ7/outputs/resources/Base/modules/base-standard/ui/root-game.js:285-289`

Adversarial conclusion:

- Civ definitely has river metadata concepts and a bulk river generation path.
- This audit found no official, branch-proven, public per-tile minor-river
  metadata authoring surface.

### E. Current parity tooling already separates proof classes correctly

Evidence:

- Local parity snapshot records:
  - planned minor river intent
  - planned major river intent
  - projected navigable terrain
  - terrain readback
  - river metadata readback
  - minor-river unsupported boundary
  in one packet:
  `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:655-677`
- Live parity reconstructs live river metadata from grid facts separately from
  terrain:
  `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:842-867`
- Proof labels explicitly keep `terrain-readback`, `metadata-readback`,
  `studio-visible`, `civ-rendered`, and `product-acceptance` distinct:
  `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:1248-1281`
- `terrain-readback` passes even when metadata diverges:
  `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:1286-1318`
- `metadata-readback` fails when terrain matches but metadata diverges:
  `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:1321-1360`
- River parity report explicitly encodes
  `terrain-match-metadata-divergent`:
  `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:1539-1678`

Adversarial conclusion:

- The tooling does not fundamentally confuse the proof classes anymore.
- The remaining risk is human/process overclaiming, not lack of proof labels.

### F. Existing acceptance records already admit the missing runtime closure

Evidence:

- Accepted technical river row says terrain readback passed while metadata
  diverged and product/visual review remains open:
  `openspec/changes/swooper-earthlike-product-acceptance-proof/workstream/acceptance-row-ledger.md:78`
- Accepted metadata row now treats the legacy live `river=0`,
  `navigableRiver=0`, `minorRiver=0` packet as obsolete terrain-only evidence
  and keeps current metadata parity open for same-run proof:
  `openspec/changes/swooper-earthlike-product-acceptance-proof/workstream/acceptance-row-ledger.md:79`

Adversarial conclusion:

- The repo already contains the evidence needed to reject "goal complete."
- Any earlier completion claim ignored its own acceptance ledger.

### G. Rendered-visibility proof tooling is still mostly scaffolding

Evidence:

- `river-runtime-visible-proof` still has runtime primitive tasks open:
  `openspec/changes/river-runtime-visible-proof/tasks.md:1-15`
- The verifier requires camera target, screenshot paths, and a visual verdict,
  but it does not itself drive camera movement or capture screenshots:
  `scripts/civ7-direct-control/verify-river-visible-proof.ts:102-112, 240-307`
- The tests validate proof-packet binding rules only; they use temp files and
  fake screenshot bytes, not a live Civ camera:
  `scripts/civ7-direct-control/verify-river-visible-proof.test.ts:13-133`
- The OpenSpec requirement explicitly says visible proof must center camera on
  sampled live river tiles and capture screenshot hashes plus camera/visibility
  state:
  `openspec/changes/river-runtime-visible-proof/specs/mapgen-normalization-workstreams/spec.md:5-17`

Adversarial conclusion:

- We do not yet have end-to-end rendered proof.
- The current verifier prevents fake proof packets, but it is not itself the
  live camera/screenshot runner.

## 5. Findings, Gaps, Risks, and Attacks on the Current Direction

### Findings

1. Major/navigable river materialization is currently MapGen-authored terrain
   stamping, not Civ bulk river generation.
2. Minor rivers are currently Hydrology intent plus runtime readback-only
   semantics. They are not presently stamped by a proven authoring path.
3. Live runtime can show many `TERRAIN_NAVIGABLE_RIVER` tiles while
   `GameplayMap` river metadata remains entirely zero.
4. Current proof tooling already knows this and encodes the split correctly.
5. Rendered visibility in actual Civ remains unproven on this branch.

### Gaps

1. No proven per-tile minor-river metadata writer.
2. No direct-control camera centering / screenshot capture proof path wired into
   `river-runtime-visible-proof`.
3. No same-run Studio-visible proof attached to the current visible-river lane.
4. No closure rule preventing a terrain-readback pass from being mistaken for
   full runtime success.

### Risks

1. Product risk: users can still report "I do not see rivers" even when terrain
   rows exist, because we have not proven rendered visibility.
2. Semantic risk: "river" may be used ambiguously to mean terrain, metadata, or
   rendered art.
3. Architecture risk: pressure to hide this gap by inventing downstream hacks or
   by collapsing proof classes.
4. Minor-river risk: if the product insists on visible Civ minor rivers, that is
   currently a blocked runtime-authoring capability, not a tuning problem.

### Attacks on the current direction

- Attack: "Terrain rows mean rivers work."
  - Rejected by fresh live read-only probe: `terrainNavigableRiver=69` while
    `river=0`, `navigableRiver=0`, `minorRiver=0`.
- Attack: "We might still be delegating rivers to Civ."
  - Rejected by branch source and guard test. The branch directly stamps
    `NAVIGABLE_RIVER_TERRAIN` and forbids `adapter.modelRivers(...)`.
- Attack: "Minor rivers are probably being stamped implicitly."
  - No supporting evidence found in branch source, official resource callsites,
    or fresh live runtime probe.
- Attack: "Visible proof already exists."
  - The current visible-proof script is a packet verifier, not a full live
    camera/screenshot runner.

## 6. Recommended Workstream Changes and Exact Proof Boundaries

### A. Keep the current owner split

- Hydrology owns river truth and major/minor classification.
- `map-rivers` owns selection of the Civ-visible navigable subset from Hydrology
  truth.
- Adapter/direct-control own runtime readback and runtime-visible proof.
- `@civ7/map-policy` owns river constants and cataloged Civ values only.

### B. Treat major/navigable and minor rivers as separate runtime problems

1. Major/navigable:
   - currently authorable as `TERRAIN_NAVIGABLE_RIVER`
   - terrain-readback can pass
   - metadata and rendered visibility remain separate proof steps
2. Minor:
   - currently unproven as a write path
   - remain explicit unsupported boundary until a writer is discovered and same-
     run proven

### C. Do not reopen downstream selector work to solve this

This audit found no evidence that the current visible gap is caused by
downstream selector ownership confusion. The unresolved runtime gaps are:

1. metadata authoring capability for minor rivers
2. rendered visibility proof for navigable rivers

Those are not fixed by more selector logic.

### D. Exact proof boundaries to enforce

1. `hydrology-truth`
   - proves routed network, class hierarchy, lakes, metrics
   - does not prove Civ materialization
2. `projection-plan`
   - proves selected navigable subset and no-signal typing
   - does not prove runtime stamping
3. `terrain-readback`
   - proves live `TERRAIN_NAVIGABLE_RIVER` rows
   - does not prove metadata or visibility
4. `metadata-readback`
   - proves live `GameplayMap` river metadata
   - does not prove visibility
5. `studio-visible`
   - proves same-run Studio layer/inspector coherence
   - does not prove rendered Civ presentation
6. `civ-rendered`
   - proves screenshot-bound visible rivers on sampled live tiles
   - does not by itself prove overall product acceptance
7. `product-acceptance`
   - requires reviewer-dispositioned same-run evidence across the chain above

### E. Immediate execution implications

1. `river-runtime-visible-proof` is the correct next runtime slice for major/
   navigable rivers.
2. That slice should inventory and wrap camera/screenshot/runtime state in
   `@civ7/direct-control` instead of hand-built caller scripts.
3. Minor-river closure must be one of:
   - discover and prove a runtime writer, then integrate it cleanly, or
   - explicitly downgrade the product expectation for Civ-rendered minor rivers.

## 7. Final Synthesis

The runtime/materialization path is now clear:

- We directly stamp the Civ-visible navigable subset ourselves as terrain.
- Civ runtime readback exposes terrain truth and river metadata truth as
  separate surfaces.
- Fresh live runtime evidence shows those surfaces can diverge completely.
- Minor-river authoring is still unproven.
- Rendered in-game visibility is still unproven.

So the correct adversarial position is:

1. do not reopen downstream selector invention,
2. do not claim minor rivers are stamped,
3. do not claim visible rivers from terrain rows alone,
4. drive the next runtime slice through direct-control camera/screenshot proof,
   while treating minor-river stamping as a separate capability investigation or
   product-contract decision.
